# Vibot Mock 接口说明

本文档基于《docs/architecture.md》、《docs/prd.md》与《docs/database-schema.md》，定义 Vibot 平台 Mock 服务的统一接口契约，供前端联调、自动化测试与验收验证使用。所有接口遵循 RESTful 风格，使用 PostgreSQL 15+ 数据模型的字段命名（`snake_case`），并覆盖客户、产品、订单、生产、项目、财务、审批、人事、资料库等核心业务场景。

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
  | 409 Conflict | 1005 | 资源冲突（如编号重复、状态不允许） |
  | 422 Unprocessable Entity | 1006 | 业务校验失败（如额度不足、规则未命中） |
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
  "email": "jane.doe@Vibot.com",
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
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "department_id": "1dbb4f4e-6316-4a6b-a2fd-88d3f56d3b8b",
      "email": "jane.doe@Vibot.com",
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
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
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
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "code": "project_manager",
        "name": "项目经理"
      }
    ],
    "permissions": [
      {
        "id": "c1e41f4f-a9a9-4a77-b0f0-6f22840f4a1f",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
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
## 客户管理 (Customers)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/customers` | GET | 分页查询客户/供应商档案 | Query：`customer_type`、`q`、`page`、`page_size`、`sort_by`、`sort_order` |
| `/customers` | POST | 创建客户/供应商 | Body 对齐 `customers`：编码、名称、类型、联系人、银行信息、`metadata` |
| `/customers/{customer_id}` | GET | 获取客户档案详情与往来摘要 | Path：`customer_id`；Query：`include_summary` |
| `/customers/{customer_id}` | PUT | 更新客户档案 | Body：可更新联系人、付款条款、银行信息、`metadata` |

### 示例：GET /customers

基于《付款单-202509021554000061.csv》中的真实付款数据构造示例。

```http
GET /api/customers?page=1&page_size=20&sort_by=updated_at&sort_order=desc HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "0f5fe9be-0861-4d38-8bc3-6d22f764c6cb",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "customer_code": "SUP-202510-DXH",
        "name": "董欣雄",
        "customer_type": "supplier",
        "tax_id": null,
        "contact_name": "董欣雄",
        "contact_phone": null,
        "bank_account_name": "董欣雄",
        "bank_name": "中国农业银行",
        "bank_account": "6228480688348979073",
        "address": null,
        "payment_terms": "net_30",
        "metadata": {
          "source_payment_request": "202510161719000580024",
          "payment_reason": "合信25.10月份甲醇货款"
        },
        "created_by": "16895536232217908",
        "updated_by": "16895536232217908",
        "created_at": "2025-10-17T23:32:30Z",
        "updated_at": "2025-10-29T04:20:00Z"
      },
      {
        "id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "customer_code": "SUP-202510-ZXL",
        "name": "张小连",
        "customer_type": "supplier",
        "tax_id": null,
        "contact_name": "张小连",
        "contact_phone": null,
        "bank_account_name": "张小连",
        "bank_name": "中国建设银行佛山顺德伦教支行",
        "bank_account": "6217003110012338677",
        "address": null,
        "payment_terms": "net_30",
        "metadata": {
          "source_payment_request": "202510140928000296746",
          "payment_reason": "合普25年6月售后费用22098.18，25年09月已付清。",
          "last_approver_comment": "以后款项到了，最迟当周就要提单了，不要放那么久才提单"
        },
        "created_by": "19606325101004723283",
        "updated_by": "232604322832543649",
        "created_at": "2025-10-15T15:07:29Z",
        "updated_at": "2025-10-29T03:55:00Z"
      },
      {
        "id": "2a5ad3e9-5e42-4f43-9fef-7b8f7f7a4cde",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "customer_code": "LOG-202510-SF",
        "name": "泉州顺丰运输有限公司",
        "customer_type": "logistics",
        "tax_id": null,
        "contact_name": "泉州顺丰运输有限公司",
        "contact_phone": null,
        "bank_account_name": "泉州顺丰运输有限公司",
        "bank_name": "中国工商银行泉秀支行",
        "bank_account": "1408010419008023134",
        "address": "福建省泉州市丰泽区",
        "payment_terms": "monthly_settlement",
        "metadata": {
          "source_payment_request": "202510140916000525027",
          "payment_reason": "顺丰2025年9月运费",
          "invoice_status": "已开票"
        },
        "created_by": "232604322832543649",
        "updated_by": "082855686337878166",
        "created_at": "2025-10-15T15:13:40Z",
        "updated_at": "2025-10-29T02:40:00Z"
      }
    ],
    "total": 3,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "8d6ce13a-bc0d-45b6-8a7e-58f6f71d1cdb",
    "timestamp": "2025-10-29T04:30:00Z"
  }
}
```

### 示例：POST /customers

引用《运费申请-202411021636000411.csv》中“泉州文丰物流有限公司”记录。

```http
POST /api/customers HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 2aef5a3c-63b5-4d66-9c3f-5f8a8e5fd671
```
```json
{
  "customer_code": "LOG-202506-WENFENG",
  "name": "泉州文丰物流有限公司",
  "customer_type": "logistics",
  "tax_id": null,
  "contact_name": "蔡伟强",
  "contact_phone": null,
  "bank_account_name": "泉州文丰物流有限公司",
  "bank_name": "泉州农村商业银行股份有限公司双阳支行",
  "bank_account": "9070214010010000459090",
  "address": "福建省泉州市洛江区",
  "payment_terms": "monthly_settlement",
  "metadata": {
    "source_payment_request": "202506201047000278874",
    "payment_reason": "安能物流25年4-5月份运费报销申请",
    "has_invoice": true
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "customer": {
      "id": "a9fc6f50-6d98-4e9d-8204-3d53cb14a501",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "customer_code": "LOG-202506-WENFENG",
      "name": "泉州文丰物流有限公司",
      "customer_type": "logistics",
      "tax_id": null,
      "contact_name": "蔡伟强",
      "contact_phone": null,
      "bank_account_name": "泉州文丰物流有限公司",
      "bank_name": "泉州农村商业银行股份有限公司双阳支行",
      "bank_account": "9070214010010000459090",
      "address": "福建省泉州市洛江区",
      "payment_terms": "monthly_settlement",
      "metadata": {
        "source_payment_request": "202506201047000278874",
        "payment_reason": "安能物流25年4-5月份运费报销申请",
        "has_invoice": true
      },
      "created_by": "1550535318268837",
      "updated_by": "1550535318268837",
      "created_at": "2025-10-29T04:40:00Z",
      "updated_at": "2025-10-29T04:40:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "9f8e4f6a-2c39-4e7d-9b2f-0fd7d0c95a34",
    "timestamp": "2025-10-29T04:40:01Z"
  }
}
```

### 示例：GET /customers/{customer_id}

```http
GET /api/customers/f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc?include_summary=true HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "customer": {
      "id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "customer_code": "SUP-202510-ZXL",
      "name": "张小连",
      "customer_type": "supplier",
      "tax_id": null,
      "contact_name": "张小连",
      "contact_phone": null,
      "bank_account_name": "张小连",
      "bank_name": "中国建设银行佛山顺德伦教支行",
      "bank_account": "6217003110012338677",
      "address": null,
      "payment_terms": "net_30",
      "metadata": {
        "source_payment_request": "202510140928000296746",
        "payment_reason": "合普25年6月售后费用22098.18，25年09月已付清。",
        "last_approver_comment": "以后款项到了，最迟当周就要提单了，不要放那么久才提单"
      },
      "created_by": "19606325101004723283",
      "updated_by": "232604322832543649",
      "created_at": "2025-10-15T15:07:29Z",
      "updated_at": "2025-10-29T03:55:00Z"
    },
    "summary": {
      "open_orders": 0,
      "last_order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
      "outstanding_amount": "0.00",
      "last_financial_record_at": "2025-10-29T04:45:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "1fa0a0e5-321f-4a6e-b4f9-27a22dc42395",
    "timestamp": "2025-10-29T04:45:30Z"
  }
}
```

### 示例：PUT /customers/{customer_id}

```http
PUT /api/customers/0f5fe9be-0861-4d38-8bc3-6d22f764c6cb HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 1a9d0dcd-6df9-4c5c-9a2c-52b0438a7f55
```
```json
{
  "payment_terms": "net_15",
  "metadata": {
    "last_payment_request": "202510161719000580024",
    "preferred_currency": "CNY"
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "customer": {
      "id": "0f5fe9be-0861-4d38-8bc3-6d22f764c6cb",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "customer_code": "SUP-202510-DXH",
      "name": "董欣雄",
      "payment_terms": "net_15",
      "metadata": {
        "source_payment_request": "202510161719000580024",
        "payment_reason": "合信25.10月份甲醇货款",
        "last_payment_request": "202510161719000580024",
        "preferred_currency": "CNY"
      },
      "updated_by": "16895536232217908",
      "updated_at": "2025-10-29T04:50:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "a4b2d373-2854-4443-b150-ba7b9e89a7b2",
    "timestamp": "2025-10-29T04:50:01Z"
  }
}
```

---
## 产品管理 (Products)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/products` | GET | 分页查询产品及其工艺、BOM | Query：`product_type`、`is_active`、`q`、`page`、`page_size`、`sort_by` |
| `/products` | POST | 创建产品档案 | Body：`product_code`、`name`、`specification`、`product_type`、`unit`、`default_process_flow`、`bom`、`metadata` |
| `/products/{product_id}` | GET | 产品详情、工艺与关联摘要 | Path：`product_id`；Query：`include_inactive` |
| `/products/{product_id}` | PUT | 更新产品 | Body：可更新规格、工艺、BOM、启用状态、`metadata` |

### 示例：GET /products

主要来自《工序产量单-202509021114000201.csv》中的工序记录。

```http
GET /api/products?page=1&page_size=20&sort_by=updated_at&sort_order=desc HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "6f437a6c-0c1f-4e15-9f06-777685c96c21",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "product_code": "WB-AXLE-5HP200406",
        "name": "电机轴",
        "specification": "5HP200406",
        "product_type": "component",
        "unit": "件",
        "default_process_flow": {
          "steps": [
            { "name": "下料", "sequence": 10 },
            { "name": "打锈", "sequence": 20 }
          ]
        },
        "metadata": {
          "bom": [
            { "component_code": "RAW-STEEL-42CRMO", "quantity": 1 },
            { "component_code": "WB-PKG-ANTI-RUST", "quantity": 1 }
          ],
          "source_work_order_code": "202510261523000120184",
          "source_excel_row": 3
        },
        "is_active": true,
        "created_at": "2025-10-08T08:20:00Z",
        "updated_at": "2025-10-27T14:04:33Z"
      },
      {
        "id": "b4fd2ed7-9aaf-4f07-a64d-0d779843a2fe",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "product_code": "LD-REAR-HOUSING-591",
        "name": "鲤东后桥壳总成",
        "specification": "591/1272",
        "product_type": "assembly",
        "unit": "件",
        "default_process_flow": {
          "steps": [
            { "name": "粗车", "sequence": 10 },
            { "name": "精车第一、二道", "sequence": 20 },
            { "name": "打孔/精车两道", "sequence": 30 }
          ]
        },
        "metadata": {
          "bom": [
            { "component_code": "LD-CASTING-591", "quantity": 1 },
            { "component_code": "LD-BOLT-M12", "quantity": 6 }
          ],
          "source_product_name": "轴/标定座一/标定座一",
          "source_specification": "8HP200591/MP一BL03B一20/同名",
          "source_work_order_code": "202510261730000578497",
          "source_excel_row": 9
        },
        "is_active": true,
        "created_at": "2025-10-10T09:15:00Z",
        "updated_at": "2025-10-27T14:00:23Z"
      }
    ],
    "total": 2,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "6d22a3b5-66f1-4a7d-b625-567580541f2b",
    "timestamp": "2025-10-29T05:00:00Z"
  }
}
```

### 示例：POST /products

```http
POST /api/products HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: weibo
Idempotency-Key: 5f7bee69-5a2b-47c0-88f6-c5b8d40dcf5e
```
```json
{
  "product_code": "WB-AUTO-CELL-800",
  "name": "微柏自动化装配单元",
  "specification": "8工位 · 柔性输送 · 800mm",
  "product_type": "equipment",
  "unit": "套",
  "default_process_flow": {
    "steps": [
      { "name": "结构件装配", "sequence": 10 },
      { "name": "电控布线", "sequence": 20 },
      { "name": "整线调试", "sequence": 30 }
    ]
  },
  "bom": [
    { "component_code": "WB-CTRL-01", "description": "控制柜总成", "quantity": 2 },
    { "component_code": "WB-CONV-08", "description": "柔性输送模块", "quantity": 8 }
  ],
  "metadata": {
    "design_owner": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
    "lifecycle_state": "design",
    "documentation": [
      { "attachment_id": "94b96c6f-3f98-4705-8756-1f13f13a6340", "type": "drawing" }
    ]
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "product": {
      "id": "f05e253b-1fe2-4b8c-95d4-1c8a7f0b8ce1",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "product_code": "WB-AUTO-CELL-800",
      "name": "微柏自动化装配单元",
      "specification": "8工位 · 柔性输送 · 800mm",
      "product_type": "equipment",
      "unit": "套",
      "default_process_flow": {
        "steps": [
          { "name": "结构件装配", "sequence": 10 },
          { "name": "电控布线", "sequence": 20 },
          { "name": "整线调试", "sequence": 30 }
        ]
      },
      "metadata": {
        "bom": [
          { "component_code": "WB-CTRL-01", "description": "控制柜总成", "quantity": 2 },
          { "component_code": "WB-CONV-08", "description": "柔性输送模块", "quantity": 8 }
        ],
        "design_owner": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
        "lifecycle_state": "design",
        "documentation": [
          { "attachment_id": "94b96c6f-3f98-4705-8756-1f13f13a6340", "type": "drawing" }
        ]
      },
      "is_active": true,
      "created_at": "2025-10-29T05:05:00Z",
      "updated_at": "2025-10-29T05:05:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "c5f9ef3b-bf26-4d0b-9e8a-7dd71ea54ecf",
    "timestamp": "2025-10-29T05:05:00Z"
  }
}
```

### 示例：GET /products/{product_id}

```http
GET /api/products/6f437a6c-0c1f-4e15-9f06-777685c96c21 HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "product": {
      "id": "6f437a6c-0c1f-4e15-9f06-777685c96c21",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "product_code": "WB-AXLE-5HP200406",
      "name": "电机轴",
      "specification": "5HP200406",
      "product_type": "component",
      "unit": "件",
      "default_process_flow": {
        "steps": [
          { "name": "下料", "sequence": 10 },
          { "name": "打锈", "sequence": 20 }
        ]
      },
      "metadata": {
        "bom": [
          { "component_code": "RAW-STEEL-42CRMO", "quantity": 1 },
          { "component_code": "WB-PKG-ANTI-RUST", "quantity": 1 }
        ],
        "source_work_order_code": "202510261523000120184",
        "source_excel_row": 3
      },
      "is_active": true,
      "created_at": "2025-10-08T08:20:00Z",
      "updated_at": "2025-10-27T14:04:33Z"
    },
    "related_summary": {
      "active_work_orders": 1,
      "open_orders": 1,
      "last_work_order_id": "b315b894-3bd2-42f4-9fb8-7cb0e6d6ed91"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "aa78d6f6-9c66-4b8b-8ec9-407c51adc901",
    "timestamp": "2025-10-29T05:10:00Z"
  }
}
```

### 示例：PUT /products/{product_id}

```http
PUT /api/products/b4fd2ed7-9aaf-4f07-a64d-0d779843a2fe HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 32f0f0fb-949f-4b16-84a5-c6f62c4699fa
```
```json
{
  "specification": "591/1272 · 加强版",
  "default_process_flow": {
    "steps": [
      { "name": "粗车", "sequence": 10 },
      { "name": "热处理", "sequence": 15 },
      { "name": "精车第一、二道", "sequence": 20 },
      { "name": "探伤检验", "sequence": 30 }
    ]
  },
  "bom": [
    { "component_code": "LD-CASTING-591", "quantity": 1 },
    { "component_code": "LD-BOLT-M12", "quantity": 6 },
    { "component_code": "LD-PAINT-ANTI-RUST", "quantity": 0.2 }
  ],
  "metadata": {
    "source_product_name": "轴/标定座一/标定座一",
    "source_specification": "8HP200591/MP一BL03B一20/同名",
    "last_process_update_reason": "后桥壳总成批次精车良率优化"
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "product": {
      "id": "b4fd2ed7-9aaf-4f07-a64d-0d779843a2fe",
      "product_code": "LD-REAR-HOUSING-591",
      "name": "鲤东后桥壳总成",
      "specification": "591/1272 · 加强版",
      "default_process_flow": {
        "steps": [
          { "name": "粗车", "sequence": 10 },
          { "name": "热处理", "sequence": 15 },
          { "name": "精车第一、二道", "sequence": 20 },
          { "name": "探伤检验", "sequence": 30 }
        ]
      },
      "metadata": {
        "bom": [
          { "component_code": "LD-CASTING-591", "quantity": 1 },
          { "component_code": "LD-BOLT-M12", "quantity": 6 },
          { "component_code": "LD-PAINT-ANTI-RUST", "quantity": 0.2 }
        ],
        "source_product_name": "轴/标定座一/标定座一",
        "source_specification": "8HP200591/MP一BL03B一20/同名",
        "last_process_update_reason": "后桥壳总成批次精车良率优化"
      },
      "updated_at": "2025-10-29T05:15:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "1e3e8b7e-e3bc-4d43-8d0d-72bf5f3dbe97",
    "timestamp": "2025-10-29T05:15:01Z"
  }
}
```

---
## 订单管理 (Orders)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/orders` | GET | 分页查询销售/采购订单 | Query：`order_type`、`order_status`、`customer_id`、`approval_status`、`start_date`、`end_date`、`page`、`page_size`、`sort_by` |
| `/orders` | POST | 创建订单（含行项目及审批引用） | Body：`order_code`、`order_type`、`customer_id`、金额、`line_items`、`approval_request_id`、`attachments` |
| `/orders/{order_id}` | GET | 获取订单详情 | Path：`order_id`；Query：`include_financial`、`include_work_orders` |
| `/orders/{order_id}/status` | PUT | 更新订单业务/审批状态 | Body：`order_status`、`approval_status`、`status_note`、`next_step` |

### 示例：GET /orders

订单数据直接来源于《付款单-202509021554000061.csv》与《运费申请-202411021636000411.csv》。

```http
GET /api/orders?page=1&page_size=20&sort_by=created_at&sort_order=desc HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "order_code": "PO-WB-20251014-001",
        "order_type": "ap_payment",
        "order_status": "approved",
        "approval_status": "approved",
        "customer_id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
        "amount_total": "22098.18",
        "tax_amount": null,
        "currency": "CNY",
        "payment_method": "transfer",
        "payment_date": "2025-10-14",
        "summary": "合普25年6月售后费用22098.18，25年09月已付清。",
        "line_items": [
          {
            "product_id": "b4fd2ed7-9aaf-4f07-a64d-0d779843a2fe",
            "product_name": "鲤东后桥壳总成",
            "specification": "591/1272",
            "quantity": 1,
            "unit_price": "22098.18",
            "currency": "CNY",
            "metadata": {
              "source_payment_request": "202510140928000296746"
            }
          }
        ],
        "attachments": [],
        "created_at": "2025-10-14T09:28:30Z",
        "updated_at": "2025-10-29T04:55:00Z"
      },
      {
        "id": "c35b4f84-6d03-4a03-b1c4-fb0b59882a60",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "order_code": "PO-WB-20251020-LOGI",
        "order_type": "freight_payment",
        "order_status": "approved",
        "approval_status": "approved",
        "customer_id": "2a5ad3e9-5e42-4f43-9fef-7b8f7f7a4cde",
        "amount_total": "4873.75",
        "tax_amount": null,
        "currency": "CNY",
        "payment_method": "transfer",
        "payment_date": "2025-10-20",
        "summary": "顺丰2025年9月运费",
        "line_items": [
          {
            "product_id": null,
            "product_name": "物流运费",
            "specification": null,
            "quantity": 1,
            "unit_price": "4873.75",
            "currency": "CNY",
            "metadata": {
              "billing_period": "2025-09",
              "source_payment_request": "202510140916000525027"
            }
          }
        ],
        "attachments": [],
        "created_at": "2025-10-14T09:16:53Z",
        "updated_at": "2025-10-29T04:30:00Z"
      }
    ],
    "total": 2,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "91a1fbba-8d9a-4c3e-8f8b-4360b3c70324",
    "timestamp": "2025-10-29T05:20:00Z"
  }
}
```

### 示例：POST /orders

```http
POST /api/orders HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 8fb0bced-6c8e-47ab-b7a9-86d19055b098
```
```json
{
  "order_code": "PO-WB-20251027-002",
  "order_type": "freight_payment",
  "customer_id": "a9fc6f50-6d98-4e9d-8204-3d53cb14a501",
  "amount_total": "2551.00",
  "currency": "CNY",
  "payment_method": "transfer",
  "payment_date": "2025-06-27",
  "approval_request_id": "202506201047000278874",
  "summary": "安能物流25年4-5月份运费报销申请",
  "line_items": [
    {
      "product_id": null,
      "product_name": "干线运输费",
      "specification": "2025Q2",
      "quantity": 1,
      "unit_price": "2551.00",
      "currency": "CNY",
      "metadata": {
        "invoice_status": "未开票",
        "source_payment_request": "202506201047000278874"
      }
    }
  ],
  "attachments": []
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "order": {
      "id": "dd2e82c6-3c6f-4dc9-8a17-693b0cfb0a53",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "order_code": "PO-WB-20251027-002",
      "order_type": "freight_payment",
      "order_status": "pending_approval",
      "approval_status": "pending",
      "customer_id": "a9fc6f50-6d98-4e9d-8204-3d53cb14a501",
      "amount_total": "2551.00",
      "tax_amount": null,
      "currency": "CNY",
      "payment_method": "transfer",
      "payment_date": "2025-06-27",
      "summary": "安能物流25年4-5月份运费报销申请",
      "line_items": [
        {
          "product_id": null,
          "product_name": "干线运输费",
          "specification": "2025Q2",
          "quantity": 1,
          "unit_price": "2551.00",
          "currency": "CNY",
          "metadata": {
            "invoice_status": "未开票",
            "source_payment_request": "202506201047000278874"
          }
        }
      ],
      "attachments": [],
      "created_at": "2025-10-29T05:22:00Z",
      "updated_at": "2025-10-29T05:22:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "5a1fd6cb-10b6-467a-a2ca-6c6d98735e2c",
    "timestamp": "2025-10-29T05:22:00Z"
  }
}
```

### 示例：GET /orders/{order_id}

```http
GET /api/orders/7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350?include_financial=true&include_work_orders=true HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "order": {
      "id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
      "order_code": "PO-WB-20251014-001",
      "order_type": "ap_payment",
      "order_status": "approved",
      "approval_status": "approved",
      "customer_id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
      "amount_total": "22098.18",
      "tax_amount": null,
      "currency": "CNY",
      "payment_method": "transfer",
      "payment_date": "2025-10-14",
      "summary": "合普25年6月售后费用22098.18，25年09月已付清。",
      "line_items": [
        {
          "product_id": "b4fd2ed7-9aaf-4f07-a64d-0d779843a2fe",
          "product_name": "鲤东后桥壳总成",
          "specification": "591/1272",
          "quantity": 1,
          "unit_price": "22098.18",
          "currency": "CNY",
          "metadata": {
            "source_payment_request": "202510140928000296746"
          }
        }
      ],
      "attachments": [],
      "source_payload": {
        "form_title": "林明强提交的付款申请单（福建鲤东）"
      },
      "created_at": "2025-10-14T09:28:30Z",
      "updated_at": "2025-10-29T04:55:00Z"
    },
    "customer": {
      "id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
      "name": "张小连",
      "customer_type": "supplier",
      "contact_name": "张小连",
      "bank_name": "中国建设银行佛山顺德伦教支行"
    },
    "financial_links": [
      {
        "financial_record_id": "b7d5e8bf-4f80-4ea7-8bcf-7f80d61d63fd",
        "record_code": "WB-FIN-20251018-001",
        "status": "pending",
        "amount": "2200.00",
        "occurred_at": "2025-10-18T02:15:00Z"
      }
    ],
    "work_orders": [
      {
        "work_order_id": "b315b894-3bd2-42f4-9fb8-7cb0e6d6ed91",
        "process_name": "打锈",
        "status": "in_progress",
        "qualified_qty": 111
      }
    ]
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "5d0824d3-166b-4f3f-9c0a-bebae4ae09f5",
    "timestamp": "2025-10-29T05:24:00Z"
  }
}
```

### 示例：PUT /orders/{order_id}/status

```http
PUT /api/orders/7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350/status HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 3a6a6f8e-aa0e-45d5-b540-5cf19bd2d7e1
```
```json
{
  "order_status": "shipping",
  "approval_status": "approved",
  "status_note": "批次 2025-10-15 已排产完毕，安排物流发运",
  "next_step": "同步生成发运工单"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "order": {
      "id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
      "order_code": "PO-WB-20251014-001",
      "order_status": "shipping",
      "approval_status": "approved",
      "status_note": "批次 2025-10-15 已排产完毕，安排物流发运",
      "next_step": "同步生成发运工单",
      "updated_at": "2025-10-29T05:26:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "0cd7ce84-f4dd-4e64-8f66-32f0eca3c0cf",
    "timestamp": "2025-10-29T05:26:00Z"
  }
}
```

---
## 生产管理 (Manufacturing)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/work-orders` | GET | 分页查询工单列表 | Query：`status`、`product_id`、`related_order_id`、`process_name`、`work_date_start`、`work_date_end`、`page`、`page_size` |
| `/work-orders` | POST | 从订单创建工单 | Body：`order_id`、`product_id`、`work_order_code`、`process_name`、`batch_no`、`metrics`、`work_date` 等 |
| `/work-orders/{work_order_id}` | GET | 工单详情与进度时间线 | Path：`work_order_id`；Query：`include_timeline` |
| `/work-orders/{work_order_id}/progress` | POST | 报工/更新工序进度 | Body：`metrics`、`duration_hours`、`duration_details`、`comment`、`reported_at` |

### 示例：GET /work-orders

数据来自《工序产量单-202509021114000201.csv》。

```http
GET /api/work-orders?page=1&page_size=20&status=in_progress HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "b315b894-3bd2-42f4-9fb8-7cb0e6d6ed91",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "work_order_code": "202510261523000120184",
        "approval_request_id": "202510261523000120184",
        "related_order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
        "product_id": "6f437a6c-0c1f-4e15-9f06-777685c96c21",
        "product_name_snapshot": "电机轴",
        "specification_snapshot": "5HP200406",
        "batch_no": "无",
        "process_name": "打锈",
        "next_process": null,
        "status": "in_progress",
        "approval_status": "pending",
        "metrics": {
          "planned_qty": 111,
          "qualified_qty": 111,
          "scrap_qty": 0
        },
        "duration_hours": 3.5,
        "duration_details": [
          { "segment": "白班", "hours": 3.5 }
        ],
        "operator_name": "杜土木",
        "work_date": "2025-10-08",
        "attachments": [],
        "created_at": "2025-10-26T15:23:13Z",
        "updated_at": "2025-10-27T14:04:33Z"
      },
      {
        "id": "e2d0f6d8-60f1-4c33-a24d-4f48b9c859df",
        "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
        "work_order_code": "202510261730000578497",
        "approval_request_id": "202510261730000578497",
        "related_order_id": "c35b4f84-6d03-4a03-b1c4-fb0b59882a60",
        "product_id": "b4fd2ed7-9aaf-4f07-a64d-0d779843a2fe",
        "product_name_snapshot": "鲤东后桥壳总成",
        "specification_snapshot": "591/1272",
        "batch_no": "20251026-REAR-01",
        "process_name": "精车第一、二道、打孔/精车两道",
        "next_process": null,
        "status": "in_progress",
        "approval_status": "pending",
        "metrics": {
          "planned_qty": 30,
          "qualified_qty": 30,
          "scrap_qty": 0
        },
        "duration_hours": 8.0,
        "duration_details": [
          { "segment": "晚班", "hours": 8.0 }
        ],
        "operator_name": "吴志雄",
        "work_date": "2025-10-26",
        "attachments": [],
        "created_at": "2025-10-26T17:30:58Z",
        "updated_at": "2025-10-27T14:00:23Z"
      }
    ],
    "total": 2,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "5c0f13b5-0db0-495d-9421-348ebd4f8f3c",
    "timestamp": "2025-10-29T05:30:00Z"
  }
}
```

### 示例：POST /work-orders

```http
POST /api/work-orders HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 77c85785-97d2-4c13-a0d8-f9a0e41d7b53
```
```json
{
  "order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
  "product_id": "6f437a6c-0c1f-4e15-9f06-777685c96c21",
  "work_order_code": "202510281015000321776",
  "process_name": "打锈",
  "next_process": "探伤检验",
  "batch_no": "AXLE-202510-B01",
  "work_date": "2025-10-28",
  "operator_name": "杜土木",
  "metrics": {
    "planned_qty": 120,
    "qualified_qty": 0,
    "scrap_qty": 0
  },
  "duration_hours": 0,
  "duration_details": [],
  "attachments": [],
  "metadata": {
    "source_payment_request": "202510140928000296746"
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "work_order": {
      "id": "f91fc0d1-7a6f-431b-b3ad-1c2da9d4d8fb",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "work_order_code": "202510281015000321776",
      "approval_request_id": "202510281015000321776",
      "related_order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
      "product_id": "6f437a6c-0c1f-4e15-9f06-777685c96c21",
      "product_name_snapshot": "电机轴",
      "specification_snapshot": "5HP200406",
      "batch_no": "AXLE-202510-B01",
      "process_name": "打锈",
      "next_process": "探伤检验",
      "status": "in_progress",
      "approval_status": "pending",
      "metrics": {
        "planned_qty": 120,
        "qualified_qty": 0,
        "scrap_qty": 0
      },
      "duration_hours": 0,
      "duration_details": [],
      "operator_name": "杜土木",
      "work_date": "2025-10-28",
      "attachments": [],
      "metadata": {
        "source_payment_request": "202510140928000296746"
      },
      "created_at": "2025-10-29T05:32:00Z",
      "updated_at": "2025-10-29T05:32:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "2ce4dc2e-5d98-49b3-9dcb-53f9e0671b32",
    "timestamp": "2025-10-29T05:32:00Z"
  }
}
```

### 示例：GET /work-orders/{work_order_id}

```http
GET /api/work-orders/b315b894-3bd2-42f4-9fb8-7cb0e6d6ed91?include_timeline=true HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "work_order": {
      "id": "b315b894-3bd2-42f4-9fb8-7cb0e6d6ed91",
      "work_order_code": "202510261523000120184",
      "approval_request_id": "202510261523000120184",
      "related_order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
      "product_id": "6f437a6c-0c1f-4e15-9f06-777685c96c21",
      "product_name_snapshot": "电机轴",
      "specification_snapshot": "5HP200406",
      "batch_no": "无",
      "process_name": "打锈",
      "status": "in_progress",
      "approval_status": "pending",
      "metrics": {
        "planned_qty": 111,
        "qualified_qty": 111,
        "scrap_qty": 0
      },
      "duration_hours": 3.5,
      "duration_details": [
        { "segment": "白班", "hours": 3.5 }
      ],
      "operator_name": "杜土木",
      "work_date": "2025-10-08",
      "attachments": []
    },
    "timeline": [
      {
        "actor_name": "吴维丁",
        "actor_id": "536637482221742785",
        "role": "提交申请",
        "action": "提交申请",
        "timestamp": "2025-10-26 15:23:12",
        "comment": ""
      },
      {
        "actor_name": "蔡升华",
        "actor_id": "196311610633434056",
        "role": "直接主管",
        "action": "同意",
        "timestamp": "2025-10-27 14:04:33",
        "comment": "同意"
      }
    ]
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "2b6a4dbd-7a70-47aa-a8ec-8dd8bf7fb65c",
    "timestamp": "2025-10-29T05:34:00Z"
  }
}
```

### 示例：POST /work-orders/{work_order_id}/progress

```http
POST /api/work-orders/b315b894-3bd2-42f4-9fb8-7cb0e6d6ed91/progress HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 9c0a6e96-17c5-4e3e-8a15-1f2fda2a0ab5
```
```json
{
  "metrics": {
    "qualified_qty": 111,
    "scrap_qty": 0,
    "scrap_reasons": []
  },
  "duration_hours": 3.5,
  "duration_details": [
    { "segment": "白班", "hours": 3.5 }
  ],
  "comment": "首批合格件已入检，安排探伤",
  "reported_at": "2025-10-29T05:35:00Z"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "work_order": {
      "id": "b315b894-3bd2-42f4-9fb8-7cb0e6d6ed91",
      "metrics": {
        "planned_qty": 111,
        "qualified_qty": 111,
        "scrap_qty": 0,
        "scrap_reasons": []
      },
      "duration_hours": 3.5,
      "duration_details": [
        { "segment": "白班", "hours": 3.5 }
      ],
      "status": "completed",
      "updated_at": "2025-10-29T05:35:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "19cf0a08-6c85-4c9b-9513-31b791ad92d9",
    "timestamp": "2025-10-29T05:35:00Z"
  }
}
```

---
## 项目管理 (Projects)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/projects` | GET | 分页查询项目列表 | Query：`status`、`priority`、`manager_id`、`department_id`、`q`、`page`、`page_size`、`sort_by` |
| `/projects` | POST | 创建项目 | Body：`code`、`name`、`description`、`manager_id`、`department_id`、`priority`、`status`、`start_date`、`planned_end_date`、`budget_total`、`metadata` |
| `/projects/{project_id}` | GET | 获取项目详情 | Path：`project_id`；Query：`include`（`members,tasks,milestones,deliverables`） |
| `/projects/{project_id}/tasks` | POST | 创建项目任务 | Body：`name`、`task_type`、`status`、`priority`、`assignee_id`、`start_date`、`due_date`、`metadata` |
| `/projects/{project_id}/weekly-deliveries` | GET | 查看项目周交付报告 | Query：`week_start_date`、`status`、`page`、`page_size` |
| `/projects/{project_id}/weekly-deliveries` | POST | 生成/更新项目周交付报告 | Body：`week_start_date`、`status`、`summary`、`completed_items`、`planned_items`、`risk_items`、`cost_variance` |
| `/projects/{project_id}/cost-records` | GET | 查询项目成本流水 | Query：`cost_category`、`cost_type`、`start_date`、`end_date`、`page`、`page_size` |
| `/projects/{project_id}/budget-snapshots` | GET | 获取预算快照历史 | Query：`baseline_only`、`page`、`page_size` |

### 示例：创建项目

```http
POST /api/projects HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: weibo
Idempotency-Key: 6f413f3b-3e6c-4f54-9526-9b0f9a8f5670
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
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "code": "WB-PJ-2025-001",
      "name": "智能装配线升级",
      "description": "面向 2026 财年的智能装配线升级项目，覆盖生产线改造与 AI 助手部署。",
      "manager_id": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
      "department_id": "1dbb4f4e-6316-4a6b-a2fd-88d3f56d3b8b",
      "status": "planning",
      "priority": "high",
      "start_date": "2025-11-01",
      "planned_end_date": "2026-06-30",
      "budget_total": "3200000.00",
      "budget_currency": "CNY",
      "progress_percent": "0.00",
      "health_status": "on_track",
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
| `/finance/records` | POST | 新增财务流水（统一入口） | Body：`record_code`、`record_type`、`flow_direction`、`order_id`、`counterparty_id`、金额、`occurred_at`、`dimensions`、`tags` |
| `/finance/records` | GET | 分页查询财务流水 | Query：`record_type`、`status`、`start_date`、`end_date`、`project_id`、`department_id`、`page`、`page_size` |
| `/finance/report-templates` | GET | 查询财务报表模板及其运行历史 | Query：`status`、`frequency`、`page`、`page_size` |
| `/finance/report-runs` | POST | 触发报表执行（异步） | Body：`template_id`、`scheduled_at`、`parameters`、`triggered_by` |
| `/finance/report-runs` | GET | 查看报表执行历史（模板 run_history 展开） | Query：`template_id`、`status`、`triggered_by`、`start_at`、`end_at`、`page`、`page_size` |
| `/finance/alert-events` | GET | 查询财务预警事件 | Query：`status`、`metric`、`severity`、`start_at`、`end_at`、`page`、`page_size` |
| `/finance/alert-rules` | GET | 获取预警规则配置 | Query：`status`、`metric`、`severity` |
| `/finance/data-sources` | GET | 查询财务数据源连接配置 | 无 |

### 示例：POST /finance/records

引用《付款单-202509021554000061.csv》中“董欣雄”付款记录。

```http
POST /api/finance/records HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: a84cc2a0-1f25-4e1f-9a66-3cb828863279
```
```json
{
  "record_code": "WB-FIN-20251018-001",
  "record_type": "payment",
  "flow_direction": "outflow",
  "status": "pending",
  "order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
  "counterparty_id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
  "amount": "2200.00",
  "currency": "CNY",
  "fx_rate": "1.000000",
  "amount_base": "2200.00",
  "occurred_at": "2025-10-18T02:15:00Z",
  "recognized_at": "2025-10-29T04:45:00Z",
  "reporting_window": "[2025-10-01,2025-10-31]",
  "project_id": null,
  "department_id": null,
  "approval_request_id": "202510161719000580024",
  "source": "approval",
  "source_reference": "202510161719000580024",
  "source_payload": {
    "form_title": "邱梅琴提交的付款申请单（福建鲤东）",
    "payment_reason": "合信25.10月份甲醇货款"
  },
  "dimensions": {
    "company_alias": "福建鲤东",
    "expense_category": "raw_material",
    "payee_name": "董欣雄"
  },
  "tags": [
    "chemical",
    "spot_purchase"
  ],
  "alert_flags": {
    "requires_invoice": true
  },
  "attachments": []
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "financial_record": {
      "id": "b7d5e8bf-4f80-4ea7-8bcf-7f80d61d63fd",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "record_code": "WB-FIN-20251018-001",
      "record_type": "payment",
      "flow_direction": "outflow",
      "status": "pending",
      "order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
      "counterparty_id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
      "amount": "2200.00",
      "currency": "CNY",
      "fx_rate": "1.000000",
      "amount_base": "2200.00",
      "occurred_at": "2025-10-18T02:15:00Z",
      "recognized_at": "2025-10-29T04:45:00Z",
      "reporting_window": "[2025-10-01,2025-10-31]",
      "project_id": null,
      "department_id": null,
      "approval_request_id": "202510161719000580024",
      "source": "approval",
      "source_reference": "202510161719000580024",
      "source_payload": {
        "form_title": "邱梅琴提交的付款申请单（福建鲤东）",
        "payment_reason": "合信25.10月份甲醇货款"
      },
      "ingestion_snapshot": {},
      "dimensions": {
        "company_alias": "福建鲤东",
        "expense_category": "raw_material",
        "payee_name": "董欣雄"
      },
      "tags": [
        "chemical",
        "spot_purchase"
      ],
      "alert_flags": {
        "requires_invoice": true
      },
      "attachments": [],
      "created_by": "16895536232217908",
      "updated_by": "16895536232217908",
      "created_at": "2025-10-29T05:40:00Z",
      "updated_at": "2025-10-29T05:40:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "353c2fa6-aa20-4f13-bb6c-b4fc12264746",
    "timestamp": "2025-10-29T05:40:00Z"
  }
}
```

### 示例：GET /finance/records

```http
GET /api/finance/records?page=1&page_size=20&status=pending HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "b7d5e8bf-4f80-4ea7-8bcf-7f80d61d63fd",
        "record_code": "WB-FIN-20251018-001",
        "record_type": "payment",
        "flow_direction": "outflow",
        "status": "pending",
        "order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
        "counterparty_id": "f3c6a50b-4df5-4bc5-9e3c-1f6e54571abc",
        "amount": "2200.00",
        "currency": "CNY",
        "occurred_at": "2025-10-18T02:15:00Z",
        "dimensions": {
          "company_alias": "福建鲤东",
          "expense_category": "raw_material"
        }
      },
      {
        "id": "cf27f47d-8b92-4c26-b12d-9fbee5332748",
        "record_code": "WB-FIN-20251020-LOGI",
        "record_type": "freight",
        "flow_direction": "outflow",
        "status": "approved",
        "order_id": "c35b4f84-6d03-4a03-b1c4-fb0b59882a60",
        "counterparty_id": "2a5ad3e9-5e42-4f43-9fef-7b8f7f7a4cde",
        "amount": "4873.75",
        "currency": "CNY",
        "occurred_at": "2025-10-20T03:00:00Z",
        "dimensions": {
          "company_alias": "福建鲤东",
          "expense_category": "logistics",
          "billing_period": "2025-09"
        }
      }
    ],
    "total": 2,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "cf46f8ec-4ebd-473c-a520-8a2ca64d47bd",
    "timestamp": "2025-10-29T05:45:00Z"
  }
}
```

### 示例：POST /finance/report-runs

```http
POST /api/finance/report-runs HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
Idempotency-Key: 4f1f2b03-6cc2-4c83-9c31-fb4b02801f03
```
```json
{
  "template_id": "3a2c9b03-41d6-4fcb-9e56-d3f1c5d7b201",
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
      "template_id": "3a2c9b03-41d6-4fcb-9e56-d3f1c5d7b201",
      "status": "running",
      "parameters": {
        "period_start": "2025-10-01",
        "period_end": "2025-10-28",
        "dimension": "department_id",
        "currency": "CNY"
      },
      "triggered_by": "6a8ddc8b-7f62-4c6c-b8cc-8ab6dd0d8da0",
      "created_at": "2025-10-29T05:46:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "22d7f425-e4cc-4fda-bc8e-2ba1f0f53f4d",
    "timestamp": "2025-10-29T05:46:00Z"
  }
}
```

### 示例：GET /finance/report-templates

```http
GET /api/finance/report-templates?status=active&page=1&page_size=10 HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "3a2c9b03-41d6-4fcb-9e56-d3f1c5d7b201",
        "template_code": "cash_flow_daily",
        "name": "每日现金流报表",
        "description": "汇总三家公司日现金流",
        "status": "active",
        "report_scope": "company",
        "layout": { "type": "table", "columns": ["date", "inflow", "outflow"] },
        "filters": { "company_set": ["WB", "FJLD", "CDLD"] },
        "schedule": { "cron": "0 6 * * *", "timezone": "Asia/Shanghai" },
        "subscriptions": [
          { "user_id": "f4b902dd-9ce4-43fa-9f2a-612f4df4ab9f", "channel": "email" }
        ],
        "alert_rules": [
          { "metric": "net_outflow", "threshold": -500000, "severity": "high" }
        ],
        "run_history": [
          {
            "run_id": "cf3429e1-8714-4d91-905d-dc6acb3df50c",
            "status": "success",
            "triggered_at": "2025-10-30T22:00:00Z",
            "finished_at": "2025-10-30T22:02:31Z",
            "triggered_by": "f4b902dd-9ce4-43fa-9f2a-612f4df4ab9f",
            "parameters": { "period_start": "2025-10-30", "period_end": "2025-10-30" },
            "output": { "type": "file", "path": "/reports/cash-flow/2025-10-30.xlsx" }
          },
          {
            "run_id": "873c1f0f-2223-4a48-9da1-1b8beb1fe4c2",
            "status": "failed",
            "triggered_at": "2025-10-29T22:00:00Z",
            "finished_at": "2025-10-29T22:01:05Z",
            "error": "SOURCE_TIMEOUT"
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
    "request_id": "d6f59e0c-2719-4c7f-9c0f-ec0f7ad3f010",
    "timestamp": "2025-10-29T05:50:00Z"
  }
}
```

### 示例：GET /finance/report-runs

```http
GET /api/finance/report-runs?template_id=3a2c9b03-41d6-4fcb-9e56-d3f1c5d7b201&page=1&page_size=20 HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "template_id": "3a2c9b03-41d6-4fcb-9e56-d3f1c5d7b201",
        "template_name": "每日现金流报表",
        "run_id": "cf3429e1-8714-4d91-905d-dc6acb3df50c",
        "status": "success",
        "triggered_at": "2025-10-30T22:00:00Z",
        "finished_at": "2025-10-30T22:02:31Z",
        "triggered_by": "f4b902dd-9ce4-43fa-9f2a-612f4df4ab9f",
        "parameters": { "period_start": "2025-10-30", "period_end": "2025-10-30" },
        "output": { "type": "file", "path": "/reports/cash-flow/2025-10-30.xlsx" },
        "run_history_index": 0
      },
      {
        "template_id": "3a2c9b03-41d6-4fcb-9e56-d3f1c5d7b201",
        "template_name": "每日现金流报表",
        "run_id": "873c1f0f-2223-4a48-9da1-1b8beb1fe4c2",
        "status": "failed",
        "triggered_at": "2025-10-29T22:00:00Z",
        "finished_at": "2025-10-29T22:01:05Z",
        "error": "SOURCE_TIMEOUT",
        "run_history_index": 1
      }
    ],
    "total": 2,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "f531d9d4-41f1-4b3f-9f2e-71c24bc7d3ab",
    "timestamp": "2025-10-29T05:52:00Z"
  }
}
```

### 示例：GET /finance/alert-events

```http
GET /api/finance/alert-events?status=open&page=1&page_size=20 HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "1d2af417-42ac-43f2-9a5d-832c6e1a4601",
        "metric": "cash_balance",
        "severity": "high",
        "status": "open",
        "triggered_at": "2025-10-28T23:00:00Z",
        "dimensions": {
          "company_alias": "福建鲤东",
          "currency": "CNY"
        },
        "context": {
          "current_balance": "-180000.00",
          "threshold": "-150000.00"
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
    "request_id": "2a25f4de-6d52-48a1-a135-4f9ed2c1a7b1",
    "timestamp": "2025-10-29T05:55:00Z"
  }
}
```

### 示例：GET /finance/alert-rules

```http
GET /api/finance/alert-rules?status=active HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "ce2cdd6b-960c-4e5a-9d27-89e6ca4482ea",
        "metric": "cash_balance",
        "severity": "high",
        "status": "active",
        "threshold": -150000,
        "notification_channels": ["email", "slack"],
        "last_triggered_at": "2025-10-28T23:00:00Z",
        "trigger_count": 3
      }
    ]
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "30ea3363-4d0a-42c6-91c4-0b27c0aea4d5",
    "timestamp": "2025-10-29T05:56:00Z"
  }
}
```

### 示例：GET /finance/data-sources

```http
GET /api/finance/data-sources HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": "d2a0f6b3-d4a9-4f4d-bdaa-78ec532f2a28",
        "connector_type": "postgres",
        "status": "healthy",
        "last_synced_at": "2025-10-29T03:00:00Z",
        "diagnostics": {
          "latency_ms": 84,
          "lag_rows": 0
        }
      },
      {
        "id": "5cd60e49-6f9e-413f-95a8-9d79a71c4a07",
        "connector_type": "excel",
        "status": "warning",
        "last_synced_at": "2025-10-28T12:00:00Z",
        "diagnostics": {
          "missing_files": ["付款单.xlsx"],
          "suggestion": "每日同步后上传至对象存储"
        }
      }
    ]
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "74a2de7f-8e1b-4a78-9b21-1f379c7f5f94",
    "timestamp": "2025-10-29T05:57:00Z"
  }
}
```

---
## 审批管理 (Approvals)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/approval-requests` | POST | 创建审批单（草稿或提交） | Body：`request_type`、`title`、`amount`、`currency`、`template_id`、`form_data`、`attachments` |
| `/approval-requests` | GET | 查询我发起的审批单 | Query：`status`、`request_type`、`start_at`、`end_at`、`amount_min`、`amount_max`、`page`、`page_size` |
| `/approval-requests/{request_id}` | GET | 审批单详情（包含 `timeline`） | Path：`request_id`；Query：`include_history`、`include_audit` |
| `/approvals/inbox` | GET | 审批待办列表 | Query：`status`、`priority`、`node`、`initiator`、`department_id`、`sla`、`page`、`page_size` |
| `/approvals/history` | GET | 审批历史列表 | Query：`status`、`action_type`、`start_at`、`end_at`、`page`、`page_size` |
| `/approvals/{step_id}/actions` | POST | 节点操作（同意/驳回/转办/加签/催办/评论） | Body：`action_type`、`comment`、`target_assignee_id`、`attachments` |
| `/approval-workflows` | GET | 获取流程定义与版本 | Query：`business_domain`、`status` |
| `/approval-rules/{version_id}` | GET | 查看流程规则 | Query：`include_conditions` |

