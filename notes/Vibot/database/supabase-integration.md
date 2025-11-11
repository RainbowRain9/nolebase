
# Supabase 集成配置

## Storage
- 为每个租户创建 `attachments`、`knowledge` 等桶，使用 `storage.objects` RLS，策略示例参考 Supabase 官方 Storage Access Control。
- 约定对象路径 `company_id/<category>/<uuid>`，并校验 `storage.foldername(name)[1]` 与 `current_company_id()` 匹配。

## Edge Functions
- 审批、连接器、诊断等 Edge Functions 需使用 `service_role` key，并在 SQL 内调用 `current_company_id()` 与 `has_role()`。
- 为重度任务（同步/调度）实现幂等与审计，写入 `sync_run_logs`、`audit_events`。

## Realtime
- 对项目、审批、财务等关键表开启 Realtime。频道命名 `public:<table>`，并在客户端订阅前执行 `supabase.realtime.setAuth()` 以确保 JWT 含 `company_id`。

## Migrations
- 通过 `supabase db diff` 生成迁移，所有 DDL/RLS 以 SQL 文件维护，禁止 dashboard 手工改动。
- 运行 `pnpm supabase db reset` 可重建本地数据库后执行 `docs/database/init.sql` 进行初始化。
