# 云数据库结构设计

## 概述

本文档详细描述了基于微信小程序云开发的校园社区商场小程序数据库结构设计，包括所有数据集合的字段定义、索引设计、权限规则等内容。数据库采用云开发提供的 MongoDB 文档数据库，支持灵活的文档结构和强大的查询能力。

## 技术架构

- **数据库类型**: MongoDB 文档数据库
- **部署方式**: 微信小程序云开发
- **访问方式**: 云函数 + 小程序端 SDK
- **数据同步**: 实时数据同步
- **权限控制**: 基于 openid 的自动权限验证

## 数据库设计原则

### 设计理念
- **文档化设计**: 利用 MongoDB 文档数据库的灵活性
- **性能优化**: 合理设计索引和查询策略
- **扩展性**: 文档结构易于扩展，支持业务发展
- **安全性**: 基于云开发的权限控制和数据安全
- **一致性**: 通过应用层逻辑保证数据完整性

### 命名规范
- **集合名**: 使用下划线分隔的小写字母，如 `user_profiles`
- **字段名**: 使用驼峰命名法，如 `createdAt`、`userId`
- **索引名**: 格式为 `idx_集合名_字段名`，如 `idx_users_openid`
- **引用字段**: 使用 `_id` 作为文档引用，如 `userId`、`productId`

### 数据类型规范
- **主键**: 使用 MongoDB 自动生成的 `ObjectId`
- **时间**: 使用 `Date` 类型，存储 ISO 8601 格式
- **状态**: 使用 `String` 类型，配合枚举值
- **金额**: 使用 `Number` 类型，以分为单位存储
- **文本**: 使用 `String` 类型，支持任意长度
- **数组**: 使用 `Array` 类型，存储列表数据
- **对象**: 使用 `Object` 类型，存储嵌套结构

## 用户相关集合

### 1. 用户信息集合 (users)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "openid": "oXXXX-XXXXXXXXXXXXXXXXX",
  "unionid": "oXXXX-XXXXXXXXXXXXXXXXX",
  "nickname": "张三",
  "avatar": "cloud://xxx.png",
  "phone": "13800138000",
  "email": "zhangsan@example.com",
  "realName": "张三",
  "gender": 1, // 0-未知，1-男，2-女
  "birthday": "1999-01-01",

  // 学籍信息
  "studentInfo": {
    "studentId": "2021001001",
    "college": "计算机学院",
    "major": "软件工程",
    "className": "软工2101班",
    "grade": "2021"
  },

  // 状态信息
  "role": "student", // student, teacher, merchant, admin
  "status": 1, // 1-正常，0-禁用
  "verifyStatus": "approved", // pending, approved, rejected

  // 统计信息
  "stats": {
    "postCount": 10,
    "likeCount": 50,
    "followerCount": 20,
    "followingCount": 15
  },

  // 时间信息
  "lastLoginAt": new Date(),
  "lastLoginIp": "192.168.1.1",
  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.users.createIndex({ "openid": 1 }, { unique: true })
db.users.createIndex({ "phone": 1 }, { unique: true, sparse: true })
db.users.createIndex({ "studentInfo.studentId": 1 }, { unique: true, sparse: true })
db.users.createIndex({ "role": 1, "status": 1 })
db.users.createIndex({ "createdAt": -1 })

// 权限规则
{
  "read": "auth.openid == resource.openid || resource.role == 'public'",
  "write": "auth.openid == resource.openid"
}
```

### 2. 用户登录日志集合 (user_login_logs)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "loginType": "wechat", // wechat, phone
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "deviceInfo": {
    "platform": "ios",
    "version": "14.0",
    "model": "iPhone 12"
  },
  "location": "北京市朝阳区",
  "loginResult": true, // true-成功，false-失败
  "failureReason": null,
  "createdAt": new Date()
}

// 索引设计
db.user_login_logs.createIndex({ "userId": 1, "createdAt": -1 })
db.user_login_logs.createIndex({ "ipAddress": 1 })
db.user_login_logs.createIndex({ "createdAt": -1 })

// 权限规则
{
  "read": "auth.openid == get('database.users.doc(resource.userId)').openid",
  "write": false
}
```

