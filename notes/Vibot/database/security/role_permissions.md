# public.role_permissions（角色权限关联）

> 角色与权限的绑定关系。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| role_id | uuid | NOT NULL REFERENCES roles(id) ON DELETE CASCADE | 角色 |
| permission_id | uuid | NOT NULL REFERENCES permissions(id) ON DELETE CASCADE | 权限 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| granted_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 授权时间 |
| granted_by | uuid | NULL REFERENCES users(id) | 授权人 |

## 设计权衡
**设计权衡**：维持传统多对多表结构，查询直接但删除角色或权限需谨慎使用级联。

## 外键与引用完整性
- role_id → roles(id) ON DELETE CASCADE
- permission_id → permissions(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE
- granted_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_role_permissions_company_id ON public.role_permissions(company_id);

## Row Level Security
```sql
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Role permissions readable within company"
    ON public.role_permissions
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
      )
    );

CREATE POLICY "Role permissions managed by admins"
    ON public.role_permissions
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
- 启用 Realtime 频道 `public:role_permissions` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `role_permissions` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE -- 角色,
    permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE -- 权限,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    granted_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 授权时间,
    granted_by uuid NULL REFERENCES users(id) -- 授权人
);
COMMENT ON TABLE public.role_permissions IS '角色与权限的绑定关系。';
COMMENT ON COLUMN public.role_permissions.role_id IS '角色';
COMMENT ON COLUMN public.role_permissions.permission_id IS '权限';
COMMENT ON COLUMN public.role_permissions.company_id IS '所属公司';
COMMENT ON COLUMN public.role_permissions.granted_at IS '授权时间';
COMMENT ON COLUMN public.role_permissions.granted_by IS '授权人';
```
