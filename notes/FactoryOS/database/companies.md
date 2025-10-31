# companies

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 公司唯一标识 |
| name | varchar(200) | NOT NULL | 公司名称 |
| code | varchar(50) | NOT NULL UNIQUE | 公司代码，用于租户切换与数据路由 |
| type | varchar(50) | NOT NULL CHECK (type IN ('weibo','lidong_fujian','lidong_chengdu')) | 公司类型 |
| settings | jsonb | NOT NULL DEFAULT '{}'::jsonb | 公司级配置（时区、工作日、AI设置等） |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','trial')) | 公司状态 |
| subscription_expires_at | timestamptz | NULL | 订阅到期时间 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 拥有多个 `departments`
- 拥有多个 `users`
- 拥有多个 `projects`
- 拥有多个 `financial_records`
- 拥有多个 `approval_requests`
