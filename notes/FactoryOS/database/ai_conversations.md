# ai_conversations

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 会话唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 发起用户 |
| agent_type | varchar(50) | NOT NULL CHECK (agent_type IN ('document','video','finance','technical','legal','project','approval','hr')) | 代理类型 |
| session_id | varchar(200) | NOT NULL | Dify 会话标识 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')) | 会话状态 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 元数据（模型、来源、会话标签） |
| context | jsonb | NOT NULL DEFAULT '{}'::jsonb | 对话上下文变量 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人（默认同 user_id） |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 多个 `ai_conversation_messages`
- 关联 `users`、`companies`
