# ai_conversations

**摘要**：AI 协作会话主记录，涵盖上下文与关联资源。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 会话唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 发起人 |
| topic | varchar(255) | NOT NULL | 主题 |
| conversation_type | varchar(30) | NOT NULL DEFAULT 'assistant' | 会话类型 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 会话状态 |
| context | jsonb | NOT NULL DEFAULT '{}'::jsonb | 上下文存档 |
| linked_resources | jsonb | NOT NULL DEFAULT '{}'::jsonb | 外部关联 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| last_message_at | timestamptz | NULL | 最近消息时间 |

## JSON 字段
- `context`：保存提示词、系统设定、输入快照。
- `linked_resources`：关联项目、审批、订单、财务记录等 ID。

## 索引与约束
- INDEX idx_ai_conversations_owner (company_id, owner_id)
- GIN (context)

## 关系
- 多对一 -> users.id
- 一对多 -> ai_conversation_messages.conversation_id
- 一对多 -> employee_efficiency_metrics.conversation_id

## 设计权衡
统一管理上下文，利于追溯但需控制 JSON 字段大小以降低存储成本。
