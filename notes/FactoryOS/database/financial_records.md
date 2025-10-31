# financial_records

**摘要**：统一的财务流水表，兼容采购、运费等多种场景。

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

## JSON 字段
- `source_payload`：合并采购、运费、报支等原始字段。
- `ingestion_snapshot`：记录数据源状态、批次、同步耗时。
- `dimensions`：灵活维度（成本中心、供应商、品类等）。
- `alert_flags`：存储触发的预警、阈值、处理记录。
- `attachments`：引用附件 ID 及展示元数据。

## 索引与约束
- UNIQUE (company_id, record_code)
- INDEX idx_financial_records_period (company_id, occurred_at)
- INDEX idx_financial_records_order (company_id, order_id)
- GIN (dimensions)
- GIN (alert_flags)

## 关系
- 多对一 -> orders.id
- 多对一 -> customers.id
- 多对一 -> approval_requests.id

## 设计权衡
历史运行、采购、预警信息全部进入 JSON，显著减少表数量，但报表需结合物化视图或外部仓库。
