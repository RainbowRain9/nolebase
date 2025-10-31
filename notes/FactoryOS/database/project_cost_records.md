# project_cost_records

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 成本记录ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目ID |
| task_id | uuid | NULL REFERENCES project_tasks(id) ON DELETE SET NULL | 关联任务 |
| cost_category | varchar(30) | NOT NULL CHECK (cost_category IN ('labor','material','equipment','other')) | 成本分类 |
| cost_type | varchar(20) | NOT NULL CHECK (cost_type IN ('budget','actual','forecast')) | 成本类型 |
| amount | numeric(18,2) | NOT NULL | 金额 |
| currency | varchar(10) | NOT NULL DEFAULT 'CNY' | 币种 |
| incurred_on | date | NOT NULL | 发生日期 |
| vendor | varchar(200) | NULL | 供应商/承包商 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联审批单 |
| source_reference | jsonb | NOT NULL DEFAULT '{}'::jsonb | 来源数据（凭证ID、外部系统） |
| notes | text | NULL | 备注 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `projects`、`project_tasks`
- 可联动 `financial_records`
