# public.employee_histories（员工变更记录）

> 员工关键事件的历史轨迹。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| employee_id | uuid | NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE | 员工档案 |
| change_type | varchar(50) | NOT NULL | 变更类型 |
| effective_at | timestamptz | NOT NULL | 生效时间 |
| change_summary | text | NULL | 摘要 |
| payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 变更详情 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联审批 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 记录人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## 设计权衡
**设计权衡**：payload 承接多类型历史，减少专用表，但针对特定字段的统计需要 JSON 索引优化。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- employee_id → employee_records(id) ON DELETE CASCADE
- approval_request_id → approval_requests(id)
- created_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_employee_histories_company_id ON public.employee_histories(company_id);

## Row Level Security
```sql
ALTER TABLE public.employee_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee histories readable within company"
    ON public.employee_histories
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
        OR employee_id IN (
          SELECT er.id FROM public.employee_records er
          WHERE er.user_id = auth.uid()
        )
      )
    );

CREATE POLICY "Employee histories managed by HR"
    ON public.employee_histories
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:employee_histories` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `employee_histories` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.employee_histories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 记录唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    employee_id uuid NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE -- 员工档案,
    change_type varchar(50) NOT NULL -- 变更类型,
    effective_at timestamptz NOT NULL -- 生效时间,
    change_summary text NULL -- 摘要,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 变更详情,
    approval_request_id uuid NULL REFERENCES approval_requests(id) -- 关联审批,
    created_by uuid NOT NULL REFERENCES users(id) -- 记录人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间
);
COMMENT ON TABLE public.employee_histories IS '员工关键事件的历史轨迹。';
COMMENT ON COLUMN public.employee_histories.id IS '记录唯一标识';
COMMENT ON COLUMN public.employee_histories.company_id IS '所属公司';
COMMENT ON COLUMN public.employee_histories.employee_id IS '员工档案';
COMMENT ON COLUMN public.employee_histories.change_type IS '变更类型';
COMMENT ON COLUMN public.employee_histories.effective_at IS '生效时间';
COMMENT ON COLUMN public.employee_histories.change_summary IS '摘要';
COMMENT ON COLUMN public.employee_histories.payload IS '变更详情';
COMMENT ON COLUMN public.employee_histories.approval_request_id IS '关联审批';
COMMENT ON COLUMN public.employee_histories.created_by IS '记录人';
COMMENT ON COLUMN public.employee_histories.created_at IS '创建时间';
```