### 3. 用户关注关系集合 (user_follows)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "followerId": ObjectId("..."), // 关注者ID
  "followingId": ObjectId("..."), // 被关注者ID
  "createdAt": new Date()
}

// 索引设计
db.user_follows.createIndex({ "followerId": 1, "followingId": 1 }, { unique: true })
db.user_follows.createIndex({ "followerId": 1 })
db.user_follows.createIndex({ "followingId": 1 })

// 权限规则
{
  "read": true,
  "write": "auth.openid == get('database.users.doc(resource.followerId)').openid"
}
```

## 论坛相关集合

### 4. 论坛版块集合 (forum_boards)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "name": "学习交流",
  "description": "分享学习心得，讨论学术问题",
  "icon": "cloud://board-icon.png",
  "banner": "cloud://board-banner.png",
  "color": "#1890ff",
  "sortOrder": 1,

  // 统计信息
  "stats": {
    "postCount": 1000,
    "memberCount": 500,
    "todayPostCount": 10
  },

  // 版块设置
  "settings": {
    "rules": ["禁止发布广告", "禁止恶意灌水"],
    "tags": ["学习", "考试", "课程"],
    "allowAnonymous": true,
    "needAudit": false
  },

  "status": 1, // 1-正常，0-关闭
  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.forum_boards.createIndex({ "status": 1, "sortOrder": 1 })
db.forum_boards.createIndex({ "stats.postCount": -1 })

// 权限规则
{
  "read": true,
  "write": "auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)"
}
```

### 5. 帖子集合 (forum_posts)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "title": "如何学好数据结构？",
  "content": "最近在学习数据结构，有什么好的学习方法吗？",
  "contentType": "text", // text, markdown
  "images": ["cloud://post-image1.jpg", "cloud://post-image2.jpg"],

  // 作者信息
  "authorId": ObjectId("..."),
  "isAnonymous": false,

  // 版块信息
  "boardId": ObjectId("..."),

  // 标签
  "tags": ["学习", "数据结构"],

  // 统计信息
  "stats": {
    "viewCount": 100,
    "likeCount": 20,
    "commentCount": 5,
    "shareCount": 3,
    "collectCount": 8
  },

  // 热度计算
  "hotScore": 85.5,

  // 状态信息
  "isTop": false,
  "isHot": false,
  "allowComment": true,
  "status": 1, // 1-正常，0-删除，2-审核中

  // 审核信息
  "audit": {
    "status": "approved", // pending, approved, rejected
    "reason": null,
    "auditedBy": null,
    "auditedAt": null
  },

  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.forum_posts.createIndex({ "boardId": 1, "status": 1, "createdAt": -1 })
db.forum_posts.createIndex({ "authorId": 1, "createdAt": -1 })
db.forum_posts.createIndex({ "hotScore": -1 })
db.forum_posts.createIndex({ "isTop": -1, "isHot": -1, "createdAt": -1 })
db.forum_posts.createIndex({ "title": "text", "content": "text" })

// 权限规则
{
  "read": "resource.status == 1 || auth.openid == get('database.users.doc(resource.authorId)').openid",
  "write": "auth.openid == get('database.users.doc(resource.authorId)').openid || auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)"
}
```

### 6. 评论集合 (forum_comments)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "postId": ObjectId("..."),
  "content": "我觉得可以先从基础的链表开始学习",

  // 作者信息
  "authorId": ObjectId("..."),
  "isAnonymous": false,

  // 回复关系
  "parentId": null, // 父评论ID，null表示一级评论
  "replyToUserId": null, // 回复的用户ID

  // 统计信息
  "stats": {
    "likeCount": 5,
    "replyCount": 2
  },

  "status": 1, // 1-正常，0-删除

  // 设备信息
  "deviceInfo": {
    "ipAddress": "192.168.1.1",
    "device": "iPhone"
  },

  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.forum_comments.createIndex({ "postId": 1, "status": 1, "createdAt": 1 })
db.forum_comments.createIndex({ "authorId": 1, "createdAt": -1 })
db.forum_comments.createIndex({ "parentId": 1 })

// 权限规则
{
  "read": "resource.status == 1",
  "write": "auth.openid == get('database.users.doc(resource.authorId)').openid"
}
```

## 商城相关集合

