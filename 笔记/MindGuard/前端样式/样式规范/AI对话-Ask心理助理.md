# AI对话-Ask心理助理页高保真样式规范

> 页面【AI对话-Ask心理助理 | 路径：miniprogram/independent/ask/index】。参考《docs/页面文档/页面-AI对话-Ask心理助理.md》、《docs/UI组件文档.md》、《docs/前端样式/色彩系统.md》、《docs/分包规划方案.md》、《docs/埋点与数据分析.md》、《docs/测试用例.md》、《docs/数据库/集合-AI对话会话.ask_sessions.md》、《docs/数据库/集合-AI对话消息.ask_messages.md》。本规范严格使用色彩 Token（不得裸色），并在“4.3 颜色映射表”明示 HEX→Token 对照。若后续提供高保真图（svg），以该稿的排版优先微调尺寸但不改变语义与用色。

> 高保真占位图：docs/前端样式/svg/高保真图-Ask心理助理.svg:1

## 1. 设计定位与体验目标
- 页面主任务：提供基于 CBT 的即时心理对话，涵盖对话、技巧引导、风险评估与转介，保障弱网与高风险场景下的稳定与可达。
- 体验关键词：安心可信、连贯反馈、低扰动、清晰分级（L0-L4）。以中性底+品牌信息色组织层级，R3/R4 仅小面积使用，避免二次刺激。
- 视觉策略：
  - 页面基底使用 `--color-ink-0`；主要文字 `--color-ink-800`，次要文字 `--color-ink-600`。
  - 信息/品牌操作使用 Info 系列：按钮与强调 `--color-info-500`；浅背景 `--color-info-50`。
  - CBT 技巧以雾紫系（Lavender）作弱强调：卡底 `--color-lavender-50`、标题 `--color-lavender-500`。
  - 风险用色遵循 R1-R4 色阶，仅用于徽章/条幅/操作主按钮（SOS）。

## 2. 页面结构框架
```
┌──────────────────────────────────────────┐
│ 顶部状态栏：返回 ｜“Ask心理助理”标题｜风险徽章｜SOS │
├──────────────────────────────────────────┤
│ 对话区域（消息流）                        │
│  - AI 气泡（左）/ 用户气泡（右）            │
│  - CBT 技巧卡片（插入式）                   │
│  - 系统提示/弱网/错误提示条                  │
│  - 正在输入指示（typing）                   │
├──────────────────────────────────────────┤
│ 快捷回复建议（Chip 列表，横向可滚动）         │
├──────────────────────────────────────────┤
│ 输入区：语音 ｜ 表情 ｜ 文本输入 ｜ 发送按钮     │
├──────────────────────────────────────────┤
│ 底部工具栏：结束对话｜历史｜资源库｜设置         │
└──────────────────────────────────────────┘
（浮层）SOS 悬浮按钮；风险评估抽屉（上拉）
```

## 3. 模块规格详解
### 3.1 顶部状态栏 <AskTopBar/>
- 容器：高度 88rpx，背景 `--color-white`；底部分隔线 2rpx `--color-ink-100`；左右内边距 24rpx。
- 返回按钮：图标颜色 `--color-ink-700`；触摸面积≥88rpx×88rpx。
- 标题：字号 32rpx/700，颜色 `--color-ink-800`，居中对齐。
- 风险徽章：
  - 胶囊高 48rpx、圆角 1998rpx、水平内边距 16rpx。
  - R1 背景 `--color-info-50` 文本 `--color-info-600`；
  - R2 背景 `--color-warning-50` 文本 `--color-warning-600`；
  - R3 背景 `--color-risk-r3` 文本 `--color-white`；
  - R4 背景 `--color-risk-r4` 文本 `--color-white`（小面积）。
- SOS 按钮：实心主按钮，背景 `--color-risk-r4`，文字 `--color-white`，圆角 16rpx；按下叠加 8% 黑色蒙层。

### 3.2 对话容器与消息气泡 <ChatContainer/> <MessageBubble/>
- 容器：
  - 背景 `--color-ink-0`；上下留白 16rpx；与输入区之间留 8rpx。
  - 消息区左右内边距 24rpx；消息间垂直间距 16rpx；列表可虚拟滚动。
- AI 气泡（左）：
  - 文字 `--color-ink-800`，背景 `--color-white`，描边 2rpx `--color-ink-100`；
  - 圆角 24rpx（左上 8rpx/右上 24rpx/右下 24rpx/左下 24rpx）；
  - 最大宽度 78% 容器宽；内边距 20rpx 24rpx。
