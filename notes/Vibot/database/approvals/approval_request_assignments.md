# public.approval_request_assignments（审批待办索引）

> 审批待办的扁平索引，提升按人员查询效率。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 审批单 |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE | 所属流程 |
| stage_key | varchar(100) | NOT NULL | 当前节点 |
| assignee_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 处理人 |
| role_type | varchar(20) | NOT NULL | 角色类型 |
| assignment_type | varchar(20) | NOT NULL DEFAULT 'primary' | 任务分类（primary/cc/escalation） |
| assignment_state | varchar(20) | NOT NULL DEFAULT 'pending' | 任务状态 |
| due_at | timestamptz | NULL | 到期时间 |
| completed_at | timestamptz | NULL | 完成时间 |
| reminder_state | jsonb | NOT NULL DEFAULT '{}'::jsonb | 提醒信息 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展字段 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：通过索引表换取按人检索效率，并显式记录 `workflow_id`/`stage_key` 便于 SLA、路由和广播触发，需配合触发器保持与审批单 JSON 同步。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- request_id → approval_requests(id) ON DELETE CASCADE
- workflow_id → approval_workflows(id) ON DELETE CASCADE
- assignee_id → users(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_request_assignments_company_id ON public.approval_request_assignments(company_id);

## Row Level Security
```sql
ALTER TABLE public.approval_request_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approval assignments visible to assignee"
    ON public.approval_request_assignments
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1
        FROM public.approval_requests ar
        WHERE ar.id = approval_request_assignments.request_id
          AND ar.company_id = current_company_id()
      )
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
        OR assignee_id = auth.uid()
      )
    );

CREATE POLICY "Approval assignments managed by approver"
    ON public.approval_request_assignments
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.approval_requests ar
        WHERE ar.id = approval_request_assignments.request_id
          AND ar.company_id = current_company_id()
      )
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.approval_requests ar
        WHERE ar.id = approval_request_assignments.request_id
          AND ar.company_id = current_company_id()
      )
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
      )
    );

CREATE POLICY "Approval assignments inserted by workflow"
    ON public.approval_request_assignments
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.approval_requests ar
        WHERE ar.id = approval_request_assignments.request_id
          AND ar.company_id = current_company_id()
      )
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
      )
    );

CREATE POLICY "Approval assignments deletable by admin"
    ON public.approval_request_assignments
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.approval_requests ar
        WHERE ar.id = approval_request_assignments.request_id
          AND ar.company_id = current_company_id()
      )
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_request_assignments` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_request_assignments` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_request_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    request_id uuid NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE -- 审批单,
    workflow_id uuid NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE -- 所属流程,
    stage_key varchar(100) NOT NULL -- 当前节点,
    assignee_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE -- 处理人,
    role_type varchar(20) NOT NULL -- 角色类型,
    assignment_type varchar(20) NOT NULL DEFAULT 'primary' -- 任务分类（primary/cc/escalation）,
    assignment_state varchar(20) NOT NULL DEFAULT 'pending' -- 任务状态,
    due_at timestamptz NULL -- 到期时间,
    completed_at timestamptz NULL -- 完成时间,
    reminder_state jsonb NOT NULL DEFAULT '{}'::jsonb -- 提醒信息,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展字段,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.approval_request_assignments IS '审批待办的扁平索引，提升按人员查询效率。';
COMMENT ON COLUMN public.approval_request_assignments.id IS '记录唯一标识';
COMMENT ON COLUMN public.approval_request_assignments.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_request_assignments.request_id IS '审批单';
COMMENT ON COLUMN public.approval_request_assignments.workflow_id IS '所属流程';
COMMENT ON COLUMN public.approval_request_assignments.stage_key IS '当前节点';
COMMENT ON COLUMN public.approval_request_assignments.assignee_id IS '处理人';
COMMENT ON COLUMN public.approval_request_assignments.role_type IS '角色类型';
COMMENT ON COLUMN public.approval_request_assignments.assignment_type IS '任务分类（primary/cc/escalation）';
COMMENT ON COLUMN public.approval_request_assignments.assignment_state IS '任务状态';
COMMENT ON COLUMN public.approval_request_assignments.due_at IS '到期时间';
COMMENT ON COLUMN public.approval_request_assignments.completed_at IS '完成时间';
COMMENT ON COLUMN public.approval_request_assignments.reminder_state IS '提醒信息';
COMMENT ON COLUMN public.approval_request_assignments.metadata IS '扩展字段';
COMMENT ON COLUMN public.approval_request_assignments.created_at IS '创建时间';
COMMENT ON COLUMN public.approval_request_assignments.updated_at IS '更新时间';
```
