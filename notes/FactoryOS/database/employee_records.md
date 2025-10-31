# employee_records

**摘要**：员工主数据与雇佣信息。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 档案唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 关联用户 |
| employee_code | varchar(50) | NOT NULL | 员工编号 |
| employment_type | varchar(30) | NOT NULL | 用工类型 |
| position_title | varchar(150) | NOT NULL | 职位 |
| manager_id | uuid | NULL REFERENCES employee_records(id) | 直属上级 |
| hire_date | date | NULL | 入职日期 |
| termination_date | date | NULL | 离职日期 |
| salary_currency | char(3) | NULL | 薪资币种 |
| salary_amount | numeric(12,2) | NULL | 薪资金额 |
| org_path | ltree | NULL | 组织路径 |
| profile | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 在职状态 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `profile`：囊括证件、合同、福利等信息。

## 索引与约束
- UNIQUE (company_id, employee_code)
- INDEX idx_employee_records_status (company_id, status)
- GIN (profile)

## 关系
- 多对一 -> companies.id
- 多对一 -> users.id
- 一对多 -> employee_histories.employee_id
- 一对多 -> employee_efficiency_metrics.employee_id

## 设计权衡
去除技能相关表后把能力标签并入 profile，结构简单但缺乏关系约束。
