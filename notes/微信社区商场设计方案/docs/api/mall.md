# 商城相关API接口文档

## 概述

本文档描述了微信社区商场小程序中商城相关的API接口，包括商品管理、订单处理、支付集成、商家管理、购物车、二手交易等完整的电商功能。

## 基础信息

- **调用方式**: 微信小程序云函数
- **认证方式**: 微信小程序 openid 自动获取
- **调用方法**: `wx.cloud.callFunction()`
- **请求格式**: JSON
- **响应格式**: JSON

## 云函数调用示例

```javascript
// 调用商城相关云函数
wx.cloud.callFunction({
  name: 'mall', // 云函数名称
  data: {
    action: 'getProducts', // 具体操作
    // 其他参数...
  }
}).then(res => {
  console.log(res.result)
}).catch(err => {
  console.error(err)
})
```

## 商品相关接口

### 1. 获取商品列表

**接口地址**: `GET /products`

**接口描述**: 获取商品列表，支持分类筛选和搜索

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20，最大100
keyword=手机        // 搜索关键词，可选
categoryId=1        // 分类ID，可选
merchantId=1001     // 商家ID，可选
minPrice=100        // 最低价格，可选
maxPrice=5000       // 最高价格，可选
sortBy=sales        // 排序字段：price-价格，sales-销量，created-时间，rating-评分
sortOrder=desc      // 排序方向：asc-升序，desc-降序
status=1            // 商品状态：1-上架，0-下架，可选
isSecondHand=false  // 是否二手商品，可选
regionId=1          // 区域ID，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1001,
        "name": "iPhone 15 Pro",
        "description": "苹果最新旗舰手机",
        "images": [
          "https://cdn.campus-mall.com/products/iphone15_1.jpg",
          "https://cdn.campus-mall.com/products/iphone15_2.jpg"
        ],
        "price": 7999.00,
        "originalPrice": 8999.00,
        "stock": 50,
        "sales": 128,
        "rating": 4.8,
        "reviewCount": 45,
        "categoryId": 1,
        "categoryName": "数码产品",
        "merchantId": 1001,
        "merchantName": "苹果官方旗舰店",
        "isSecondHand": false,
        "regionId": 1,
        "regionName": "本部校区",
        "tags": ["热销", "新品"],
        "status": 1,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 500,
    "page": 1,
    "pageSize": 20,
    "totalPages": 25,
    "filters": {
      "categories": [
        {"id": 1, "name": "数码产品", "count": 150},
        {"id": 2, "name": "图书文具", "count": 200}
      ],
      "priceRanges": [
        {"min": 0, "max": 100, "count": 80},
        {"min": 100, "max": 500, "count": 200}
      ]
    }
  },
  "timestamp": 1640995200000
}
```

### 2. 获取商品详情

**接口地址**: `GET /products/{productId}`

**接口描述**: 获取指定商品的详细信息

**请求头**:
```
Authorization: Bearer {token}  // 可选，登录用户可获取更多信息
```

**路径参数**:
- `productId`: 商品ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1001,
    "name": "iPhone 15 Pro",
    "description": "苹果最新旗舰手机，搭载A17 Pro芯片",
    "detailImages": [
      "https://cdn.campus-mall.com/products/iphone15_detail_1.jpg"
    ],
    "images": [
      "https://cdn.campus-mall.com/products/iphone15_1.jpg"
    ],
    "price": 7999.00,
    "originalPrice": 8999.00,
    "stock": 50,
    "sales": 128,
    "rating": 4.8,
    "reviewCount": 45,
    "categoryId": 1,
    "categoryName": "数码产品",
    "merchantId": 1001,
    "merchantName": "苹果官方旗舰店",
    "merchantAvatar": "https://cdn.campus-mall.com/merchants/apple.jpg",
    "merchantRating": 4.9,
    "isSecondHand": false,
    "regionId": 1,
    "regionName": "本部校区",
    "specifications": [
      {"name": "颜色", "value": "深空黑色"},
      {"name": "存储", "value": "256GB"},
      {"name": "屏幕", "value": "6.1英寸"}
    ],
    "tags": ["热销", "新品", "包邮"],
    "shipping": {
      "freeShipping": true,
      "shippingFee": 0,
      "deliveryTime": "1-3天"
    },
    "services": ["7天无理由退货", "正品保证", "全国联保"],
    "status": 1,
    "viewCount": 1250,
    "favoriteCount": 89,
    "isFavorited": false,  // 当前用户是否收藏
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "timestamp": 1640995200000
}
```

