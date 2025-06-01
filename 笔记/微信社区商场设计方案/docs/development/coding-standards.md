# 微信小程序开发编码规范

## 概述

本文档详细描述了微信社区商场小程序的开发编码规范，包括JavaScript、WXML、WXSS的编码标准、命名规范、注释规范、代码格式化配置等内容，旨在确保代码质量、可维护性和团队协作效率。

**技术栈规范**:
- **前端**: 微信小程序原生开发 (WXML/WXSS/JavaScript)
- **后端**: 微信小程序云函数 (Node.js)
- **数据库**: MongoDB 云数据库
- **工具**: ESLint + Prettier + 微信开发者工具

## 编码规范原则

### 基本原则

1. **一致性**: 整个项目保持统一的编码风格
2. **可读性**: 代码应该易于理解和维护
3. **简洁性**: 避免冗余代码，保持代码简洁
4. **可扩展性**: 代码结构应便于功能扩展
5. **性能优化**: 遵循小程序性能最佳实践

### 代码质量标准

- **可维护性**: 代码结构清晰，逻辑简单
- **可测试性**: 函数职责单一，便于单元测试
- **可复用性**: 公共功能抽象为组件或工具函数
- **安全性**: 避免安全漏洞，数据验证完整

## JavaScript 编码规范

### 1. 基础语法规范

#### 变量声明

```javascript
// ✅ 推荐：使用 const 和 let
const API_BASE_URL = 'https://api.campus-mall.com'
let userInfo = null

// ❌ 避免：使用 var
var userName = 'test' // 不推荐

// ✅ 推荐：一行声明一个变量
const userId = 123
const userName = 'zhangsan'

// ❌ 避免：一行声明多个变量
const userId = 123, userName = 'zhangsan' // 不推荐
```

#### 函数定义

```javascript
// ✅ 推荐：使用箭头函数（简短函数）
const getUserInfo = (userId) => {
  return wx.request({
    url: `${API_BASE_URL}/users/${userId}`,
    method: 'GET'
  })
}

// ✅ 推荐：使用 function 声明（复杂函数）
function handleUserLogin(loginData) {
  // 复杂的登录逻辑
  if (!loginData.code) {
    throw new Error('登录凭证不能为空')
  }

  return this.requestLogin(loginData)
    .then(result => this.saveUserInfo(result))
    .catch(error => this.handleLoginError(error))
}

// ✅ 推荐：异步函数使用 async/await
async function fetchUserData(userId) {
  try {
    const response = await wx.request({
      url: `${API_BASE_URL}/users/${userId}`,
      method: 'GET'
    })
    return response.data
  } catch (error) {
    console.error('获取用户数据失败:', error)
    throw error
  }
}
```

#### 对象和数组

```javascript
// ✅ 推荐：对象属性简写
const userId = 123
const userName = 'zhangsan'
const userInfo = {
  userId,
  userName,
  isActive: true
}

// ✅ 推荐：使用解构赋值
const { userId, userName } = userInfo
const [firstItem, secondItem] = dataList

// ✅ 推荐：使用扩展运算符
const newUserInfo = {
  ...userInfo,
  lastLoginTime: new Date()
}

const newDataList = [...dataList, newItem]

// ✅ 推荐：数组方法链式调用
const activeUsers = users
  .filter(user => user.isActive)
  .map(user => ({
    id: user.id,
    name: user.name
  }))
  .sort((a, b) => a.name.localeCompare(b.name))
```

### 2. 命名规范

#### 变量和函数命名

```javascript
// ✅ 推荐：使用驼峰命名法
const userInfo = {}
const isUserLoggedIn = false
const getUserList = () => {}
const handleButtonClick = () => {}

// ✅ 推荐：常量使用大写字母和下划线
const API_BASE_URL = 'https://api.campus-mall.com'
const MAX_RETRY_COUNT = 3
const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin'
}

// ✅ 推荐：布尔值使用 is/has/can 前缀
const isLoading = false
const hasPermission = true
const canEdit = false

// ✅ 推荐：事件处理函数使用 handle/on 前缀
const handleSubmit = () => {}
const onUserLogin = () => {}
const handleFormChange = () => {}
```

#### 文件和目录命名

