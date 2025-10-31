# financial_report_runs

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 报表任务ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| template_id | uuid | NOT NULL REFERENCES financial_report_templates(id) ON DELETE CASCADE | 报表模板 |
| scheduled_at | timestamptz | NULL | 计划执行时间 |
| executed_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 实际执行时间 |
| status | varchar(20) | NOT NULL CHECK (status IN ('pending','running','success','failed')) | 执行状态 |
| parameters | jsonb | NOT NULL DEFAULT '{}'::jsonb | 运行参数（时间范围、过滤条件） |
| output_location | jsonb | NULL | 输出位置（文件、仪表盘ID） |
| insights | jsonb | NOT NULL DEFAULT '[]'::jsonb | 波动解释与建议 |
| triggered_by | uuid | NULL REFERENCES users(id) | 触发人（调度时为空） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**Relationships**
- 关联 `financial_report_templates`
- 生成对应的 `financial_alert_events`