### 7. 商品分类集合 (product_categories)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "name": "电子产品",
  "parentId": null, // 父分类ID，null表示顶级分类
  "icon": "cloud://category-icon.png",
  "banner": "cloud://category-banner.png",
  "description": "各类电子产品",
  "sortOrder": 1,
  "level": 1, // 分类层级
  "path": "/electronics", // 分类路径

  // 统计信息
  "productCount": 100,

  "status": 1, // 1-启用，0-禁用
  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.product_categories.createIndex({ "parentId": 1, "sortOrder": 1 })
db.product_categories.createIndex({ "status": 1, "level": 1 })

// 权限规则
{
  "read": true,
  "write": "auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)"
}
```

### 8. 商家信息集合 (merchants)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "userId": ObjectId("..."),
  "businessName": "校园便利店",
  "businessType": "enterprise", // individual, enterprise

  // 证件信息
  "credentials": {
    "businessLicense": "cloud://license.jpg",
    "idCard": "cloud://id-card.jpg"
  },

  // 联系信息
  "contact": {
    "person": "张老板",
    "phone": "13800138000",
    "email": "shop@example.com",
    "address": "学校东门商业街1号"
  },

  // 经营信息
  "business": {
    "scope": "日用品零售",
    "description": "为师生提供便民服务",
    "avatar": "cloud://shop-avatar.jpg"
  },

  // 银行信息
  "bankAccount": {
    "bankName": "中国银行",
    "accountNumber": "6217***********1234",
    "accountName": "张三"
  },

  // 统计信息
  "stats": {
    "productCount": 50,
    "orderCount": 200,
    "salesAmount": 10000, // 以分为单位
    "rating": 4.8,
    "reviewCount": 100
  },

  "status": "approved", // pending, approved, rejected, suspended
  "verifyStatus": "approved", // pending, approved, rejected

  // 审核信息
  "audit": {
    "reason": null,
    "auditedBy": null,
    "auditedAt": null
  },

  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.merchants.createIndex({ "userId": 1 }, { unique: true })
db.merchants.createIndex({ "status": 1 })
db.merchants.createIndex({ "stats.rating": -1 })

// 权限规则
{
  "read": true,
  "write": "auth.openid == get('database.users.doc(resource.userId)').openid || auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)"
}
```

### 9. 商品集合 (products)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "name": "苹果 iPhone 14",
  "description": "全新苹果手机，128GB存储",
  "categoryId": ObjectId("..."),
  "merchantId": ObjectId("..."),

  // 价格信息
  "price": {
    "current": 599900, // 以分为单位，5999.00元
    "original": 699900,
    "cost": 500000
  },

  // 库存信息
  "inventory": {
    "stock": 10,
    "soldCount": 5
  },

  // 商品图片
  "images": {
    "main": ["cloud://product1.jpg", "cloud://product2.jpg"],
    "detail": ["cloud://detail1.jpg", "cloud://detail2.jpg"]
  },

  // 商品规格
  "specifications": {
    "颜色": "深空灰色",
    "存储": "128GB",
    "屏幕": "6.1英寸"
  },

  // 商品标签
  "tags": ["手机", "苹果", "新品"],

  // 配送信息
  "shipping": {
    "freeShipping": true,
    "shippingFee": 0,
    "deliveryTime": "1-3天"
  },

  // 服务承诺
  "services": ["7天无理由退货", "正品保证", "全国联保"],

  // 二手商品特有字段
  "secondHand": {
    "isSecondHand": false,
    "conditionLevel": null, // excellent, good, fair, poor
    "purchaseDate": null,
    "sellReason": null
  },

  // 区域信息
  "regionId": ObjectId("..."),

  // 统计信息
  "stats": {
    "viewCount": 500,
    "favoriteCount": 20,
    "rating": 4.9,
    "reviewCount": 10
  },

  "status": "approved", // draft, pending, approved, rejected, offline

  // 审核信息
  "audit": {
    "reason": null,
    "auditedBy": null,
    "auditedAt": null
  },

  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.products.createIndex({ "categoryId": 1, "status": 1, "createdAt": -1 })
db.products.createIndex({ "merchantId": 1, "status": 1 })
db.products.createIndex({ "name": "text", "description": "text" })
db.products.createIndex({ "price.current": 1 })
db.products.createIndex({ "stats.rating": -1 })

