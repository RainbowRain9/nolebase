# projects

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 项目ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| code | varchar(100) | NOT NULL | 项目编码（公司内唯一） |
| name | varchar(300) | NOT NULL | 项目名称 |
| description | text | NULL | 项目描述 |
| manager_id | uuid | NOT NULL REFERENCES users(id) | 项目经理 |
| department_id | uuid | NULL REFERENCES departments(id) | 归属部门 |
| status | varchar(20) | NOT NULL DEFAULT 'planning' CHECK (status IN ('planning','active','on_hold','completed','cancelled')) | 项目状态 |
| priority | varchar(20) | NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')) | 优先级 |
| start_date | date | NULL | 启动日期 |
| end_date | date | NULL | 实际结束日期 |
| planned_end_date | date | NULL | 计划结束日期 |
| progress_percent | numeric(5,2) | NOT NULL DEFAULT 0 | 进度百分比 |
| health_status | varchar(20) | NOT NULL DEFAULT 'on_track' CHECK (health_status IN ('on_track','at_risk','delayed')) | 项目健康度 |
| risk_summary | text | NULL | 风险摘要 |
| budget_total | numeric(18,2) | NULL | 总预算 |
| budget_currency | varchar(10) | NULL DEFAULT 'CNY' | 预算币种 |
| last_report_at | timestamptz | NULL | 最近周报生成时间 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展字段（模板ID等） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 多个 `project_members`、`project_milestones`、`project_tasks`
- 关联 `project_cost_records`、`project_weekly_deliveries`
