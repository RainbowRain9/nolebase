
# 数据库文档使用指南

## 生成文档
1. 确保 `docs/database-schema.md` 最新。
2. 运行 `python3 scripts/generate_db_docs.py`。
3. 本脚本会重新生成 `docs/database/` 下所有 Markdown、`init.sql`、`README.md`、`USAGE.md` 与 `supabase-integration.md`。

## 初始化数据库
```bash
pnpm supabase db reset
psql "$DATABASE_URL" -f docs/database/init.sql
```

该脚本会自动启用 `pgcrypto/ltree/vector` 扩展，并创建 `current_company_id`/`has_role`/`is_project_member` 三个安全函数。

## 常见工作流
| 操作 | 步骤 |
| --- | --- |
| 新增/修改表 | 更新 `docs/database-schema.md` → 运行脚本 → 使用 `supabase db diff` 生成迁移 |
| 更新 RLS | 修改 schema 文档中的策略 SQL → 重新生成 → 推送迁移 |
| 查看单表说明 | 打开 `docs/database/<domain>/<table>.md` |
| 大规模回滚 | 使用 `init.sql` + `supabase db reset`

## 注意事项
- 所有表必须包含 `company_id`（或在文档中说明为何全局）。
- 不得跳过 RLS；若 schema 文档缺少策略，会在 Markdown 中提醒。
- Edge Functions/Storage/Realtime 的配置请参考 `supabase-integration.md`。
- 运行脚本前建议提交当前更改，避免误删手工文件。
