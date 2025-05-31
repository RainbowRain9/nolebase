# 用户相关API接口文档

## 概述

本文档描述了微信社区商场小程序中用户相关的API接口，包括用户认证、用户管理、权限控制等功能。

## 基础信息

- **API版本**: v1
- **基础URL**: `https://api.campus-mall.com/api/v1`
- **认证方式**: JWT Token
- **请求格式**: JSON
- **响应格式**: JSON

## 统一响应格式

### 成功响应
```json
{
  "code": 200,
  "message": "success",
  "data": {},
  "timestamp": 1640995200000
}
```

### 错误响应
```json
{
  "code": 400,
  "message": "错误描述",
  "data": null,
  "timestamp": 1640995200000,
  "traceId": "abc123"
}
```

### 状态码说明
- `200`: 请求成功
- `400`: 请求参数错误
- `401`: 未授权或Token无效
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 认证相关接口

### 1. 微信登录

**接口地址**: `POST /auth/wechat/login`

**接口描述**: 使用微信授权码进行登录

**请求参数**:
```json
{
  "code": "string",           // 微信授权码，必填
  "encryptedData": "string",  // 加密数据，可选
  "iv": "string"              // 初始向量，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string",
    "expiresIn": 7200,
    "user": {
      "id": 1001,
      "openid": "oGZUI0egBJY1zhBYw2KhdUfwVJJE",
      "unionid": "o6_bmasdasdsad6_2sgVt7hMZOPfL",
      "nickname": "张三",
      "avatar": "https://wx.qlogo.cn/mmopen/...",
      "phone": "13800138000",
      "studentId": "20210001",
      "realName": "张三",
      "gender": 1,
      "college": "计算机学院",
      "major": "软件工程",
      "className": "软工2021-1班",
      "role": "student",
      "status": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  },
  "timestamp": 1640995200000
}
```

### 2. 手机号登录

**接口地址**: `POST /auth/phone/login`

**接口描述**: 使用手机号和验证码登录

**请求参数**:
```json
{
  "phone": "13800138000",     // 手机号，必填
  "code": "123456"            // 验证码，必填
}
```

**响应数据**: 同微信登录响应格式

### 3. 发送验证码

**接口地址**: `POST /auth/sms/send`

**接口描述**: 发送手机验证码

**请求参数**:
```json
{
  "phone": "13800138000",     // 手机号，必填
  "type": "login"             // 验证码类型：login(登录)、register(注册)、reset(重置密码)
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "验证码发送成功",
  "data": {
    "expireTime": 300,          // 过期时间（秒）
    "canResendTime": 60         // 可重新发送时间（秒）
  },
  "timestamp": 1640995200000
}
```

### 4. 刷新Token

**接口地址**: `POST /auth/refresh`

**接口描述**: 使用refreshToken刷新访问令牌

**请求头**:
```
Authorization: Bearer {refreshToken}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "Token刷新成功",
  "data": {
    "token": "new_access_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 7200
  },
  "timestamp": 1640995200000
}
```

### 5. 退出登录

**接口地址**: `POST /auth/logout`

**接口描述**: 用户退出登录，使Token失效

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "退出登录成功",
  "data": null,
  "timestamp": 1640995200000
}
```

## 用户信息管理接口

### 6. 获取当前用户信息

**接口地址**: `GET /user/profile`

**接口描述**: 获取当前登录用户的详细信息

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1001,
    "openid": "oGZUI0egBJY1zhBYw2KhdUfwVJJE",
    "nickname": "张三",
    "avatar": "https://wx.qlogo.cn/mmopen/...",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "studentId": "20210001",
    "realName": "张三",
    "gender": 1,
    "birthday": "2000-01-01",
    "college": "计算机学院",
    "major": "软件工程",
    "className": "软工2021-1班",
    "grade": "2021",
    "role": "student",
    "status": 1,
    "lastLoginAt": "2024-01-01T10:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 7. 更新用户信息

**接口地址**: `PUT /user/profile`

**接口描述**: 更新当前用户的基本信息

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "nickname": "新昵称",           // 昵称，可选
  "avatar": "头像URL",           // 头像，可选
  "email": "email@example.com", // 邮箱，可选
  "birthday": "2000-01-01",     // 生日，可选
  "gender": 1                   // 性别：0-未知，1-男，2-女，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    // 更新后的用户信息，格式同获取用户信息接口
  },
  "timestamp": 1640995200000
}
```

### 8. 绑定手机号

**接口地址**: `POST /user/bind-phone`

**接口描述**: 绑定或更换手机号

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "phone": "13800138000",     // 新手机号，必填
  "code": "123456"            // 验证码，必填
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "手机号绑定成功",
  "data": {
    "phone": "13800138000"
  },
  "timestamp": 1640995200000
}
```

### 9. 绑定学号

**接口地址**: `POST /user/bind-student`

**接口描述**: 绑定学号和学籍信息

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "studentId": "20210001",      // 学号，必填
  "realName": "张三",           // 真实姓名，必填
  "college": "计算机学院",       // 学院，必填
  "major": "软件工程",          // 专业，必填
  "className": "软工2021-1班",  // 班级，必填
  "grade": "2021"               // 年级，必填
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "学籍信息绑定成功",
  "data": {
    "studentId": "20210001",
    "realName": "张三",
    "college": "计算机学院",
    "major": "软件工程",
    "className": "软工2021-1班",
    "grade": "2021",
    "verifyStatus": "pending"     // 审核状态：pending-待审核，approved-已通过，rejected-已拒绝
  },
  "timestamp": 1640995200000
}
```

