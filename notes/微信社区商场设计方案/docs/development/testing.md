# 测试指南

## 概述

本文档详细描述了微信社区商场小程序的完整测试策略，包括单元测试、集成测试、端到端测试的实施方案、测试工具配置、测试用例编写规范和质量标准。

**测试架构**:
- **前端测试**: 微信小程序原生测试框架
- **云函数测试**: Jest + Node.js 测试环境
- **数据库测试**: MongoDB 内存数据库
- **集成测试**: 微信开发者工具自动化测试

## 测试策略

### 测试金字塔

```text
                    /\
                   /  \
                  /E2E \     端到端测试 (少量)
                 /______\    - 关键用户流程
                /        \   - 跨页面交互
               /Integration\ 集成测试 (适量)
              /__________\  - API 集成
             /            \ - 组件集成
            /   Unit Test  \ 单元测试 (大量)
           /________________\ - 工具函数
                              - 组件逻辑
                              - 业务逻辑
```

### 测试覆盖率目标

| 测试类型 | 覆盖率目标 | 重点关注 |
|----------|------------|----------|
| 单元测试 | ≥ 80% | 工具函数、业务逻辑、组件方法 |
| 集成测试 | ≥ 60% | API 调用、组件交互、数据流 |
| 端到端测试 | ≥ 40% | 关键业务流程、用户路径 |

## 单元测试

### 1. Jest 配置

#### 安装测试依赖

```bash
# 安装 Jest 和相关依赖
npm install --save-dev jest @babel/preset-env babel-jest
npm install --save-dev @testing-library/jest-dom
npm install --save-dev jest-environment-jsdom

# 安装微信小程序测试工具
npm install --save-dev miniprogram-simulate
```

#### Jest 配置文件

```javascript
// jest.config.js
module.exports = {
  // 测试环境
  testEnvironment: 'jsdom',

  // 测试文件匹配模式
  testMatch: [
    '<rootDir>/test/**/*.test.js',
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.test.js'
  ],

  // 模块路径映射
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1'
  },

  // 设置文件
  setupFilesAfterEnv: ['<rootDir>/test/setup.js'],

  // 覆盖率配置
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/app.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  // 转换配置
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // 模拟文件
  moduleFileExtensions: ['js', 'json'],

  // 全局变量
  globals: {
    wx: {},
    App: jest.fn(),
    Page: jest.fn(),
    Component: jest.fn(),
    getApp: jest.fn(),
    getCurrentPages: jest.fn()
  }
}
```

#### 测试环境设置

```javascript
// test/setup.js
import '@testing-library/jest-dom'

// 模拟微信小程序 API
global.wx = {
  request: jest.fn(),
  showToast: jest.fn(),
  showModal: jest.fn(),
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  switchTab: jest.fn(),
  setStorageSync: jest.fn(),
  getStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  login: jest.fn(),
  getUserInfo: jest.fn(),
  getSystemInfo: jest.fn(),
  getSystemInfoSync: jest.fn().mockReturnValue({
    platform: 'devtools',
    system: 'iOS 14.0',
    version: '8.0.5',
    screenWidth: 375,
    screenHeight: 812
  })
}

// 模拟 console 方法
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}

// 每个测试前重置模拟
beforeEach(() => {
  jest.clearAllMocks()
})
```

### 2. 工具函数测试

#### 日期格式化工具测试

```javascript
// test/utils/dateFormatter.test.js
import DateFormatter from '@utils/dateFormatter'

describe('DateFormatter', () => {
  describe('formatDate', () => {
    test('应该正确格式化日期', () => {
      const date = new Date('2024-01-15T10:30:00')
      const result = DateFormatter.formatDate(date, 'YYYY-MM-DD')
      expect(result).toBe('2024-01-15')
    })

    test('应该处理无效日期', () => {
      const result = DateFormatter.formatDate(null, 'YYYY-MM-DD')
      expect(result).toBe('')
    })

    test('应该支持自定义格式', () => {
      const date = new Date('2024-01-15T10:30:00')
      const result = DateFormatter.formatDate(date, 'MM/DD/YYYY HH:mm')
      expect(result).toBe('01/15/2024 10:30')
    })
  })

  describe('getRelativeTime', () => {
    test('应该返回相对时间', () => {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)

      const result = DateFormatter.getRelativeTime(oneHourAgo)
      expect(result).toBe('1小时前')
    })

    test('应该处理未来时间', () => {
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)

      const result = DateFormatter.getRelativeTime(oneHourLater)
      expect(result).toBe('1小时后')
    })
  })
})
```

#### API 请求工具测试