### 示例：GET /approval-requests/{request_id}

示例对应《付款单-202509021554000061.csv》中审批编号 `202510140928000296746`，时间线字段来自原始“审批记录”。

```http
GET /api/approval-requests/202510140928000296746?include_history=true&include_audit=true HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_fujian
```
```json
{
  "code": 0,
  "data": {
    "request": {
      "id": "202510140928000296746",
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
      "workflow_id": "9b784c13-2b7e-4e2c-8c3b-2150897a5ed1",
      "workflow_revision": 4,
      "request_code": "AP-2025-00146",
      "title": "林明强提交的付款申请单（福建鲤东）",
      "requester_id": "19606325101004723283",
      "priority": "medium",
      "status": "completed",
      "approval_result": "approved",
      "current_stage": null,
      "submitted_at": "2025-10-14T09:28:30Z",
      "decided_at": "2025-10-15T15:07:29Z",
      "primary_order_id": "7a5a6c1d-5a4f-4f42-9df1-1c7d76b69350",
      "form_payload": {
        "amount": 22098.18,
        "currency": "CNY",
        "payee": "张小连"
      },
      "timeline": [
        {
          "actor_name": "林明强",
          "actor_id": "19606325101004723283",
          "role": "提交申请",
          "action": "提交申请",
          "timestamp": "2025-10-14 09:28:29",
          "comment": ""
        },
        {
          "actor_name": "蔡董",
          "actor_id": "05141957421081146",
          "role": "审批",
          "action": "同意",
          "timestamp": "2025-10-14 12:39:11",
          "comment": ""
        },
        {
          "actor_name": "邱梅琴",
          "actor_id": "16895536232217908",
          "role": "微柏审单财务",
          "action": "转交",
          "timestamp": "2025-10-14 13:31:34",
          "comment": ""
        },
        {
          "actor_name": "胡春梅",
          "actor_id": "232604322832543649",
          "role": "评论",
          "action": "添加评论",
          "timestamp": "2025-10-15 09:30:52",
          "comment": "6月开票金额590328.05于25.9月收齐，实际付款金额24134.55"
        },
        {
          "actor_name": "胡春梅",
          "actor_id": "232604322832543649",
          "role": "评论",
          "action": "添加评论",
          "timestamp": "2025-10-15 09:31:23",
          "comment": "6月开票金额590328.05于25.9月收齐，实际付款金额21434.55"
        },
        {
          "actor_name": "胡春梅",
          "actor_id": "232604322832543649",
          "role": "微柏审单财务",
          "action": "同意",
          "timestamp": "2025-10-15 09:31:45",
          "comment": ""
        },
        {
          "actor_name": "邱梅琴",
          "actor_id": "19606325101004723283",
          "role": "微柏审单财务（抄送或签审批人）",
          "action": "抄送",
          "timestamp": "2025-10-15 09:31:46",
          "comment": ""
        },
        {
          "actor_name": "陈清芳",
          "actor_id": "082855686337878166",
          "role": "审批人",
          "action": "同意",
          "timestamp": "2025-10-15 11:20:33",
          "comment": "以后款项到了，最迟当周就要提单了，不要放那么久才提单"
        },
        {
          "actor_name": "胡春梅",
          "actor_id": "232604322832543649",
          "role": "评论",
          "action": "添加评论",
          "timestamp": "2025-10-15 13:41:18",
          "comment": "[林明强](19606325101004723283)"
        },
        {
          "actor_name": "蔡董",
          "actor_id": "05141957421081146",
          "role": "审批人",
          "action": "同意",
          "timestamp": "2025-10-15 15:07:28",
          "comment": ""
        },
        {
          "actor_name": "杨惠龙,魏嘉婉,陈清芳,林小琴,佘丽芹,邱梅琴,胡春梅",
          "actor_id": "19606325101004723283",
          "role": "抄送人",
          "action": "抄送",
          "timestamp": "2025-10-15 15:07:28",
          "comment": ""
        }
      ],
      "active_assignments": []
    },
    "attachments": [
      {
        "attachment_id": "att-202510140928-001",
        "file_name": "付款申请单.pdf"
      }
    ],
    "audit_logs": [
      {
        "id": "audit-001",
        "event": "approval.timeline.insert",
        "timestamp": "2025-10-15T11:20:34Z"
      }
    ]
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "35f780e4-2af1-429e-9d28-cc792efb2e4f",
    "timestamp": "2025-10-29T06:00:00Z"
  }
}
```

