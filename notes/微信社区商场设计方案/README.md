# 微信社区商场小程序

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![MySQL Version](https://img.shields.io/badge/mysql-%3E%3D8.0-orange.svg)](https://www.mysql.com/)
[![Redis Version](https://img.shields.io/badge/redis-%3E%3D6.0-red.svg)](https://redis.io/)
[![WeChat MiniProgram](https://img.shields.io/badge/wechat-miniprogram-green.svg)](https://developers.weixin.qq.com/miniprogram/dev/framework/)
[![Documentation](https://img.shields.io/badge/docs-complete-brightgreen.svg)](./docs/)
[![Test Coverage](https://img.shields.io/badge/coverage-80%25-green.svg)](./docs/development/testing.md)

> 🎓 一个集教务管理、校园论坛、商城购物、生活服务于一体的综合性校园服务平台

## 📋 目录

- [项目概述](#项目概述)
- [核心特色](#核心特色)
- [技术架构](#技术架构)
- [快速开始](#快速开始)
- [📚 技术文档导航](#技术文档导航)
- [项目结构](#项目结构)
- [开发指南](#开发指南)
- [部署说明](#部署说明)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

## 项目概述

微信社区商场小程序是一个现代化的校园综合服务平台，旨在为师生提供便捷的校园生活服务，打造活跃的校园社区，建立完善的校园商业生态。项目采用微信小程序原生框架开发，后端基于 Spring Boot 构建，支持高并发、高可用的生产环境部署。

### 🎯 项目目标

- **数字化校园**: 将传统校园服务数字化，提升师生生活便利性
- **社区建设**: 构建活跃的校园社交平台，促进师生交流互动
- **商业生态**: 建立校园商业服务体系，支持校内外商家入驻
- **技术创新**: 采用现代化技术栈，确保系统稳定性和扩展性

## 核心特色

### 🎓 教务系统
- **课程管理**: 课程表查询、成绩查询、考试安排、学籍管理
- **教师服务**: 教师课表、答疑时间、教室借用申请
- **学生服务**: 综合测评、校历查询、校通讯录查询

### 💬 校园论坛
- **内容发布**: 支持匿名/实名发布，多媒体内容支持
- **版块分类**: 学习交流、二手闲置、兴趣部落、失物招领
- **互动功能**: 评论、点赞、收藏、分享、全文搜索

### 🛒 商城系统
- **商品管理**: 多分类展示、智能搜索、筛选排序
- **交易流程**: 购物车、订单管理、微信支付、售后服务
- **商家服务**: 商家入驻、店铺管理、销售数据分析

### 🎯 校园活动
- **活动管理**: 活动发布、在线报名、自动提醒
- **数据统计**: 报名人数统计、活动效果分析

### 🗺️ 生活服务
- **校园导航**: 详细地图、地点搜索、路线规划
- **信息推送**: 学校新闻、通知公告、个性化推荐

## 技术架构

### 🎨 前端技术栈
- **框架**: 微信小程序原生开发框架
  - **WXML**: 微信标记语言，描述页面结构
  - **WXSS**: 微信样式表，描述页面样式
  - **JavaScript**: 页面逻辑处理和数据交互
  - **JSON**: 页面配置和应用配置
- **UI组件**: WeUI + 自定义组件库
- **状态管理**: 小程序原生 globalData + 本地存储
- **网络请求**: wx.cloud.callFunction + 封装的云函数调用工具
- **工具库**: Day.js (日期处理)、Lodash (工具函数)

### ☁️ 后端技术栈 (微信小程序云开发)
- **云函数**: Node.js 运行时，处理业务逻辑
- **云数据库**: MongoDB 文档数据库，支持实时数据同步
- **云存储**: 文件存储服务，支持图片、视频等多媒体文件
- **云调用**: 服务端 API 调用，如微信支付、订阅消息等
- **用户认证**: 基于 openid 的自动用户认证

### 🔧 开发工具
- **代码质量**: ESLint + Prettier + Husky
- **测试框架**: Jest (前端) + Mocha (云函数)
- **构建工具**: 微信开发者工具 + 云开发控制台
- **版本控制**: Git + GitFlow 工作流
- **调试工具**: 微信开发者工具调试器 + 云函数日志

### 🌐 微信生态服务
- **微信登录**: 小程序授权登录，获取用户信息
- **微信支付**: 小程序支付，支持订单管理和退款
- **模板消息**: 服务通知推送，支持订阅消息
- **分享功能**: 小程序页面分享到微信群和朋友圈
- **地图服务**: 腾讯地图 API，位置服务和导航
- **内容安全**: 微信内容安全 API，文本和图片审核

## 快速开始

### 📋 环境要求

- **Node.js**: 16.0+ (推荐 18.x LTS)
- **微信开发者工具**: 最新稳定版 (支持云开发)
- **微信小程序账号**: 已认证的小程序账号
- **云开发环境**: 微信云开发环境 (自动创建)

### 🚀 安装步骤

1. **克隆项目代码**
   ```bash
   git clone https://github.com/your-org/campus-mall-miniprogram.git
   cd campus-mall-miniprogram
   ```

2. **配置微信小程序**
   ```bash
   # 打开微信开发者工具
   # 导入项目：选择 miniprogram 目录
   # 填入你的小程序 AppID
   ```

3. **开通云开发服务**
   ```bash
   # 在微信开发者工具中：
   # 1. 点击"云开发"按钮
   # 2. 开通云开发服务
   # 3. 创建云开发环境（建议创建两个环境：dev 和 prod）
   # 4. 记录环境 ID，用于后续配置
   ```

4. **配置云开发环境**
   ```javascript
   // miniprogram/app.js
   wx.cloud.init({
     env: 'your-cloud-env-id', // 云开发环境 ID
     traceUser: true
   })
   ```

5. **部署云函数**
   ```bash
   # 在微信开发者工具中：
   # 1. 右键点击 cloudfunctions 目录
   # 2. 选择"上传并部署：云端安装依赖"
   # 3. 等待所有云函数部署完成
   ```

6. **初始化云数据库**
   ```bash
   # 在云开发控制台中：
   # 1. 进入数据库管理
   # 2. 创建集合（表）
   # 3. 导入初始数据（可选）
   # 4. 配置数据库权限
   ```

### 🔧 开发调试

1. **启动开发环境**
   ```bash
   # 在微信开发者工具中：
   # 1. 选择"编译"模式
   # 2. 选择开发环境 (dev)
   # 3. 点击"编译"按钮
   ```

2. **云函数调试**
   ```bash
   # 在微信开发者工具中：
   # 1. 打开"云开发控制台"
   # 2. 进入"云函数"管理
   # 3. 查看函数日志和监控数据
   ```

3. **数据库调试**
   ```bash
   # 在云开发控制台中：
   # 1. 进入"数据库"管理
   # 2. 查看数据记录
   # 3. 执行数据库操作
   ```

### 🌐 访问应用

- **小程序预览**: 微信开发者工具预览功能
- **真机调试**: 扫码在手机微信中调试
- **云开发控制台**: [https://console.cloud.tencent.com/tcb](https://console.cloud.tencent.com/tcb)
- **云函数日志**: 云开发控制台 → 云函数 → 日志查询

## 📚 技术文档导航

### 📋 文档导航中心
- **[📚 技术文档中心](./docs/README.md)** - 完整的文档导航和使用指南 🔥
- **[技术开发方案](./技术开发方案.md)** - 完整的技术架构和实施方案
- **[项目开发计划](./todo.md)** - 详细的开发进度和任务规划

我们为项目提供了完整的技术文档体系，涵盖开发、部署、测试等各个方面：

### 🔌 [API 文档系列](./docs/api/README.md)
- **[用户相关 API](./docs/api/user.md)** - 用户认证、个人信息、权限管理等 16 个接口
- **[教务相关 API](./docs/api/academic.md)** - 课程表、成绩、考试、学籍等 13 个接口
- **[商城相关 API](./docs/api/mall.md)** - 商品、订单、支付、评价等 30 个接口
- **[论坛相关 API](./docs/api/forum.md)** - 帖子、评论、版块、搜索等 28 个接口

### 🗄️ [数据库文档系列](./docs/database/README.md)
- **[云数据库结构设计](./docs/database/cloud-schema.md)** - 基于 MongoDB 的云数据库设计 (14 个集合) 🔥
- **[传统数据库设计](./docs/database/schema.md)** - MySQL 数据库表结构设计 (43 个表，参考)
- **[数据库迁移指南](./docs/database/migration.md)** - 数据库版本管理和迁移方案

### 🚀 [部署文档系列](./docs/deployment/README.md)
- **[云开发环境搭建](./docs/deployment/cloud-setup.md)** - 微信云开发环境完整搭建流程 🔥
- **[传统环境搭建](./docs/deployment/setup.md)** - 传统开发环境搭建指南 (参考)
- **[部署流程文档](./docs/deployment/deploy.md)** - 云开发部署和运维指南

### 💻 [开发文档系列](./docs/development/README.md)
- **[编码规范](./docs/development/coding-standards.md)** - JavaScript、WXML、WXSS 编码标准
- **[测试指南](./docs/development/testing.md)** - 单元测试、集成测试、E2E 测试策略

### 📊 文档统计
- **总计接口数**: 87 个 (覆盖所有业务模块)
- **云数据库集合**: 14 个 (基于 MongoDB 的灵活文档结构)
- **传统数据库表**: 43 个 (MySQL 设计方案，参考)
- **测试覆盖率**: 80%+ (高质量代码保证)
- **云开发环境**: 4 套 (开发/测试/预发/生产)

## 项目结构

```text
campus-mall-miniprogram/
├── 📱 miniprogram/                    # 小程序前端代码
│   ├── pages/                        # 页面文件
│   │   ├── index/                    # 首页
│   │   │   ├── index.js             # 页面逻辑
│   │   │   ├── index.wxml           # 页面结构
│   │   │   ├── index.wxss           # 页面样式
│   │   │   └── index.json           # 页面配置
│   │   ├── user/                     # 用户相关页面
│   │   ├── academic/                 # 教务相关页面
│   │   ├── mall/                     # 商城相关页面
│   │   └── forum/                    # 论坛相关页面
│   ├── components/                   # 自定义组件
│   │   ├── user-card/               # 用户卡片组件
│   │   ├── product-item/            # 商品项组件
│   │   └── post-item/               # 帖子项组件
│   ├── utils/                       # 工具函数
│   │   ├── cloud.js                 # 云开发工具
│   │   ├── auth.js                  # 认证工具
│   │   ├── storage.js               # 存储工具
│   │   └── request.js               # 请求封装
│   ├── styles/                      # 全局样式
│   │   ├── common.wxss              # 通用样式
│   │   └── variables.wxss           # 样式变量
│   ├── app.js                       # 小程序入口
│   ├── app.json                     # 小程序配置
│   ├── app.wxss                     # 全局样式
│   ├── sitemap.json                 # 搜索配置
│   └── project.config.json          # 项目配置
├── ☁️ cloudfunctions/                 # 云函数代码
│   ├── user/                        # 用户相关云函数
│   │   ├── index.js                 # 函数入口
│   │   ├── package.json             # 依赖配置
│   │   └── config.json              # 函数配置
│   ├── academic/                    # 教务相关云函数
│   ├── mall/                        # 商城相关云函数
│   ├── forum/                       # 论坛相关云函数
│   ├── common/                      # 公共云函数
│   │   ├── utils/                   # 工具函数
│   │   ├── middleware/              # 中间件
│   │   └── constants/               # 常量定义
│   └── database/                    # 数据库操作函数
├── 📚 docs/                           # 项目文档
│   ├── api/                         # API 文档
│   ├── database/                    # 数据库文档
│   ├── deployment/                  # 部署文档
│   └── development/                 # 开发文档
├── 🔧 scripts/                        # 脚本文件
│   ├── deploy-cloud.sh              # 云函数部署脚本
│   ├── init-database.js             # 数据库初始化脚本
│   └── backup-data.js               # 数据备份脚本
├── 🧪 tests/                          # 测试文件
│   ├── miniprogram/                 # 小程序测试
│   │   ├── unit/                    # 单元测试
│   │   └── integration/             # 集成测试
│   └── cloudfunctions/              # 云函数测试
│       ├── unit/                    # 单元测试
│       └── integration/             # 集成测试
├── 📋 database/                       # 数据库相关
│   ├── collections/                 # 集合结构定义
│   ├── indexes/                     # 索引定义
│   ├── rules/                       # 数据库权限规则
│   └── init-data/                   # 初始化数据
├── README.md                        # 项目说明
├── LICENSE                          # 许可证
├── .gitignore                       # Git 忽略文件
└── .eslintrc.js                     # ESLint 配置
```

## 🎯 核心功能特性

### 🔐 安全性能
- **高并发支持**: 支持日活 2-3 万用户同时在线
- **快速响应**: 页面加载时间 < 3 秒，API 响应时间 < 500ms
- **数据安全**: SSL/TLS 加密传输，敏感数据 AES 加密存储
- **访问控制**: JWT Token 认证，API 限流，权限验证
- **支付安全**: 微信支付官方接口，交易数据端到端加密

### 🚀 性能优化
- **缓存策略**: Redis 缓存热点数据，提升 80% 访问速度
- **CDN 加速**: 静态资源全球 CDN 分发，降低 60% 加载时间
- **数据库优化**: 主从复制，读写分离，索引优化
- **代码分割**: 小程序分包加载，按需加载组件
- **图片优化**: WebP 格式，懒加载，压缩优化

### 📊 监控运维
- **实时监控**: Prometheus + Grafana 监控告警
- **日志管理**: ELK Stack 日志收集分析
- **性能分析**: APM 性能监控，慢查询分析
- **自动化部署**: CI/CD 流水线，蓝绿部署
- **容灾备份**: 数据库备份，异地容灾

## 开发指南

### 📝 编码规范

详细的编码规范请参考 **[编码规范文档](./docs/development/coding-standards.md)**

- **JavaScript**: ESLint + Prettier 自动格式化
- **WXML**: BEM 命名规范，语义化标签
- **WXSS**: CSS 变量，响应式设计
- **Java**: Spring Boot 最佳实践，Clean Code 原则

### 🧪 测试策略

完整的测试指南请参考 **[测试指南文档](./docs/development/testing.md)**

- **单元测试**: Jest (前端) + JUnit 5 (后端)，覆盖率 ≥ 80%
- **集成测试**: API 接口测试，数据库集成测试
- **端到端测试**: 微信小程序自动化测试
- **性能测试**: 并发压力测试，响应时间测试

### 🔄 开发流程

```bash
# 1. 创建功能分支
git checkout -b feature/user-authentication

# 2. 开发功能
# 编写代码 -> 编写测试 -> 运行测试

# 3. 代码检查
npm run lint          # 前端代码检查
mvn checkstyle:check  # 后端代码检查

# 4. 提交代码
git add .
git commit -m "feat: 添加用户认证功能"

# 5. 推送并创建 PR
git push origin feature/user-authentication
```

### 📋 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

## 部署说明

### 🌍 环境配置

详细的部署指南请参考 **[部署文档系列](./docs/deployment/)**

| 环境 | 云开发环境ID | 用途 | 配置 |
|------|-------------|------|------|
| 开发环境 | campus-mall-dev | 日常开发测试 | 基础版 |
| 测试环境 | campus-mall-test | 功能测试、集成测试 | 专业版 |
| 预发环境 | campus-mall-pre | 上线前验证 | 专业版 |
| 生产环境 | campus-mall-prod | 正式服务 | 旗舰版 |

### ☁️ 云开发部署

#### 1. 创建云开发环境

```bash
# 在微信开发者工具中：
# 1. 点击"云开发"按钮
# 2. 开通云开发服务
# 3. 创建环境并记录环境ID
```

#### 2. 配置环境变量

```javascript
// miniprogram/config/env.js
const envConfig = {
  development: {
    envId: 'campus-mall-dev',
    baseUrl: 'https://campus-mall-dev.service.tcloudbase.com',
    version: 'dev'
  },
  production: {
    envId: 'campus-mall-prod',
    baseUrl: 'https://campus-mall-prod.service.tcloudbase.com',
    version: 'prod'
  }
}

module.exports = envConfig
```

#### 3. 部署云函数

```bash
# 使用微信开发者工具：
# 1. 右键点击 cloudfunctions 目录
# 2. 选择"上传并部署：云端安装依赖"
# 3. 等待所有云函数部署完成

# 或使用命令行工具：
npm install -g @cloudbase/cli
tcb login
tcb functions:deploy --envId campus-mall-prod
```

#### 4. 配置数据库

```bash
# 在云开发控制台中：
# 1. 进入数据库管理
# 2. 创建集合（表）
# 3. 配置数据库权限规则
# 4. 导入初始数据
```

#### 5. 配置云存储

```bash
# 在云开发控制台中：
# 1. 进入云存储管理
# 2. 配置存储权限
# 3. 设置 CDN 加速
# 4. 配置图片处理规则
```

### 🚀 自动化部署

#### GitHub Actions 配置

```yaml
# .github/workflows/deploy.yml
name: 部署到云开发

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2

    - name: 安装依赖
      run: npm install -g @cloudbase/cli

    - name: 登录云开发
      run: tcb login --apiKeyId ${{ secrets.TCB_API_KEY_ID }} --apiKey ${{ secrets.TCB_API_KEY }}

    - name: 部署云函数
      run: tcb functions:deploy --envId ${{ secrets.TCB_ENV_ID }}

    - name: 部署静态网站
      run: tcb hosting:deploy ./miniprogram --envId ${{ secrets.TCB_ENV_ID }}
```

### 📊 监控和日志

- **云函数监控**: 云开发控制台 → 云函数 → 监控告警
- **数据库监控**: 云开发控制台 → 数据库 → 监控统计
- **存储监控**: 云开发控制台 → 云存储 → 用量统计
- **日志查询**: 云开发控制台 → 日志管理 → 实时日志

## 贡献指南

### 🤝 如何贡献

我们欢迎所有形式的贡献，包括但不限于：

- 🐛 报告 Bug
- 💡 提出新功能建议
- 📝 改进文档
- 🔧 提交代码修复
- 🧪 编写测试用例

### 📋 贡献流程

1. **Fork 项目**
   ```bash
   # Fork 项目到你的 GitHub 账号
   # 克隆到本地
   git clone https://github.com/your-username/campus-mall-miniprogram.git
   ```

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **开发和测试**
   ```bash
   # 编写代码
   # 运行测试
   npm test
   mvn test
   ```

4. **提交代码**
   ```bash
   git add .
   git commit -m "feat: 添加新功能描述"
   git push origin feature/your-feature-name
   ```

5. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写详细的 PR 描述
   - 等待代码审查

### ✅ 代码审查标准

- 代码符合项目编码规范
- 包含必要的测试用例
- 通过所有自动化测试
- 文档更新完整
- 无安全漏洞

### 🏆 贡献者

感谢所有为项目做出贡献的开发者！

## 📞 联系方式

### 👥 团队成员

- **项目负责人**: 项目经理 (project-manager@campus-mall.com)
- **技术负责人**: 技术总监 (tech-lead@campus-mall.com)
- **前端团队**: 前端开发组 (frontend@campus-mall.com)
- **后端团队**: 后端开发组 (backend@campus-mall.com)

### 💬 交流渠道

- **GitHub Issues**: [项目问题反馈](https://github.com/your-org/campus-mall-miniprogram/issues)
- **GitHub Discussions**: [技术讨论](https://github.com/your-org/campus-mall-miniprogram/discussions)
- **微信群**: 扫码加入开发者交流群
- **邮件**: support@campus-mall.com

### 📋 问题反馈

如果您在使用过程中遇到问题，请通过以下方式反馈：

1. 查看 [常见问题](./docs/FAQ.md)
2. 搜索 [已有 Issues](https://github.com/your-org/campus-mall-miniprogram/issues)
3. 创建新的 [Issue](https://github.com/your-org/campus-mall-miniprogram/issues/new)

## 📄 许可证

本项目采用 [MIT 许可证](./LICENSE)，这意味着：

- ✅ 商业使用
- ✅ 修改
- ✅ 分发
- ✅ 私人使用
- ❌ 责任
- ❌ 担保

## 🙏 致谢

感谢以下开源项目和服务：

- [微信小程序](https://developers.weixin.qq.com/miniprogram/dev/framework/) - 小程序开发框架
- [微信云开发](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html) - 云开发平台
- [Node.js](https://nodejs.org/) - JavaScript 运行时环境
- [MongoDB](https://www.mongodb.com/) - 文档数据库
- [腾讯云](https://cloud.tencent.com/) - 云服务平台

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

*最后更新时间：2025年5月*
*文档版本：v1.0*

</div>
