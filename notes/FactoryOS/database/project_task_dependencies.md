# project_task_dependencies

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 依赖ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目ID |
| predecessor_task_id | uuid | NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE | 前置任务 |
| successor_task_id | uuid | NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE | 后继任务 |
| dependency_type | varchar(20) | NOT NULL DEFAULT 'finish_start' CHECK (dependency_type IN ('finish_start','start_start','finish_finish','start_finish')) | 依赖类型 |
| lag_days | integer | NOT NULL DEFAULT 0 | 间隔天数 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |

**Constraints**
- UNIQUE (project_id, predecessor_task_id, successor_task_id)
- 保证 `predecessor_task_id != successor_task_id`

**Relationships**
- 连接 `project_tasks`