---
## 人事管理 (HR)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/hr/employees` | GET | 分页查询员工档案 | Query：`employment_status`、`department_id`、`job_title`、`keyword`、`page`、`page_size`、`sort_by` |
| `/hr/employees/{user_id}` | GET | 员工详情 | Path：`user_id`；Query：`include_histories`、`include_skills` |
| `/hr/employees/{user_id}` | PUT | 更新员工档案（触发审批） | Body：`employment_status`、`job_title`、`job_level`、`salary_info`、`work_location`、`metadata` |
| `/hr/efficiency-reports` | POST | 生成效率报告 | Body：`report_type`、`owner_user_id`、`department_id`、`period_start`、`period_end`、`content` |
| `/hr/efficiency-scores` | GET | 查询效率评分及趋势 | Query：`period_start`、`period_end`、`department_id`、`employee_id`、`metric`、`page`、`page_size` |

### 示例：GET /hr/employees

```http
GET /api/hr/employees?page=1&page_size=10&employment_status=active HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_chengdu
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "user": {
          "id": "a668b69c-75d3-47d7-8c89-df5136c2fc6f",
          "email": "li.mei@Vibot.com",
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
            "skills_snapshot": ["Vue 3", "TypeScript"],
            "last_efficiency_score": 88
          }
        }
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

### 示例：GET /hr/employees/{user_id}

```http
GET /api/hr/employees/a668b69c-75d3-47d7-8c89-df5136c2fc6f?include_histories=true HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_chengdu
```
```json
{
  "code": 0,
  "data": {
    "user": {
      "id": "a668b69c-75d3-47d7-8c89-df5136c2fc6f",
      "email": "li.mei@Vibot.com",
      "username": "li.mei",
      "status": "active",
      "department_id": "3f62f763-3b6a-4a03-8f6b-ff4ed4c4bf53"
    },
    "employee_record": {
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
      "work_location": "成都 · 高新区"
    },
    "skills": [
      {
        "name": "Vue 3",
        "proficiency": "expert",
        "last_validated_at": "2025-07-01T00:00:00Z"
      },
      {
        "name": "TypeScript",
        "proficiency": "advanced",
        "last_validated_at": "2025-07-01T00:00:00Z"
      }
    ],
    "histories": [
      {
        "changed_at": "2025-09-30T10:00:00Z",
        "change_type": "salary_adjustment",
        "before": { "base": 26000 },
        "after": { "base": 28000 }
      }
    ]
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "2d7d4a0d-4f5b-4d8f-9ab3-f8eab3d25370",
    "timestamp": "2025-10-29T05:19:00Z"
  }
}
```

### 示例：PUT /hr/employees/{user_id}

```http
PUT /api/hr/employees/a668b69c-75d3-47d7-8c89-df5136c2fc6f HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_chengdu
Idempotency-Key: 78f3b5df-e1a2-4e45-946c-4bc095d0ca86
```
```json
{
  "job_title": "资深前端工程师",
  "job_level": "P6",
  "salary_info": {
    "base": 32000,
    "currency": "CNY"
  },
  "metadata": {
    "remote_ratio": 0.5
  }
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "approval_request_id": "20251029-HR-00032"
  },
  "message": "审批中",
  "error": null,
  "meta": {
    "request_id": "f58ea5a1-eda4-4c2d-9425-2f3fc0adce40",
    "timestamp": "2025-10-29T05:20:00Z"
  }
}
```

### 示例：POST /hr/efficiency-reports

```http
POST /api/hr/efficiency-reports HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_chengdu
Idempotency-Key: 2cbc6cd1-2bd3-4a22-8f4d-16d2f2711f9d
```
```json
{
  "report_type": "team",
  "department_id": "3f62f763-3b6a-4a03-8f6b-ff4ed4c4bf53",
  "period_start": "2025-09-01",
  "period_end": "2025-09-30",
  "content": {
    "summary": "前端团队交付率 95%，缺口集中在移动端测试资源。",
    "highlights": ["完成自动化装配线前端改版"],
    "risks": ["移动测试资源不足"],
    "recommendations": ["新增 1 名移动端测试外包"]
  },
  "generated_via": "conversation"
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "report": {
      "id": "a27c9322-8db5-4fd5-9cb6-3c19857ade55",
      "department_id": "3f62f763-3b6a-4a03-8f6b-ff4ed4c4bf53",
      "period_start": "2025-09-01",
      "period_end": "2025-09-30",
      "content": {
        "summary": "前端团队交付率 95%，缺口集中在移动端测试资源。",
        "highlights": ["完成自动化装配线前端改版"],
        "risks": ["移动测试资源不足"],
        "recommendations": ["新增 1 名移动端测试外包"]
      },
      "generated_via": "conversation",
      "created_at": "2025-10-29T05:22:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "c0e1a5f6-0ee2-4ae0-9a93-6d5d48da0f0f",
    "timestamp": "2025-10-29T05:22:00Z"
  }
}
```

### 示例：GET /hr/efficiency-scores

```http
GET /api/hr/efficiency-scores?period_start=2025-09-01&period_end=2025-09-30&department_id=3f62f763-3b6a-4a03-8f6b-ff4ed4c4bf53 HTTP/1.1
Authorization: Bearer mocked.jwt.token
X-Company-Code: lidong_chengdu
```
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "employee_id": "a668b69c-75d3-47d7-8c89-df5136c2fc6f",
        "metric": "productivity",
        "score": 88,
        "trend": [80, 84, 88]
      }
    ],
    "total": 1,
    "page": 1,
    "page_size": 20
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "0e9d1d1e-4306-47f3-9d50-ecf74f293922",
    "timestamp": "2025-10-29T05:23:00Z"
  }
}
```

