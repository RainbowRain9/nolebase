# Vibot Supabase API 实践手册

## 引言：架构变更声明

Vibot 后端接口已经全面迁移至 **Supabase** 平台，所有业务数据通过 Supabase 托管的 PostgreSQL 暴露为 PostgREST API，并由 `@supabase/supabase-js` 客户端库完成调用。本手册基于 `docs/database-schema.md` 中的完整表结构，为所有业务域提供可复制、可直接运行的 API 调用示例。

- Supabase 官方文档（推荐搭配阅读）：<https://supabase.com/docs>
- PostgREST API 参考：<https://supabase.com/docs/reference/postgrest>
- 数据库模式参考：[database-schema.md](database-schema.md)

## 核心原则：与 Supabase API 交互

- **表即端点**：每张数据库表、视图会自动映射为 `https://<project_ref>.supabase.co/rest/v1/<table>`，所有 CRUD 操作均是 SQL 的 REST 化表达。
- **RLS 多租户**：行级安全策略已启用，后端会依据 JWT 中的 `company_id` 自动隔离不同公司的数据，无需手动拼接 `company_id` 过滤条件。
- **角色权限控制**：所有操作需满足 `has_role('Vibot.xxx')` 角色要求，角色信息存储在 JWT 的 `app_metadata.role_keys` 中。
- **客户端优先**：推荐使用 `@supabase/supabase-js` 在前端/Edge 中操作数据；若必须发起自定义 `fetch`/`axios` 请求，需手动附加 `apikey` 与 `Authorization` 头部。
- **声明式查询**：Filter、排序、分页统一通过链式方法（`eq`, `ilike`, `order`, `range` 等）表达，避免手写 SQL。
- **安全默认值**：严禁在浏览器中使用 `service_role` 密钥；后台服务若需高权限操作，必须通过 Edge Functions 或 BFF 层代理。

## 认证 (Authentication)

### 初始化 Supabase 客户端

在前端共享模块（如 `src/lib/supabase.ts`）中初始化客户端。建议使用 CLI 生成的 `Database` 类型，确保字段与 `docs/database-schema.md` 对齐。

```ts
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase' // 通过 `supabase gen types typescript --linked` 生成

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

### 登录与会话管理

```ts
// src/features/auth/useAuth.ts
import { supabase } from '@/lib/supabase'

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

export async function getActiveSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()
  if (error) throw error
  return session
}
```

### 在自定义请求中附加 JWT

当需要直接访问 `rest/v1` 或项目 BFF 时，可通过如下助手函数自动附带 Supabase JWT 与 `apikey`。

```ts
// src/utils/supabaseFetch.ts
import { supabase } from '@/lib/supabase'

