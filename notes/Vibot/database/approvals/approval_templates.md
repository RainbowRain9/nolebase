# public.approval_templates（审批模板）

> 关联表单、流程与默认通知策略的组合模板。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 模板唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| template_code | varchar(50) | NOT NULL | 模板编码 |
| name | varchar(255) | NOT NULL | 模板名称 |
| description | text | NULL | 说明 |
| form_template_id | uuid | NULL REFERENCES form_templates(id) | 默认表单 |
| workflow_id | uuid | NULL REFERENCES approval_workflows(id) | 默认流程 |
| default_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 预填表单/字段 |
| default_assignments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 默认抄送/审批人 |
| notification_settings | jsonb | NOT NULL DEFAULT '[]'::jsonb | 通知通道配置 |
| is_active | boolean | NOT NULL DEFAULT true | 是否启用 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | 更新时间 |

## 设计权衡
**设计权衡**：审批模板聚合常用表单 + 流程 + 通知方案，便于多租户快速启用标准审批路径。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- form_template_id → form_templates(id)
- workflow_id → approval_workflows(id)
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_templates_company_id ON public.approval_templates(company_id);

## Row Level Security
```sql
ALTER TABLE public.approval_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approval templates readable"
    ON public.approval_templates
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Approval templates managed by designer"
    ON public.approval_templates
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approval_designer')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approval_designer')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_templates` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_templates` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 模板唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    template_code varchar(50) NOT NULL -- 模板编码,
    name varchar(255) NOT NULL -- 模板名称,
    description text NULL -- 说明,
    form_template_id uuid NULL REFERENCES form_templates(id) -- 默认表单,
    workflow_id uuid NULL REFERENCES approval_workflows(id) -- 默认流程,
    default_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 预填表单/字段,
    default_assignments jsonb NOT NULL DEFAULT '[]'::jsonb -- 默认抄送/审批人,
    notification_settings jsonb NOT NULL DEFAULT '[]'::jsonb -- 通知通道配置,
    is_active boolean NOT NULL DEFAULT true -- 是否启用,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT NOW() -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT NOW() -- 更新时间
);
COMMENT ON TABLE public.approval_templates IS '关联表单、流程与默认通知策略的组合模板。';
COMMENT ON COLUMN public.approval_templates.id IS '模板唯一标识';
COMMENT ON COLUMN public.approval_templates.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_templates.template_code IS '模板编码';
COMMENT ON COLUMN public.approval_templates.name IS '模板名称';
COMMENT ON COLUMN public.approval_templates.description IS '说明';
COMMENT ON COLUMN public.approval_templates.form_template_id IS '默认表单';
COMMENT ON COLUMN public.approval_templates.workflow_id IS '默认流程';
COMMENT ON COLUMN public.approval_templates.default_payload IS '预填表单/字段';
COMMENT ON COLUMN public.approval_templates.default_assignments IS '默认抄送/审批人';
COMMENT ON COLUMN public.approval_templates.notification_settings IS '通知通道配置';
COMMENT ON COLUMN public.approval_templates.is_active IS '是否启用';
COMMENT ON COLUMN public.approval_templates.created_by IS '创建人';
COMMENT ON COLUMN public.approval_templates.updated_by IS '更新人';
COMMENT ON COLUMN public.approval_templates.created_at IS '创建时间';
COMMENT ON COLUMN public.approval_templates.updated_at IS '更新时间';
```
