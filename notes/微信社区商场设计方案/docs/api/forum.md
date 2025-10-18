# 论坛相关API接口文档

## 概述

本文档描述了微信社区商场小程序中论坛相关的API接口，包括帖子管理、评论互动、版块管理、举报处理、搜索功能等完整的社区论坛功能。

## 基础信息

- **调用方式**: 微信小程序云函数
- **认证方式**: 微信小程序 openid 自动获取
- **调用方法**: `wx.cloud.callFunction()`
- **请求格式**: JSON
- **响应格式**: JSON

## 云函数调用示例

```javascript
// 调用论坛相关云函数
wx.cloud.callFunction({
  name: 'forum', // 云函数名称
  data: {
    action: 'getPosts', // 具体操作
    // 其他参数...
  }
}).then(res => {
  console.log(res.result)
}).catch(err => {
  console.error(err)
})
```

## 版块相关接口

### 1. 获取版块列表

**接口地址**: `GET /boards`

**接口描述**: 获取论坛版块列表

**查询参数**:
```
includeStats=true   // 是否包含统计信息，默认false
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "boards": [
      {
        "id": 1,
        "name": "学习交流",
        "description": "学术讨论、学习资料分享",
        "icon": "https://cdn.campus-mall.com/icons/study.png",
        "color": "#1890ff",
        "sortOrder": 1,
        "postCount": 1250,
        "todayPostCount": 25,
        "moderators": [
          {
            "id": 1001,
            "name": "张老师",
            "avatar": "https://cdn.campus-mall.com/avatars/teacher_1001.jpg"
          }
        ],
        "rules": [
          "禁止发布与学习无关的内容",
          "禁止恶意灌水和刷屏",
          "尊重他人，文明讨论"
        ],
        "isFollowed": false,
        "status": 1
      },
      {
        "id": 2,
        "name": "二手闲置",
        "description": "二手物品交易、闲置物品转让",
        "icon": "https://cdn.campus-mall.com/icons/secondhand.png",
        "color": "#52c41a",
        "sortOrder": 2,
        "postCount": 890,
        "todayPostCount": 15,
        "moderators": [],
        "rules": [
          "仅限校内二手物品交易",
          "必须提供真实商品图片",
          "禁止虚假交易信息"
        ],
        "isFollowed": true,
        "status": 1
      }
    ]
  },
  "timestamp": 1640995200000
}
```

### 2. 获取版块详情

**接口地址**: `GET /boards/{boardId}`

**接口描述**: 获取指定版块的详细信息

**请求头**:
```
Authorization: Bearer {token}  // 可选
```

**路径参数**:
- `boardId`: 版块ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "学习交流",
    "description": "学术讨论、学习资料分享",
    "icon": "https://cdn.campus-mall.com/icons/study.png",
    "color": "#1890ff",
    "banner": "https://cdn.campus-mall.com/banners/study_board.jpg",
    "postCount": 1250,
    "memberCount": 3500,
    "todayPostCount": 25,
    "weeklyPostCount": 180,
    "moderators": [
      {
        "id": 1001,
        "name": "张老师",
        "avatar": "https://cdn.campus-mall.com/avatars/teacher_1001.jpg",
        "title": "版主",
        "joinedAt": "2023-09-01T00:00:00Z"
      }
    ],
    "rules": [
      "禁止发布与学习无关的内容",
      "禁止恶意灌水和刷屏",
      "尊重他人，文明讨论"
    ],
    "tags": ["学习", "讨论", "资料分享"],
    "isFollowed": false,
    "followerCount": 3500,
    "canPost": true,
    "status": 1,
    "createdAt": "2023-01-01T00:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 3. 关注/取消关注版块

**接口地址**: `POST /boards/{boardId}/follow`

**接口描述**: 关注或取消关注版块

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `boardId`: 版块ID

