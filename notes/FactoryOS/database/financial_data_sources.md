# financial_data_sources

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 数据源ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| name | varchar(150) | NOT NULL | 数据源名称 |
| source_type | varchar(50) | NOT NULL CHECK (source_type IN ('mysql','postgresql','sqlserver','api','file')) | 来源类型 |
| connection_config | jsonb | NOT NULL | 连接配置（脱敏存储） |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')) | 状态 |
| last_synced_at | timestamptz | NULL | 最近同步时间 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加信息（schema映射） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联多个 `financial_records` 同步任务（通过 `financial_sync_jobs`）
