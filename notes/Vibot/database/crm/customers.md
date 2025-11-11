# public.customers（客户/供应商）

> 来源于付款单与运费申请的核心往来单位。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 往来单位唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| customer_code | varchar(50) | NULL | 外部或第三方编码 |
| name | varchar(255) | NOT NULL | 名称 |
| customer_type | varchar(20) | NOT NULL CHECK (customer_type IN ('supplier','customer','logistics','employee','other')) | 类型 |
| tax_id | varchar(50) | NULL | 纳税识别号 |
| contact_name | varchar(100) | NULL | 联系人 |
| contact_phone | varchar(30) | NULL | 联系电话 |
| bank_account_name | varchar(255) | NULL | 收款账户名 |
| bank_name | varchar(255) | NULL | 开户行 |
| bank_account | varchar(100) | NULL | 银行账号 |
| address | varchar(255) | NULL | 地址 |
| payment_terms | varchar(100) | NULL | 付款条件 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 与 ERP 同步的额外字段 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：把物流公司、供应商统一建模，减少表数量，但需通过 customer_type 区分业务流程。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_customers_company_id ON public.customers(company_id);

## Row Level Security
```sql
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 同公司用户可读取往来单位资料
CREATE POLICY "Customers readable within company"
    ON public.customers
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.employee') OR has_role('Vibot.project_manager') OR has_role('Vibot.finance_controller') OR has_role('Vibot.admin'))
    );

-- 仅项目经理或财务可新增往来单位
CREATE POLICY "Customers creatable by managers or finance"
    ON public.customers
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.project_manager') OR has_role('Vibot.finance_controller') OR has_role('Vibot.admin'))
    );

-- 仅项目经理或财务可修改往来单位
CREATE POLICY "Customers updatable by managers or finance"
    ON public.customers
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.project_manager') OR has_role('Vibot.finance_controller') OR has_role('Vibot.admin'))
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.project_manager') OR has_role('Vibot.finance_controller') OR has_role('Vibot.admin'))
    );

-- 禁止普通用户删除往来单位，仅平台或公司管理员可执行
CREATE POLICY "Customers deletable by admins"
    ON public.customers
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:customers` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `customers` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.customers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 往来单位唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    customer_code varchar(50) NULL -- 外部或第三方编码,
    name varchar(255) NOT NULL -- 名称,
    customer_type varchar(20) NOT NULL CHECK (customer_type IN ('supplier','customer','logistics','employee','other')) -- 类型,
    tax_id varchar(50) NULL -- 纳税识别号,
    contact_name varchar(100) NULL -- 联系人,
    contact_phone varchar(30) NULL -- 联系电话,
    bank_account_name varchar(255) NULL -- 收款账户名,
    bank_name varchar(255) NULL -- 开户行,
    bank_account varchar(100) NULL -- 银行账号,
    address varchar(255) NULL -- 地址,
    payment_terms varchar(100) NULL -- 付款条件,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 与 ERP 同步的额外字段,
    created_by uuid NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.customers IS '来源于付款单与运费申请的核心往来单位。';
COMMENT ON COLUMN public.customers.id IS '往来单位唯一标识';
COMMENT ON COLUMN public.customers.company_id IS '所属公司';
COMMENT ON COLUMN public.customers.customer_code IS '外部或第三方编码';
COMMENT ON COLUMN public.customers.name IS '名称';
COMMENT ON COLUMN public.customers.customer_type IS '类型';
COMMENT ON COLUMN public.customers.tax_id IS '纳税识别号';
COMMENT ON COLUMN public.customers.contact_name IS '联系人';
COMMENT ON COLUMN public.customers.contact_phone IS '联系电话';
COMMENT ON COLUMN public.customers.bank_account_name IS '收款账户名';
COMMENT ON COLUMN public.customers.bank_name IS '开户行';
COMMENT ON COLUMN public.customers.bank_account IS '银行账号';
COMMENT ON COLUMN public.customers.address IS '地址';
COMMENT ON COLUMN public.customers.payment_terms IS '付款条件';
COMMENT ON COLUMN public.customers.metadata IS '与 ERP 同步的额外字段';
COMMENT ON COLUMN public.customers.created_by IS '创建人';
COMMENT ON COLUMN public.customers.updated_by IS '更新人';
COMMENT ON COLUMN public.customers.created_at IS '创建时间';
COMMENT ON COLUMN public.customers.updated_at IS '更新时间';
```