### 3. 搜索商品

**接口地址**: `GET /products/search`

**接口描述**: 全文搜索商品

**查询参数**:
```
q=iPhone            // 搜索关键词，必填
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
filters=category:1,price:1000-5000  // 筛选条件，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "搜索成功",
  "data": {
    "keyword": "iPhone",
    "total": 25,
    "searchTime": 0.05,  // 搜索耗时（秒）
    "suggestions": ["iPhone 15", "iPhone 14", "iPhone 配件"],
    "list": [
      // 商品列表，格式同获取商品列表
    ],
    "relatedKeywords": ["苹果手机", "智能手机", "手机配件"]
  },
  "timestamp": 1640995200000
}
```

### 4. 获取商品分类

**接口地址**: `GET /categories`

**接口描述**: 获取商品分类树

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "categories": [
      {
        "id": 1,
        "name": "数码产品",
        "icon": "https://cdn.campus-mall.com/icons/digital.png",
        "sortOrder": 1,
        "productCount": 150,
        "children": [
          {
            "id": 11,
            "name": "手机通讯",
            "productCount": 80,
            "children": [
              {"id": 111, "name": "智能手机", "productCount": 60},
              {"id": 112, "name": "手机配件", "productCount": 20}
            ]
          },
          {
            "id": 12,
            "name": "电脑办公",
            "productCount": 70
          }
        ]
      },
      {
        "id": 2,
        "name": "图书文具",
        "icon": "https://cdn.campus-mall.com/icons/books.png",
        "sortOrder": 2,
        "productCount": 200
      }
    ]
  },
  "timestamp": 1640995200000
}
```

## 购物车相关接口

### 5. 获取购物车

**接口地址**: `GET /cart`

**接口描述**: 获取当前用户的购物车信息

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
    "items": [
      {
        "id": 1,
        "productId": 1001,
        "productName": "iPhone 15 Pro",
        "productImage": "https://cdn.campus-mall.com/products/iphone15_1.jpg",
        "price": 7999.00,
        "originalPrice": 8999.00,
        "quantity": 1,
        "stock": 50,
        "merchantId": 1001,
        "merchantName": "苹果官方旗舰店",
        "specifications": "深空黑色 256GB",
        "isSelected": true,
        "isAvailable": true,  // 商品是否可购买
        "addedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "summary": {
      "totalItems": 3,
      "selectedItems": 2,
      "totalAmount": 15998.00,
      "discountAmount": 200.00,
      "finalAmount": 15798.00
    }
  },
  "timestamp": 1640995200000
}
```

### 6. 添加商品到购物车

**接口地址**: `POST /cart/items`

**接口描述**: 将商品添加到购物车

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "productId": 1001,        // 商品ID，必填
  "quantity": 1,            // 数量，必填，默认1
  "specifications": "深空黑色 256GB"  // 规格信息，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "添加成功",
  "data": {
    "cartItemId": 1,
    "totalItems": 3
  },
  "timestamp": 1640995200000
}
```

### 7. 更新购物车商品

**接口地址**: `PUT /cart/items/{itemId}`

**接口描述**: 更新购物车中商品的数量或选中状态

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `itemId`: 购物车项目ID

**请求参数**:
```json
{
  "quantity": 2,            // 数量，可选
  "isSelected": true        // 是否选中，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "cartItemId": 1,
    "quantity": 2,
    "isSelected": true
  },
  "timestamp": 1640995200000
}
```

### 8. 删除购物车商品

**接口地址**: `DELETE /cart/items/{itemId}`

**接口描述**: 从购物车中删除商品

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `itemId`: 购物车项目ID

**响应数据**:
```json
{
  "code": 200,
  "message": "删除成功",
  "data": {
    "cartItemId": 1,
    "totalItems": 2
  },
  "timestamp": 1640995200000
}
```

### 9. 批量操作购物车

**接口地址**: `POST /cart/batch`

**接口描述**: 批量操作购物车商品

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "action": "select",       // 操作类型：select-选中，unselect-取消选中，delete-删除
  "itemIds": [1, 2, 3]      // 购物车项目ID列表
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "批量操作成功",
  "data": {
    "successCount": 3,
    "totalItems": 5
  },
  "timestamp": 1640995200000
}
```

