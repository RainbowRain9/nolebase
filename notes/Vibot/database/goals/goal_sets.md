# public.goal_sets（目标集）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 目标集唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 目标集编码 |
| title | varchar(255) | NOT NULL | 标题 |
| cycle_type | varchar(20) | NOT NULL CHECK (cycle_type IN ('monthly','quarterly','yearly','custom')) | 周期类型 |
| cycle_start | date | NOT NULL | 周期开始 |
| cycle_end | date | NOT NULL | 周期结束 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 负责人 |
| reviewer_id | uuid | NULL REFERENCES users(id) | 审核人 |
| status | varchar(20) | NOT NULL DEFAULT 'draft' | 状态 |
| priority | varchar(10) | NOT NULL DEFAULT 'M' | 重要度 |
| force_review | boolean | NOT NULL DEFAULT false | 是否强制审核 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展字段 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- owner_id → users(id)
- reviewer_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_goal_sets_company_id ON public.goal_sets(company_id);

## Row Level Security
```sql
ALTER TABLE public.goal_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goal sets readable within company"
    ON public.goal_sets
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        owner_id = auth.uid()
        OR reviewer_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Goal sets manageable by owners"
    ON public.goal_sets
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (
        owner_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        owner_id = auth.uid()
        OR has_role('Vibot.admin')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:goal_sets` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `goal_sets` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.goal_sets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 目标集唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    code varchar(50) NOT NULL -- 目标集编码,
    title varchar(255) NOT NULL -- 标题,
    cycle_type varchar(20) NOT NULL CHECK (cycle_type IN ('monthly','quarterly','yearly','custom')) -- 周期类型,
    cycle_start date NOT NULL -- 周期开始,
    cycle_end date NOT NULL -- 周期结束,
    owner_id uuid NOT NULL REFERENCES users(id) -- 负责人,
    reviewer_id uuid NULL REFERENCES users(id) -- 审核人,
    status varchar(20) NOT NULL DEFAULT 'draft' -- 状态,
    priority varchar(10) NOT NULL DEFAULT 'M' -- 重要度,
    force_review boolean NOT NULL DEFAULT false -- 是否强制审核,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展字段,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.goal_sets IS '目标集';
COMMENT ON COLUMN public.goal_sets.id IS '目标集唯一标识';
COMMENT ON COLUMN public.goal_sets.company_id IS '所属公司';
COMMENT ON COLUMN public.goal_sets.code IS '目标集编码';
COMMENT ON COLUMN public.goal_sets.title IS '标题';
COMMENT ON COLUMN public.goal_sets.cycle_type IS '周期类型';
COMMENT ON COLUMN public.goal_sets.cycle_start IS '周期开始';
COMMENT ON COLUMN public.goal_sets.cycle_end IS '周期结束';
COMMENT ON COLUMN public.goal_sets.owner_id IS '负责人';
COMMENT ON COLUMN public.goal_sets.reviewer_id IS '审核人';
COMMENT ON COLUMN public.goal_sets.status IS '状态';
COMMENT ON COLUMN public.goal_sets.priority IS '重要度';
COMMENT ON COLUMN public.goal_sets.force_review IS '是否强制审核';
COMMENT ON COLUMN public.goal_sets.metadata IS '扩展字段';
COMMENT ON COLUMN public.goal_sets.created_at IS '创建时间';
COMMENT ON COLUMN public.goal_sets.updated_at IS '更新时间';
```
