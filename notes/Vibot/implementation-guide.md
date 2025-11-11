# Vibot 企业级审批流程系统实施指南

> 本指南与 `docs/database-schema.md`、`docs/database/` 以及 `supabase/schemas/*.sql` 同步维护，描述如何在 Supabase 上部署可扩展、多租户、安全可审计的审批系统。

## 系统概述

Vibot 审批系统由 Supabase Database + Auth + Storage + Realtime + Edge Functions 组成，提供：
- **多租户隔离**：所有业务表含 `company_id` 并由 `current_company_id()`、`has_role()`、`is_project_member()` 等函数配合 RLS 强制隔离。
- **可扩展 RBAC**：`users`、`user_profiles`、`permissions`、`roles`、`user_roles`、`role_permissions` 组成 RBAC/ABAC 混合模型，绑定 Supabase Auth (`auth.users`).
- **审批流程内核**：流程（`approval_workflows`）+ 版本（`approval_workflow_revisions`）+ 规则（`approval_workflow_rules`）+ 审批人配置（`approval_approvers`）+ SLA（`approval_sla_rules`）+ 模板（`approval_templates`）实现可插拔审批逻辑。
- **通知与超时**：`notifications` + `notification_channels` + `approval_request_assignments` 联合触发器 `apply_assignment_sla()` 自动生成提醒/升级记录，Edge Functions 负责邮件/钉钉。
- **审计追踪**：`approval_actions`、`audit_logs`、`log_audit_event()`、`audit_approval_action()` 记录所有关键操作，满足法规与合规要求。

## 技术架构

```
┌────────────────────────────────────────────────┐
│                  Supabase 平台                 │
├────────────────────────────────────────────────┤
│ PostgreSQL + RLS + pgcrypto + ltree + vector   │
│  ├── Auth：auth.users + public.users + user_profiles
│  ├── RBAC：permissions / roles / role_permissions / user_roles
│  ├── 审批：approval_workflows / revisions / rules / approvers / sla_rules
│  ├── 实例：approval_requests / approval_request_assignments / form_instances
│  ├── 辅助：notifications / notification_channels / approval_actions /
│  │        approval_delegations / audit_logs / approval_templates
│  └── 通用：companies / departments / projects / orders / etc.
├────────────────────────────────────────────────┤
│ Edge Functions (Deno)                          │
│  ├── submit-approval    ├── process-approval   │
│  ├── send-notification  ├── dingtalk-webhook   │
│  └── SLA/批处理任务 (Scheduler)                │
├────────────────────────────────────────────────┤
│ Storage + Realtime + Triggers + pgAudit        │
└────────────────────────────────────────────────┘
```

## 数据库设计速览

| 范畴 | 关键表 | 说明 |
| --- | --- | --- |
| 认证 & 档案 | `users`、`user_profiles` | `users.auth_user_id` 关联 `auth.users.id`；`user_profiles` 存储头像/偏好/安全元数据。|
| RBAC | `permissions`、`roles`、`role_permissions`、`user_roles` | 支持公司级与资源级授权（`scope_resource_type/id`）。|
| 审批流程 | `approval_workflows`、`approval_workflow_revisions`、`approval_workflow_rules`、`approval_approvers`、`approval_sla_rules` | 规则描述 JSON，避免硬编码审批人或条件，SLA 可独立扩展。|
| 审批实例 | `form_templates`、`form_instances`、`approval_templates`、`approval_requests`、`approval_request_assignments`、`approval_actions`、`approval_delegations` | 模板 + 实例 + 待办 + 动作 + 委派全链路管理。|
| 通知 & 审计 | `notification_channels`、`notifications`、`audit_logs` | 统一通知投递/状态/重试；`audit_logs` 记录所有审批动作、Edge 函数行为。|

详细字段/约束/索引/DDL 请参阅 `docs/database-schema.md` 与 `docs/database/<domain>/<table>.md`（由 `scripts/generate_db_docs.py` 生成）。

