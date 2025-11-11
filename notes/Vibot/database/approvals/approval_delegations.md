# public.approval_delegations（审批委派）

> 跟踪转交与加签链路。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 委派唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) | 审批请求 |
| from_assignment_id | uuid | NOT NULL REFERENCES approval_request_assignments(id) | 原待办 |
| to_user_id | uuid | NOT NULL REFERENCES users(id) | 目标审批人 |
| delegation_type | varchar(20) | NOT NULL CHECK (delegation_type IN ('transfer','add_sign')) | 委派类型 |
| effective_at | timestamptz | NOT NULL DEFAULT NOW() | 生效时间 |
| expires_at | timestamptz | NULL | 失效时间 |
| reason | text | NULL | 原因 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- request_id → approval_requests(id)
- from_assignment_id → approval_request_assignments(id)
- to_user_id → users(id)
- created_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_delegations_company_id ON public.approval_delegations(company_id);

## Row Level Security
```sql
-- TODO: add RLS policies
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_delegations` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_delegations` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_delegations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 委派唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    request_id uuid NOT NULL REFERENCES approval_requests(id) -- 审批请求,
    from_assignment_id uuid NOT NULL REFERENCES approval_request_assignments(id) -- 原待办,
    to_user_id uuid NOT NULL REFERENCES users(id) -- 目标审批人,
    delegation_type varchar(20) NOT NULL CHECK (delegation_type IN ('transfer','add_sign')) -- 委派类型,
    effective_at timestamptz NOT NULL DEFAULT NOW() -- 生效时间,
    expires_at timestamptz NULL -- 失效时间,
    reason text NULL -- 原因,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展信息,
    created_by uuid NULL REFERENCES users(id) -- 创建人
);
COMMENT ON TABLE public.approval_delegations IS '跟踪转交与加签链路。';
COMMENT ON COLUMN public.approval_delegations.id IS '委派唯一标识';
COMMENT ON COLUMN public.approval_delegations.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_delegations.request_id IS '审批请求';
COMMENT ON COLUMN public.approval_delegations.from_assignment_id IS '原待办';
COMMENT ON COLUMN public.approval_delegations.to_user_id IS '目标审批人';
COMMENT ON COLUMN public.approval_delegations.delegation_type IS '委派类型';
COMMENT ON COLUMN public.approval_delegations.effective_at IS '生效时间';
COMMENT ON COLUMN public.approval_delegations.expires_at IS '失效时间';
COMMENT ON COLUMN public.approval_delegations.reason IS '原因';
COMMENT ON COLUMN public.approval_delegations.metadata IS '扩展信息';
COMMENT ON COLUMN public.approval_delegations.created_by IS '创建人';
```
