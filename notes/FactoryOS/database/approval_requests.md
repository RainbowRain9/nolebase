# approval_requests

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 审批单ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| requester_id | uuid | NOT NULL REFERENCES users(id) | 申请人 |
| department_id | uuid | NULL REFERENCES departments(id) | 申请人部门 |
| workflow_version_id | uuid | NOT NULL REFERENCES approval_workflow_versions(id) | 使用的流程版本 |
| template_id | uuid | NULL REFERENCES approval_templates(id) | 来源模板 |
| code | varchar(100) | NOT NULL | 审批单号（公司内唯一） |
| title | varchar(300) | NOT NULL | 标题 |
| request_type | varchar(50) | NOT NULL | 类型（leave/travel/expense/seal/custom 等） |
| status | varchar(30) | NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','running','approved','rejected','withdrawn','cancelled')) | 状态 |
| priority | varchar(20) | NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')) | 优先级 |
| amount | numeric(18,2) | NULL | 金额（用于金额类申请） |
| currency | varchar(10) | NULL DEFAULT 'CNY' | 币种 |
| sla_due_at | timestamptz | NULL | SLA 到期时间 |
| current_node_id | uuid | NULL REFERENCES approval_nodes(id) | 当前节点 |
| form_data | jsonb | NOT NULL DEFAULT '{}'::jsonb | 表单数据（脱敏控制） |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件元数据列表 |
| conversation_id | uuid | NULL REFERENCES ai_conversations(id) | 对话发起来源 |
| submitted_at | timestamptz | NULL | 提交时间 |
| completed_at | timestamptz | NULL | 完成时间 |
| cancelled_at | timestamptz | NULL | 撤回/取消时间 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 其他信息（订阅、标签） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人（通常= requester） |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- UNIQUE (company_id, code)

**Relationships**
- 关联 `approval_request_steps`、`approval_actions`
- 可关联 `financial_records`、`project_cost_records`
