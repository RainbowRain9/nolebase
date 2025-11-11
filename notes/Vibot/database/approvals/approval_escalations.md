# public.approval_escalations（审批升级队列）

> 为超期提醒、自动升级提供追踪。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 升级唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| assignment_id | uuid | NOT NULL REFERENCES approval_request_assignments(id) ON DELETE CASCADE | 关联待办 |
| escalation_state | varchar(20) | NOT NULL CHECK (escalation_state IN ('queued','sent','acknowledged','auto_delegated')) | 状态 |
| last_sent_at | timestamptz | NULL | 最近发送时间 |
| target_user_id | uuid | NULL REFERENCES users(id) | 升级对象 |
| channel_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 渠道配置 |
| retry_count | integer | NOT NULL DEFAULT 0 | 重试次数 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT NOW() | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- assignment_id → approval_request_assignments(id) ON DELETE CASCADE
- target_user_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_escalations_company_id ON public.approval_escalations(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_escalations` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_escalations` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_escalations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 升级唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    assignment_id uuid NOT NULL REFERENCES approval_request_assignments(id) ON DELETE CASCADE -- 关联待办,
    escalation_state varchar(20) NOT NULL CHECK (escalation_state IN ('queued','sent','acknowledged','auto_delegated')) -- 状态,
    last_sent_at timestamptz NULL -- 最近发送时间,
    target_user_id uuid NULL REFERENCES users(id) -- 升级对象,
    channel_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 渠道配置,
    retry_count integer NOT NULL DEFAULT 0 -- 重试次数,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展信息,
    created_at timestamptz NOT NULL DEFAULT NOW() -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT NOW() -- 更新时间
);
COMMENT ON TABLE public.approval_escalations IS '为超期提醒、自动升级提供追踪。';
COMMENT ON COLUMN public.approval_escalations.id IS '升级唯一标识';
COMMENT ON COLUMN public.approval_escalations.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_escalations.assignment_id IS '关联待办';
COMMENT ON COLUMN public.approval_escalations.escalation_state IS '状态';
COMMENT ON COLUMN public.approval_escalations.last_sent_at IS '最近发送时间';
COMMENT ON COLUMN public.approval_escalations.target_user_id IS '升级对象';
COMMENT ON COLUMN public.approval_escalations.channel_payload IS '渠道配置';
COMMENT ON COLUMN public.approval_escalations.retry_count IS '重试次数';
COMMENT ON COLUMN public.approval_escalations.metadata IS '扩展信息';
COMMENT ON COLUMN public.approval_escalations.created_at IS '创建时间';
COMMENT ON COLUMN public.approval_escalations.updated_at IS '更新时间';
```
