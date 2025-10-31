# financial_sync_job_runs

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 任务运行ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| sync_job_id | uuid | NOT NULL REFERENCES financial_sync_jobs(id) ON DELETE CASCADE | 同步任务 |
| started_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 开始时间 |
| finished_at | timestamptz | NULL | 结束时间 |
| status | varchar(20) | NOT NULL CHECK (status IN ('success','failure','partial')) | 运行状态 |
| records_processed | integer | NOT NULL DEFAULT 0 | 处理记录数 |
| error_message | text | NULL | 错误信息 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加指标（延迟、耗时） |

**Relationships**
- 关联 `financial_sync_jobs`
