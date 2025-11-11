# public.departments（部门）

> 公司内部组织结构，支持树型层级。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 部门唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| parent_id | uuid | NULL REFERENCES departments(id) | 上级部门 |
| path | ltree | NOT NULL | 层级路径 |
| name | varchar(150) | NOT NULL | 部门名称 |
| leader_id | uuid | NULL REFERENCES users(id) | 负责人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 自定义标签 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：使用 ltree 存储层级路径，查询灵活但依赖 PostgreSQL 扩展。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- parent_id → departments(id)
- leader_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_departments_company_id ON public.departments(company_id);
- CREATE INDEX IF NOT EXISTS idx_departments_path_gist ON public.departments USING GIST(path);

## Row Level Security
```sql
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- 任何登录用户仅能查看所属公司的部门数据
CREATE POLICY "Departments readable within company"
    ON public.departments
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

-- 仅管理员或 HR 经理可维护部门记录
CREATE POLICY "Department records managed by admins"
    ON public.departments
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    );

CREATE POLICY "Department records created by admins"
    ON public.departments
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    );

CREATE POLICY "Department records deleted by admins"
    ON public.departments
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:departments` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `departments` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 部门唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    parent_id uuid NULL REFERENCES departments(id) -- 上级部门,
    path ltree NOT NULL -- 层级路径,
    name varchar(150) NOT NULL -- 部门名称,
    leader_id uuid NULL REFERENCES users(id) -- 负责人,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 自定义标签,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.departments IS '公司内部组织结构，支持树型层级。';
COMMENT ON COLUMN public.departments.id IS '部门唯一标识';
COMMENT ON COLUMN public.departments.company_id IS '所属公司';
COMMENT ON COLUMN public.departments.parent_id IS '上级部门';
COMMENT ON COLUMN public.departments.path IS '层级路径';
COMMENT ON COLUMN public.departments.name IS '部门名称';
COMMENT ON COLUMN public.departments.leader_id IS '负责人';
COMMENT ON COLUMN public.departments.metadata IS '自定义标签';
COMMENT ON COLUMN public.departments.created_at IS '创建时间';
COMMENT ON COLUMN public.departments.updated_at IS '更新时间';
```