```text
// ✅ 推荐：页面文件使用 kebab-case
pages/
├── user-profile/
│   ├── user-profile.js
│   ├── user-profile.wxml
│   ├── user-profile.wxss
│   └── user-profile.json
├── product-list/
└── order-detail/

// ✅ 推荐：组件文件使用 kebab-case
components/
├── user-card/
│   ├── user-card.js
│   ├── user-card.wxml
│   ├── user-card.wxss
│   └── user-card.json
├── product-item/
└── loading-spinner/

// ✅ 推荐：工具文件使用 camelCase
utils/
├── apiRequest.js
├── dateFormatter.js
├── storageManager.js
└── validationHelper.js
```

### 3. 注释规范

#### 文件头注释

```javascript
/**
 * 用户信息管理工具类
 * @description 提供用户信息的获取、更新、缓存等功能
 * @author 开发团队
 * @since 2024-01-15
 * @version 1.0.0
 */

/**
 * @fileoverview 商品列表页面
 * @description 展示商品列表，支持搜索、筛选、分页等功能
 * @requires ../../../utils/apiRequest.js
 * @requires ../../../components/product-item/product-item.js
 */
```

#### 函数注释

```javascript
/**
 * 获取用户信息
 * @description 根据用户ID获取用户详细信息，包含缓存机制
 * @param {number} userId - 用户ID
 * @param {boolean} [useCache=true] - 是否使用缓存
 * @returns {Promise<Object>} 用户信息对象
 * @throws {Error} 当用户ID无效时抛出错误
 * @example
 * const userInfo = await getUserInfo(123)
 * console.log(userInfo.name)
 */
async function getUserInfo(userId, useCache = true) {
  if (!userId || typeof userId !== 'number') {
    throw new Error('用户ID必须是有效的数字')
  }

  // 检查缓存
  if (useCache) {
    const cachedInfo = this.getCachedUserInfo(userId)
    if (cachedInfo) {
      return cachedInfo
    }
  }

  // 从服务器获取
  const response = await wx.request({
    url: `${API_BASE_URL}/users/${userId}`,
    method: 'GET'
  })

  // 缓存结果
  if (useCache && response.data) {
    this.setCachedUserInfo(userId, response.data)
  }

  return response.data
}
```

#### 复杂逻辑注释

```javascript
function calculateOrderTotal(orderItems, discountRules) {
  // 计算商品小计
  let subtotal = 0
  orderItems.forEach(item => {
    subtotal += item.price * item.quantity
  })

  // 应用折扣规则
  let discount = 0
  discountRules.forEach(rule => {
    switch (rule.type) {
      case 'percentage':
        // 百分比折扣：满足条件时按比例减免
        if (subtotal >= rule.minAmount) {
          discount += subtotal * (rule.value / 100)
        }
        break
      case 'fixed':
        // 固定金额折扣：满足条件时减免固定金额
        if (subtotal >= rule.minAmount) {
          discount += rule.value
        }
        break
    }
  })

  // 确保折扣不超过小计金额
  discount = Math.min(discount, subtotal)

  return {
    subtotal,
    discount,
    total: subtotal - discount
  }
}
```

### 4. 错误处理规范

```javascript
// ✅ 推荐：统一的错误处理
class ApiError extends Error {
  constructor(message, code, data) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.data = data
  }
}

// ✅ 推荐：API请求错误处理
async function apiRequest(url, options = {}) {
  try {
    const response = await wx.request({
      url,
      ...options,
      header: {
        'Content-Type': 'application/json',
        ...options.header
      }
    })

    // 检查业务错误
    if (response.data.code !== 200) {
      throw new ApiError(
        response.data.message || '请求失败',
        response.data.code,
        response.data.data
      )
    }

    return response.data.data
  } catch (error) {
    // 网络错误处理
    if (error.errMsg) {
      throw new ApiError('网络请求失败', 'NETWORK_ERROR', error)
    }

    // 重新抛出业务错误
    throw error
  }
}

// ✅ 推荐：页面级错误处理
Page({
  data: {
    loading: false,
    error: null
  },

  async onLoad() {
    try {
      this.setData({ loading: true, error: null })
      const data = await this.loadPageData()
      this.setData({ data })
    } catch (error) {
      console.error('页面加载失败:', error)
      this.setData({
        error: {
          message: error.message || '页面加载失败',
          code: error.code
        }
      })

      // 显示错误提示
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  }
})
```

## WXML 编码规范

### 1. 基础语法规范

#### 标签和属性

