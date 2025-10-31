# procurement_records

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 采购记录ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| supplier_name | varchar(200) | NOT NULL | 供应商名称 |
| supplier_code | varchar(100) | NULL | 供应商编码 |
| material_code | varchar(100) | NULL | 物料编码 |
| material_name | varchar(200) | NULL | 物料名称 |
| category | varchar(100) | NULL | 采购类别 |
| order_date | date | NOT NULL | 下单日期 |
| delivery_date | date | NULL | 交付日期 |
| quantity | numeric(18,4) | NULL | 数量 |
| unit_price | numeric(18,4) | NULL | 单价 |
| amount | numeric(18,2) | NOT NULL | 金额 |
| currency | varchar(10) | NOT NULL DEFAULT 'CNY' | 币种 |
| source_record | jsonb | NOT NULL DEFAULT '{}'::jsonb | 来源凭证信息 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联审批单 |
| project_id | uuid | NULL REFERENCES projects(id) | 关联项目 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加信息（合同比例、评分） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 支撑历史采购对比与预警
