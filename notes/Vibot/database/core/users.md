# public.users（用户）

> 平台用户及其登录、偏好信息。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 用户唯一标识 |
| auth_user_id | uuid | NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE | Supabase Auth 用户 ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| department_id | uuid | NULL REFERENCES departments(id) | 所属部门 |
| email | varchar(255) | NOT NULL UNIQUE | 登录邮箱 |
| display_name | varchar(150) | NOT NULL | 显示名称 |
| phone | varchar(30) | NULL | 手机号 |
| password_hash | varchar(255) | NOT NULL | 密码哈希 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','locked')) | 用户状态 |
| auth_provider | varchar(50) | NOT NULL DEFAULT 'password' | 认证来源 |
| locale | varchar(10) | NOT NULL DEFAULT 'zh-CN' | 语言偏好 |
| timezone | varchar(50) | NULL | 时区 |
| last_login_at | timestamptz | NULL | 最近登录时间 |
| profile | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展档案 |
| settings | jsonb | NOT NULL DEFAULT '{}'::jsonb | 个性化设置 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：扩展属性集中到 profile/settings，减少列扩散，但 JSON 索引维护成本更高；通过 `auth_user_id` 与 Supabase Auth 解耦，便于 SSO 与多因子策略统一管理。

## 外键与引用完整性
- auth_user_id → auth.users(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE
- department_id → departments(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
- UNIQUE 约束：列 auth_user_id 已在表定义中声明唯一性。
- UNIQUE 约束：列 email 已在表定义中声明唯一性。

## Row Level Security
```sql
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users readable within company"
    ON public.users
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
        OR id = auth.uid()
      )
    );

CREATE POLICY "Users insertable by admins"
    ON public.users
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );

CREATE POLICY "Users updatable by admins"
    ON public.users
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR id = auth.uid()
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR id = auth.uid()
      )
    );

CREATE POLICY "Users deletable by admins"
    ON public.users
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:users` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `users` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 用户唯一标识,
    auth_user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE -- Supabase Auth 用户 ID,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    department_id uuid NULL REFERENCES departments(id) -- 所属部门,
    email varchar(255) NOT NULL UNIQUE -- 登录邮箱,
    display_name varchar(150) NOT NULL -- 显示名称,
    phone varchar(30) NULL -- 手机号,
    password_hash varchar(255) NOT NULL -- 密码哈希,
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','locked')) -- 用户状态,
    auth_provider varchar(50) NOT NULL DEFAULT 'password' -- 认证来源,
    locale varchar(10) NOT NULL DEFAULT 'zh-CN' -- 语言偏好,
    timezone varchar(50) NULL -- 时区,
    last_login_at timestamptz NULL -- 最近登录时间,
    profile jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展档案,
    settings jsonb NOT NULL DEFAULT '{}'::jsonb -- 个性化设置,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.users IS '平台用户及其登录、偏好信息。';
COMMENT ON COLUMN public.users.id IS '用户唯一标识';
COMMENT ON COLUMN public.users.auth_user_id IS 'Supabase Auth 用户 ID';
COMMENT ON COLUMN public.users.company_id IS '所属公司';
COMMENT ON COLUMN public.users.department_id IS '所属部门';
COMMENT ON COLUMN public.users.email IS '登录邮箱';
COMMENT ON COLUMN public.users.display_name IS '显示名称';
COMMENT ON COLUMN public.users.phone IS '手机号';
COMMENT ON COLUMN public.users.password_hash IS '密码哈希';
COMMENT ON COLUMN public.users.status IS '用户状态';
COMMENT ON COLUMN public.users.auth_provider IS '认证来源';
COMMENT ON COLUMN public.users.locale IS '语言偏好';
COMMENT ON COLUMN public.users.timezone IS '时区';
COMMENT ON COLUMN public.users.last_login_at IS '最近登录时间';
COMMENT ON COLUMN public.users.profile IS '扩展档案';
COMMENT ON COLUMN public.users.settings IS '个性化设置';
COMMENT ON COLUMN public.users.created_at IS '创建时间';
COMMENT ON COLUMN public.users.updated_at IS '更新时间';
```