```xml
<!-- ✅ 推荐：标签名使用小写，属性使用 kebab-case -->
<view class="user-card" data-user-id="{{userId}}">
  <image class="user-avatar" src="{{userInfo.avatar}}" mode="aspectFill" />
  <text class="user-name">{{userInfo.name}}</text>
</view>

<!-- ❌ 避免：大写标签名或驼峰属性名 -->
<View className="userCard" dataUserId="{{userId}}">
  <Image class="userAvatar" src="{{userInfo.avatar}}" />
</View>

<!-- ✅ 推荐：自闭合标签使用简写形式 -->
<image src="{{imageUrl}}" />
<input placeholder="请输入用户名" />

<!-- ❌ 避免：自闭合标签使用完整形式 -->
<image src="{{imageUrl}}"></image>
<input placeholder="请输入用户名"></input>
```

#### 属性顺序

```xml
<!-- ✅ 推荐：按照重要性排序属性 -->
<button
  type="primary"
  size="default"
  class="submit-btn"
  disabled="{{isSubmitting}}"
  bindtap="handleSubmit"
  data-form-id="{{formId}}"
>
  提交
</button>

<!-- 属性顺序建议：
1. type, size 等基础属性
2. class, style 样式属性
3. disabled, hidden 等状态属性
4. bind* 事件绑定
5. data-* 数据属性
-->
```

#### 条件渲染和列表渲染

```xml
<!-- ✅ 推荐：条件渲染使用 wx:if -->
<view wx:if="{{userInfo}}" class="user-info">
  <text>{{userInfo.name}}</text>
</view>
<view wx:else class="login-prompt">
  <text>请先登录</text>
</view>

<!-- ✅ 推荐：列表渲染使用有意义的 key -->
<view
  wx:for="{{productList}}"
  wx:key="id"
  wx:for-item="product"
  wx:for-index="index"
  class="product-item"
  data-product-id="{{product.id}}"
  bindtap="handleProductTap"
>
  <image src="{{product.image}}" class="product-image" />
  <text class="product-name">{{product.name}}</text>
  <text class="product-price">¥{{product.price}}</text>
</view>

<!-- ✅ 推荐：复杂条件使用计算属性 -->
<view wx:if="{{showUserActions}}" class="user-actions">
  <button bindtap="handleEdit">编辑</button>
  <button bindtap="handleDelete">删除</button>
</view>
```

### 2. 组件使用规范

#### 自定义组件

```xml
<!-- ✅ 推荐：组件名使用 kebab-case -->
<user-card
  user-info="{{userInfo}}"
  show-actions="{{true}}"
  bind:edit="handleUserEdit"
  bind:delete="handleUserDelete"
/>

<product-list
  products="{{products}}"
  loading="{{loading}}"
  bind:loadmore="handleLoadMore"
  bind:itemtap="handleProductTap"
/>

<!-- ✅ 推荐：组件属性传递明确 -->
<order-item
  order="{{order}}"
  show-status="{{true}}"
  editable="{{order.status === 'pending'}}"
  bind:statuschange="handleOrderStatusChange"
/>
```

#### 插槽使用

```xml
<!-- ✅ 推荐：具名插槽使用语义化名称 -->
<modal title="确认删除" show="{{showDeleteModal}}">
  <view slot="content">
    <text>确定要删除这个商品吗？此操作不可撤销。</text>
  </view>
  <view slot="footer">
    <button bindtap="handleCancelDelete">取消</button>
    <button type="warn" bindtap="handleConfirmDelete">删除</button>
  </view>
</modal>
```

### 3. 代码组织规范

#### 模板结构

```xml
<!-- ✅ 推荐：清晰的模板结构 -->
<!-- 页面容器 -->
<view class="page-container">
  <!-- 导航栏 -->
  <view class="navbar" wx:if="{{showNavbar}}">
    <text class="navbar-title">{{pageTitle}}</text>
  </view>

  <!-- 主要内容 -->
  <view class="main-content">
    <!-- 加载状态 -->
    <loading-spinner wx:if="{{loading}}" />

    <!-- 错误状态 -->
    <error-message wx:elif="{{error}}" message="{{error.message}}" />

    <!-- 正常内容 -->
    <view wx:else class="content-wrapper">
      <!-- 用户信息区域 -->
      <view class="user-section">
        <user-card user-info="{{userInfo}}" />
      </view>

      <!-- 商品列表区域 -->
      <view class="product-section">
        <product-list products="{{products}}" />
      </view>
    </view>
  </view>

  <!-- 底部操作栏 -->
  <view class="bottom-actions" wx:if="{{showActions}}">
    <button class="action-btn" bindtap="handleSave">保存</button>
    <button class="action-btn primary" bindtap="handleSubmit">提交</button>
  </view>
</view>
```

