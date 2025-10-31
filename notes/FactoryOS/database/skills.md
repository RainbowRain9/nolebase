# skills

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 技能ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| category_id | uuid | NULL REFERENCES skill_categories(id) ON DELETE SET NULL | 分类 |
| name | varchar(150) | NOT NULL | 技能名称 |
| code | varchar(100) | NOT NULL | 技能编码（公司内唯一） |
| description | text | NULL | 技能描述 |
| proficiency_levels | jsonb | NOT NULL DEFAULT '[]'::jsonb | 熟练度定义 |
| is_active | boolean | NOT NULL DEFAULT true | 是否启用 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (company_id, code)

**Relationships**
- 被 `employee_skills` 引用
