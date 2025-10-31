# projects

**摘要**：项目主记录，承载预算与健康度概览。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 项目唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 项目编码 |
| name | varchar(255) | NOT NULL | 项目名称 |
| status | varchar(30) | NOT NULL DEFAULT 'active' | 项目状态 |
| project_type | varchar(30) | NOT NULL DEFAULT 'delivery' | 项目类型 |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 负责人 |
| department_id | uuid | NULL REFERENCES departments(id) | 所属部门 |
| health_color | varchar(10) | NOT NULL DEFAULT 'green' | 健康度 |
| start_date | date | NULL | 开工日期 |
| end_date | date | NULL | 完工日期 |
| budget_amount | numeric(18,2) | NULL | 预算金额 |
| budget_currency | char(3) | NULL | 预算币种 |
| reporting_summary | jsonb | NOT NULL DEFAULT '{}'::jsonb | 进度与风险概览 |
| custom_fields | jsonb | NOT NULL DEFAULT '{}'::jsonb | 自定义字段 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `reporting_summary`：结构化保存燃尽、风险、里程碑完成率等指标。
- `custom_fields`：支持按项目类型扩展自定义字段。

## 索引与约束
- UNIQUE (company_id, code)
- INDEX idx_projects_status (company_id, status)
- GIN (reporting_summary)

## 关系
- 多对一 -> companies.id
- 多对一 -> users.id
- 多对一 -> departments.id
- 一对多 -> project_members.project_id
- 一对多 -> project_items.project_id
- 一对多 -> financial_records.project_id

## 设计权衡
项目指标聚合到 JSON，减少派生表，但复杂报表需依赖物化视图缓存。