## WXSS 编码规范

### 1. 基础语法规范

#### 选择器命名

```css
/* ✅ 推荐：使用 BEM 命名方法 */
.user-card {
  padding: 20rpx;
  background: #fff;
}

.user-card__avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
}

.user-card__name {
  font-size: 32rpx;
  color: #333;
}

.user-card__name--highlighted {
  color: #007aff;
  font-weight: bold;
}

.user-card--compact {
  padding: 10rpx;
}

/* ✅ 推荐：页面级样式使用页面前缀 */
.user-profile-page {
  background: #f5f5f5;
}

.user-profile-page .header {
  background: #fff;
  padding: 20rpx;
}

/* ✅ 推荐：组件样式使用组件前缀 */
.product-item {
  display: flex;
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.product-item__image {
  width: 120rpx;
  height: 120rpx;
  margin-right: 20rpx;
}
```

#### 属性顺序

```css
/* ✅ 推荐：按照逻辑分组排列属性 */
.product-card {
  /* 定位 */
  position: relative;
  top: 0;
  left: 0;
  z-index: 1;

  /* 盒模型 */
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  padding: 20rpx;
  margin: 10rpx 0;
  border: 1rpx solid #eee;
  border-radius: 8rpx;

  /* 背景和颜色 */
  background: #fff;
  color: #333;

  /* 文字 */
  font-size: 28rpx;
  line-height: 1.5;
  text-align: left;

  /* 其他 */
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
```

### 2. 响应式设计

#### 尺寸单位

```css
/* ✅ 推荐：使用 rpx 单位适配不同屏幕 */
.container {
  width: 750rpx; /* 设计稿宽度 */
  padding: 20rpx;
  margin: 0 auto;
}

.text-large {
  font-size: 36rpx; /* 大号文字 */
}

.text-normal {
  font-size: 28rpx; /* 正常文字 */
}

.text-small {
  font-size: 24rpx; /* 小号文字 */
}

/* ✅ 推荐：固定尺寸使用 px */
.border-line {
  border: 1px solid #eee; /* 1px 边框在所有设备上都是 1 物理像素 */
}

.icon-small {
  width: 16px;
  height: 16px;
}
```

#### 布局适配

```css
/* ✅ 推荐：使用 Flexbox 布局 */
.flex-container {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.flex-item {
  flex: 1;
  min-width: 0; /* 防止内容溢出 */
}

.flex-item--fixed {
  flex: 0 0 auto;
  width: 120rpx;
}

/* ✅ 推荐：响应式网格布局 */
.grid-container {
  display: flex;
  flex-wrap: wrap;
  margin: -10rpx;
}

.grid-item {
  width: calc(50% - 20rpx);
  margin: 10rpx;
  box-sizing: border-box;
}

.grid-item--third {
  width: calc(33.333% - 20rpx);
}

.grid-item--quarter {
  width: calc(25% - 20rpx);
}
```

### 3. 主题和变量

#### CSS 变量定义

```css
/* ✅ 推荐：定义全局 CSS 变量 */
page {
  /* 主色调 */
  --primary-color: #007aff;
  --primary-color-light: #4da6ff;
  --primary-color-dark: #0056cc;

  /* 辅助色 */
  --success-color: #28a745;
  --warning-color: #ffc107;
  --danger-color: #dc3545;
  --info-color: #17a2b8;

  /* 中性色 */
  --text-color-primary: #333333;
  --text-color-secondary: #666666;
  --text-color-placeholder: #999999;
  --text-color-disabled: #cccccc;

  /* 背景色 */
  --bg-color-page: #f5f5f5;
  --bg-color-card: #ffffff;
  --bg-color-mask: rgba(0, 0, 0, 0.5);

  /* 边框色 */
  --border-color-light: #eeeeee;
  --border-color-normal: #dddddd;
  --border-color-dark: #cccccc;

  /* 间距 */
  --spacing-xs: 10rpx;
  --spacing-sm: 20rpx;
  --spacing-md: 30rpx;
  --spacing-lg: 40rpx;
  --spacing-xl: 60rpx;

  /* 字体大小 */
  --font-size-xs: 20rpx;
  --font-size-sm: 24rpx;
  --font-size-md: 28rpx;
  --font-size-lg: 32rpx;
  --font-size-xl: 36rpx;
  --font-size-xxl: 40rpx;

  /* 圆角 */
  --border-radius-sm: 4rpx;
  --border-radius-md: 8rpx;
  --border-radius-lg: 12rpx;
  --border-radius-xl: 20rpx;

  /* 阴影 */
  --shadow-sm: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}
```

