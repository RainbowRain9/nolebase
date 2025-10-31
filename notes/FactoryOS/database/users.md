# users

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 用户唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| department_id | uuid | NULL REFERENCES departments(id) | 所属部门 |
| email | varchar(255) | NOT NULL UNIQUE | 登录邮箱 |
| username | varchar(150) | NOT NULL UNIQUE | 用户名 |
| password_hash | varchar(255) | NOT NULL | 密码哈希（BCrypt/Argon2） |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','locked')) | 用户状态 |
| auth_provider | varchar(50) | NOT NULL DEFAULT 'password' | 认证提供方（password/sso等） |
| last_login_at | timestamptz | NULL | 最近登录时间 |
| locale | varchar(10) | NOT NULL DEFAULT 'zh-CN' | 用户偏好语言 |
| timezone | varchar(50) | NULL | 用户时区 |
| is_mfa_enabled | boolean | NOT NULL DEFAULT false | 多因素认证启用标记 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `companies`、`departments`
- 一对一关联 `user_profiles`
- 多对多关联 `roles` 与 `permissions`
- 参与多个 `projects`、`approval_requests`
- 生成 `ai_conversations`