## 订单相关接口

### 10. 创建订单

**接口地址**: `POST /orders`

**接口描述**: 创建新订单

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "items": [
    {
      "productId": 1001,
      "quantity": 1,
      "price": 7999.00
    }
  ],
  "shippingAddress": {
    "receiverName": "张三",
    "receiverPhone": "13800138000",
    "province": "浙江省",
    "city": "杭州市",
    "district": "西湖区",
    "address": "某某大学宿舍楼123号",
    "isDefault": true
  },
  "paymentMethod": "wechat",    // 支付方式：wechat-微信支付，alipay-支付宝
  "remark": "请在工作日配送",   // 订单备注，可选
  "couponId": 1001             // 优惠券ID，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "订单创建成功",
  "data": {
    "orderId": "O20240115001",
    "totalAmount": 7999.00,
    "discountAmount": 100.00,
    "shippingFee": 0.00,
    "finalAmount": 7899.00,
    "paymentInfo": {
      "paymentId": "P20240115001",
      "paymentMethod": "wechat",
      "expireTime": "2024-01-15T11:00:00Z"
    }
  },
  "timestamp": 1640995200000
}
```

### 11. 获取订单列表

**接口地址**: `GET /orders`

**接口描述**: 获取用户订单列表

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
status=all          // 订单状态：all-全部，pending-待付款，paid-已付款，shipped-已发货，completed-已完成，cancelled-已取消
startDate=2024-01-01 // 开始日期，可选
endDate=2024-01-31   // 结束日期，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "O20240115001",
        "status": "paid",
        "statusText": "已付款",
        "totalAmount": 7999.00,
        "discountAmount": 100.00,
        "shippingFee": 0.00,
        "finalAmount": 7899.00,
        "paymentMethod": "wechat",
        "paymentTime": "2024-01-15T10:30:00Z",
        "items": [
          {
            "productId": 1001,
            "productName": "iPhone 15 Pro",
            "productImage": "https://cdn.campus-mall.com/products/iphone15_1.jpg",
            "price": 7999.00,
            "quantity": 1,
            "specifications": "深空黑色 256GB"
          }
        ],
        "merchantInfo": {
          "merchantId": 1001,
          "merchantName": "苹果官方旗舰店"
        },
        "shippingAddress": {
          "receiverName": "张三",
          "receiverPhone": "138****8000",
          "fullAddress": "浙江省杭州市西湖区某某大学宿舍楼123号"
        },
        "createdAt": "2024-01-15T10:00:00Z",
        "canCancel": false,     // 是否可取消
        "canPay": false,        // 是否可支付
        "canConfirm": true,     // 是否可确认收货
        "canReview": false      // 是否可评价
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "totalPages": 3,
    "statusCount": {
      "all": 50,
      "pending": 5,
      "paid": 10,
      "shipped": 15,
      "completed": 18,
      "cancelled": 2
    }
  },
  "timestamp": 1640995200000
}
```

### 12. 获取订单详情

**接口地址**: `GET /orders/{orderId}`

