# project_budget_snapshots

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 预算快照ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目ID |
| version | integer | NOT NULL | 快照版本号 |
| snapshot_date | date | NOT NULL | 快照日期 |
| total_budget | numeric(18,2) | NOT NULL | 总预算 |
| labor_budget | numeric(18,2) | NULL | 人工预算 |
| material_budget | numeric(18,2) | NULL | 材料预算 |
| equipment_budget | numeric(18,2) | NULL | 设备预算 |
| other_budget | numeric(18,2) | NULL | 其他预算 |
| currency | varchar(10) | NOT NULL DEFAULT 'CNY' | 币种 |
| forecast_completion_cost | numeric(18,2) | NULL | 预测完工成本 |
| variance_notes | text | NULL | 偏差说明 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |

**Constraints**
- UNIQUE (project_id, version)

**Relationships**
- 关联 `projects`