## RLS 策略与辅助函数

```sql
CREATE OR REPLACE FUNCTION public.current_company_id() RETURNS uuid ...;
CREATE OR REPLACE FUNCTION public.has_role(role_key text) RETURNS boolean ...;
CREATE OR REPLACE FUNCTION public.is_project_member(...) RETURNS boolean ...;
```

- 所有业务表 `ENABLE ROW LEVEL SECURITY`。
- 查询策略：`company_id = current_company_id()` 且角色满足 `has_role()` 或资源拥有者判定。
- 写策略：除平台管理员 (`Vibot.admin`) 外，通常限定在发起人/审批人/项目成员。
- 具体策略集中在 `supabase/schemas/rls.sql`。

## 触发器与自动化

| 函数 | 说明 | 触发器 |
| --- | --- | --- |
| `apply_assignment_sla()` | 计算 SLA、生成 `due_at`、自动写 `notifications` | `trg_apply_assignment_sla`（`approval_request_assignments` BEFORE INSERT） |
| `audit_approval_action()` | 将审批动作写入 `audit_logs` | `trg_audit_approval_action`（`approval_actions` AFTER INSERT） |
| `log_audit_event` / `enqueue_notification` | Edge Functions 可复用的审计/通知接口 | 由函数调用 |

全部定义见 `supabase/schemas/functions.sql` 与 `supabase/schemas/triggers.sql`。

## 实施步骤

1. **拉取最新 schema 文档**：确认 `docs/database-schema.md`、`docs/database/` 与 `supabase/schemas/` 已同步。
2. **生成/复核文档**：运行 `python3 scripts/generate_db_docs.py` 生成 per-table 文档与 `docs/database/init.sql`。
3. **初始化数据库**：
   ```bash
   pnpm supabase db reset
   psql "$DATABASE_URL" -f docs/database/init.sql
   psql "$DATABASE_URL" -f supabase/schemas/auth.sql
   psql "$DATABASE_URL" -f supabase/schemas/approval.sql
   psql "$DATABASE_URL" -f supabase/schemas/functions.sql
   psql "$DATABASE_URL" -f supabase/schemas/triggers.sql
   psql "$DATABASE_URL" -f supabase/schemas/rls.sql
   psql "$DATABASE_URL" -f supabase/schemas/seeds.sql
   ```
4. **配置 Edge Functions / Storage / Realtime**（参考 `docs/database/supabase-integration.md`）：
   - Storage：按租户创建桶，设置 `storage.objects` RLS，路径 `company_id/<category>/<uuid>`。
   - Realtime：订阅 `public:approval_requests`、`public:approval_request_assignments`、`public:notifications` 等频道。
   - Edge Functions：实现 `submit-approval`、`process-approval`、`send-notification` 等函数，统一调用 `current_company_id()` + `has_role()`。
5. **运行 `supabase db diff`**：生成迁移文件加入版本控制。
6. **测试**：
   - 多租户隔离：不同 `company_id` 用户不得互访。
   - RBAC：校验角色/权限/Scope。
   - 审批流程：创建模板→发起→分配→动作→委派→SLA 超时→通知。
   - 审计：确认 `audit_logs` 写入完整 trace。

## 运维建议

- 使用 `supabase db diff` + `supabase db push` 管理迁移，禁止 Dashboard 手改 schema。
- 定期审计 `user_roles`、`role_permissions` 与 `permission_change_requests`（若启用自动最小授权建议）。
- 监控 `notifications` 投递状态与 Edge Functions 日志，必要时重试或告警。
- 启用 `pgaudit`、Supabase Insights、Grafana/Sentry 观测性能与安全事件。
- 需要扩展审批域时，先更新 `docs/database-schema.md` → 运行生成脚本 → 编写 SQL → 发布迁移，保持文档、DDL、实现一致。
