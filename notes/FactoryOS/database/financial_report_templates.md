# financial_report_templates

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 报表模板ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| name | varchar(200) | NOT NULL | 模板名称 |
| code | varchar(100) | NOT NULL | 模板编码（公司内唯一） |
| frequency | varchar(20) | NOT NULL CHECK (frequency IN ('daily','weekly','monthly','quarterly','custom')) | 默认频率 |
| data_definition | jsonb | NOT NULL | 数据源与指标定义 |
| layout_config | jsonb | NOT NULL DEFAULT '{}'::jsonb | 布局与可视化配置 |
| permissions | jsonb | NOT NULL DEFAULT '{}'::jsonb | 权限控制（角色/字段级） |
| version | integer | NOT NULL DEFAULT 1 | 当前版本号 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','draft')) | 模板状态 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (company_id, code, version)

**Relationships**
- 关联多条 `financial_report_runs`、`financial_report_subscriptions`