---
## 资料库 (Knowledge)

| 接口路径 | 方法 | 描述 | 核心参数 |
| --- | --- | --- | --- |
| `/knowledge/assets` | GET | 分页检索资料库资产 | Query：`keyword`、`type`（映射 `attachments.tags`）、`owner_id`、`created_start`、`created_end`、`page`、`page_size`、`sort_by` |
| `/knowledge/assets` | POST | 上传资料资产 | Body：`file_name`、`mime_type`、`file_size`、`storage_key`、`tags`、`source`、`metadata` |
| `/knowledge/assets/{attachment_id}` | GET | 资料资产详情 | Path：`attachment_id` |
| `/knowledge/assets/{attachment_id}/share-links` | POST | 生成分享链接 | Body：`expire_at`、`permissions` |
| `/knowledge/search` | POST | 语义检索接口 | Body：`query`、`filters`、`top_k` |

### 示例：上传资料资产

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
      "company_id": "83f4e4d2-5b4a-4a0d-9c98-99c75f0cc001",
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

### 示例：生成分享链接

```http
POST /api/knowledge/assets/452f8b7d-7612-4f41-8e9b-2f7bde23a7bb/share-links HTTP/1.1
Content-Type: application/json
Authorization: Bearer mocked.jwt.token
X-Company-Code: weibo
```
```json
{
  "expire_at": "2025-11-30T00:00:00Z",
  "permissions": ["view", "download"]
}
```

