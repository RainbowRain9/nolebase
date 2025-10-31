# approval_workflows

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 审批流程定义ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| code | varchar(100) | NOT NULL | 流程编码（公司内唯一） |
| name | varchar(200) | NOT NULL | 流程名称 |
| business_domain | varchar(50) | NOT NULL CHECK (business_domain IN ('leave','travel','expense','seal','custom','project','finance')) | 业务域 |
| description | text | NULL | 流程描述 |
| is_system | boolean | NOT NULL DEFAULT false | 是否系统预置 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (company_id, code)

**Relationships**
- 关联多个 `approval_workflow_versions`