// 权限规则
{
  "read": "resource.status == 'approved' || auth.openid == get('database.merchants.doc(resource.merchantId)').userId",
  "write": "auth.openid == get('database.merchants.doc(resource.merchantId)').userId"
}
```

### 10. 订单集合 (orders)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "orderNo": "ORD202412010001",
  "userId": ObjectId("..."),
  "merchantId": ObjectId("..."),

  // 商品信息
  "items": [
    {
      "productId": ObjectId("..."),
      "productName": "苹果 iPhone 14",
      "productImage": "cloud://product.jpg",
      "price": 599900, // 单价，以分为单位
      "quantity": 1,
      "totalPrice": 599900 // 小计
    }
  ],

  // 价格信息
  "pricing": {
    "subtotal": 599900, // 商品小计
    "shippingFee": 0, // 运费
    "discount": 0, // 优惠金额
    "total": 599900 // 总金额
  },

  // 收货地址
  "address": {
    "receiverName": "张三",
    "receiverPhone": "13800138000",
    "province": "北京市",
    "city": "北京市",
    "district": "朝阳区",
    "detail": "某某大学宿舍楼101",
    "postalCode": "100000"
  },

  // 订单状态
  "status": "pending", // pending, paid, shipped, delivered, completed, cancelled, refunded

  // 支付信息
  "payment": {
    "method": "wechat", // wechat, alipay
    "transactionId": null,
    "paidAt": null
  },

  // 物流信息
  "logistics": {
    "company": null,
    "trackingNumber": null,
    "shippedAt": null,
    "deliveredAt": null
  },

  // 备注信息
  "remark": "请送到宿舍楼下",

  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.orders.createIndex({ "userId": 1, "createdAt": -1 })
db.orders.createIndex({ "merchantId": 1, "status": 1 })
db.orders.createIndex({ "orderNo": 1 }, { unique: true })
db.orders.createIndex({ "status": 1, "createdAt": -1 })

// 权限规则
{
  "read": "auth.openid == get('database.users.doc(resource.userId)').openid || auth.openid == get('database.merchants.doc(resource.merchantId)').userId",
  "write": "auth.openid == get('database.users.doc(resource.userId)').openid || auth.openid == get('database.merchants.doc(resource.merchantId)').userId"
}
```

## 教务相关集合

### 11. 课程信息集合 (courses)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "courseCode": "CS101",
  "courseName": "计算机科学导论",
  "credits": 3,
  "courseType": "必修", // 必修, 选修, 公选
  "college": "计算机学院",
  "department": "计算机科学与技术系",

  // 教师信息
  "teachers": [
    {
      "teacherId": "T001",
      "teacherName": "张教授",
      "role": "主讲" // 主讲, 助教
    }
  ],

  // 课程安排
  "schedule": [
    {
      "dayOfWeek": 1, // 1-7 表示周一到周日
      "startTime": "08:00",
      "endTime": "09:40",
      "classroom": "教学楼A101",
      "weeks": [1, 2, 3, 4, 5, 6, 7, 8] // 上课周次
    }
  ],

  // 课程描述
  "description": "介绍计算机科学的基本概念和原理",
  "objectives": ["掌握计算机基础知识", "培养编程思维"],
  "textbooks": ["计算机科学导论（第3版）"],

  // 考核方式
  "assessment": {
    "attendance": 10, // 出勤占比
    "homework": 20, // 作业占比
    "midterm": 30, // 期中占比
    "final": 40 // 期末占比
  },

  "semester": "2024-1", // 学期
  "academicYear": "2024-2025",
  "status": 1, // 1-正常，0-停课

  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.courses.createIndex({ "courseCode": 1, "semester": 1 }, { unique: true })
db.courses.createIndex({ "college": 1, "semester": 1 })
db.courses.createIndex({ "teachers.teacherId": 1 })

