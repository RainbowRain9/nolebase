# products

**摘要**：基于工序产量单抽象出的可生产或交付的产品定义。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 产品唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| product_code | varchar(100) | NOT NULL | 产品编码或物料号 |
| name | varchar(255) | NOT NULL | 产品名称 |
| specification | varchar(255) | NULL | 规格/型号 |
| product_type | varchar(50) | NOT NULL DEFAULT 'component' | 分类 |
| unit | varchar(20) | NOT NULL DEFAULT '件' | 计量单位 |
| default_process_flow | jsonb | NOT NULL DEFAULT '{}'::jsonb | 默认工序流程 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| is_active | boolean | NOT NULL DEFAULT true | 是否启用 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `default_process_flow`：保存标准工序序列及节拍，用于与工序产量对比。
- `metadata`：记录BOM、质检等级等扩展属性。

## 索引与约束
- UNIQUE (company_id, product_code)
- INDEX idx_products_name (company_id, name)
- GIN (metadata)

## 关系
- 多对一 -> companies.id
- 一对多 -> work_orders.product_id
- 逻辑关联 -> orders.line_items (JSON)

## 设计权衡
产品规格差异大，通过 JSON 保存流程，避免为每种工艺建立子表，但标准化校验需在应用层完成。
