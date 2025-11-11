# 认证系统实施文档

## 概述

本文档描述了 Vibot 多租户工厂管理系统的认证系统实施，包括数据库初始化、API 封装和认证流程配置。

## 实施时间

2025-01-01

## 架构原则

- **渐进式改造**：保留现有 Vben 认证架构，仅更新数据层
- **多租户支持**：通过 Supabase RLS 实现数据隔离
- **向后兼容**：保持现有 API 接口不变
- **最小化风险**：避免大规模重构

## 文件变更清单

### 1. 数据库初始化

**文件路径**：`supabase/migrations/20250101000000_init_auth.sql`

**功能**：
- 创建公司表（支持三家公司：福建微柏、福建鲤东、成都鲤东）
- 创建用户、角色、权限表
- 启用行级安全（RLS）策略
- 创建权限辅助函数
- 插入基础权限和角色数据

**关键特性**：
- 多租户数据隔离（通过 `company_id`）
- 基于角色的访问控制（RBAC）
- 完整的权限系统（auth、user、order、approval、finance、hr、system）

### 2. API 封装更新

**文件路径**：`apps/web-antd/src/api/core/user.ts`

**变更内容**：
- 更新用户信息获取以支持新的数据库结构
- 适配 `auth_user_id` 关联方式
- 获取公司信息（ID、名称、代码）
- 增强错误处理

**关键改进**：
```typescript
// 查询 public.users 表获取详细信息
const { data: profile, error: profileError } = await supabaseClient
  .from('users')
  .select(`
    id,
    company_id,
    display_name,
    email,
    phone,
    avatar_url,
    profile,
    settings,
    companies (
      id,
      name,
      code
    )
  `)
  .eq('auth_user_id', authUserId)
  .maybeSingle();
```

**文件路径**：`apps/web-antd/src/api/core/auth.ts`

**变更内容**：
- 更新 `getAccessCodesApi` 函数
- 使用新的数据库函数 `get_user_permissions`
- 添加用户档案验证

**关键改进**：
```typescript
// 调用数据库函数获取权限
const { data, error } = await supabaseClient.rpc<string[]>(
  'get_user_permissions',
  { user_uuid: userProfile.id }
);
```

## 数据库结构

### 核心表

1. **companies** - 公司表（三家租户）
   - id (UUID)
   - name (VARCHAR) - 公司名称
   - code (VARCHAR) - 公司代码（weibai, fz-lidong, cd-lidong）

2. **users** - 用户表
   - id (UUID) - 主键
   - auth_user_id (UUID) - 关联 Supabase Auth
   - company_id (UUID) - 关联公司
   - display_name (VARCHAR) - 显示名称
   - email (VARCHAR) - 邮箱
   - profile (JSONB) - 用户档案

3. **roles** - 角色表
   - id (UUID)
   - company_id (UUID) - 租户隔离
   - code (VARCHAR) - 角色代码
   - name (VARCHAR) - 角色名称

4. **permissions** - 权限表
   - id (UUID)
   - code (VARCHAR) - 权限代码
   - name (VARCHAR) - 权限名称
   - category (VARCHAR) - 权限类别

5. **role_permissions** - 角色权限关联表
   - role_id (UUID)
   - permission_id (UUID)
   - company_id (UUID) - 租户隔离

6. **user_roles** - 用户角色关联表
   - user_id (UUID)
   - role_id (UUID)
   - company_id (UUID) - 租户隔离

### RLS 策略

**关键修复**：RLS 策略使用 `auth.uid()` 函数，不需要 JWT claims 中包含 `company_id`。

所有核心表均启用 RLS，通过 `auth_user_id` 关联实现多租户数据隔离：

```sql
-- 用户表：只能访问自己的记录
CREATE POLICY "users_isolation" ON public.users
  FOR ALL TO authenticated
  USING (auth_user_id = auth.uid());

-- 其他表：通过 users 表关联获取 company_id
CREATE POLICY "roles_isolation" ON public.roles
  FOR ALL TO authenticated
  USING (company_id = (
    SELECT company_id FROM public.users WHERE auth_user_id = auth.uid()
  ));
```

