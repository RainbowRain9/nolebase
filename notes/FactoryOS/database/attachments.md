# attachments

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 附件ID |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 租户ID |
| owner_id | uuid | NOT NULL REFERENCES users(id) | 上传人 |
| file_name | varchar(255) | NOT NULL | 文件名 |
| mime_type | varchar(100) | NOT NULL | MIME 类型 |
| file_size | bigint | NOT NULL | 文件大小（字节） |
| storage_key | varchar(255) | NOT NULL | 存储对象键 |
| checksum | varchar(128) | NULL | 文件校验值 |
| tags | jsonb | NOT NULL DEFAULT '[]'::jsonb | 标签（如审批、项目） |
| source | varchar(50) | NOT NULL DEFAULT 'upload' | 来源（upload/conversation/import） |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 上传时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 最近更新人 |

**Relationships**
- 与 `approval_requests`、`project_deliverables`、`financial_records` 通过关联表或 JSON 映射