```javascript
// test/utils/apiRequest.test.js
import ApiRequest from '@utils/apiRequest'

describe('ApiRequest', () => {
  beforeEach(() => {
    wx.request.mockClear()
  })

  describe('get', () => {
    test('应该发送 GET 请求', async () => {
      const mockResponse = {
        statusCode: 200,
        data: { code: 200, data: { id: 1, name: '测试' } }
      }
      wx.request.mockResolvedValue(mockResponse)

      const result = await ApiRequest.get('/api/test')

      expect(wx.request).toHaveBeenCalledWith({
        url: 'https://api.campus-mall.com/api/test',
        method: 'GET',
        header: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
      expect(result).toEqual({ id: 1, name: '测试' })
    })

    test('应该处理网络错误', async () => {
      wx.request.mockRejectedValue(new Error('网络错误'))

      await expect(ApiRequest.get('/api/test')).rejects.toThrow('网络错误')
    })

    test('应该处理业务错误', async () => {
      const mockResponse = {
        statusCode: 200,
        data: { code: 400, message: '参数错误' }
      }
      wx.request.mockResolvedValue(mockResponse)

      await expect(ApiRequest.get('/api/test')).rejects.toThrow('参数错误')
    })
  })

  describe('post', () => {
    test('应该发送 POST 请求', async () => {
      const mockResponse = {
        statusCode: 200,
        data: { code: 200, data: { success: true } }
      }
      wx.request.mockResolvedValue(mockResponse)

      const postData = { name: '测试', value: 123 }
      const result = await ApiRequest.post('/api/test', postData)

      expect(wx.request).toHaveBeenCalledWith({
        url: 'https://api.campus-mall.com/api/test',
        method: 'POST',
        data: postData,
        header: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      })
      expect(result).toEqual({ success: true })
    })
  })
})
```

### 3. 组件测试

#### 用户卡片组件测试

```javascript
// test/components/user-card.test.js
import simulate from 'miniprogram-simulate'

describe('UserCard Component', () => {
  let component

  beforeEach(() => {
    component = simulate.render({
      usingComponents: {
        'user-card': '/components/user-card/user-card'
      },
      template: `
        <user-card
          user-info="{{userInfo}}"
          show-actions="{{showActions}}"
          bind:edit="handleEdit"
          bind:delete="handleDelete"
        />
      `,
      data: {
        userInfo: {
          id: 1,
          name: '张三',
          avatar: 'https://example.com/avatar.jpg',
          role: 'student'
        },
        showActions: true
      },
      methods: {
        handleEdit: jest.fn(),
        handleDelete: jest.fn()
      }
    })
  })

  afterEach(() => {
    component.detach()
  })

  test('应该正确渲染用户信息', () => {
    const userCard = component.querySelector('user-card')
    expect(userCard).toBeTruthy()

    // 检查用户名显示
    const nameElement = userCard.querySelector('.user-name')
    expect(nameElement.textContent).toBe('张三')

    // 检查头像
    const avatarElement = userCard.querySelector('.user-avatar')
    expect(avatarElement.getAttribute('src')).toBe('https://example.com/avatar.jpg')
  })

  test('应该根据 showActions 属性显示/隐藏操作按钮', () => {
    let userCard = component.querySelector('user-card')
    let actionsElement = userCard.querySelector('.user-actions')
    expect(actionsElement).toBeTruthy()

    // 隐藏操作按钮
    component.setData({ showActions: false })
    actionsElement = userCard.querySelector('.user-actions')
    expect(actionsElement).toBeFalsy()
  })

  test('应该触发编辑事件', () => {
    const userCard = component.querySelector('user-card')
    const editButton = userCard.querySelector('.edit-btn')

    editButton.dispatchEvent('tap')

    expect(component.instance.handleEdit).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { userId: 1 }
      })
    )
  })

  test('应该触发删除事件', () => {
    const userCard = component.querySelector('user-card')
    const deleteButton = userCard.querySelector('.delete-btn')

    deleteButton.dispatchEvent('tap')

    expect(component.instance.handleDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { userId: 1 }
      })
    )
  })
})
```

### 4. 页面逻辑测试

```javascript
// test/pages/product-list.test.js
import ProductListPage from '@/pages/product-list/product-list'

// 模拟页面实例
const createPageInstance = (data = {}) => {
  const page = {
    data: {
      products: [],
      loading: false,
      error: null,
      page: 1,
      hasMore: true,
      ...data
    },
    setData: jest.fn((newData) => {
      Object.assign(page.data, newData)
    }),
    ...ProductListPage
  }
  return page
}

describe('ProductList Page', () => {
  let page

  beforeEach(() => {
    page = createPageInstance()
    wx.request.mockClear()
  })

  describe('onLoad', () => {
    test('应该加载初始数据', async () => {
      const mockProducts = [
        { id: 1, name: '商品1', price: 100 },
        { id: 2, name: '商品2', price: 200 }
      ]

      wx.request.mockResolvedValue({
        statusCode: 200,
        data: { code: 200, data: mockProducts }
      })

      await page.onLoad({ category: 'electronics' })

      expect(page.setData).toHaveBeenCalledWith({
        loading: true
      })
      expect(page.setData).toHaveBeenCalledWith({
        products: mockProducts,
        loading: false
      })
    })

    test('应该处理加载错误', async () => {
      wx.request.mockRejectedValue(new Error('网络错误'))

      await page.onLoad()

      expect(page.setData).toHaveBeenCalledWith({
        error: '网络错误',
        loading: false
      })
    })
  })

  describe('loadMore', () => {
    test('应该加载更多数据', async () => {
      page.data.products = [{ id: 1, name: '商品1' }]
      page.data.page = 1

      const newProducts = [{ id: 2, name: '商品2' }]
      wx.request.mockResolvedValue({
        statusCode: 200,
        data: { code: 200, data: newProducts }
      })

      await page.loadMore()

      expect(page.setData).toHaveBeenCalledWith({
        products: [{ id: 1, name: '商品1' }, { id: 2, name: '商品2' }],
        page: 2,
        hasMore: true
      })
    })

    test('应该在加载中时阻止重复加载', async () => {
      page.data.loading = true

      await page.loadMore()

      expect(wx.request).not.toHaveBeenCalled()
    })
  })
})
```