**接口描述**: 获取指定订单的详细信息

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `orderId`: 订单ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "O20240115001",
    "status": "shipped",
    "statusText": "已发货",
    "totalAmount": 7999.00,
    "discountAmount": 100.00,
    "shippingFee": 0.00,
    "finalAmount": 7899.00,
    "paymentMethod": "wechat",
    "paymentTime": "2024-01-15T10:30:00Z",
    "remark": "请在工作日配送",
    "items": [
      {
        "productId": 1001,
        "productName": "iPhone 15 Pro",
        "productImage": "https://cdn.campus-mall.com/products/iphone15_1.jpg",
        "price": 7999.00,
        "quantity": 1,
        "specifications": "深空黑色 256GB"
      }
    ],
    "merchantInfo": {
      "merchantId": 1001,
      "merchantName": "苹果官方旗舰店",
      "merchantPhone": "400-666-8888"
    },
    "shippingAddress": {
      "receiverName": "张三",
      "receiverPhone": "13800138000",
      "province": "浙江省",
      "city": "杭州市",
      "district": "西湖区",
      "address": "某某大学宿舍楼123号",
      "fullAddress": "浙江省杭州市西湖区某某大学宿舍楼123号"
    },
    "logistics": {
      "company": "顺丰速运",
      "trackingNumber": "SF1234567890",
      "status": "运输中",
      "estimatedDelivery": "2024-01-17T18:00:00Z",
      "tracks": [
        {
          "time": "2024-01-15T14:00:00Z",
          "status": "已发货",
          "description": "商品已从仓库发出"
        },
        {
          "time": "2024-01-16T09:00:00Z",
          "status": "运输中",
          "description": "快件在杭州转运中心，准备发往下一站"
        }
      ]
    },
    "timeline": [
      {
        "time": "2024-01-15T10:00:00Z",
        "status": "订单创建",
        "description": "订单创建成功"
      },
      {
        "time": "2024-01-15T10:30:00Z",
        "status": "支付完成",
        "description": "微信支付成功"
      },
      {
        "time": "2024-01-15T14:00:00Z",
        "status": "商家发货",
        "description": "商家已发货，物流单号：SF1234567890"
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z",
    "canCancel": false,
    "canPay": false,
    "canConfirm": true,
    "canReview": false,
    "canRefund": true
  },
  "timestamp": 1640995200000
}
```

### 13. 取消订单

**接口地址**: `POST /orders/{orderId}/cancel`

**接口描述**: 取消订单

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `orderId`: 订单ID

**请求参数**:
```json
{
  "reason": "不想要了"       // 取消原因，必填
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "订单取消成功",
  "data": {
    "orderId": "O20240115001",
    "status": "cancelled",
    "cancelTime": "2024-01-15T11:00:00Z",
    "refundAmount": 7899.00,
    "refundTime": "预计3-5个工作日"
  },
  "timestamp": 1640995200000
}
```

### 14. 确认收货

**接口地址**: `POST /orders/{orderId}/confirm`

**接口描述**: 确认收货

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `orderId`: 订单ID

**响应数据**:
```json
{
  "code": 200,
  "message": "确认收货成功",
  "data": {
    "orderId": "O20240115001",
    "status": "completed",
    "confirmTime": "2024-01-17T15:00:00Z"
  },
  "timestamp": 1640995200000
}
```

## 支付相关接口

### 15. 发起支付

**接口地址**: `POST /payments`

**接口描述**: 发起订单支付

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "orderId": "O20240115001",    // 订单ID，必填
  "paymentMethod": "wechat",    // 支付方式：wechat-微信支付，alipay-支付宝
  "returnUrl": "https://campus-mall.com/payment/return"  // 支付完成回调地址，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "支付发起成功",
  "data": {
    "paymentId": "P20240115001",
    "paymentMethod": "wechat",
    "amount": 7899.00,
    "expireTime": "2024-01-15T11:00:00Z",
    "paymentParams": {
      "appId": "wx1234567890",
      "timeStamp": "1640995200",
      "nonceStr": "abc123",
      "package": "prepay_id=wx123456789",
      "signType": "RSA",
      "paySign": "signature_string"
    }
  },
  "timestamp": 1640995200000
}
```

### 16. 查询支付状态

**接口地址**: `GET /payments/{paymentId}`

**接口描述**: 查询支付状态

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `paymentId`: 支付ID

