# public.approval_actions（审批动作）

> 记录每次审批操作的审计数据。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 动作唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 审批请求 |
| assignment_id | uuid | NULL REFERENCES approval_request_assignments(id) ON DELETE SET NULL | 原待办 |
| actor_id | uuid | NOT NULL REFERENCES users(id) | 操作人 |
| action_type | varchar(20) | NOT NULL CHECK (action_type IN ('approve','reject','transfer','add_sign','comment','recall')) | 动作类型 |
| action_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加信息 |
| previous_state | jsonb | NOT NULL DEFAULT '{}'::jsonb | 操作前快照 |
| next_state | jsonb | NOT NULL DEFAULT '{}'::jsonb | 操作后快照 |
| ip_address | inet | NULL | IP |
| user_agent | text | NULL | 客户端信息 |
| created_at | timestamptz | NOT NULL DEFAULT NOW() | 创建时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- request_id → approval_requests(id) ON DELETE CASCADE
- assignment_id → approval_request_assignments(id) ON DELETE SET NULL
- actor_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_actions_company_id ON public.approval_actions(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_actions` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_actions` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_actions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 动作唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    request_id uuid NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE -- 审批请求,
    assignment_id uuid NULL REFERENCES approval_request_assignments(id) ON DELETE SET NULL -- 原待办,
    actor_id uuid NOT NULL REFERENCES users(id) -- 操作人,
    action_type varchar(20) NOT NULL CHECK (action_type IN ('approve','reject','transfer','add_sign','comment','recall')) -- 动作类型,
    action_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 附加信息,
    previous_state jsonb NOT NULL DEFAULT '{}'::jsonb -- 操作前快照,
    next_state jsonb NOT NULL DEFAULT '{}'::jsonb -- 操作后快照,
    ip_address inet NULL -- IP,
    user_agent text NULL -- 客户端信息,
    created_at timestamptz NOT NULL DEFAULT NOW() -- 创建时间
);
COMMENT ON TABLE public.approval_actions IS '记录每次审批操作的审计数据。';
COMMENT ON COLUMN public.approval_actions.id IS '动作唯一标识';
COMMENT ON COLUMN public.approval_actions.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_actions.request_id IS '审批请求';
COMMENT ON COLUMN public.approval_actions.assignment_id IS '原待办';
COMMENT ON COLUMN public.approval_actions.actor_id IS '操作人';
COMMENT ON COLUMN public.approval_actions.action_type IS '动作类型';
COMMENT ON COLUMN public.approval_actions.action_payload IS '附加信息';
COMMENT ON COLUMN public.approval_actions.previous_state IS '操作前快照';
COMMENT ON COLUMN public.approval_actions.next_state IS '操作后快照';
COMMENT ON COLUMN public.approval_actions.ip_address IS 'IP';
COMMENT ON COLUMN public.approval_actions.user_agent IS '客户端信息';
COMMENT ON COLUMN public.approval_actions.created_at IS '创建时间';
```