**请求参数**:
```json
{
  "action": "follow"    // 操作类型：follow-关注，unfollow-取消关注
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "关注成功",
  "data": {
    "boardId": 1,
    "isFollowed": true,
    "followerCount": 3501
  },
  "timestamp": 1640995200000
}
```

## 帖子相关接口

### 4. 获取帖子列表

**接口地址**: `GET /posts`

**接口描述**: 获取帖子列表，支持多种筛选和排序

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20，最大50
boardId=1           // 版块ID，可选
userId=1001         // 用户ID，可选
keyword=学习        // 搜索关键词，可选
tag=讨论            // 标签筛选，可选
sortBy=latest       // 排序方式：latest-最新，hot-热门，top-置顶优先
timeRange=week      // 时间范围：day-今日，week-本周，month-本月，all-全部
hasImages=false     // 是否只看有图帖子，可选
isTop=false         // 是否只看置顶帖，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 10001,
        "title": "数据结构学习心得分享",
        "content": "最近在学习数据结构，想和大家分享一些心得...",
        "contentPreview": "最近在学习数据结构，想和大家分享一些心得，希望对大家有帮助...",
        "images": [
          "https://cdn.campus-mall.com/posts/post_10001_1.jpg"
        ],
        "authorId": 1001,
        "authorName": "张三",
        "authorAvatar": "https://cdn.campus-mall.com/avatars/user_1001.jpg",
        "authorLevel": "活跃用户",
        "isAnonymous": false,
        "boardId": 1,
        "boardName": "学习交流",
        "tags": ["学习", "数据结构", "心得"],
        "viewCount": 156,
        "likeCount": 23,
        "commentCount": 8,
        "shareCount": 5,
        "isLiked": false,
        "isCollected": false,
        "isTop": false,
        "isHot": true,
        "hotScore": 85.6,
        "status": 1,
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 1250,
    "page": 1,
    "pageSize": 20,
    "totalPages": 63,
    "hasMore": true
  },
  "timestamp": 1640995200000
}
```

### 5. 获取帖子详情

**接口地址**: `GET /posts/{postId}`

**接口描述**: 获取指定帖子的详细信息

**请求头**:
```
Authorization: Bearer {token}  // 可选
```

**路径参数**:
- `postId`: 帖子ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 10001,
    "title": "数据结构学习心得分享",
    "content": "最近在学习数据结构，想和大家分享一些心得...\n\n## 学习方法\n1. 理论学习\n2. 实践编程\n3. 总结归纳",
    "contentType": "markdown",
    "images": [
      "https://cdn.campus-mall.com/posts/post_10001_1.jpg",
      "https://cdn.campus-mall.com/posts/post_10001_2.jpg"
    ],
    "authorId": 1001,
    "authorName": "张三",
    "authorAvatar": "https://cdn.campus-mall.com/avatars/user_1001.jpg",
    "authorLevel": "活跃用户",
    "authorBadges": ["学霸", "热心助人"],
    "isAnonymous": false,
    "boardId": 1,
    "boardName": "学习交流",
    "tags": ["学习", "数据结构", "心得"],
    "viewCount": 157,
    "likeCount": 24,
    "commentCount": 9,
    "shareCount": 5,
    "collectCount": 12,
    "isLiked": true,
    "isCollected": false,
    "isFollowed": false,
    "isTop": false,
    "isHot": true,
    "hotScore": 86.2,
    "ipLocation": "浙江杭州",
    "device": "iPhone",
    "canEdit": true,
    "canDelete": true,
    "status": 1,
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 6. 发布帖子

**接口地址**: `POST /posts`

**接口描述**: 发布新帖子

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "title": "数据结构学习心得分享",     // 帖子标题，必填，1-100字符
  "content": "最近在学习数据结构...", // 帖子内容，必填，10-10000字符
  "contentType": "markdown",         // 内容类型：text-纯文本，markdown-Markdown格式
  "boardId": 1,                      // 版块ID，必填
  "images": [                        // 图片列表，可选，最多9张
    "https://cdn.campus-mall.com/posts/post_temp_1.jpg"
  ],
  "tags": ["学习", "数据结构"],      // 标签列表，可选，最多5个
  "isAnonymous": false,              // 是否匿名发布，默认false
  "allowComment": true,              // 是否允许评论，默认true
  "isTop": false                     // 是否申请置顶，默认false（需要版主权限）
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "postId": 10001,
    "title": "数据结构学习心得分享",
    "status": "published",           // 发布状态：published-已发布，pending-待审核
    "auditRequired": false,          // 是否需要审核
    "publishedAt": "2024-01-15T10:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 7. 编辑帖子

**接口地址**: `PUT /posts/{postId}`

**接口描述**: 编辑已发布的帖子

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `postId`: 帖子ID

**请求参数**:
```json
{
  "title": "数据结构学习心得分享（更新版）", // 帖子标题，可选
  "content": "更新后的内容...",           // 帖子内容，可选
  "images": [                           // 图片列表，可选
    "https://cdn.campus-mall.com/posts/post_10001_1.jpg"
  ],
  "tags": ["学习", "数据结构", "更新"]   // 标签列表，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "编辑成功",
  "data": {
    "postId": 10001,
    "updatedAt": "2024-01-15T11:00:00Z",
    "auditRequired": false
  },
  "timestamp": 1640995200000
}
```

### 8. 删除帖子

**接口地址**: `DELETE /posts/{postId}`

**接口描述**: 删除帖子

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `postId`: 帖子ID

**请求参数**:
```json
{
  "reason": "内容不当"    // 删除原因，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "postId": 10001,
    "deletedAt": "2024-01-15T12:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 9. 帖子互动操作

**接口地址**: `POST /posts/{postId}/actions`

**接口描述**: 对帖子进行点赞、收藏、分享等操作

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `postId`: 帖子ID

**请求参数**:
```json
{
  "action": "like",     // 操作类型：like-点赞，unlike-取消点赞，collect-收藏，uncollect-取消收藏，share-分享
  "platform": "wechat"  // 分享平台，分享操作时必填：wechat-微信，qq-QQ，weibo-微博
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "postId": 10001,
    "action": "like",
    "isLiked": true,
    "likeCount": 25,
    "isCollected": false,
    "collectCount": 12,
    "shareCount": 6
  },
  "timestamp": 1640995200000
}
```

## 评论相关接口

### 10. 获取评论列表

**接口地址**: `GET /posts/{postId}/comments`

**接口描述**: 获取帖子的评论列表

**请求头**:
```
Authorization: Bearer {token}  // 可选
```

**路径参数**:
- `postId`: 帖子ID

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20，最大50
sortBy=time         // 排序方式：time-时间，hot-热度
parentId=0          // 父评论ID，0表示获取一级评论
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 20001,
        "content": "写得很好，对我很有帮助！",
        "authorId": 1002,
        "authorName": "李四",
        "authorAvatar": "https://cdn.campus-mall.com/avatars/user_1002.jpg",
        "authorLevel": "新手用户",
        "isAnonymous": false,
        "parentId": 0,
        "parentAuthorName": null,
        "likeCount": 5,
        "replyCount": 2,
        "isLiked": false,
        "ipLocation": "浙江杭州",
        "device": "Android",
        "canReply": true,
        "canDelete": false,
        "status": 1,
        "createdAt": "2024-01-15T11:00:00Z",
        "replies": [
          {
            "id": 20002,
            "content": "同感，楼主分享得很详细",
            "authorId": 1003,
            "authorName": "王五",
            "authorAvatar": "https://cdn.campus-mall.com/avatars/user_1003.jpg",
            "isAnonymous": false,
            "parentId": 20001,
            "parentAuthorName": "李四",
            "likeCount": 2,
            "isLiked": false,
            "createdAt": "2024-01-15T11:30:00Z"
          }
        ]
      }
    ],
    "total": 9,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  },
  "timestamp": 1640995200000
}
```

### 11. 发表评论

**接口地址**: `POST /posts/{postId}/comments`

**接口描述**: 对帖子发表评论或回复

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `postId`: 帖子ID

**请求参数**:
```json
{
  "content": "写得很好，对我很有帮助！", // 评论内容，必填，1-1000字符
  "parentId": 0,                    // 父评论ID，0表示一级评论，其他表示回复
  "isAnonymous": false              // 是否匿名评论，默认false
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "评论成功",
  "data": {
    "commentId": 20001,
    "content": "写得很好，对我很有帮助！",
    "parentId": 0,
    "auditRequired": false,
    "publishedAt": "2024-01-15T11:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 12. 删除评论

**接口地址**: `DELETE /comments/{commentId}`

**接口描述**: 删除评论

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `commentId`: 评论ID

**请求参数**:
```json
{
  "reason": "内容不当"    // 删除原因，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "commentId": 20001,
    "deletedAt": "2024-01-15T12:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 13. 评论点赞

**接口地址**: `POST /comments/{commentId}/like`

**接口描述**: 对评论进行点赞或取消点赞

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `commentId`: 评论ID

**请求参数**:
```json
{
  "action": "like"      // 操作类型：like-点赞，unlike-取消点赞
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "commentId": 20001,
    "isLiked": true,
    "likeCount": 6
  },
  "timestamp": 1640995200000
}
```

## 搜索相关接口

### 14. 搜索帖子

**接口地址**: `GET /search/posts`

**接口描述**: 全文搜索帖子

**查询参数**:
```
q=数据结构          // 搜索关键词，必填
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
boardId=1           // 版块筛选，可选
authorId=1001       // 作者筛选，可选
timeRange=month     // 时间范围：day-今日，week-本周，month-本月，year-今年，all-全部
sortBy=relevance    // 排序方式：relevance-相关性，time-时间，hot-热度
hasImages=false     // 是否只搜索有图帖子，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "搜索成功",
  "data": {
    "keyword": "数据结构",
    "total": 45,
    "searchTime": 0.08,
    "suggestions": ["数据结构与算法", "数据结构课程", "数据结构实验"],
    "list": [
      {
        "id": 10001,
        "title": "<em>数据结构</em>学习心得分享",
        "contentPreview": "最近在学习<em>数据结构</em>，想和大家分享一些心得...",
        "authorName": "张三",
        "boardName": "学习交流",
        "likeCount": 24,
        "commentCount": 9,
        "createdAt": "2024-01-15T10:00:00Z",
        "relevanceScore": 95.6
      }
    ],
    "relatedKeywords": ["算法", "编程", "计算机"],
    "hotKeywords": ["期末复习", "课程设计", "实习招聘"]
  },
  "timestamp": 1640995200000
}
```

### 15. 搜索用户

**接口地址**: `GET /search/users`

**接口描述**: 搜索用户

**查询参数**:
```
q=张三              // 搜索关键词，必填
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
```

**响应数据**:
```json
{
  "code": 200,
  "message": "搜索成功",
  "data": {
    "keyword": "张三",
    "total": 12,
    "list": [
      {
        "id": 1001,
        "name": "张三",
        "avatar": "https://cdn.campus-mall.com/avatars/user_1001.jpg",
        "level": "活跃用户",
        "badges": ["学霸", "热心助人"],
        "postCount": 156,
        "likeCount": 1250,
        "followerCount": 89,
        "isFollowed": false,
        "lastActiveAt": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "timestamp": 1640995200000
}
```

### 16. 获取搜索热词

**接口地址**: `GET /search/hot-keywords`

**接口描述**: 获取搜索热词列表

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "keywords": [
      {
        "keyword": "期末复习",
        "searchCount": 1250,
        "trend": "up",          // 趋势：up-上升，down-下降，stable-稳定
        "rank": 1
      },
      {
        "keyword": "课程设计",
        "searchCount": 890,
        "trend": "stable",
        "rank": 2
      },
      {
        "keyword": "实习招聘",
        "searchCount": 756,
        "trend": "up",
        "rank": 3
      }
    ],
    "updatedAt": "2024-01-15T12:00:00Z"
  },
  "timestamp": 1640995200000
}
```

## 热帖排行接口

### 17. 获取热帖排行榜

**接口地址**: `GET /ranking/hot-posts`

**接口描述**: 获取热帖排行榜

**查询参数**:
```
timeRange=week      // 时间范围：day-今日，week-本周，month-本月
boardId=1           // 版块筛选，可选
limit=50            // 返回数量，默认50，最大100
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "timeRange": "week",
    "updatedAt": "2024-01-15T12:00:00Z",
    "list": [
      {
        "rank": 1,
        "postId": 10001,
        "title": "数据结构学习心得分享",
        "authorName": "张三",
        "boardName": "学习交流",
        "hotScore": 95.6,
        "viewCount": 2580,
        "likeCount": 156,
        "commentCount": 45,
        "shareCount": 23,
        "createdAt": "2024-01-15T10:00:00Z",
        "trendChange": 2        // 排名变化：正数上升，负数下降，0不变
      }
    ]
  },
  "timestamp": 1640995200000
}
```

### 18. 获取用户排行榜

**接口地址**: `GET /ranking/users`

**接口描述**: 获取用户排行榜

**查询参数**:
```
type=post           // 排行类型：post-发帖数，like-获赞数，comment-评论数
timeRange=month     // 时间范围：week-本周，month-本月，year-今年
limit=50            // 返回数量，默认50，最大100
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "type": "post",
    "timeRange": "month",
    "updatedAt": "2024-01-15T12:00:00Z",
    "list": [
      {
        "rank": 1,
        "userId": 1001,
        "userName": "张三",
        "userAvatar": "https://cdn.campus-mall.com/avatars/user_1001.jpg",
        "userLevel": "活跃用户",
        "postCount": 45,
        "likeCount": 1250,
        "commentCount": 156,
        "score": 1451,          // 综合得分
        "trendChange": 0
      }
    ]
  },
  "timestamp": 1640995200000
}
```

## 举报相关接口

### 19. 举报帖子

**接口地址**: `POST /reports/posts`

**接口描述**: 举报违规帖子

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "postId": 10001,                    // 帖子ID，必填
  "reason": "spam",                   // 举报原因：spam-垃圾信息，inappropriate-不当内容，harassment-骚扰，fake-虚假信息，other-其他
  "description": "内容与版块主题不符", // 详细描述，可选
  "evidence": [                       // 证据截图，可选
    "https://cdn.campus-mall.com/reports/evidence_1.jpg"
  ]
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "举报提交成功",
  "data": {
    "reportId": "R20240115001",
    "postId": 10001,
    "status": "pending",              // 状态：pending-待处理，processing-处理中，resolved-已处理
    "submittedAt": "2024-01-15T15:00:00Z",
    "expectedProcessTime": "24小时内"
  },
  "timestamp": 1640995200000
}
```

### 20. 举报评论

**接口地址**: `POST /reports/comments`

**接口描述**: 举报违规评论

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "commentId": 20001,                 // 评论ID，必填
  "reason": "inappropriate",          // 举报原因
  "description": "评论内容不当",      // 详细描述，可选
  "evidence": []                      // 证据截图，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "举报提交成功",
  "data": {
    "reportId": "R20240115002",
    "commentId": 20001,
    "status": "pending",
    "submittedAt": "2024-01-15T15:00:00Z",
    "expectedProcessTime": "24小时内"
  },
  "timestamp": 1640995200000
}
```

### 21. 举报用户

**接口地址**: `POST /reports/users`

**接口描述**: 举报违规用户

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "userId": 1002,                     // 用户ID，必填
  "reason": "harassment",             // 举报原因
  "description": "恶意骚扰其他用户",   // 详细描述，必填
  "evidence": [                       // 证据截图，建议提供
    "https://cdn.campus-mall.com/reports/user_evidence_1.jpg"
  ],
  "relatedPosts": [10001, 10002]      // 相关帖子ID，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "举报提交成功",
  "data": {
    "reportId": "R20240115003",
    "userId": 1002,
    "status": "pending",
    "submittedAt": "2024-01-15T15:00:00Z",
    "expectedProcessTime": "48小时内"
  },
  "timestamp": 1640995200000
}
```

### 22. 获取举报记录

**接口地址**: `GET /reports/my`

**接口描述**: 获取用户的举报记录

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
status=all          // 状态筛选：all-全部，pending-待处理，resolved-已处理
type=all            // 类型筛选：all-全部，post-帖子，comment-评论，user-用户
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "R20240115001",
        "type": "post",
        "targetId": 10001,
        "targetTitle": "数据结构学习心得分享",
        "reason": "spam",
        "reasonText": "垃圾信息",
        "description": "内容与版块主题不符",
        "status": "resolved",
        "statusText": "已处理",
        "result": "已删除违规内容",
        "submittedAt": "2024-01-15T15:00:00Z",
        "processedAt": "2024-01-15T18:00:00Z"
      }
    ],
    "total": 5,
    "statusCount": {
      "all": 5,
      "pending": 2,
      "resolved": 3
    }
  },
  "timestamp": 1640995200000
}
```

## 个人中心相关接口

### 23. 获取我的帖子

**接口地址**: `GET /my/posts`

**接口描述**: 获取当前用户发布的帖子列表

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
status=all          // 状态筛选：all-全部，published-已发布，draft-草稿，deleted-已删除
boardId=1           // 版块筛选，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 10001,
        "title": "数据结构学习心得分享",
        "boardName": "学习交流",
        "viewCount": 157,
        "likeCount": 24,
        "commentCount": 9,
        "status": "published",
        "statusText": "已发布",
        "createdAt": "2024-01-15T10:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 25,
    "statusCount": {
      "all": 25,
      "published": 23,
      "draft": 1,
      "deleted": 1
    }
  },
  "timestamp": 1640995200000
}
```

### 24. 获取我的收藏

**接口地址**: `GET /my/collections`

**接口描述**: 获取当前用户收藏的帖子列表

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
boardId=1           // 版块筛选，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 10002,
        "title": "算法学习路线推荐",
        "authorName": "李四",
        "boardName": "学习交流",
        "likeCount": 89,
        "commentCount": 23,
        "collectedAt": "2024-01-14T15:00:00Z",
        "createdAt": "2024-01-14T10:00:00Z"
      }
    ],
    "total": 12
  },
  "timestamp": 1640995200000
}
```

