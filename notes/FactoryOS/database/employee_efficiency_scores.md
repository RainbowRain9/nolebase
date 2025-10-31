# employee_efficiency_scores

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 效率评分记录ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 员工 |
| period_start | date | NOT NULL | 统计周期开始 |
| period_end | date | NOT NULL | 统计周期结束 |
| score | numeric(5,2) | NOT NULL | 效率评分 |
| score_breakdown | jsonb | NOT NULL DEFAULT '{}'::jsonb | 评分构成（交付、质量等） |
| trend | jsonb | NOT NULL DEFAULT '{}'::jsonb | 趋势数据（同比/环比） |
| generated_by | uuid | NULL REFERENCES users(id) | 生成者（人工确认） |
| conversation_id | uuid | NULL REFERENCES ai_conversations(id) | 对话生成记录 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (user_id, period_start, period_end)

**Relationships**
- 关联 `employee_efficiency_reports`
