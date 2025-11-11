# public.promotion_assets（宣传素材草稿）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 素材唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| goal_id | uuid | NULL REFERENCES goal_sets(id) ON DELETE SET NULL | 关联目标 |
| asset_type | varchar(20) | NOT NULL | 类型（copy/image/video） |
| channel | varchar(30) | NOT NULL | 渠道 |
| draft_payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | AI 生成草稿 |
| status | varchar(20) | NOT NULL DEFAULT 'draft' | 状态 |
| generated_by | uuid | NULL REFERENCES ai_conversations(id) | 生成来源 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 负责人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- goal_id → goal_sets(id) ON DELETE SET NULL
- generated_by → ai_conversations(id)
- owner_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_promotion_assets_company_id ON public.promotion_assets(company_id);

## Row Level Security
```sql
ALTER TABLE public.promotion_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promotion assets readable within company"
    ON public.promotion_assets
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Promotion assets manageable by owner"
    ON public.promotion_assets
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
- 启用 Realtime 频道 `public:promotion_assets` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `promotion_assets` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.promotion_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 素材唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    goal_id uuid NULL REFERENCES goal_sets(id) ON DELETE SET NULL -- 关联目标,
    asset_type varchar(20) NOT NULL -- 类型（copy/image/video）,
    channel varchar(30) NOT NULL -- 渠道,
    draft_payload jsonb NOT NULL DEFAULT '{}'::jsonb -- AI 生成草稿,
    status varchar(20) NOT NULL DEFAULT 'draft' -- 状态,
    generated_by uuid NULL REFERENCES ai_conversations(id) -- 生成来源,
    owner_id uuid NOT NULL REFERENCES users(id) -- 负责人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.promotion_assets IS '宣传素材草稿';
COMMENT ON COLUMN public.promotion_assets.id IS '素材唯一标识';
COMMENT ON COLUMN public.promotion_assets.company_id IS '所属公司';
COMMENT ON COLUMN public.promotion_assets.goal_id IS '关联目标';
COMMENT ON COLUMN public.promotion_assets.asset_type IS '类型（copy/image/video）';
COMMENT ON COLUMN public.promotion_assets.channel IS '渠道';
COMMENT ON COLUMN public.promotion_assets.draft_payload IS 'AI 生成草稿';
COMMENT ON COLUMN public.promotion_assets.status IS '状态';
COMMENT ON COLUMN public.promotion_assets.generated_by IS '生成来源';
COMMENT ON COLUMN public.promotion_assets.owner_id IS '负责人';
COMMENT ON COLUMN public.promotion_assets.created_at IS '创建时间';
COMMENT ON COLUMN public.promotion_assets.updated_at IS '更新时间';
```