### 25. 获取关注的版块

**接口地址**: `GET /my/followed-boards`

**接口描述**: 获取当前用户关注的版块列表

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
    "list": [
      {
        "id": 1,
        "name": "学习交流",
        "icon": "https://cdn.campus-mall.com/icons/study.png",
        "postCount": 1250,
        "todayPostCount": 25,
        "followedAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": 2,
        "name": "二手闲置",
        "icon": "https://cdn.campus-mall.com/icons/secondhand.png",
        "postCount": 890,
        "todayPostCount": 15,
        "followedAt": "2024-01-05T00:00:00Z"
      }
    ],
    "total": 5
  },
  "timestamp": 1640995200000
}
```

## 消息通知接口

### 26. 获取消息列表

**接口地址**: `GET /notifications`

**接口描述**: 获取用户的消息通知列表

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
type=all            // 消息类型：all-全部，like-点赞，comment-评论，reply-回复，follow-关注，system-系统
isRead=all          // 读取状态：all-全部，read-已读，unread-未读
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 30001,
        "type": "like",
        "typeText": "点赞",
        "title": "张三点赞了你的帖子",
        "content": "数据结构学习心得分享",
        "avatar": "https://cdn.campus-mall.com/avatars/user_1001.jpg",
        "targetType": "post",
        "targetId": 10001,
        "isRead": false,
        "createdAt": "2024-01-15T14:00:00Z"
      },
      {
        "id": 30002,
        "type": "comment",
        "typeText": "评论",
        "title": "李四评论了你的帖子",
        "content": "写得很好，对我很有帮助！",
        "avatar": "https://cdn.campus-mall.com/avatars/user_1002.jpg",
        "targetType": "post",
        "targetId": 10001,
        "isRead": true,
        "createdAt": "2024-01-15T11:00:00Z"
      }
    ],
    "total": 25,
    "unreadCount": 8
  },
  "timestamp": 1640995200000
}
```

