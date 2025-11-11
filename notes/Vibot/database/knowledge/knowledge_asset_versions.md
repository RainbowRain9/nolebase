# public.knowledge_asset_versions（资料版本）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 版本唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| asset_id | uuid | NOT NULL REFERENCES knowledge_assets(id) ON DELETE CASCADE | 归属资料 |
| version_number | integer | NOT NULL | 版本号 |
| change_summary | text | NULL | 变更摘要 |
| content | jsonb | NOT NULL DEFAULT '{}'::jsonb | 结构化内容（富文本、Markdown 片段等） |
| embedding | vector(1536) | NULL | 语义向量（依赖 pgvector） |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| generated_by | uuid | NULL REFERENCES ai_conversations(id) | AI 会话引用 |
| published_by | uuid | NULL REFERENCES users(id) | 发布者 |
| published_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 发布时间 |

## 设计权衡
**设计权衡**：直接将 embedding 存于版本表，省去附加关联表，pgvector 索引用于语义检索。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- asset_id → knowledge_assets(id) ON DELETE CASCADE
- generated_by → ai_conversations(id)
- published_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_knowledge_asset_versions_company_id ON public.knowledge_asset_versions(company_id);

## Row Level Security
```sql
ALTER TABLE public.knowledge_asset_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge versions readable via asset"
    ON public.knowledge_asset_versions
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1 FROM public.knowledge_assets ka
        WHERE ka.id = knowledge_asset_versions.asset_id
          AND ka.company_id = current_company_id()
      )
    );

CREATE POLICY "Knowledge versions managed by owners"
    ON public.knowledge_asset_versions
    FOR ALL
    USING (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1 FROM public.knowledge_assets ka
        WHERE ka.id = knowledge_asset_versions.asset_id
          AND ka.company_id = current_company_id()
          AND (
            ka.owner_id = auth.uid()
            OR has_role('Vibot.admin')
          )
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND EXISTS (
        SELECT 1 FROM public.knowledge_assets ka
        WHERE ka.id = knowledge_asset_versions.asset_id
          AND ka.company_id = current_company_id()
          AND (
            ka.owner_id = auth.uid()
            OR has_role('Vibot.admin')
          )
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:knowledge_asset_versions` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `knowledge_asset_versions` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.knowledge_asset_versions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 版本唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    asset_id uuid NOT NULL REFERENCES knowledge_assets(id) ON DELETE CASCADE -- 归属资料,
    version_number integer NOT NULL -- 版本号,
    change_summary text NULL -- 变更摘要,
    content jsonb NOT NULL DEFAULT '{}'::jsonb -- 结构化内容（富文本、Markdown 片段等）,
    embedding vector(1536) NULL -- 语义向量（依赖 pgvector）,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb -- 附件列表,
    generated_by uuid NULL REFERENCES ai_conversations(id) -- AI 会话引用,
    published_by uuid NULL REFERENCES users(id) -- 发布者,
    published_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 发布时间
);
COMMENT ON TABLE public.knowledge_asset_versions IS '资料版本';
COMMENT ON COLUMN public.knowledge_asset_versions.id IS '版本唯一标识';
COMMENT ON COLUMN public.knowledge_asset_versions.company_id IS '所属公司';
COMMENT ON COLUMN public.knowledge_asset_versions.asset_id IS '归属资料';
COMMENT ON COLUMN public.knowledge_asset_versions.version_number IS '版本号';
COMMENT ON COLUMN public.knowledge_asset_versions.change_summary IS '变更摘要';
COMMENT ON COLUMN public.knowledge_asset_versions.content IS '结构化内容（富文本、Markdown 片段等）';
COMMENT ON COLUMN public.knowledge_asset_versions.embedding IS '语义向量（依赖 pgvector）';
COMMENT ON COLUMN public.knowledge_asset_versions.attachments IS '附件列表';
COMMENT ON COLUMN public.knowledge_asset_versions.generated_by IS 'AI 会话引用';
COMMENT ON COLUMN public.knowledge_asset_versions.published_by IS '发布者';
COMMENT ON COLUMN public.knowledge_asset_versions.published_at IS '发布时间';
```
