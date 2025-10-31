# FactoryOS Mock 接口说明

本文档基于《docs/architecture.md》、《docs/prd.md》与《docs/database-schema.md》，定义 FactoryOS 平台 Mock 服务的统一接口契约，供前端联调、自动化测试与验收验证使用。所有接口遵循 RESTful 风格，使用 PostgreSQL 15+ 数据模型的字段命名（`snake_case`），并覆盖项目、财务、审批、人事、资料库等核心业务场景。

## 通用信息

- **Base URL**：`http://localhost:5666/api`（前端可通过开发代理转发到 `/api`）。
- **鉴权 (Authentication)**：除 `/auth/login` 与 `/auth/refresh` 外所有接口需在请求头加入 `Authorization: Bearer <access_token>`。`access_token` 由登录接口签发，刷新接口使用 httpOnly Cookie `refresh_token`。
- **多租户 (Multi-tenancy)**：所有业务接口必须携带 `X-Company-Code` 请求头，取值与 `companies.code` 一致（如 `weibo`、`lidong_fujian`、`lidong_chengdu`），后端据此限定 `company_id`。
- **统一返回格式**：
  ```json
  {
    "code": 0,
    "data": {},
    "message": "ok",
    "error": null,
    "meta": {
      "request_id": "uuid",
      "timestamp": "2025-10-29T08:00:00Z"
    }
  }
  ```
  - 成功：`code = 0`，`data` 携带业务结果；分页统一结构为 `{ items, total, page, page_size }`。
  - 失败：`code != 0`，`error` 描述技术原因，`message` 面向用户。
- **错误码与异常 (Error Codes & Exceptions)**：
  | HTTP 状态 | code | 描述 |
  | --- | --- | --- |
  | 400 Bad Request | 1001 | 参数缺失或格式错误 |
  | 401 Unauthorized | 1002 | Token 缺失、过期或无效 |
  | 403 Forbidden | 1003 | 权限不足或跨租户访问被拒绝 |
  | 404 Not Found | 1004 | 资源不存在或已删除 |
  | 409 Conflict | 1005 | 资源冲突（如项目编码重复、审批状态不允许） |
  | 422 Unprocessable Entity | 1006 | 业务校验失败（如预算不足、规则未命中） |
  | 500 Internal Server Error | 1999 | 未处理异常（记录 `request_id` 便于追踪） |

---

## 认证 (Authentication)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/auth/login` | POST | 用户登录，签发访问令牌与刷新 Cookie | Body：`{ email, password }` 对应 `users.email`；响应包含 `users`、`user_profiles`、`roles`、`permissions` |
| `/auth/refresh` | POST | 刷新访问令牌 | Cookie：`refresh_token`；响应返回新的 `access_token` |
| `/auth/logout` | POST | 注销，清除刷新 Cookie | Header：`Authorization`；响应 `data: null` |
| `/auth/me` | GET | 获取当前用户上下文 | Header：`Authorization`；返回聚合后的 `user`, `user_profile`, `employee_record`, `user_roles`, `role_permissions` |
| `/auth/codes` | GET | 拉取权限码列表 | Header：`Authorization`；返回 `permissions.code` 数组 |

### 示例：登录

