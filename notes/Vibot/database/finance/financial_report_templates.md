# public.financial_report_templates（财务报表模板）

> 报表、预警与订阅配置的统一定义。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 模板唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| template_code | varchar(50) | NOT NULL | 模板编码 |
| name | varchar(255) | NOT NULL | 模板名称 |
| description | text | NULL | 模板说明 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 状态 |
| report_scope | varchar(20) | NOT NULL | 报表范围 |
| layout | jsonb | NOT NULL DEFAULT '{}'::jsonb | 布局定义 |
| filters | jsonb | NOT NULL DEFAULT '{}'::jsonb | 筛选条件 |
| schedule | jsonb | NOT NULL DEFAULT '{}'::jsonb | 调度配置 |
| subscriptions | jsonb | NOT NULL DEFAULT '[]'::jsonb | 订阅人列表 |
| alert_rules | jsonb | NOT NULL DEFAULT '[]'::jsonb | 预警规则 |
| alert_history | jsonb | NOT NULL DEFAULT '[]'::jsonb | 预警历史 |
| run_history | jsonb | NOT NULL DEFAULT '[]'::jsonb | 运行历史 |
| data_sources | jsonb | NOT NULL DEFAULT '[]'::jsonb | 数据源配置 |
| sync_state | jsonb | NOT NULL DEFAULT '{}'::jsonb | 同步作业状态 |
| last_run_at | timestamptz | NULL | 最近运行时间 |
| last_run_status | varchar(20) | NULL | 最近运行状态 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 模板负责人 |
| timezone | varchar(50) | NULL | 调度时区 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：运行历史与预警全部存入 JSON，极大降低表数量，但查询需依赖 JSON 索引与物化快照。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- owner_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_financial_report_templates_company_id ON public.financial_report_templates(company_id);

## Row Level Security
```sql
ALTER TABLE public.financial_report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Report templates readable within company"
    ON public.financial_report_templates
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Report templates managed by finance"
    ON public.financial_report_templates
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.finance_controller')
        OR has_role('Vibot.admin')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.finance_controller')
        OR has_role('Vibot.admin')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:financial_report_templates` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `financial_report_templates` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.financial_report_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 模板唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    template_code varchar(50) NOT NULL -- 模板编码,
    name varchar(255) NOT NULL -- 模板名称,
    description text NULL -- 模板说明,
    status varchar(20) NOT NULL DEFAULT 'active' -- 状态,
    report_scope varchar(20) NOT NULL -- 报表范围,
    layout jsonb NOT NULL DEFAULT '{}'::jsonb -- 布局定义,
    filters jsonb NOT NULL DEFAULT '{}'::jsonb -- 筛选条件,
    schedule jsonb NOT NULL DEFAULT '{}'::jsonb -- 调度配置,
    subscriptions jsonb NOT NULL DEFAULT '[]'::jsonb -- 订阅人列表,
    alert_rules jsonb NOT NULL DEFAULT '[]'::jsonb -- 预警规则,
    alert_history jsonb NOT NULL DEFAULT '[]'::jsonb -- 预警历史,
    run_history jsonb NOT NULL DEFAULT '[]'::jsonb -- 运行历史,
    data_sources jsonb NOT NULL DEFAULT '[]'::jsonb -- 数据源配置,
    sync_state jsonb NOT NULL DEFAULT '{}'::jsonb -- 同步作业状态,
    last_run_at timestamptz NULL -- 最近运行时间,
    last_run_status varchar(20) NULL -- 最近运行状态,
    owner_id uuid NOT NULL REFERENCES users(id) -- 模板负责人,
    timezone varchar(50) NULL -- 调度时区,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.financial_report_templates IS '报表、预警与订阅配置的统一定义。';
COMMENT ON COLUMN public.financial_report_templates.id IS '模板唯一标识';
COMMENT ON COLUMN public.financial_report_templates.company_id IS '所属公司';
COMMENT ON COLUMN public.financial_report_templates.template_code IS '模板编码';
COMMENT ON COLUMN public.financial_report_templates.name IS '模板名称';
COMMENT ON COLUMN public.financial_report_templates.description IS '模板说明';
COMMENT ON COLUMN public.financial_report_templates.status IS '状态';
COMMENT ON COLUMN public.financial_report_templates.report_scope IS '报表范围';
COMMENT ON COLUMN public.financial_report_templates.layout IS '布局定义';
COMMENT ON COLUMN public.financial_report_templates.filters IS '筛选条件';
COMMENT ON COLUMN public.financial_report_templates.schedule IS '调度配置';
COMMENT ON COLUMN public.financial_report_templates.subscriptions IS '订阅人列表';
COMMENT ON COLUMN public.financial_report_templates.alert_rules IS '预警规则';
COMMENT ON COLUMN public.financial_report_templates.alert_history IS '预警历史';
COMMENT ON COLUMN public.financial_report_templates.run_history IS '运行历史';
COMMENT ON COLUMN public.financial_report_templates.data_sources IS '数据源配置';
COMMENT ON COLUMN public.financial_report_templates.sync_state IS '同步作业状态';
COMMENT ON COLUMN public.financial_report_templates.last_run_at IS '最近运行时间';
COMMENT ON COLUMN public.financial_report_templates.last_run_status IS '最近运行状态';
COMMENT ON COLUMN public.financial_report_templates.owner_id IS '模板负责人';
COMMENT ON COLUMN public.financial_report_templates.timezone IS '调度时区';
COMMENT ON COLUMN public.financial_report_templates.created_at IS '创建时间';
COMMENT ON COLUMN public.financial_report_templates.updated_at IS '更新时间';
```
