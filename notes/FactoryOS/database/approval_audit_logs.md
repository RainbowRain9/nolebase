# approval_audit_logs

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 审计记录ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| request_id | uuid | NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 关联审批单 |
| event_type | varchar(50) | NOT NULL | 事件类型（view、update、permission_check、rule_hit等） |
| actor_id | uuid | NULL REFERENCES users(id) | 操作人 |
| channel | varchar(30) | NOT NULL DEFAULT 'web' | 访问渠道 |
| event_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 发生时间 |
| details | jsonb | NOT NULL DEFAULT '{}'::jsonb | 事件详情（字段级访问、规则结果） |
| trace_id | uuid | NULL | 全链路追踪ID |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 记录时间 |

**Relationships**
- 为审计报表提供数据
