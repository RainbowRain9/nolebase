# FactoryOS API 规约 (Production)

## 1. 引言与通用规约

### 1.1 文档目的
本文件是 FactoryOS 企业级协作平台的正式 API 契约，作为后端实现、前端消费、自动化测试及第三方集成的唯一事实来源 (Single Source of Truth)。所有接口必须遵循本文档描述的行为、数据结构与非功能性约束。

### 1.2 协议与基础约定
- **协议**：HTTPS + JSON；编码 UTF-8；所有时间字段使用 ISO 8601 (`YYYY-MM-DDTHH:mm:ssZ`)。
- **版本与路径**：所有接口以 `/api/v1` 为前缀；版本升级需向后兼容或发布 `/api/v{n}` 新版本。

### 1.3 认证 (JWT Bearer)
- 登录成功后返回 `access_token`（JWT）和 `refresh_token`（httpOnly、Secure Cookie）。
- 受保护接口必须携带 `Authorization: Bearer <access_token>`。
- 访问令牌默认有效期 30 分钟；刷新令牌 7 天；靠近过期时前端调用刷新接口。

### 1.4 多租户 (Multi-tenancy)
- 所有业务接口必须携带 `X-Company-Code` 请求头，取值与 `companies.code` 一致。
- 服务端根据 `X-Company-Code` 决定 `company_id` 上下文，并对请求进行租户隔离；跨租户访问返回 `403 FORBIDDEN`。

### 1.5 统一响应格式
```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "meta": {
    "request_id": "uuid",
    "timestamp": "2025-10-29T08:00:00Z",
    "page": 1,
    "page_size": 20,
    "total": 120
  },
  "error": null
}
```
- **成功**：`code = 0`，`data` 携带业务结果。分页接口在 `meta` 中返回分页元数据。
- **失败**：`code != 0`，`error` 包含技术细节，`message` 为用户友好提示。

### 1.6 错误码与异常
| HTTP | code | 业务错误码示例 | 说明 |
| --- | --- | --- | --- |
| 400 | 1001 | `VALIDATION_FAILED` | 参数校验失败 |
| 401 | 1002 | `AUTH_TOKEN_INVALID` | Token 缺失或过期 |
| 403 | 1003 | `PERMISSION_DENIED` | 权限不足或跨租户访问 |
| 404 | 1004 | `RESOURCE_NOT_FOUND` | 资源不存在 |
| 409 | 1005 | `STATE_CONFLICT` | 状态冲突（如重复提交） |
| 422 | 1006 | `BUSINESS_RULE_VIOLATED` | 业务校验失败 |
| 429 | 1010 | `RATE_LIMIT_EXCEEDED` | 超出速率限制 |
| 500 | 1999 | `INTERNAL_ERROR` | 未处理异常（需记录 `request_id`） |

### 1.7 分页、排序与过滤
- 通用 Query：`page`(default=1)、`page_size`(default=20, max=100)、`sort_by`、`sort_order`(`asc|desc`)。
- `sort_by` 字段必须在接口文档中列出的允许集合内，否则返回 `400/VALIDATION_FAILED`。
- 过滤条件遵循 `field=value` 形式或范围参数如 `start_date`、`end_date`。

### 1.8 幂等性
- 所有具有副作用的 `POST`/`PUT` 接口要求 `Idempotency-Key` 请求头（UUID v4，全局唯一，缓存 24 小时）。
- 服务端基于 `company_id + user_id + Idempotency-Key + endpoint` 判重；重复请求返回首次响应。

### 1.9 审计与追踪
- 后端为每个请求生成 `request_id` 并返回于 `meta`。
- 关键操作写入审计表（如 `approval_audit_logs`、`project_cost_records`、`employee_histories`）。

### 1.10 速率限制
- 默认用户级限流：`60 req/minute`；写操作冒烟环境可放宽到 `30 req/minute`。
- 特殊接口如报告生成、审批动作具独立限制，详见各端点。

---

## 2. 模块接口

### 2.1 认证模块 (Authentication)

#### 2.1.1 POST /api/v1/auth/login
- **描述**：用户登录并签发访问令牌。
- **所需权限**：公共接口（无需前置 Token）。

**请求**
- 路径参数：无
- 查询参数：无
- 请求体：
```json
{
  "email": "jane.doe@factoryos.com",
  "password": "Secret123!"
}
```

| 字段 | 类型 | 校验规则 | 描述 |
| --- | --- | --- | --- |
| email | string | required, maxLength:255, format:email, exists `users.email` | 登录邮箱（唯一索引） |
| password | string | required, minLength:8, maxLength:128 | 明文密码，后端校验哈希 |

**响应**
- 成功：`200 OK`
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "access_token": "jwt-token",
    "expires_in": 1800,
    "user": { "...": "users 对象字段同数据库" },
    "user_profile": { "...": "user_profiles 字段" },
    "roles": [{ "...": "roles 字段" }],
    "permissions": [{ "...": "permissions 字段" }]
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2025-10-29T08:00:00Z"
  },
  "error": null
}
```

- 错误：
  - `401 AUTH_TOKEN_INVALID`：邮箱或密码错误。
  - `403 PERMISSION_DENIED`：用户状态非 `active`。
  - `423 ACCOUNT_LOCKED`（HTTP 423）：连续失败超过 5 次。

**业务逻辑**
- 校验用户状态与租户有效期；记录最后登录时间 `users.last_login_at`。
- 若启用 MFA，需要追加二次验证流程（返回 `code=MFA_REQUIRED`）。
- 成功登录写入审计日志（事件类型 `auth.login`）。

**性能与安全**
- 速率限制：`10 req/min/IP`。
- 密码比较使用常量时间算法；失败提示统一“账号或密码错误”防止暴力破解。

---

#### 2.1.2 POST /api/v1/auth/refresh
- **描述**：刷新访问令牌。
- **所需权限**：公共（需有效 `refresh_token` Cookie）。

**请求**
- 请求体：无

**响应**
- 成功：`200 OK`
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "access_token": "new-jwt-token",
    "expires_in": 1800
  },
  "meta": { "request_id": "uuid", "timestamp": "..." },
  "error": null
}
```
- 错误：
  - `401 AUTH_TOKEN_INVALID`：刷新令牌过期/缺失。
  - `403 PERMISSION_DENIED`：刷新令牌与当前设备不匹配。

**业务逻辑**
- 校验刷新令牌签名、设备指纹；生成新访问令牌并可滚动刷新 Cookie。
- 记录刷新事件至安全日志。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 刷新令牌一旦使用成功，旧令牌失效（单点登录）。

---

#### 2.1.3 POST /api/v1/auth/logout
- **描述**：注销并使刷新令牌失效。
- **所需权限**：`auth:logout`

**请求**
- Header：`Authorization` + `refresh_token` Cookie

