# public.approval_workflows（审批流程）

> 审批流程定义、版本与表单配置。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 流程唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 流程编码 |
| name | varchar(255) | NOT NULL | 流程名称 |
| category | varchar(50) | NOT NULL | 流程分类 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 流程状态 |
| latest_revision | integer | NOT NULL DEFAULT 1 | 最新版本号 |
| definition | jsonb | NOT NULL DEFAULT '{}'::jsonb | 流程图定义 |
| form_schema | jsonb | NOT NULL DEFAULT '{}'::jsonb | 表单结构 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展配置 |
| published_at | timestamptz | NULL | 最近发布时间 |
| retired_at | timestamptz | NULL | 下线时间 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：版本信息嵌入 JSON，减少版本表，但需要在应用层管理 revision 快照。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_workflows_company_id ON public.approval_workflows(company_id);

## Row Level Security
```sql
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approval workflows readable within company"
    ON public.approval_workflows
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
        OR has_role('Vibot.project_manager')
      )
    );

CREATE POLICY "Approval workflows manageable by admins"
    ON public.approval_workflows
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
- 启用 Realtime 频道 `public:approval_workflows` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_workflows` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 流程唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    code varchar(50) NOT NULL -- 流程编码,
    name varchar(255) NOT NULL -- 流程名称,
    category varchar(50) NOT NULL -- 流程分类,
    status varchar(20) NOT NULL DEFAULT 'active' -- 流程状态,
    latest_revision integer NOT NULL DEFAULT 1 -- 最新版本号,
    definition jsonb NOT NULL DEFAULT '{}'::jsonb -- 流程图定义,
    form_schema jsonb NOT NULL DEFAULT '{}'::jsonb -- 表单结构,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展配置,
    published_at timestamptz NULL -- 最近发布时间,
    retired_at timestamptz NULL -- 下线时间,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.approval_workflows IS '审批流程定义、版本与表单配置。';
COMMENT ON COLUMN public.approval_workflows.id IS '流程唯一标识';
COMMENT ON COLUMN public.approval_workflows.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_workflows.code IS '流程编码';
COMMENT ON COLUMN public.approval_workflows.name IS '流程名称';
COMMENT ON COLUMN public.approval_workflows.category IS '流程分类';
COMMENT ON COLUMN public.approval_workflows.status IS '流程状态';
COMMENT ON COLUMN public.approval_workflows.latest_revision IS '最新版本号';
COMMENT ON COLUMN public.approval_workflows.definition IS '流程图定义';
COMMENT ON COLUMN public.approval_workflows.form_schema IS '表单结构';
COMMENT ON COLUMN public.approval_workflows.metadata IS '扩展配置';
COMMENT ON COLUMN public.approval_workflows.published_at IS '最近发布时间';
COMMENT ON COLUMN public.approval_workflows.retired_at IS '下线时间';
COMMENT ON COLUMN public.approval_workflows.created_by IS '创建人';
COMMENT ON COLUMN public.approval_workflows.updated_by IS '更新人';
COMMENT ON COLUMN public.approval_workflows.created_at IS '创建时间';
COMMENT ON COLUMN public.approval_workflows.updated_at IS '更新时间';
```
