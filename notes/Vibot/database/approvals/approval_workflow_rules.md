# public.approval_workflow_rules（审批流程规则）

> 流程层面的动态分配、条件跳转、自动化配置。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 规则唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE | 所属流程 |
| workflow_revision | integer | NOT NULL | 匹配流程版本 |
| rule_name | varchar(120) | NOT NULL | 规则名称 |
| rule_type | varchar(40) | NOT NULL CHECK (rule_type IN ('stage_assignment','auto_decision','escalation')) | 规则类型 |
| condition | jsonb | NOT NULL DEFAULT '{}'::jsonb | 条件表达式（rule engine） |
| target_stage | varchar(100) | NOT NULL | 目标节点/阶段 |
| escalation_config | jsonb | NOT NULL DEFAULT '{}'::jsonb | 升级/通知配置 |
| order_index | integer | NOT NULL DEFAULT 0 | 执行顺序 |
| is_active | boolean | NOT NULL DEFAULT true | 是否启用 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
**设计权衡**：独立规则表使审批流程具备可插拔逻辑，避免硬编码审核人或条件，支持多版本共存。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- workflow_id → approval_workflows(id) ON DELETE CASCADE
- created_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_workflow_rules_company_id ON public.approval_workflow_rules(company_id);

## Row Level Security
```sql
ALTER TABLE public.approval_workflow_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workflow rules readable"
    ON public.approval_workflow_rules
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.approval_designer')
      )
    );

CREATE POLICY "Workflow rules manageable"
    ON public.approval_workflow_rules
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
- 启用 Realtime 频道 `public:approval_workflow_rules` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_workflow_rules` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_workflow_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 规则唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    workflow_id uuid NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE -- 所属流程,
    workflow_revision integer NOT NULL -- 匹配流程版本,
    rule_name varchar(120) NOT NULL -- 规则名称,
    rule_type varchar(40) NOT NULL CHECK (rule_type IN ('stage_assignment','auto_decision','escalation')) -- 规则类型,
    condition jsonb NOT NULL DEFAULT '{}'::jsonb -- 条件表达式（rule engine）,
    target_stage varchar(100) NOT NULL -- 目标节点/阶段,
    escalation_config jsonb NOT NULL DEFAULT '{}'::jsonb -- 升级/通知配置,
    order_index integer NOT NULL DEFAULT 0 -- 执行顺序,
    is_active boolean NOT NULL DEFAULT true -- 是否启用,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.approval_workflow_rules IS '流程层面的动态分配、条件跳转、自动化配置。';
COMMENT ON COLUMN public.approval_workflow_rules.id IS '规则唯一标识';
COMMENT ON COLUMN public.approval_workflow_rules.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_workflow_rules.workflow_id IS '所属流程';
COMMENT ON COLUMN public.approval_workflow_rules.workflow_revision IS '匹配流程版本';
COMMENT ON COLUMN public.approval_workflow_rules.rule_name IS '规则名称';
COMMENT ON COLUMN public.approval_workflow_rules.rule_type IS '规则类型';
COMMENT ON COLUMN public.approval_workflow_rules.condition IS '条件表达式（rule engine）';
COMMENT ON COLUMN public.approval_workflow_rules.target_stage IS '目标节点/阶段';
COMMENT ON COLUMN public.approval_workflow_rules.escalation_config IS '升级/通知配置';
COMMENT ON COLUMN public.approval_workflow_rules.order_index IS '执行顺序';
COMMENT ON COLUMN public.approval_workflow_rules.is_active IS '是否启用';
COMMENT ON COLUMN public.approval_workflow_rules.created_by IS '创建人';
COMMENT ON COLUMN public.approval_workflow_rules.created_at IS '创建时间';
```