**响应**
- 成功：`204 No Content`
- 错误：`401 AUTH_TOKEN_INVALID`（令牌缺失）

**业务逻辑**
- 从会话存储中删除刷新令牌；记录审计。
- 触发钉钉/Slack 通知（可选）告知用户账号已登出。

**性能与安全**
- 速率限制：`20 req/min/user`。
- 幂等：重复调用返回 204。

---

#### 2.1.4 GET /api/v1/auth/me
- **描述**：获取当前用户上下文。
- **所需权限**：`auth:me:read`

**请求**
- Query：`with_permissions`(bool, default=false)

**响应**
- 成功：`200 OK` 返回 `user`, `user_profile`, `employee_record`, `user_roles`, `role_permissions`。
- 错误：`401 AUTH_TOKEN_INVALID`

**业务逻辑**
- 合并基础资料、字段级权限标记；可缓存 60 秒。

**性能与安全**
- 速率限制：`60 req/min/user`。
- 若 `with_permissions=true`，响应体可能较大，前端需缓存。

---

#### 2.1.5 GET /api/v1/auth/codes
- **描述**：获取当前用户在所选租户下可使用的权限码列表。
- **所需权限**：`auth:codes:read`

**请求**
- Query：无

**响应**
- 成功：`200 OK`
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "codes": ["projects:create", "approvals:tasks:approve"]
  },
  "meta": { "request_id": "uuid", "timestamp": "..." },
  "error": null
}
```
- 错误：
  - `400 MISSING_COMPANY_CODE`：缺少租户头。
  - `401 AUTH_TOKEN_INVALID`

**业务逻辑**
- 聚合 `user_roles` 与 `role_permissions`，按 `company_id` 去重并与权限策略（停用角色、临时冻结）联动。
- 结果缓存 60 秒，命中缓存直接返回。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 若请求头缺少 `X-Company-Code`，返回 `400 MISSING_COMPANY_CODE`。

---

### 2.2 项目管理模块 (Projects)

#### 2.2.1 POST /api/v1/projects
- **描述**：创建项目。
- **所需权限**：`projects:create`

**请求**
- Header：`Idempotency-Key`
- 请求体：
```json
{
  "code": "WB-PJ-2025-001",
  "name": "智能装配线升级",
  "description": "项目概述",
  "manager_id": "uuid",
  "department_id": "uuid",
  "priority": "high",
  "status": "planning",
  "start_date": "2025-11-01",
  "planned_end_date": "2026-06-30",
  "budget_total": "3200000.00",
  "budget_currency": "CNY",
  "metadata": {
    "template_id": "uuid",
    "source": "conversation"
  }
}
```

| 字段 | 类型 | 校验规则 | 描述 |
| --- | --- | --- | --- |
| code | string | required, maxLength:100, pattern:`^[A-Z0-9\\-]+$`, unique by `company_id` | 项目编码 |
| name | string | required, maxLength:300 | 项目名称 |
| description | string | maxLength:2000 | 项目描述 |
| manager_id | uuid | required, exists `users.id` & same company | 项目经理 |
| department_id | uuid | optional, exists `departments.id` & same company | 归属部门 |
| priority | string | enum:`low|medium|high|critical`, default:`medium` | 优先级 |
| status | string | enum:`planning|active|on_hold|completed|cancelled`, default:`planning` | 项目状态 |
| start_date | date | optional | 启动日期 |
| planned_end_date | date | optional, >= start_date | 计划结束日期 |
| budget_total | numeric | optional, decimal(18,2), >=0 | 总预算 |
| budget_currency | string | required if `budget_total`，iso4217, default:`CNY` | 币种 |
| metadata | object | optional, max 4KB | 扩展信息 |

**响应**
- 成功：`201 Created`
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "project": { "...": "projects 表字段" }
  },
  "meta": { "request_id": "uuid", "timestamp": "..." },
  "error": null
}
```
- 错误：
  - `409 PROJECT_CODE_DUPLICATE`（code=1005）：`code` 已存在。
  - `422 INVALID_MANAGER_ID`（code=1006）：`manager_id` 不属于该租户或非激活状态。
  - `422 INVALID_DATE_RANGE`：`planned_end_date` < `start_date`。

**业务逻辑**
- 创建 `projects` 记录。
- 自动将 `manager_id` 加入 `project_members`（`role='manager'`、`allocation_percent=100`）。
- 触发事件：生成项目初始化待办 (workflow)；如果 `metadata.template_id` 存在，批量导入模板中的任务、里程碑。
- 写入审计记录 `project.created`。

**性能与安全**
- 速率限制：`10 req/min/user`。
- 数据所有权检查：经理必须属于同一租户。
- Idempotent：相同 `Idempotency-Key` 重试返回第一次结果。

---

#### 2.2.2 GET /api/v1/projects
- **描述**：分页查询项目列表。
- **所需权限**：`projects:read`

**请求**
- Query 参数：
  - `status` (string, enum 同上)
  - `priority`
  - `manager_id` (uuid)
  - `department_id` (uuid)
  - `q` (string, 项目名称/编码模糊搜索, maxLength:100)
  - `page`, `page_size`, `sort_by` (`start_date|planned_end_date|created_at`), `sort_order`

**响应**
- 成功：`200 OK`，`data.items` 为项目数组（字段与 `projects` 表一致），`meta` 带分页信息。
- 错误：
  - `400 INVALID_SORT_FIELD`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 自动过滤当前用户有权访问的项目（基于 `project_members`、权限策略）。
- 支持缓存：同一查询条件缓存 30 秒。

**性能与安全**
- 速率限制：`60 req/min/user`。
- 可分页条数最大 100。

---

#### 2.2.3 GET /api/v1/projects/{project_id}
- **描述**：获取单个项目详情。
- **所需权限**：`projects:read`

**请求**
- Path：`project_id` (uuid, required, belongs to company)
- Query：`include` (`members,tasks,milestones,deliverables` 逗号分隔)

**响应**
- 成功：`200 OK`，返回 `project`、可选嵌套数据：
  - `members`: 来自 `project_members`
  - `milestones`: `project_milestones`
  - `tasks`: `project_tasks`（默认返回汇总统计，full 列表需调用任务列表接口）
  - `weekly_deliveries`: 最近一条 `project_weekly_deliveries`
- 错误：
  - `404 PROJECT_NOT_FOUND`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 记录访问审计（字段级脱敏依据权限，敏感字段如预算仅对授权角色显示）。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 支持 ETag 缓存，未变更返回 `304 Not Modified`。

---

#### 2.2.4 POST /api/v1/projects/{project_id}/tasks
- **描述**：创建项目任务。
- **所需权限**：`project_tasks:create`

