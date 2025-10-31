# financial_alert_events

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 预警事件ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| alert_rule_id | uuid | NOT NULL REFERENCES financial_alert_rules(id) ON DELETE CASCADE | 触发规则 |
| triggered_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 触发时间 |
| metric_value | numeric(18,2) | NULL | 实际值 |
| comparison_value | numeric(18,2) | NULL | 对比值（阈值/历史） |
| context | jsonb | NOT NULL DEFAULT '{}'::jsonb | 触发上下文（维度、报表ID） |
| status | varchar(20) | NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved','dismissed')) | 处理状态 |
| resolved_at | timestamptz | NULL | 解决时间 |
| resolved_by | uuid | NULL REFERENCES users(id) | 处理人 |
| action_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联纠偏任务或审批 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

**Relationships**
- 关联 `financial_alert_rules`
- 可关联 `approval_requests`
