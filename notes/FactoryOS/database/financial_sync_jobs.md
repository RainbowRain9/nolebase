# financial_sync_jobs

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 同步任务ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| data_source_id | uuid | NOT NULL REFERENCES financial_data_sources(id) ON DELETE CASCADE | 数据源 |
| schedule | varchar(50) | NOT NULL | 调度表达式（cron） |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','disabled')) | 任务状态 |
| last_run_at | timestamptz | NULL | 上次执行时间 |
| last_run_status | varchar(20) | NULL | 上次执行结果（success/failure） |
| retry_policy | jsonb | NOT NULL DEFAULT '{}'::jsonb | 重试策略 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 产生多条 `financial_sync_job_runs`
