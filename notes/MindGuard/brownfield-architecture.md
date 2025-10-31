# MindGuard Brownfield 架构文档

> **项目状态**: 半成品完善增强 | **版本**: v4.0 | **日期**: 2025-10-20
>
> **文档类型**: Brownfield Enhancement Architecture | **维护者**: 哈雷酱大小姐

---

## 📋 目录

1. [项目概述](#项目概述)
2. [技术栈现状](#技术栈现状)
3. [核心模块分析](#核心模块分析)
4. [PRD需求对应关系](#prd需求对应关系)
5. [技术债务和已知问题](#技术债务和已知问题)
6. [集成策略](#集成策略)
7. [开发工作流](#开发工作流)
8. [关键文件映射](#关键文件映射)
9. [实施风险评估](#实施风险评估)

---

## 📖 项目概述

### 项目简介

**MindGuard** 是一个面向高校场景的心理健康支持微信小程序，当前处于**半成品开发状态**，需要从基础架构完善为功能完整的心理健康支持平台。

### 核心功能闭环

项目设计了"情绪打卡 → AI建议 → 任务闭环 → 效果验证"的四阶段循环：

```
情绪记录 → AI分析 → 个性化建议 → 任务执行 → 效果验证 → 情绪记录
```

### 技术架构概览

- **前端**: 微信小程序原生框架 + TDesign UI组件库
- **后端**: 微信云开发 (CloudBase)
- **AI服务**: Dify工作流集成
- **数据库**: NoSQL (微信云数据库)
- **状态**: 前端架构相对完整，云函数待完善

---

## 🔧 技术栈现状

### 核心技术栈

| 类别 | 技术 | 版本 | 状态 | 备注 |
|------|------|------|------|------|
| **小程序框架** | 微信小程序原生 | 3.10.1 | ✅ 完整 | 基础库版本3.10.1 |
| **UI组件库** | TDesign Miniprogram | 1.10.1 | ✅ 完整 | 统一设计语言 |
| **后端服务** | 微信云开发 | - | ⚠️ 部分实现 | 云函数待完善 |
| **AI集成** | Dify工作流 | - | ⚠️ 集成中 | 需要完善编排 |
| **数据库** | 微信云数据库 | - | ✅ 完整 | NoSQL集合设计 |
| **包管理** | npm | - | ✅ 完整 | miniprogram目录 |

### 项目配置信息

- **小程序AppID**: wx3b23ed9a8ff5f5c6
- **云开发环境ID**: cloud1-9gpfk3ie94d8630a
- **项目根目录**: miniprogram/
- **云函数目录**: cloudfunctions/
- **分包策略**: 主包 + 5个普通分包 + 2个独立分包

---

## 🏗️ 核心模块分析

### 1. 情绪打卡系统 (P0优先级)

**当前实现状态**: ⚠️ 基础框架完成，云函数待实现

**关键文件**:
- 前端页面: [`miniprogram/pages/today/index.js`](miniprogram/pages/today/index.js)
- 服务层: [`miniprogram/services/checkins.js`](miniprogram/services/checkins.js)
- 云函数: [`cloudfunctions/checkinRecorder/index.js`](cloudfunctions/checkinRecorder/index.js) **未实现**

**功能特性**:
- ✅ 7种基础情绪类型选择 (平静、喜悦、专注、低落、焦虑、愤怒、倦怠)
- ✅ 1-5级强度调节
- ✅ 标签系统 (校园、室友、家人、学习、运动、朋友、自我)
- ✅ 文字备注功能
- ✅ 心情轮统计基础
- ⚠️ 云函数持久化待实现

**数据模型**:
```javascript
{
  mood: string,           // 情绪类型
  intensity: number,      // 强度 1-5
  tags: string[],         // 标签数组
  note: string,           // 文字备注
  checkin_date: string,   // 打卡日期
  createdAt: string       // 创建时间
}
```

### 2. AI微建议生成系统 (P1优先级)

**当前实现状态**: ⚠️ Mock数据完整，Dify集成待实现

**关键文件**:
- 服务层: [`miniprogram/services/suggestions.js`](miniprogram/services/suggestions.js)
- 云函数: [`cloudfunctions/suggestionOrchestrator/index.js`](cloudfunctions/suggestionOrchestrator/index.js) **未实现**

**功能特性**:
- ✅ Mock数据结构完整
- ✅ 建议分类 (呼吸、社交、睡眠、情绪等)
- ✅ 优先级排序
- ✅ 时长估算
- ⚠️ Dify工作流集成待实现
- ⚠️ 个性化算法待实现

**AI工作流设计**:
```
情绪数据分析 → 上下文理解 → 个性化建议生成 → 优先级排序 → 用户推送
```

### 3. 社区树洞功能 (P0优先级)

**当前实现状态**: ⚠️ 基础架构完成，核心功能待实现

**关键文件**:
- 前端页面: [`miniprogram/pages/treehole/index.js`](miniprogram/pages/treehole/index.js)
- 服务层: [`miniprogram/services/forum.js`](miniprogram/services/forum.js)
- 云函数: [`cloudfunctions/postService/index.js`](cloudfunctions/postService/index.js)
- 内容审核: [`cloudfunctions/treeholeModeration/index.js`](cloudfunctions/treeholeModeration/index.js)

**功能特性**:
- ✅ 风险识别算法基础框架
- ✅ 匿名发布机制
- ✅ 互动功能 (抱抱、评论)
- ✅ 话题分类系统
- ⚠️ 内容审核云函数待实现
- ⚠️ 风险评估待完善

**风险等级系统**:
```javascript
// R1-R4 风险等级
R1: 观察 (0-0.4分)
R2: 关注 (0.4-0.7分)
R3: 警示 (0.7-0.85分)
R4: 升级 (>0.85分)
```

### 4. 任务管理系统 (P2优先级)

**当前实现状态**: ⚠️ 基础功能完整，高级特性待实现

**关键文件**:
- 前端页面: [`miniprogram/pages/tasks/index.js`](miniprogram/pages/tasks/index.js)
- 服务层: [`miniprogram/services/tasks.js`](miniprogram/services/tasks.js)
- 云函数: [`cloudfunctions/taskWorkflow/index.js`](cloudfunctions/taskWorkflow/index.js) **未实现**

**功能特性**:
- ✅ 任务创建和状态管理
- ✅ 从AI建议自动创建任务
- ✅ 任务分类和优先级
- ✅ 进度跟踪
- ⚠️ 任务工作流编排待实现
- ⚠️ 提醒推送待实现

**任务状态流转**:
```
pending → in_progress → completed
   ↓
skipped/expired
```

---

## 🎯 PRD需求对应关系

### Story 1.1: 完善情绪打卡系统 (3点 - 简单) **P0**

**需求**: 完善多情绪类型选择和强度调节，生成心情轮统计

**当前状态**: 前端完整，云函数待实现
**影响文件**:
- `cloudfunctions/checkinRecorder/index.js` - 需要实现
- `miniprogram/services/checkins.js` - 需要适配真实API

**工作量估算**: 2-3天开发 + 1天测试

### Story 1.2: 实现AI微建议生成工作流 (8点 - 复杂) **P1**

**需求**: 集成Dify工作流，生成个性化建议

**当前状态**: Mock完整，Dify集成待实现
**影响文件**:
- `cloudfunctions/suggestionOrchestrator/index.js` - 需要实现Dify集成
- `miniprogram/services/suggestions.js` - 需要完善错误处理

**工作量估算**: 5-7天开发 + 2天测试

### Story 1.3: 完善社区树洞核心功能 (5点 - 中等) **P0**

**需求**: 实现发帖、互动、风险识别、内容审核

**当前状态**: 基础架构完整，核心云函数待实现
**影响文件**:
- `cloudfunctions/postService/index.js` - 需要完善
- `cloudfunctions/treeholeModeration/index.js` - 需要实现风险识别

**工作量估算**: 3-4天开发 + 2天测试

### Story 1.4: 建立任务管理和执行闭环 (4点 - 中等) **P2**

**需求**: 任务创建、跟踪、统计、推送

**当前状态**: 基础功能完整，工作流待实现
**影响文件**:
- `cloudfunctions/taskWorkflow/index.js` - 需要实现任务编排逻辑

**工作量估算**: 2-3天开发 + 1天测试

---

## ⚠️ 技术债务和已知问题

### 关键技术债务

1. **云函数实现不完整** (高风险)
   - 18个云函数中大部分仅返回"Not implemented"
   - 核心业务逻辑 (checkinRecorder, suggestionOrchestrator, taskWorkflow) 待实现
   - 影响: 无法完成完整的功能闭环

2. **AI集成缺失** (高风险)
   - Dify工作流集成仅在规划阶段
   - 情绪分析算法待实现
   - 个性化推荐引擎待开发

3. **数据一致性问题** (中风险)
   - 前端Mock数据与后端数据模型不完全一致
   - 字段映射需要标准化
   - 数据迁移策略待制定

### 性能和扩展性问题

1. **分包加载性能**
   - 分包加载错误处理不完善
   - 网络异常时用户体验待优化

2. **缓存策略缺失**
   - AI建议无本地缓存机制
   - 离线功能支持不完整

### 安全和隐私问题

1. **数据安全**
   - 敏感数据加密存储待实现
   - 用户隐私保护机制待完善

2. **风险内容处理**
   - 高风险内容识别算法待优化
   - 危机干预流程待实现

---

## 🔗 集成策略

### 数据库集成策略

**现有集合结构**:
```
users/           # 用户信息
checkins/        # 情绪打卡记录
journals/        # 日记内容
forum_posts/     # 社区帖子
behavior_tasks/  # 任务数据
suggestions/     # AI建议
ask_sessions/    # AI对话会话
```

**新字段添加策略**:
- 为checkins集合添加emotion_intensity字段
- 为suggestions集合添加personalization_score字段
- 为behavior_tasks集合添加reminder_settings字段

### API集成策略

**统一返回格式**:
```javascript
{
  ok: boolean,        // 成功标识
  data: any,          // 返回数据
  error?: string,     // 错误信息
  code?: number       // 错误代码
}
```

**云函数命名规范**:
- 功能模块 + Recorder (记录类)
- 功能模块 + Orchestrator (编排类)
- 功能模块 + Workflow (工作流类)

### AI服务集成

**Dify工作流设计**:
```
1. 情绪分析工作流: checkin_data → emotion_analysis → mood_insights
2. 建议生成工作流: mood_insights + user_context → personalized_suggestions
3. 风险评估工作流: content_analysis → risk_score → intervention_strategy
```

---

## 🔄 开发工作流

### 本地开发环境

1. **微信开发者工具配置**
   - 基础库版本: 3.10.1
   - 云开发环境: cloud1-9gpfk3ie94d8630a
   - 不校验合法域名: 开发阶段启用

2. **Mock数据开关**
   ```javascript
   // miniprogram/utils/request.js
   const USE_MOCK = wx.getStorageSync('USE_MOCK') || true;
   ```

3. **调试工具**
   - 微信开发者工具云函数本地调试
   - 网络面板检查API调用
   - 控制台查看详细日志

### 代码规范

**命名规范**:
- 文件: kebab-case (emotion-checkin.js)
- 函数: camelCase (validateEmotionData)
- 数据库字段: snake_case (emotion_intensity)
- 组件: PascalCase (EmotionPicker)

**代码质量要求**:
- 严格模式: `'use strict';`
- 异步处理: 统一使用 `async/await`
- 错误处理: 完整的 try-catch-finally 结构
- 注释规范: JSDoc 格式

### 测试策略

**当前测试状态**: ❌ 无测试覆盖

**建议测试结构**:
```
tests/
├── unit/           # 单元测试
│   ├── services/   # 服务层测试
│   └── utils/      # 工具函数测试
├── integration/    # 集成测试
│   └── api/        # API接口测试
└── e2e/           # 端到端测试
    └── user-journey/ # 用户旅程测试
```

---

## 📁 关键文件映射

### 核心页面文件

| 功能模块 | 页面文件 | 服务文件 | 云函数 | 状态 |
|---------|---------|---------|---------|------|
| **情绪打卡** | [`pages/today/index.js`](miniprogram/pages/today/index.js) | [`services/checkins.js`](miniprogram/services/checkins.js) | [`checkinRecorder`](cloudfunctions/checkinRecorder/index.js) | ⚠️ 云函数待实现 |
| **AI建议** | - | [`services/suggestions.js`](miniprogram/services/suggestions.js) | [`suggestionOrchestrator`](cloudfunctions/suggestionOrchestrator/index.js) | ⚠️ 云函数待实现 |
| **社区树洞** | [`pages/treehole/index.js`](miniprogram/pages/treehole/index.js) | [`services/forum.js`](miniprogram/services/forum.js) | [`postService`](cloudfunctions/postService/index.js) | ⚠️ 部分待实现 |
| **任务管理** | [`pages/tasks/index.js`](miniprogram/pages/tasks/index.js) | [`services/tasks.js`](miniprogram/services/tasks.js) | [`taskWorkflow`](cloudfunctions/taskWorkflow/index.js) | ⚠️ 云函数待实现 |
| **SOS求助** | [`independent/sos/index.js`](miniprogram/independent/sos/index/index.js) | - | [`sosRelay`](cloudfunctions/sosRelay/index.js) | ⚠️ 待实现 |

### 分包结构

```
miniprogram/
├── packages/              # 普通分包
│   ├── community/         # 社区功能 (13个页面)
│   ├── journal/          # 日记功能 (4个页面)
│   ├── profile/          # 个人中心 (9个页面)
│   ├── tasks/            # 任务详情 (1个页面)
│   ├── breath/           # 呼吸练习 (1个页面)
│   └── mindfulness/      # 正念冥想 (1个页面)
└── independent/          # 独立分包
    ├── sos/             # SOS紧急求助 (2个页面)
    └── heartchat/       # 心语精灵 (1个页面)
```

### 工具和配置文件

- **请求工具**: [`miniprogram/utils/request.js`](miniprogram/utils/request.js)
- **遥测工具**: [`miniprogram/utils/telemetry.js`](miniprogram/utils/telemetry.js)
- **页面适配**: [`miniprogram/utils/page-adapter.js`](miniprogram/utils/page-adapter.js)
- **项目配置**: [`project.config.json`](project.config.json)
- **云开发配置**: [`cloudbaserc.json`](cloudbaserc.json)

---

## ⚡ 实施风险评估

### 高风险项

1. **Dify集成风险** (高风险)
   - **风险**: AI服务响应时间和稳定性不可控
   - **缓解**: 实现本地缓存和降级机制
   - **应急预案**: 准备静态建议库作为备选

2. **云函数开发风险** (高风险)
   - **风险**: 核心云函数开发工作量可能被低估
   - **缓解**: 按优先级分阶段实现，先实现MVP
   - **应急预案**: 临时使用Mock数据保证基础功能

3. **数据一致性风险** (中风险)
   - **风险**: 前后端数据格式不一致导致功能异常
   - **缓解**: 建立完整的数据模型文档和转换层
   - **应急预案**: 实现数据迁移和修复工具

### 中风险项

1. **性能风险** (中风险)
   - **风险**: AI功能可能影响整体响应速度
   - **缓解**: 异步处理和智能预加载
   - **监控指标**: 页面加载时间 < 2秒，API响应 < 500ms

2. **用户体验风险** (中风险)
   - **风险**: 功能不完整影响用户留存
   - **缓解**: 渐进式功能发布，及时收集用户反馈
   - **监控指标**: 用户满意度 > 4.0/5.0

### 低风险项

1. **兼容性风险** (低风险)
   - **风险**: 微信小程序平台变更
   - **缓解**: 及时关注平台更新，预留适配时间
   - **监控指标**: 兼容性覆盖98%用户

---

## 📈 成功指标和验收标准

### 技术指标

- **性能**: 页面加载时间 < 2秒，API响应时间 < 500ms
- **稳定性**: 系统可用率 > 99%，错误率 < 0.1%
- **兼容性**: 支持微信7.0+版本，覆盖98%用户

### 业务指标

- **功能完整性**: 所有P0/P1功能正常工作
- **用户体验**: 用户满意度 > 4.0/5.0
- **数据准确性**: 情绪识别准确率 > 85%，AI建议相关性 > 80%

### 质量指标

- **代码覆盖率**: 核心功能测试覆盖率 > 80%
- **安全合规**: 通过隐私合规审查，数据加密率100%
- **文档完整**: 所有API接口文档完整，部署文档齐全

---

## 🛠️ 开发优先级建议

基于PRD需求和技术债务分析，建议按以下优先级进行开发：

### Phase 1: 核心功能实现 (Week 1-2)
1. **完善情绪打卡系统** - 实现checkinRecorder云函数
2. **社区树洞基础功能** - 完善postService云函数
3. **基础风险识别** - 实现treeholeModeration云函数

### Phase 2: AI能力集成 (Week 3-4)
1. **Dify工作流集成** - 实现suggestionOrchestrator云函数
2. **个性化建议算法** - 优化建议生成逻辑
3. **任务工作流** - 实现taskWorkflow云函数

### Phase 3: 完善和优化 (Week 5)
1. **性能优化** - 实现缓存和预加载
2. **测试和文档** - 补充测试覆盖和API文档
3. **发布准备** - 生产环境配置和监控

---

**文档维护**: 本文档需要随开发进展持续更新，建议每次里程碑完成后进行回顾和修订。

**联系方式**: 如有架构相关问题，请联系技术负责人或参考[CLAUDE.md](CLAUDE.md)项目全景文档。

---

> **文档结束** | 下次更新: 根据开发进展持续更新
>
> **注意事项**: 本项目为Brownfield增强，在开发过程中需要特别关注现有功能的兼容性和数据迁移问题。