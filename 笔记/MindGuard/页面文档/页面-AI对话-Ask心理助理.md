# 页面：AI对话 - Ask心理助理

## 1. 页面概述

Ask心理助理页面是MindGuard小程序的AI对话界面，提供基于CBT（认知行为疗法）的即时心理支持和对话服务。该页面整合了智能对话、风险评估、CBT技巧应用和真人转介等功能。

### 1.1 页面定位
- **主要功能**: AI心理对话、CBT技巧应用、风险评估与干预
- **所属分包**: independent分包（确保快速访问）
- **访问方式**:
  - 情绪打卡检测到负向情绪时自动弹出
  - 今天Tab页面FAB悬浮按钮
  - 心情随笔连续负向时提醒入口
  - 树洞高风险内容触发时快捷入口
  - 个人中心主动进入

### 1.2 核心价值
- **即时性**: 7x24小时随时可用的心理支持
- **专业性**: 基于CBT的专业心理指导
- **个性化**: 根据用户特点和情绪状态定制对话
- **安全性**: 多级风险评估和危机干预机制
- **连续性**: 支持跨会话的长期心理成长跟踪

## 2. 页面结构

### 2.1 文件结构
```
independent/ask/
├── index.js              # 页面逻辑
├── index.wxml            # 页面结构
├── index.wxss            # 页面样式
├── index.json            # 页面配置
└── components/
    ├── chat-container/     # 对话容器组件
    ├── message-bubble/     # 消息气泡组件
    ├── input-area/         # 输入区域组件
    ├── cbt-cards/          # CBT技巧卡片组件
    ├── risk-assessment/    # 风险评估组件
    ├── resource-panel/     # 资源推荐面板
    ├── quick-actions/      # 快捷操作组件
    └── typing-indicator/   # 输入状态指示器
```

### 2.2 页面组件层级
```
Ask心理助理页面
├── 顶部状态栏
│   ├── 返回按钮
│   ├── 会话类型标识
│   ├── 风险等级指示器
│   └── 紧急求助按钮
├── 对话区域
│   ├── 欢迎消息
│   ├── 消息列表
│   │   ├── 用户消息
│   │   ├── AI回复消息
│   │   ├── CBT技巧卡片
│   │   └── 系统提示消息
│   └── 快捷回复建议
├── 输入区域
│   ├── 文本输入框
│   ├── 语音输入按钮
│   ├── 表情选择按钮
│   └── 发送按钮
├── 底部工具栏
│   ├── 结束对话按钮
│   ├── 对话历史按钮
│   ├── 资源库按钮
│   └── 设置按钮
└── 浮动组件
    ├── 紧急SOS按钮
    ├── CBT练习助手
    └── 辅导员咨询按钮
```

## 3. 核心功能模块

### 3.1 智能对话引擎
**功能描述**: 基于Dify工作流的智能对话系统，支持自然语言理解和多轮对话

**技术实现**:
- 与Dify工作流API集成
- 支持文本、语音、图片多模态输入
- 实时流式响应显示
- 对话上下文记忆管理

**组件映射**:
- `chat-container`: 对话主容器
- `message-bubble`: 消息显示组件
- `typing-indicator`: AI输入状态指示
- `quick-actions`: 快捷操作建议

### 3.2 CBT技巧应用系统
**功能描述**: 集成多种CBT技巧，通过结构化对话引导用户应用认知行为疗法

**支持的CBT技巧**:
- **认知重构**: 识别和挑战非理性信念
- **证据检验**: 客观评估想法的合理性
- **行为激活**: 逐步增加积极行为
- **放松训练**: 焦虑和压力管理技巧
- **问题解决**: 结构化问题解决方法
- **正念练习**: 当下觉察和接受练习

**组件映射**:
- `cbt-cards`: CBT技巧展示卡片
- `cbt-worksheet`: CBT工作表组件
- `progress-tracker`: 技能掌握进度跟踪

### 3.3 风险评估与干预
**功能描述**: 实时风险评估，多级危机干预机制

**风险等级**:
- **L0**: 无风险，常规对话
- **L1**: 一般关注，提供自助资源
- **L2**: 需要关注，推荐CBT练习
- **L3**: 需要干预，建议联系辅导员
- **L4**: 紧急危机，立即转介专业帮助

