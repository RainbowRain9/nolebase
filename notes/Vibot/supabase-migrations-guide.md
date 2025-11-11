# Supabase Migrations 管理指南

## 概述

Supabase的migrations文件用于管理数据库schema的版本控制。所有migrations文件都应该存储在 `supabase/migrations/` 目录下，文件名格式为 `{timestamp}_{description}.sql`。

## 当前项目状态

### 已存在的migrations文件

1. **20251103090000_supabase_auth_setup.sql** - 初始数据库结构设置
   - 创建核心表结构（companies, users, roles, permissions等）
   - 设置Row Level Security (RLS)策略
   - 初始化基础数据和默认管理员账户

2. **20251104021500_fix_auth_schema.sql** - 修复认证Schema问题
   - 修复auth.users表中NULL字段导致的登录错误
   - 确保管理员用户正确创建和配置
   - 解决"converting NULL to string is unsupported"错误

## Supabase CLI 迁移管理

### 1. 安装Supabase CLI

```bash
npm install -g supabase
# 或使用Homebrew (macOS)
brew install supabase/tap/supabase
```

### 2. 登录Supabase

```bash
supabase login
```

### 3. 链接到远程项目

```bash
# 在项目根目录执行
supabase link --project-ref cushucewizjupretaixt
```

### 4. 创建新migration

```bash
# 生成新的migration文件
supabase migration new {migration_name}

# 例如
supabase migration new add_new_table
```

这会在 `supabase/migrations/` 下创建一个新的SQL文件。

### 5. 应用migrations到本地/远程

```bash
# 应用所有pending的migrations到本地数据库
supabase db reset

# 应用migrations到linked的远程项目
supabase db push

# 查看migrations状态
supabase migration list
```

### 6. 从远程项目拉取migrations

如果其他开发者已经推送了新的migrations到远程项目：

```bash
# 拉取远程migrations到本地
supabase db pull

# 或者直接应用远程的migrations
supabase db reset --linked
```

### 7. 生成migration diff

比较本地schema和远程schema的差异：

```bash
# 生成diff migration
supabase migration diff --schema public > supabase/migrations/{timestamp}_{name}.sql
```

## 迁移最佳实践

### ✅ 推荐做法

1. **幂等性** - 所有migration都应该设计为可重复执行
   ```sql
   CREATE TABLE IF NOT EXISTS table_name (...);
   INSERT INTO ... ON CONFLICT DO NOTHING;
   ALTER TABLE ... IF EXISTS ...;
   ```

2. **事务性** - 复杂操作使用事务
   ```sql
   BEGIN;
   -- 操作1
   -- 操作2
   COMMIT;
   ```

3. **回滚计划** - 重大变更考虑回滚脚本
   ```sql
   -- 前向迁移
   ALTER TABLE users ADD COLUMN new_field text;

   -- 回滚迁移（单独文件或注释）
   -- ALTER TABLE users DROP COLUMN new_field;
   ```

4. **测试** - 在开发环境充分测试
   ```bash
   # 本地测试
   supabase db reset
   # 验证数据完整性
   ```

5. **文档化** - 注释说明迁移目的
   ```sql
   -- 添加用户头像字段
   -- 修复：https://github.com/issues/123
   -- 关联PR：#456
   ALTER TABLE users ADD COLUMN avatar_url text;
   ```

### ❌ 避免做法

1. 直接修改远程数据库而不记录migration
2. 手动插入敏感数据到migration
3. 删除或重命名已应用的migration文件
4. 在migration中使用不稳定的时间戳函数

## 项目中的迁移管理

### 本地开发流程

```bash
# 1. 拉取最新的migrations
supabase db pull

# 2. 重置本地数据库
supabase db reset

# 3. 创建新功能
supabase migration new feature_name

# 4. 编辑migration文件
# ... 编写SQL ...

# 5. 测试migration
supabase db reset

# 6. 提交代码和migration
git add supabase/migrations/
git commit -m "feat: 添加新功能"

# 7. 推送到远程（如果需要）
supabase db push
```

### CI/CD集成

```yaml
# .github/workflows/deploy.yml
name: Deploy Migrations
on:
  push:
    branches: [main]
jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: supabase/setup-cli@v1
        with:
          version: latest
      - run: supabase link --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
      - run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

## 常见问题

### Q: 如何处理大型数据迁移？

A: 对于大数据量，使用分批处理：
```sql
-- 示例：分批更新1000条记录
DO $$
DECLARE
  batch_size integer := 1000;
  processed integer := 0;
BEGIN
  LOOP
    WITH batch AS (
      SELECT id FROM users
      WHERE processed = 0
      LIMIT batch_size
    )
    UPDATE users u
    SET updated_at = now()
    FROM batch b
    WHERE u.id = b.id;

    GET DIAGNOSTICS processed = ROW_COUNT;
    IF processed < batch_size THEN
      EXIT;
    END IF;
  END LOOP;
END $$;
```

### Q: 如何处理跨环境的配置差异？

A: 使用环境特定的seeding：
```sql
-- development数据
INSERT INTO app_settings (key, value) VALUES ('debug', 'true');

-- 生产环境跳过
-- 在部署时使用环境变量控制
```

### Q: 迁移失败怎么办？

A:
1. 检查错误日志：`supabase logs`
2. 查看迁移状态：`supabase migration list`
3. 如果是本地，尝试重置：`supabase db reset`
4. 如果是远程，回滚或创建新的修复migration

## 相关文件

- `supabase/config.toml` - Supabase项目配置
- `supabase/.env` - 环境变量（不提交到git）
- `supabase/seed.sql` - 测试数据种子文件

## 参考资料

- [Supabase Migrations 官方文档](https://supabase.com/docs/guides/database/migrations)
- [Supabase CLI 文档](https://supabase.com/docs/reference/cli)
- [PostgreSQL 事务文档](https://www.postgresql.org/docs/current/tutorial-transactions.html)
