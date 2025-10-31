# roles

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 角色唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(100) | NOT NULL | 角色编码（公司内唯一） |
| name | varchar(150) | NOT NULL | 角色名称 |
| description | text | NULL | 角色描述 |
| is_system | boolean | NOT NULL DEFAULT false | 是否系统预置 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加配置（字段级权限等） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 多对多关联 `users`（`user_roles`）
- 多对多关联 `permissions`（`role_permissions`）
