# 🔌 API接口文档系列

## 📋 文档概述

本系列文档详细描述了微信社区商场小程序的所有API接口，基于**微信小程序云函数**的调用方式，为前端和后端开发者提供完整的接口规范。

### 技术特点
- **调用方式**: `wx.cloud.callFunction()` 云函数调用
- **认证方式**: 基于微信 openid 的自动认证
- **响应格式**: 统一的云函数响应格式 (包含 success 字段)
- **数据库**: MongoDB 云数据库操作

## 📚 文档列表

### 👤 [用户相关API](user.md) 🔥
**接口数量**: 16个  
**核心功能**: 用户认证、个人信息管理、权限控制  
**主要接口**:
- 微信登录 (`wechatLogin`)
- 获取用户信息 (`getUserInfo`)
- 更新用户信息 (`updateUserInfo`)
- 用户权限验证 (`checkPermission`)

**适用场景**: 用户注册登录、个人中心、权限管理

### 🎓 [教务相关API](academic.md) 🔥
**接口数量**: 13个  
**核心功能**: 课程表、成绩查询、考试安排、学籍管理  
**主要接口**:
- 获取课程表 (`getCourseSchedule`)
- 查询成绩 (`getGrades`)
- 获取考试安排 (`getExamSchedule`)
- 学籍信息查询 (`getStudentInfo`)

**适用场景**: 学生学习管理、教务信息查询

### 🛒 [商城相关API](mall.md) 🔥
**接口数量**: 30个  
**核心功能**: 商品管理、订单处理、支付集成、商家管理  
**主要接口**:
- 商品列表 (`getProducts`)
- 创建订单 (`createOrder`)
- 支付处理 (`processPayment`)
- 商家管理 (`manageMerchant`)

**适用场景**: 电商功能、交易处理、商家运营

### 💬 [论坛相关API](forum.md) 🔥
**接口数量**: 28个  
**核心功能**: 帖子发布、评论互动、版块管理、搜索功能  
**主要接口**:
- 发布帖子 (`createPost`)
- 评论管理 (`manageComments`)
- 版块操作 (`manageBoards`)
- 内容搜索 (`searchContent`)

**适用场景**: 社区交流、内容管理、用户互动

## 🚀 快速开始

### 基础调用示例

```javascript
// 通用云函数调用模板
wx.cloud.callFunction({
  name: 'functionName',    // 云函数名称 (user/academic/mall/forum)
  data: {
    action: 'actionName',  // 具体操作名称
    // 其他参数...
  }
}).then(res => {
  if (res.result.success) {
    console.log('调用成功:', res.result.data)
  } else {
    console.error('调用失败:', res.result.message)
  }
}).catch(err => {
  console.error('网络错误:', err)
})
```

### 统一响应格式

```json
{
  "success": true,          // 操作是否成功
  "code": 200,             // 状态码
  "message": "操作成功",    // 提示信息
  "data": {                // 返回数据
    // 具体数据内容
  },
  "timestamp": 1640995200000  // 时间戳
}
```

## 📖 使用指南

### 🎯 开发流程建议

1. **环境准备**
   - 配置微信小程序云开发环境
   - 创建对应的云函数

2. **接口调用**
   - 查看具体API文档了解参数要求
   - 使用统一的调用模板
   - 处理响应数据和错误

3. **错误处理**
   - 检查 `success` 字段判断操作结果
   - 根据 `code` 和 `message` 处理不同情况
   - 实现网络异常的重试机制

### 🔍 常见问题

**Q: 如何处理用户认证？**  
A: 云函数会自动获取用户的 openid，无需手动传递认证信息。

**Q: 如何处理分页数据？**  
A: 使用 `page` 和 `pageSize` 参数，响应中包含 `total` 和 `hasMore` 字段。

**Q: 如何上传文件？**  
A: 先使用 `wx.cloud.uploadFile` 上传到云存储，再将文件ID传递给API。

## 🔗 相关文档

- [云数据库结构设计](../database/cloud-schema.md) - 了解数据模型
- [编码规范](../development/coding-standards.md) - 代码质量标准
- [测试指南](../development/testing.md) - API测试方法
- [云开发环境搭建](../deployment/cloud-setup.md) - 环境配置

## 📝 更新记录

- **2025年5月**: 完成所有API文档，统一为云函数调用方式
- **接口总数**: 87个 (用户16个 + 教务13个 + 商城30个 + 论坛28个)
- **技术架构**: 统一为微信小程序云开发方案

---

*最后更新时间: 2025年5月*
