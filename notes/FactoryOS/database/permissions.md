# permissions

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 权限唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(150) | NOT NULL | 权限编码（module:action 格式） |
| name | varchar(150) | NOT NULL | 权限名称 |
| description | text | NULL | 权限描述 |
| scope | varchar(50) | NOT NULL DEFAULT 'entity' CHECK (scope IN ('entity','field','action')) | 权限作用范围 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加条件（ABAC 规则、字段约束） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 多对多关联 `roles`（`role_permissions`）
- 可直接分配给 `users`（`user_permissions` 可选）