**请求**
- Header：`Idempotency-Key`
- Path：`project_id` (uuid)
- Body：
```json
{
  "name": "设计评审",
  "description": "完成方案设计评审",
  "task_type": "task",
  "status": "todo",
  "priority": "high",
  "assignee_id": "uuid",
  "reviewer_id": "uuid",
  "milestone_id": "uuid",
  "parent_id": null,
  "start_date": "2025-11-05",
  "due_date": "2025-11-10",
  "estimated_hours": "40.00",
  "metadata": {
    "labels": ["设计"]
  }
}
```

| 字段 | 类型 | 校验规则 | 描述 |
| --- | --- | --- | --- |
| name | string | required, maxLength:300 | 任务名称 |
| description | string | maxLength:2000 | 任务描述 |
| task_type | string | enum:`task|bug|milestone|review|risk` | 类型 |
| status | string | enum:`todo|in_progress|in_review|blocked|done` | 状态 |
| priority | string | enum:`low|medium|high|critical` |
| assignee_id | uuid | optional, exists `users.id`, 同租户且在项目成员内 |
| reviewer_id | uuid | optional, exists `users.id` |
| milestone_id | uuid | optional, exists `project_milestones.id` 属于该项目 |
| parent_id | uuid | optional, exists `project_tasks.id` 属于该项目 |
| start_date | date | optional |
| due_date | date | optional, >= start_date |
| estimated_hours | numeric | optional, decimal(10,2), >=0 |
| metadata | object | optional, max 2KB |

**响应**
- 成功：`201 Created` 返回 `project_task` 对象。
- 错误：
  - `404 PROJECT_NOT_FOUND`
  - `422 ASSIGNEE_NOT_MEMBER`
  - `409 TASK_CONFLICT`（同名任务存在且 `metadata.unique=true`）

**业务逻辑**
- 若 `assignee_id` 非项目成员，自动创建 `project_members` 记录（默认 `role='member'`，`allocation_percent=100`）。
- 更新项目进度基线；触发通知（钉钉/邮件）。
- 写入审计（`project.task_created`）。

**性能与安全**
- 速率限制：`30 req/min/project`。
- 幂等性：相同 `Idempotency-Key` 返回相同任务信息。

---

#### 2.2.5 POST /api/v1/projects/{project_id}/weekly-deliveries
- **描述**：生成或更新项目周交付报告。
- **所需权限**：`project_reports:write`

**请求**
- Header：`Idempotency-Key`
- Path：`project_id`
- Body：
```json
{
  "week_start_date": "2025-10-27",
  "status": "draft",
  "summary": "生产线调试完成 80%",
  "completed_items": [
    { "task_id": "uuid", "title": "完成设备验收" }
  ],
  "planned_items": [
    { "task_id": null, "title": "下周部署 AI 质检" }
  ],
  "risk_items": [
    { "description": "供应商交付延迟", "severity": "high" }
  ],
  "cost_variance": {
    "actual": "820000.00",
    "budget": "900000.00"
  },
  "generated_by_conversation_id": "uuid"
}
```

| 字段 | 类型 | 规则 | 描述 |
| --- | --- | --- | --- |
| week_start_date | date | required, Monday, unique per项目 | 周开始日期 |
| status | string | enum:`draft|published|archived` |
| summary | string | maxLength:2000 |
| completed_items / planned_items | array | 每项 maxLength:300 |
| risk_items | array | 每项需含 `description`、可含 `severity` (`low|medium|high|critical`) |
| cost_variance | object | optional, numeric 字段 decimal(18,2) |
| generated_by_conversation_id | uuid | optional, exists `ai_conversations.id` |

**响应**
- `201 Created` 或 `200 OK`（若已存在刷新）。
- 错误：
  - `404 PROJECT_NOT_FOUND`
  - `409 WEEK_REPORT_EXISTS`（重复非幂等）

**业务逻辑**
- 写入/更新 `project_weekly_deliveries`；若 `status='published'`，向订阅人推送通知。
- 汇总 `completed_items` 对应任务，更新任务进度。

**性能与安全**
- 速率限制：`5 req/week/project`。
- `published` 状态需审批权限；公有字段支持脱敏策略。

---

#### 2.2.6 GET /api/v1/projects/{project_id}/weekly-deliveries
- **描述**：查看项目的历史周交付报告。
- **所需权限**：`project_reports:read`

**请求**
- Path：`project_id` (uuid, required)
- Query：
  | 字段 | 规则 | 描述 |
  | --- | --- | --- |
  | week_start_date | optional date，校验为周一 | 只返回指定周的数据 |
  | status | optional enum:`draft|published|archived` | 过滤报告状态 |
  | page | integer, default 1 |
  | page_size | integer, default 20, max 100 |
  | sort_order | enum:`asc|desc`，默认 `desc` | 按周起始日期排序 |

**响应**
- `200 OK`，`items` 为 `project_weekly_deliveries` 字段，包含 `completed_items`、`risk_items` 等；`meta` 返回分页信息。
- 错误：
  - `404 PROJECT_NOT_FOUND`
  - `403 PERMISSION_DENIED`
  - `400 INVALID_WEEK_START`（`week_start_date` 不是周一）

**业务逻辑**
- 根据 `project_id` + `company_id` 过滤；默认按最新周排序。
- 若 `status=published`，附带最新发布人和发布时间；草稿仅作者与项目经理可见。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 访问记录写入审计，便于追踪报告阅读情况。

---

#### 2.2.7 GET /api/v1/projects/{project_id}/cost-records
- **描述**：查询项目的成本流水。
- **所需权限**：`project_costs:read`

**请求**
- Path：`project_id` (uuid, required)
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | cost_category | optional enum:`labor|material|equipment|other` |
  | cost_type | optional enum:`planned|actual` |
  | start_date / end_date | optional date，`end_date >= start_date`，跨度 ≤ 365 天 |
  | page | integer, default 1 |
  | page_size | integer, default 50, max 200 |
  | sort_by | enum:`cost_date|amount|created_at`，默认 `cost_date` |
  | sort_order | enum:`asc|desc` |

**响应**
- `200 OK`，返回 `items`（`project_cost_records` 字段）及 `summary`（合计、预算差异）。
- 错误：
  - `404 PROJECT_NOT_FOUND`
  - `400 INVALID_DATE_RANGE`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 自动补充关联的财务记录编号（若有）；计算预算差异并同步 `summary`.
- 若查询跨度超过 90 天，建议触发异步导出任务。

**性能与安全**
- 速率限制：`20 req/min/user`。
- 金额字段按角色脱敏（如供应商视图需额外权限）。

---

#### 2.2.8 GET /api/v1/projects/{project_id}/budget-snapshots
- **描述**：获取项目预算快照的历史记录。
- **所需权限**：`project_budget:read`

**请求**
- Path：`project_id` (uuid, required)
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | page | integer, default 1 |
  | page_size | integer, default 20, max 100 |
  | baseline_only | boolean, default false | 仅返回基准版本 |

