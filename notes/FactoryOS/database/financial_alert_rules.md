# financial_alert_rules

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 预警规则ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| name | varchar(200) | NOT NULL | 规则名称 |
| metric | varchar(150) | NOT NULL | 指标编码 |
| threshold_type | varchar(20) | NOT NULL CHECK (threshold_type IN ('greater_than','less_than','between','change_rate')) | 阈值类型 |
| threshold_config | jsonb | NOT NULL | 阈值配置（上下限、同比环比） |
| severity | varchar(20) | NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')) | 严重级别 |
| notification_channels | jsonb | NOT NULL DEFAULT '[]'::jsonb | 通知渠道 |
| subscribers | jsonb | NOT NULL DEFAULT '[]'::jsonb | 订阅人/角色 |
| schedule | varchar(50) | NULL | 可选执行频率 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')) | 状态 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 触发 `financial_alert_events`
