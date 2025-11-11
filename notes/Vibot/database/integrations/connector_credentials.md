# public.connector_credentials（连接器凭据）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 凭据唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| connector_id | uuid | NOT NULL REFERENCES integration_connectors(id) ON DELETE CASCADE | 关联连接器 |
| version | integer | NOT NULL | 版本号 |
| secret_ciphertext | bytea | NOT NULL | 使用 pgcrypto 加密后的密文 |
| checksum | varchar(128) | NOT NULL | 完整性校验 |
| rotated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 最近轮换时间 |
| rotated_by | uuid | NULL REFERENCES users(id) | 操作人 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- connector_id → integration_connectors(id) ON DELETE CASCADE
- rotated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_connector_credentials_company_id ON public.connector_credentials(company_id);

## Row Level Security
```sql
ALTER TABLE public.connector_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Connector credentials managed by admins"
    ON public.connector_credentials
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
- 启用 Realtime 频道 `public:connector_credentials` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `connector_credentials` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.connector_credentials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 凭据唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    connector_id uuid NOT NULL REFERENCES integration_connectors(id) ON DELETE CASCADE -- 关联连接器,
    version integer NOT NULL -- 版本号,
    secret_ciphertext bytea NOT NULL -- 使用 pgcrypto 加密后的密文,
    checksum varchar(128) NOT NULL -- 完整性校验,
    rotated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 最近轮换时间,
    rotated_by uuid NULL REFERENCES users(id) -- 操作人
);
COMMENT ON TABLE public.connector_credentials IS '连接器凭据';
COMMENT ON COLUMN public.connector_credentials.id IS '凭据唯一标识';
COMMENT ON COLUMN public.connector_credentials.company_id IS '所属公司';
COMMENT ON COLUMN public.connector_credentials.connector_id IS '关联连接器';
COMMENT ON COLUMN public.connector_credentials.version IS '版本号';
COMMENT ON COLUMN public.connector_credentials.secret_ciphertext IS '使用 pgcrypto 加密后的密文';
COMMENT ON COLUMN public.connector_credentials.checksum IS '完整性校验';
COMMENT ON COLUMN public.connector_credentials.rotated_at IS '最近轮换时间';
COMMENT ON COLUMN public.connector_credentials.rotated_by IS '操作人';
```
