# project_milestones

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 里程碑ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目ID |
| name | varchar(200) | NOT NULL | 里程碑名称 |
| description | text | NULL | 里程碑描述 |
| owner_id | uuid | NULL REFERENCES users(id) | 负责人 |
| status | varchar(20) | NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','completed','delayed','cancelled')) | 状态 |
| start_date | date | NULL | 计划开始日期 |
| due_date | date | NULL | 计划完成日期 |
| completed_at | date | NULL | 实际完成日期 |
| progress_percent | numeric(5,2) | NOT NULL DEFAULT 0 | 完成百分比 |
| risk_flag | boolean | NOT NULL DEFAULT false | 是否存在风险 |
| notes | text | NULL | 备注 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `projects`
- 可关联多个 `project_tasks`
