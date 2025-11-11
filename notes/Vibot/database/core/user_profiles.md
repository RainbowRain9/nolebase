# public.user_profiles（用户扩展档案）

> 与 `auth.users` 关联的扩展信息，存储头像、签名、偏好与安全设置。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| user_id | uuid | NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE | 对应用户 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| title | varchar(150) | NULL | 职务/头衔 |
| avatar_url | text | NULL | 头像地址 |
| timezone | varchar(50) | NULL | 时区偏好 |
| locale | varchar(10) | NULL | 语言偏好 |
| contact | jsonb | NOT NULL DEFAULT '{}'::jsonb | 联系方式（IM、电话） |
| preferences | jsonb | NOT NULL DEFAULT '{}'::jsonb | 通知与快捷设置 |
| security_metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 安全标记（MFA、设备） |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：独立表承载个性化与安全字段，避免 `users` 过于膨胀，同时可按公司隔离并与审计联动。

## 外键与引用完整性
- user_id → users(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_user_profiles_company_id ON public.user_profiles(company_id);
- UNIQUE 约束：列 user_id 已在表定义中声明唯一性。

## Row Level Security
```sql
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles readable by owner"
    ON public.user_profiles
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        user_id = auth.uid()
        OR has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
      )
    );

CREATE POLICY "Profiles updatable by owner"
    ON public.user_profiles
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        user_id = auth.uid()
        OR has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        user_id = auth.uid()
        OR has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:user_profiles` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `user_profiles` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录唯一标识,
    user_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE -- 对应用户,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    title varchar(150) NULL -- 职务/头衔,
    avatar_url text NULL -- 头像地址,
    timezone varchar(50) NULL -- 时区偏好,
    locale varchar(10) NULL -- 语言偏好,
    contact jsonb NOT NULL DEFAULT '{}'::jsonb -- 联系方式（IM、电话）,
    preferences jsonb NOT NULL DEFAULT '{}'::jsonb -- 通知与快捷设置,
    security_metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 安全标记（MFA、设备）,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.user_profiles IS '与 \`auth.users\` 关联的扩展信息，存储头像、签名、偏好与安全设置。';
COMMENT ON COLUMN public.user_profiles.id IS '记录唯一标识';
COMMENT ON COLUMN public.user_profiles.user_id IS '对应用户';
COMMENT ON COLUMN public.user_profiles.company_id IS '所属公司';
COMMENT ON COLUMN public.user_profiles.title IS '职务/头衔';
COMMENT ON COLUMN public.user_profiles.avatar_url IS '头像地址';
COMMENT ON COLUMN public.user_profiles.timezone IS '时区偏好';
COMMENT ON COLUMN public.user_profiles.locale IS '语言偏好';
COMMENT ON COLUMN public.user_profiles.contact IS '联系方式（IM、电话）';
COMMENT ON COLUMN public.user_profiles.preferences IS '通知与快捷设置';
COMMENT ON COLUMN public.user_profiles.security_metadata IS '安全标记（MFA、设备）';
COMMENT ON COLUMN public.user_profiles.updated_at IS '更新时间';
```
