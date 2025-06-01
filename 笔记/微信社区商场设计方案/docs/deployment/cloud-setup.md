# 微信小程序云开发环境搭建指南

## 概述

本文档详细描述了基于微信小程序云开发的校园社区商场小程序开发环境搭建流程，包括微信开发者工具、云开发环境、Node.js 环境、代码质量工具等的安装配置步骤。

**技术架构**:
- **前端**: 微信小程序原生开发
- **后端**: 微信小程序云开发
- **数据库**: MongoDB 云数据库
- **存储**: 云存储
- **部署**: 一键部署到云端

## 系统要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 双核 2.0GHz | 四核 2.5GHz+ |
| 内存 | 8GB | 16GB+ |
| 硬盘 | 30GB 可用空间 | 50GB+ SSD |
| 网络 | 稳定的互联网连接 | 带宽 ≥ 10Mbps |

### 操作系统支持

- **Windows**: Windows 10/11 (64位)
- **macOS**: macOS 10.14+
- **Linux**: Ubuntu 18.04+, CentOS 7+

### 账号要求

- **微信小程序账号**: 已认证的小程序账号 (个人或企业)
- **微信开发者账号**: 用于访问开发者工具和云开发控制台

## 前端开发环境

### 1. 微信开发者工具

#### 下载安装

1. 访问 [微信开发者工具官网](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 根据操作系统下载对应版本
3. 安装并启动开发者工具

#### 配置步骤

```bash
# 1. 使用微信扫码登录
# 2. 创建小程序项目
# 项目名称: 校园社区商场
# 目录: 选择项目根目录
# AppID: 填写小程序AppID
# 开发模式: 小程序
# 后端服务: 微信云开发
# 模板: 不使用模板
```

#### 开发者工具配置

```json
// project.config.json
{
  "description": "校园社区商场小程序",
  "packOptions": {
    "ignore": [
      {
        "type": "file",
        "value": ".eslintrc.js"
      },
      {
        "type": "file",
        "value": ".gitignore"
      },
      {
        "type": "file",
        "value": "README.md"
      }
    ]
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": false,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "your_app_id_here",
  "projectname": "campus-mall",
  "cloudfunctionRoot": "cloudfunctions/",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
```

### 2. Node.js 环境

#### 安装 Node.js

```bash
# 方法1: 官网下载安装
# 访问 https://nodejs.org/
# 下载 LTS 版本 (推荐 v18.x 或 v20.x)

# 方法2: 使用 nvm 管理多版本 (推荐)
# Windows 用户安装 nvm-windows
# macOS/Linux 用户安装 nvm

# 安装最新 LTS 版本
nvm install --lts
nvm use --lts

# 验证安装
node --version  # 应显示 v18.x.x 或更高版本
npm --version   # 应显示 8.x.x 或更高版本
```

#### 配置 npm

```bash
# 设置 npm 镜像源（提高下载速度）
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 安装常用全局工具
npm install -g @cloudbase/cli yarn pnpm

# 验证安装
tcb --version
yarn --version
pnpm --version
```

### 3. 代码编辑器

#### 推荐 Visual Studio Code

```bash
# 下载安装 VS Code
# 访问 https://code.visualstudio.com/

# 安装推荐插件
# 1. 微信小程序开发插件
code --install-extension ms-ceintl.vscode-language-pack-zh-hans
code --install-extension johnsoncodehk.volar

# 2. JavaScript/TypeScript 插件
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next

# 3. 通用开发插件
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode.vscode-markdown
```

#### VS Code 配置

```json
// .vscode/settings.json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "emmet.includeLanguages": {
    "wxml": "html"
  },
  "emmet.triggerExpansionOnTab": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
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

## 云开发环境

### 1. 开通云开发服务

#### 在微信开发者工具中开通

```bash
# 1. 在微信开发者工具中点击"云开发"按钮
# 2. 阅读并同意云开发服务协议
# 3. 选择云开发环境配置:
#    - 环境名称: campus-mall-dev (开发环境)
#    - 环境ID: 系统自动生成
#    - 套餐版本: 基础版 (开发测试) / 专业版 (生产环境)
# 4. 等待环境创建完成 (通常需要1-3分钟)
```

#### 创建多个环境

```bash
# 建议创建以下环境:
# 1. 开发环境: campus-mall-dev (基础版)
# 2. 测试环境: campus-mall-test (基础版)
# 3. 生产环境: campus-mall-prod (专业版或旗舰版)
```

### 2. 配置云开发环境

#### 小程序端配置

```javascript
// miniprogram/app.js
App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'campus-mall-dev', // 开发环境ID
        traceUser: true
      })
    }
  }
})
```

#### 环境配置管理

```javascript
// miniprogram/config/env.js
const envConfig = {
  development: {
    envId: 'campus-mall-dev',
    version: 'dev'
  },
  testing: {
    envId: 'campus-mall-test',
    version: 'test'
  },
  production: {
    envId: 'campus-mall-prod',
    version: 'prod'
  }
}

