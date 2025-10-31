# project_deliverables

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 交付物ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 项目ID |
| name | varchar(200) | NOT NULL | 交付物名称 |
| type | varchar(50) | NOT NULL CHECK (type IN ('document','prototype','release','report','other')) | 交付物类型 |
| description | text | NULL | 描述 |
| owner_id | uuid | NULL REFERENCES users(id) | 责任人 |
| due_date | date | NULL | 截止日期 |
| status | varchar(20) | NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_progress','delivered','accepted','rejected')) | 状态 |
| acceptance_at | timestamptz | NULL | 验收时间 |
| attachment_ids | jsonb | NOT NULL DEFAULT '[]'::jsonb | 关联附件ID 列表 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 额外信息（审批单引用等） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 可绑定 `approval_requests`（验收审批）
- 与 `project_tasks`联动