- 用户气泡（右）：
  - 文字 `--color-ink-800`；背景 `--color-info-50`；
  - 圆角 24rpx（右上 8rpx/左上 24rpx/左下 24rpx/右下 24rpx）；
  - 最大宽度 78%；内边距 20rpx 24rpx。
- 元信息：时间戳与发送状态放于气泡下方，字号 22rpx，颜色 `--color-ink-500`。
- 附件：图片缩略图圆角 12rpx；音频条采用 `--color-ink-100` 背景与 `--color-info-500` 进度条。

### 3.3 CBT 技巧卡片 <CBTCards/>
- 容器：背景 `--color-lavender-50`，描边 2rpx `--color-ink-100`，圆角 20rpx；内边距 24rpx；宽度对齐消息气泡最大宽。
- 标题/步骤名：字号 28rpx/600，颜色 `--color-lavender-500`；正文 26rpx，颜色 `--color-ink-700`；
- 操作区：
  - 主按钮背景 `--color-info-500`（文字 `--color-white`）；
  - 次按钮描边 `--color-info-300` 文本 `--color-info-600`；
  - 按钮高度 56rpx，圆角 12rpx，间距 16rpx。
- 有效性标识：进行中步骤使用 `--color-info-50` 局部底色；完成步骤打勾 `--color-success-500`。

### 3.4 快捷回复 <QuickActions/>
- 布局：横向滚动 Chip，单个高度 56rpx、圆角 999rpx、左右内边距 20rpx、项间距 12rpx。
- 默认：文本 `--color-ink-700`，边框 2rpx `--color-ink-200`，背景 `--color-white`。
- 选中/按下：背景 `--color-info-50`；文本 `--color-info-600`；边框 `--color-info-300`。
- 禁用：文本 `--color-ink-400`；边框 `--color-ink-100`；背景保持 `--color-white`。

### 3.5 输入区 <InputArea/>
- 容器：固定贴底；背景 `--color-white`；顶部分隔线 2rpx `--color-ink-100`；内边距 12rpx 16rpx；适配底部安全区。
- 输入框：
  - 高度 88rpx，圆角 16rpx；背景 `--color-ink-50`；边框 2rpx `--color-ink-100`；
  - 占位符 `--color-ink-500`；正文 `--color-ink-800`；
  - 聚焦：边框升级为 `--color-info-500`，投影 0 8rpx 20rpx rgba(58,123,213,0.10)。
- 图标按钮：大小 48rpx；默认 `--color-ink-600`；按下 `--color-ink-700`；禁用 `--color-ink-300`。
- 发送按钮：
  - 实心：背景 `--color-info-500`；禁用时背景 `--color-info-200`；
  - 圆角 16rpx；左右最小宽度 104rpx；文字 `--color-white`。

### 3.6 风险评估与提示 <RiskAssessment/> <SystemBanner/>
- 风险条幅：高度 80rpx，圆角 16rpx，左右留白 24rpx；风险等级来源 `ask_sessions.final_risk_level`（未出结论时回退 `initial_risk_level`）：
  - L1：背景 `--color-info-50` 文本 `--color-info-600`；
  - L2：背景 `--color-warning-50` 文本 `--color-warning-600`；
  - L3：背景 `--color-risk-r3` 文本 `--color-white`；
  - L4：背景 `--color-risk-r4` 文本 `--color-white`（仅提示/转介按钮）。
- 系统提示（弱网/错误/离线）：
  - 弱网：条幅背景 `--color-warning-50` 文本 `--color-warning-600`，含重试按钮（次按钮样式）。
  - 错误：条幅背景 `--color-danger-50` 文本 `--color-danger-600`，含“重试”。
  - 离线：条幅背景 `--color-ink-100` 文本 `--color-ink-700`，说明“已离线保存，恢复后发送”。

### 3.7 底部工具栏 <BottomToolbar/>
- 容器：高度 96rpx，背景 `--color-white`；图标默认 `--color-ink-600`，激活 `--color-info-500`。
- 分隔：上边 2rpx `--color-ink-100`。
- 结束对话：危险操作需二次确认弹窗；确认按钮 `--color-danger-500`。

