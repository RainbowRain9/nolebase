# role_permissions

**摘要**：角色与权限的绑定关系。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| role_id | uuid | NOT NULL REFERENCES roles(id) ON DELETE CASCADE | 角色 |
| permission_id | uuid | NOT NULL REFERENCES permissions(id) ON DELETE CASCADE | 权限 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| granted_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 授权时间 |
| granted_by | uuid | NULL REFERENCES users(id) | 授权人 |

## JSON 字段
- 无

## 索引与约束
- PRIMARY KEY (role_id, permission_id)
- INDEX idx_role_permissions_company (company_id)

## 关系
- 多对一 -> roles.id
- 多对一 -> permissions.id

## 设计权衡
维持传统多对多表结构，查询直接但删除角色或权限需谨慎使用级联。
