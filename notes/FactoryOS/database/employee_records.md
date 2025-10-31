# employee_records

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| user_id | uuid | PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE | 员工对应用户ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| employee_number | varchar(100) | NOT NULL | 员工编号（公司内唯一） |
| employment_status | varchar(30) | NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active','probation','on_leave','terminated')) | 任职状态 |
| hire_date | date | NULL | 入职日期 |
| probation_end_date | date | NULL | 试用期结束 |
| termination_date | date | NULL | 离职日期 |
| termination_reason | text | NULL | 离职原因 |
| job_title | varchar(150) | NULL | 职位名称 |
| job_level | varchar(50) | NULL | 职级 |
| cost_center | varchar(100) | NULL | 成本中心 |
| salary_info | jsonb | NOT NULL DEFAULT '{}'::jsonb | 薪酬信息（加密/脱敏） |
| contract_type | varchar(50) | NULL | 合同类型 |
| work_location | varchar(150) | NULL | 工作地点 |
| emergency_contacts | jsonb | NOT NULL DEFAULT '[]'::jsonb | 紧急联系人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 其他字段 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (company_id, employee_number)

**Relationships**
- 一对一 `users`
- 关联 `employee_histories`、`employee_efficiency_scores`