### 3.8 输入中指示 <TypingIndicator/>
- 形态：三点跳动；点大小 8rpx；间距 6rpx；
- 颜色：主点 `--color-info-500`，次点 `--color-info-300`；
- 动画：300ms 交错淡入上浮，晚安模式降速 1.25×。

## 4. 色彩与排版基准
### 4.1 关键 Token 使用
- 页面/卡面：`--color-ink-0`（基底）、`--color-white`（局部面板）、描边 `--color-ink-100/200`。
- 文字：主 `--color-ink-800`，次 `--color-ink-600`，弱 `--color-ink-500`，禁用 `--color-ink-400`。
- 品牌/信息：主色 `--color-info-500`、悬停/按下 `--color-info-600`、浅底 `--color-info-50`。
- 成功/警告/错误：`--color-success-500/50/600`；`--color-warning-500/50/600`；`--color-danger-500/50/600`。
- 风险等级：`--color-risk-r1/--color-info-50`，`--color-risk-r2/--color-warning-50`，`--color-risk-r3`，`--color-risk-r4`。
- CBT（雾紫系）：`--color-lavender-50`、`--color-lavender-200`、`--color-lavender-500`（用于标题/图标）。

### 4.2 字体与尺寸
- 标题与分组：32rpx/700；正文：26~28rpx；辅助说明：22~24rpx。
- 间距体系：8/12/16/24/32rpx；圆角：8/12/16/20/24rpx。

### 4.3 颜色映射表（HEX → Token）
| HEX | Token | 用途 |
| --- | --- | --- |
| #F7F9FC | `--color-ink-0` | 页基底 |
| #FFFFFF | `--color-white` | 面板/输入区/导航 |
| #E9EDF3 | `--color-ink-100` | 分隔/描边 |
| #D7DEE7 | `--color-ink-200` | 次级描边 |
| #9AA6B2 | `--color-ink-400` | 禁用文本 |
| #7B8893 | `--color-ink-500` | 弱文本/占位符 |
| #5A6672 | `--color-ink-600` | 次文本/图标 |
| #434E5A | `--color-ink-700` | 强图标 |
| #2C3640 | `--color-ink-800` | 主文本 |
| #EEF5FF | `--color-info-50` | 信息浅底/徽章 |
| #3A7BD5 | `--color-info-500` | 品牌/主按钮 |
| #2E6FE6 | `--color-info-600` | 悬停/按下 |
| #EAFBF5 | `--color-success-50` | 成功浅底 |
| #2AC28D | `--color-success-500` | 成功主色 |
| #1FA476 | `--color-success-600` | 成功描边/按下 |
| #FFF6E8 | `--color-warning-50` | 提醒浅底 |
| #F2B23D | `--color-warning-500` | 提醒主色 |
| #D9961E | `--color-warning-600` | 提醒描边/按下 |
| #FFEDEA | `--color-danger-50` | 错误浅底 |
| #E24C4B | `--color-danger-500` | 错误主色 |
| #C23C3B | `--color-danger-600` | 错误描边/按下 |
| #8C86FF | `--color-lavender-500` | CBT 标题/图标 |
| #F4F3FF | `--color-lavender-50` | CBT 卡浅底 |
| #DAD7FF | `--color-lavender-200` | CBT 次浅底/描边 |
| #F59E0B | `--color-risk-r2` | 风险 R2 指示 |
| #F97316 | `--color-risk-r3` | 风险 R3 指示 |
| #DC2626 | `--color-risk-r4` | 风险 R4/SOS |

注：Info-50/500/600 与 Brand Primary 对齐；Lavender 为辅助系（CBT）。

## 5. 交互与状态要求
- 消息发送：
  - loading：发送按钮切换为旋转进度，按钮背景 `--color-info-200`；消息以“灰态占位气泡”显示，文本 `--color-ink-500`。
  - success：占位替换为正式气泡；时间戳淡入。
  - error：占位转“错误提示条”（`--color-danger-50/500`），附“重试”次按钮；该消息右上角显示错误图标。