## 集成测试

### 1. API 集成测试

#### 用户 API 集成测试

```javascript
// test/integration/user-api.test.js
import UserService from '@/services/userService'

describe('User API Integration', () => {
  // 使用真实的测试环境 API
  const TEST_API_BASE = 'https://test-api.campus-mall.com'

  beforeAll(() => {
    // 设置测试环境
    process.env.API_BASE_URL = TEST_API_BASE
  })

  describe('用户登录流程', () => {
    test('应该完成完整的登录流程', async () => {
      // 1. 模拟微信登录获取 code
      const mockCode = 'test_wx_code_123'
      wx.login.mockResolvedValue({ code: mockCode })

      // 2. 调用登录 API
      const loginResult = await UserService.login(mockCode)

      expect(loginResult).toHaveProperty('token')
      expect(loginResult).toHaveProperty('userInfo')
      expect(loginResult.userInfo).toHaveProperty('id')
      expect(loginResult.userInfo).toHaveProperty('nickname')
    })

    test('应该处理登录失败情况', async () => {
      const invalidCode = 'invalid_code'

      await expect(UserService.login(invalidCode)).rejects.toThrow('登录失败')
    })
  })

  describe('用户信息管理', () => {
    let authToken
    let userId

    beforeAll(async () => {
      // 先登录获取 token
      const loginResult = await UserService.login('test_code')
      authToken = loginResult.token
      userId = loginResult.userInfo.id
    })

    test('应该获取用户详细信息', async () => {
      const userInfo = await UserService.getUserInfo(userId, authToken)

      expect(userInfo).toHaveProperty('id', userId)
      expect(userInfo).toHaveProperty('nickname')
      expect(userInfo).toHaveProperty('avatar')
      expect(userInfo).toHaveProperty('role')
    })

    test('应该更新用户信息', async () => {
      const updateData = {
        nickname: '测试用户更新',
        avatar: 'https://example.com/new-avatar.jpg'
      }

      const result = await UserService.updateUserInfo(userId, updateData, authToken)

      expect(result.success).toBe(true)

      // 验证更新结果
      const updatedUserInfo = await UserService.getUserInfo(userId, authToken)
      expect(updatedUserInfo.nickname).toBe(updateData.nickname)
      expect(updatedUserInfo.avatar).toBe(updateData.avatar)
    })
  })
})
```

#### 商品 API 集成测试

```javascript
// test/integration/product-api.test.js
import ProductService from '@/services/productService'

describe('Product API Integration', () => {
  describe('商品列表查询', () => {
    test('应该获取商品列表', async () => {
      const params = {
        page: 1,
        pageSize: 10,
        category: 'electronics'
      }

      const result = await ProductService.getProductList(params)

      expect(result).toHaveProperty('data')
      expect(result).toHaveProperty('total')
      expect(result).toHaveProperty('page')
      expect(result).toHaveProperty('pageSize')
      expect(Array.isArray(result.data)).toBe(true)

      if (result.data.length > 0) {
        const product = result.data[0]
        expect(product).toHaveProperty('id')
        expect(product).toHaveProperty('name')
        expect(product).toHaveProperty('price')
        expect(product).toHaveProperty('images')
      }
    })

    test('应该支持搜索功能', async () => {
      const searchParams = {
        keyword: '手机',
        page: 1,
        pageSize: 5
      }

      const result = await ProductService.searchProducts(searchParams)

      expect(result.data.length).toBeLessThanOrEqual(5)

      // 验证搜索结果相关性
      result.data.forEach(product => {
        expect(
          product.name.includes('手机') ||
          product.description.includes('手机')
        ).toBe(true)
      })
    })
  })

  describe('商品详情查询', () => {
    test('应该获取商品详细信息', async () => {
      // 先获取一个商品 ID
      const listResult = await ProductService.getProductList({ page: 1, pageSize: 1 })
      const productId = listResult.data[0].id

      const productDetail = await ProductService.getProductDetail(productId)

      expect(productDetail).toHaveProperty('id', productId)
      expect(productDetail).toHaveProperty('name')
      expect(productDetail).toHaveProperty('description')
      expect(productDetail).toHaveProperty('price')
      expect(productDetail).toHaveProperty('stock')
      expect(productDetail).toHaveProperty('merchant')
      expect(productDetail).toHaveProperty('specifications')
    })

    test('应该处理不存在的商品', async () => {
      const nonExistentId = 999999

      await expect(ProductService.getProductDetail(nonExistentId))
        .rejects.toThrow('商品不存在')
    })
  })
})
```

### 2. 组件集成测试

#### 商品列表组件集成测试

