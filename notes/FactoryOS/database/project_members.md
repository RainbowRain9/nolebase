# project_members

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目ID |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 成员用户 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| role | varchar(100) | NOT NULL | 项目角色（如PM、Dev、QA） |
| allocation_percent | numeric(5,2) | NOT NULL DEFAULT 100 | 资源投入百分比 |
| start_date | date | NULL | 参与开始日期 |
| end_date | date | NULL | 结束日期 |
| is_primary | boolean | NOT NULL DEFAULT false | 是否主责人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- PRIMARY KEY (project_id, user_id)
- `company_id` 必须与 `projects`、`users` 一致

**Relationships**
- 连接 `projects` 与 `users`
