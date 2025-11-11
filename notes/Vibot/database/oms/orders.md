# public.orders（订单）

> 来自付款单和运费申请的最小可行订单模型，串联审批与财务。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 订单唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| order_code | varchar(50) | NOT NULL | 业务单号/审批编号 |
| order_type | varchar(30) | NOT NULL CHECK (order_type IN ('freight_payment','ap_payment','ar_refund','other')) | 订单类型 |
| order_status | varchar(20) | NOT NULL DEFAULT 'draft' | 业务状态 |
| approval_status | varchar(20) | NOT NULL DEFAULT 'pending' | 审批结果 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) ON DELETE SET NULL | 关联审批 |
| customer_id | uuid | NULL REFERENCES customers(id) ON DELETE SET NULL | 往来单位 |
| amount_total | numeric(18,2) | NOT NULL | 订单金额 |
| amount_total_uppercase | text | NULL | 金额大写 |
| tax_amount | numeric(18,2) | NULL | 税额 |
| currency | char(3) | NOT NULL DEFAULT 'CNY' | 币种 |
| payment_method | varchar(30) | NOT NULL DEFAULT 'transfer' | 付款方式 |
| payment_date | date | NULL | 计划或实际付款日 |
| payee_bank_name | varchar(255) | NULL | 收款开户行 |
| payee_bank_account | varchar(100) | NULL | 收款账号 |
| payee_account_name | varchar(255) | NULL | 收款账号户名 |
| invoice_status | varchar(30) | NOT NULL DEFAULT 'pending' | 开票状态 |
| has_invoice | boolean | NOT NULL DEFAULT false | 是否已有发票 |
| summary | text | NULL | 付款事由/摘要 |
| line_items | jsonb | NOT NULL DEFAULT '[]'::jsonb | 订单明细（来自审批表单） |
| source_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 原始审批记录快照 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：将审批单直接建模为订单，显著缩短上线周期，但订单行结构需通过 JSON 承载，统计时需借助物化视图。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- approval_request_id → approval_requests(id) ON DELETE SET NULL
- customer_id → customers(id) ON DELETE SET NULL
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_orders_company_id ON public.orders(company_id);

## Row Level Security
```sql
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 订单读取：同公司且满足角色或为创建者
CREATE POLICY "Orders readable within company"
    ON public.orders
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.finance_controller')
        OR has_role('Vibot.admin')
        OR created_by = auth.uid()
      )
    );

-- 订单创建：项目经理或财务可提交
CREATE POLICY "Orders creatable by project or finance"
    ON public.orders
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.finance_controller')
        OR has_role('Vibot.admin')
      )
    );

-- 订单更新：仅项目经理、财务或审批流程回写（通过函数内授权）
CREATE POLICY "Orders updatable by project or finance"
    ON public.orders
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.finance_controller')
        OR has_role('Vibot.admin')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.project_manager')
        OR has_role('Vibot.finance_controller')
        OR has_role('Vibot.admin')
      )
    );

-- 订单删除：严格限制为管理员（正常流程倾向软删除）
CREATE POLICY "Orders deletable by admin"
    ON public.orders
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:orders` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `orders` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 订单唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    order_code varchar(50) NOT NULL -- 业务单号/审批编号,
    order_type varchar(30) NOT NULL CHECK (order_type IN ('freight_payment','ap_payment','ar_refund','other')) -- 订单类型,
    order_status varchar(20) NOT NULL DEFAULT 'draft' -- 业务状态,
    approval_status varchar(20) NOT NULL DEFAULT 'pending' -- 审批结果,
    approval_request_id uuid NULL REFERENCES approval_requests(id) ON DELETE SET NULL -- 关联审批,
    customer_id uuid NULL REFERENCES customers(id) ON DELETE SET NULL -- 往来单位,
    amount_total numeric(18,2) NOT NULL -- 订单金额,
    amount_total_uppercase text NULL -- 金额大写,
    tax_amount numeric(18,2) NULL -- 税额,
    currency char(3) NOT NULL DEFAULT 'CNY' -- 币种,
    payment_method varchar(30) NOT NULL DEFAULT 'transfer' -- 付款方式,
    payment_date date NULL -- 计划或实际付款日,
    payee_bank_name varchar(255) NULL -- 收款开户行,
    payee_bank_account varchar(100) NULL -- 收款账号,
    payee_account_name varchar(255) NULL -- 收款账号户名,
    invoice_status varchar(30) NOT NULL DEFAULT 'pending' -- 开票状态,
    has_invoice boolean NOT NULL DEFAULT false -- 是否已有发票,
    summary text NULL -- 付款事由/摘要,
    line_items jsonb NOT NULL DEFAULT '[]'::jsonb -- 订单明细（来自审批表单）,
    source_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 原始审批记录快照,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb -- 附件列表,
    created_by uuid NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.orders IS '来自付款单和运费申请的最小可行订单模型，串联审批与财务。';
COMMENT ON COLUMN public.orders.id IS '订单唯一标识';
COMMENT ON COLUMN public.orders.company_id IS '所属公司';
COMMENT ON COLUMN public.orders.order_code IS '业务单号/审批编号';
COMMENT ON COLUMN public.orders.order_type IS '订单类型';
COMMENT ON COLUMN public.orders.order_status IS '业务状态';
COMMENT ON COLUMN public.orders.approval_status IS '审批结果';
COMMENT ON COLUMN public.orders.approval_request_id IS '关联审批';
COMMENT ON COLUMN public.orders.customer_id IS '往来单位';
COMMENT ON COLUMN public.orders.amount_total IS '订单金额';
COMMENT ON COLUMN public.orders.amount_total_uppercase IS '金额大写';
COMMENT ON COLUMN public.orders.tax_amount IS '税额';
COMMENT ON COLUMN public.orders.currency IS '币种';
COMMENT ON COLUMN public.orders.payment_method IS '付款方式';
COMMENT ON COLUMN public.orders.payment_date IS '计划或实际付款日';
COMMENT ON COLUMN public.orders.payee_bank_name IS '收款开户行';
COMMENT ON COLUMN public.orders.payee_bank_account IS '收款账号';
COMMENT ON COLUMN public.orders.payee_account_name IS '收款账号户名';
COMMENT ON COLUMN public.orders.invoice_status IS '开票状态';
COMMENT ON COLUMN public.orders.has_invoice IS '是否已有发票';
COMMENT ON COLUMN public.orders.summary IS '付款事由/摘要';
COMMENT ON COLUMN public.orders.line_items IS '订单明细（来自审批表单）';
COMMENT ON COLUMN public.orders.source_payload IS '原始审批记录快照';
COMMENT ON COLUMN public.orders.attachments IS '附件列表';
COMMENT ON COLUMN public.orders.created_by IS '创建人';
COMMENT ON COLUMN public.orders.updated_by IS '更新人';
COMMENT ON COLUMN public.orders.created_at IS '创建时间';
COMMENT ON COLUMN public.orders.updated_at IS '更新时间';
```
