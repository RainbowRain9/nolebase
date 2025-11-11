# public.approval_approvers（审批人配置）

> 定义每个节点/阶段的候选审批人、最小票数与动态变量。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE | 流程 |
| workflow_revision | integer | NOT NULL | 版本 |
| stage_key | varchar(100) | NOT NULL | 节点标识 |
| approver_type | varchar(30) | NOT NULL CHECK (approver_type IN ('role','user','dynamic')) | 审批人类型 |
| approver_value | uuid | NULL | 当类型为 user/role 时存放 ID |
| expression | text | NULL | 动态脚本（如根据表单字段提取） |
| min_approvals | integer | NOT NULL DEFAULT 1 | 最小票数 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展配置 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
**设计权衡**：节点审批配置与流程版本绑定，可根据 approver_type 灵活引用角色、具体用户或动态表达式。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- workflow_id → approval_workflows(id) ON DELETE CASCADE
- created_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_approvers_company_id ON public.approval_approvers(company_id);

## Row Level Security
```sql
ALTER TABLE public.approval_approvers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approver config readable"
    ON public.approval_approvers
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Approver config manageable"
    ON public.approval_approvers
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approval_designer')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approval_designer')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:approval_approvers` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_approvers` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_approvers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    workflow_id uuid NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE -- 流程,
    workflow_revision integer NOT NULL -- 版本,
    stage_key varchar(100) NOT NULL -- 节点标识,
    approver_type varchar(30) NOT NULL CHECK (approver_type IN ('role','user','dynamic')) -- 审批人类型,
    approver_value uuid NULL -- 当类型为 user/role 时存放 ID,
    expression text NULL -- 动态脚本（如根据表单字段提取）,
    min_approvals integer NOT NULL DEFAULT 1 -- 最小票数,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展配置,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.approval_approvers IS '定义每个节点/阶段的候选审批人、最小票数与动态变量。';
COMMENT ON COLUMN public.approval_approvers.id IS '记录标识';
COMMENT ON COLUMN public.approval_approvers.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_approvers.workflow_id IS '流程';
COMMENT ON COLUMN public.approval_approvers.workflow_revision IS '版本';
COMMENT ON COLUMN public.approval_approvers.stage_key IS '节点标识';
COMMENT ON COLUMN public.approval_approvers.approver_type IS '审批人类型';
COMMENT ON COLUMN public.approval_approvers.approver_value IS '当类型为 user/role 时存放 ID';
COMMENT ON COLUMN public.approval_approvers.expression IS '动态脚本（如根据表单字段提取）';
COMMENT ON COLUMN public.approval_approvers.min_approvals IS '最小票数';
COMMENT ON COLUMN public.approval_approvers.metadata IS '扩展配置';
COMMENT ON COLUMN public.approval_approvers.created_by IS '创建人';
COMMENT ON COLUMN public.approval_approvers.created_at IS '创建时间';
```
