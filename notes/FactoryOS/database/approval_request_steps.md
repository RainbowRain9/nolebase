# approval_request_steps

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 流程节点实例ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 审批单 |
| node_id | uuid | NOT NULL REFERENCES approval_nodes(id) | 定义节点 |
| step_order | integer | NOT NULL | 执行顺序 |
| assignee_id | uuid | NULL REFERENCES users(id) | 指定审批人 |
| assignee_role | varchar(100) | NULL | 指定角色（动态指派） |
| status | varchar(20) | NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','returned','delegated','skipped')) | 状态 |
| assigned_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 指派时间 |
| acted_at | timestamptz | NULL | 处理时间 |
| deadline_at | timestamptz | NULL | 截止时间（根据 SLA） |
| consignees | jsonb | NOT NULL DEFAULT '[]'::jsonb | 加签/转办人员列表 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加信息（意见、自定义字段） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `approval_request_actions`