```javascript
// test/integration/product-list-component.test.js
import simulate from 'miniprogram-simulate'

describe('ProductList Component Integration', () => {
  let component

  beforeEach(() => {
    // 模拟真实的 API 响应
    wx.request.mockImplementation(({ url, success }) => {
      if (url.includes('/api/products')) {
        setTimeout(() => {
          success({
            statusCode: 200,
            data: {
              code: 200,
              data: [
                {
                  id: 1,
                  name: '测试商品1',
                  price: 99.99,
                  image: 'https://example.com/product1.jpg'
                },
                {
                  id: 2,
                  name: '测试商品2',
                  price: 199.99,
                  image: 'https://example.com/product2.jpg'
                }
              ],
              total: 2
            }
          })
        }, 100)
      }
    })

    component = simulate.render({
      usingComponents: {
        'product-list': '/components/product-list/product-list'
      },
      template: `
        <product-list
          category="{{category}}"
          bind:itemtap="handleItemTap"
          bind:loadmore="handleLoadMore"
        />
      `,
      data: {
        category: 'electronics'
      },
      methods: {
        handleItemTap: jest.fn(),
        handleLoadMore: jest.fn()
      }
    })
  })

  afterEach(() => {
    component.detach()
  })

  test('应该加载并显示商品列表', async () => {
    const productList = component.querySelector('product-list')

    // 等待数据加载
    await simulate.sleep(200)

    const productItems = productList.querySelectorAll('.product-item')
    expect(productItems.length).toBe(2)

    // 验证第一个商品
    const firstProduct = productItems[0]
    expect(firstProduct.querySelector('.product-name').textContent).toBe('测试商品1')
    expect(firstProduct.querySelector('.product-price').textContent).toBe('¥99.99')
  })

  test('应该处理商品点击事件', async () => {
    const productList = component.querySelector('product-list')

    await simulate.sleep(200)

    const firstProduct = productList.querySelector('.product-item')
    firstProduct.dispatchEvent('tap')

    expect(component.instance.handleItemTap).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { productId: 1 }
      })
    )
  })
})
```

## 端到端测试

### 1. Puppeteer 配置

#### 安装和配置

```bash
# 安装 Puppeteer
npm install --save-dev puppeteer

# 安装微信开发者工具自动化 SDK
npm install --save-dev miniprogram-automator
```

#### E2E 测试配置

```javascript
// test/e2e/config.js
const automator = require('miniprogram-automator')

const config = {
  // 微信开发者工具路径
  cliPath: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',

  // 项目路径
  projectPath: process.cwd(),

  // 测试配置
  timeout: 30000,

  // 启动选项
  launchOptions: {
    headless: false,
    slowMo: 100
  }
}

module.exports = config
```

### 2. 用户流程测试

#### 用户登录流程测试

```javascript
// test/e2e/user-login.test.js
const automator = require('miniprogram-automator')
const config = require('./config')

describe('用户登录流程 E2E 测试', () => {
  let miniProgram
  let page

  beforeAll(async () => {
    miniProgram = await automator.launch({
      ...config.launchOptions,
      projectPath: config.projectPath
    })

    page = await miniProgram.reLaunch('/pages/login/login')
    await page.waitFor(2000)
  })

  afterAll(async () => {
    await miniProgram.close()
  })

  test('应该完成用户登录流程', async () => {
    // 1. 检查登录页面元素
    const loginButton = await page.$('.login-btn')
    expect(loginButton).toBeTruthy()

    const welcomeText = await page.$('.welcome-text')
    const welcomeContent = await welcomeText.text()
    expect(welcomeContent).toContain('欢迎使用校园社区商场')

    // 2. 点击登录按钮
    await loginButton.tap()

    // 3. 等待登录完成，跳转到首页
    await page.waitFor(3000)
    const currentPath = await miniProgram.currentPage().path
    expect(currentPath).toBe('pages/index/index')

    // 4. 验证用户信息显示
    const userAvatar = await page.$('.user-avatar')
    expect(userAvatar).toBeTruthy()

    const userName = await page.$('.user-name')
    const userNameText = await userName.text()
    expect(userNameText).not.toBe('')
  })

  test('应该处理登录失败情况', async () => {
    // 模拟网络错误
    await page.mockWxMethod('login', {
      errMsg: 'login:fail'
    })

    const loginButton = await page.$('.login-btn')
    await loginButton.tap()

    // 等待错误提示
    await page.waitFor(2000)

    // 验证错误提示显示
    const errorToast = await page.$('.wx-toast')
    expect(errorToast).toBeTruthy()
  })
})
```

#### 商品购买流程测试