### 27. 标记消息已读

**接口地址**: `POST /notifications/read`

**接口描述**: 标记消息为已读

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "notificationIds": [30001, 30002], // 消息ID列表，可选
  "markAll": false                   // 是否标记全部为已读，默认false
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "标记成功",
  "data": {
    "markedCount": 2,
    "unreadCount": 6
  },
  "timestamp": 1640995200000
}
```

## 统计相关接口

### 28. 获取论坛统计数据

**接口地址**: `GET /statistics`

**接口描述**: 获取论坛整体统计数据

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "overview": {
      "totalPosts": 12580,
      "totalComments": 45620,
      "totalUsers": 8950,
      "onlineUsers": 234,
      "todayPosts": 156,
      "todayComments": 567
    },
    "boards": [
      {
        "id": 1,
        "name": "学习交流",
        "postCount": 1250,
        "todayPostCount": 25
      }
    ],
    "trends": {
      "dailyPosts": [
        {"date": "2024-01-14", "count": 145},
        {"date": "2024-01-15", "count": 156}
      ],
      "dailyUsers": [
        {"date": "2024-01-14", "count": 1250},
        {"date": "2024-01-15", "count": 1340}
      ]
    }
  },
  "timestamp": 1640995200000
}
```

## 错误码说明

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 70001 | 版块不存在 | 指定的版块不存在或已关闭 |
| 70002 | 帖子不存在 | 指定的帖子不存在或已删除 |
| 70003 | 评论不存在 | 指定的评论不存在或已删除 |
| 70004 | 无发帖权限 | 用户没有在该版块发帖的权限 |
| 70005 | 无评论权限 | 帖子不允许评论或用户被禁言 |
| 70006 | 内容审核中 | 内容正在审核中，暂时不可见 |
| 70007 | 内容违规 | 内容包含违规信息，发布失败 |
| 70008 | 重复举报 | 已对该内容进行过举报 |
| 70009 | 操作过于频繁 | 操作过于频繁，请稍后再试 |
| 70010 | 标题过长 | 帖子标题超过字数限制 |
| 70011 | 内容过长 | 帖子内容超过字数限制 |
| 70012 | 图片过多 | 上传图片数量超过限制 |
| 70013 | 标签过多 | 标签数量超过限制 |
| 70014 | 无编辑权限 | 没有编辑该内容的权限 |
| 70015 | 无删除权限 | 没有删除该内容的权限 |

## 注意事项

1. 帖子和评论支持Markdown格式，但需要过滤危险标签
2. 图片上传建议尺寸不超过1920x1080px，单张不超过5MB
3. 匿名发布的内容仍会记录真实用户信息，仅对其他用户隐藏
4. 热度算法综合考虑浏览量、点赞数、评论数、分享数和时间衰减
5. 举报处理时间：一般违规24小时内，严重违规1小时内
6. 用户被禁言期间无法发帖、评论，但可以浏览和点赞
7. 版主可以置顶、删除版块内的帖子和评论
8. 搜索结果会根据用户行为进行个性化排序

---

*文档版本: v1.0*
*最后更新: 2025年5月*
