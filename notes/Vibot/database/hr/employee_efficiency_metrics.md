# public.employee_efficiency_metrics（员工效率指标）

> 整合原评分与报表，存储各期效率量化数据。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| employee_id | uuid | NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE | 员工 |
| conversation_id | uuid | NULL REFERENCES ai_conversations(id) | AI 评估来源 |
| metric_period_start | date | NOT NULL | 统计期开始 |
| metric_period_end | date | NOT NULL | 统计期结束 |
| metric_type | varchar(30) | NOT NULL | 指标类型 |
| score | numeric(5,2) | NULL | 评分 |
| metrics | jsonb | NOT NULL DEFAULT '{}'::jsonb | 详细指标 |
| comments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 评语 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
**设计权衡**：评分和报告统一存储，生成逻辑更简单，但历史版本区分需依靠统计期与类型组合。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- employee_id → employee_records(id) ON DELETE CASCADE
- conversation_id → ai_conversations(id)
- created_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_employee_efficiency_metrics_company_id ON public.employee_efficiency_metrics(company_id);

## Row Level Security
```sql
ALTER TABLE public.employee_efficiency_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Efficiency metrics readable within company"
    ON public.employee_efficiency_metrics
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
        OR employee_id IN (
          SELECT er.id FROM public.employee_records er
          WHERE er.user_id = auth.uid()
        )
      )
    );

CREATE POLICY "Efficiency metrics managed by HR"
    ON public.employee_efficiency_metrics
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:employee_efficiency_metrics` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `employee_efficiency_metrics` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.employee_efficiency_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    employee_id uuid NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE -- 员工,
    conversation_id uuid NULL REFERENCES ai_conversations(id) -- AI 评估来源,
    metric_period_start date NOT NULL -- 统计期开始,
    metric_period_end date NOT NULL -- 统计期结束,
    metric_type varchar(30) NOT NULL -- 指标类型,
    score numeric(5,2) NULL -- 评分,
    metrics jsonb NOT NULL DEFAULT '{}'::jsonb -- 详细指标,
    comments jsonb NOT NULL DEFAULT '[]'::jsonb -- 评语,
    created_by uuid NULL REFERENCES users(id) -- 创建人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.employee_efficiency_metrics IS '整合原评分与报表，存储各期效率量化数据。';
COMMENT ON COLUMN public.employee_efficiency_metrics.id IS '记录唯一标识';
COMMENT ON COLUMN public.employee_efficiency_metrics.company_id IS '所属公司';
COMMENT ON COLUMN public.employee_efficiency_metrics.employee_id IS '员工';
COMMENT ON COLUMN public.employee_efficiency_metrics.conversation_id IS 'AI 评估来源';
COMMENT ON COLUMN public.employee_efficiency_metrics.metric_period_start IS '统计期开始';
COMMENT ON COLUMN public.employee_efficiency_metrics.metric_period_end IS '统计期结束';
COMMENT ON COLUMN public.employee_efficiency_metrics.metric_type IS '指标类型';
COMMENT ON COLUMN public.employee_efficiency_metrics.score IS '评分';
COMMENT ON COLUMN public.employee_efficiency_metrics.metrics IS '详细指标';
COMMENT ON COLUMN public.employee_efficiency_metrics.comments IS '评语';
COMMENT ON COLUMN public.employee_efficiency_metrics.created_by IS '创建人';
COMMENT ON COLUMN public.employee_efficiency_metrics.created_at IS '创建时间';
```
