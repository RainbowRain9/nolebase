# work_orders

**摘要**：对工序产量送检单的简化建模，聚焦产品、批号与工序产出。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 工单唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| work_order_code | varchar(50) | NOT NULL | 审批编号/工单号 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) ON DELETE SET NULL | 关联审批 |
| related_order_id | uuid | NULL REFERENCES orders(id) ON DELETE SET NULL | 关联订单 |
| product_id | uuid | NULL REFERENCES products(id) ON DELETE SET NULL | 关联产品 |
| product_name_snapshot | varchar(255) | NOT NULL | 当时的产品名称 |
| specification_snapshot | varchar(255) | NULL | 当时的规格 |
| batch_no | varchar(100) | NULL | 生产批号 |
| process_name | varchar(100) | NOT NULL | 加工工序 |
| next_process | varchar(100) | NULL | 下一道工序 |
| status | varchar(20) | NOT NULL DEFAULT 'in_progress' | 审批状态 |
| approval_status | varchar(20) | NOT NULL DEFAULT 'pending' | 审批结果 |
| metrics | jsonb | NOT NULL DEFAULT '{}'::jsonb | 产量及良品率指标 |
| duration_hours | numeric(10,2) | NULL | 本工序耗时（小时） |
| duration_details | jsonb | NOT NULL DEFAULT '[]'::jsonb | 耗时拆分 |
| operator_name | varchar(100) | NULL | 经办人 |
| work_date | date | NULL | 作业日期 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| remarks | text | NULL | 备注 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `metrics`：结构例如 {plan:{total:426, breakdown:[426,56]}, qualified:{total:426}, scrap:{material:0, process:0}}。
- `duration_details`：记录多段时间或上一工序耗时。
- `attachments`：存放送检单、现场图片。
- `metadata`：可扩展记录质检结果、设备编号等。

## 索引与约束
- UNIQUE (company_id, work_order_code)
- INDEX idx_work_orders_product (company_id, product_id)
- INDEX idx_work_orders_status (company_id, status)
- GIN (metrics)

## 关系
- 多对一 -> companies.id
- 多对一 -> products.id
- 多对一 -> approval_requests.id
- 多对一 -> orders.id

## 设计权衡
将多列拆分值揉成 JSON，显著减少子表，但后续要配合指标解析或物化视图做报表。
