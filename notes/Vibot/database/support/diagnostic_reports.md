# public.diagnostic_reports（诊断报告）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 报告唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| ticket_id | uuid | NULL REFERENCES support_tickets(id) ON DELETE SET NULL | 关联工单 |
| trigger_context | jsonb | NOT NULL DEFAULT '{}'::jsonb | 触发上下文 |
| summary | text | NOT NULL | 诊断摘要 |
| recommendations | jsonb | NOT NULL DEFAULT '[]'::jsonb | 建议清单 |
| generated_by | uuid | NULL REFERENCES ai_conversations(id) | AI 会话 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 生成者 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- ticket_id → support_tickets(id) ON DELETE SET NULL
- generated_by → ai_conversations(id)
- created_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_diagnostic_reports_company_id ON public.diagnostic_reports(company_id);

## Row Level Security
```sql
ALTER TABLE public.diagnostic_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Diagnostic reports readable to participants"
    ON public.diagnostic_reports
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        created_by = auth.uid()
        OR has_role('Vibot.admin')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:diagnostic_reports` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `diagnostic_reports` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.diagnostic_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 报告唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    ticket_id uuid NULL REFERENCES support_tickets(id) ON DELETE SET NULL -- 关联工单,
    trigger_context jsonb NOT NULL DEFAULT '{}'::jsonb -- 触发上下文,
    summary text NOT NULL -- 诊断摘要,
    recommendations jsonb NOT NULL DEFAULT '[]'::jsonb -- 建议清单,
    generated_by uuid NULL REFERENCES ai_conversations(id) -- AI 会话,
    created_by uuid NOT NULL REFERENCES users(id) -- 生成者,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.diagnostic_reports IS '诊断报告';
COMMENT ON COLUMN public.diagnostic_reports.id IS '报告唯一标识';
COMMENT ON COLUMN public.diagnostic_reports.company_id IS '所属公司';
COMMENT ON COLUMN public.diagnostic_reports.ticket_id IS '关联工单';
COMMENT ON COLUMN public.diagnostic_reports.trigger_context IS '触发上下文';
COMMENT ON COLUMN public.diagnostic_reports.summary IS '诊断摘要';
COMMENT ON COLUMN public.diagnostic_reports.recommendations IS '建议清单';
COMMENT ON COLUMN public.diagnostic_reports.generated_by IS 'AI 会话';
COMMENT ON COLUMN public.diagnostic_reports.created_by IS '生成者';
COMMENT ON COLUMN public.diagnostic_reports.created_at IS '创建时间';
```
