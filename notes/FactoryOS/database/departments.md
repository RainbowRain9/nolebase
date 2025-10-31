# departments

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 部门唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| parent_id | uuid | NULL REFERENCES departments(id) ON DELETE SET NULL | 上级部门 |
| name | varchar(200) | NOT NULL | 部门名称 |
| code | varchar(100) | NOT NULL | 部门编码，用于对接 HR/钉钉 |
| level | integer | NOT NULL DEFAULT 1 | 部门层级 |
| head_id | uuid | NULL REFERENCES users(id) | 部门负责人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 自定义字段（编制、地点等） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `companies`
- 关联多个 `users`
- 关联多个 `approval_requests`
