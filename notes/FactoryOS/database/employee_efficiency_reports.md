# employee_efficiency_reports

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 报告ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| report_type | varchar(20) | NOT NULL CHECK (report_type IN ('weekly','monthly','team')) | 报告类型 |
| owner_user_id | uuid | NULL REFERENCES users(id) | 报告所属员工（团队报告可空） |
| department_id | uuid | NULL REFERENCES departments(id) | 所属部门 |
| period_start | date | NOT NULL | 开始日期 |
| period_end | date | NOT NULL | 结束日期 |
| content | jsonb | NOT NULL DEFAULT '{}'::jsonb | 报告结构化内容（摘要、亮点、风险） |
| generated_via | varchar(20) | NOT NULL DEFAULT 'conversation' CHECK (generated_via IN ('conversation','template','manual')) | 生成方式 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) | 关联审批 |
| published_at | timestamptz | NULL | 发布/分享时间 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 结合 `employee_efficiency_scores`
