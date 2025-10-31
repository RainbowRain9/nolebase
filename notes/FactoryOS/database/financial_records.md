# financial_records

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 财务记录ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| record_date | date | NOT NULL | 记账日期 |
| type | varchar(20) | NOT NULL CHECK (type IN ('income','expense','transfer')) | 财务类型 |
| category_id | uuid | NULL REFERENCES financial_categories(id) | 财务分类 |
| amount | numeric(18,2) | NOT NULL | 金额 |
| currency | varchar(10) | NOT NULL DEFAULT 'CNY' | 币种 |
| description | text | NULL | 描述 |
| source_system | varchar(50) | NOT NULL | 数据来源系统标识 |
| source_reference | jsonb | NOT NULL DEFAULT '{}'::jsonb | 外部凭证（库、表、主键） |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联审批单 |
| approved_by | uuid | NULL REFERENCES users(id) | 审批人 |
| approved_at | timestamptz | NULL | 审批时间 |
| status | varchar(20) | NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','archived')) | 当前状态 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加指标（税率、成本中心） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `financial_categories`
- 可链接 `projects`、`approval_requests`