```javascript
// test/e2e/product-purchase.test.js
const automator = require('miniprogram-automator')
const config = require('./config')

describe('商品购买流程 E2E 测试', () => {
  let miniProgram
  let page

  beforeAll(async () => {
    miniProgram = await automator.launch({
      ...config.launchOptions,
      projectPath: config.projectPath
    })

    // 先登录
    page = await miniProgram.reLaunch('/pages/login/login')
    await page.waitFor(1000)

    const loginButton = await page.$('.login-btn')
    await loginButton.tap()
    await page.waitFor(2000)
  })

  afterAll(async () => {
    await miniProgram.close()
  })

  test('应该完成完整的购买流程', async () => {
    // 1. 进入商品列表页
    await miniProgram.navigateTo('/pages/product-list/product-list')
    await page.waitFor(2000)

    // 2. 选择第一个商品
    const firstProduct = await page.$('.product-item')
    await firstProduct.tap()
    await page.waitFor(2000)

    // 3. 在商品详情页添加到购物车
    const addToCartButton = await page.$('.add-to-cart-btn')
    await addToCartButton.tap()
    await page.waitFor(1000)

    // 4. 进入购物车
    await miniProgram.navigateTo('/pages/cart/cart')
    await page.waitFor(2000)

    // 验证商品已添加到购物车
    const cartItems = await page.$$('.cart-item')
    expect(cartItems.length).toBeGreaterThan(0)

    // 5. 选择商品并结算
    const selectAllButton = await page.$('.select-all-btn')
    await selectAllButton.tap()

    const checkoutButton = await page.$('.checkout-btn')
    await checkoutButton.tap()
    await page.waitFor(2000)

    // 6. 在订单确认页面提交订单
    const submitOrderButton = await page.$('.submit-order-btn')
    await submitOrderButton.tap()
    await page.waitFor(3000)

    // 7. 验证跳转到支付页面
    const currentPath = await miniProgram.currentPage().path
    expect(currentPath).toBe('pages/payment/payment')

    // 8. 验证订单信息显示
    const orderAmount = await page.$('.order-amount')
    const amountText = await orderAmount.text()
    expect(amountText).toMatch(/¥\d+\.\d{2}/)
  })

  test('应该处理库存不足情况', async () => {
    // 进入一个库存为0的商品详情页
    await miniProgram.navigateTo('/pages/product-detail/product-detail?id=out_of_stock_product')
    await page.waitFor(2000)

    // 验证添加购物车按钮被禁用
    const addToCartButton = await page.$('.add-to-cart-btn')
    const isDisabled = await addToCartButton.attribute('disabled')
    expect(isDisabled).toBeTruthy()

    // 验证库存提示
    const stockText = await page.$('.stock-text')
    const stockContent = await stockText.text()
    expect(stockContent).toContain('库存不足')
  })
})
```

## 性能测试

### 1. 页面性能测试

#### 页面加载性能测试

```javascript
// test/performance/page-load.test.js
const automator = require('miniprogram-automator')
const config = require('../e2e/config')

describe('页面加载性能测试', () => {
  let miniProgram
  let page

  beforeAll(async () => {
    miniProgram = await automator.launch({
      ...config.launchOptions,
      projectPath: config.projectPath
    })
  })

  afterAll(async () => {
    await miniProgram.close()
  })

  test('首页加载时间应该在2秒内', async () => {
    const startTime = Date.now()

    page = await miniProgram.reLaunch('/pages/index/index')
    await page.waitFor('.page-content')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(2000)

    console.log(`首页加载时间: ${loadTime}ms`)
  })

  test('商品列表页加载时间应该在3秒内', async () => {
    const startTime = Date.now()

    page = await miniProgram.navigateTo('/pages/product-list/product-list')
    await page.waitFor('.product-item')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000)

    console.log(`商品列表页加载时间: ${loadTime}ms`)
  })

  test('商品详情页加载时间应该在2.5秒内', async () => {
    const startTime = Date.now()

    page = await miniProgram.navigateTo('/pages/product-detail/product-detail?id=1')
    await page.waitFor('.product-detail')

    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(2500)

    console.log(`商品详情页加载时间: ${loadTime}ms`)
  })
})
```

#### 内存使用测试

```javascript
// test/performance/memory-usage.test.js
const automator = require('miniprogram-automator')
const config = require('../e2e/config')

describe('内存使用测试', () => {
  let miniProgram

  beforeAll(async () => {
    miniProgram = await automator.launch({
      ...config.launchOptions,
      projectPath: config.projectPath
    })
  })

  afterAll(async () => {
    await miniProgram.close()
  })

  test('页面切换不应该造成内存泄漏', async () => {
    const initialMemory = await miniProgram.evaluate(() => {
      return wx.getPerformance().getEntries()
    })

    // 模拟用户在多个页面间切换
    const pages = [
      '/pages/index/index',
      '/pages/product-list/product-list',
      '/pages/user-profile/user-profile',
      '/pages/cart/cart'
    ]

    for (let i = 0; i < 5; i++) {
      for (const pagePath of pages) {
        await miniProgram.navigateTo(pagePath)
        await miniProgram.waitFor(1000)
      }
    }

    const finalMemory = await miniProgram.evaluate(() => {
      return wx.getPerformance().getEntries()
    })

    // 内存增长不应该超过初始内存的50%
    const memoryGrowth = (finalMemory.length - initialMemory.length) / initialMemory.length
    expect(memoryGrowth).toBeLessThan(0.5)

    console.log(`内存增长率: ${(memoryGrowth * 100).toFixed(2)}%`)
  })
})
```

### 2. API 性能测试

#### 接口响应时间测试

