# public.data_quality_events（数据质量事件）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 事件唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| source_table | varchar(128) | NOT NULL | 数据源 |
| rule_code | varchar(50) | NOT NULL | 规则编码 |
| severity | varchar(10) | NOT NULL | 严重级别 |
| detected_at | timestamptz | NOT NULL | 发现时间 |
| status | varchar(20) | NOT NULL DEFAULT 'open' | 状态 |
| summary | text | NULL | 概述 |
| remediation | jsonb | NOT NULL DEFAULT '{}'::jsonb | 修复建议 |
| related_run_id | uuid | NULL REFERENCES sync_run_logs(id) | 关联运行 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- related_run_id → sync_run_logs(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_data_quality_events_company_id ON public.data_quality_events(company_id);

## Row Level Security
```sql
ALTER TABLE public.data_quality_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Data quality events readable within company"
    ON public.data_quality_events
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Data quality events manageable by admins"
    ON public.data_quality_events
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
- 启用 Realtime 频道 `public:data_quality_events` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `data_quality_events` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.data_quality_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 事件唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    source_table varchar(128) NOT NULL -- 数据源,
    rule_code varchar(50) NOT NULL -- 规则编码,
    severity varchar(10) NOT NULL -- 严重级别,
    detected_at timestamptz NOT NULL -- 发现时间,
    status varchar(20) NOT NULL DEFAULT 'open' -- 状态,
    summary text NULL -- 概述,
    remediation jsonb NOT NULL DEFAULT '{}'::jsonb -- 修复建议,
    related_run_id uuid NULL REFERENCES sync_run_logs(id) -- 关联运行,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.data_quality_events IS '数据质量事件';
COMMENT ON COLUMN public.data_quality_events.id IS '事件唯一标识';
COMMENT ON COLUMN public.data_quality_events.company_id IS '所属公司';
COMMENT ON COLUMN public.data_quality_events.source_table IS '数据源';
COMMENT ON COLUMN public.data_quality_events.rule_code IS '规则编码';
COMMENT ON COLUMN public.data_quality_events.severity IS '严重级别';
COMMENT ON COLUMN public.data_quality_events.detected_at IS '发现时间';
COMMENT ON COLUMN public.data_quality_events.status IS '状态';
COMMENT ON COLUMN public.data_quality_events.summary IS '概述';
COMMENT ON COLUMN public.data_quality_events.remediation IS '修复建议';
COMMENT ON COLUMN public.data_quality_events.related_run_id IS '关联运行';
COMMENT ON COLUMN public.data_quality_events.created_at IS '创建时间';
```
