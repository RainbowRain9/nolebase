# public.approval_sla_rules（审批 SLA 配置）

> 配置节点超时、提醒与升级策略，保障流程可观测。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 规则标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE | 流程 |
| stage_key | varchar(100) | NOT NULL | 阶段 |
| duration_minutes | integer | NOT NULL | 超时时长（分钟） |
| reminder_offsets | integer[] | NULL | 提醒偏移（分钟） |
| escalation_type | varchar(20) | NOT NULL DEFAULT 'notify' | 升级方式 |
| escalation_target | uuid | NULL | 升级对象（用户/角色） |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 额外策略 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
**设计权衡**：SLA 作为独立可配置实体，支持自定义提醒偏移与升级策略，便于对接通知与审计。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- workflow_id → approval_workflows(id) ON DELETE CASCADE
- created_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_approval_sla_rules_company_id ON public.approval_sla_rules(company_id);

## Row Level Security
```sql
ALTER TABLE public.approval_sla_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "SLA rules readable"
    ON public.approval_sla_rules
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "SLA rules manageable"
    ON public.approval_sla_rules
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
- 启用 Realtime 频道 `public:approval_sla_rules` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `approval_sla_rules` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.approval_sla_rules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 规则标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    workflow_id uuid NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE -- 流程,
    stage_key varchar(100) NOT NULL -- 阶段,
    duration_minutes integer NOT NULL -- 超时时长（分钟）,
    reminder_offsets integer[] NULL -- 提醒偏移（分钟）,
    escalation_type varchar(20) NOT NULL DEFAULT 'notify' -- 升级方式,
    escalation_target uuid NULL -- 升级对象（用户/角色）,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 额外策略,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.approval_sla_rules IS '配置节点超时、提醒与升级策略，保障流程可观测。';
COMMENT ON COLUMN public.approval_sla_rules.id IS '规则标识';
COMMENT ON COLUMN public.approval_sla_rules.company_id IS '所属公司';
COMMENT ON COLUMN public.approval_sla_rules.workflow_id IS '流程';
COMMENT ON COLUMN public.approval_sla_rules.stage_key IS '阶段';
COMMENT ON COLUMN public.approval_sla_rules.duration_minutes IS '超时时长（分钟）';
COMMENT ON COLUMN public.approval_sla_rules.reminder_offsets IS '提醒偏移（分钟）';
COMMENT ON COLUMN public.approval_sla_rules.escalation_type IS '升级方式';
COMMENT ON COLUMN public.approval_sla_rules.escalation_target IS '升级对象（用户/角色）';
COMMENT ON COLUMN public.approval_sla_rules.metadata IS '额外策略';
COMMENT ON COLUMN public.approval_sla_rules.created_by IS '创建人';
COMMENT ON COLUMN public.approval_sla_rules.created_at IS '创建时间';
```