**响应**
- `200 OK`，`items` 为 `project_budget_snapshots` 字段，包含 `baseline_version`、`variance_percent` 等。
- 错误：
  - `404 PROJECT_NOT_FOUND`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 结果按 `effective_at` 降序；若 `baseline_only=true`，仅展示基线快照。
- 若项目被归档，仅允许 PMO/财务角色访问。

**性能与安全**
- 速率限制：`10 req/min/user`。
- 快照内容可启用 ETag，前端做缓存。

---

### 2.3 财务管理模块 (Finance)

#### 2.3.1 POST /api/v1/finance/records
- **描述**：新增财务记录（如收入、支出、转账）。
- **所需权限**：`finance:records:create`

**请求**
- Header：`Idempotency-Key`
- Body：
```json
{
  "record_date": "2025-10-28",
  "type": "expense",
  "category_id": "uuid",
  "amount": "15820.00",
  "currency": "CNY",
  "description": "10 月差旅报销",
  "source_system": "erp",
  "source_reference": {
    "external_id": "ERP-EXP-20251028-01"
  },
  "approval_request_id": "uuid",
  "project_id": "uuid",
  "metadata": {
    "tax_rate": 0.13
  }
}
```

| 字段 | 类型 | 校验规则 |
| --- | --- | --- |
| record_date | date | required |
| type | string | required, enum:`income|expense|transfer` |
| category_id | uuid | required, exists `financial_categories.id` 同公司 |
| amount | numeric | required, decimal(18,2), >0 |
| currency | string | required, iso4217 |
| description | string | maxLength:2000 |
| source_system | string | required, maxLength:50 |
| source_reference | object | optional |
| approval_request_id | uuid | optional, exists `approval_requests.id` |
| project_id | uuid | optional, exists `projects.id` |
| metadata | object | optional, max 4KB |

**响应**
- `201 Created` 返回 `financial_record`。
- 错误：
  - `422 CATEGORY_INACTIVE`
  - `409 DUPLICATE_SOURCE_REFERENCE`

**业务逻辑**
- 写入 `financial_records`；若 `approval_request_id` 为空且金额超过阈值，会自动生成审批草稿。
- 更新项目成本统计、财务仪表盘缓存；同步触发预警检测。

**性能与安全**
- 速率限制：`20 req/min/company`。
- 金额字段保留两位小数；敏感数据（描述）做脱敏。

---

#### 2.3.2 GET /api/v1/finance/records
- **描述**：分页查询财务记录。
- **所需权限**：`finance:records:read`

**请求**
- Query：`type`、`category_id`、`status`(`pending|approved|rejected|archived`)、`start_date`、`end_date`、`project_id`、`page`、`page_size`、`sort_by`(`record_date|amount|created_at`)。

**响应**
- `200 OK`，`items` 数组包含 `financial_records` 字段。
- 错误：`400 INVALID_DATE_RANGE`

**业务逻辑**
- 输出字段根据权限自动脱敏（例如非财务角色隐藏金额）。
- 支持导出：`Accept: text/csv`。

**性能与安全**
- 速率限制：`60 req/min/user`。
- 查询超过 10,000 条需异步任务。

---

#### 2.3.3 POST /api/v1/finance/report-runs
- **描述**：执行财务报表生成。
- **所需权限**：`finance:reports:run`

**请求**
- Header：`Idempotency-Key`
- Body：
```json
{
  "template_id": "uuid",
  "scheduled_at": "2025-10-29T00:00:00Z",
  "parameters": {
    "period_start": "2025-10-01",
    "period_end": "2025-10-28",
    "dimension": "department_id",
    "currency": "CNY"
  },
  "triggered_by": "uuid"
}
```

| 字段 | 规则 | 描述 |
| --- | --- | --- |
| template_id | required, exists `financial_report_templates.id` & status active |
| scheduled_at | optional datetime <= now+7d |
| parameters.period_start / period_end | required date，`period_end >= period_start` |
| parameters.dimension | enum:`company_id|department_id|project_id|category_id` |
| parameters.currency | optional, iso4217 |
| triggered_by | optional uuid, 若为空默认当前用户 |

**响应**
- `202 Accepted`（异步执行）或 `201 Created`（同步完成）。返回 `report_run` 对象。
- 错误：
  - `404 TEMPLATE_NOT_FOUND`
  - `409 REPORT_RUNNING`（存在未完成任务）

**业务逻辑**
- 写入 `financial_report_runs`；异步任务执行成功后更新 `status`，若失败记录 `error_message`。
- 发布成功结果到订阅者（`financial_report_subscriptions`）。

**性能与安全**
- 限流：`5 req/hour/company`。
- 报表生成跑在后台队列，单次任务限 10 分钟。

---

#### 2.3.4 GET /api/v1/finance/alert-events
- **描述**：查询财务预警事件。
- **所需权限**：`finance:alerts:read`

**请求**
- Query：`status`(`open|acknowledged|resolved|dismissed`)、`metric`、`severity`、`start_at`、`end_at`、`page`、`page_size`.

**响应**
- `200 OK`，`items` 包含 `financial_alert_events` 字段，附带 `alert_rule`。
- 错误：`400 INVALID_DATE_RANGE`

**业务逻辑**
- 支持按事件状态过滤；获取后可设置 `acknowledged`（需调用补充接口）。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 数据加密：敏感字段（如供应商）按角色控制。

---

#### 2.3.5 GET /api/v1/finance/report-templates
- **描述**：查询财务报表模板及其配置。
- **所需权限**：`finance:reports:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | status | optional enum:`draft|active|archived` |
  | frequency | optional enum:`daily|weekly|monthly|quarterly|yearly` |
  | page | integer, default 1 |
  | page_size | integer, default 20, max 100 |

**响应**
- `200 OK`，返回 `financial_report_templates` 列表，包含 `parameters_schema`、`delivery_channels`。
- 错误：`403 PERMISSION_DENIED`

**业务逻辑**
- 按租户过滤；若模板包含敏感指标，仅财务主管可见详细参数。
- 支持在响应中附带最近一次 `report_run` 快照。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 模板内容需签名缓存，防止被篡改。

---

#### 2.3.6 GET /api/v1/finance/report-runs
- **描述**：查看报表执行历史。
- **所需权限**：`finance:reports:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | template_id | optional uuid |
  | status | optional enum:`pending|running|success|failed|cancelled` |
  | triggered_by | optional uuid |
  | start_at / end_at | optional datetime，`end_at >= start_at` |
  | page | integer, default 1 |
  | page_size | integer, default 20, max 100 |

**响应**
- `200 OK`，`items` 为 `financial_report_runs` 字段，含执行状态、输出位置。
- 错误：
  - `400 INVALID_DATE_RANGE`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 若 `status=failed`，会附带 `error_message` 与 `retry_token`。
- 对于 `output_location.type=file`，前端需再次调用下载接口获取临时链接。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 历史数据超过 180 天默认归档，可通过 `include_archived=true`（将来扩展）。

---

