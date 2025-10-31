# user_roles

**摘要**：用户在公司范围及资源范围内获得的角色。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 用户 |
| role_id | uuid | NOT NULL REFERENCES roles(id) ON DELETE CASCADE | 角色 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| scope_resource_type | varchar(50) | NULL | 作用域资源类型 |
| scope_resource_id | uuid | NULL | 作用域资源ID |
| assigned_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 分配时间 |
| assigned_by | uuid | NULL REFERENCES users(id) | 分配人 |

## JSON 字段
- 无

## 索引与约束
- PRIMARY KEY (user_id, role_id, COALESCE(scope_resource_type,''), COALESCE(scope_resource_id::text,''))
- INDEX idx_user_roles_company (company_id)

## 关系
- 多对一 -> users.id
- 多对一 -> roles.id

## 设计权衡
复合主键消除重复授权，但 scope 字段的可空性增加 SQL 复杂度。
