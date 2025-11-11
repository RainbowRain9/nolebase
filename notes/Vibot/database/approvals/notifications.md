# public.notifications（通知记录）

> 记录审批、SLA、系统提醒的发送与阅读状态。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 通知唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| recipient_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 接收人 |
| channel | varchar(20) | NOT NULL CHECK (channel IN ('inbox','email','dingtalk','sms','webhook')) | 渠道 |
| category | varchar(30) | NOT NULL | 分类（approval、sla 等） |
| payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 内容载荷 |
| related_request_id | uuid | NULL REFERENCES approval_requests(id) ON DELETE SET NULL | 关联审批 |
| delivery_status | varchar(20) | NOT NULL DEFAULT 'pending' | 投递状态 |
| error_message | text | NULL | 失败原因 |
| sent_at | timestamptz | NULL | 发送时间 |
| read_at | timestamptz | NULL | 阅读时间 |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | 创建时间 |

## 设计权衡
**设计权衡**：通知记录作为审计友好的事件表，与渠道配置表解耦，便于重试和多渠道投递。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- recipient_id → users(id) ON DELETE CASCADE
- related_request_id → approval_requests(id) ON DELETE SET NULL

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_notifications_company_id ON public.notifications(company_id);

## Row Level Security
```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notifications readable by recipient"
    ON public.notifications
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        recipient_id = auth.uid()
        OR has_role('Vibot.admin')
        OR has_role('Vibot.notification_admin')
      )
    );

CREATE POLICY "Notifications insertable by engines"
    ON public.notifications
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.notification_admin')
        OR has_role('Vibot.approval_engine')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:notifications` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `notifications` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 通知唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE -- 接收人,
    channel varchar(20) NOT NULL CHECK (channel IN ('inbox','email','dingtalk','sms','webhook')) -- 渠道,
    category varchar(30) NOT NULL -- 分类（approval、sla 等）,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 内容载荷,
    related_request_id uuid NULL REFERENCES approval_requests(id) ON DELETE SET NULL -- 关联审批,
    delivery_status varchar(20) NOT NULL DEFAULT 'pending' -- 投递状态,
    error_message text NULL -- 失败原因,
    sent_at timestamptz NULL -- 发送时间,
    read_at timestamptz NULL -- 阅读时间,
    created_at timestamptz NOT NULL DEFAULT NOW() -- 创建时间
);
COMMENT ON TABLE public.notifications IS '记录审批、SLA、系统提醒的发送与阅读状态。';
COMMENT ON COLUMN public.notifications.id IS '通知唯一标识';
COMMENT ON COLUMN public.notifications.company_id IS '所属公司';
COMMENT ON COLUMN public.notifications.recipient_id IS '接收人';
COMMENT ON COLUMN public.notifications.channel IS '渠道';
COMMENT ON COLUMN public.notifications.category IS '分类（approval、sla 等）';
COMMENT ON COLUMN public.notifications.payload IS '内容载荷';
COMMENT ON COLUMN public.notifications.related_request_id IS '关联审批';
COMMENT ON COLUMN public.notifications.delivery_status IS '投递状态';
COMMENT ON COLUMN public.notifications.error_message IS '失败原因';
COMMENT ON COLUMN public.notifications.sent_at IS '发送时间';
COMMENT ON COLUMN public.notifications.read_at IS '阅读时间';
COMMENT ON COLUMN public.notifications.created_at IS '创建时间';
```
