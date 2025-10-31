# approval_workflow_versions

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 流程版本ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| workflow_id | uuid | NOT NULL REFERENCES approval_workflows(id) ON DELETE CASCADE | 流程定义 |
| version | integer | NOT NULL | 版本号 |
| status | varchar(20) | NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')) | 版本状态 |
| effective_at | timestamptz | NULL | 生效时间 |
| deprecated_at | timestamptz | NULL | 停用时间 |
| change_summary | text | NULL | 版本更新说明 |
| simulation_result | jsonb | NOT NULL DEFAULT '{}'::jsonb | 发布前模拟校验结果 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (workflow_id, version)
- 每个公司仅允许一个 `status='active'` 版本（需逻辑约束）

**Relationships**
- 包含多个 `approval_nodes`、`approval_rules`
- 被 `approval_requests` 引用