**响应**
```json
{
  "code": 0,
  "data": {
    "share_link": {
      "id": "8fdfa3f7-5c40-4040-8c7d-07814dd9fd5c",
      "attachment_id": "452f8b7d-7612-4f41-8e9b-2f7bde23a7bb",
      "url": "https://mock-download/f/8fdfa3f7-5c40-4040-8c7d-07814dd9fd5c",
      "token": "share-token-20251029",
      "expire_at": "2025-11-30T00:00:00Z",
      "max_views": null,
      "permissions": ["view", "download"],
      "created_at": "2025-10-29T06:13:00Z"
    }
  },
  "message": "ok",
  "error": null,
  "meta": {
    "request_id": "2c7f2b30-5d93-4d1c-b2e5-8507daa7f94d",
    "timestamp": "2025-10-29T06:13:00Z"
  }
}
```

---
## 联调说明与约束

1. **租户隔离**：前端在接口调用层面需始终携带 `X-Company-Code`，Mock 服务会在响应中返回对应 `company_id` 以便校验上下游逻辑是否透传成功。
2. **字段对齐**：本文档中出现的字段名称及结构均直接映射到《docs/database-schema.md》的 PostgreSQL 表字段，前端不得自行增删字段，需透出完整原始对象供联调验证。
3. **数据来源可追溯**：客户、订单、工单、审批、财务示例全部来源于《付款单-202509021554000061.csv》《工序产量单-202509021114000201.csv》《运费申请-202411021636000411.csv》，`metadata` 中保留 `source_*` 字段便于验证。
4. **权限校验模拟**：Mock 服务根据 `user_roles`、`role_permissions`、`permissions` 手工配置接口可访问性；当请求无权限时返回 `403/1003`，请前端实现对应拦截与提示。
5. **审计追踪**：所有写操作响应中包含 `meta.request_id`，前端需在日志中保留该字段，便于真实环境接入链路追踪与审计。
6. **Mock 数据持久性**：服务重启会重置内存数据；如需复现复杂链路，请将本文档的请求/响应示例固化为 Playwright / E2E 剧本基线。