```javascript
// test/performance/api-performance.test.js
import ApiRequest from '@utils/apiRequest'

describe('API 性能测试', () => {
  const performanceThresholds = {
    fast: 500,    // 快速接口：500ms
    normal: 1000, // 普通接口：1000ms
    slow: 2000    // 慢接口：2000ms
  }

  test('用户登录接口响应时间', async () => {
    const startTime = Date.now()

    try {
      await ApiRequest.post('/auth/login', {
        code: 'test_code'
      })
    } catch (error) {
      // 忽略业务错误，只测试响应时间
    }

    const responseTime = Date.now() - startTime
    expect(responseTime).toBeLessThan(performanceThresholds.fast)

    console.log(`登录接口响应时间: ${responseTime}ms`)
  })

  test('商品列表接口响应时间', async () => {
    const startTime = Date.now()

    await ApiRequest.get('/products', {
      page: 1,
      pageSize: 20
    })

    const responseTime = Date.now() - startTime
    expect(responseTime).toBeLessThan(performanceThresholds.normal)

    console.log(`商品列表接口响应时间: ${responseTime}ms`)
  })

  test('商品搜索接口响应时间', async () => {
    const startTime = Date.now()

    await ApiRequest.get('/products/search', {
      keyword: '手机',
      page: 1,
      pageSize: 10
    })

    const responseTime = Date.now() - startTime
    expect(responseTime).toBeLessThan(performanceThresholds.normal)

    console.log(`商品搜索接口响应时间: ${responseTime}ms`)
  })

  test('并发请求性能', async () => {
    const concurrentRequests = 10
    const startTime = Date.now()

    const promises = Array.from({ length: concurrentRequests }, () =>
      ApiRequest.get('/products', { page: 1, pageSize: 5 })
    )

    await Promise.all(promises)

    const totalTime = Date.now() - startTime
    const averageTime = totalTime / concurrentRequests

    expect(averageTime).toBeLessThan(performanceThresholds.normal)

    console.log(`${concurrentRequests}个并发请求平均响应时间: ${averageTime.toFixed(2)}ms`)
  })
})
```

## 测试工具和配置

### 1. 测试脚本配置

#### package.json 测试脚本

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=test/unit",
    "test:integration": "jest --testPathPattern=test/integration",
    "test:e2e": "jest --testPathPattern=test/e2e",
    "test:performance": "jest --testPathPattern=test/performance",
    "test:ci": "jest --coverage --watchAll=false --ci",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

### 2. CI/CD 集成

#### GitHub Actions 配置

```yaml
# .github/workflows/test.yml
name: 测试流水线

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [16.x, 18.x]

    steps:
    - name: 检出代码
      uses: actions/checkout@v3

    - name: 设置 Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: 安装依赖
      run: npm ci

    - name: 代码检查
      run: npm run lint

    - name: 单元测试
      run: npm run test:unit

    - name: 集成测试
      run: npm run test:integration

    - name: 生成测试覆盖率报告
      run: npm run test:coverage

    - name: 上传覆盖率报告
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

    - name: 性能测试
      run: npm run test:performance
      if: github.event_name == 'push' && github.ref == 'refs/heads/main'
```

### 3. 测试数据管理

#### 测试数据工厂

```javascript
// test/factories/userFactory.js
export const UserFactory = {
  build: (overrides = {}) => ({
    id: Math.floor(Math.random() * 10000),
    nickname: '测试用户',
    avatar: 'https://example.com/avatar.jpg',
    role: 'student',
    phone: '13800138000',
    email: 'test@example.com',
    college: '计算机学院',
    major: '软件工程',
    grade: '2023',
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  buildList: (count, overrides = {}) => {
    return Array.from({ length: count }, (_, index) =>
      UserFactory.build({ id: index + 1, ...overrides })
    )
  },

  buildStudent: (overrides = {}) => {
    return UserFactory.build({
      role: 'student',
      studentId: 'S' + Math.floor(Math.random() * 100000),
      ...overrides
    })
  },

  buildTeacher: (overrides = {}) => {
    return UserFactory.build({
      role: 'teacher',
      teacherId: 'T' + Math.floor(Math.random() * 10000),
      department: '计算机学院',
      ...overrides
    })
  }
}

// test/factories/productFactory.js
export const ProductFactory = {
  build: (overrides = {}) => ({
    id: Math.floor(Math.random() * 10000),
    name: '测试商品',
    description: '这是一个测试商品的描述',
    price: 99.99,
    originalPrice: 129.99,
    stock: 100,
    images: ['https://example.com/product1.jpg'],
    categoryId: 1,
    merchantId: 1,
    rating: 4.5,
    reviewCount: 10,
    soldCount: 50,
    status: 'approved',
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  buildList: (count, overrides = {}) => {
    return Array.from({ length: count }, (_, index) =>
      ProductFactory.build({ id: index + 1, ...overrides })
    )
  },

  buildSecondHand: (overrides = {}) => {
    return ProductFactory.build({
      isSecondHand: true,
      conditionLevel: 'good',
      purchaseDate: '2023-01-01',
      sellReason: '升级换代',
      ...overrides
    })
  }
}
```

#### 测试数据库设置

```javascript
// test/helpers/database.js
import mysql from 'mysql2/promise'

export class TestDatabase {
  constructor() {
    this.connection = null
  }

  async connect() {
    this.connection = await mysql.createConnection({
      host: 'localhost',
      user: 'test_user',
      password: 'test_password',
      database: 'campus_mall_test'
    })
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end()
    }
  }

  async clearTables() {
    const tables = [
      'users', 'products', 'orders', 'order_items',
      'forum_posts', 'forum_comments', 'merchants'
    ]

    for (const table of tables) {
      await this.connection.execute(`DELETE FROM ${table}`)
    }
  }

  async seedData() {
    // 插入测试用户
    await this.connection.execute(`
      INSERT INTO users (id, nickname, role, phone, email) VALUES
      (1, '测试用户1', 'student', '13800138001', 'user1@test.com'),
      (2, '测试用户2', 'teacher', '13800138002', 'user2@test.com'),
      (3, '测试商家', 'merchant', '13800138003', 'merchant@test.com')
    `)

    // 插入测试商品
    await this.connection.execute(`
      INSERT INTO products (id, name, price, stock, merchant_id, status) VALUES
      (1, '测试商品1', 99.99, 100, 3, 'approved'),
      (2, '测试商品2', 199.99, 50, 3, 'approved'),
      (3, '缺货商品', 299.99, 0, 3, 'approved')
    `)
  }
}

// 在测试中使用
let testDb

beforeAll(async () => {
  testDb = new TestDatabase()
  await testDb.connect()
})

afterAll(async () => {
  await testDb.disconnect()
})

beforeEach(async () => {
  await testDb.clearTables()
  await testDb.seedData()
})
```

