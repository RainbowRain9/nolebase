# employee_histories

**摘要**：员工关键事件的历史轨迹。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| employee_id | uuid | NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE | 员工档案 |
| change_type | varchar(50) | NOT NULL | 变更类型 |
| effective_at | timestamptz | NOT NULL | 生效时间 |
| change_summary | text | NULL | 摘要 |
| payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 变更详情 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联审批 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 记录人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## JSON 字段
- `payload`：记录薪酬调整、岗位调动等详细数据。

## 索引与约束
- INDEX idx_employee_histories_type (company_id, change_type)
- GIN (payload)

## 关系
- 多对一 -> employee_records.id
- 多对一 -> approval_requests.id

## 设计权衡
payload 承接多类型历史，减少专用表，但针对特定字段的统计需要 JSON 索引优化。
