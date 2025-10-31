# financial_report_templates

**摘要**：报表、预警与订阅配置的统一定义。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 模板唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| template_code | varchar(50) | NOT NULL | 模板编码 |
| name | varchar(255) | NOT NULL | 模板名称 |
| description | text | NULL | 模板说明 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 状态 |
| report_scope | varchar(20) | NOT NULL | 报表范围 |
| layout | jsonb | NOT NULL DEFAULT '{}'::jsonb | 布局定义 |
| filters | jsonb | NOT NULL DEFAULT '{}'::jsonb | 筛选条件 |
| schedule | jsonb | NOT NULL DEFAULT '{}'::jsonb | 调度配置 |
| subscriptions | jsonb | NOT NULL DEFAULT '[]'::jsonb | 订阅人列表 |
| alert_rules | jsonb | NOT NULL DEFAULT '[]'::jsonb | 预警规则 |
| alert_history | jsonb | NOT NULL DEFAULT '[]'::jsonb | 预警历史 |
| run_history | jsonb | NOT NULL DEFAULT '[]'::jsonb | 运行历史 |
| data_sources | jsonb | NOT NULL DEFAULT '[]'::jsonb | 数据源配置 |
| sync_state | jsonb | NOT NULL DEFAULT '{}'::jsonb | 同步作业状态 |
| last_run_at | timestamptz | NULL | 最近运行时间 |
| last_run_status | varchar(20) | NULL | 最近运行状态 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 模板负责人 |
| timezone | varchar(50) | NULL | 调度时区 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `layout`：包含指标、维度、展示形式等结构。
- `filters`：包含时间、项目、维度条件。
- `schedule`：定义 cron/周期、窗口、延迟策略。
- `subscriptions`：记录收件人、渠道、格式。
- `alert_rules`：把阈值、指标、通知策略统一存储。
- `alert_history`：保留触发记录与处理状态。
- `run_history`：记录每次运行的摘要、错误、生成文件。
- `data_sources`：记录接入系统、凭证、字段映射。
- `sync_state`：整合原同步任务及运行信息。

## 索引与约束
- UNIQUE (company_id, template_code)
- INDEX idx_fin_report_status (company_id, status)
- GIN (alert_rules)

## 关系
- 多对一 -> users.id

## 设计权衡
运行历史与预警全部存入 JSON，极大降低表数量，但查询需依赖 JSON 索引与物化快照。
