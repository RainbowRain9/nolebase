# ai_conversation_messages

**摘要**：AI 会话中的具体消息与模型响应。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 消息唯一标识 |
| conversation_id | uuid | NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE | 所属会话 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| sequence | bigint | NOT NULL | 顺序号 |
| sender_type | varchar(20) | NOT NULL | 发送方类型 |
| sender_id | uuid | NULL | 发送方标识 |
| role | varchar(20) | NOT NULL | 消息角色 |
| content | text | NOT NULL | 消息内容 |
| token_usage | jsonb | NOT NULL DEFAULT '{}'::jsonb | Token 消耗 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 模型及参数 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## JSON 字段
- `token_usage`：记录 prompt/completion token 消耗。
- `metadata`：包含模型、温度、参考消息等信息。

## 索引与约束
- UNIQUE (conversation_id, sequence)
- GIN (metadata)

## 关系
- 多对一 -> ai_conversations.id

## 设计权衡
保留全文内容便于回放，但需结合存储策略定期归档历史会话。