#### 变量使用

```css
/* ✅ 推荐：使用 CSS 变量 */
.button {
  background: var(--primary-color);
  color: #fff;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  box-shadow: var(--shadow-sm);
}

.button:active {
  background: var(--primary-color-dark);
}

.card {
  background: var(--bg-color-card);
  border: 1rpx solid var(--border-color-light);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  box-shadow: var(--shadow-md);
}

.text-primary {
  color: var(--text-color-primary);
  font-size: var(--font-size-md);
}

.text-secondary {
  color: var(--text-color-secondary);
  font-size: var(--font-size-sm);
}
```

## 代码质量工具配置

### 1. ESLint 配置

#### 安装和基础配置

```bash
# 安装 ESLint 和相关插件
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 初始化 ESLint 配置
npx eslint --init
```

#### .eslintrc.js 配置文件

```javascript
// .eslintrc.js
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  globals: {
    // 微信小程序全局变量
    wx: 'readonly',
    App: 'readonly',
    Page: 'readonly',
    Component: 'readonly',
    Behavior: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly'
  },
  rules: {
    // 基础规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'error',
    'no-undef': 'error',

    // 代码风格
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never'],
    'comma-dangle': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],

    // 最佳实践
    'eqeqeq': ['error', 'always'],
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-self-compare': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-unused-expressions': 'error',
    'no-useless-call': 'error',
    'no-useless-concat': 'error',
    'no-void': 'error',
    'radix': 'error',
    'wrap-iife': ['error', 'inside'],
    'yoda': 'error',

    // ES6+ 规则
    'arrow-spacing': 'error',
    'constructor-super': 'error',
    'no-class-assign': 'error',
    'no-const-assign': 'error',
    'no-dupe-class-members': 'error',
    'no-duplicate-imports': 'error',
    'no-new-symbol': 'error',
    'no-this-before-super': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-constructor': 'error',
    'no-useless-rename': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-const': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'prefer-template': 'error',
    'rest-spread-spacing': 'error',
    'template-curly-spacing': 'error'
  }
}
```

#### .eslintignore 配置

```text
# .eslintignore
node_modules/
dist/
build/
*.min.js
```

### 2. Prettier 配置

#### 安装 Prettier

```bash
# 安装 Prettier
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier
```

#### .prettierrc 配置文件

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "htmlWhitespaceSensitivity": "ignore",
  "overrides": [
    {
      "files": "*.wxml",
      "options": {
        "parser": "html",
        "printWidth": 120
      }
    },
    {
      "files": "*.wxss",
      "options": {
        "parser": "css"
      }
    }
  ]
}
```

#### .prettierignore 配置

```text
# .prettierignore
node_modules/
dist/
build/
*.min.js
*.min.css
```

### 3. Git Hooks 配置

#### 安装 Husky 和 lint-staged

```bash
# 安装 Husky 和 lint-staged
npm install --save-dev husky lint-staged

# 初始化 Husky
npx husky install

# 添加 pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

#### package.json 配置

```json
{
  "scripts": {
    "lint": "eslint . --ext .js",
    "lint:fix": "eslint . --ext .js --fix",
    "format": "prettier --write .",
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.js": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{wxml,wxss,json}": [
      "prettier --write"
    ]
  }
}
```

### 4. VS Code 配置

