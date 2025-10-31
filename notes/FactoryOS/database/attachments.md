# attachments

**摘要**：二进制资源及其元数据的统一注册表。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 附件唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| file_name | varchar(255) | NOT NULL | 文件名 |
| content_type | varchar(120) | NOT NULL | 内容类型 |
| size_bytes | bigint | NOT NULL | 文件大小 |
| storage_path | varchar(500) | NOT NULL | 存储路径或对象存储键 |
| checksum | varchar(128) | NOT NULL | 完整性校验 |
| category | varchar(50) | NOT NULL DEFAULT 'general' | 附件类别 |
| owner_id | uuid | NULL REFERENCES users(id) | 上传人 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| uploaded_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 上传时间 |

## JSON 字段
- `metadata`：可记录来源模块、缩略图、OCR 摘要等。

## 索引与约束
- INDEX idx_attachments_company_category (company_id, category)
- GIN (metadata)

## 关系
- 多对一 -> companies.id
- 多对一 -> users.id
- 逻辑关联 -> orders.attachments (JSON)

## 设计权衡
附件均以引用方式关联，降低交叉外键，但需应用层控制一致性。
