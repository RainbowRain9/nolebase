# approval_requests

**摘要**：审批实例及其流程执行轨迹，是订单与财务的粘合剂。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 审批唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) | 流程定义 |
| workflow_revision | integer | NOT NULL | 使用版本 |
| request_code | varchar(50) | NOT NULL | 审批编号 |
| title | varchar(255) | NOT NULL | 审批标题 |
| requester_id | uuid | NOT NULL REFERENCES users(id) | 发起人 |
| priority | varchar(20) | NOT NULL DEFAULT 'normal' | 优先级 |
| status | varchar(20) | NOT NULL DEFAULT 'draft' | 审批状态 |
| approval_result | varchar(20) | NOT NULL DEFAULT 'pending' | 审批结果 |
| current_stage | varchar(100) | NULL | 当前节点 |
| current_stage_started_at | timestamptz | NULL | 当前节点开始时间 |
| due_at | timestamptz | NULL | 到期时间 |
| submitted_at | timestamptz | NULL | 提交时间 |
| decided_at | timestamptz | NULL | 完成时间 |
| primary_order_id | uuid | NULL REFERENCES orders(id) ON DELETE SET NULL | 关联订单 |
| form_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 表单数据 |
| timeline | jsonb | NOT NULL DEFAULT '[]'::jsonb | 执行历史 |
| active_assignments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 当前待办 |
| linked_resources | jsonb | NOT NULL DEFAULT '{}'::jsonb | 外部关联 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| ai_assist_summary | jsonb | NOT NULL DEFAULT '{}'::jsonb | AI 辅助摘要 |
| conversation_id | uuid | NULL REFERENCES ai_conversations(id) | 关联会话 |
| result_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 最终结论 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| archived_at | timestamptz | NULL | 归档时间 |

## JSON 字段
- `form_payload`：动态表单数据，兼容历史字段。
- `timeline`：记录节点、操作人、动作、意见。
- `active_assignments`：当前待处理用户或角色列表。
- `linked_resources`：关联订单、财务记录、工单等 ID。
- `attachments`：引用附件及签名信息。
- `ai_assist_summary`：AI 自动总结与建议。
- `result_payload`：最终结论、原因、回退信息。

## 索引与约束
- UNIQUE (company_id, request_code)
- INDEX idx_approval_requests_status (company_id, status)
- GIN (form_payload)
- GIN (timeline)

## 关系
- 多对一 -> approval_workflows.id
- 多对一 -> users.id
- 多对一 -> orders.id
- 一对多 -> approval_request_assignments.request_id
- 一对多 -> financial_records.approval_request_id
- 一对多 -> work_orders.approval_request_id

## 设计权衡
步骤、动作聚合在 timeline JSON，极大降低表数量，但细粒度统计需依赖 JSON 索引或分析管道。
