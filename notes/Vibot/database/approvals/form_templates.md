# public.form_templates（表单模板）

> 多租户下可复用的动态表单定义，驱动请假/报销/采购/出差等业务。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 模板唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(80) | NOT NULL | 模板编码（租户内唯一） |
| name | varchar(150) | NOT NULL | 模板名称 |
| category | varchar(50) | NOT NULL CHECK (category IN ('leave','expense','procurement','travel','custom')) | 模板分类 |
| latest_revision | integer | NOT NULL DEFAULT 1 | 当前生效版本 |
| schema_def | jsonb | NOT NULL DEFAULT '{}'::jsonb | JSON Schema 字段描述 |
| ui_schema | jsonb | NOT NULL DEFAULT '{}'::jsonb | 前端渲染配置 |
| validation_rules | jsonb | NOT NULL DEFAULT '[]'::jsonb | 自定义校验规则 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展配置 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | 更新时间 |

## 设计权衡
**设计权衡**：通过 JSON Schema/UISchema 统一描述字段与界面，避免为各业务表单重复建表；版本迭代依赖 revision 表存档。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_form_templates_company_id ON public.form_templates(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:form_templates` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `form_templates` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.form_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 模板唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    code varchar(80) NOT NULL -- 模板编码（租户内唯一）,
    name varchar(150) NOT NULL -- 模板名称,
    category varchar(50) NOT NULL CHECK (category IN ('leave','expense','procurement','travel','custom')) -- 模板分类,
    latest_revision integer NOT NULL DEFAULT 1 -- 当前生效版本,
    schema_def jsonb NOT NULL DEFAULT '{}'::jsonb -- JSON Schema 字段描述,
    ui_schema jsonb NOT NULL DEFAULT '{}'::jsonb -- 前端渲染配置,
    validation_rules jsonb NOT NULL DEFAULT '[]'::jsonb -- 自定义校验规则,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展配置,
    created_by uuid NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT NOW() -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT NOW() -- 更新时间
);
COMMENT ON TABLE public.form_templates IS '多租户下可复用的动态表单定义，驱动请假/报销/采购/出差等业务。';
COMMENT ON COLUMN public.form_templates.id IS '模板唯一标识';
COMMENT ON COLUMN public.form_templates.company_id IS '所属公司';
COMMENT ON COLUMN public.form_templates.code IS '模板编码（租户内唯一）';
COMMENT ON COLUMN public.form_templates.name IS '模板名称';
COMMENT ON COLUMN public.form_templates.category IS '模板分类';
COMMENT ON COLUMN public.form_templates.latest_revision IS '当前生效版本';
COMMENT ON COLUMN public.form_templates.schema_def IS 'JSON Schema 字段描述';
COMMENT ON COLUMN public.form_templates.ui_schema IS '前端渲染配置';
COMMENT ON COLUMN public.form_templates.validation_rules IS '自定义校验规则';
COMMENT ON COLUMN public.form_templates.metadata IS '扩展配置';
COMMENT ON COLUMN public.form_templates.created_by IS '创建人';
COMMENT ON COLUMN public.form_templates.updated_by IS '更新人';
COMMENT ON COLUMN public.form_templates.created_at IS '创建时间';
COMMENT ON COLUMN public.form_templates.updated_at IS '更新时间';
```