#### .vscode/settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "typescript"
  ],
  "files.associations": {
    "*.wxml": "html",
    "*.wxss": "css"
  },
  "emmet.includeLanguages": {
    "wxml": "html"
  },
  "prettier.requireConfig": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[wxml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[wxss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

#### .vscode/extensions.json

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-ceintl.vscode-language-pack-zh-hans",
    "johnsoncodehk.volar"
  ]
}
```

## 性能优化规范

### 1. 代码分割和懒加载

```javascript
// ✅ 推荐：页面级代码分割
// pages/product-list/product-list.js
Page({
  data: {
    products: [],
    loading: false
  },

  onLoad() {
    // 延迟加载非关键功能
    this.loadCriticalData()

    setTimeout(() => {
      this.loadNonCriticalData()
    }, 100)
  },

  async loadCriticalData() {
    // 加载关键数据
    const products = await this.getProductList()
    this.setData({ products })
  },

  async loadNonCriticalData() {
    // 加载非关键数据（如推荐商品、广告等）
    const recommendations = await this.getRecommendations()
    this.setData({ recommendations })
  }
})

// ✅ 推荐：组件懒加载
Component({
  data: {
    componentReady: false
  },

  lifetimes: {
    attached() {
      // 延迟初始化组件
      wx.nextTick(() => {
        this.initComponent()
      })
    }
  },

  methods: {
    initComponent() {
      // 组件初始化逻辑
      this.setData({ componentReady: true })
    }
  }
})
```

### 2. 数据优化

```javascript
// ✅ 推荐：数据分页加载
Page({
  data: {
    productList: [],
    hasMore: true,
    loading: false,
    page: 1,
    pageSize: 20
  },

  async loadMore() {
    if (this.data.loading || !this.data.hasMore) return

    this.setData({ loading: true })

    try {
      const response = await this.getProductList({
        page: this.data.page,
        pageSize: this.data.pageSize
      })

      const newProducts = response.data
      const hasMore = newProducts.length === this.data.pageSize

      this.setData({
        productList: [...this.data.productList, ...newProducts],
        page: this.data.page + 1,
        hasMore
      })
    } catch (error) {
      console.error('加载更多失败:', error)
    } finally {
      this.setData({ loading: false })
    }
  }
})