## 测试最佳实践

### 1. 测试用例编写原则

#### AAA 模式 (Arrange-Act-Assert)

```javascript
// ✅ 推荐：遵循 AAA 模式
describe('UserService', () => {
  test('应该成功更新用户信息', async () => {
    // Arrange - 准备测试数据和环境
    const userId = 1
    const updateData = {
      nickname: '新昵称',
      avatar: 'https://example.com/new-avatar.jpg'
    }
    const mockResponse = {
      statusCode: 200,
      data: { code: 200, data: { success: true } }
    }
    wx.request.mockResolvedValue(mockResponse)

    // Act - 执行被测试的操作
    const result = await UserService.updateUserInfo(userId, updateData)

    // Assert - 验证结果
    expect(result.success).toBe(true)
    expect(wx.request).toHaveBeenCalledWith({
      url: 'https://api.campus-mall.com/api/v1/users/1',
      method: 'PUT',
      data: updateData,
      header: expect.any(Object)
    })
  })
})
```

#### 测试命名规范

```javascript
// ✅ 推荐：描述性的测试名称
describe('商品搜索功能', () => {
  test('当输入有效关键词时应该返回相关商品', async () => {
    // 测试实现
  })

  test('当输入空关键词时应该返回所有商品', async () => {
    // 测试实现
  })

  test('当搜索无结果时应该返回空数组', async () => {
    // 测试实现
  })

  test('当网络错误时应该抛出异常', async () => {
    // 测试实现
  })
})

// ❌ 避免：模糊的测试名称
describe('ProductService', () => {
  test('test search', () => {
    // 不清楚测试什么
  })

  test('should work', () => {
    // 太模糊
  })
})
```

### 2. Mock 和 Stub 最佳实践

#### 合理使用 Mock

```javascript
// ✅ 推荐：只 Mock 外部依赖
describe('OrderService', () => {
  beforeEach(() => {
    // Mock 外部 API 调用
    wx.request.mockClear()

    // Mock 微信支付 API
    wx.requestPayment.mockClear()

    // Mock 本地存储
    wx.getStorageSync.mockClear()
    wx.setStorageSync.mockClear()
  })

  test('应该创建订单并发起支付', async () => {
    // Mock API 响应
    wx.request.mockResolvedValueOnce({
      statusCode: 200,
      data: {
        code: 200,
        data: {
          orderId: 'ORDER123',
          paymentParams: {
            timeStamp: '1234567890',
            nonceStr: 'abc123',
            package: 'prepay_id=wx123',
            signType: 'RSA',
            paySign: 'sign123'
          }
        }
      }
    })

    // Mock 支付成功
    wx.requestPayment.mockResolvedValueOnce({
      errMsg: 'requestPayment:ok'
    })

    const orderData = {
      productId: 1,
      quantity: 2,
      addressId: 1
    }

    const result = await OrderService.createAndPay(orderData)

    expect(result.success).toBe(true)
    expect(result.orderId).toBe('ORDER123')
    expect(wx.requestPayment).toHaveBeenCalledWith({
      timeStamp: '1234567890',
      nonceStr: 'abc123',
      package: 'prepay_id=wx123',
      signType: 'RSA',
      paySign: 'sign123'
    })
  })
})
```

#### 测试数据隔离

```javascript
// ✅ 推荐：每个测试使用独立的数据
describe('购物车功能', () => {
  let cartService

  beforeEach(() => {
    // 每个测试前重置购物车服务
    cartService = new CartService()

    // 清空本地存储
    wx.getStorageSync.mockReturnValue(null)
  })

  test('应该添加商品到购物车', () => {
    const product = ProductFactory.build({ id: 1, name: '测试商品' })

    cartService.addItem(product, 2)

    const cartItems = cartService.getItems()
    expect(cartItems).toHaveLength(1)
    expect(cartItems[0].product.id).toBe(1)
    expect(cartItems[0].quantity).toBe(2)
  })

  test('应该更新购物车商品数量', () => {
    const product = ProductFactory.build({ id: 1, name: '测试商品' })

    cartService.addItem(product, 1)
    cartService.updateQuantity(1, 3)

    const cartItems = cartService.getItems()
    expect(cartItems[0].quantity).toBe(3)
  })
})
```

### 3. 异步测试最佳实践

#### 正确处理异步操作

