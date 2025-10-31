# user_roles

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 用户ID |
| role_id | uuid | NOT NULL REFERENCES roles(id) ON DELETE CASCADE | 角色ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| assigned_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 分配时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| assigned_by | uuid | NULL REFERENCES users(id) | 分配人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- PRIMARY KEY (user_id, role_id)
- 保证 `company_id` 与用户/角色一致

**Relationships**
- 连接 `users` 与 `roles`
