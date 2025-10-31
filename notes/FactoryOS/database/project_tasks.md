# project_tasks

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 任务ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 所属项目 |
| milestone_id | uuid | NULL REFERENCES project_milestones(id) ON DELETE SET NULL | 关联里程碑 |
| parent_id | uuid | NULL REFERENCES project_tasks(id) ON DELETE SET NULL | 父任务（支持分解） |
| name | varchar(300) | NOT NULL | 任务名称 |
| description | text | NULL | 任务描述 |
| task_type | varchar(50) | NOT NULL DEFAULT 'task' CHECK (task_type IN ('task','bug','milestone','review','risk')) | 任务类型 |
| status | varchar(30) | NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','in_progress','in_review','blocked','done')) | 状态 |
| priority | varchar(20) | NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')) | 优先级 |
| assignee_id | uuid | NULL REFERENCES users(id) | 当前负责人 |
| reviewer_id | uuid | NULL REFERENCES users(id) | 审核人/确认人 |
| start_date | date | NULL | 计划开始日期 |
| due_date | date | NULL | 计划结束日期 |
| actual_start_at | timestamptz | NULL | 实际开始时间 |
| actual_end_at | timestamptz | NULL | 实际完成时间 |
| estimated_hours | numeric(10,2) | NULL | 预估工时 |
| actual_hours | numeric(10,2) | NULL | 实际工时 |
| progress_percent | numeric(5,2) | NOT NULL DEFAULT 0 | 完成百分比 |
| board_column | varchar(50) | NULL | 看板列标识 |
| wip_limit_breach | boolean | NOT NULL DEFAULT false | 是否触发在制限制 |
| risk_level | varchar(20) | NULL CHECK (risk_level IS NULL OR risk_level IN ('low','medium','high')) | 风险等级 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 额外字段（标签、AI卡片引用等） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `project_task_dependencies`
- 关联 `project_cost_records`
- 关联 `approval_requests`（纠偏任务可触发审批）
