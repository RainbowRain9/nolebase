# roles

**摘要**：公司内可分配的角色定义。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 角色唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 角色编码 |
| name | varchar(100) | NOT NULL | 角色名称 |
| description | text | NULL | 角色说明 |
| scope | varchar(30) | NOT NULL DEFAULT 'global' | 作用域 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- 无

## 索引与约束
- UNIQUE (company_id, code)
- INDEX idx_roles_scope (company_id, scope)

## 关系
- 一对多 -> role_permissions.role_id
- 一对多 -> user_roles.role_id

## 设计权衡
保留 scope 字段满足项目级授权，但需业务约束防止过度碎片化。
