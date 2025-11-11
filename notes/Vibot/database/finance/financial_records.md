# public.financial_records（财务记录）

> 统一的财务流水表，兼容采购、运费等多种场景。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| order_id | uuid | NULL REFERENCES orders(id) ON DELETE SET NULL | 关联订单 |
| counterparty_id | uuid | NULL REFERENCES customers(id) ON DELETE SET NULL | 往来单位 |
| record_code | varchar(50) | NOT NULL | 业务编码 |
| record_type | varchar(30) | NOT NULL | 记录类型 |
| status | varchar(20) | NOT NULL DEFAULT 'pending' | 当前状态 |
| flow_direction | varchar(10) | NOT NULL CHECK (flow_direction IN ('inflow','outflow')) | 现金方向 |
| amount | numeric(18,2) | NOT NULL | 金额 |
| currency | char(3) | NOT NULL | 币种 |
| fx_rate | numeric(12,6) | NULL | 折算汇率 |
| amount_base | numeric(18,2) | NULL | 基准币种金额 |
| occurred_at | timestamptz | NOT NULL | 发生时间 |
| recognized_at | timestamptz | NULL | 确认时间 |
| reporting_window | daterange | NULL | 所属报表区间 |
| project_id | uuid | NULL REFERENCES projects(id) | 关联项目 |
| department_id | uuid | NULL REFERENCES departments(id) | 关联部门 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联审批 |
| source | varchar(20) | NOT NULL DEFAULT 'manual' | 来源 |
| source_reference | varchar(100) | NULL | 来源凭证 |
| source_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 原始明细 |
| ingestion_snapshot | jsonb | NOT NULL DEFAULT '{}'::jsonb | 同步状态 |
| dimensions | jsonb | NOT NULL DEFAULT '{}'::jsonb | 自定义维度 |
| tags | text[] | NULL | 标签 |
| alert_flags | jsonb | NOT NULL DEFAULT '{}'::jsonb | 预警标记 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：历史运行、采购、预警信息全部进入 JSON，显著减少表数量，但报表需结合物化视图或外部仓库。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- order_id → orders(id) ON DELETE SET NULL
- counterparty_id → customers(id) ON DELETE SET NULL
- project_id → projects(id)
- department_id → departments(id)
- approval_request_id → approval_requests(id)
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_financial_records_company_id ON public.financial_records(company_id);

## Row Level Security
```sql
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;

-- 仅财务、审计或管理员可查看更多公司财务数据
CREATE POLICY "Financial records readable by finance"
    ON public.financial_records
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.finance_controller')
        OR has_role('Vibot.finance_auditor')
        OR has_role('Vibot.admin')
        OR created_by = auth.uid()
      )
    );

CREATE POLICY "Financial records creatable by finance"
    ON public.financial_records
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.finance_controller')
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Financial records updatable by finance"
    ON public.financial_records
    FOR UPDATE
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

CREATE POLICY "Financial records deletable by admin"
    ON public.financial_records
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:financial_records` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `financial_records` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.financial_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    order_id uuid NULL REFERENCES orders(id) ON DELETE SET NULL -- 关联订单,
    counterparty_id uuid NULL REFERENCES customers(id) ON DELETE SET NULL -- 往来单位,
    record_code varchar(50) NOT NULL -- 业务编码,
    record_type varchar(30) NOT NULL -- 记录类型,
    status varchar(20) NOT NULL DEFAULT 'pending' -- 当前状态,
    flow_direction varchar(10) NOT NULL CHECK (flow_direction IN ('inflow','outflow')) -- 现金方向,
    amount numeric(18,2) NOT NULL -- 金额,
    currency char(3) NOT NULL -- 币种,
    fx_rate numeric(12,6) NULL -- 折算汇率,
    amount_base numeric(18,2) NULL -- 基准币种金额,
    occurred_at timestamptz NOT NULL -- 发生时间,
    recognized_at timestamptz NULL -- 确认时间,
    reporting_window daterange NULL -- 所属报表区间,
    project_id uuid NULL REFERENCES projects(id) -- 关联项目,
    department_id uuid NULL REFERENCES departments(id) -- 关联部门,
    approval_request_id uuid NULL REFERENCES approval_requests(id) -- 关联审批,
    source varchar(20) NOT NULL DEFAULT 'manual' -- 来源,
    source_reference varchar(100) NULL -- 来源凭证,
    source_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 原始明细,
    ingestion_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb -- 同步状态,
    dimensions jsonb NOT NULL DEFAULT '{}'::jsonb -- 自定义维度,
    tags text[] NULL -- 标签,
    alert_flags jsonb NOT NULL DEFAULT '{}'::jsonb -- 预警标记,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb -- 附件列表,
    created_by uuid NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.financial_records IS '统一的财务流水表，兼容采购、运费等多种场景。';
COMMENT ON COLUMN public.financial_records.id IS '记录唯一标识';
COMMENT ON COLUMN public.financial_records.company_id IS '所属公司';
COMMENT ON COLUMN public.financial_records.order_id IS '关联订单';
COMMENT ON COLUMN public.financial_records.counterparty_id IS '往来单位';
COMMENT ON COLUMN public.financial_records.record_code IS '业务编码';
COMMENT ON COLUMN public.financial_records.record_type IS '记录类型';
COMMENT ON COLUMN public.financial_records.status IS '当前状态';
COMMENT ON COLUMN public.financial_records.flow_direction IS '现金方向';
COMMENT ON COLUMN public.financial_records.amount IS '金额';
COMMENT ON COLUMN public.financial_records.currency IS '币种';
COMMENT ON COLUMN public.financial_records.fx_rate IS '折算汇率';
COMMENT ON COLUMN public.financial_records.amount_base IS '基准币种金额';
COMMENT ON COLUMN public.financial_records.occurred_at IS '发生时间';
COMMENT ON COLUMN public.financial_records.recognized_at IS '确认时间';
COMMENT ON COLUMN public.financial_records.reporting_window IS '所属报表区间';
COMMENT ON COLUMN public.financial_records.project_id IS '关联项目';
COMMENT ON COLUMN public.financial_records.department_id IS '关联部门';
COMMENT ON COLUMN public.financial_records.approval_request_id IS '关联审批';
COMMENT ON COLUMN public.financial_records.source IS '来源';
COMMENT ON COLUMN public.financial_records.source_reference IS '来源凭证';
COMMENT ON COLUMN public.financial_records.source_payload IS '原始明细';
COMMENT ON COLUMN public.financial_records.ingestion_snapshot IS '同步状态';
COMMENT ON COLUMN public.financial_records.dimensions IS '自定义维度';
COMMENT ON COLUMN public.financial_records.tags IS '标签';
COMMENT ON COLUMN public.financial_records.alert_flags IS '预警标记';
COMMENT ON COLUMN public.financial_records.attachments IS '附件列表';
COMMENT ON COLUMN public.financial_records.created_by IS '创建人';
COMMENT ON COLUMN public.financial_records.updated_by IS '更新人';
COMMENT ON COLUMN public.financial_records.created_at IS '创建时间';
COMMENT ON COLUMN public.financial_records.updated_at IS '更新时间';
```
