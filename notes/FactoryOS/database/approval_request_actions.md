# approval_request_actions

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 操作记录ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 审批单 |
| step_id | uuid | NULL REFERENCES approval_request_steps(id) ON DELETE SET NULL | 对应节点实例 |
| actor_id | uuid | NULL REFERENCES users(id) | 操作者（系统动作可为空） |
| action_type | varchar(30) | NOT NULL CHECK (action_type IN ('submit','approve','reject','withdraw','delegate','consign','urge','auto_transition','comment')) | 操作类型 |
| action_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 操作详情（意见、转办对象） |
| previous_status | varchar(30) | NULL | 操作前状态 |
| new_status | varchar(30) | NULL | 操作后状态 |
| performed_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 操作时间 |
| performed_via | varchar(30) | NOT NULL DEFAULT 'web' CHECK (performed_via IN ('web','mobile','conversation','api')) | 操作渠道 |
| audit_trace_id | uuid | NULL | 审计追踪ID |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 记录创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `approval_requests`、`approval_request_steps`
- 支撑审计导出