**响应数据**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "paymentId": "P20240115001",
    "orderId": "O20240115001",
    "status": "success",        // 支付状态：pending-待支付，success-成功，failed-失败，cancelled-已取消
    "paymentMethod": "wechat",
    "amount": 7899.00,
    "paidAmount": 7899.00,
    "transactionId": "wx_transaction_123456",
    "paymentTime": "2024-01-15T10:30:00Z",
    "expireTime": "2024-01-15T11:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 17. 申请退款

**接口地址**: `POST /refunds`

**接口描述**: 申请订单退款

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "orderId": "O20240115001",    // 订单ID，必填
  "reason": "商品质量问题",     // 退款原因，必填
  "amount": 7899.00,           // 退款金额，必填
  "description": "收到商品有划痕", // 详细说明，可选
  "images": [                  // 凭证图片，可选
    "https://cdn.campus-mall.com/refund/evidence_1.jpg"
  ]
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "退款申请提交成功",
  "data": {
    "refundId": "R20240115001",
    "orderId": "O20240115001",
    "status": "pending",         // 退款状态：pending-待审核，approved-已同意，rejected-已拒绝，completed-已完成
    "amount": 7899.00,
    "reason": "商品质量问题",
    "submittedAt": "2024-01-17T16:00:00Z",
    "expectedProcessTime": "3-5个工作日"
  },
  "timestamp": 1640995200000
}
```

## 商家管理接口

### 18. 商家入驻申请

**接口地址**: `POST /merchants/apply`

**接口描述**: 提交商家入驻申请

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "businessType": "individual",     // 商家类型：individual-个人，enterprise-企业
  "businessName": "张三的小店",     // 商家名称，必填
  "businessLicense": "https://cdn.campus-mall.com/licenses/license_123.jpg", // 营业执照，企业必填
  "idCard": "https://cdn.campus-mall.com/ids/id_123.jpg", // 身份证，个人必填
  "contactPerson": "张三",          // 联系人，必填
  "contactPhone": "13800138000",    // 联系电话，必填
  "contactEmail": "zhang@example.com", // 联系邮箱，可选
  "businessAddress": "杭州市西湖区某某街道123号", // 经营地址，必填
  "businessScope": "数码产品销售",   // 经营范围，必填
  "description": "专业销售各类数码产品", // 商家介绍，可选
  "bankAccount": {                  // 银行账户信息
    "accountName": "张三",
    "accountNumber": "6222021234567890",
    "bankName": "中国工商银行",
    "branchName": "杭州西湖支行"
  }
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "申请提交成功",
  "data": {
    "applicationId": "A20240115001",
    "status": "pending",             // 申请状态：pending-待审核，approved-已通过，rejected-已拒绝
    "submittedAt": "2024-01-15T10:00:00Z",
    "expectedReviewTime": "3-5个工作日"
  },
  "timestamp": 1640995200000
}
```

### 19. 获取商家信息

**接口地址**: `GET /merchants/{merchantId}`

**接口描述**: 获取商家详细信息

**路径参数**:
- `merchantId`: 商家ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1001,
    "businessName": "苹果官方旗舰店",
    "avatar": "https://cdn.campus-mall.com/merchants/apple.jpg",
    "description": "苹果官方授权经销商",
    "rating": 4.9,
    "reviewCount": 1250,
    "productCount": 150,
    "salesCount": 5680,
    "establishedAt": "2023-01-01T00:00:00Z",
    "location": "杭州市西湖区",
    "services": ["正品保证", "全国联保", "7天无理由退货"],
    "businessHours": "9:00-21:00",
    "contactPhone": "400-666-8888",
    "isVerified": true,              // 是否认证
    "verificationBadges": ["官方认证", "品牌授权"],
    "stats": {
      "totalSales": 12580000.00,
      "monthlyOrders": 1250,
      "responseRate": 98.5,          // 回复率
      "responseTime": "2小时内",     // 平均回复时间
      "deliveryScore": 4.8,          // 发货速度评分
      "serviceScore": 4.9            // 服务态度评分
    }
  },
  "timestamp": 1640995200000
}
```

### 20. 商家商品管理

**接口地址**: `GET /merchants/products`

**接口描述**: 获取商家的商品列表（商家端）

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
status=all          // 商品状态：all-全部，draft-草稿，pending-待审核，approved-已上架，rejected-已拒绝
categoryId=1        // 分类ID，可选
keyword=iPhone      // 搜索关键词，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1001,
        "name": "iPhone 15 Pro",
        "images": ["https://cdn.campus-mall.com/products/iphone15_1.jpg"],
        "price": 7999.00,
        "stock": 50,
        "sales": 128,
        "status": "approved",
        "statusText": "已上架",
        "categoryName": "数码产品",
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 150,
    "statusCount": {
      "all": 150,
      "draft": 5,
      "pending": 10,
      "approved": 130,
      "rejected": 5
    }
  },
  "timestamp": 1640995200000
}
```

