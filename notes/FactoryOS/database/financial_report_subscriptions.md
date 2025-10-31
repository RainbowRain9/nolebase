# financial_report_subscriptions

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 订阅ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| template_id | uuid | NOT NULL REFERENCES financial_report_templates(id) ON DELETE CASCADE | 报表模板 |
| subscriber_id | uuid | NULL REFERENCES users(id) | 订阅用户 |
| subscriber_role | varchar(100) | NULL | 订阅角色（群发场景） |
| channel | varchar(20) | NOT NULL CHECK (channel IN ('email','web','dingtalk','slack')) | 推送渠道 |
| schedule | varchar(50) | NOT NULL | 调度表达式 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','cancelled')) | 状态 |
| last_delivered_at | timestamptz | NULL | 最近送达时间 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加信息（报表语言等） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 关联 `financial_report_templates`
