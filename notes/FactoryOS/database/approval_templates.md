# approval_templates

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 模板ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE | 关联流程定义 |
| code | varchar(100) | NOT NULL | 模板编码（公司内唯一） |
| name | varchar(200) | NOT NULL | 模板名称 |
| form_schema | jsonb | NOT NULL | 表单Schema（字段/校验/脱敏） |
| default_values | jsonb | NOT NULL DEFAULT '{}'::jsonb | 默认值配置 |
| attachments_required | boolean | NOT NULL DEFAULT false | 是否必须附件 |
| status | varchar(20) | NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')) | 模板状态 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 额外信息（限制、说明） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 用于创建 `approval_requests`