#### 2.3.7 GET /api/v1/finance/alert-rules
- **描述**：获取财务预警规则配置。
- **所需权限**：`finance:alerts:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | status | optional enum:`active|inactive` |
  | metric | optional string, maxLength:100 |
  | severity | optional enum:`low|medium|high|critical` |

**响应**
- `200 OK`，返回 `financial_alert_rules` 列表，包含阈值、通知渠道。
- 错误：`403 PERMISSION_DENIED`

**业务逻辑**
- 自动附带最近一次触发时间与触发次数。
- 若规则绑定到项目，会附带 `project_id` 与 `project_name`。

**性能与安全**
- 速率限制：`20 req/min/user`。
- 规则内容需加签，避免前端篡改后回传。

---

#### 2.3.8 GET /api/v1/finance/data-sources
- **描述**：查询财务数据源连接配置。
- **所需权限**：`finance:data-sources:read`

**请求**
- Query：无

**响应**
- `200 OK`，`items` 为 `financial_data_sources` 字段，包括 `connector_type`、`status`、`last_synced_at`。
- 错误：`403 PERMISSION_DENIED`

**业务逻辑**
- 返回时隐藏敏感凭证，仅展示可用状态；对于离线数据源，附带下一次同步计划。
- 若数据源处于异常状态，将附带 `diagnostics` 提示。

**性能与安全**
- 速率限制：`10 req/min/user`。
- 数据源凭证全程不可脱敏泄露，响应需通过字段级权限控制。

---

### 2.4 审批管理模块 (Approvals)

#### 2.4.1 POST /api/v1/approval-requests
- **描述**：创建审批单（草稿或直接提交）。
- **所需权限**：`approvals:requests:create`

**请求**
- Header：`Idempotency-Key`
- Body：
```json
{
  "title": "10 月差旅报销",
  "request_type": "expense",
  "template_id": "uuid",
  "workflow_version_id": "uuid",
  "amount": "5820.00",
  "currency": "CNY",
  "priority": "medium",
  "form_data": {
    "travel_start": "2025-10-10",
    "travel_end": "2025-10-15",
    "cities": ["上海", "厦门"]
  },
  "attachments": [
    { "attachment_id": "uuid", "is_required": true }
  ],
  "metadata": {
    "initiated_via": "conversation"
  },
  "submit": true
}
```

| 字段 | 规则 |
| --- | --- |
| title | required, maxLength:300 |
| request_type | required, enum: `leave|travel|expense|seal|custom|project|finance` |
| template_id | required, exists `approval_templates.id` 同公司 |
| workflow_version_id | required, active `approval_workflow_versions` |
| amount | optional decimal(18,2) >=0 |
| currency | required if amount, iso4217 |
| priority | enum:`low|medium|high|urgent` |
| form_data | required, JSON Schema 由模板定义，校验字段级权限 |
| attachments[].attachment_id | uuid, exists `attachments.id` 同公司 |
| attachments[].is_required | boolean |
| submit | boolean, default false（false=草稿） |

**响应**
- `201 Created` 返回 `approval_request`。
- 错误：
  - `422 TEMPLATE_FIELD_MISSING`（必填表单字段缺失）
  - `409 REQUEST_CODE_CONFLICT`
  - `403 PERMISSION_DENIED`（模板受限）

**业务逻辑**
- 插入 `approval_requests`，同时写入 `approval_request_steps`（根据流程节点初始化）。
- 若 `submit=true`，进入运行态并向首节点审批人发待办；生成消息通知（钉钉/邮件）。
- 附件通过 `approval_request_attachments` 关联。

**性能与安全**
- 限流：`15 req/min/user`。
- 表单数据脱敏存储（敏感字段加密）。

---

#### 2.4.2 GET /api/v1/approval-requests
- **描述**：分页查询当前用户发起的审批单。
- **所需权限**：`approvals:requests:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | status | optional enum:`draft|running|approved|rejected|withdrawn|returned` |
  | request_type | optional enum:`leave|travel|expense|seal|custom|project|finance` |
  | start_at / end_at | optional datetime，`end_at >= start_at`，跨度 ≤ 180 天 |
  | amount_min / amount_max | optional decimal(18,2)，`amount_max >= amount_min` |
  | priority | optional enum:`low|medium|high|urgent` |
  | q | optional string，maxLength:100，用于标题/单号模糊查询 |
  | page | integer, default 1 |
  | page_size | integer, default 20, max 100 |

**响应**
- `200 OK`，`items` 为 `approval_requests` 字段，附带当前节点与金额信息；`meta` 返回分页数据。
- 错误：
  - `400 INVALID_DATE_RANGE`
  - `400 INVALID_AMOUNT_RANGE`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 根据当前用户 `applicant_id` 过滤；支持 `status=draft` 返回草稿信息。
- 默认按 `created_at desc` 排序；若审批已完成，附带 `completed_at` 与最终结果。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 草稿内容仅作者与管理员可见。

---

#### 2.4.3 GET /api/v1/approval-requests/{request_id}
- **描述**：查看审批单详情。
- **所需权限**：`approvals:requests:read`

**请求**
- Path：`request_id` (uuid)
- Query：`include_history`(bool)，`include_audit`(bool)

**响应**
- `200 OK`，包含：
  - `request`: `approval_requests` 字段
  - `steps`: `approval_request_steps`
  - `actions`: `approval_request_actions`
  - `attachments`: `approval_request_attachments`
  - `audit_logs`: (可选)
- 错误：`404 REQUEST_NOT_FOUND`

**业务逻辑**
- 校验访问权限（申请人、审批人、被授权查看者）。
- 字段级脱敏：根据权限隐藏敏感字段。

**性能与安全**
- 限流：`40 req/min/user`。
- 返回审计数据时默认按最近 100 条。

---

#### 2.4.4 GET /api/v1/approvals/inbox
- **描述**：审批待办列表。
- **所需权限**：`approvals:tasks:read`

**请求**
- Query：`status`(默认 `pending`)、`priority`、`node`、`initiator`、`department_id`、`sla`(`lt12h|lt24h|gt24h`)、`q`、`start_at`、`end_at`、`page`、`page_size`.

**响应**
- `200 OK`，`items` 为 `approval_request_steps`，包含 `request_snapshot`。
- 错误：`400 INVALID_FILTER`

**业务逻辑**
- 仅返回当前用户有处理权的节点；自动刷新 SLA。
- 支持批量操作（另见动作接口）。

**性能与安全**
- 限流：`60 req/min/user`。
- 返回结果按 `assigned_at` 倒序。

---

#### 2.4.5 POST /api/v1/approvals/{step_id}/actions
- **描述**：对审核节点执行动作（同意、驳回、转办、加签、催办、评论）。
- **所需权限**：根据 `action_type` 校验，如 `approvals:tasks:approve`。

