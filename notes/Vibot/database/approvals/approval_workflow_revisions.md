# public.approval_workflow_revisions（审批流程版本）

> 记录流程拓扑、节点表单映射与 SLA 配置。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 版本唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE | 流程定义 |
| revision | integer | NOT NULL | 版本号 |
| definition | jsonb | NOT NULL | 节点/连线配置 |
| form_template_map | jsonb | NOT NULL | 节点对应表单片段 |
| sla_rules | jsonb | NOT NULL DEFAULT '[]'::jsonb | 超期规则 |
| auto_actions | jsonb | NOT NULL DEFAULT '[]'::jsonb | 条件自动化 |
| published_by | uuid | NULL REFERENCES users(id) | 发布者 |
| published_at | timestamptz | NOT NULL DEFAULT NOW() | 发布时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- workflow_id → approval_workflows(id) ON DELETE CASCADE
- published_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_workflow_revisions_company_id ON public.approval_workflow_revisions(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_workflow_revisions` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_workflow_revisions` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_workflow_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 版本唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    workflow_id uuid NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE -- 流程定义,
    revision integer NOT NULL -- 版本号,
    definition jsonb NOT NULL -- 节点/连线配置,
    form_template_map jsonb NOT NULL -- 节点对应表单片段,
    sla_rules jsonb NOT NULL DEFAULT '[]'::jsonb -- 超期规则,
    auto_actions jsonb NOT NULL DEFAULT '[]'::jsonb -- 条件自动化,
    published_by uuid NULL REFERENCES users(id) -- 发布者,
    published_at timestamptz NOT NULL DEFAULT NOW() -- 发布时间
);
COMMENT ON TABLE public.approval_workflow_revisions IS '记录流程拓扑、节点表单映射与 SLA 配置。';
COMMENT ON COLUMN public.approval_workflow_revisions.id IS '版本唯一标识';
COMMENT ON COLUMN public.approval_workflow_revisions.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_workflow_revisions.workflow_id IS '流程定义';
COMMENT ON COLUMN public.approval_workflow_revisions.revision IS '版本号';
COMMENT ON COLUMN public.approval_workflow_revisions.definition IS '节点/连线配置';
COMMENT ON COLUMN public.approval_workflow_revisions.form_template_map IS '节点对应表单片段';
COMMENT ON COLUMN public.approval_workflow_revisions.sla_rules IS '超期规则';
COMMENT ON COLUMN public.approval_workflow_revisions.auto_actions IS '条件自动化';
COMMENT ON COLUMN public.approval_workflow_revisions.published_by IS '发布者';
COMMENT ON COLUMN public.approval_workflow_revisions.published_at IS '发布时间';
```
