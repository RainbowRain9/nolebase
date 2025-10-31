# users

**摘要**：平台用户及其登录、偏好信息。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 用户唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| department_id | uuid | NULL REFERENCES departments(id) | 所属部门 |
| email | varchar(255) | NOT NULL UNIQUE | 登录邮箱 |
| display_name | varchar(150) | NOT NULL | 显示名称 |
| phone | varchar(30) | NULL | 手机号 |
| password_hash | varchar(255) | NOT NULL | 密码哈希 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','locked')) | 用户状态 |
| auth_provider | varchar(50) | NOT NULL DEFAULT 'password' | 认证来源 |
| locale | varchar(10) | NOT NULL DEFAULT 'zh-CN' | 语言偏好 |
| timezone | varchar(50) | NULL | 时区 |
| last_login_at | timestamptz | NULL | 最近登录时间 |
| profile | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展档案 |
| settings | jsonb | NOT NULL DEFAULT '{}'::jsonb | 个性化设置 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `profile`：个人信息、职位、标签等信息。
- `settings`：通知、偏好、AI 配置等开关。

## 索引与约束
- UNIQUE (company_id, display_name)
- INDEX idx_users_status (company_id, status)
- GIN (profile)

## 关系
- 多对一 -> companies.id
- 多对一 -> departments.id
- 一对多 -> orders.created_by
- 一对多 -> work_orders.created_by

## 设计权衡
扩展属性集中到 profile/settings，减少列扩散，但 JSON 索引维护成本更高。