**干预措施**:
- 自动风险评估和预警
- 个性化资源推荐
- 辅导员一键转介
- 紧急联系信息提供

**组件映射**:
- `risk-assessment`: 风险评估组件
- `resource-panel`: 资源推荐面板
- `emergency-contact`: 紧急联系组件

### 3.4 个性化推荐引擎
**功能描述**: 基于用户历史和当前状态推荐最适合的CBT技巧和资源

**推荐依据**:
- 历史对话内容和效果
- 情绪打卡数据
- CBT应用记录
- 任务完成情况
- 个人偏好和学习风格

**推荐类型**:
- CBT技巧推荐
- 自助练习材料
- 相关任务建议
- 适读文章和视频

## 4. 用户界面设计

### 4.1 对话界面
```
[顶部状态栏]
┌─────────────────────────────────┐
│ ←  Ask心理助理  🔴L2  🆘  │
└─────────────────────────────────┘

[对话区域]
┌─────────────────────────────────┐
│ 💬 你好！我是你的心理助理，最近   │
│ 感觉怎么样？有什么想要聊的吗？   │
│                                 │
│ 🔍 我注意到你提到感到焦虑，这    │
│ 是很多人都有的体验。我们能一起   │
│ 探索一下这种感觉吗？             │
│                                 │
│ [🧠 认知重构练习] [💡 想了解更多] │
│ [😊 感觉还好]    [😞 感觉糟糕]    │
│                                 │
│ 🧠 认知重构技巧                 │
│ ┌─────────────────────────────┐ │
│ │ 识别自动化思维：             │ │
│ │ "我肯定会失败"               │ │
│ │                             │ │
│ │ 挑战证据：                  │ │
│ │ - 上次考试成绩不错          │ │
│ │ - 已经做了充分准备          │ │
│ └─────────────────────────────┘ │
│                                 │
│ 正在输入... ▒▒▒▒▒              │
└─────────────────────────────────┘

[输入区域]
┌─────────────────────────────────┐
│ 🎤 😊 💬 输入你的想法...        │
│ ────────────────────────────── │
│ 📎        📸        ➤         │
└─────────────────────────────────┘

[底部工具栏]
┌─────────────────────────────────┐
│ 🏁 结束  📚 历史  💼 资源  ⚙️ 设置 │
└─────────────────────────────────┘
```

### 4.2 CBT技巧卡片
```html
<!-- 认知重构卡片 -->
<div class="cbt-card cognitive-restructuring">
  <div class="card-header">
    <span class="technique-icon">🧠</span>
    <span class="technique-name">认知重构</span>
    <span class="difficulty">⭐⭐</span>
  </div>
  <div class="card-content">
    <div class="step active">
      <div class="step-title">步骤1：识别自动化思维</div>
      <div class="step-content">
        <div class="thought-label">你的想法：</div>
        <div class="thought-input">我肯定会在面试中失败</div>
      </div>
    </div>
    <div class="step">
      <div class="step-title">步骤2：寻找证据</div>
      <div class="evidence-grid">
        <div class="evidence-for">
          <div class="evidence-title">支持证据</div>
          <div class="evidence-list">
            <div class="evidence-item">以前面试紧张</div>
            <div class="evidence-input">+</div>
          </div>
        </div>
        <div class="evidence-against">
          <div class="evidence-title">反对证据</div>
          <div class="evidence-list">
            <div class="evidence-item">做了充分准备</div>
            <div class="evidence-item">有相关经验</div>
            <div class="evidence-input">+</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="card-actions">
    <button class="btn-secondary">💡 获取提示</button>
    <button class="btn-primary">➡️ 下一步</button>
  </div>
</div>
```

