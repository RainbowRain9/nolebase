# public.permissions（权限）

> 平台支持的操作权限清单。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 权限唯一标识 |
| code | varchar(100) | NOT NULL UNIQUE | 权限编码 |
| description | text | NOT NULL | 权限说明 |
| category | varchar(50) | NOT NULL | 权限分类 |
| is_system | boolean | NOT NULL DEFAULT true | 是否系统内置 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：权限保持全局表，避免多租户重复定义，但自定义权限需另行扩展。

## 外键与引用完整性
- 无显式外键引用。

## 索引策略
- UNIQUE 约束：列 code 已在表定义中声明唯一性。

## Row Level Security
```sql
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permissions readable by platform admins"
    ON public.permissions
    FOR SELECT
    USING (
      has_role('Vibot.admin')
    );

CREATE POLICY "Permissions managed by platform admins"
    ON public.permissions
    FOR ALL
    USING (
      has_role('Vibot.admin')
    )
    WITH CHECK (
      has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:permissions` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `permissions` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 权限唯一标识,
    code varchar(100) NOT NULL UNIQUE -- 权限编码,
    description text NOT NULL -- 权限说明,
    category varchar(50) NOT NULL -- 权限分类,
    is_system boolean NOT NULL DEFAULT true -- 是否系统内置,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.permissions IS '平台支持的操作权限清单。';
COMMENT ON COLUMN public.permissions.id IS '权限唯一标识';
COMMENT ON COLUMN public.permissions.code IS '权限编码';
COMMENT ON COLUMN public.permissions.description IS '权限说明';
COMMENT ON COLUMN public.permissions.category IS '权限分类';
COMMENT ON COLUMN public.permissions.is_system IS '是否系统内置';
COMMENT ON COLUMN public.permissions.created_at IS '创建时间';
COMMENT ON COLUMN public.permissions.updated_at IS '更新时间';
```