**请求**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json
```
```json
{
  "email": "jane.doe@factoryos.com",
  "password": "Secret123!"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "access_token": "mocked.jwt.token",
    "user": {
      "id": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
      "company_id": "4a9e44f6-2b7e-4f94-a8e3-6a7391f538d1",
      "department_id": "1dbb4f4e-6316-4a6b-a2fd-88d3f56d3b8b",
      "email": "jane.doe@factoryos.com",
      "username": "jane.doe",
      "status": "active",
      "auth_provider": "password",
      "last_login_at": "2025-10-29T03:25:00Z",
      "locale": "zh-CN",
      "timezone": "Asia/Shanghai",
      "is_mfa_enabled": true,
      "created_at": "2024-02-01T09:00:00Z",
      "updated_at": "2025-10-29T03:25:00Z"
    },
    "user_profile": {
      "user_id": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
      "company_id": "4a9e44f6-2b7e-4f94-a8e3-6a7391f538d1",
      "first_name": "Jane",
      "last_name": "Doe",
      "position": "Project Manager",
      "employee_code": "WB-PM-102",
      "manager_id": "5b4e7fd9-9d1b-4f42-bf4a-9594a3f4e6aa",
      "preferences": {
        "theme": "dark",
        "default_project_view": "gantt"
      },
      "created_at": "2024-02-01T09:00:00Z",
      "updated_at": "2025-09-30T10:00:00Z"
    },
    "roles": [
      {
        "id": "87963945-73bc-4f0a-b335-1a5acc6b9f15",
        "company_id": "4a9e44f6-2b7e-4f94-a8e3-6a7391f538d1",
        "code": "project_manager",
        "name": "项目经理"
      }
    ],
    "permissions": [
      {
        "id": "c1e41f4f-a9a9-4a77-b0f0-6f22840f4a1f",
        "company_id": "4a9e44f6-2b7e-4f94-a8e3-6a7391f538d1",
        "code": "projects:create",
        "scope": "entity"
      }
    ]
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "e2f33628-5fea-4d51-9bc8-aa5f9985d91f",
    "timestamp": "2025-10-29T03:25:01Z"
  }
}
```

---

## 项目管理 (Projects)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/projects` | GET | 分页查询项目列表 | Query：`status`、`priority`、`manager_id`、`department_id`、`q`、`page`、`page_size`；返回 `projects` 与分页元数据 |
| `/projects` | POST | 创建项目 | Body 对齐 `projects`：`code`、`name`、`description`、`manager_id`、`department_id`、`priority`、`start_date`、`planned_end_date`、`budget_total`、`budget_currency` 等 |
| `/projects/{project_id}` | GET | 获取项目详情 | 路径参数 `project_id`；返回项目、`project_members`、`project_milestones`、`project_tasks` 概览 |
| `/projects/{project_id}/tasks` | POST | 添加项目任务 | Body：`name`、`description`、`task_type`、`status`、`priority`、`assignee_id`、`milestone_id`、`start_date`、`due_date`、`estimated_hours` 等 |
| `/projects/{project_id}/weekly-deliveries` | GET | 获取项目周交付报告 | Query：`week_start_date`、`page`、`page_size`；返回 `project_weekly_deliveries` |
| `/projects/{project_id}/cost-records` | GET | 查询项目成本记录 | Query：`cost_category`、`cost_type`、`start_date`、`end_date`；返回 `project_cost_records` |
| `/projects/{project_id}/budget-snapshots` | GET | 获取预算快照历史 | Query：`page`、`page_size`；返回 `project_budget_snapshots` |

### 示例：创建项目

**请求**
```http
POST /api/projects HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: weibo
```
```json
{
  "code": "WB-PJ-2025-001",
  "name": "智能装配线升级",
  "description": "面向 2026 财年的智能装配线升级项目，覆盖生产线改造与 AI 助手部署。",
  "manager_id": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
  "department_id": "1dbb4f4e-6316-4a6b-a2fd-88d3f56d3b8b",
  "priority": "high",
  "status": "planning",
  "start_date": "2025-11-01",
  "planned_end_date": "2026-06-30",
  "budget_total": "3200000.00",
  "budget_currency": "CNY",
  "metadata": {
    "template_id": "f3a51765-6628-4aef-9307-1f87b08cb369",
    "source": "conversation"
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "project": {
      "id": "ec65f6f1-1fd4-4a04-902a-038ec4eb3f86",
      "company_id": "4a9e44f6-2b7e-4f94-a8e3-6a7391f538d1",
      "code": "WB-PJ-2025-001",
      "name": "智能装配线升级",
      "description": "面向 2026 财年的智能装配线升级项目，覆盖生产线改造与 AI 助手部署。",
      "manager_id": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
      "department_id": "1dbb4f4e-6316-4a6b-a2fd-88d3f56d3b8b",
      "status": "planning",
      "priority": "high",
      "start_date": "2025-11-01",
      "end_date": null,
      "planned_end_date": "2026-06-30",
      "progress_percent": "0.00",
      "health_status": "on_track",
      "risk_summary": null,
      "budget_total": "3200000.00",
      "budget_currency": "CNY",
      "last_report_at": null,
      "metadata": {
        "template_id": "f3a51765-6628-4aef-9307-1f87b08cb369",
        "source": "conversation"
      },
      "created_at": "2025-10-29T08:00:00Z",
      "updated_at": "2025-10-29T08:00:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "6ce25464-82d7-41cd-9dcc-74a7a3f0c3c0",
    "timestamp": "2025-10-29T08:00:01Z"
  }
}
```