**请求**
- Header：`Idempotency-Key`
- Path：`step_id`
- Body：
```json
{
  "action_type": "approve",
  "comment": "费用合理，同意报销。",
  "target_assignee_id": null,
  "attachments": [
    { "attachment_id": "uuid" }
  ]
}
```

| 字段 | 校验 |
| --- | --- |
| action_type | required, enum:`approve|reject|withdraw|delegate|consign|urge|comment` |
| comment | optional, maxLength:1000, required when action=`reject|withdraw|urge` |
| target_assignee_id | required when `delegate|consign`，must be company user |
| attachments | optional，验证存在 |

**响应**
- `200 OK`，返回更新后的 `step` 与 `request` 状态。
- 错误：
  - `409 STEP_ALREADY_HANDLED`
  - `422 ACTION_NOT_ALLOWED`
  - `404 STEP_NOT_FOUND`

**业务逻辑**
- 更新 `approval_request_steps` 状态并写入 `approval_request_actions`。
- 若流程结束，写入 `approval_requests.completed_at`，通知申请人；若驳回，退回上一步。
- `urge` 动作触发消息中心提醒。

**性能与安全**
- 限流：`30 req/min/user`。
- 幂等性：重复 Approve 返回相同结果。
- 操作日志写入 `approval_audit_logs`。

---

#### 2.4.6 GET /api/v1/approvals/history
- **描述**：查询我处理过的审批历史及操作明细。
- **所需权限**：`approvals:tasks:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | status | optional enum:`approved|rejected|returned|withdrawn` |
  | action_type | optional enum:`approve|reject|withdraw|delegate|consign|urge` |
  | initiator | optional uuid |
  | department_id | optional uuid（申请人部门） |
  | start_at / end_at | optional datetime，`end_at >= start_at`，跨度 ≤ 180 天 |
  | page | integer, default 1 |
  | page_size | integer, default 20, max 100 |

**响应**
- `200 OK`，`items` 为 `approval_request_steps` 历史快照，嵌套最后一次 `approval_request_actions`。
- 错误：
  - `400 INVALID_DATE_RANGE`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 仅返回当前用户参与过的节点，包含操作人、意见、耗时等。
- 若 `action_type=urge`，附带催办次数与响应情况。

**性能与安全**
- 速率限制：`40 req/min/user`。
- 历史数据超过 12 个月默认归档，可通过后台导出。

---

#### 2.4.7 GET /api/v1/approval-workflows
- **描述**：获取审批流程定义及版本信息。
- **所需权限**：`approvals:workflows:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | business_domain | optional enum:`finance|project|hr|general` |
  | status | optional enum:`draft|active|archived` |
  | include_versions | boolean, default false |

**响应**
- `200 OK`，返回 `approval_workflows`，当 `include_versions=true` 时附带 `approval_workflow_versions` 概要。
- 错误：`403 PERMISSION_DENIED`

**业务逻辑**
- 默认仅返回当前激活版本；支持根据业务域筛选流程。
- 对于草稿流程，仅流程管理员可见。

**性能与安全**
- 速率限制：`20 req/min/user`。
- 响应可缓存 5 分钟，变更后通过事件通知让客户端刷新。

---

#### 2.4.8 GET /api/v1/approval-rules/{version_id}
- **描述**：查看指定流程版本的规则明细，供前端解释审批逻辑。
- **所需权限**：`approvals:workflows:read`

**请求**
- Path：`version_id` (uuid, required)
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | include_conditions | boolean, default true | 返回命中条件表达式 |

**响应**
- `200 OK`，返回 `approval_rules` 列表（节点顺序、条件、命中结果描述）。
- 错误：
  - `404 WORKFLOW_VERSION_NOT_FOUND`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 提供每条规则的 `explain_text` 与 `sample_cases`，帮助审批人理解流程。
- 若规则引用外部策略（如预算阈值），附带引用 ID。

**性能与安全**
- 速率限制：`15 req/min/user`。
- 响应较大时启用 gzip 压缩。

---

### 2.5 人事管理模块 (HR)

#### 2.5.1 GET /api/v1/hr/employees
- **描述**：查询员工档案。
- **所需权限**：`hr:employees:read`

**请求**
- Query：`employment_status`(`active|probation|on_leave|terminated`)、`department_id`、`job_title`、`keyword`、`page`、`page_size`、`sort_by`(`hire_date|created_at`)。

**响应**
- `200 OK`，`items` 包括 `user` 基本信息、`employee_record`、`skills` 摘要。
- 错误：`403 PERMISSION_DENIED`（字段级权限）。

**业务逻辑**
- 勾稽 `employee_records`、`employee_skills`，自动脱敏薪酬字段（无权限显示 `***`）。

**性能与安全**
- 限流：`40 req/min/user`。
- 支持基于 `If-Modified-Since` 条件请求。

---

#### 2.5.2 GET /api/v1/hr/employees/{user_id}
- **描述**：查看单个员工的全量档案。
- **所需权限**：`hr:employees:read`

**请求**
- Path：`user_id` (uuid, required)
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | include_histories | boolean, default false |
  | include_skills | boolean, default true |

**响应**
- `200 OK`，返回：
  - `user`: `users` 字段
  - `employee_record`: `employee_records` 字段
  - `skills`: `employee_skills`
  - `histories`: 当 `include_histories=true`，返回 `employee_histories`
- 错误：
  - `404 EMPLOYEE_NOT_FOUND`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 根据当前用户权限决定是否返回薪酬、绩效等敏感字段。
- 若员工有挂起的档案变更申请，响应中附带 `pending_change_request_id`。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 对返回的历史记录做分页（默认最近 50 条）。

---

#### 2.5.3 PUT /api/v1/hr/employees/{user_id}
- **描述**：更新员工档案，触发审批。
- **所需权限**：`hr:employees:update`

**请求**
- Header：`Idempotency-Key`
- Path：`user_id`
- Body（示例部分字段）：
```json
{
  "employment_status": "active",
  "job_title": "资深前端工程师",
  "job_level": "P5",
  "cost_center": "ENG-FE",
  "salary_info": {
    "base": 32000,
    "currency": "CNY"
  },
  "work_location": "成都 · 高新区",
  "metadata": {
    "remote_ratio": 0.5
  }
}
```

| 字段 | 规则 |
| --- | --- |
| employment_status | enum，同员工状态 |
| job_title | maxLength:150 |
| job_level | maxLength:50 |
| salary_info.base | numeric >=0（需加密存储） |
| salary_info.currency | iso4217 |
| metadata | object，max 4KB |

**响应**
- `202 Accepted` 返回 `{ "approval_request_id": "uuid" }`（进入审批）。
- 错误：
  - `404 EMPLOYEE_NOT_FOUND`
  - `409 EMPLOYEE_UPDATE_PENDING`（已有未完成审批）

