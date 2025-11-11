# public.data_sources（数据源配置）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 数据源唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| source_type | varchar(30) | NOT NULL | 类型 |
| display_name | varchar(255) | NOT NULL | 名称 |
| config | jsonb | NOT NULL DEFAULT '{}'::jsonb | 公共配置 |
| credentials_id | uuid | NULL REFERENCES connector_credentials(id) | 凭据引用 |
| status | varchar(20) | NOT NULL DEFAULT 'inactive' | 状态 |
| last_verified_at | timestamptz | NULL | 最近验证 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- credentials_id → connector_credentials(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_data_sources_company_id ON public.data_sources(company_id);

## Row Level Security
```sql
ALTER TABLE public.data_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Data sources manageable by admins"
    ON public.data_sources
    FOR ALL
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    )
    WITH CHECK (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:data_sources` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `data_sources` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.data_sources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 数据源唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    source_type varchar(30) NOT NULL -- 类型,
    display_name varchar(255) NOT NULL -- 名称,
    config jsonb NOT NULL DEFAULT '{}'::jsonb -- 公共配置,
    credentials_id uuid NULL REFERENCES connector_credentials(id) -- 凭据引用,
    status varchar(20) NOT NULL DEFAULT 'inactive' -- 状态,
    last_verified_at timestamptz NULL -- 最近验证,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.data_sources IS '数据源配置';
COMMENT ON COLUMN public.data_sources.id IS '数据源唯一标识';
COMMENT ON COLUMN public.data_sources.company_id IS '所属公司';
COMMENT ON COLUMN public.data_sources.source_type IS '类型';
COMMENT ON COLUMN public.data_sources.display_name IS '名称';
COMMENT ON COLUMN public.data_sources.config IS '公共配置';
COMMENT ON COLUMN public.data_sources.credentials_id IS '凭据引用';
COMMENT ON COLUMN public.data_sources.status IS '状态';
COMMENT ON COLUMN public.data_sources.last_verified_at IS '最近验证';
COMMENT ON COLUMN public.data_sources.created_at IS '创建时间';
COMMENT ON COLUMN public.data_sources.updated_at IS '更新时间';
```
