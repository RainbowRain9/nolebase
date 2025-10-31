# user_profiles

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| user_id | uuid | PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE | 对应用户ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司，用于加强隔离 |
| first_name | varchar(100) | NOT NULL | 名 |
| last_name | varchar(100) | NOT NULL | 姓 |
| avatar_url | text | NULL | 头像链接 |
| phone | varchar(30) | NULL | 手机号 |
| position | varchar(150) | NULL | 职位 |
| employee_code | varchar(100) | NULL | 员工编号 |
| manager_id | uuid | NULL REFERENCES users(id) | 直接主管 |
| preferences | jsonb | NOT NULL DEFAULT '{}'::jsonb | 个性化偏好 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 一对一 `users`
- 经理引用 `users`
