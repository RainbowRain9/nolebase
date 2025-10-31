# employee_skills

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 员工 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| skill_id | uuid | NOT NULL REFERENCES skills(id) ON DELETE CASCADE | 技能 |
| proficiency | varchar(20) | NOT NULL | 熟练度等级（与技能定义对齐） |
| last_validated_at | timestamptz | NULL | 最近验证时间 |
| validated_by | uuid | NULL REFERENCES users(id) | 验证人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 附加信息（项目经验） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- PRIMARY KEY (user_id, skill_id)
- `company_id` 对齐两端实体

**Relationships**
- 支撑排班建议与能力缺口分析