export async function supabaseFetch(input: RequestInfo, init: RequestInit = {}) {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = new Headers(init.headers)
  headers.set('apikey', import.meta.env.VITE_SUPABASE_ANON_KEY!)
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`)
  }

  return fetch(input, {
    ...init,
    headers,
  })
}

// 用法：
export async function downloadCustomerCsv() {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/customers?select=*`
  const res = await supabaseFetch(url, { headers: { Accept: 'text/csv' } })
  if (!res.ok) throw new Error(`Download failed: ${res.status}`)
  return res.blob()
}
```

> 提示：若前端完全通过 `supabase.from(...).select(...)` 访问数据，则无需手动附加头部，SDK 会自动处理。

## 核心多租户与权限 API

本节涵盖公司管理、用户管理、角色权限等核心基础功能。

### 公司管理 (companies)

```ts
// 获取公司列表（仅平台管理员可访问）
export async function listCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('id, code, name, status, timezone, locale, metadata')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// 更新公司信息
export async function updateCompany(companyId: string, updates: {
  name?: string
  status?: 'active' | 'suspended' | 'closed'
  timezone?: string
  locale?: string
  metadata?: any
}) {
  const { data, error } = await supabase
    .from('companies')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 用户管理 (users)

```ts
// 获取当前用户信息
export async function getCurrentUser() {
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const { data, error } = await supabase
    .from('users')
    .select(`
      id, email, display_name, phone, status, locale, timezone,
      company_id, department_id,
      user_profiles(title, avatar_url, contact, preferences)
    `)
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

// 搜索公司内用户（需具备管理员或HR角色）
export async function searchUsers(keyword?: string) {
  let query = supabase
    .from('users')
    .select('id, email, display_name, phone, status, company_id')

  if (keyword) {
    query = query.or(`display_name.ilike.%${keyword}%,email.ilike.%${keyword}%`)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw error
  return data ?? []
}

// 更新用户信息（用户可更新自己的基本信息）
export async function updateUserProfile(updates: {
  display_name?: string
  phone?: string
  locale?: string
  timezone?: string
}) {
  const { data, error } = await supabase
    .from('users')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('auth_user_id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 角色权限管理 (roles, role_permissions, user_roles)

```ts
// 获取公司所有角色
export async function listRoles() {
  const { data, error } = await supabase
    .from('roles')
    .select('id, code, name, description, scope')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// 为用户分配角色
export async function assignUserRole(userId: string, roleId: string, scopeResourceType?: string, scopeResourceId?: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role_id: roleId,
      company_id: (await getCurrentUser())?.company_id,
      scope_resource_type: scopeResourceType,
      scope_resource_id: scopeResourceId,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 获取用户的所有角色
export async function getUserRoles(userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      id, role_id, scope_resource_type, scope_resource_id, assigned_at,
      roles(code, name, description, scope)
    `)
    .eq('user_id', userId)

  if (error) throw error
  return data ?? []
}
```

## 业务基础域 API

涵盖客户、订单、产品、工单等核心业务数据。

### 客户管理 (customers)

```ts
// 获取客户列表
export async function listCustomers(options: {
  keyword?: string
  type?: 'supplier' | 'customer' | 'logistics' | 'employee' | 'other'
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('customers')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.or(`name.ilike.%${options.keyword}%,contact_name.ilike.%${options.keyword}%`)
  }
  if (options.type) {
    query = query.eq('customer_type', options.type)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 创建客户
export async function createCustomer(payload: {
  name: string
  customer_type: 'supplier' | 'customer' | 'logistics' | 'employee' | 'other'
  contact_name?: string
  contact_phone?: string
  tax_id?: string
  bank_account_name?: string
  bank_name?: string
  bank_account?: string
  address?: string
  payment_terms?: string
}) {
  const { data, error } = await supabase
    .from('customers')
    .insert({
      ...payload,
      created_by: (await getCurrentUser())?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 更新客户信息
export async function updateCustomer(customerId: string, updates: {
  name?: string
  contact_name?: string
  contact_phone?: string
  bank_account_name?: string
  bank_name?: string
  bank_account?: string
  address?: string
  payment_terms?: string
}) {
  const { data, error } = await supabase
    .from('customers')
    .update({
      ...updates,
      updated_by: (await getCurrentUser())?.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', customerId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 订单管理 (orders)

```ts
// 获取订单列表
export async function listOrders(options: {
  keyword?: string
  type?: 'freight_payment' | 'ap_payment' | 'ar_refund' | 'other'
  status?: string
  customerId?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('orders')
    .select(`
      id, order_code, order_type, order_status, approval_status,
      amount_total, currency, payment_date,
      customer:customers(id, name, customer_type),
      created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.ilike('order_code', `%${options.keyword}%`)
  }
  if (options.type) {
    query = query.eq('order_type', options.type)
  }
  if (options.status) {
    query = query.eq('order_status', options.status)
  }
  if (options.customerId) {
    query = query.eq('customer_id', options.customerId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 获取订单详情
export async function getOrderDetail(orderId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, order_code, order_type, order_status, approval_status,
      amount_total, currency, line_items, summary, attachments,
      customer:customers(id, name, customer_type, bank_account_name, bank_name, bank_account),
      created_by, created_at, updated_at
    `)
    .eq('id', orderId)
    .maybeSingle()

  if (error) throw error
  if (!data) throw new Error('订单不存在或无访问权限')
  return data
}

// 创建订单
export async function createOrder(payload: {
  order_type: 'freight_payment' | 'ap_payment' | 'ar_refund' | 'other'
  customer_id: string
  amount_total: number
  currency: string
  payment_method?: string
  summary?: string
  line_items?: any[]
  attachments?: any[]
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...payload,
      order_status: 'draft',
      approval_status: 'pending',
      order_code: `ORD${Date.now()}`,
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 审批通过订单
export async function approveOrder(orderId: string, approverId: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      approval_status: 'approved',
      order_status: 'completed',
      updated_by: approverId,
      payment_date: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 产品管理 (products)

```ts
// 获取产品列表
export async function listProducts(options: {
  keyword?: string
  type?: string
  isActive?: boolean
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.or(`name.ilike.%${options.keyword}%,product_code.ilike.%${options.keyword}%`)
  }
  if (options.type) {
    query = query.eq('product_type', options.type)
  }
  if (options.isActive !== undefined) {
    query = query.eq('is_active', options.isActive)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 创建产品
export async function createProduct(payload: {
  productCode: string
  name: string
  specification?: string
  productType?: string
  unit?: string
  defaultProcessFlow?: any
  metadata?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('products')
    .insert({
      product_code: payload.productCode,
      name: payload.name,
      specification: payload.specification ?? null,
      product_type: payload.productType ?? 'component',
      unit: payload.unit ?? '件',
      default_process_flow: payload.defaultProcessFlow ?? {},
      metadata: payload.metadata ?? {},
      is_active: true,
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 更新产品
export async function updateProduct(productId: string, updates: {
  name?: string
  specification?: string
  product_type?: string
  unit?: string
  default_process_flow?: any
  metadata?: any
  is_active?: boolean
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('products')
    .update({
      ...updates,
      updated_by: user?.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 工单管理 (work_orders)

```ts
// 获取工单列表
export async function listWorkOrders(options: {
  keyword?: string
  status?: string
  processName?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('work_orders')
    .select(`
      id, work_order_code, process_name, status, approval_status,
      product_name_snapshot, batch_no, work_date, operator_name,
      product:products(id, product_code, name),
      related_order:orders(id, order_code),
      created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.ilike('work_order_code', `%${options.keyword}%`)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.processName) {
    query = query.eq('process_name', options.processName)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 创建工单
export async function createWorkOrder(payload: {
  related_order_id?: string
  product_id: string
  product_name_snapshot: string
  specification_snapshot?: string
  batch_no?: string
  process_name: string
  next_process?: string
  metrics?: any
  duration_hours?: number
  operator_name?: string
  work_date?: string
  remarks?: string
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('work_orders')
    .insert({
      ...payload,
      work_order_code: `WO${Date.now()}`,
      status: 'in_progress',
      approval_status: 'pending',
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 更新工单状态
export async function updateWorkOrderStatus(workOrderId: string, status: string, metrics?: any) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('work_orders')
    .update({
      status,
      metrics: metrics ?? {},
      updated_by: user?.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', workOrderId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

> 如必须硬删除，可将 `.update(...)` 改为 `.delete()`；建议同时加上 `.limit(1, { foreignTable: undefined })` 或 `maxAffected` 约束，防止误删多行。

## 审批域 API

审批是系统的核心功能，涉及审批单、待办、流程等。

### 审批单管理 (approval_requests)

```ts
// 获取审批单列表
export async function listApprovalRequests(options: {
  keyword?: string
  status?: string
  requesterId?: string
  category?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('approval_requests')
    .select(`
      id, request_code, title, status, approval_result, priority,
      current_stage, submitted_at, decided_at,
      requester:users(id, display_name),
      created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.or(`title.ilike.%${options.keyword}%,request_code.ilike.%${options.keyword}%`)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.requesterId) {
    query = query.eq('requester_id', options.requesterId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 获取审批单详情
export async function getApprovalRequestDetail(requestId: string) {
  const { data, error } = await supabase
    .from('approval_requests')
    .select(`
      id, request_code, title, status, approval_result,
      form_payload, timeline, active_assignments, attachments,
      requester:users(id, display_name, email),
      primary_order:orders(id, order_code, amount_total),
      conversation:ai_conversations(id, topic),
      created_at, updated_at
    `)
    .eq('id', requestId)
    .maybeSingle()

  if (error) throw error
  return data
}

// 创建审批单
export async function createApprovalRequest(payload: {
  workflow_id: string
  title: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  form_payload?: any
  primary_order_id?: string
  attachments?: any[]
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      ...payload,
      workflow_revision: 1,
      request_code: `AR${Date.now()}`,
      status: 'draft',
      approval_result: 'pending',
      requester_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// 提交审批单
export async function submitApprovalRequest(requestId: string) {
  const { data, error } = await supabase
    .from('approval_requests')
    .update({
      status: 'submitted',
      approval_result: 'pending',
      submitted_at: new Date().toISOString(),
      current_stage_started_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', requestId)
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 审批待办管理 (approval_request_assignments)

```ts
// 获取我的待办列表
export async function listMyTasks(options: {
  status?: string
  page?: number
  pageSize?: number
} = {}) {
  const user = await getCurrentUser()
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('approval_request_assignments')
    .select(`
      id, request_id, stage_key, assignment_type, assignment_state,
      due_at, completed_at,
      approval_requests!inner(
        id, request_code, title, priority, submitted_at,
        requester:users(id, display_name)
      )
    `, { count: 'exact' })
    .eq('assignee_id', user?.id)
    .order('due_at', { ascending: true, nullsFirst: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.status) {
    query = query.eq('assignment_state', options.status)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 处理审批任务
export async function processApprovalTask(assignmentId: string, action: 'approve' | 'reject', comment?: string) {
  const user = await getCurrentUser()

  // 记录审批动作
  const { data: assignment, error: fetchError } = await supabase
    .from('approval_request_assignments')
    .select('request_id')
    .eq('id', assignmentId)
    .single()

  if (fetchError) throw fetchError

  const { data, error } = await supabase
    .from('approval_actions')
    .insert({
      request_id: assignment.request_id,
      assignment_id: assignmentId,
      actor_id: user?.id,
      action_type: action,
      action_payload: comment ? { comment } : {},
      next_state: { status: action === 'approve' ? 'approved' : 'rejected' }
    })
    .select()
    .single()

  if (error) throw error

  // 更新待办状态
  await supabase
    .from('approval_request_assignments')
    .update({
      assignment_state: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', assignmentId)

  return data
}
```

### 审批流程管理 (approval_workflows)

```ts
// 获取审批流程列表
export async function listApprovalWorkflows(options: {
  category?: string
  status?: string
} = {}) {
  let query = supabase
    .from('approval_workflows')
    .select('id, code, name, category, status, latest_revision, published_at')

  if (options.category) {
    query = query.eq('category', options.category)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// 获取流程详情
export async function getWorkflowDetail(workflowId: string) {
  const { data, error } = await supabase
    .from('approval_workflows')
    .select(`
      id, code, name, category, status,
      definition, form_schema, metadata,
      created_by, created_at, updated_at
    `)
    .eq('id', workflowId)
    .maybeSingle()

  if (error) throw error
  return data
}
```

## 财务域 API

财务数据是企业的核心资产，需要严格的权限控制。

### 财务记录管理 (financial_records)

```ts
// 获取财务记录列表
export async function listFinancialRecords(options: {
  keyword?: string
  type?: string
  status?: string
  flowDirection?: 'inflow' | 'outflow'
  startDate?: string
  endDate?: string
  projectId?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('financial_records')
    .select(`
      id, record_code, record_type, status, flow_direction,
      amount, currency, occurred_at, recognized_at,
      counterparty:customers(id, name),
      order:orders(id, order_code),
      project:projects(id, name),
      created_at
    `, { count: 'exact' })
    .order('occurred_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.ilike('record_code', `%${options.keyword}%`)
  }
  if (options.type) {
    query = query.eq('record_type', options.type)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.flowDirection) {
    query = query.eq('flow_direction', options.flowDirection)
  }
  if (options.startDate) {
    query = query.gte('occurred_at', options.startDate)
  }
  if (options.endDate) {
    query = query.lte('occurred_at', options.endDate)
  }
  if (options.projectId) {
    query = query.eq('project_id', options.projectId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 获取财务记录详情
export async function getFinancialRecordDetail(recordId: string) {
  const { data, error } = await supabase
    .from('financial_records')
    .select(`
      id, record_code, record_type, status, flow_direction,
      amount, currency, fx_rate, amount_base,
      occurred_at, recognized_at, reporting_window,
      source, source_reference, source_payload,
      dimensions, tags, alert_flags, attachments,
      counterparty:customers(id, name, customer_type),
      order:orders(id, order_code, order_type),
      project:projects(id, name, code),
      department:departments(id, name),
      created_by, created_at, updated_at
    `)
    .eq('id', recordId)
    .maybeSingle()

  if (error) throw error
  return data
}

// 创建财务记录
export async function createFinancialRecord(payload: {
  record_type: string
  flow_direction: 'inflow' | 'outflow'
  amount: number
  currency: string
  occurred_at: string
  order_id?: string
  counterparty_id?: string
  project_id?: string
  department_id?: string
  source?: string
  source_reference?: string
  dimensions?: any
  tags?: string[]
  attachments?: any[]
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('financial_records')
    .insert({
      ...payload,
      record_code: `FR${Date.now()}`,
      status: 'pending',
      source: payload.source ?? 'manual',
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 财务报表模板 (financial_report_templates)

```ts
// 获取财务报表模板列表
export async function listFinancialReportTemplates() {
  const { data, error } = await supabase
    .from('financial_report_templates')
    .select(`
      id, template_code, name, description, status,
      report_scope, last_run_at, last_run_status,
      owner:users(id, display_name),
      created_at
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// 获取报表模板详情
export async function getReportTemplateDetail(templateId: string) {
  const { data, error } = await supabase
    .from('financial_report_templates')
    .select(`
      id, template_code, name, description, status,
      report_scope, layout, filters, schedule,
      subscriptions, alert_rules, run_history,
      data_sources, sync_state,
      owner:users(id, display_name),
      created_at, updated_at
    `)
    .eq('id', templateId)
    .maybeSingle()

  if (error) throw error
  return data
}

// 创建财务报表模板
export async function createReportTemplate(payload: {
  template_code: string
  name: string
  description?: string
  report_scope: string
  layout?: any
  filters?: any
  schedule?: any
  alert_rules?: any[]
  data_sources?: any[]
  timezone?: string
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('financial_report_templates')
    .insert({
      ...payload,
      status: 'active',
      subscriptions: [],
      alert_history: [],
      run_history: [],
      sync_state: {},
      owner_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

## 项目管理域 API

项目管理涉及项目、成员、事项等。

### 项目管理 (projects)

```ts
// 获取项目列表
export async function listProjects(options: {
  keyword?: string
  status?: string
  type?: string
  ownerId?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('projects')
    .select(`
      id, code, name, status, project_type, health_color,
      start_date, end_date, budget_amount, budget_currency,
      owner:users(id, display_name),
      department:departments(id, name),
      created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.or(`name.ilike.%${options.keyword}%,code.ilike.%${options.keyword}%`)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.type) {
    query = query.eq('project_type', options.type)
  }
  if (options.ownerId) {
    query = query.eq('owner_id', options.ownerId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 获取项目详情
export async function getProjectDetail(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      id, code, name, status, project_type, health_color,
      start_date, end_date, budget_amount, budget_currency,
      reporting_summary, custom_fields,
      owner:users(id, display_name, email),
      department:departments(id, name, path),
      members:project_members(
        id, role, allocation_pct, joined_at,
        user:users(id, display_name, email)
      ),
      created_at, updated_at
    `)
    .eq('id', projectId)
    .maybeSingle()

  if (error) throw error
  return data
}

// 创建项目
export async function createProject(payload: {
  code: string
  name: string
  project_type: string
  owner_id: string
  department_id?: string
  start_date?: string
  end_date?: string
  budget_amount?: number
  budget_currency?: string
  custom_fields?: any
}) {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      ...payload,
      status: 'active',
      health_color: 'green',
      reporting_summary: {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 项目成员管理 (project_members)

```ts
// 获取项目成员列表
export async function listProjectMembers(projectId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      id, role, allocation_pct, joined_at, left_at,
      user:users(id, display_name, email, phone),
      created_at
    `)
    .eq('project_id', projectId)
    .order('joined_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// 添加项目成员
export async function addProjectMember(payload: {
  project_id: string
  user_id: string
  role: string
  allocation_pct?: number
  joined_at?: string
  permissions?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('project_members')
    .insert({
      ...payload,
      company_id: user?.company_id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 项目事项管理 (project_items)

```ts
// 获取项目事项列表
export async function listProjectItems(projectId: string, options: {
  type?: 'task' | 'milestone' | 'deliverable' | 'update'
  status?: string
  assigneeId?: string
  parentItemId?: string
} = {}) {
  let query = supabase
    .from('project_items')
    .select(`
      id, item_type, title, status, priority,
      planned_start, planned_end, actual_start, actual_end,
      progress_metrics, tags,
      assignee:users(id, display_name),
      parent_item:project_items(id, title),
      created_by, created_at
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })

  if (options.type) {
    query = query.eq('item_type', options.type)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.assigneeId) {
    query = query.eq('assignee_id', options.assigneeId)
  }
  if (options.parentItemId) {
    query = query.eq('parent_item_id', options.parentItemId)
  }

  const { data, error } = await query

  if (error) throw error
  return data ?? []
}

// 创建项目事项
export async function createProjectItem(payload: {
  project_id: string
  item_type: 'task' | 'milestone' | 'deliverable' | 'update'
  title: string
  description?: string
  priority?: string
  assignee_id?: string
  parent_item_id?: string
  planned_start?: string
  planned_end?: string
  dependency_ids?: string[]
  tags?: string[]
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('project_items')
    .insert({
      ...payload,
      status: 'open',
      progress_metrics: {},
      timeline: [],
      linked_resources: {},
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

## 通用资产 API

### 附件管理 (attachments)

```ts
// 获取附件列表
export async function listAttachments(options: {
  category?: string
  ownerId?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('attachments')
    .select('*', { count: 'exact' })
    .order('uploaded_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.category) {
    query = query.eq('category', options.category)
  }
  if (options.ownerId) {
    query = query.eq('owner_id', options.ownerId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 上传附件（使用 Supabase Storage）
export async function uploadAttachment(file: File, category: string = 'general') {
  const user = await getCurrentUser()
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${user?.company_id}/${category}/${fileName}`

  // 上传到 Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('attachments')
    .upload(filePath, file)

  if (uploadError) throw uploadError

  // 计算校验和
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  // 记录到 attachments 表
  const { data, error } = await supabase
    .from('attachments')
    .insert({
      file_name: file.name,
      content_type: file.type,
      size_bytes: file.size,
      storage_path: filePath,
      checksum,
      category,
      owner_id: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

## 过滤、排序与分页模式

```ts
// 通用搜索函数
export async function searchOrders(options: {
  keyword?: string
  customerId?: string
  orderTypes?: string[]
  page?: number
  pageSize?: number
}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('orders')
    .select('id, order_code, order_type, order_status, amount_total, currency, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.ilike('order_code', `%${options.keyword}%`)
  }
  if (options.customerId) {
    query = query.eq('customer_id', options.customerId)
  }
  if (options.orderTypes?.length) {
    query = query.in('order_type', options.orderTypes)
  }

  const { data, error, count } = await query
  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
  }
}
```

常见操作速查：

| 需求            | 写法示例                              |
| --------------- | ------------------------------------- |
| 模糊匹配        | `.ilike('name', '%机械%')`           |
| 范围查询        | `.gte('created_at', '2025-01-01').lte('created_at', '2025-01-31')` |
| 多值匹配        | `.in('customer_type', ['supplier','logistics'])` |
| 嵌套 JSON 过滤 | `.eq('line_items->>category', 'freight')` |
| 限制返回列      | `.select('id, name')`                  |
| 执行 COUNT      | `.select('*', { count: 'exact', head: true })` |
| 关联查询        | `.select('*, customer:customers(id, name)')` |

## AI 协作域 API

AI 协作功能基于 Dify 平台，存储会话和消息。

### AI 会话管理 (ai_conversations)

```ts
// 获取 AI 会话列表
export async function listAIConversations(options: {
  type?: string
  status?: string
  page?: number
  pageSize?: number
} = {}) {
  const user = await getCurrentUser()
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('ai_conversations')
    .select(`
      id, topic, conversation_type, status, last_message_at,
      created_at
    `, { count: 'exact' })
    .eq('owner_id', user?.id)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.type) {
    query = query.eq('conversation_type', options.type)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 创建 AI 会话
export async function createAIConversation(payload: {
  topic: string
  conversation_type?: string
  context?: any
  linked_resources?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('ai_conversations')
    .insert({
      ...payload,
      conversation_type: payload.conversation_type ?? 'assistant',
      status: 'active',
      owner_id: user?.id,
      context: payload.context ?? {},
      linked_resources: payload.linked_resources ?? {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### AI 消息管理 (ai_conversation_messages)

```ts
// 获取会话消息列表
export async function listAIMessages(conversationId: string, options: {
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 50, 200)

  const { data, error, count } = await supabase
    .from('ai_conversation_messages')
    .select(`
      id, sequence, sender_type, role, content,
      token_usage, metadata, created_at
    `, { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('sequence', { ascending: true })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 发送消息到 AI
export async function sendAIMessage(conversationId: string, content: string) {
  const user = await getCurrentUser()

  // 获取下一个序列号
  const { data: lastMessage } = await supabase
    .from('ai_conversation_messages')
    .select('sequence')
    .eq('conversation_id', conversationId)
    .order('sequence', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextSequence = (lastMessage?.sequence ?? 0) + 1

  // 插入用户消息
  const { data: userMessage, error: userError } = await supabase
    .from('ai_conversation_messages')
    .insert({
      conversation_id: conversationId,
      sequence: nextSequence,
      sender_type: 'user',
      sender_id: user?.id,
      role: 'user',
      content
    })
    .select()
    .single()

  if (userError) throw userError

  // TODO: 调用 Dify API 获取 AI 回复
  // 这里可以调用 Edge Function 来处理 Dify 集成

  return userMessage
}
```

## 人力与效率域 API

### 员工档案管理 (employee_records)

```ts
// 获取员工档案列表
export async function listEmployeeRecords(options: {
  keyword?: string
  status?: string
  employmentType?: string
  managerId?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('employee_records')
    .select(`
      id, employee_code, employment_type, position_title,
      hire_date, termination_date, salary_currency, salary_amount,
      status,
      user:users(id, display_name, email, phone),
      manager:employee_records(id, position_title, user:users(display_name)),
      created_at
    `, { count: 'exact' })
    .order('hire_date', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.keyword) {
    query = query.or(`employee_code.ilike.%${options.keyword}%,user.display_name.ilike.%${options.keyword}%`)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.employmentType) {
    query = query.eq('employment_type', options.employmentType)
  }
  if (options.managerId) {
    query = query.eq('manager_id', options.managerId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 创建员工档案
export async function createEmployeeRecord(payload: {
  user_id: string
  employee_code: string
  employment_type: string
  position_title: string
  manager_id?: string
  hire_date?: string
  salary_currency?: string
  salary_amount?: number
  profile?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('employee_records')
    .insert({
      ...payload,
      company_id: user?.company_id,
      status: 'active'
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 员工效率指标 (employee_efficiency_metrics)

```ts
// 获取员工效率指标
export async function listEfficiencyMetrics(options: {
  employeeId?: string
  metricType?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('employee_efficiency_metrics')
    .select(`
      id, metric_period_start, metric_period_end, metric_type,
      score, metrics, comments,
      employee:employee_records(
        id, employee_code,
        user:users(id, display_name)
      ),
      created_at
    `, { count: 'exact' })
    .order('metric_period_start', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.employeeId) {
    query = query.eq('employee_id', options.employeeId)
  }
  if (options.metricType) {
    query = query.eq('metric_type', options.metricType)
  }
  if (options.startDate) {
    query = query.gte('metric_period_start', options.startDate)
  }
  if (options.endDate) {
    query = query.lte('metric_period_end', options.endDate)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}
```

## 资料库与语义检索域 API

### 资料空间管理 (knowledge_spaces)

```ts
// 获取资料空间列表
export async function listKnowledgeSpaces() {
  const { data, error } = await supabase
    .from('knowledge_spaces')
    .select(`
      id, code, name, description, visibility,
      created_by, created_at
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// 创建资料空间
export async function createKnowledgeSpace(payload: {
  code: string
  name: string
  description?: string
  visibility?: 'private' | 'company' | 'public'
  default_permissions?: any
  metadata?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('knowledge_spaces')
    .insert({
      ...payload,
      visibility: payload.visibility ?? 'company',
      default_permissions: payload.default_permissions ?? {},
      metadata: payload.metadata ?? {},
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 资料资产管理 (knowledge_assets)

```ts
// 获取资料列表
export async function listKnowledgeAssets(spaceId: string, options: {
  type?: string
  status?: string
  keyword?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('knowledge_assets')
    .select(`
      id, asset_type, title, summary, status, tags,
      latest_version_id,
      owner:users(id, display_name),
      created_at
    `, { count: 'exact' })
    .eq('space_id', spaceId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.type) {
    query = query.eq('asset_type', options.type)
  }
  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.keyword) {
    query = query.or(`title.ilike.%${options.keyword}%,summary.ilike.%${options.keyword}%`)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 创建资料条目
export async function createKnowledgeAsset(payload: {
  space_id: string
  asset_type: string
  title: string
  summary?: string
  tags?: string[]
  metadata?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('knowledge_assets')
    .insert({
      ...payload,
      status: 'active',
      tags: payload.tags ?? [],
      attachments: [],
      owner_id: user?.id,
      metadata: payload.metadata ?? {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

## 目标与智能分析域 API

### 目标集管理 (goal_sets)

```ts
// 获取目标集列表
export async function listGoalSets(options: {
  status?: string
  cycleType?: string
  ownerId?: string
  reviewerId?: string
  page?: number
  pageSize?: number
} = {}) {
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('goal_sets')
    .select(`
      id, code, title, cycle_type, cycle_start, cycle_end,
      status, priority, force_review,
      owner:users(id, display_name),
      reviewer:users(id, display_name),
      created_at
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.status) {
    query = query.eq('status', options.status)
  }
  if (options.cycleType) {
    query = query.eq('cycle_type', options.cycleType)
  }
  if (options.ownerId) {
    query = query.eq('owner_id', options.ownerId)
  }
  if (options.reviewerId) {
    query = query.eq('reviewer_id', options.reviewerId)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 创建目标集
export async function createGoalSet(payload: {
  code: string
  title: string
  cycle_type: 'monthly' | 'quarterly' | 'yearly' | 'custom'
  cycle_start: string
  cycle_end: string
  owner_id: string
  reviewer_id?: string
  priority?: string
  force_review?: boolean
  metadata?: any
}) {
  const { data, error } = await supabase
    .from('goal_sets')
    .insert({
      ...payload,
      status: 'draft',
      priority: payload.priority ?? 'M',
      force_review: payload.force_review ?? false,
      metadata: payload.metadata ?? {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 目标里程碑管理 (goal_milestones)

```ts
// 获取目标里程碑列表
export async function listGoalMilestones(goalId: string) {
  const { data, error } = await supabase
    .from('goal_milestones')
    .select(`
      id, title, due_date, progress_percent, status, risk_level,
      plan_payload, actual_payload,
      created_by, created_at
    `)
    .eq('goal_id', goalId)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data ?? []
}

// 创建里程碑
export async function createGoalMilestone(payload: {
  goal_id: string
  title: string
  due_date: string
  progress_percent?: number
  status?: string
  risk_level?: string
  plan_payload?: any
  actual_payload?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('goal_milestones')
    .insert({
      ...payload,
      status: payload.status ?? 'pending',
      risk_level: payload.risk_level ?? 'low',
      plan_payload: payload.plan_payload ?? {},
      actual_payload: payload.actual_payload ?? {},
      created_by: user?.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

## 个人中心与偏好域 API

### 收藏管理 (user_favorites)

```ts
// 获取用户收藏列表
export async function listUserFavorites(options: {
  type?: string
  page?: number
  pageSize?: number
} = {}) {
  const user = await getCurrentUser()
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('user_favorites')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.type) {
    query = query.eq('favorite_type', options.type)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}

// 添加收藏
export async function addFavorite(payload: {
  favorite_type: string
  target_id: string
  metadata?: any
}) {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('user_favorites')
    .insert({
      ...payload,
      user_id: user?.id,
      company_id: user?.company_id,
      metadata: payload.metadata ?? {}
    })
    .select()
    .single()

  if (error) throw error
  return data
}
```

### 最近访问 (user_recent_items)

```ts
// 获取最近访问列表
export async function listUserRecentItems(options: {
  type?: string
  page?: number
  pageSize?: number
} = {}) {
  const user = await getCurrentUser()
  const page = options.page ?? 1
  const pageSize = Math.min(options.pageSize ?? 20, 100)

  let query = supabase
    .from('user_recent_items')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)
    .order('visited_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (options.type) {
    query = query.eq('item_type', options.type)
  }

  const { data, error, count } = await query

  if (error) throw error
  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}
```

## 关联查询与嵌套选择

PostgREST 支持通过外键名称自动关联：

```ts
export async function getWorkOrderWithRelations(id: string) {
  const { data, error } = await supabase
    .from('work_orders')
    .select(
      `id, work_order_code, status, process_name, work_date,
       product:products(id, product_code, name, specification),
       related_order:orders(id, order_code, order_type, approval_status)`
    )
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}
```

> 关联别名使用 `外键列名:目标表(字段)` 语法；若外键列与目标表同名，可直接写 `customers(*)`。

## 批量写入与乐观并发

- 使用 `.insert([...])` 批量创建时，可在对象中附加 `id`（UUID）保持幂等。
- 如需乐观锁，建议在表结构中添加 `version` 或 `updated_at` 并在更新时使用 `.eq('updated_at', originalValue)` 约束。
- 对大量写入可使用 `supabase.functions.invoke` 调用在 Edge Functions 中封装的批处理逻辑，减少往返次数。

## 存储过程 (RPC) 与视图

对于复杂聚合或报表，可通过数据库函数暴露为 RPC：

```ts
export async function runFinanceSnapshot(companyId: string, window: 'daily' | 'weekly') {
  const { data, error } = await supabase.rpc('run_finance_snapshot', {
    p_company_id: companyId,
    p_window: window,
  })
  if (error) throw error
  return data
}
```

> 请在 `supabase/migrations` 中维护函数定义，确保与业务逻辑同步；RPC 请求默认遵循 RLS，需要在函数内部使用 `security definer` 时谨慎授权。

## 调用 Supabase Edge Functions

当业务逻辑无法在 PostgREST/SQL 中完成，可调用 Edge Functions：

```ts
export async function triggerDifySignature(input: { conversationId: string }) {
  const { data, error } = await supabase.functions.invoke('secure-dify-signature', {
    body: {
      conversation_id: input.conversationId,
    },
  })
  if (error) throw error
  return data
}
```

Edge Functions 默认托管在 Deno 环境，支持访问 Supabase 服务角色密钥；请确保函数内部对 `company_id`、`role_keys` 做二次校验。

## Row-Level Security 与多租户注意事项

- 每张核心表均启用 RLS，并以 `company_id = current_setting('request.jwt.claims', true)::json->>'company_id'` 作为基础策略。
- 前端无需显式传 `company_id`；若希望跨公司查询，需通过管理员界面触发 Edge Function 授权短期访问。
- 对于共享资源（例如 `permissions`、`roles`）可通过视图限制可见字段，确保不会泄露其他租户数据。
- 角色权限控制使用 `has_role('Vibot.xxx')` 函数检查，角色信息存储在 JWT 的 `app_metadata.role_keys` 中。

## 错误处理与调试

```ts
try {
  const result = await listRecentCustomers()
  // ...
} catch (error) {
  const supaError = error as { message?: string; code?: string }
  console.error('Supabase error', supaError)
  // 统一上报到 Sentry / 自定义 toast
}
```

常见错误排查：

| 场景 | 现象 | 解决方案 |
| ---- | ---- | -------- |
| RLS 拒绝 | 返回 `PGRST301` 或 `permission denied for table` | 检查是否登录、JWT 是否包含正确 `company_id` / `role_keys` |
| 字段名不匹配 | `column does not exist` | 使用 CLI 重新生成 `@/types/supabase`，或核对 `docs/database-schema.md` |
| 未附加头部 | 401/403 | 确认 `supabaseFetch` 是否写入 `apikey`、`Authorization` |
| 请求过大 | 413/414 | 将大数组放入 RPC Body，避免查询字符串超限 |
| 角色权限不足 | 返回空数据或 403 | 确认用户是否具备相应角色，调用 `has_role()` 函数检查 |
| 多租户数据混乱 | 返回其他公司数据 | 检查 RLS 策略是否正确启用，确认 JWT 中 `company_id` 正确设置 |

## 工具链与自动化

- **Supabase CLI**：`supabase db push`、`supabase functions deploy`、`supabase secrets set`。
- **类型生成**：`supabase gen types typescript --linked > src/types/supabase.ts`。
- **本地开发**：`supabase start` 启动本地 Postgres + Auth + Storage，便于离线调试。
- **日志与监控**：使用 Supabase Dashboard -> Logs 过滤 `rest`, `pgsql`, `functions` 日志，定位请求细节。

---

## 常用辅助函数

在 `docs/database-schema.md` 中定义的安全辅助函数，可在 Edge Functions 中使用：

```ts
// 获取当前公司 ID
export function getCurrentCompanyId() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.user_metadata?.company_id || user?.app_metadata?.company_id
}

// 检查用户角色
export async function hasRole(roleKey: string) {
  const { data: { user } } = await supabase.auth.getUser()
  const roleKeys = user?.app_metadata?.role_keys || []
  return roleKeys.includes(roleKey)
}

// 检查项目成员身份
export async function isProjectMember(projectId: string, userId: string) {
  const { data, error } = await supabase
    .rpc('is_project_member', { p_project_id: projectId, p_user_id: userId })

  if (error) throw error
  return data
}
```

---

> 本手册基于 `docs/database-schema.md` 中的完整表结构，涵盖了所有业务域的 API 使用示例。如需扩展更多示例（如 Storage 上传、Realtime 订阅等），请在保持真实表名与字段名的前提下补充到本手册相应章节。
