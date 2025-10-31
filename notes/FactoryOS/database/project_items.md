# project_items

**摘要**：统一承载任务、里程碑、交付物及周报节点。

| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 事项唯一标识 |
| project_id | uuid | NOT NULL REFERENCES projects(id) ON DELETE CASCADE | 关联项目 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| parent_item_id | uuid | NULL REFERENCES project_items(id) ON DELETE SET NULL | 父事项 |
| item_type | varchar(30) | NOT NULL CHECK (item_type IN ('task','milestone','deliverable','update')) | 事项类型 |
| title | varchar(255) | NOT NULL | 标题 |
| description | text | NULL | 说明 |
| status | varchar(30) | NOT NULL DEFAULT 'open' | 状态 |
| priority | varchar(20) | NOT NULL DEFAULT 'normal' | 优先级 |
| assignee_id | uuid | NULL REFERENCES users(id) | 负责人 |
| dependency_ids | uuid[] | NULL | 依赖事项 |
| planned_start | date | NULL | 计划开始 |
| planned_end | date | NULL | 计划结束 |
| actual_start | date | NULL | 实际开始 |
| actual_end | date | NULL | 实际结束 |
| progress_metrics | jsonb | NOT NULL DEFAULT '{}'::jsonb | 进度指标 |
| timeline | jsonb | NOT NULL DEFAULT '[]'::jsonb | 活动时间线 |
| linked_resources | jsonb | NOT NULL DEFAULT '{}'::jsonb | 关联资源 |
| tags | text[] | NULL | 标签 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## JSON 字段
- `progress_metrics`：存储燃尽、完成率、成本偏差等指标。
- `timeline`：记录评论、状态变更等事件。
- `linked_resources`：引用审批单、订单、财务记录或附件 ID。

## 索引与约束
- INDEX idx_project_items_type (project_id, item_type)
- GIN (progress_metrics)
- GIN (timeline)

## 关系
- 多对一 -> projects.id
- 多对一 -> users.id
- 自关联 -> project_items.parent_item_id

## 设计权衡
单表承载多种事项，结构简洁，但类型特有字段需通过 JSON 处理。
