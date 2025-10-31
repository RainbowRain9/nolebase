# approval_request_ccs

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 审批单ID |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 抄送/关注用户 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| notify_channel | varchar(20) | NOT NULL DEFAULT 'web' CHECK (notify_channel IN ('web','email','dingtalk')) | 通知渠道 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 添加时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 添加人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- PRIMARY KEY (request_id, user_id)

**Relationships**
- 为审批单提供抄送能力
