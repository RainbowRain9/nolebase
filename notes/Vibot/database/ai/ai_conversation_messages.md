# public.ai_conversation_messages（AI 会话消息）

> AI 会话中的具体消息与模型响应。

## 字段定义
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

## 设计权衡
**设计权衡**：保留全文内容便于回放，但需结合存储策略定期归档历史会话。

## 外键与引用完整性
- conversation_id → ai_conversations(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_ai_conversation_messages_company_id ON public.ai_conversation_messages(company_id);

## Row Level Security
```sql
ALTER TABLE public.ai_conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversation messages readable to participants"
    ON public.ai_conversation_messages
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1
        FROM public.ai_conversations ac
        WHERE ac.id = ai_conversation_messages.conversation_id
          AND ac.company_id = current_company_id()
          AND (
            ac.owner_id = auth.uid()
            OR has_role('Vibot.admin')
          )
      )
    );

CREATE POLICY "Conversation messages inserted by participants"
    ON public.ai_conversation_messages
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1
        FROM public.ai_conversations ac
        WHERE ac.id = ai_conversation_messages.conversation_id
          AND ac.company_id = current_company_id()
          AND (
            ac.owner_id = auth.uid()
            OR has_role('Vibot.admin')
          )
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:ai_conversation_messages` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `ai_conversation_messages` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.ai_conversation_messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 消息唯一标识,
    conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE -- 所属会话,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    sequence bigint NOT NULL -- 顺序号,
    sender_type varchar(20) NOT NULL -- 发送方类型,
    sender_id uuid NULL -- 发送方标识,
    role varchar(20) NOT NULL -- 消息角色,
    content text NOT NULL -- 消息内容,
    token_usage jsonb NOT NULL DEFAULT '{}'::jsonb -- Token 消耗,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 模型及参数,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.ai_conversation_messages IS 'AI 会话中的具体消息与模型响应。';
COMMENT ON COLUMN public.ai_conversation_messages.id IS '消息唯一标识';
COMMENT ON COLUMN public.ai_conversation_messages.conversation_id IS '所属会话';
COMMENT ON COLUMN public.ai_conversation_messages.company_id IS '所属公司';
COMMENT ON COLUMN public.ai_conversation_messages.sequence IS '顺序号';
COMMENT ON COLUMN public.ai_conversation_messages.sender_type IS '发送方类型';
COMMENT ON COLUMN public.ai_conversation_messages.sender_id IS '发送方标识';
COMMENT ON COLUMN public.ai_conversation_messages.role IS '消息角色';
COMMENT ON COLUMN public.ai_conversation_messages.content IS '消息内容';
COMMENT ON COLUMN public.ai_conversation_messages.token_usage IS 'Token 消耗';
COMMENT ON COLUMN public.ai_conversation_messages.metadata IS '模型及参数';
COMMENT ON COLUMN public.ai_conversation_messages.created_at IS '创建时间';
```
