# public.goal_milestones（目标里程碑）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 里程碑唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| goal_id | uuid | NOT NULL REFERENCES goal_sets(id) ON DELETE CASCADE | 所属目标 |
| title | varchar(255) | NOT NULL | 里程碑标题 |
| due_date | date | NOT NULL | 截止日期 |
| progress_percent | numeric(5,2) | NULL | 进度 |
| status | varchar(20) | NOT NULL DEFAULT 'pending' | 状态 |
| risk_level | varchar(10) | NOT NULL DEFAULT 'low' | 风险等级 |
| plan_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 计划详情 |
| actual_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 实际情况 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- goal_id → goal_sets(id) ON DELETE CASCADE
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_goal_milestones_company_id ON public.goal_milestones(company_id);

## Row Level Security
```sql
ALTER TABLE public.goal_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goal milestones follow parent goal"
    ON public.goal_milestones
    FOR ALL
    USING (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1 FROM public.goal_sets gs
        WHERE gs.id = goal_milestones.goal_id
          AND gs.company_id = current_company_id()
          AND (
            gs.owner_id = auth.uid()
            OR gs.reviewer_id = auth.uid()
            OR has_role('Vibot.admin')
          )
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1 FROM public.goal_sets gs
        WHERE gs.id = goal_milestones.goal_id
          AND gs.company_id = current_company_id()
          AND (
            gs.owner_id = auth.uid()
            OR gs.reviewer_id = auth.uid()
            OR has_role('Vibot.admin')
          )
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:goal_milestones` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `goal_milestones` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.goal_milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 里程碑唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    goal_id uuid NOT NULL REFERENCES goal_sets(id) ON DELETE CASCADE -- 所属目标,
    title varchar(255) NOT NULL -- 里程碑标题,
    due_date date NOT NULL -- 截止日期,
    progress_percent numeric(5,2) NULL -- 进度,
    status varchar(20) NOT NULL DEFAULT 'pending' -- 状态,
    risk_level varchar(10) NOT NULL DEFAULT 'low' -- 风险等级,
    plan_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 计划详情,
    actual_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 实际情况,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.goal_milestones IS '目标里程碑';
COMMENT ON COLUMN public.goal_milestones.id IS '里程碑唯一标识';
COMMENT ON COLUMN public.goal_milestones.company_id IS '所属公司';
COMMENT ON COLUMN public.goal_milestones.goal_id IS '所属目标';
COMMENT ON COLUMN public.goal_milestones.title IS '里程碑标题';
COMMENT ON COLUMN public.goal_milestones.due_date IS '截止日期';
COMMENT ON COLUMN public.goal_milestones.progress_percent IS '进度';
COMMENT ON COLUMN public.goal_milestones.status IS '状态';
COMMENT ON COLUMN public.goal_milestones.risk_level IS '风险等级';
COMMENT ON COLUMN public.goal_milestones.plan_payload IS '计划详情';
COMMENT ON COLUMN public.goal_milestones.actual_payload IS '实际情况';
COMMENT ON COLUMN public.goal_milestones.created_by IS '创建人';
COMMENT ON COLUMN public.goal_milestones.updated_by IS '更新人';
COMMENT ON COLUMN public.goal_milestones.created_at IS '创建时间';
COMMENT ON COLUMN public.goal_milestones.updated_at IS '更新时间';
```