**业务逻辑**
- 生成 `employee_histories` 记录；如果需要审批，创建 `approval_requests` 草稿并挂载变更明细。
- 更新字段使用乐观锁 (`updated_at`)。

**性能与安全**
- 限流：`10 req/min/user`。
- 敏感字段加密；无权用户禁止修改薪酬。

---

#### 2.5.4 POST /api/v1/hr/efficiency-reports
- **描述**：生成效率报告（个人/团队/周期）。
- **所需权限**：`hr:efficiency:create`

**请求**
- Header：`Idempotency-Key`
- Body：
```json
{
  "report_type": "team",
  "owner_user_id": null,
  "department_id": "uuid",
  "period_start": "2025-09-01",
  "period_end": "2025-09-30",
  "content": {
    "summary": "团队交付达成 95%，主要风险是测试资源不足。",
    "highlights": ["完成 AI 助手并上线"],
    "risks": ["测试资源不足"],
    "recommendations": ["增补测试人力"]
  },
  "generated_via": "conversation"
}
```

| 字段 | 规则 |
| --- | --- |
| report_type | enum:`weekly|monthly|team` |
| owner_user_id | required when `report_type != team` |
| department_id | required when `report_type = team` |
| period_start / end | required, date, `period_end >= period_start` |
| content | required, JSON；字段 maxLength:2000 |
| generated_via | enum:`conversation|template|manual` |

**响应**
- `201 Created` 返回 `employee_efficiency_report`。
- 错误：
  - `404 TARGET_NOT_FOUND`
  - `422 PERIOD_TOO_LONG`（跨度 > 3 个月）

**业务逻辑**
- 写入 `employee_efficiency_reports`；若 `generated_via='conversation'`，关联 `ai_conversations`。
- 可配置自动派发审批 (`approval_requests`)。

**性能与安全**
- 限流：`10 req/day/department`。
- 输出内容需过敏感词检测。

---

#### 2.5.5 GET /api/v1/hr/efficiency-scores
- **描述**：查询员工效率评分及趋势。
- **所需权限**：`hr:efficiency:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | period_start / period_end | required date，跨度 ≤ 92 天 |
  | department_id | optional uuid |
  | employee_id | optional uuid（指定个人） |
  | metric | optional enum:`productivity|attendance|delivery` |
  | page | integer, default 1 |
  | page_size | integer, default 50, max 200 |

**响应**
- `200 OK`，`items` 为 `employee_efficiency_scores` 字段，并附带 `trend`（最近三期对比）。
- 错误：
  - `400 INVALID_DATE_RANGE`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 当仅指定 `department_id` 时，返回部门平均值与排名。
- 若 `employee_id` 指定，附带其所在团队的均值对比。

**性能与安全**
- 速率限制：`30 req/min/user`。
- 评分数据属于敏感信息，按角色控制可见性。

---

#### 2.5.6 GET /api/v1/hr/skills
- **描述**：获取技能分类与技能字典。
- **所需权限**：`hr:skills:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | is_active | optional boolean |
  | category_id | optional uuid |

**响应**
- `200 OK`，返回 `skill_categories` 与 `skills` 列表。
- 错误：`403 PERMISSION_DENIED`

**业务逻辑**
- 根据 `is_active` 过滤；支持返回技能与能力等级映射。
- 可用于前端筛选和员工资质管理。

**性能与安全**
- 速率限制：`40 req/min/user`。
- 响应缓存 10 分钟。

---

#### 2.5.7 GET /api/v1/hr/org-tree
- **描述**：获取公司组织树结构。
- **所需权限**：`hr:org:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | include_inactive | boolean, default false |
  | depth | optional integer，1-10，默认返回完整树 |

**响应**
- `200 OK`，返回树形结构节点，字段对应 `org_tree_nodes`（含 `children` 列表）。
- 错误：`403 PERMISSION_DENIED`

**业务逻辑**
- 节点包含 `company`, `department` 两类；根据权限决定是否显示敏感部门。
- 可选地附带 `manager_id` 与员工数量统计。

**性能与安全**
- 速率限制：`20 req/min/user`。
- 大型组织树可分片缓存，前端可使用懒加载。

---

### 2.6 资料库模块 (Knowledge)

#### 2.6.1 GET /api/v1/knowledge/assets
- **描述**：分页检索知识资产元数据。
- **所需权限**：`knowledge:assets:read`

**请求**
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | keyword | optional string，maxLength:100 |
  | type | optional string，对应 `attachments.tags` |
  | owner_id | optional uuid |
  | created_start / created_end | optional datetime，`created_end >= created_start` |
  | visibility | optional enum:`internal|restricted|public` |
  | page | integer, default 1 |
  | page_size | integer, default 20, max 100 |
  | sort_by | enum:`created_at|file_size|updated_at`，默认 `updated_at` |
  | sort_order | enum:`asc|desc` |

**响应**
- `200 OK`，`items` 包含 `attachments` 字段，附带标签、关联项目/审批信息；`meta` 返回分页数据。
- 错误：
  - `400 INVALID_DATE_RANGE`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 根据权限过滤 `visibility`；Restricted 资料需校验用户在分享列表内。
- 支持聚合返回 `facets`（标签、类型统计），便于前端构建筛选器。

**性能与安全**
- 速率限制：`60 req/min/user`。
- 结果开启缓存与分段加载，避免一次返回过大数据。

---

#### 2.6.2 POST /api/v1/knowledge/assets
- **描述**：上传知识资产元数据（实际文件由对象存储提供）。
- **所需权限**：`knowledge:assets:create`

**请求**
- Header：`Idempotency-Key`
- Body：
```json
{
  "file_name": "项目周报模板_v2.docx",
  "mime_type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "file_size": 482176,
  "storage_key": "oss://bucket/path.docx",
  "checksum": "md5",
  "tags": ["template", "project"],
  "source": "upload",
  "metadata": {
    "related_project_id": "uuid",
    "visibility": "internal"
  }
}
```

| 字段 | 规则 |
| --- | --- |
| file_name | required, maxLength:255 |
| mime_type | required, maxLength:100 |
| file_size | required, integer >=0 |
| storage_key | required, maxLength:255 |
| checksum | optional, md5/sha256 |
| tags | array string maxLength:32，每条 <=20 个字符 |
| source | enum:`upload|conversation|import` |
| metadata.visibility | enum:`internal|restricted|public`（默认 internal） |

**响应**
- `201 Created` 返回 `attachment`。
- 错误：
  - `409 CHECKSUM_DUPLICATE`（同租户、同 checksum 已存在）
  - `413 PAYLOAD_TOO_LARGE`（`file_size` 超阈值）

**业务逻辑**
- 写入 `attachments`；若设置 `related_project_id`，需校验项目可见性。
- 触发索引任务（全文检索/向量库更新）。

**性能与安全**
- 限流：`20 req/min/user`。
- 元数据敏感字段加密；下载链接需签名。

---

#### 2.6.3 GET /api/v1/knowledge/assets/{attachment_id}
- **描述**：获取单个知识资产详情。
- **所需权限**：`knowledge:assets:read`

**请求**
- Path：`attachment_id` (uuid, required)
- Query：
  | 字段 | 规则 |
  | --- | --- |
  | include_audit | boolean, default false |

**响应**
- `200 OK`，返回 `attachment` 字段及 `share_links`（若存在）、`related_entities`（项目/审批）。
- 错误：
  - `404 ATTACHMENT_NOT_FOUND`
  - `403 PERMISSION_DENIED`

**业务逻辑**
- 若资产已设置访问限制，仅授权用户可见。
- 当 `include_audit=true`，附带最近访问记录（前 20 条）。

**性能与安全**
- 速率限制：`40 req/min/user`。
- 访问日志写入 `knowledge_access_logs`。

---

#### 2.6.4 POST /api/v1/knowledge/assets/{attachment_id}/share-links
- **描述**：生成资料分享链接或更新已有分享。
- **所需权限**：`knowledge:assets:share`

**请求**
- Header：`Idempotency-Key`
- Path：`attachment_id`
- Body：
```json
{
  "expire_at": "2025-11-30T23:59:59Z",
  "max_views": 20,
  "permissions": ["view", "download"]
}
```

| 字段 | 规则 |
| --- | --- |
| expire_at | optional datetime，须大于当前时间且 <= 180 天 |
| max_views | optional integer >=1 |
| permissions | array，枚举 `view|download|comment` |

**响应**
- `201 Created`，返回分享链接 `url` 与 `token`。
- 错误：
  - `404 ATTACHMENT_NOT_FOUND`
  - `422 INVALID_PERMISSION_SET`
  - `409 ACTIVE_LINK_EXISTS`

**业务逻辑**
- 写入 `attachment_share_links`；若已有有效链接则根据幂等键返回原链接。
- 触发通知给资产所有者，记录审计。

**性能与安全**
- 速率限制：`10 req/min/user`。
- 链接默认使用一次性 token，下载时需二次校验。

---

#### 2.6.5 POST /api/v1/knowledge/search
- **描述**：语义检索知识资产。
- **所需权限**：`knowledge:assets:search`

**请求**
- Body：
```json
{
  "query": "项目周报模板",
  "filters": {
    "tags": ["project"],
    "owner_id": "uuid"
  },
  "top_k": 20
}
```

| 字段 | 规则 |
| --- | --- |
| query | required, maxLength:200 |
| filters.tags | optional array, 每项 maxLength:20 |
| filters.owner_id | optional uuid |
| top_k | integer, default 10, max 50 |

**响应**
- `200 OK`
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "attachment": { "...": "attachments 字段" },
        "score": 0.92,
        "highlights": ["..."]
      }
    ]
  },
  "meta": { "request_id": "uuid", "timestamp": "..." },
  "error": null
}
```
- 错误：`400 QUERY_TOO_SHORT`