// 获取当前环境配置
function getCurrentEnv() {
  // 可以通过编译条件或其他方式判断当前环境
  const accountInfo = wx.getAccountInfoSync()
  const envVersion = accountInfo.miniProgram.envVersion

  switch (envVersion) {
    case 'develop':
      return envConfig.development
    case 'trial':
      return envConfig.testing
    case 'release':
      return envConfig.production
    default:
      return envConfig.development
  }
}

module.exports = {
  envConfig,
  getCurrentEnv
}
```

### 3. 云函数开发环境

#### 创建云函数目录结构

```bash
# 在项目根目录创建云函数目录
mkdir cloudfunctions

# 创建云函数子目录
cd cloudfunctions
mkdir user academic mall forum common database

# 每个云函数目录结构
# cloudfunctions/
# ├── user/           # 用户相关云函数
# ├── academic/       # 教务相关云函数
# ├── mall/           # 商城相关云函数
# ├── forum/          # 论坛相关云函数
# ├── common/         # 公共云函数
# └── database/       # 数据库操作云函数
```

#### 初始化云函数

```bash
# 进入云函数目录
cd cloudfunctions/user

# 初始化 package.json
npm init -y

# 安装云函数依赖
npm install --save wx-server-sdk

# 创建入口文件
touch index.js
```

#### 云函数示例代码

```javascript
// cloudfunctions/user/index.js
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV // 使用当前云环境
})

const db = cloud.database()

/**
 * 用户相关云函数
 */
