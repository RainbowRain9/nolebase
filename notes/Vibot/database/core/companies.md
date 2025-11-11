# public.companies（公司）

> 多租户单位的主数据及默认配置。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 公司唯一标识 |
| code | varchar(32) | NOT NULL UNIQUE | 公司编码 |
| name | varchar(255) | NOT NULL | 公司名称 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')) | 公司状态 |
| timezone | varchar(50) | NULL | 默认时区 |
| locale | varchar(10) | NOT NULL DEFAULT 'zh-CN' | 默认语言 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 企业扩展配置 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：把多租户参数集中在 metadata，避免频繁 DDL，但需要服务层做结构校验。

## 外键与引用完整性
- 无显式外键引用。

## 索引策略
- UNIQUE 约束：列 code 已在表定义中声明唯一性。

## Row Level Security
```sql
-- 强制启用 RLS（默认拒绝所有访问）
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- 仅允许平台管理员（拥有 Vibot.admin 角色）读取公司列表
CREATE POLICY "Tenant admins can view companies"
    ON public.companies
    FOR SELECT
    USING (
      has_role('Vibot.admin')
    );

-- 限制写操作为平台管理员（公司信息仅由平台侧维护）
CREATE POLICY "Tenant admins manage companies"
    ON public.companies
    FOR UPDATE
    USING (
      has_role('Vibot.admin')
    )
    WITH CHECK (
      has_role('Vibot.admin')
    );

CREATE POLICY "Tenant admins insert companies"
    ON public.companies
    FOR INSERT
    WITH CHECK (
      has_role('Vibot.admin')
    );

CREATE POLICY "Tenant admins delete companies"
    ON public.companies
    FOR DELETE
    USING (
      has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:companies` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `companies` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 公司唯一标识,
    code varchar(32) NOT NULL UNIQUE -- 公司编码,
    name varchar(255) NOT NULL -- 公司名称,
    status varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','closed')) -- 公司状态,
    timezone varchar(50) NULL -- 默认时区,
    locale varchar(10) NOT NULL DEFAULT 'zh-CN' -- 默认语言,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 企业扩展配置,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.companies IS '多租户单位的主数据及默认配置。';
COMMENT ON COLUMN public.companies.id IS '公司唯一标识';
COMMENT ON COLUMN public.companies.code IS '公司编码';
COMMENT ON COLUMN public.companies.name IS '公司名称';
COMMENT ON COLUMN public.companies.status IS '公司状态';
COMMENT ON COLUMN public.companies.timezone IS '默认时区';
COMMENT ON COLUMN public.companies.locale IS '默认语言';
COMMENT ON COLUMN public.companies.metadata IS '企业扩展配置';
COMMENT ON COLUMN public.companies.created_at IS '创建时间';
COMMENT ON COLUMN public.companies.updated_at IS '更新时间';
```
