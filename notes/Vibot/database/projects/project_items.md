# public.project_items（项目事项）

> 统一承载任务、里程碑、交付物及周报节点。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 事项唯一标识 |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 关联项目 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| parent_item_id | uuid | NULL REFERENCES project_items(id) ON DELETE SET NULL | 父事项 |
| item_type | varchar(30) | NOT NULL CHECK (item_type IN ('task','milestone','deliverable','update')) | 事项类型 |
| title | varchar(255) | NOT NULL | 标题 |
| description | text | NULL | 说明 |
| status | varchar(30) | NOT NULL DEFAULT 'open' | 状态 |
| priority | varchar(20) | NOT NULL DEFAULT 'normal' | 优先级 |
| assignee_id | uuid | NULL REFERENCES users(id) | 负责人 |
| dependency_ids | uuid[] | NULL | 依赖事项 |
| planned_start | date | NULL | 计划开始 |
| planned_end | date | NULL | 计划结束 |
| actual_start | date | NULL | 实际开始 |
| actual_end | date | NULL | 实际结束 |
| progress_metrics | jsonb | NOT NULL DEFAULT '{}'::jsonb | 进度指标 |
| timeline | jsonb | NOT NULL DEFAULT '[]'::jsonb | 活动时间线 |
| linked_resources | jsonb | NOT NULL DEFAULT '{}'::jsonb | 关联资源 |
| tags | text[] | NULL | 标签 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：单表承载多种事项，结构简洁，但类型特有字段需通过 JSON 处理。

## 外键与引用完整性
- project_id → projects(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE
- parent_item_id → project_items(id) ON DELETE SET NULL
- assignee_id → users(id)
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_project_items_company_id ON public.project_items(company_id);

## Row Level Security
```sql
ALTER TABLE public.project_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project items readable by project team"
    ON public.project_items
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR is_project_member(project_id, auth.uid())
        OR assignee_id = auth.uid()
        OR created_by = auth.uid()
      )
    );

CREATE POLICY "Project items creatable by team"
    ON public.project_items
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR is_project_member(project_id, auth.uid())
      )
    );

CREATE POLICY "Project items updatable by owner or manager"
    ON public.project_items
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR is_project_member(project_id, auth.uid())
        OR created_by = auth.uid()
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR is_project_member(project_id, auth.uid())
        OR created_by = auth.uid()
      )
    );

CREATE POLICY "Project items deletable by managers"
    ON public.project_items
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
- 启用 Realtime 频道 `public:project_items` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `project_items` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.project_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 事项唯一标识,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE -- 关联项目,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    parent_item_id uuid NULL REFERENCES project_items(id) ON DELETE SET NULL -- 父事项,
    item_type varchar(30) NOT NULL CHECK (item_type IN ('task','milestone','deliverable','update')) -- 事项类型,
    title varchar(255) NOT NULL -- 标题,
    description text NULL -- 说明,
    status varchar(30) NOT NULL DEFAULT 'open' -- 状态,
    priority varchar(20) NOT NULL DEFAULT 'normal' -- 优先级,
    assignee_id uuid NULL REFERENCES users(id) -- 负责人,
    dependency_ids uuid[] NULL -- 依赖事项,
    planned_start date NULL -- 计划开始,
    planned_end date NULL -- 计划结束,
    actual_start date NULL -- 实际开始,
    actual_end date NULL -- 实际结束,
    progress_metrics jsonb NOT NULL DEFAULT '{}'::jsonb -- 进度指标,
    timeline jsonb NOT NULL DEFAULT '[]'::jsonb -- 活动时间线,
    linked_resources jsonb NOT NULL DEFAULT '{}'::jsonb -- 关联资源,
    tags text[] NULL -- 标签,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.project_items IS '统一承载任务、里程碑、交付物及周报节点。';
COMMENT ON COLUMN public.project_items.id IS '事项唯一标识';
COMMENT ON COLUMN public.project_items.project_id IS '关联项目';
COMMENT ON COLUMN public.project_items.company_id IS '所属公司';
COMMENT ON COLUMN public.project_items.parent_item_id IS '父事项';
COMMENT ON COLUMN public.project_items.item_type IS '事项类型';
COMMENT ON COLUMN public.project_items.title IS '标题';
COMMENT ON COLUMN public.project_items.description IS '说明';
COMMENT ON COLUMN public.project_items.status IS '状态';
COMMENT ON COLUMN public.project_items.priority IS '优先级';
COMMENT ON COLUMN public.project_items.assignee_id IS '负责人';
COMMENT ON COLUMN public.project_items.dependency_ids IS '依赖事项';
COMMENT ON COLUMN public.project_items.planned_start IS '计划开始';
COMMENT ON COLUMN public.project_items.planned_end IS '计划结束';
COMMENT ON COLUMN public.project_items.actual_start IS '实际开始';
COMMENT ON COLUMN public.project_items.actual_end IS '实际结束';
COMMENT ON COLUMN public.project_items.progress_metrics IS '进度指标';
COMMENT ON COLUMN public.project_items.timeline IS '活动时间线';
COMMENT ON COLUMN public.project_items.linked_resources IS '关联资源';
COMMENT ON COLUMN public.project_items.tags IS '标签';
COMMENT ON COLUMN public.project_items.created_by IS '创建人';
COMMENT ON COLUMN public.project_items.updated_by IS '更新人';
COMMENT ON COLUMN public.project_items.created_at IS '创建时间';
COMMENT ON COLUMN public.project_items.updated_at IS '更新时间';
```
