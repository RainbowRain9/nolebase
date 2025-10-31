# departments

**摘要**：公司内部组织结构，支持树型层级。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 部门唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| parent_id | uuid | NULL REFERENCES departments(id) | 上级部门 |
| path | ltree | NOT NULL | 层级路径 |
| name | varchar(150) | NOT NULL | 部门名称 |
| leader_id | uuid | NULL REFERENCES users(id) | 负责人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 自定义标签 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `metadata`：可扩展维度（如成本中心、地区编码）。

## 索引与约束
- UNIQUE (company_id, name)
- GIN (metadata)
- INDEX idx_departments_path USING GIST(path)

## 关系
- 多对一 -> companies.id
- 一对多 -> users.department_id
- 一对多 -> projects.department_id

## 设计权衡
使用 ltree 存储层级路径，查询灵活但依赖 PostgreSQL 扩展。
