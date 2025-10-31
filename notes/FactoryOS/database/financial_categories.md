# financial_categories

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 分类ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| parent_id | uuid | NULL REFERENCES financial_categories(id) ON DELETE SET NULL | 父分类 |
| name | varchar(150) | NOT NULL | 分类名称 |
| code | varchar(100) | NOT NULL | 分类编码（公司内唯一） |
| type | varchar(20) | NOT NULL CHECK (type IN ('income','expense')) | 分类类型 |
| level | integer | NOT NULL DEFAULT 1 | 层级 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加属性（成本中心、税率） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (company_id, code)

**Relationships**
- 与 `financial_records` 多对一