---

## 财务管理 (Finance)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/finance/records` | GET | 分页查询财务记录 | Query：`type`、`category_id`、`start_date`、`end_date`、`project_id`、`status`、`page`、`page_size`；返回 `financial_records` |
| `/finance/records` | POST | 新增财务记录 | Body：`type`、`category_id`、`amount`、`currency`、`description`、`record_date`、`source_system`、`approval_request_id` 等 |
| `/finance/report-templates` | GET | 查询报表模板 | Query：`status`、`frequency`；返回 `financial_report_templates` |
| `/finance/report-runs` | POST | 生成财务报表 | Body：`template_id`、`scheduled_at`、`parameters`（含 `period_start`、`period_end`）、`triggered_by` |
| `/finance/report-runs` | GET | 查询报表执行历史 | Query：`template_id`、`status`、`page`、`page_size`；返回 `financial_report_runs` |
| `/finance/alert-rules` | GET | 获取预警规则列表 | Query：`status`、`metric`、`severity`；返回 `financial_alert_rules` |
| `/finance/alert-events` | GET | 查询预警事件 | Query：`status`、`metric`、`start_at`、`end_at`；返回 `financial_alert_events` |
| `/finance/data-sources` | GET | 获取财务数据源配置 | 返回 `financial_data_sources` |

### 示例：生成财务报表

**请求**
```http
POST /api/finance/report-runs HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "template_id": "a2f3d2f0-657e-42a5-9d5c-2e73ef2bcd5f",
  "scheduled_at": "2025-10-29T00:00:00Z",
  "parameters": {
    "period_start": "2025-10-01",
    "period_end": "2025-10-28",
    "dimension": "department_id",
    "currency": "CNY"
  },
  "triggered_by": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "report_run": {
      "id": "f4f38fa8-9d05-4f5e-9fcd-efba8d941ac4",
      "company_id": "7b2cd3f7-8f41-4bf5-9692-447ad7b93db4",
      "template_id": "a2f3d2f0-657e-42a5-9d5c-2e73ef2bcd5f",
      "scheduled_at": "2025-10-29T00:00:00Z",
      "executed_at": "2025-10-29T00:00:02Z",
      "status": "success",
      "parameters": {
        "period_start": "2025-10-01",
        "period_end": "2025-10-28",
        "dimension": "department_id",
        "currency": "CNY"
      },
      "output_location": {
        "type": "file",
        "path": "s3://mock-bucket/reports/f4f38fa8-9d05.pdf"
      },
      "insights": [
        {
          "metric": "expense_total",
          "variance": -0.18,
          "comment": "生产部门费用环比下降 18%，主要受采购节流影响。"
        }
      ],
      "triggered_by": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
      "created_at": "2025-10-29T00:00:02Z",
      "updated_at": "2025-10-29T00:00:02Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "353c2fa6-aa20-4f13-bb6c-b4fc12264746",
    "timestamp": "2025-10-29T00:00:02Z"
  }
}
```

---