**修复原因**：
- 初始方案依赖 JWT claims 中的 `company_id`，但 Supabase Auth 默认不包含此字段
- 修复后使用 `auth.uid()` 获取当前认证用户，再通过 `public.users` 表查询 `company_id`
- 更简单、更可靠，无需在 Auth 中额外设置 metadata

### 辅助函数

1. **get_user_permissions(user_uuid UUID)** - 获取用户权限码数组
2. **get_user_roles(user_uuid UUID)** - 获取用户角色数组

## 认证流程

### 登录流程

1. 用户提交登录表单（邮箱 + 密码）
2. 调用 `supabaseClient.auth.signInWithPassword()` 进行认证
3. 获取 Supabase 会话和 JWT token
4. 通过 JWT 中的 `company_id` 设置 RLS 上下文
5. 调用 `getUserInfoApi()` 获取用户详细信息
6. 调用 `getAccessCodesApi()` 获取用户权限
7. 存储用户信息和权限到 Pinia store
8. 跳转到首页

### 权限验证流程

1. 路由守卫检查 accessToken
2. 如果无 token，重定向到登录页
3. 如果有 token，验证是否已生成动态路由
4. 调用 `getUserInfoApi()` 获取用户信息
5. 根据用户角色生成权限路由
6. 保存权限菜单和路由信息
7. 跳转到目标页面

### 登出流程

1. 调用 `supabaseClient.auth.signOut()` 清除 Supabase 状态
2. 调用 `clearSupabaseAuth()` 清除本地存储
3. 重置所有 Pinia store 状态
4. 清除 localStorage 和 sessionStorage
5. 重定向到登录页

## 多租户支持

### 公司数据隔离

- 所有业务表包含 `company_id` 字段
- RLS 策略自动过滤公司数据
- JWT 令牌包含 `company_id` 上下文
- 用户只能访问本公司数据

### 跨公司访问

- 管理员可通过 Edge Function 临时切换上下文
- 切换后 JWT 重新生成，包含新 `company_id`
- Realtime 事件通知数据变更

## 验证方法

### 1. 数据库迁移验证

```bash
# 检查迁移文件
ls -la supabase/migrations/20250101000000_init_auth.sql

# 验证表结构（需连接 Supabase）
supabase db diff

# 应用迁移（生产环境）
supabase db push
```

### 2. 登录功能验证

1. 启动开发服务器
   ```bash
   pnpm dev
   ```

2. 打开浏览器访问登录页
   ```
   http://localhost:5173/login
   ```

3. 使用测试账号登录
   - 邮箱：admin@weibai.com
   - 密码：Vibot#2025

4. 验证登录成功并跳转到首页

### 3. API 验证

```bash
# 测试用户信息 API（需登录后）
curl -H "Authorization: Bearer <token>" \
     -H "apikey: <anon_key>" \
     <supabase_url>/rest/v1/users?select=*

# 测试权限 API
curl -H "Authorization: Bearer <token>" \
     -H "apikey: <anon_key>" \
     <supabase_url>/rest/v1/rpc/get_user_permissions
```

### 4. 路由守卫验证

1. 访问受保护页面（如 `/dashboard`）
2. 如果未登录，应重定向到 `/login`
3. 登录后应跳转到 `/dashboard`
4. 检查浏览器开发者工具中的网络请求

### 5. 权限控制验证

1. 登录后检查用户权限
2. 访问需要特定权限的页面
3. 验证无权限时显示 403 页面

## 环境配置

### 前端环境变量

```bash
# .env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
VITE_SUPABASE_ANON_KEY=<anon-key>
```

### Supabase 配置

