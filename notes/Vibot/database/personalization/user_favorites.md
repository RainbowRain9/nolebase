# public.user_favorites（收藏记录）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 收藏唯一标识 |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 用户 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 公司 |
| favorite_type | varchar(30) | NOT NULL | 类型（view,command 等） |
| target_id | varchar(200) | NOT NULL | 目标标识 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 上下文 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- user_id → users(id) ON DELETE CASCADE
- company_id → companies(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_user_favorites_company_id ON public.user_favorites(company_id);

## Row Level Security
```sql
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Favorites readable by owner"
    ON public.user_favorites
    FOR ALL
    USING (
      user_id = auth.uid()
      AND company_id = current_company_id()
    )
    WITH CHECK (
      user_id = auth.uid()
      AND company_id = current_company_id()
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:user_favorites` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `user_favorites` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 收藏唯一标识,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE -- 用户,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 公司,
    favorite_type varchar(30) NOT NULL -- 类型（view,command 等）,
    target_id varchar(200) NOT NULL -- 目标标识,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 上下文,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.user_favorites IS '收藏记录';
COMMENT ON COLUMN public.user_favorites.id IS '收藏唯一标识';
COMMENT ON COLUMN public.user_favorites.user_id IS '用户';
COMMENT ON COLUMN public.user_favorites.company_id IS '公司';
COMMENT ON COLUMN public.user_favorites.favorite_type IS '类型（view,command 等）';
COMMENT ON COLUMN public.user_favorites.target_id IS '目标标识';
COMMENT ON COLUMN public.user_favorites.metadata IS '上下文';
COMMENT ON COLUMN public.user_favorites.created_at IS '创建时间';
```