## 审批管理 (Approvals)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/approval-requests` | POST | 创建审批单（草稿或提交） | Body：对齐 `approval_requests`，含 `request_type`、`title`、`amount`、`currency`、`template_id`、`form_data`、`attachments` |
| `/approval-requests` | GET | 查询我发起的审批单 | Query：`status`、`request_type`、`start_at`、`end_at`、`amount_min`、`amount_max`、`page`、`page_size` |
| `/approval-requests/{request_id}` | GET | 审批单详情 | 返回 `approval_requests`、`approval_request_steps`、`approval_request_actions`、`approval_request_attachments` |
| `/approvals/inbox` | GET | 审批待办列表 | Query：`status=pending`、`priority`、`node`、`initiator`、`department_id`、`sla`、`page`、`page_size`，结果来自 `approval_request_steps` |
| `/approvals/history` | GET | 审批历史列表 | Query：`status`、`action_type`、`start_at`、`end_at`、`page`、`page_size` |
| `/approvals/{step_id}/actions` | POST | 节点操作（同意/驳回/转办/加签/催办） | Body：`action_type`、`comment`、`target_assignee_id` 等，对齐 `approval_request_actions` |
| `/approval-workflows` | GET | 获取流程定义与版本 | Query：`business_domain`、`status`；返回 `approval_workflows` & `approval_workflow_versions` |
| `/approval-rules/{version_id}` | GET | 查看流程规则 | 返回 `approval_rules`，用于前端解释命中情况 |

### 示例：审批待办列表

**请求**
```http
GET /api/approvals/inbox?status=pending&page=1&page_size=20 HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: weibo
```

**响应**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "f95091d5-1f2d-4ba9-a1a3-be91f5e2c861",
        "company_id": "4a9e44f6-2b7e-4f94-a8e3-6a7391f538d1",
        "request_id": "3ed64056-62d7-4a4c-830b-bf69c4c92760",
        "node_id": "8448c730-7a7a-46f5-803c-0330c5b08edb",
        "step_order": 2,
        "assignee_id": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
        "status": "pending",
        "assigned_at": "2025-10-28T23:10:00Z",
        "deadline_at": "2025-10-29T23:10:00Z",
        "metadata": {
          "sla_minutes": 1440,
          "request_title": "10 月差旅报销",
          "amount": "5820.00",
          "currency": "CNY"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "a0ea6ee7-7f1a-4c3e-b2b3-0fbccb6cf504",
    "timestamp": "2025-10-29T04:22:00Z"
  }
}
```

---

## 员工管理 (HR)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/hr/employees` | GET | 分页查询员工档案 | Query：`employment_status`、`department_id`、`job_title`、`keyword`、分页；返回 `employee_records` 与 `users` 基本信息 |
| `/hr/employees/{user_id}` | GET | 员工详情 | 返回 `employee_records`、`user_profiles`、`employee_histories`、`employee_skills` |
| `/hr/employees/{user_id}` | PUT | 更新员工档案（需审批） | Body 对齐 `employee_records`，字段变更将生成 `employee_histories`，返回 `approval_request_id` |
| `/hr/efficiency-scores` | GET | 查询效率评分 | Query：`period_start`、`period_end`、`department_id`；返回 `employee_efficiency_scores` |
| `/hr/efficiency-reports` | POST | 生成效率报告 | Body：`report_type`、`owner_user_id`、`department_id`、`period_start`、`period_end`、`content`，对应 `employee_efficiency_reports` |
| `/hr/skills` | GET | 获取技能与分类 | 返回 `skill_categories`、`skills`；支持 `is_active` 筛选 |

### 示例：查询员工档案

**请求**
```http
GET /api/hr/employees?page=1&page_size=10&employment_status=active HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_chengdu
```

