# approval_workflows

**摘要**：审批流程定义、版本与表单配置。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 流程唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 流程编码 |
| name | varchar(255) | NOT NULL | 流程名称 |
| category | varchar(50) | NOT NULL | 流程分类 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 流程状态 |
| latest_revision | integer | NOT NULL DEFAULT 1 | 最新版本号 |
| definition | jsonb | NOT NULL DEFAULT '{}'::jsonb | 流程图定义 |
| form_schema | jsonb | NOT NULL DEFAULT '{}'::jsonb | 表单结构 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展配置 |
| published_at | timestamptz | NULL | 最近发布时间 |
| retired_at | timestamptz | NULL | 下线时间 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `definition`：节点、连线、路由规则与 SLA。
- `form_schema`：动态表单结构及校验规则。
- `metadata`：存储通知策略、权限、AI 自动建议配置。

## 索引与约束
- UNIQUE (company_id, code)
- INDEX idx_workflows_status (company_id, status)
- GIN (definition)

## 关系
- 多对一 -> companies.id
- 一对多 -> approval_requests.workflow_id

## 设计权衡
版本信息嵌入 JSON，减少版本表，但需要在应用层管理 revision 快照。