- 快捷回复：hover（长按）边框从 `--color-ink-200` 过渡到 `--color-info-300`；active 缩放 0.98；disabled 禁交互并降低对比。
- 输入框：focus 升级边框至 `--color-info-500`；无输入时发送按钮禁用（`--color-info-200`）。
- 弱网：顶部系统条幅“网络不佳，将自动重试”（`--color-warning-50/600`），显示退避计时；超时进入离线队列提示。
- 空状态：首屏显示“欢迎与我聊天”卡片（背景 `--color-ink-50`、图标 `--color-info-500`），附 3 个推荐 Chip。
- 晚安模式（深色）：
  - 基底 `#0F141A`、面板 `#161B22`、文本主 `#D1D7E0`、次 `#9AA6B2`；`--color-info-500` 提升至 `#6096FF`；`--color-danger-500` 调整为 `#FF6B6B`；
  - 动画减速 1.25×；阴影半径-20%；R3/R4 仍小面积使用（徽章/按钮），避免大面积纯色条幅。
- 无障碍：气泡朗读顺序=时间顺序；风险徽章读出等级与含义；按钮/Chip 焦点态需有非颜色变化（描边加粗/下划线）。

## 6. 响应式与实现提示
- 750rpx 设计基准；内容区左右留白 24rpx~32rpx；气泡最大宽度 78%。
- 适配顶部与底部安全区：Top 88rpx、Bottom 68rpx；输入区随键盘升降，消息列表滚动至底部。
- 大量消息启用虚拟滚动；图片懒加载；语音播放组件在弱网降级为下载后播放。
- 资源与动画：首屏预加载 `typing-indicator`、AI头像、核心图标；动画统一使用 120–200ms 缓出曲线，晚安模式降速。
- 降级策略：Dify 流式失败→转轮询；连续失败显示错误条并提供“联系辅导员”与 “打开 SOS”。

## 7. 数据绑定与埋点对齐
| 模块 | 数据来源/集合 | 字段映射 | UI 影响 | 埋点事件 |
| ---- | ------------- | -------- | ------- | -------- |
| 顶部风险徽章 | ask_sessions | `final_risk_level`（→缺失回退 `initial_risk_level`） | 徽章文案与配色（L0-L4） | exp_risk_banner（当条幅或徽章显示） |
| 对话消息流 | ask_messages | `message_type`、`message_role`、`content_type`、`message_index` | 气泡方向/样式、消息顺序、附件呈现 | ask_session_start（首条AI/用户消息时触发） |
| CBT 技巧卡 | ask_messages.cbt_technique / cbt_applications | `cbt_technique`、`effectiveness_score`、`behavioral_suggestions[]` | 卡面主题色/步骤态/完成标记 | ask_action_task_create（生成任务） |
| 风险变化 | ask_messages.risk_level_change | `before/after/change_direction` | 条幅/徽章轻提示（L↑/L↓） | exp_risk_banner（可复用） |
| 系统条幅 | 连接状态/错误处理 | `weak_net/offline/error`（运行时） | 条幅颜色/按钮态/重试 | connectivity_*（如需） |
| 资源与转介 | ask_sessions.counselor_handoff / resources | `channel`、`handoff_reason` | 转介确认弹层样式/按钮色 | ask_risk_handoff |
| 快捷回复 | quick_replies（运行时） | `text`、`template` | Chip 选中/禁用态 | clk_quick_reply（可选） |

对齐文档：
- 页面：docs/页面文档/页面-AI对话-Ask心理助理.md:1
- 数据：docs/数据库/集合-AI对话会话.ask_sessions.md:1, docs/数据库/集合-AI对话消息.ask_messages.md:1
- 埋点：docs/埋点与数据分析.md:1（ask_session_start/ask_action_task_create/ask_risk_handoff）

---

## 验收清单（5 分钟走查）
- [ ] 文本对比度：主文本与底色 ≥ 4.5:1；按钮文字 ≥ 3:1。
- [ ] Token 合规：样式中无裸色，均来自 Token；映射表齐全。
- [ ] 状态完整：消息/Chip/按钮具备 hover/active/disabled/loading/empty/error/弱网 全状态。
- [ ] 风险用色：R3/R4 仅小面积，不做长条背景；SOS 按钮按压有蒙层不闪烁。
- [ ] 晚安模式：深色对位、动画降速、语义色不歧义；打字指示降速。
- [ ] 无障碍：风险等级可读；焦点/按下有非颜色变化；可用性通过读屏走查。
- [ ] 弱网容错：失败进入离线队列并可重试；条幅提示明确。
- [ ] 埋点：ask_session_start、ask_action_task_create、ask_risk_handoff 正确触发并携带关键参数。

## 变更记录
- 2025-09-22：首版样式规范（基于《今天页高保真样式规范》模板），完成 Token 化与状态/晚安模式/风险用色说明，并补充埋点与验收清单。