### 21. 发布商品

**接口地址**: `POST /merchants/products`

**接口描述**: 商家发布新商品

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "iPhone 15 Pro",         // 商品名称，必填
  "description": "苹果最新旗舰手机", // 商品描述，必填
  "categoryId": 1,                 // 分类ID，必填
  "images": [                      // 商品图片，必填
    "https://cdn.campus-mall.com/products/iphone15_1.jpg"
  ],
  "detailImages": [                // 详情图片，可选
    "https://cdn.campus-mall.com/products/iphone15_detail_1.jpg"
  ],
  "price": 7999.00,               // 售价，必填
  "originalPrice": 8999.00,       // 原价，可选
  "stock": 50,                    // 库存，必填
  "specifications": [             // 规格参数，可选
    {"name": "颜色", "value": "深空黑色"},
    {"name": "存储", "value": "256GB"}
  ],
  "tags": ["新品", "热销"],       // 标签，可选
  "isSecondHand": false,          // 是否二手商品
  "regionId": 1,                  // 区域ID，必填
  "shipping": {                   // 配送信息
    "freeShipping": true,
    "shippingFee": 0,
    "deliveryTime": "1-3天"
  },
  "services": ["7天无理由退货", "正品保证"] // 服务承诺，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "商品发布成功",
  "data": {
    "productId": 1001,
    "status": "pending",            // 商品状态：pending-待审核，approved-已通过
    "submittedAt": "2024-01-15T10:00:00Z"
  },
  "timestamp": 1640995200000
}
```

## 二手交易接口

### 22. 发布二手商品

**接口地址**: `POST /second-hand/products`

**接口描述**: 发布二手闲置商品

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "name": "二手iPhone 14",        // 商品名称，必填
  "description": "9成新，无磕碰", // 商品描述，必填
  "categoryId": 1,               // 分类ID，必填
  "images": [                    // 商品图片，必填
    "https://cdn.campus-mall.com/second-hand/iphone14_1.jpg"
  ],
  "price": 4999.00,             // 售价，必填
  "originalPrice": 6999.00,     // 原价，可选
  "condition": "excellent",      // 成色：excellent-9成新，good-8成新，fair-7成新，poor-6成新以下
  "purchaseDate": "2023-09-15", // 购买日期，可选
  "reason": "换新手机了",       // 出售原因，可选
  "regionId": 1,                // 区域ID，必填
  "tradingMethod": "both",      // 交易方式：online-仅线上，offline-仅线下，both-都可以
  "contactInfo": {              // 联系方式
    "phone": "13800138000",
    "wechat": "zhang123",
    "qq": "123456789"
  }
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "productId": 2001,
    "status": "pending",          // 状态：pending-待审核，approved-已上架
    "submittedAt": "2024-01-15T10:00:00Z",
    "feeRate": 0.02,             // 手续费率（2%）
    "estimatedFee": 99.98        // 预计手续费
  },
  "timestamp": 1640995200000
}
```

### 23. 获取二手商品列表

**接口地址**: `GET /second-hand/products`

