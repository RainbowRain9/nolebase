# employee_histories

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 历史记录ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 员工 |
| change_type | varchar(50) | NOT NULL CHECK (change_type IN ('position','department','salary','status','location','manager')) | 变更类型 |
| old_value | jsonb | NULL | 变更前值 |
| new_value | jsonb | NULL | 变更后值 |
| effective_date | date | NOT NULL | 生效日期 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 对应审批单 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 记录时间 |
| created_by | uuid | NULL REFERENCES users(id) | 记录人 |

**Relationships**
- 支持审计与回溯
