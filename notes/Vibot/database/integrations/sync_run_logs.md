# public.sync_run_logs（任务运行记录）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 运行唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| job_id | uuid | NOT NULL REFERENCES sync_jobs(id) ON DELETE CASCADE | 对应任务 |
| started_at | timestamptz | NOT NULL | 启动时间 |
| finished_at | timestamptz | NULL | 结束时间 |
| status | varchar(20) | NOT NULL | 运行结果 |
| metrics | jsonb | NOT NULL DEFAULT '{}'::jsonb | 统计指标 |
| error_detail | text | NULL | 错误详情 |
| applied_actions | jsonb | NOT NULL DEFAULT '[]'::jsonb | 自动化处理记录 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- job_id → sync_jobs(id) ON DELETE CASCADE

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_sync_run_logs_company_id ON public.sync_run_logs(company_id);

## Row Level Security
```sql
ALTER TABLE public.sync_run_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync run logs readable within company"
    ON public.sync_run_logs
    FOR SELECT
    USING (
      company_id = current_company_id()
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:sync_run_logs` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `sync_run_logs` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.sync_run_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 运行唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    job_id uuid NOT NULL REFERENCES sync_jobs(id) ON DELETE CASCADE -- 对应任务,
    started_at timestamptz NOT NULL -- 启动时间,
    finished_at timestamptz NULL -- 结束时间,
    status varchar(20) NOT NULL -- 运行结果,
    metrics jsonb NOT NULL DEFAULT '{}'::jsonb -- 统计指标,
    error_detail text NULL -- 错误详情,
    applied_actions jsonb NOT NULL DEFAULT '[]'::jsonb -- 自动化处理记录
);
COMMENT ON TABLE public.sync_run_logs IS '任务运行记录';
COMMENT ON COLUMN public.sync_run_logs.id IS '运行唯一标识';
COMMENT ON COLUMN public.sync_run_logs.company_id IS '所属公司';
COMMENT ON COLUMN public.sync_run_logs.job_id IS '对应任务';
COMMENT ON COLUMN public.sync_run_logs.started_at IS '启动时间';
COMMENT ON COLUMN public.sync_run_logs.finished_at IS '结束时间';
COMMENT ON COLUMN public.sync_run_logs.status IS '运行结果';
COMMENT ON COLUMN public.sync_run_logs.metrics IS '统计指标';
COMMENT ON COLUMN public.sync_run_logs.error_detail IS '错误详情';
COMMENT ON COLUMN public.sync_run_logs.applied_actions IS '自动化处理记录';
```
