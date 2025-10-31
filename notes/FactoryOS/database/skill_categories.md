# skill_categories

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 技能分类ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| name | varchar(150) | NOT NULL | 分类名称 |
| code | varchar(100) | NOT NULL | 分类编码（公司内唯一） |
| description | text | NULL | 分类说明 |
| parent_id | uuid | NULL REFERENCES skill_categories(id) ON DELETE SET NULL | 父分类 |
| sort_order | integer | NOT NULL DEFAULT 0 | 排序 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (company_id, code)

**Relationships**
- 关联多个 `skills`
