# public.knowledge_assets（资料条目）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 资料唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| space_id | uuid | NOT NULL REFERENCES knowledge_spaces(id) ON DELETE CASCADE | 所属空间 |
| asset_type | varchar(30) | NOT NULL | 资料类型（方案、PLC、零件、视频等） |
| title | varchar(255) | NOT NULL | 标题 |
| summary | text | NULL | 摘要 |
| latest_version_id | uuid | NULL REFERENCES knowledge_asset_versions(id) | 最近版本 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 状态 |
| tags | text[] | NULL | 标签 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件引用 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 负责人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展字段 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：保留最新版本引用以便快速查询，历史差异放在版本表中，兼顾性能与追溯。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- space_id → knowledge_spaces(id) ON DELETE CASCADE
- latest_version_id → knowledge_asset_versions(id)
- owner_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_knowledge_assets_company_id ON public.knowledge_assets(company_id);

## Row Level Security
```sql
ALTER TABLE public.knowledge_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge assets readable via space policy"
    ON public.knowledge_assets
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1 FROM public.knowledge_spaces ks
        WHERE ks.id = knowledge_assets.space_id
          AND ks.company_id = current_company_id()
          AND (
            ks.visibility <> 'private'
            OR ks.created_by = auth.uid()
            OR knowledge_assets.owner_id = auth.uid()
            OR has_role('Vibot.admin')
          )
      )
    );

CREATE POLICY "Knowledge assets manageable by owners"
    ON public.knowledge_assets
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
- 启用 Realtime 频道 `public:knowledge_assets` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `knowledge_assets` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.knowledge_assets (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 资料唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    space_id uuid NOT NULL REFERENCES knowledge_spaces(id) ON DELETE CASCADE -- 所属空间,
    asset_type varchar(30) NOT NULL -- 资料类型（方案、PLC、零件、视频等）,
    title varchar(255) NOT NULL -- 标题,
    summary text NULL -- 摘要,
    latest_version_id uuid NULL REFERENCES knowledge_asset_versions(id) -- 最近版本,
    status varchar(20) NOT NULL DEFAULT 'active' -- 状态,
    tags text[] NULL -- 标签,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb -- 附件引用,
    owner_id uuid NOT NULL REFERENCES users(id) -- 负责人,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展字段,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.knowledge_assets IS '资料条目';
COMMENT ON COLUMN public.knowledge_assets.id IS '资料唯一标识';
COMMENT ON COLUMN public.knowledge_assets.company_id IS '所属公司';
COMMENT ON COLUMN public.knowledge_assets.space_id IS '所属空间';
COMMENT ON COLUMN public.knowledge_assets.asset_type IS '资料类型（方案、PLC、零件、视频等）';
COMMENT ON COLUMN public.knowledge_assets.title IS '标题';
COMMENT ON COLUMN public.knowledge_assets.summary IS '摘要';
COMMENT ON COLUMN public.knowledge_assets.latest_version_id IS '最近版本';
COMMENT ON COLUMN public.knowledge_assets.status IS '状态';
COMMENT ON COLUMN public.knowledge_assets.tags IS '标签';
COMMENT ON COLUMN public.knowledge_assets.attachments IS '附件引用';
COMMENT ON COLUMN public.knowledge_assets.owner_id IS '负责人';
COMMENT ON COLUMN public.knowledge_assets.metadata IS '扩展字段';
COMMENT ON COLUMN public.knowledge_assets.created_at IS '创建时间';
COMMENT ON COLUMN public.knowledge_assets.updated_at IS '更新时间';
```