**响应**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "user": {
          "id": "a668b69c-75d3-47d7-8c89-df5136c2fc6f",
          "email": "li.mei@factoryos.com",
          "username": "li.mei",
          "status": "active",
          "department_id": "3f62f763-3b6a-4a03-8f6b-ff4ed4c4bf53"
        },
        "employee_record": {
          "user_id": "a668b69c-75d3-47d7-8c89-df5136c2fc6f",
          "company_id": "b65c1f98-d0cd-4f29-8c6d-8bf471d8f249",
          "employee_number": "CD-ENG-021",
          "employment_status": "active",
          "hire_date": "2022-05-16",
          "job_title": "高级前端工程师",
          "job_level": "P5",
          "cost_center": "ENG-FE",
          "salary_info": {
            "base": 28000,
            "currency": "CNY"
          },
          "work_location": "成都 · 高新区",
          "metadata": {
            "default_language": "zh-CN"
          },
          "created_at": "2022-05-16T08:00:00Z",
          "updated_at": "2025-08-01T02:00:00Z"
        },
        "skills": [
          {
            "skill_id": "c73af7f3-52c2-4aaf-b6b9-0f16f3dc0a02",
            "name": "Vue 3",
            "proficiency": "expert",
            "last_validated_at": "2025-07-01T00:00:00Z"
          }
        ]
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 10
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "d7af2fb0-97f8-4aa8-9dd1-9f7ab77ff671",
    "timestamp": "2025-10-29T05:18:00Z"
  }
}
```

---

## 资料库 (Knowledge)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/knowledge/assets` | GET | 分页检索资料库资产 | Query：`keyword`、`type`（映射 `attachments.tags`）、`owner_id`、`created_start`、`created_end`、分页；返回 `attachments` 元数据 |
| `/knowledge/assets` | POST | 上传资料资产 | Body：`file_name`、`mime_type`、`file_size`、`storage_key`、`tags`、`source`；返回 `attachments` 记录 |
| `/knowledge/assets/{attachment_id}` | GET | 资料资产详情 | 返回 `attachments`，含 `metadata` 与引用的审批或项目信息 |
| `/knowledge/assets/{attachment_id}/share-links` | POST | 生成分享链接 | Body：`expire_at`、`permissions`，在 `metadata` 中写入分享信息 |
| `/knowledge/search` | POST | 语义检索接口（Mock） | Body：`q`、`filters`；返回 `attachments` 命中列表及匹配度 |

### 示例：上传资料资产

**请求**
```http
POST /api/knowledge/assets HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: weibo
```
```json
{
  "file_name": "项目周报模板_v2.docx",
  "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "file_size": 482176,
  "storage_key": "oss://mock-bucket/knowledge/templates/project-weekly-v2.docx",
  "tags": ["template", "project", "weekly_report"],
  "source": "upload",
  "metadata": {
    "related_project_id": "ec65f6f1-1fd4-4a04-902a-038ec4eb3f86"
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "attachment": {
      "id": "452f8b7d-7612-4f41-8e9b-2f7bde23a7bb",
      "company_id": "4a9e44f6-2b7e-4f94-a8e3-6a7391f538d1",
      "owner_id": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
      "file_name": "项目周报模板_v2.docx",
      "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "file_size": 482176,
      "storage_key": "oss://mock-bucket/knowledge/templates/project-weekly-v2.docx",
      "checksum": "08f3d80a73a9d89c1c1d3f9ae8b0a9d8",
      "tags": [
        "template",
        "project",
        "weekly_report"
      ],
      "source": "upload",
      "created_at": "2025-10-29T06:12:00Z",
      "updated_at": "2025-10-29T06:12:00Z",
      "metadata": {
        "related_project_id": "ec65f6f1-1fd4-4a04-902a-038ec4eb3f86"
      }
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "f3b19d90-5c4f-4b7c-9a2d-0d4d2dc5a3f5",
    "timestamp": "2025-10-29T06:12:00Z"
  }
}
```

---

## 联调说明与约束

1. **租户隔离**：前端在接口调用层面需始终携带 `X-Company-Code`，后端 Mock 会在响应中返回对应 `company_id` 以便校验上下游逻辑是否透传成功。
2. **字段对齐**：本文档中出现的字段名称及结构均直接映射到 `docs/database-schema.md` 的 PostgreSQL 表字段，前端不得自行增删字段，需透出完整原始对象供联调验证。
3. **权限校验模拟**：Mock 服务根据 `user_roles`、`role_permissions`、`permissions` 手工配置接口可访问性；当请求无权限时返回 `403/1003`，请前端实现对应的拦截与提示。
4. **审计追踪**：所有写操作响应内含 `meta.request_id`，前端在日志中应保留该字段，便于真实环境接入链路追踪与审计。
5. **Mock 数据持久性**：服务重启会重置内存数据；为方便重现复杂流程，可将请求与响应示例作为 Playwright/E2E 剧本的固定基线。***