exports.main = async (event, context) => {
  const { action, data } = event
  const { OPENID } = cloud.getWXContext()

  try {
    switch (action) {
      case 'getUserInfo':
        return await getUserInfo(OPENID)
      case 'updateUserInfo':
        return await updateUserInfo(OPENID, data)
      case 'getUserProfile':
        return await getUserProfile(data.userId)
      default:
        return {
          success: false,
          message: '未知操作'
        }
    }
  } catch (error) {
    console.error('云函数执行错误:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * 获取用户信息
 */
async function getUserInfo(openid) {
  const result = await db.collection('users').where({
    openid: openid
  }).get()

  if (result.data.length === 0) {
    return {
      success: false,
      message: '用户不存在'
    }
  }

  return {
    success: true,
    data: result.data[0]
  }
}

/**
 * 更新用户信息
 */
async function updateUserInfo(openid, updateData) {
  const result = await db.collection('users').where({
    openid: openid
  }).update({
    data: {
      ...updateData,
      updateTime: new Date()
    }
  })

  return {
    success: true,
    data: result
  }
}

/**
 * 获取用户档案
 */
async function getUserProfile(userId) {
  const result = await db.collection('users').doc(userId).get()

  if (!result.data) {
    return {
      success: false,
      message: '用户不存在'
    }
  }

  // 过滤敏感信息
  const { openid, phone, ...publicData } = result.data

  return {
    success: true,
    data: publicData
  }
}
```

### 4. 云数据库配置

#### 数据库集合创建

```bash
# 在云开发控制台中创建以下集合:

# 1. 用户相关集合
users                    # 用户信息
user_profiles           # 用户档案
user_settings           # 用户设置

# 2. 教务相关集合
courses                 # 课程信息
schedules              # 课程表
grades                 # 成绩信息
exams                  # 考试安排
teachers               # 教师信息

# 3. 商城相关集合
products               # 商品信息
categories             # 商品分类
orders                 # 订单信息
order_items            # 订单项
merchants              # 商家信息
reviews                # 商品评价

# 4. 论坛相关集合
forum_boards           # 论坛版块
forum_posts            # 帖子信息
forum_comments         # 评论信息
forum_likes            # 点赞记录

# 5. 系统相关集合
system_configs         # 系统配置
announcements          # 公告信息
activities             # 活动信息
```

#### 数据库权限配置

```javascript
// 数据库权限规则示例
// 在云开发控制台 -> 数据库 -> 权限设置中配置

// 用户集合权限规则
{
  "read": "auth.openid == resource.openid",
  "write": "auth.openid == resource.openid"
}

// 商品集合权限规则
{
  "read": true,
  "write": "auth.openid in get('database.merchants.where({openid: auth.openid}).data').map(item => item._id)"
}

// 论坛帖子权限规则
{
  "read": true,
  "write": "auth.openid == resource.authorId || auth.openid in get('database.users.where({openid: auth.openid, role: \"admin\"}).data').map(item => item.openid)"
}
```

#### 数据库索引配置

```javascript
// 在云开发控制台中为以下字段创建索引:

// users 集合
db.collection('users').createIndex({
  "openid": 1
}, {
  unique: true
})

// products 集合
db.collection('products').createIndex({
  "categoryId": 1,
  "status": 1,
  "createTime": -1
})

// forum_posts 集合
db.collection('forum_posts').createIndex({
  "boardId": 1,
  "isTop": -1,
  "createTime": -1
})

// orders 集合
db.collection('orders').createIndex({
  "userId": 1,
  "status": 1,
  "createTime": -1
})
```

### 5. 云存储配置

#### 存储权限配置

```bash
# 在云开发控制台 -> 云存储 -> 权限设置中配置:

# 1. 用户头像目录
# 路径: /avatars/*
# 权限: 仅创建者可读写

# 2. 商品图片目录
# 路径: /products/*
# 权限: 所有用户可读，仅商家可写

# 3. 论坛图片目录
# 路径: /forum/*
# 权限: 所有用户可读，仅作者可写

# 4. 系统图片目录
# 路径: /system/*
# 权限: 所有用户可读，仅管理员可写
```

#### 图片处理配置

```javascript
// 云存储图片处理示例
// miniprogram/utils/storage.js

/**
 * 上传图片到云存储
 */
async function uploadImage(filePath, cloudPath) {
  try {
    const result = await wx.cloud.uploadFile({
      cloudPath: cloudPath,
      filePath: filePath
    })

    return {
      success: true,
      fileID: result.fileID
    }
  } catch (error) {
    console.error('图片上传失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * 获取图片临时链接
 */
async function getTempFileURL(fileID) {
  try {
    const result = await wx.cloud.getTempFileURL({
      fileList: [fileID]
    })

    return {
      success: true,
      tempFileURL: result.fileList[0].tempFileURL
    }
  } catch (error) {
    console.error('获取临时链接失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * 删除云存储文件
 */
async function deleteFile(fileID) {
  try {
    const result = await wx.cloud.deleteFile({
      fileList: [fileID]
    })

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('删除文件失败:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

module.exports = {
  uploadImage,
  getTempFileURL,
  deleteFile
}
```

## 开发工具配置

### 1. ESLint 配置

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
    getCurrentPages: 'readonly',

    // 云开发全局变量
    cloud: 'readonly'
  },
  rules: {
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-unused-vars': 'error',
    'no-undef': 'error',
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'never']
  }
}
```

### 2. Prettier 配置

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
  "endOfLine": "lf"
}
```

### 3. Git 配置

```bash
# 初始化 Git 仓库
git init

# 创建 .gitignore 文件
cat > .gitignore << EOF
# 微信开发者工具
.DS_Store
node_modules/
unpackage/

# 云函数
cloudfunctions/**/node_modules/
cloudfunctions/**/.env

# 日志文件
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 编辑器
.vscode/
.idea/

# 系统文件
Thumbs.db
.DS_Store
EOF

# 配置 Git 用户信息
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 首次提交
git add .
git commit -m "feat: 初始化微信小程序云开发项目"
```

## 环境验证

### 1. 小程序环境验证

```javascript
// miniprogram/pages/index/index.js
Page({
  data: {
    envReady: false,
    envInfo: {}
  },

  onLoad() {
    this.checkEnvironment()
  },

  async checkEnvironment() {
    try {
      // 检查云开发环境
      const envInfo = await wx.cloud.callFunction({
        name: 'common',
        data: {
          action: 'getEnvInfo'
        }
      })

      this.setData({
        envReady: true,
        envInfo: envInfo.result
      })

      wx.showToast({
        title: '环境检查通过',
        icon: 'success'
      })
    } catch (error) {
      console.error('环境检查失败:', error)
      wx.showToast({
        title: '环境检查失败',
        icon: 'none'
      })
    }
  }
})
```

### 2. 云函数环境验证

```javascript
// cloudfunctions/common/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action } = event

  if (action === 'getEnvInfo') {
    return {
      success: true,
      data: {
        env: cloud.DYNAMIC_CURRENT_ENV,
        timestamp: new Date(),
        context: context
      }
    }
  }

  return {
    success: false,
    message: '未知操作'
  }
}
```

## 总结

### 环境搭建检查清单

- [ ] **基础环境**
  - [ ] Node.js 18+ 已安装
  - [ ] 微信开发者工具已安装并登录
  - [ ] VS Code 已安装必要插件

- [ ] **云开发环境**
  - [ ] 云开发服务已开通
  - [ ] 云开发环境已创建 (dev/test/prod)
  - [ ] 云函数目录结构已创建
  - [ ] 数据库集合已创建
  - [ ] 云存储权限已配置

- [ ] **开发工具**
  - [ ] ESLint + Prettier 已配置
  - [ ] Git 仓库已初始化
  - [ ] 环境验证已通过

### 下一步操作

1. **部署云函数**：上传并部署所有云函数
2. **初始化数据库**：创建基础数据和索引
3. **配置权限规则**：设置数据库和存储权限
4. **开始开发**：根据需求文档开始功能开发

---

*文档版本: v1.0*
*最后更新: 2025年5月*
*维护人员: 开发团队*
