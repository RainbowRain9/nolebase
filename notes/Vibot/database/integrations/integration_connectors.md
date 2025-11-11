# public.integration_connectors（连接器定义）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 连接器唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| provider | varchar(50) | NOT NULL | 服务商（dingtalk、mysql 等） |
| connector_type | varchar(30) | NOT NULL | 模式（webhook、database、file 等） |
| status | varchar(20) | NOT NULL DEFAULT 'inactive' | 状态 |
| config | jsonb | NOT NULL DEFAULT '{}'::jsonb | 非敏感配置 |
| schedule | jsonb | NOT NULL DEFAULT '{}'::jsonb | 调度设置 |
| last_synced_at | timestamptz | NULL | 最近同步时间 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_integration_connectors_company_id ON public.integration_connectors(company_id);

## Row Level Security
```sql
ALTER TABLE public.integration_connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Connectors readable within company"
    ON public.integration_connectors
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Connectors manageable by admins"
    ON public.integration_connectors
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
- 启用 Realtime 频道 `public:integration_connectors` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `integration_connectors` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.integration_connectors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 连接器唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    provider varchar(50) NOT NULL -- 服务商（dingtalk、mysql 等）,
    connector_type varchar(30) NOT NULL -- 模式（webhook、database、file 等）,
    status varchar(20) NOT NULL DEFAULT 'inactive' -- 状态,
    config jsonb NOT NULL DEFAULT '{}'::jsonb -- 非敏感配置,
    schedule jsonb NOT NULL DEFAULT '{}'::jsonb -- 调度设置,
    last_synced_at timestamptz NULL -- 最近同步时间,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.integration_connectors IS '连接器定义';
COMMENT ON COLUMN public.integration_connectors.id IS '连接器唯一标识';
COMMENT ON COLUMN public.integration_connectors.company_id IS '所属公司';
COMMENT ON COLUMN public.integration_connectors.provider IS '服务商（dingtalk、mysql 等）';
COMMENT ON COLUMN public.integration_connectors.connector_type IS '模式（webhook、database、file 等）';
COMMENT ON COLUMN public.integration_connectors.status IS '状态';
COMMENT ON COLUMN public.integration_connectors.config IS '非敏感配置';
COMMENT ON COLUMN public.integration_connectors.schedule IS '调度设置';
COMMENT ON COLUMN public.integration_connectors.last_synced_at IS '最近同步时间';
COMMENT ON COLUMN public.integration_connectors.created_by IS '创建人';
COMMENT ON COLUMN public.integration_connectors.updated_by IS '更新人';
COMMENT ON COLUMN public.integration_connectors.created_at IS '创建时间';
COMMENT ON COLUMN public.integration_connectors.updated_at IS '更新时间';
```
