# public.notification_channels（用户通知渠道）

> 持久化钉钉、邮件、App 推送配置。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 渠道唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 用户 |
| channel_type | varchar(20) | NOT NULL CHECK (channel_type IN ('dingtalk','email','app','webhook')) | 通道类型 |
| is_enabled | boolean | NOT NULL DEFAULT true | 是否启用 |
| config | jsonb | NOT NULL DEFAULT '{}'::jsonb | 配置内容 |
| last_verified_at | timestamptz | NULL | 校验时间 |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- user_id → users(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_notification_channels_company_id ON public.notification_channels(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:notification_channels` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `notification_channels` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.notification_channels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 渠道唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE -- 用户,
    channel_type varchar(20) NOT NULL CHECK (channel_type IN ('dingtalk','email','app','webhook')) -- 通道类型,
    is_enabled boolean NOT NULL DEFAULT true -- 是否启用,
    config jsonb NOT NULL DEFAULT '{}'::jsonb -- 配置内容,
    last_verified_at timestamptz NULL -- 校验时间,
    created_at timestamptz NOT NULL DEFAULT NOW() -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT NOW() -- 更新时间
);
COMMENT ON TABLE public.notification_channels IS '持久化钉钉、邮件、App 推送配置。';
COMMENT ON COLUMN public.notification_channels.id IS '渠道唯一标识';
COMMENT ON COLUMN public.notification_channels.company_id IS '所属公司';
COMMENT ON COLUMN public.notification_channels.user_id IS '用户';
COMMENT ON COLUMN public.notification_channels.channel_type IS '通道类型';
COMMENT ON COLUMN public.notification_channels.is_enabled IS '是否启用';
COMMENT ON COLUMN public.notification_channels.config IS '配置内容';
COMMENT ON COLUMN public.notification_channels.last_verified_at IS '校验时间';
COMMENT ON COLUMN public.notification_channels.created_at IS '创建时间';
COMMENT ON COLUMN public.notification_channels.updated_at IS '更新时间';
```
