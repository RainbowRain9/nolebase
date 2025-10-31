# project_templates

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 模板ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| code | varchar(100) | NOT NULL | 模板编码（公司内唯一） |
| name | varchar(200) | NOT NULL | 模板名称 |
| description | text | NULL | 模板说明 |
| scope | varchar(50) | NOT NULL CHECK (scope IN ('project','task','milestone')) | 模板适用范围 |
| payload | jsonb | NOT NULL | 模板内容（任务结构、里程碑等） |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')) | 状态 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 被 `projects` 与 `project_tasks` 套用
