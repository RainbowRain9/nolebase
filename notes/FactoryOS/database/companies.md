# companies

**摘要**：多租户单位的主数据及默认配置。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 公司唯一标识 |
| code | varchar(32) | NOT NULL UNIQUE | 公司编码 |
| name | varchar(255) | NOT NULL | 公司名称 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')) | 公司状态 |
| timezone | varchar(50) | NULL | 默认时区 |
| locale | varchar(10) | NOT NULL DEFAULT 'zh-CN' | 默认语言 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 企业扩展配置 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `metadata`：企业自定义配置（主题、Logo、AI 配额等）。

## 索引与约束
- UNIQUE (code)
- INDEX idx_companies_status (status)
- GIN (metadata)

## 关系
- 一对多 -> departments.company_id
- 一对多 -> users.company_id
- 一对多 -> customers.company_id
- 一对多 -> orders.company_id
- 一对多 -> work_orders.company_id
- 一对多 -> financial_records.company_id

## 设计权衡
把多租户参数集中在 metadata，避免频繁 DDL，但需要服务层做结构校验。
