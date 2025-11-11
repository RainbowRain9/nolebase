# public.form_template_revisions（表单模板版本）

> 保存每次发布的模板快照，支撑历史审批回溯。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 版本唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| template_id | uuid | NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE | 模板 |
| revision | integer | NOT NULL | 版本号 |
| schema_def | jsonb | NOT NULL | 字段定义快照 |
| ui_schema | jsonb | NOT NULL | 渲染配置快照 |
| validation_rules | jsonb | NOT NULL | 校验规则快照 |
| changelog | text | NULL | 变更说明 |
| published_by | uuid | NULL REFERENCES users(id) | 发布者 |
| published_at | timestamptz | NOT NULL DEFAULT NOW() | 发布时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- template_id → form_templates(id) ON DELETE CASCADE
- published_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_form_template_revisions_company_id ON public.form_template_revisions(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:form_template_revisions` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `form_template_revisions` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.form_template_revisions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 版本唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    template_id uuid NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE -- 模板,
    revision integer NOT NULL -- 版本号,
    schema_def jsonb NOT NULL -- 字段定义快照,
    ui_schema jsonb NOT NULL -- 渲染配置快照,
    validation_rules jsonb NOT NULL -- 校验规则快照,
    changelog text NULL -- 变更说明,
    published_by uuid NULL REFERENCES users(id) -- 发布者,
    published_at timestamptz NOT NULL DEFAULT NOW() -- 发布时间
);
COMMENT ON TABLE public.form_template_revisions IS '保存每次发布的模板快照，支撑历史审批回溯。';
COMMENT ON COLUMN public.form_template_revisions.id IS '版本唯一标识';
COMMENT ON COLUMN public.form_template_revisions.company_id IS '所属公司';
COMMENT ON COLUMN public.form_template_revisions.template_id IS '模板';
COMMENT ON COLUMN public.form_template_revisions.revision IS '版本号';
COMMENT ON COLUMN public.form_template_revisions.schema_def IS '字段定义快照';
COMMENT ON COLUMN public.form_template_revisions.ui_schema IS '渲染配置快照';
COMMENT ON COLUMN public.form_template_revisions.validation_rules IS '校验规则快照';
COMMENT ON COLUMN public.form_template_revisions.changelog IS '变更说明';
COMMENT ON COLUMN public.form_template_revisions.published_by IS '发布者';
COMMENT ON COLUMN public.form_template_revisions.published_at IS '发布时间';
```
