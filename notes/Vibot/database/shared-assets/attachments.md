# public.attachments（附件）

> 二进制资源及其元数据的统一注册表。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 附件唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| file_name | varchar(255) | NOT NULL | 文件名 |
| content_type | varchar(120) | NOT NULL | 内容类型 |
| size_bytes | bigint | NOT NULL | 文件大小 |
| storage_path | varchar(500) | NOT NULL | 存储路径或对象存储键 |
| checksum | varchar(128) | NOT NULL | 完整性校验 |
| category | varchar(50) | NOT NULL DEFAULT 'general' | 附件类别 |
| owner_id | uuid | NULL REFERENCES users(id) | 上传人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| uploaded_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 上传时间 |

## 设计权衡
**设计权衡**：附件均以引用方式关联，降低交叉外键，但需应用层控制一致性。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- owner_id → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_attachments_company_id ON public.attachments(company_id);

## Row Level Security
```sql
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Attachments readable within company"
    ON public.attachments
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Attachments managed by owners"
    ON public.attachments
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR owner_id = auth.uid()
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR owner_id = auth.uid()
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:attachments` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `attachments` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.attachments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 附件唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    file_name varchar(255) NOT NULL -- 文件名,
    content_type varchar(120) NOT NULL -- 内容类型,
    size_bytes bigint NOT NULL -- 文件大小,
    storage_path varchar(500) NOT NULL -- 存储路径或对象存储键,
    checksum varchar(128) NOT NULL -- 完整性校验,
    category varchar(50) NOT NULL DEFAULT 'general' -- 附件类别,
    owner_id uuid NULL REFERENCES users(id) -- 上传人,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展信息,
    uploaded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 上传时间
);
COMMENT ON TABLE public.attachments IS '二进制资源及其元数据的统一注册表。';
COMMENT ON COLUMN public.attachments.id IS '附件唯一标识';
COMMENT ON COLUMN public.attachments.company_id IS '所属公司';
COMMENT ON COLUMN public.attachments.file_name IS '文件名';
COMMENT ON COLUMN public.attachments.content_type IS '内容类型';
COMMENT ON COLUMN public.attachments.size_bytes IS '文件大小';
COMMENT ON COLUMN public.attachments.storage_path IS '存储路径或对象存储键';
COMMENT ON COLUMN public.attachments.checksum IS '完整性校验';
COMMENT ON COLUMN public.attachments.category IS '附件类别';
COMMENT ON COLUMN public.attachments.owner_id IS '上传人';
COMMENT ON COLUMN public.attachments.metadata IS '扩展信息';
COMMENT ON COLUMN public.attachments.uploaded_at IS '上传时间';
```
