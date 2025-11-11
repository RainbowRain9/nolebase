# public.sync_jobs（调度任务）

> （暂无描述）

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 任务唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| connector_id | uuid | NOT NULL REFERENCES integration_connectors(id) | 连接器 |
| job_type | varchar(30) | NOT NULL | 任务类型（sync、replay、repair 等） |
| payload | jsonb | NOT NULL DEFAULT '{}'::jsonb | 任务参数 |
| schedule | jsonb | NOT NULL DEFAULT '{}'::jsonb | 调度设置 |
| status | varchar(20) | NOT NULL DEFAULT 'idle' | 当前状态 |
| priority | integer | NOT NULL DEFAULT 0 | 优先级 |
| next_run_at | timestamptz | NULL | 下次运行时间 |
| last_run_at | timestamptz | NULL | 最近运行时间 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
（尚未提供设计权衡说明）

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- connector_id → integration_connectors(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_sync_jobs_company_id ON public.sync_jobs(company_id);

## Row Level Security
```sql
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sync jobs readable within company"
    ON public.sync_jobs
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Sync jobs managed by admins"
    ON public.sync_jobs
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
- 启用 Realtime 频道 `public:sync_jobs` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `sync_jobs` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.sync_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 任务唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    connector_id uuid NOT NULL REFERENCES integration_connectors(id) -- 连接器,
    job_type varchar(30) NOT NULL -- 任务类型（sync、replay、repair 等）,
    payload jsonb NOT NULL DEFAULT '{}'::jsonb -- 任务参数,
    schedule jsonb NOT NULL DEFAULT '{}'::jsonb -- 调度设置,
    status varchar(20) NOT NULL DEFAULT 'idle' -- 当前状态,
    priority integer NOT NULL DEFAULT 0 -- 优先级,
    next_run_at timestamptz NULL -- 下次运行时间,
    last_run_at timestamptz NULL -- 最近运行时间,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.sync_jobs IS '调度任务';
COMMENT ON COLUMN public.sync_jobs.id IS '任务唯一标识';
COMMENT ON COLUMN public.sync_jobs.company_id IS '所属公司';
COMMENT ON COLUMN public.sync_jobs.connector_id IS '连接器';
COMMENT ON COLUMN public.sync_jobs.job_type IS '任务类型（sync、replay、repair 等）';
COMMENT ON COLUMN public.sync_jobs.payload IS '任务参数';
COMMENT ON COLUMN public.sync_jobs.schedule IS '调度设置';
COMMENT ON COLUMN public.sync_jobs.status IS '当前状态';
COMMENT ON COLUMN public.sync_jobs.priority IS '优先级';
COMMENT ON COLUMN public.sync_jobs.next_run_at IS '下次运行时间';
COMMENT ON COLUMN public.sync_jobs.last_run_at IS '最近运行时间';
COMMENT ON COLUMN public.sync_jobs.created_at IS '创建时间';
COMMENT ON COLUMN public.sync_jobs.updated_at IS '更新时间';
```
