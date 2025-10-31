# ai_conversation_messages

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 消息唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| conversation_id | uuid | NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE | 所属对话 |
| role | varchar(20) | NOT NULL CHECK (role IN ('user','assistant','tool')) | 消息角色 |
| content | text | NOT NULL | 消息内容 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表（引用 storage ids） |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 消息元数据（token、耗时等） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 消息时间 |
| created_by | uuid | NULL REFERENCES users(id) | 触发用户（assistant/tool 时可为空） |

**Relationships**
- 关联 `ai_conversations`
