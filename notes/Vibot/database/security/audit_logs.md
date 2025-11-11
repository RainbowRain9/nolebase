# public.audit_logs（审计事件）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 事件唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| actor_id | uuid | NULL REFERENCES users(id) | 操作者 |
| actor_type | varchar(20) | NOT NULL | 角色类型（user/service 等） |
| resource_type | varchar(50) | NOT NULL | 资源类型 |
| resource_id | uuid | NULL | 资源标识 |
| action | varchar(50) | NOT NULL | 动作 |
| trace_id | uuid | NULL | Trace 标识 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 上下文 |
| client_ip | inet | NULL | IP |
| user_agent | text | NULL | UA |
| occurred_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 发生时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- actor_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_audit_logs_company_id ON public.audit_logs(company_id);

## Row Level Security
```sql
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs readable within company"
    ON public.audit_logs
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.audit_viewer')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:audit_logs` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `audit_logs` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 事件唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    actor_id uuid NULL REFERENCES users(id) -- 操作者,
    actor_type varchar(20) NOT NULL -- 角色类型（user/service 等）,
    resource_type varchar(50) NOT NULL -- 资源类型,
    resource_id uuid NULL -- 资源标识,
    action varchar(50) NOT NULL -- 动作,
    trace_id uuid NULL -- Trace 标识,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 上下文,
    client_ip inet NULL -- IP,
    user_agent text NULL -- UA,
    occurred_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 发生时间
);
COMMENT ON TABLE public.audit_logs IS '审计事件';
COMMENT ON COLUMN public.audit_logs.id IS '事件唯一标识';
COMMENT ON COLUMN public.audit_logs.company_id IS '所属公司';
COMMENT ON COLUMN public.audit_logs.actor_id IS '操作者';
COMMENT ON COLUMN public.audit_logs.actor_type IS '角色类型（user/service 等）';
COMMENT ON COLUMN public.audit_logs.resource_type IS '资源类型';
COMMENT ON COLUMN public.audit_logs.resource_id IS '资源标识';
COMMENT ON COLUMN public.audit_logs.action IS '动作';
COMMENT ON COLUMN public.audit_logs.trace_id IS 'Trace 标识';
COMMENT ON COLUMN public.audit_logs.metadata IS '上下文';
COMMENT ON COLUMN public.audit_logs.client_ip IS 'IP';
COMMENT ON COLUMN public.audit_logs.user_agent IS 'UA';
COMMENT ON COLUMN public.audit_logs.occurred_at IS '发生时间';
```