**接口描述**: 获取二手商品列表

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
categoryId=1        // 分类ID，可选
condition=excellent // 成色筛选，可选
minPrice=1000       // 最低价格，可选
maxPrice=5000       // 最高价格，可选
regionId=1          // 区域ID，可选
sortBy=created      // 排序：created-发布时间，price-价格，views-浏览量
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 2001,
        "name": "二手iPhone 14",
        "images": ["https://cdn.campus-mall.com/second-hand/iphone14_1.jpg"],
        "price": 4999.00,
        "originalPrice": 6999.00,
        "condition": "excellent",
        "conditionText": "9成新",
        "sellerId": 1001,
        "sellerName": "张三",
        "sellerAvatar": "https://cdn.campus-mall.com/avatars/user_1001.jpg",
        "regionName": "本部校区",
        "viewCount": 156,
        "favoriteCount": 23,
        "createdAt": "2024-01-15T10:00:00Z",
        "isOnline": true            // 卖家是否在线
      }
    ],
    "total": 200,
    "filters": {
      "conditions": [
        {"value": "excellent", "text": "9成新", "count": 50},
        {"value": "good", "text": "8成新", "count": 80}
      ]
    }
  },
  "timestamp": 1640995200000
}
```

### 24. 二手商品询价

**接口地址**: `POST /second-hand/products/{productId}/inquiry`

**接口描述**: 对二手商品进行询价

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `productId`: 商品ID

**请求参数**:
```json
{
  "message": "能便宜点吗？",      // 询价消息，必填
  "offerPrice": 4500.00         // 出价，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "询价发送成功",
  "data": {
    "inquiryId": "I20240115001",
    "productId": 2001,
    "message": "能便宜点吗？",
    "offerPrice": 4500.00,
    "status": "pending",          // 状态：pending-待回复，replied-已回复，accepted-已接受，rejected-已拒绝
    "createdAt": "2024-01-15T15:00:00Z"
  },
  "timestamp": 1640995200000
}
```

## 评价相关接口

### 25. 提交商品评价

**接口地址**: `POST /reviews`

**接口描述**: 对已购买商品进行评价

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "orderId": "O20240115001",      // 订单ID，必填
  "productId": 1001,              // 商品ID，必填
  "rating": 5,                    // 评分：1-5星，必填
  "content": "商品质量很好，物流很快", // 评价内容，必填
  "images": [                     // 评价图片，可选
    "https://cdn.campus-mall.com/reviews/review_1.jpg"
  ],
  "tags": ["质量好", "物流快"],   // 评价标签，可选
  "isAnonymous": false            // 是否匿名评价，默认false
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "评价提交成功",
  "data": {
    "reviewId": "RV20240115001",
    "rating": 5,
    "content": "商品质量很好，物流很快",
    "submittedAt": "2024-01-20T10:00:00Z",
    "rewardPoints": 10            // 获得积分奖励
  },
  "timestamp": 1640995200000
}
```

### 26. 获取商品评价

**接口地址**: `GET /products/{productId}/reviews`

**接口描述**: 获取商品的评价列表

