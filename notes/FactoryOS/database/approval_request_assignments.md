# approval_request_assignments

**摘要**：审批待办的扁平索引，提升按人员查询效率。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 审批单 |
| assignee_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 处理人 |
| role_type | varchar(20) | NOT NULL | 角色类型 |
| assignment_state | varchar(20) | NOT NULL DEFAULT 'pending' | 任务状态 |
| due_at | timestamptz | NULL | 到期时间 |
| completed_at | timestamptz | NULL | 完成时间 |
| reminder_state | jsonb | NOT NULL DEFAULT '{}'::jsonb | 提醒信息 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展字段 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `reminder_state`：记录提醒次数、渠道与最近提醒时间。
- `metadata`：扩展字段（如委托来源）。

## 索引与约束
- UNIQUE (request_id, assignee_id, role_type)
- INDEX idx_approval_assignments_user_state (company_id, assignee_id, assignment_state)

## 关系
- 多对一 -> approval_requests.id
- 多对一 -> users.id

## 设计权衡
通过索引表换取按人检索效率，但需与审批单 JSON 保持强一致，可用触发器或事务保障。
