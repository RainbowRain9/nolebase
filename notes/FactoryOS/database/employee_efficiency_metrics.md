# employee_efficiency_metrics

**摘要**：整合原评分与报表，存储各期效率量化数据。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 记录唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| employee_id | uuid | NOT NULL REFERENCES employee_records(id) ON DELETE CASCADE | 员工 |
| conversation_id | uuid | NULL REFERENCES ai_conversations(id) | AI 评估来源 |
| metric_period_start | date | NOT NULL | 统计期开始 |
| metric_period_end | date | NOT NULL | 统计期结束 |
| metric_type | varchar(30) | NOT NULL | 指标类型 |
| score | numeric(5,2) | NULL | 评分 |
| metrics | jsonb | NOT NULL DEFAULT '{}'::jsonb | 详细指标 |
| comments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 评语 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |

## JSON 字段
- `metrics`：可存储 KPI、效率、风险等多维度信息。
- `comments`：记录 AI 或主管评语轨迹。

## 索引与约束
- INDEX idx_efficiency_period (company_id, metric_period_start, metric_period_end)
- GIN (metrics)

## 关系
- 多对一 -> employee_records.id
- 多对一 -> ai_conversations.id

## 设计权衡
评分和报告统一存储，生成逻辑更简单，但历史版本区分需依靠统计期与类型组合。