**路径参数**:
- `productId`: 商品ID

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
rating=all          // 评分筛选：all-全部，5-5星，4-4星，3-3星，2-2星，1-1星
hasImages=false     // 是否只看有图评价
sortBy=time         // 排序：time-时间，rating-评分，helpful-有用数
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "summary": {
      "totalReviews": 156,
      "averageRating": 4.8,
      "ratingDistribution": {
        "5": 120,
        "4": 25,
        "3": 8,
        "2": 2,
        "1": 1
      },
      "tags": [
        {"name": "质量好", "count": 89},
        {"name": "物流快", "count": 67}
      ]
    },
    "list": [
      {
        "id": "RV20240115001",
        "userId": 1001,
        "userName": "张***",
        "userAvatar": "https://cdn.campus-mall.com/avatars/user_1001.jpg",
        "rating": 5,
        "content": "商品质量很好，物流很快",
        "images": [
          "https://cdn.campus-mall.com/reviews/review_1.jpg"
        ],
        "tags": ["质量好", "物流快"],
        "specifications": "深空黑色 256GB",
        "isAnonymous": false,
        "helpfulCount": 12,         // 有用数
        "isHelpful": false,         // 当前用户是否点了有用
        "merchantReply": {          // 商家回复
          "content": "感谢您的好评！",
          "repliedAt": "2024-01-21T09:00:00Z"
        },
        "createdAt": "2024-01-20T10:00:00Z"
      }
    ],
    "total": 156,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": 1640995200000
}
```

### 27. 评价有用性投票

**接口地址**: `POST /reviews/{reviewId}/helpful`

**接口描述**: 对评价进行有用性投票

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `reviewId`: 评价ID

**请求参数**:
```json
{
  "isHelpful": true               // 是否有用，必填
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "投票成功",
  "data": {
    "reviewId": "RV20240115001",
    "helpfulCount": 13,
    "isHelpful": true
  },
  "timestamp": 1640995200000
}
```

## 收藏和关注接口

### 28. 收藏商品

**接口地址**: `POST /favorites/products`

**接口描述**: 收藏或取消收藏商品

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "productId": 1001,              // 商品ID，必填
  "action": "add"                 // 操作：add-收藏，remove-取消收藏
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "productId": 1001,
    "isFavorited": true,
    "favoriteCount": 90
  },
  "timestamp": 1640995200000
}
```

### 29. 获取收藏列表

**接口地址**: `GET /favorites/products`

**接口描述**: 获取用户收藏的商品列表

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
categoryId=1        // 分类筛选，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": 1001,
        "name": "iPhone 15 Pro",
        "images": ["https://cdn.campus-mall.com/products/iphone15_1.jpg"],
        "price": 7999.00,
        "originalPrice": 8999.00,
        "merchantName": "苹果官方旗舰店",
        "rating": 4.8,
        "sales": 128,
        "isAvailable": true,        // 商品是否可购买
        "priceChanged": false,      // 价格是否有变动
        "favoritedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": 1640995200000
}
```

### 30. 关注商家

**接口地址**: `POST /follows/merchants`

**接口描述**: 关注或取消关注商家

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "merchantId": 1001,             // 商家ID，必填
  "action": "follow"              // 操作：follow-关注，unfollow-取消关注
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "关注成功",
  "data": {
    "merchantId": 1001,
    "isFollowed": true,
    "followerCount": 1250
  },
  "timestamp": 1640995200000
}
```

## 错误码说明

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 60001 | 商品不存在 | 指定的商品不存在或已下架 |
| 60002 | 库存不足 | 商品库存不足，无法购买 |
| 60003 | 商品已下架 | 商品已被下架，无法购买 |
| 60004 | 购物车为空 | 购物车中没有商品 |
| 60005 | 订单不存在 | 指定的订单不存在 |
| 60006 | 订单状态错误 | 订单当前状态不允许该操作 |
| 60007 | 支付金额不匹配 | 支付金额与订单金额不符 |
| 60008 | 支付已过期 | 支付链接已过期 |
| 60009 | 商家不存在 | 指定的商家不存在 |
| 60010 | 商家未认证 | 商家尚未通过认证 |
| 60011 | 重复收藏 | 商品已在收藏列表中 |
| 60012 | 评价已存在 | 该订单商品已评价过 |
| 60013 | 退款申请重复 | 该订单已有退款申请 |
| 60014 | 地址信息不完整 | 收货地址信息不完整 |
| 60015 | 优惠券无效 | 优惠券不存在或已过期 |

## 注意事项

1. 所有涉及金额的字段均为人民币，保留两位小数
2. 商品图片建议尺寸：主图800x800px，详情图宽度不超过750px
3. 二手商品交易收取2%手续费，费率可在后台调整
4. 订单支付有效期为30分钟，超时自动取消
5. 商家入驻需要提供真实有效的证件信息
6. 评价一旦提交不可修改，请谨慎操作
7. 收藏和关注数据会影响商品和商家的推荐权重
8. 退款申请需要在订单完成后7天内提交

---

*文档版本: v1.0*
*最后更新: 2025年5月*
