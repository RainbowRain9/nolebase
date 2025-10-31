# approval_request_attachments

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| request_id | uuid | NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE | 审批单ID |
| attachment_id | uuid | NOT NULL REFERENCES attachments(id) ON DELETE CASCADE | 附件ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| is_required | boolean | NOT NULL DEFAULT false | 是否必传附件 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 关联时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 关联操作人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Constraints**
- PRIMARY KEY (request_id, attachment_id)

**Relationships**
- 连接 `approval_requests` 与 `attachments`