// 权限规则
{
  "read": true,
  "write": "auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)"
}
```

### 12. 学生选课集合 (student_courses)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "studentId": "2021001001",
  "userId": ObjectId("..."),
  "courseId": ObjectId("..."),
  "semester": "2024-1",

  // 成绩信息
  "grades": {
    "attendance": 95, // 出勤成绩
    "homework": 88, // 作业成绩
    "midterm": 85, // 期中成绩
    "final": 90, // 期末成绩
    "total": 89, // 总成绩
    "gpa": 3.7 // 绩点
  },

  "status": "enrolled", // enrolled, dropped, completed
  "enrolledAt": new Date(),
  "completedAt": null
}

// 索引设计
db.student_courses.createIndex({ "studentId": 1, "semester": 1 })
db.student_courses.createIndex({ "courseId": 1, "semester": 1 })
db.student_courses.createIndex({ "userId": 1, "semester": 1 })

// 权限规则
{
  "read": "auth.openid == get('database.users.doc(resource.userId)').openid",
  "write": "auth.openid == get('database.users.doc(resource.userId)').openid"
}
```

## 系统相关集合

### 13. 系统配置集合 (system_configs)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "key": "app_version",
  "value": "1.0.0",
  "description": "应用版本号",
  "type": "string", // string, number, boolean, object, array
  "category": "app", // app, payment, notification, etc.
  "isPublic": true, // 是否公开（前端可访问）
  "updatedBy": ObjectId("..."),
  "updatedAt": new Date()
}

// 索引设计
db.system_configs.createIndex({ "key": 1 }, { unique: true })
db.system_configs.createIndex({ "category": 1 })

// 权限规则
{
  "read": "resource.isPublic == true || auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)",
  "write": "auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)"
}
```

### 14. 公告信息集合 (announcements)

```javascript
// 集合结构示例
{
  "_id": ObjectId("..."),
  "title": "系统维护通知",
  "content": "系统将于今晚进行维护升级",
  "type": "system", // system, activity, notice
  "priority": "high", // low, normal, high, urgent
  "targetUsers": [], // 空数组表示全部用户
  "images": ["cloud://announcement.jpg"],

  // 发布信息
  "publishedBy": ObjectId("..."),
  "publishedAt": new Date(),

  // 显示设置
  "showOnHomepage": true,
  "showAsPopup": false,

  "status": "published", // draft, published, archived
  "validUntil": new Date("2024-12-31"),

  "createdAt": new Date(),
  "updatedAt": new Date()
}

// 索引设计
db.announcements.createIndex({ "status": 1, "publishedAt": -1 })
db.announcements.createIndex({ "type": 1, "priority": 1 })

// 权限规则
{
  "read": "resource.status == 'published'",
  "write": "auth.openid in get('database.users.where({role: \"admin\"}).data').map(item => item.openid)"
}
```

## 数据库权限配置

### 权限规则说明

云开发数据库支持基于规则的权限控制，可以在集合级别设置读写权限：

```javascript
// 权限规则语法说明
{
  "read": "权限表达式", // 读权限
  "write": "权限表达式" // 写权限
}

// 常用权限表达式
"true" // 所有人可访问
"false" // 所有人不可访问
"auth.openid == resource.openid" // 仅资源所有者可访问
"auth.openid != null" // 仅登录用户可访问
"resource.status == 'public'" // 仅公开资源可访问
```

### 安全最佳实践

1. **最小权限原则**: 只授予必要的权限
2. **数据验证**: 在云函数中进行数据验证
3. **敏感数据保护**: 敏感字段不直接暴露给前端
4. **审计日志**: 记录重要操作的日志
5. **定期审查**: 定期检查和更新权限规则

## 总结

### 集合统计

- **用户相关**: 3个集合 (users, user_login_logs, user_follows)
- **论坛相关**: 3个集合 (forum_boards, forum_posts, forum_comments)
- **商城相关**: 4个集合 (product_categories, merchants, products, orders)
- **教务相关**: 2个集合 (courses, student_courses)
- **系统相关**: 2个集合 (system_configs, announcements)

**总计**: 14个核心集合

### 设计优势

1. **灵活性**: MongoDB 文档结构易于扩展
2. **性能**: 合理的索引设计保证查询性能
3. **安全性**: 基于规则的权限控制
4. **一致性**: 通过应用层逻辑保证数据一致性
5. **可维护性**: 清晰的文档结构和命名规范

---

*文档版本: v1.0*
*最后更新: 2025年5月*
*维护人员: 开发团队*
