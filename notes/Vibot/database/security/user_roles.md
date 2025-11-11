# public.user_roles（用户角色关联）

> 用户在公司范围及资源范围内获得的角色。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录标识 |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 用户 |
| role_id | uuid | NOT NULL REFERENCES roles(id) ON DELETE CASCADE | 角色 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| scope_resource_type | varchar(50) | NULL | 作用域资源类型 |
| scope_resource_id | uuid | NULL | 作用域资源ID |
| assigned_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 分配时间 |
| assigned_by | uuid | NULL REFERENCES users(id) | 分配人 |

## 设计权衡
**设计权衡**：复合主键消除重复授权，但 scope 字段的可空性增加 SQL 复杂度。

## 外键与引用完整性
- user_id → users(id) ON DELETE CASCADE
- role_id → roles(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE
- assigned_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_user_roles_company_id ON public.user_roles(company_id);

## Row Level Security
```sql
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User roles readable within company"
    ON public.user_roles
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
        OR user_id = auth.uid()
      )
    );

CREATE POLICY "User roles managed by admins"
    ON public.user_roles
    FOR ALL
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    )
    WITH CHECK (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:user_roles` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `user_roles` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录标识,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE -- 用户,
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE -- 角色,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    scope_resource_type varchar(50) NULL -- 作用域资源类型,
    scope_resource_id uuid NULL -- 作用域资源ID,
    assigned_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 分配时间,
    assigned_by uuid NULL REFERENCES users(id) -- 分配人
);
COMMENT ON TABLE public.user_roles IS '用户在公司范围及资源范围内获得的角色。';
COMMENT ON COLUMN public.user_roles.id IS '记录标识';
COMMENT ON COLUMN public.user_roles.user_id IS '用户';
COMMENT ON COLUMN public.user_roles.role_id IS '角色';
COMMENT ON COLUMN public.user_roles.company_id IS '所属公司';
COMMENT ON COLUMN public.user_roles.scope_resource_type IS '作用域资源类型';
COMMENT ON COLUMN public.user_roles.scope_resource_id IS '作用域资源ID';
COMMENT ON COLUMN public.user_roles.assigned_at IS '分配时间';
COMMENT ON COLUMN public.user_roles.assigned_by IS '分配人';
```