### 4.3 风险评估界面
```html
<!-- 风险评估组件 -->
<div class="risk-assessment l2-warning">
  <div class="risk-header">
    <span class="risk-icon">⚠️</span>
    <span class="risk-level">需要关注</span>
    <span class="risk-score">风险分数：65/100</span>
  </div>
  <div class="risk-content">
    <div class="risk-factors">
      <div class="factor">
        <span class="factor-icon">😔</span>
        <span class="factor-label">情绪低落</span>
        <span class="factor-score">高风险</span>
      </div>
      <div class="factor">
        <span class="factor-icon">🏠</span>
        <span class="factor-label">社交孤立</span>
        <span class="factor-score">中风险</span>
      </div>
      <div class="factor">
        <span class="factor-icon">😴</span>
        <span class="factor-label">睡眠问题</span>
        <span class="factor-score">中风险</span>
      </div>
    </div>
    <div class="risk-recommendations">
      <div class="recommendation-title">建议行动：</div>
      <div class="recommendation-list">
        <div class="recommendation-item">
          <span class="recommendation-icon">🧘</span>
          <span>尝试放松练习</span>
        </div>
        <div class="recommendation-item">
          <span class="recommendation-icon">👥</span>
          <span>联系朋友或家人</span>
        </div>
        <div class="recommendation-item">
          <span class="recommendation-icon">💬</span>
          <span>继续与AI对话</span>
        </div>
      </div>
    </div>
  </div>
  <div class="risk-actions">
    <button class="btn-primary">💡 获取帮助资源</button>
    <button class="btn-secondary">👨‍⚕️ 联系辅导员</button>
  </div>
</div>
```

## 5. 数据流与状态管理

### 5.1 页面状态管理
```javascript
// 页面状态结构
const pageState = {
  // 会话信息
  session: {
    id: 'session_id',
    type: 'cbt_guided',
    riskLevel: 'L2',
    status: 'active',
    startTime: Date.now()
  },

  // 对话状态
  conversation: {
    messages: [],
    isTyping: false,
    context: {},
    quickReplies: []
  },

  // CBT应用状态
  cbtApplication: {
    currentTechnique: null,
    stepProgress: 0,
    worksheetData: {},
    effectivenessTracking: []
  },

  // 用户状态
  userState: {
    currentMood: null,
    riskFactors: [],
    engagementLevel: 'high',
    sessionCount: 0
  },

  // UI状态
  ui: {
    activePanel: 'chat', // chat, resources, history
    showEmergencyButton: true,
    inputMode: 'text', // text, voice
    isProcessing: false
  }
}
```

### 5.2 数据流向
```
用户输入
    ↓
页面状态更新
    ↓
调用Dify API
    ↓
接收流式响应
    ↓
更新消息列表
    ↓
分析风险评估
    ↓
更新UI显示
    ↓
保存对话记录
    ↓
ask_sessions, ask_messages集合更新
```

## 6. 性能优化策略

### 6.1 分包优化
- **独立分包**: Ask页面放入independent分包，确保快速访问
- **资源预加载**: 关键组件和资源提前预加载
- **懒加载**: 非关键组件按需加载

### 6.2 消息列表优化
- **虚拟滚动**: 大量消息时使用虚拟滚动
- **消息分页**: 历史消息分页加载
- **图片懒加载**: 对话中的图片懒加载

### 6.3 缓存策略
- **对话缓存**: 本地缓存当前会话内容
- **资源缓存**: CBT练习资源缓存
- **状态缓存**: 页面状态本地缓存

## 7. 安全与隐私

### 7.1 数据安全
- **传输加密**: 所有API调用使用HTTPS
- **存储加密**: 敏感对话内容加密存储
- **访问控制**: 严格的权限验证机制

### 7.2 隐私保护
- **匿名选项**: 用户可选择匿名对话
- **数据控制**: 用户可删除对话历史
- **透明度**: 明确的数据使用说明

### 7.3 危机处理
- **自动检测**: 实时风险检测和预警
- **快速转介**: 一键联系专业帮助
- **应急预案**: 完整的危机处理流程

## 8. 无障碍访问

### 8.1 语音支持
- **语音输入**: 支持语音转文字输入
- **语音播报**: AI回复支持语音播报
- **语音控制**: 基础操作语音控制

### 8.2 视觉辅助
- **高对比度**: 支持高对比度模式
- **字体缩放**: 支持字体大小调整
- **屏幕阅读**: 适配屏幕阅读器

---

**文档版本**: v1.0.0
**最后更新**: 2025-09-22
**对齐文档**: 功能-Ask心理助理、数据库-AI对话相关集合、UI组件文档