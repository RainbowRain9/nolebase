# approval_rules

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 规则ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| workflow_version_id | uuid | NOT NULL REFERENCES approval_workflow_versions(id) ON DELETE CASCADE | 所属流程版本 |
| node_id | uuid | NULL REFERENCES approval_nodes(id) ON DELETE CASCADE | 目标节点 |
| rule_type | varchar(30) | NOT NULL CHECK (rule_type IN ('condition','assignment','notification','exit')) | 规则类型 |
| expression | jsonb | NOT NULL | 条件表达式（DSL/JSONLogic） |
| priority | integer | NOT NULL DEFAULT 1 | 规则优先级 |
| description | text | NULL | 规则说明 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 被 `approval_requests` 执行日志引用
