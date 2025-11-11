# Vibot 审批系统从 MVP 到完善的演进计划

> 参考文档：`docs/prd.md`（Epic 5 与相关域）、`docs/architecture.md`（Supabase + Vue 架构）、`docs/database-schema.md` & `docs/database/approvals/*.md`（完整数据模型）、`docs/database/core/*.md`（用户/RBAC）。本文定义 MVP 之后的四阶段路线，使自动化开发代理可据此查阅相关文件并实施。

## 阶段总览
| 阶段 | 目标 | 关键交付 | 相关目录 |
| --- | --- | --- | --- |
| Phase 1 模板化 | 支持多类型审批、配置化流程 | form/approval 模板 & 流程规则 | `docs/database/approvals/form_templates.md`、`approval_templates.md`、`approval_workflow_rules.md` |
| Phase 2 通知/SLA | 自动提醒、钉钉/邮件、SLA 升级 | `notifications` + Edge Functions + 钉钉集成 | `docs/database/approvals/notifications.md`、`notification_channels.md`、`supabase/functions/*` |
| Phase 3 多租户运营 | 三家公司上线、超级视图、公司切换 | token company 切换、跨租户报表 | `docs/architecture.md` 多租户章节、`docs/prd.md` 平台目标 |
| Phase 4 自动化/分析 | 批量审批、BI、目标联动 | Flow 自动决策、审批 KPI 报表 | `docs/prd.md` Epic 5/8、`docs/database/goals/*.md` |

---
## Phase 1：模板化 & 流程配置
**目标**：引入表单模板、审批模板与流程规则，满足 `docs/prd.md` Epic 5 Story 5.3 的“可视化配置”。

### 工作项
1. **表单/模板体系**
   - 启用 `form_templates`、`form_template_revisions`、`form_instances`（见 `docs/database/approvals/form_templates.md`）。
   - 实现模板管理 UI：`apps/web-antd/src/views/approvals/templates`（新建）显示 JSON Schema/UISchema。
2. **审批模板**
   - `approval_templates`（参考 `docs/database/approvals/approval_templates.md`）联动默认流程/表单/通知配置。
   - 新建 Edge Function `create-request-from-template`，根据模板填充 `approval_requests + form_instances`。
3. **流程规则与审批人配置**
   - `approval_workflow_rules`, `approval_approvers` UI 与 API；在 `apps/web-antd/src/views/approvals/designer` 提供节点配置。
   - 扩展提交函数：根据流程规则生成多级 `approval_request_assignments`。
4. **文档与迁移**
   - 更新 `docs/implementation-guide.md` “模板化阶段”章节。
   - `supabase db diff -f phase1-templates`。

---
## Phase 2：通知、SLA 与钉钉
**目标**：满足 `docs/prd.md` Epic 5 + Epic 9（数据与集成）对提醒/外部集成的要求。

### 工作项
1. **SLA 配置与触发器**
   - 按 `docs/database/approvals/approval_sla_rules.md` 完成 CRUD 与 UI；完善 `apply_assignment_sla()` 逻辑、记录提醒偏移。
2. **通知系统**
   - 启用 `notification_channels` / `notifications`（参考对应 docs）；实现后台 Job 轮询通知状态。
   - Edge Functions：`send-notification`（站内/邮件）、`dingtalk-webhook`（钉钉）；记录结果到 `notifications`。
3. **前端**
   - `apps/web-antd/src/views/approvals/inbox` 展示通知 & 提醒，普通用户可查看状态。
4. **监控**
   - 在 `docs/architecture.md` SRE 部分添加通知/告警流程；Grafana/Supabase Insights 看通知失败率。

---
## Phase 3：多租户运营与公司切换
**目标**：实现 `docs/prd.md` 总体目标中提到的“三家公司统一管理”，并提供超级管理视图。

### 工作项
1. **公司切换 UX**
   - 登录后读取 `auth.jwt().company_id` 与 `user_profiles`，在 `apps/web-antd/src/views/_core/layout` 增加公司选择器；重新获取 token。
2. **超级老板视图**
   - Edge Function `multi-tenant-report` 使用 service role 聚合不同 `company_id` 数据，写详细审计日志。
   - 前端 `apps/web-antd/src/views/approvals/overview` 可切换“全部公司/单公司”。
3. **权限申请与审计**
   - `permission_change_requests` + `audit_logs`（参考 `docs/database/security`）落地流程，支撑 RBAC 变更记录。
4. **文档**
   - `docs/implementation-guide.md` 更新“多租户运营”章节；在 `docs/database/supabase-integration.md` 描述 token 重签与 Edge Function 策略。

---
## Phase 4：自动化 & 分析
**目标**：对应 `docs/prd.md` Epic 8（目标与 BI）和 Epic 5 后续 story，实现批量审批/智能建议/BI。

### 工作项
1. **自动化规则**
   - 扩展 `approval_workflow_rules` 支持 `auto_decision` 类型（如金额 < X 自动通过），记录结果于 `approval_actions`。
2. **批量操作与 API**
   - Edge Function `bulk-approval`（admin 可对多条记录操作）；确保审计与 RLS 合规。
3. **BI 与目标联动**
   - 构建 `approval_metrics` 视图（或 materialized view），供 `apps/web-antd/src/views/goals-bi` 使用。
   - 与 `docs/database/goals/*.md` 中 `goal_sets`、`goal_milestones` 联动，用于 KPI。
4. **性能/监控**
   - 引入缓存（Edge Functions + Redis/HTTP Cache）与 `pgaudit` 细粒度策略。

---
## 实施节奏与依赖
1. 每阶段前先更新 `docs/database-schema.md`，运行 `scripts/generate_db_docs.py`，确保文档→DDL→实现一致。
2. 每阶段都需：
   - 迁移脚本 `supabase/schemas/*.sql`；
   - Edge Functions（位于 `supabase/functions/*`）与相应单元测试；
   - 前端页面调整（`apps/web-antd/src/views/approvals`, `apps/web-antd/src/views/requests`, `_core` 等）。
3. 任何新通知/集成都要在 `docs/database/supabase-integration.md` 记录配置步骤，让自动化代理能够查阅。

---
## 输出文档 & 验收
- 每阶段完成后更新：`docs/implementation-guide.md`、`docs/plan/post-mvp-roadmap.md`（本文件）、`docs/database/supabase-integration.md`、相关 API/前端 README。
- 验收标准：引用 `docs/prd.md` 对应 Epic 的验收要点（Given/When/Then），并记录在 `apps/web-antd/README` 或 QA 文档。