// ✅ 推荐：数据缓存策略
const DataCache = {
  cache: new Map(),

  set(key, data, ttl = 5 * 60 * 1000) { // 默认5分钟过期
    const expireTime = Date.now() + ttl
    this.cache.set(key, { data, expireTime })
  },

  get(key) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.expireTime) {
      this.cache.delete(key)
      return null
    }

    return item.data
  },

  clear() {
    this.cache.clear()
  }
}
```

### 3. 图片优化

```javascript
// ✅ 推荐：图片懒加载组件
Component({
  properties: {
    src: String,
    width: Number,
    height: Number,
    lazy: {
      type: Boolean,
      value: true
    }
  },

  data: {
    loaded: false,
    inView: false
  },

  lifetimes: {
    attached() {
      if (this.properties.lazy) {
        this.createIntersectionObserver()
      } else {
        this.loadImage()
      }
    }
  },

  methods: {
    createIntersectionObserver() {
      const observer = this.createIntersectionObserver({
        rootMargin: '50px'
      })

      observer.relativeToViewport().observe('.lazy-image', (res) => {
        if (res.intersectionRatio > 0) {
          this.loadImage()
          observer.disconnect()
        }
      })
    },

    loadImage() {
      this.setData({
        loaded: true,
        inView: true
      })
    },

    onImageLoad() {
      this.triggerEvent('load')
    },

    onImageError() {
      this.triggerEvent('error')
      // 显示默认图片
      this.setData({
        src: '/images/default-image.png'
      })
    }
  }
})
```

## 安全编码规范

### 1. 数据验证和过滤

```javascript
// ✅ 推荐：输入数据验证
const Validator = {
  // 验证用户输入
  validateUserInput(input, rules) {
    const errors = []

    for (const [field, rule] of Object.entries(rules)) {
      const value = input[field]

      // 必填验证
      if (rule.required && (!value || value.trim() === '')) {
        errors.push(`${field}不能为空`)
        continue
      }

      // 类型验证
      if (value && rule.type) {
        if (rule.type === 'email' && !this.isValidEmail(value)) {
          errors.push(`${field}格式不正确`)
        }
        if (rule.type === 'phone' && !this.isValidPhone(value)) {
          errors.push(`${field}格式不正确`)
        }
      }

      // 长度验证
      if (value && rule.maxLength && value.length > rule.maxLength) {
        errors.push(`${field}长度不能超过${rule.maxLength}个字符`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  isValidPhone(phone) {
    const phoneRegex = /^1[3-9]\d{9}$/
    return phoneRegex.test(phone)
  },

  // XSS 防护
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return text.replace(/[&<>"']/g, m => map[m])
  }
}

// 使用示例
const userInput = {
  name: '张三',
  email: 'zhangsan@example.com',
  phone: '13800138000'
}

const rules = {
  name: { required: true, maxLength: 50 },
  email: { required: true, type: 'email' },
  phone: { required: true, type: 'phone' }
}

const validation = Validator.validateUserInput(userInput, rules)
if (!validation.isValid) {
  console.error('验证失败:', validation.errors)
}
```

### 2. 敏感信息处理

```javascript
// ✅ 推荐：敏感信息脱敏
const DataMasker = {
  // 手机号脱敏
  maskPhone(phone) {
    if (!phone || phone.length !== 11) return phone
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  },

  // 身份证号脱敏
  maskIdCard(idCard) {
    if (!idCard || idCard.length < 8) return idCard
    return idCard.replace(/(\d{4})\d+(\d{4})/, '$1****$2')
  },

  // 银行卡号脱敏
  maskBankCard(cardNumber) {
    if (!cardNumber || cardNumber.length < 8) return cardNumber
    return cardNumber.replace(/(\d{4})\d+(\d{4})/, '$1****$2')
  }
}

// ✅ 推荐：本地存储加密
const SecureStorage = {
  // 简单加密（生产环境建议使用更强的加密算法）
  encrypt(data, key = 'campus-mall-key') {
    try {
      const jsonString = JSON.stringify(data)
      // 这里使用简单的Base64编码，实际项目中应使用AES等加密算法
      return btoa(unescape(encodeURIComponent(jsonString)))
    } catch (error) {
      console.error('加密失败:', error)
      return null
    }
  },

  decrypt(encryptedData, key = 'campus-mall-key') {
    try {
      const jsonString = decodeURIComponent(escape(atob(encryptedData)))
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('解密失败:', error)
      return null
    }
  },

  setItem(key, value) {
    const encryptedValue = this.encrypt(value)
    if (encryptedValue) {
      wx.setStorageSync(key, encryptedValue)
    }
  },

  getItem(key) {
    const encryptedValue = wx.getStorageSync(key)
    return encryptedValue ? this.decrypt(encryptedValue) : null
  }
}
```

### 3. API 安全调用

```javascript
// ✅ 推荐：安全的API请求
const ApiSecurity = {
  // 生成请求签名
  generateSignature(params, secret) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')

    // 简化的签名算法，实际项目中使用HMAC-SHA256
    return btoa(sortedParams + secret)
  },

  // 安全的API请求
  async secureRequest(url, options = {}) {
    const timestamp = Date.now()
    const nonce = Math.random().toString(36).substr(2, 15)

    // 添加安全头
    const headers = {
      'Content-Type': 'application/json',
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
      ...options.headers
    }

    // 生成签名
    const signParams = {
      timestamp,
      nonce,
      ...options.data
    }

    headers['X-Signature'] = this.generateSignature(signParams, 'your-secret-key')

    try {
      const response = await wx.request({
        url,
        method: options.method || 'GET',
        data: options.data,
        header: headers,
        timeout: options.timeout || 10000
      })

      // 验证响应
      if (response.statusCode !== 200) {
        throw new Error(`HTTP ${response.statusCode}: ${response.data?.message || '请求失败'}`)
      }

      return response.data
    } catch (error) {
      console.error('API请求失败:', error)
      throw error
    }
  }
}
```

## 最佳实践总结

### 1. 代码组织最佳实践

```javascript
// ✅ 推荐：模块化组织
// utils/index.js - 统一导出工具函数
export { default as apiRequest } from './apiRequest'
export { default as dateFormatter } from './dateFormatter'
export { default as storageManager } from './storageManager'
export { default as validator } from './validator'

// pages/product-list/product-list.js - 页面逻辑清晰分离
import { apiRequest, dateFormatter } from '../../utils/index'

Page({
  // 数据定义
  data: {
    products: [],
    loading: false,
    error: null
  },

  // 生命周期
  onLoad(options) {
    this.initPage(options)
  },

  onShow() {
    this.refreshData()
  },

  // 初始化方法
  async initPage(options) {
    try {
      await this.loadInitialData(options)
    } catch (error) {
      this.handleError(error)
    }
  },

  // 数据加载方法
  async loadInitialData(options) {
    this.setData({ loading: true })
    const products = await apiRequest.getProductList(options)
    this.setData({ products, loading: false })
  },

  // 事件处理方法
  handleProductTap(event) {
    const { productId } = event.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${productId}`
    })
  },

  // 错误处理方法
  handleError(error) {
    console.error('页面错误:', error)
    this.setData({
      error: error.message || '页面加载失败',
      loading: false
    })
  }
})
```

### 2. 性能优化最佳实践

```javascript
// ✅ 推荐：防抖和节流
const Utils = {
  // 防抖函数
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // 节流函数
  throttle(func, limit) {
    let inThrottle
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args)
        inThrottle = true
        setTimeout(() => inThrottle = false, limit)
      }
    }
  }
}

// 使用示例
Page({
  onLoad() {
    // 搜索防抖
    this.debouncedSearch = Utils.debounce(this.performSearch, 300)

    // 滚动节流
    this.throttledScroll = Utils.throttle(this.handleScroll, 100)
  },

  onSearchInput(event) {
    const { value } = event.detail
    this.debouncedSearch(value)
  },

  onPageScroll(event) {
    this.throttledScroll(event)
  }
})
```

### 3. 错误处理最佳实践

```javascript
// ✅ 推荐：全局错误处理
// app.js
App({
  onError(error) {
    console.error('全局错误:', error)

    // 错误上报
    this.reportError(error)

    // 用户提示
    wx.showToast({
      title: '程序出现异常',
      icon: 'none'
    })
  },

  reportError(error) {
    // 发送错误信息到服务器
    wx.request({
      url: 'https://api.campus-mall.com/api/v1/errors',
      method: 'POST',
      data: {
        error: error.toString(),
        stack: error.stack,
        userAgent: wx.getSystemInfoSync(),
        timestamp: Date.now()
      }
    })
  }
})

// ✅ 推荐：Promise 错误处理
const handleAsyncOperation = async () => {
  try {
    const result = await someAsyncOperation()
    return { success: true, data: result }
  } catch (error) {
    console.error('异步操作失败:', error)
    return { success: false, error: error.message }
  }
}
```

## 代码审查检查清单

### 提交前自检清单

- [ ] **代码格式化**
  - [ ] 代码已通过 Prettier 格式化
  - [ ] 代码已通过 ESLint 检查
  - [ ] 没有 console.log 和 debugger 语句

- [ ] **命名规范**
  - [ ] 变量和函数使用驼峰命名法
  - [ ] 常量使用大写字母和下划线
  - [ ] 文件和目录使用 kebab-case

- [ ] **代码质量**
  - [ ] 函数职责单一，长度适中（< 50行）
  - [ ] 避免深层嵌套（< 4层）
  - [ ] 复杂逻辑有注释说明

- [ ] **性能考虑**
  - [ ] 避免在循环中进行复杂计算
  - [ ] 合理使用缓存机制
  - [ ] 图片使用懒加载

- [ ] **安全检查**
  - [ ] 用户输入已验证和过滤
  - [ ] 敏感信息已脱敏处理
  - [ ] API 调用包含必要的安全头

- [ ] **错误处理**
  - [ ] 异步操作有错误处理
  - [ ] 用户友好的错误提示
  - [ ] 关键错误有日志记录

### 代码审查要点

1. **功能正确性**: 代码是否实现了预期功能
2. **代码可读性**: 代码是否易于理解和维护
3. **性能影响**: 代码是否会影响应用性能
4. **安全风险**: 代码是否存在安全漏洞
5. **测试覆盖**: 关键功能是否有测试覆盖

## 总结

### 编码规范要点

1. **一致性优先**: 团队内保持统一的编码风格
2. **可读性重要**: 代码应该自解释，减少注释依赖
3. **性能考虑**: 遵循小程序性能最佳实践
4. **安全意识**: 始终考虑数据安全和用户隐私
5. **工具辅助**: 使用自动化工具保证代码质量

### 持续改进

- 定期更新编码规范，适应技术发展
- 收集团队反馈，优化开发体验
- 关注微信小程序官方更新，及时调整规范
- 通过代码审查分享最佳实践

---

*文档版本: v1.0*
*最后更新: 2025年5月*
*维护人员: 开发团队*
