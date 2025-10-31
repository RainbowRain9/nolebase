# project_weekly_deliveries

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 周交付报告ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目ID |
| week_start_date | date | NOT NULL | 周起始日期（周一） |
| week_end_date | date | NOT NULL | 周结束日期（周日） |
| status | varchar(20) | NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')) | 报告状态 |
| summary | text | NULL | 总结 |
| completed_items | jsonb | NOT NULL DEFAULT '[]'::jsonb | 已完成事项列表 |
| planned_items | jsonb | NOT NULL DEFAULT '[]'::jsonb | 下周计划列表 |
| risk_items | jsonb | NOT NULL DEFAULT '[]'::jsonb | 风险与异常（含SLA） |
| cost_variance | jsonb | NOT NULL DEFAULT '{}'::jsonb | 成本偏差信息 |
| generated_by_conversation_id | uuid | NULL REFERENCES ai_conversations(id) | 生成来源对话 |
| published_at | timestamptz | NULL | 发布时间 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `projects`
- 可关联 `approval_requests`（派发审批）