**业务逻辑**
- 触发语义搜索引擎（Elastic/向量数据库）。
- 记录搜索关键词用于推荐。

**性能与安全**
- 限流：`60 req/min/user`。
- 结果过滤敏感标签（如 `legal`）对无权限用户隐藏。

---

## 3. 非功能性要求汇总

### 3.1 性能目标
- 常规请求 P95 响应时间 ≤ 300ms，审批动作 ≤ 500ms，报表生成异步任务 ≤ 10min。
- 数据导出接口需异步实现，避免阻塞主线程。

### 3.2 安全控制
- 所有 POST/PUT/PATCH 请求启用 CSRF 防护（token + same-site Cookie）。
- 字段级权限：根据用户角色动态移除敏感字段（薪酬、审批意见等）。
- 日志脱敏：邮箱、手机号等以 `***` 替换。

### 3.3 审计与监控
- 每个接口记录：`user_id`、`company_id`、`request_id`、`duration`、`status_code`。
- 关键域（财务、审批）在 `Sentry`/`Prometheus` 中设置错误率和延迟告警。

### 3.4 测试与兼容性
- 所有端点需提供契约测试 (OpenAPI + Prism)。
- 集成测试覆盖创建审批、生成报表、更新员工档案等关键路径。
- 向后兼容策略：新增字段以可选方式推出，不破坏现有客户端。

---

## 4. 附录

### 4.1 权限码映射示例
| 权限码 | 描述 | 关联角色 |
| --- | --- | --- |
| auth:codes:read | 查询可用权限码 | 所有登录用户 |
| projects:create | 创建项目 | 项目经理、PMO |
| project_reports:read | 查看项目周报/预算快照 | 项目经理、PMO |
| project_costs:read | 查看项目成本流水 | 财务专员、PMO |
| project_budget:read | 查看项目预算快照 | PMO |
| project_tasks:create | 创建项目任务 | 项目经理、项目成员 |
| finance:records:create | 新增财务记录 | 财务专员 |
| finance:records:read | 查看财务流水 | 财务专员、审计 |
| finance:reports:run | 运行财务报表 | 财务主管 |
| finance:reports:read | 查看报表与模板 | 财务主管、审计 |
| finance:alerts:read | 查看财务预警 | 财务主管、风控 |
| finance:data-sources:read | 查看数据源状态 | 数据平台管理员 |
| approvals:requests:create | 发起审批 | 员工 |
| approvals:requests:read | 查看审批单详情 | 员工、审批人 |
| approvals:tasks:read | 审批待办/历史 | 审批人 |
| approvals:tasks:approve | 审批操作 | 审批人 |
| approvals:workflows:read | 查看流程与规则 | 流程管理员 |
| hr:employees:read | 查看员工档案 | HR、直属主管 |
| hr:employees:update | 更新员工档案 | HRBP |
| hr:efficiency:read | 查看效率评分 | HR、业务主管 |
| hr:efficiency:create | 生成效率报告 | HRBP |
| hr:skills:read | 查看技能字典 | HR、部门主管 |
| hr:org:read | 查看组织树 | HR、部门主管 |
| knowledge:assets:read | 浏览知识资产 | 全员（按可见性） |
| knowledge:assets:create | 上传知识资产 | 知识管理员 |
| knowledge:assets:share | 生成分享链接 | 资产所有者、知识管理员 |
| knowledge:assets:search | 语义检索 | 所有登录用户 |

### 4.2 数据模型参考
详见《docs/database-schema.md》，所有请求/响应字段应与数据库表字段保持一致；对于衍生字段（如汇总统计）需在文档中显式标注。

### 4.3 变更管理
- API 变更需通过 Architecture Review Board 审核。
- 兼容性破坏需提前 2 个迭代告知并提供迁移方案。
- 文档更新与实现同步提交，引用版本号（本版本：`2025.10.29`）。

---

本规约自 `2025-10-29` 起生效，由架构团队维护；任何偏离需获得架构师（Winston）书面批准。
