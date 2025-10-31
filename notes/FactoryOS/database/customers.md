# customers

**摘要**：来源于付款单与运费申请的核心往来单位。

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

## JSON 字段
- `metadata`：可记录开票抬头、运输资质等扩展属性。

## 索引与约束
- UNIQUE (company_id, customer_code)
- INDEX idx_customers_type (company_id, customer_type)
- GIN (metadata)

## 关系
- 多对一 -> companies.id
- 一对多 -> orders.customer_id
- 一对多 -> financial_records.counterparty_id

## 设计权衡
把物流公司、供应商统一建模，减少表数量，但需通过 customer_type 区分业务流程。
