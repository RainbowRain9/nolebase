# public.projects（项目）

> 项目主记录，承载预算与健康度概览。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 项目唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 项目编码 |
| name | varchar(255) | NOT NULL | 项目名称 |
| status | varchar(30) | NOT NULL DEFAULT 'active' | 项目状态 |
| project_type | varchar(30) | NOT NULL DEFAULT 'delivery' | 项目类型 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 负责人 |
| department_id | uuid | NULL REFERENCES departments(id) | 所属部门 |
| health_color | varchar(10) | NOT NULL DEFAULT 'green' | 健康度 |
| start_date | date | NULL | 开工日期 |
| end_date | date | NULL | 完工日期 |
| budget_amount | numeric(18,2) | NULL | 预算金额 |
| budget_currency | char(3) | NULL | 预算币种 |
| reporting_summary | jsonb | NOT NULL DEFAULT '{}'::jsonb | 进度与风险概览 |
| custom_fields | jsonb | NOT NULL DEFAULT '{}'::jsonb | 自定义字段 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：项目指标聚合到 JSON，减少派生表，但复杂报表需依赖物化视图缓存。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- owner_id → users(id)
- department_id → departments(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_projects_company_id ON public.projects(company_id);

## Row Level Security
```sql
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- 项目读取：公司内的项目成员、负责人、项目经理角色均可访问
CREATE POLICY "Projects readable by members"
    ON public.projects
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR owner_id = auth.uid()
        OR is_project_member(id, auth.uid())
      )
    );

-- 项目创建：仅项目经理或管理员
CREATE POLICY "Projects creatable by managers"
    ON public.projects
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
      )
    );

-- 项目更新：项目负责人、项目经理或管理员
CREATE POLICY "Projects updatable by owner or manager"
    ON public.projects
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR owner_id = auth.uid()
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.admin')
        OR owner_id = auth.uid()
      )
    );

CREATE POLICY "Projects deletable by admin"
    ON public.projects
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:projects` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `projects` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 项目唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    code varchar(50) NOT NULL -- 项目编码,
    name varchar(255) NOT NULL -- 项目名称,
    status varchar(30) NOT NULL DEFAULT 'active' -- 项目状态,
    project_type varchar(30) NOT NULL DEFAULT 'delivery' -- 项目类型,
    owner_id uuid NOT NULL REFERENCES users(id) -- 负责人,
    department_id uuid NULL REFERENCES departments(id) -- 所属部门,
    health_color varchar(10) NOT NULL DEFAULT 'green' -- 健康度,
    start_date date NULL -- 开工日期,
    end_date date NULL -- 完工日期,
    budget_amount numeric(18,2) NULL -- 预算金额,
    budget_currency char(3) NULL -- 预算币种,
    reporting_summary jsonb NOT NULL DEFAULT '{}'::jsonb -- 进度与风险概览,
    custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb -- 自定义字段,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.projects IS '项目主记录，承载预算与健康度概览。';
COMMENT ON COLUMN public.projects.id IS '项目唯一标识';
COMMENT ON COLUMN public.projects.company_id IS '所属公司';
COMMENT ON COLUMN public.projects.code IS '项目编码';
COMMENT ON COLUMN public.projects.name IS '项目名称';
COMMENT ON COLUMN public.projects.status IS '项目状态';
COMMENT ON COLUMN public.projects.project_type IS '项目类型';
COMMENT ON COLUMN public.projects.owner_id IS '负责人';
COMMENT ON COLUMN public.projects.department_id IS '所属部门';
COMMENT ON COLUMN public.projects.health_color IS '健康度';
COMMENT ON COLUMN public.projects.start_date IS '开工日期';
COMMENT ON COLUMN public.projects.end_date IS '完工日期';
COMMENT ON COLUMN public.projects.budget_amount IS '预算金额';
COMMENT ON COLUMN public.projects.budget_currency IS '预算币种';
COMMENT ON COLUMN public.projects.reporting_summary IS '进度与风险概览';
COMMENT ON COLUMN public.projects.custom_fields IS '自定义字段';
COMMENT ON COLUMN public.projects.created_at IS '创建时间';
COMMENT ON COLUMN public.projects.updated_at IS '更新时间';
```