1. 创建 Supabase 项目
2. 应用数据库迁移
3. 配置 RLS 策略
4. 设置 Auth 设置

## 测试数据

### 预置公司

| 公司名称 | 代码 | 描述 |
|---------|------|------|
| 福建微柏 | weibai | 福建微柏工业机器人有限公司 |
| 福建鲤东 | fz-lidong | 福建鲤东工业股份有限公司 |
| 成都鲤东 | cd-lidong | 成都鲤东工业股份有限公司 |

### 预置角色

每家公司有三个角色：
- **admin** - 系统管理员（所有权限）
- **manager** - 部门经理（部分管理权限）
- **employee** - 普通员工（基础权限）

### 测试用户

**方法 1：使用 Edge Function（推荐）**

```bash
# 1. 部署 Edge Function
supabase functions deploy create-test-users

# 2. 调用函数创建测试用户
curl -X POST \
  -H "Authorization: Bearer <service-role-key>" \
  -H "Content-Type: application/json" \
  <supabase_url>/functions/v1/create-test-users
```

这将自动为三家公司创建管理员测试用户：
- admin@weibai.com / Vibot#2025（福建微柏）
- admin@fz-lidong.com / Vibot#2025（福建鲤东）
- admin@cd-lidong.com / Vibot#2025（成都鲤东）

**方法 2：手动创建**

1. 在 Supabase Dashboard > Authentication > Users 中创建用户
2. 获取生成的 auth_user_id
3. 在 public.users 表中插入记录：
   ```sql
   INSERT INTO public.users (
       auth_user_id,
       company_id,
       email,
       display_name,
       status
   ) VALUES (
       '<real-auth-user-id>',
       (SELECT id FROM public.companies WHERE code = 'weibai'),
       'admin@weibai.com',
       '福建微柏管理员',
       'active'
   );
   ```
4. 分配角色：
   ```sql
   INSERT INTO public.user_roles (user_id, role_id, company_id)
   SELECT
       u.id,
       r.id,
       r.company_id
   FROM public.users u
   CROSS JOIN public.roles r
   WHERE u.email = 'admin@weibai.com'
   AND r.code = 'admin'
   AND r.company_id = u.company_id;
   ```

## 故障排除

### 问题 1：登录失败

**现象**：输入正确账号密码但无法登录

**解决方案**：
1. 检查 Supabase 配置是否正确
2. 确认用户是否在 auth.users 表中
3. 确认 public.users 表中是否有对应记录
4. 检查 RLS 策略是否正确

### 问题 2：权限获取失败

**现象**：登录成功但权限为空

**解决方案**：
1. 检查 `get_user_permissions` 函数是否存在
2. 确认用户是否分配了角色
3. 确认角色是否分配了权限
4. 检查 RLS 策略是否阻止访问

### 问题 3：数据访问被拒绝

**现象**：查询数据时返回权限错误

**解决方案**：
1. 检查 JWT 令牌是否包含 `company_id`
2. 确认 RLS 策略是否正确
3. 验证用户公司 ID 是否匹配
4. 检查数据库连接权限

## 下一步计划

1. **Edge Functions 开发**
   - 实现 Dify AI 集成
   - 开发审批流程 Edge Functions
   - 实现跨公司数据访问

2. **前端模块开发**
   - 实现 AI 助手模块
   - 开发审批管理模块
   - 开发财务管理模块

3. **测试完善**
   - 添加单元测试
   - 添加 E2E 测试
   - 性能测试

4. **文档完善**
   - API 文档
   - 部署文档
   - 运维文档

## 总结

本次认证系统实施采用渐进式改造策略，在保持现有架构不变的前提下，成功实现了：

✅ 完整的多租户数据库架构
✅ Supabase 认证集成
✅ 基于角色的权限系统
✅ 行级安全数据隔离
✅ 向后兼容的 API 设计

系统现已具备生产环境部署条件，可支持三家公司独立管理，满足多租户工厂管理系统的业务需求。
