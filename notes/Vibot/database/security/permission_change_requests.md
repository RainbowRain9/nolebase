# public.permission_change_requests（权限变更请求）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 请求唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| requester_id | uuid | NOT NULL REFERENCES users(id) | 申请人 |
| target_user_id | uuid | NOT NULL REFERENCES users(id) | 目标用户 |
| diff | jsonb | NOT NULL DEFAULT '{}'::jsonb | 拟变更内容 |
| status | varchar(20) | NOT NULL DEFAULT 'pending' | 状态 |
| approval_flow | jsonb | NOT NULL DEFAULT '[]'::jsonb | 审批链 |
| decided_at | timestamptz | NULL | 决策时间 |
| decision_by | uuid | NULL REFERENCES users(id) | 审批人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 提交时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- requester_id → users(id)
- target_user_id → users(id)
- decision_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_permission_change_requests_company_id ON public.permission_change_requests(company_id);

## Row Level Security
```sql
ALTER TABLE public.permission_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permission change requests readable within company"
    ON public.permission_change_requests
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        requester_id = auth.uid()
        OR target_user_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Permission change requests manageable by admins"
    ON public.permission_change_requests
    FOR ALL
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    )
    WITH CHECK (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:permission_change_requests` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `permission_change_requests` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.permission_change_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 请求唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    requester_id uuid NOT NULL REFERENCES users(id) -- 申请人,
    target_user_id uuid NOT NULL REFERENCES users(id) -- 目标用户,
    diff jsonb NOT NULL DEFAULT '{}'::jsonb -- 拟变更内容,
    status varchar(20) NOT NULL DEFAULT 'pending' -- 状态,
    approval_flow jsonb NOT NULL DEFAULT '[]'::jsonb -- 审批链,
    decided_at timestamptz NULL -- 决策时间,
    decision_by uuid NULL REFERENCES users(id) -- 审批人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 提交时间
);
COMMENT ON TABLE public.permission_change_requests IS '权限变更请求';
COMMENT ON COLUMN public.permission_change_requests.id IS '请求唯一标识';
COMMENT ON COLUMN public.permission_change_requests.company_id IS '所属公司';
COMMENT ON COLUMN public.permission_change_requests.requester_id IS '申请人';
COMMENT ON COLUMN public.permission_change_requests.target_user_id IS '目标用户';
COMMENT ON COLUMN public.permission_change_requests.diff IS '拟变更内容';
COMMENT ON COLUMN public.permission_change_requests.status IS '状态';
COMMENT ON COLUMN public.permission_change_requests.approval_flow IS '审批链';
COMMENT ON COLUMN public.permission_change_requests.decided_at IS '决策时间';
COMMENT ON COLUMN public.permission_change_requests.decision_by IS '审批人';
COMMENT ON COLUMN public.permission_change_requests.created_at IS '提交时间';
```
