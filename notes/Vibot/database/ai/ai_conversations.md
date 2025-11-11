# public.ai_conversations（AI 会话）

> AI 协作会话主记录，涵盖上下文与关联资源。

## 字段定义
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

## 设计权衡
**设计权衡**：统一管理上下文，利于追溯但需控制 JSON 字段大小以降低存储成本。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- owner_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_ai_conversations_company_id ON public.ai_conversations(company_id);

## Row Level Security
```sql
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Conversations readable within company"
    ON public.ai_conversations
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        owner_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Conversations manageable by owners"
    ON public.ai_conversations
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (
        owner_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        owner_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:ai_conversations` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `ai_conversations` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 会话唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    owner_id uuid NOT NULL REFERENCES users(id) -- 发起人,
    topic varchar(255) NOT NULL -- 主题,
    conversation_type varchar(30) NOT NULL DEFAULT 'assistant' -- 会话类型,
    status varchar(20) NOT NULL DEFAULT 'active' -- 会话状态,
    context jsonb NOT NULL DEFAULT '{}'::jsonb -- 上下文存档,
    linked_resources jsonb NOT NULL DEFAULT '{}'::jsonb -- 外部关联,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间,
    last_message_at timestamptz NULL -- 最近消息时间
);
COMMENT ON TABLE public.ai_conversations IS 'AI 协作会话主记录，涵盖上下文与关联资源。';
COMMENT ON COLUMN public.ai_conversations.id IS '会话唯一标识';
COMMENT ON COLUMN public.ai_conversations.company_id IS '所属公司';
COMMENT ON COLUMN public.ai_conversations.owner_id IS '发起人';
COMMENT ON COLUMN public.ai_conversations.topic IS '主题';
COMMENT ON COLUMN public.ai_conversations.conversation_type IS '会话类型';
COMMENT ON COLUMN public.ai_conversations.status IS '会话状态';
COMMENT ON COLUMN public.ai_conversations.context IS '上下文存档';
COMMENT ON COLUMN public.ai_conversations.linked_resources IS '外部关联';
COMMENT ON COLUMN public.ai_conversations.created_at IS '创建时间';
COMMENT ON COLUMN public.ai_conversations.updated_at IS '更新时间';
COMMENT ON COLUMN public.ai_conversations.last_message_at IS '最近消息时间';
```
