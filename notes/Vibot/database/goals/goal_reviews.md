# public.goal_reviews（复盘/审核记录）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| goal_id | uuid | NOT NULL REFERENCES goal_sets(id) ON DELETE CASCADE | 所属目标 |
| review_type | varchar(20) | NOT NULL | 类型（pre_check/post_review 等） |
| reviewer_id | uuid | NOT NULL REFERENCES users(id) | 审核人 |
| review_notes | text | NULL | 备注 |
| result | varchar(20) | NOT NULL DEFAULT 'pending' | 结果 |
| action_items | jsonb | NOT NULL DEFAULT '[]'::jsonb | 行动项 |
| review_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 审核时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- goal_id → goal_sets(id) ON DELETE CASCADE
- reviewer_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_goal_reviews_company_id ON public.goal_reviews(company_id);

## Row Level Security
```sql
ALTER TABLE public.goal_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Goal reviews readable within company"
    ON public.goal_reviews
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Goal reviews insertable by reviewers"
    ON public.goal_reviews
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (reviewer_id = auth.uid() OR has_role('Vibot.admin'))
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:goal_reviews` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `goal_reviews` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.goal_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    goal_id uuid NOT NULL REFERENCES goal_sets(id) ON DELETE CASCADE -- 所属目标,
    review_type varchar(20) NOT NULL -- 类型（pre_check/post_review 等）,
    reviewer_id uuid NOT NULL REFERENCES users(id) -- 审核人,
    review_notes text NULL -- 备注,
    result varchar(20) NOT NULL DEFAULT 'pending' -- 结果,
    action_items jsonb NOT NULL DEFAULT '[]'::jsonb -- 行动项,
    review_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 审核时间
);
COMMENT ON TABLE public.goal_reviews IS '复盘/审核记录';
COMMENT ON COLUMN public.goal_reviews.id IS '记录唯一标识';
COMMENT ON COLUMN public.goal_reviews.company_id IS '所属公司';
COMMENT ON COLUMN public.goal_reviews.goal_id IS '所属目标';
COMMENT ON COLUMN public.goal_reviews.review_type IS '类型（pre_check/post_review 等）';
COMMENT ON COLUMN public.goal_reviews.reviewer_id IS '审核人';
COMMENT ON COLUMN public.goal_reviews.review_notes IS '备注';
COMMENT ON COLUMN public.goal_reviews.result IS '结果';
COMMENT ON COLUMN public.goal_reviews.action_items IS '行动项';
COMMENT ON COLUMN public.goal_reviews.review_at IS '审核时间';
```
