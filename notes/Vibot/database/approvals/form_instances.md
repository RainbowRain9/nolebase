# public.form_instances（表单实例）

> 审批单、草稿与回写的统一载体，绑定审批请求。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 实例唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| template_id | uuid | NOT NULL REFERENCES form_templates(id) | 模板 |
| template_revision | integer | NOT NULL | 模板版本 |
| request_id | uuid | NULL REFERENCES approval_requests(id) ON DELETE SET NULL | 关联审批 |
| draft_owner_id | uuid | NULL REFERENCES users(id) | 草稿所有人 |
| status | varchar(20) | NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','synced')) | 表单状态 |
| form_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 表单内容 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| computed_summary | jsonb | NOT NULL DEFAULT '{}'::jsonb | 数据摘要 |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- template_id → form_templates(id)
- request_id → approval_requests(id) ON DELETE SET NULL
- draft_owner_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_form_instances_company_id ON public.form_instances(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:form_instances` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `form_instances` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.form_instances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 实例唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    template_id uuid NOT NULL REFERENCES form_templates(id) -- 模板,
    template_revision integer NOT NULL -- 模板版本,
    request_id uuid NULL REFERENCES approval_requests(id) ON DELETE SET NULL -- 关联审批,
    draft_owner_id uuid NULL REFERENCES users(id) -- 草稿所有人,
    status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','synced')) -- 表单状态,
    form_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 表单内容,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb -- 附件列表,
    computed_summary jsonb NOT NULL DEFAULT '{}'::jsonb -- 数据摘要,
    created_at timestamptz NOT NULL DEFAULT NOW() -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT NOW() -- 更新时间
);
COMMENT ON TABLE public.form_instances IS '审批单、草稿与回写的统一载体，绑定审批请求。';
COMMENT ON COLUMN public.form_instances.id IS '实例唯一标识';
COMMENT ON COLUMN public.form_instances.company_id IS '所属公司';
COMMENT ON COLUMN public.form_instances.template_id IS '模板';
COMMENT ON COLUMN public.form_instances.template_revision IS '模板版本';
COMMENT ON COLUMN public.form_instances.request_id IS '关联审批';
COMMENT ON COLUMN public.form_instances.draft_owner_id IS '草稿所有人';
COMMENT ON COLUMN public.form_instances.status IS '表单状态';
COMMENT ON COLUMN public.form_instances.form_payload IS '表单内容';
COMMENT ON COLUMN public.form_instances.attachments IS '附件列表';
COMMENT ON COLUMN public.form_instances.computed_summary IS '数据摘要';
COMMENT ON COLUMN public.form_instances.created_at IS '创建时间';
COMMENT ON COLUMN public.form_instances.updated_at IS '更新时间';
```