```javascript
// ✅ 推荐：使用 async/await
describe('异步操作测试', () => {
  test('应该正确处理异步 API 调用', async () => {
    const mockData = { id: 1, name: '测试数据' }
    wx.request.mockResolvedValue({
      statusCode: 200,
      data: { code: 200, data: mockData }
    })

    const result = await ApiService.getData()

    expect(result).toEqual(mockData)
  })

  test('应该正确处理异步错误', async () => {
    wx.request.mockRejectedValue(new Error('网络错误'))

    await expect(ApiService.getData()).rejects.toThrow('网络错误')
  })
})

// ✅ 推荐：测试 Promise 链
test('应该正确处理 Promise 链', async () => {
  wx.request
    .mockResolvedValueOnce({
      statusCode: 200,
      data: { code: 200, data: { userId: 1 } }
    })
    .mockResolvedValueOnce({
      statusCode: 200,
      data: { code: 200, data: { name: '用户名' } }
    })

  const result = await UserService.loginAndGetProfile('test_code')

  expect(result.name).toBe('用户名')
  expect(wx.request).toHaveBeenCalledTimes(2)
})
```

### 4. 测试覆盖率优化

#### 关注重要的覆盖率指标

```javascript
// jest.config.js 覆盖率配置
module.exports = {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/app.js',
    '!src/utils/constants.js', // 常量文件可以排除
    '!**/node_modules/**'
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },

    // 核心业务逻辑要求更高覆盖率
    './src/services/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },

    // 工具函数要求最高覆盖率
    './src/utils/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
}
```

#### 编写有意义的测试

```javascript
// ✅ 推荐：测试边界条件和异常情况
describe('价格计算工具', () => {
  test('应该正确计算正常价格', () => {
    expect(PriceUtils.calculateTotal(100, 0.1)).toBe(110)
  })

  test('应该处理零价格', () => {
    expect(PriceUtils.calculateTotal(0, 0.1)).toBe(0)
  })

  test('应该处理负数价格', () => {
    expect(() => PriceUtils.calculateTotal(-100, 0.1)).toThrow('价格不能为负数')
  })

  test('应该处理无效税率', () => {
    expect(() => PriceUtils.calculateTotal(100, -0.1)).toThrow('税率必须为非负数')
  })

  test('应该处理极大数值', () => {
    const result = PriceUtils.calculateTotal(Number.MAX_SAFE_INTEGER, 0)
    expect(result).toBe(Number.MAX_SAFE_INTEGER)
  })
})
```

### 5. 测试维护和重构

#### 保持测试代码质量

```javascript
// ✅ 推荐：提取公共测试工具
// test/helpers/testUtils.js
export const TestUtils = {
  // 创建模拟的页面实例
  createMockPage: (data = {}, methods = {}) => ({
    data: { ...data },
    setData: jest.fn((newData) => {
      Object.assign(this.data, newData)
    }),
    ...methods
  }),

  // 等待异步操作完成
  waitForAsync: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // 模拟微信 API 响应
  mockWxApiSuccess: (api, data) => {
    wx[api].mockImplementation(({ success }) => {
      setTimeout(() => success(data), 0)
    })
  },

  mockWxApiFail: (api, error) => {
    wx[api].mockImplementation(({ fail }) => {
      setTimeout(() => fail(error), 0)
    })
  }
}

// 在测试中使用
import { TestUtils } from '../helpers/testUtils'

describe('页面测试', () => {
  test('应该处理数据加载', async () => {
    const page = TestUtils.createMockPage({
      loading: false,
      data: []
    })

    TestUtils.mockWxApiSuccess('request', {
      statusCode: 200,
      data: { code: 200, data: [1, 2, 3] }
    })

    await page.loadData()

    expect(page.data.data).toEqual([1, 2, 3])
  })
})
```

## 测试质量标准

### 1. 测试完整性检查清单

- [ ] **功能测试**
  - [ ] 正常流程测试
  - [ ] 边界条件测试
  - [ ] 异常情况测试
  - [ ] 错误处理测试

- [ ] **性能测试**
  - [ ] 响应时间测试
  - [ ] 内存使用测试
  - [ ] 并发处理测试

- [ ] **兼容性测试**
  - [ ] 不同设备测试
  - [ ] 不同微信版本测试
  - [ ] 网络环境测试

- [ ] **安全测试**
  - [ ] 输入验证测试
  - [ ] 权限控制测试
  - [ ] 数据安全测试

### 2. 测试代码质量标准

- **可读性**: 测试代码应该易于理解
- **可维护性**: 测试代码应该易于修改和扩展
- **独立性**: 测试之间不应该相互依赖
- **确定性**: 测试结果应该是可预测的
- **快速性**: 测试执行应该尽可能快

### 3. 持续改进

- 定期审查测试覆盖率报告
- 分析测试失败原因，改进测试策略
- 重构重复的测试代码
- 更新测试用例以适应功能变更
- 收集团队反馈，优化测试流程

## 总结

### 测试策略要点

1. **分层测试**: 单元测试为基础，集成测试为补充，端到端测试覆盖关键流程
2. **测试驱动**: 先写测试，再写实现，确保代码质量
3. **持续集成**: 将测试集成到 CI/CD 流程中，自动化质量保证
4. **性能监控**: 定期进行性能测试，确保应用性能稳定
5. **工具辅助**: 使用合适的测试工具和框架，提高测试效率

### 测试文化建设

- 培养团队的测试意识
- 建立代码审查中的测试检查
- 分享测试最佳实践和经验
- 持续学习新的测试技术和方法
- 将测试质量作为交付标准

---

*文档版本: v1.0*
*最后更新: 2025年5月*
*维护人员: 开发团队*
