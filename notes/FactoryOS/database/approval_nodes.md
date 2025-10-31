# approval_nodes

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 节点ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| workflow_version_id | uuid | NOT NULL REFERENCES approval_workflow_versions(id) ON DELETE CASCADE | 所属流程版本 |
| code | varchar(100) | NOT NULL | 节点标识 |
| name | varchar(150) | NOT NULL | 节点名称 |
| node_type | varchar(30) | NOT NULL CHECK (node_type IN ('start','approval','review','cc','automated','end')) | 节点类型 |
| assignee_strategy | jsonb | NOT NULL DEFAULT '{}'::jsonb | 指派策略（角色、部门、表达式） |
| sla_minutes | integer | NULL | SLA（分钟） |
| allow_delegate | boolean | NOT NULL DEFAULT false | 是否允许转办 |
| allow_consignment | boolean | NOT NULL DEFAULT false | 是否允许加签 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 其他配置（表单片段、权限） |
| sort_order | integer | NOT NULL | 节点顺序 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (workflow_version_id, code)

**Relationships**
- 关联 `approval_rules`
- 生成 `approval_request_steps`