### 10. 上传头像

**接口地址**: `POST /user/upload-avatar`

**接口描述**: 上传用户头像

**请求头**:
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**请求参数**:
```
avatar: File    // 头像文件，支持jpg、png格式，大小不超过2MB
```

**响应数据**:
```json
{
  "code": 200,
  "message": "头像上传成功",
  "data": {
    "avatarUrl": "https://cdn.campus-mall.com/avatars/user_1001_20240101.jpg"
  },
  "timestamp": 1640995200000
}
```

## 用户查询接口

### 11. 用户列表查询

**接口地址**: `GET /users`

**接口描述**: 查询用户列表（需要管理员权限）

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20，最大100
keyword=张三        // 搜索关键词，可选
role=student        // 用户角色筛选，可选
status=1            // 用户状态筛选，可选
college=计算机学院   // 学院筛选，可选
grade=2021          // 年级筛选，可选
sortBy=createdAt    // 排序字段，可选
sortOrder=desc      // 排序方向：asc、desc，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": 1001,
        "nickname": "张三",
        "avatar": "https://wx.qlogo.cn/mmopen/...",
        "phone": "138****8000",
        "studentId": "20210001",
        "realName": "张三",
        "college": "计算机学院",
        "major": "软件工程",
        "className": "软工2021-1班",
        "role": "student",
        "status": 1,
        "lastLoginAt": "2024-01-01T10:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1000,
    "page": 1,
    "pageSize": 20,
    "totalPages": 50
  },
  "timestamp": 1640995200000
}
```

### 12. 获取指定用户信息

**接口地址**: `GET /users/{userId}`

**接口描述**: 获取指定用户的详细信息（需要管理员权限）

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `userId`: 用户ID

**响应数据**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    // 用户详细信息，格式同获取当前用户信息接口
    // 管理员可以看到更多信息，如完整手机号、邮箱等
  },
  "timestamp": 1640995200000
}
```

## 用户管理接口（管理员）

### 13. 更新用户状态

**接口地址**: `PUT /users/{userId}/status`

**接口描述**: 更新用户状态（需要管理员权限）

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `userId`: 用户ID

**请求参数**:
```json
{
  "status": 0,                    // 用户状态：1-正常，0-禁用
  "reason": "违规操作"            // 操作原因，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "状态更新成功",
  "data": {
    "userId": 1001,
    "status": 0,
    "reason": "违规操作",
    "operatorId": 2001,
    "operatedAt": "2024-01-01T10:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 14. 批量操作用户

**接口地址**: `POST /users/batch`

**接口描述**: 批量操作用户（需要管理员权限）

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "userIds": [1001, 1002, 1003],  // 用户ID列表，必填
  "action": "disable",            // 操作类型：disable-禁用，enable-启用，delete-删除
  "reason": "批量处理违规用户"     // 操作原因，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "批量操作成功",
  "data": {
    "successCount": 2,
    "failCount": 1,
    "results": [
      {
        "userId": 1001,
        "success": true,
        "message": "操作成功"
      },
      {
        "userId": 1002,
        "success": true,
        "message": "操作成功"
      },
      {
        "userId": 1003,
        "success": false,
        "message": "用户不存在"
      }
    ]
  },
  "timestamp": 1640995200000
}
```

## 权限相关接口

### 15. 获取用户权限

**接口地址**: `GET /user/permissions`

**接口描述**: 获取当前用户的权限列表

**请求头**:
```
Authorization: Bearer {token}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "permissions": [
      "user:read",
      "forum:post:create",
      "forum:comment:create",
      "mall:order:create"
    ],
    "roles": ["student"]
  },
  "timestamp": 1640995200000
}
```

### 16. 检查权限

**接口地址**: `POST /user/check-permission`

**接口描述**: 检查用户是否具有指定权限

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "permission": "forum:post:create"    // 权限标识，必填
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "检查完成",
  "data": {
    "hasPermission": true
  },
  "timestamp": 1640995200000
}
```

## 错误码说明

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 40001 | 微信授权码无效 | 微信登录时提供的code无效或已过期 |
| 40002 | 验证码错误或已过期 | 手机验证码错误或已过期 |
| 40003 | 手机号已被绑定 | 该手机号已被其他用户绑定 |
| 40004 | 学号已被绑定 | 该学号已被其他用户绑定 |
| 40005 | 用户不存在 | 指定的用户不存在 |
| 40006 | 用户已被禁用 | 用户账号已被禁用 |
| 40007 | 权限不足 | 用户没有执行该操作的权限 |
| 40008 | Token已过期 | 访问令牌已过期，需要刷新 |
| 40009 | 文件格式不支持 | 上传的文件格式不支持 |
| 40010 | 文件大小超限 | 上传的文件大小超过限制 |

## 注意事项

1. 所有需要认证的接口都必须在请求头中携带有效的JWT Token
2. 手机号在返回时会进行脱敏处理（如：138****8000）
3. 用户头像上传支持jpg、png格式，大小不超过2MB
4. 批量操作接口一次最多处理100个用户
5. 用户状态变更会记录操作日志
6. 敏感操作（如禁用用户）需要提供操作原因

---

*文档版本: v1.0*  
*最后更新: 2025年5月*
