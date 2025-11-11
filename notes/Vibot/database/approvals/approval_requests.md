# public.approval_requests（审批单）

> 审批实例及其流程执行轨迹，是订单与财务的粘合剂。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 审批唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) | 流程定义 |
| workflow_revision | integer | NOT NULL | 使用版本 |
| request_code | varchar(50) | NOT NULL | 审批编号 |
| title | varchar(255) | NOT NULL | 审批标题 |
| requester_id | uuid | NOT NULL REFERENCES users(id) | 发起人 |
| priority | varchar(20) | NOT NULL DEFAULT 'normal' | 优先级 |
| status | varchar(20) | NOT NULL DEFAULT 'draft' | 审批状态 |
| approval_result | varchar(20) | NOT NULL DEFAULT 'pending' | 审批结果 |
| current_stage | varchar(100) | NULL | 当前节点 |
| current_stage_started_at | timestamptz | NULL | 当前节点开始时间 |
| due_at | timestamptz | NULL | 到期时间 |
| submitted_at | timestamptz | NULL | 提交时间 |
| decided_at | timestamptz | NULL | 完成时间 |
| primary_order_id | uuid | NULL REFERENCES orders(id) ON DELETE SET NULL | 关联订单 |
| form_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 表单数据 |
| timeline | jsonb | NOT NULL DEFAULT '[]'::jsonb | 执行历史 |
| active_assignments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 当前待办 |
| linked_resources | jsonb | NOT NULL DEFAULT '{}'::jsonb | 外部关联 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| ai_assist_summary | jsonb | NOT NULL DEFAULT '{}'::jsonb | AI 辅助摘要 |
| conversation_id | uuid | NULL REFERENCES ai_conversations(id) | 关联会话 |
| result_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 最终结论 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| archived_at | timestamptz | NULL | 归档时间 |

## 设计权衡
**设计权衡**：步骤、动作聚合在 timeline JSON，极大降低表数量，但细粒度统计需依赖 JSON 索引或分析管道。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- workflow_id → approval_workflows(id)
- requester_id → users(id)
- primary_order_id → orders(id) ON DELETE SET NULL
- conversation_id → ai_conversations(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_requests_company_id ON public.approval_requests(company_id);

## Row Level Security
```sql
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approvals readable to participants"
    ON public.approval_requests
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
        OR requester_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.approval_request_assignments ara
          WHERE ara.request_id = approval_requests.id
            AND ara.assignee_id = auth.uid()
        )
      )
    );

CREATE POLICY "Approvals creatable by employees"
    ON public.approval_requests
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.employee')
        OR has_role('Vibot.approver')
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Approvals updatable by workflow actors"
    ON public.approval_requests
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
        OR requester_id = auth.uid()
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approver')
        OR requester_id = auth.uid()
      )
    );

CREATE POLICY "Approvals deletable by admin"
    ON public.approval_requests
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_requests` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_requests` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 审批唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    workflow_id uuid NOT NULL REFERENCES approval_workflows(id) -- 流程定义,
    workflow_revision integer NOT NULL -- 使用版本,
    request_code varchar(50) NOT NULL -- 审批编号,
    title varchar(255) NOT NULL -- 审批标题,
    requester_id uuid NOT NULL REFERENCES users(id) -- 发起人,
    priority varchar(20) NOT NULL DEFAULT 'normal' -- 优先级,
    status varchar(20) NOT NULL DEFAULT 'draft' -- 审批状态,
    approval_result varchar(20) NOT NULL DEFAULT 'pending' -- 审批结果,
    current_stage varchar(100) NULL -- 当前节点,
    current_stage_started_at timestamptz NULL -- 当前节点开始时间,
    due_at timestamptz NULL -- 到期时间,
    submitted_at timestamptz NULL -- 提交时间,
    decided_at timestamptz NULL -- 完成时间,
    primary_order_id uuid NULL REFERENCES orders(id) ON DELETE SET NULL -- 关联订单,
    form_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 表单数据,
    timeline jsonb NOT NULL DEFAULT '[]'::jsonb -- 执行历史,
    active_assignments jsonb NOT NULL DEFAULT '[]'::jsonb -- 当前待办,
    linked_resources jsonb NOT NULL DEFAULT '{}'::jsonb -- 外部关联,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb -- 附件列表,
    ai_assist_summary jsonb NOT NULL DEFAULT '{}'::jsonb -- AI 辅助摘要,
    conversation_id uuid NULL REFERENCES ai_conversations(id) -- 关联会话,
    result_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 最终结论,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间,
    archived_at timestamptz NULL -- 归档时间
);
COMMENT ON TABLE public.approval_requests IS '审批实例及其流程执行轨迹，是订单与财务的粘合剂。';
COMMENT ON COLUMN public.approval_requests.id IS '审批唯一标识';
COMMENT ON COLUMN public.approval_requests.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_requests.workflow_id IS '流程定义';
COMMENT ON COLUMN public.approval_requests.workflow_revision IS '使用版本';
COMMENT ON COLUMN public.approval_requests.request_code IS '审批编号';
COMMENT ON COLUMN public.approval_requests.title IS '审批标题';
COMMENT ON COLUMN public.approval_requests.requester_id IS '发起人';
COMMENT ON COLUMN public.approval_requests.priority IS '优先级';
COMMENT ON COLUMN public.approval_requests.status IS '审批状态';
COMMENT ON COLUMN public.approval_requests.approval_result IS '审批结果';
COMMENT ON COLUMN public.approval_requests.current_stage IS '当前节点';
COMMENT ON COLUMN public.approval_requests.current_stage_started_at IS '当前节点开始时间';
COMMENT ON COLUMN public.approval_requests.due_at IS '到期时间';
COMMENT ON COLUMN public.approval_requests.submitted_at IS '提交时间';
COMMENT ON COLUMN public.approval_requests.decided_at IS '完成时间';
COMMENT ON COLUMN public.approval_requests.primary_order_id IS '关联订单';
COMMENT ON COLUMN public.approval_requests.form_payload IS '表单数据';
COMMENT ON COLUMN public.approval_requests.timeline IS '执行历史';
COMMENT ON COLUMN public.approval_requests.active_assignments IS '当前待办';
COMMENT ON COLUMN public.approval_requests.linked_resources IS '外部关联';
COMMENT ON COLUMN public.approval_requests.attachments IS '附件列表';
COMMENT ON COLUMN public.approval_requests.ai_assist_summary IS 'AI 辅助摘要';
COMMENT ON COLUMN public.approval_requests.conversation_id IS '关联会话';
COMMENT ON COLUMN public.approval_requests.result_payload IS '最终结论';
COMMENT ON COLUMN public.approval_requests.created_at IS '创建时间';
COMMENT ON COLUMN public.approval_requests.updated_at IS '更新时间';
COMMENT ON COLUMN public.approval_requests.archived_at IS '归档时间';
```
