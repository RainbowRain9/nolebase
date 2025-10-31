# permissions

**摘要**：平台支持的操作权限清单。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 权限唯一标识 |
| code | varchar(100) | NOT NULL UNIQUE | 权限编码 |
| description | text | NOT NULL | 权限说明 |
| category | varchar(50) | NOT NULL | 权限分类 |
| is_system | boolean | NOT NULL DEFAULT true | 是否系统内置 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- 无

## 索引与约束
- INDEX idx_permissions_category (category)

## 关系
- 一对多 -> role_permissions.permission_id

## 设计权衡
权限保持全局表，避免多租户重复定义，但自定义权限需另行扩展。
