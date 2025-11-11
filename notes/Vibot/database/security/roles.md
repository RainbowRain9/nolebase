# public.roles（角色）

> 公司内可分配的角色定义。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 角色唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 角色编码 |
| name | varchar(100) | NOT NULL | 角色名称 |
| description | text | NULL | 角色说明 |
| scope | varchar(30) | NOT NULL DEFAULT 'global' | 作用域 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：保留 scope 字段满足项目级授权，但需业务约束防止过度碎片化。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_roles_company_id ON public.roles(company_id);

## Row Level Security
```sql
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles readable within company"
    ON public.roles
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Roles manageable by admins"
    ON public.roles
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
- 启用 Realtime 频道 `public:roles` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `roles` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 角色唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    code varchar(50) NOT NULL -- 角色编码,
    name varchar(100) NOT NULL -- 角色名称,
    description text NULL -- 角色说明,
    scope varchar(30) NOT NULL DEFAULT 'global' -- 作用域,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.roles IS '公司内可分配的角色定义。';
COMMENT ON COLUMN public.roles.id IS '角色唯一标识';
COMMENT ON COLUMN public.roles.company_id IS '所属公司';
COMMENT ON COLUMN public.roles.code IS '角色编码';
COMMENT ON COLUMN public.roles.name IS '角色名称';
COMMENT ON COLUMN public.roles.description IS '角色说明';
COMMENT ON COLUMN public.roles.scope IS '作用域';
COMMENT ON COLUMN public.roles.created_at IS '创建时间';
COMMENT ON COLUMN public.roles.updated_at IS '更新时间';
```
