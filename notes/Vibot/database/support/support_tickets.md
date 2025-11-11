# public.support_tickets（工单）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 工单唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| ticket_code | varchar(50) | NOT NULL | 工单编号 |
| requester_id | uuid | NOT NULL REFERENCES users(id) | 申请人 |
| subject | varchar(255) | NOT NULL | 主题 |
| category | varchar(30) | NOT NULL | 分类 |
| priority | varchar(20) | NOT NULL DEFAULT 'normal' | 优先级 |
| status | varchar(20) | NOT NULL DEFAULT 'open' | 状态 |
| assignee_id | uuid | NULL REFERENCES users(id) | 处理人 |
| context | jsonb | NOT NULL DEFAULT '{}'::jsonb | 诊断上下文 |
| resolution | jsonb | NOT NULL DEFAULT '{}'::jsonb | 解决记录 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| closed_at | timestamptz | NULL | 关闭时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- requester_id → users(id)
- assignee_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_support_tickets_company_id ON public.support_tickets(company_id);

## Row Level Security
```sql
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Support tickets readable to participants"
    ON public.support_tickets
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        requester_id = auth.uid()
        OR assignee_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Support tickets manageable by handler"
    ON public.support_tickets
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        requester_id = auth.uid()
        OR assignee_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        requester_id = auth.uid()
        OR assignee_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:support_tickets` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `support_tickets` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 工单唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    ticket_code varchar(50) NOT NULL -- 工单编号,
    requester_id uuid NOT NULL REFERENCES users(id) -- 申请人,
    subject varchar(255) NOT NULL -- 主题,
    category varchar(30) NOT NULL -- 分类,
    priority varchar(20) NOT NULL DEFAULT 'normal' -- 优先级,
    status varchar(20) NOT NULL DEFAULT 'open' -- 状态,
    assignee_id uuid NULL REFERENCES users(id) -- 处理人,
    context jsonb NOT NULL DEFAULT '{}'::jsonb -- 诊断上下文,
    resolution jsonb NOT NULL DEFAULT '{}'::jsonb -- 解决记录,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间,
    closed_at timestamptz NULL -- 关闭时间
);
COMMENT ON TABLE public.support_tickets IS '工单';
COMMENT ON COLUMN public.support_tickets.id IS '工单唯一标识';
COMMENT ON COLUMN public.support_tickets.company_id IS '所属公司';
COMMENT ON COLUMN public.support_tickets.ticket_code IS '工单编号';
COMMENT ON COLUMN public.support_tickets.requester_id IS '申请人';
COMMENT ON COLUMN public.support_tickets.subject IS '主题';
COMMENT ON COLUMN public.support_tickets.category IS '分类';
COMMENT ON COLUMN public.support_tickets.priority IS '优先级';
COMMENT ON COLUMN public.support_tickets.status IS '状态';
COMMENT ON COLUMN public.support_tickets.assignee_id IS '处理人';
COMMENT ON COLUMN public.support_tickets.context IS '诊断上下文';
COMMENT ON COLUMN public.support_tickets.resolution IS '解决记录';
COMMENT ON COLUMN public.support_tickets.created_at IS '创建时间';
COMMENT ON COLUMN public.support_tickets.updated_at IS '更新时间';
COMMENT ON COLUMN public.support_tickets.closed_at IS '关闭时间';
```
