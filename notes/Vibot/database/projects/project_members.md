# public.project_members（项目成员）

> 关联项目与成员的角色、投入信息。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录标识 |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 成员 |
| role | varchar(50) | NOT NULL | 项目角色 |
| allocation_pct | numeric(5,2) | NULL | 投入占比 |
| joined_at | date | NULL | 加入日期 |
| left_at | date | NULL | 离开日期 |
| permissions | jsonb | NOT NULL DEFAULT '{}'::jsonb | 项目内特定权限 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：成员权限用 JSON，避免额外中间表，但授权校验需在服务层实现。

## 外键与引用完整性
- project_id → projects(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE
- user_id → users(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_project_members_company_id ON public.project_members(company_id);

## Row Level Security
```sql
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project membership readable by project team"
    ON public.project_members
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR user_id = auth.uid()
        OR is_project_member(project_id, auth.uid())
      )
    );

CREATE POLICY "Project membership managed by managers"
    ON public.project_members
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Project membership updated by managers"
    ON public.project_members
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Project membership deleted by managers"
    ON public.project_members
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:project_members` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `project_members` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.project_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录标识,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE -- 项目,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE -- 成员,
    role varchar(50) NOT NULL -- 项目角色,
    allocation_pct numeric(5,2) NULL -- 投入占比,
    joined_at date NULL -- 加入日期,
    left_at date NULL -- 离开日期,
    permissions jsonb NOT NULL DEFAULT '{}'::jsonb -- 项目内特定权限,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.project_members IS '关联项目与成员的角色、投入信息。';
COMMENT ON COLUMN public.project_members.id IS '记录标识';
COMMENT ON COLUMN public.project_members.project_id IS '项目';
COMMENT ON COLUMN public.project_members.company_id IS '所属公司';
COMMENT ON COLUMN public.project_members.user_id IS '成员';
COMMENT ON COLUMN public.project_members.role IS '项目角色';
COMMENT ON COLUMN public.project_members.allocation_pct IS '投入占比';
COMMENT ON COLUMN public.project_members.joined_at IS '加入日期';
COMMENT ON COLUMN public.project_members.left_at IS '离开日期';
COMMENT ON COLUMN public.project_members.permissions IS '项目内特定权限';
COMMENT ON COLUMN public.project_members.created_at IS '创建时间';
COMMENT ON COLUMN public.project_members.updated_at IS '更新时间';
```
