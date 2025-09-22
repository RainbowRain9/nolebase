# 组件：post-card/帖子卡片

> 树洞社区的核心内容展示组件，支持完整的帖子交互、风险提示和多媒体内容展示。

## 位置与作用

**出现页面**：
- 主包：`pages/treehole/index` - 树洞Tab页面
- 分包：`packages/community/post-detail/index` - 帖子详情页

**承担任务**：
- 展示树洞帖子的完整信息（内容、图片、互动数据）
- 提供抱抱、评论、收藏、分享等互动功能
- 集成风险提示系统，确保社区安全
- 支持图片九宫格展示和预览功能
- 提供行动卡生成和领取功能

## Props（属性）

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `post` | Object | ✅ | null | 帖子数据对象，包含完整的帖子信息 |
| `showRisk` | Boolean | ❌ | false | 是否显示风险提示条幅 |
| `showActions` | Boolean | ❌ | true | 是否显示底部互动按钮组 |
| `size` | String | ❌ | 'medium' | 卡片尺寸：'small' \| 'medium' \| 'large' |
| `mode` | String | ❌ | 'display' | 显示模式：'display' \| 'edit' \| 'preview' |
| `onClick` | Function | ❌ | null | 卡片点击回调函数 |

## Slots（插槽）

| 插槽名 | 用途 | 说明 |
|--------|------|------|
| `header` | 卡片头部自定义 | 可替换默认的帖子头部信息 |
| `content` | 内容区域自定义 | 可替换默认的帖子内容展示 |
| `footer` | 底部区域自定义 | 可替换默认的互动按钮组 |
| `risk-overlay` | 风险提示覆盖层 | 可自定义风险提示的展示方式 |

## Events（事件）

| 事件名 | 触发时机 | 回调参数 | 埋点映射 |
|--------|---------|---------|---------|
| `onHug` | 用户点击抱抱按钮 | `{type: 'hug', postId: string, count: number}` | `act_post_hug` |
| `onComment` | 用户点击评论按钮 | `{type: 'comment', postId: string}` | `clk_post_comment` |
| `onSave` | 用户点击收藏按钮 | `{type: 'save', postId: string, saved: boolean}` | `act_post_save` |
| `onShare` | 用户点击分享按钮 | `{type: 'share', postId: string}` | `act_post_share` |
| `onReport` | 用户点击举报按钮 | `{type: 'report', postId: string}` | `act_post_report` |
| `onTap` | 用户点击卡片主体 | `{type: 'tap', postId: string}` | `clk_post_card` |
| `onLongPress` | 用户长按卡片 | `{type: 'longPress', postId: string}` | `act_post_longpress` |
| `onActionCard` | 用户点击行动卡 | `{type: 'actionCard', postId: string, actionId: string}` | `act_action_card_tap` |

## Methods（外部可调）

| 方法名 | 入参与返回 | 使用示例 |
|--------|------------|---------|
| `toggleHug()` | 入参：无；返回：Promise<boolean> | `this.selectComponent('#post-card').toggleHug()` |
| `toggleSave()` | 入参：无；返回：Promise<boolean> | `this.selectComponent('#post-card').toggleSave()` |
| `showReportDialog()` | 入参：无；返回：void | `this.selectComponent('#post-card').showReportDialog()` |
| `sharePost()` | 入参：无；返回：Promise<boolean> | `this.selectComponent('#post-card').sharePost()` |
| `refreshData()` | 入参：postId；返回：Promise<void> | `this.selectComponent('#post-card').refreshData('post_123')` |

## Data Contract（数据契约）

### 输入字段
| 字段 | 来源服务/集合 | 说明 |
|------|-------------|------|
| `post._id` | forum_posts集合 | 帖子唯一标识 |
| `post.user_id` | forum_posts集合 | 发布者用户ID |
| `post.alias_name` | forum_posts集合 | 用户昵称（匿名模式） |
| `post.content` | forum_posts集合 | 帖子内容文本 |
| `post.tags` | forum_posts集合 | 帖子标签数组 |
| `post.topic` | forum_posts集合 | 帖子话题分类 |
| `post.mood_thermometer` | forum_posts集合 | 情绪温度值（1-10） |
| `post.risk_score` | forum_posts集合 | 风险评分（0-1） |
| `post.risk_flag` | forum_posts集合 | 风险标识（none/watch/escalated） |
| `post.status` | forum_posts集合 | 帖子状态（draft/published/archived） |
| `post.comment_count` | forum_posts集合 | 评论数量 |
| `post.hug_count` | forum_posts集合 | 抱抱数量 |
| `post.media_urls` | forum_posts集合 | 媒体文件URL数组 |
| `post.created_at` | forum_posts集合 | 创建时间 |
| `post.updated_at` | forum_posts集合 | 更新时间 |

### 输出/回写
| 字段 | 目标集合/接口 | 权限 | 说明 |
|------|-------------|------|------|
| `forum_reactions.reaction_type` | forum_reactions集合 | 写 | 记录互动类型（hug/comment/save） |
| `forum_reactions.user_id` | forum_reactions集合 | 写 | 当前用户ID |
| `forum_reactions.post_id` | forum_reactions集合 | 写 | 关联帖子ID |
| `action_cards.action_id` | action_cards集合 | 写 | 生成的行动卡ID |
| `user_events.event_type` | user_events集合 | 写 | 用户行为事件记录 |

## 视觉与交互（对齐样式规范）

### 尺寸与间距
- **卡片容器**：宽度 686rpx，圆角 24rpx
- **头像区域**：48×48rpx，圆角 50%
- **内容区域**：左右边距 32rpx，上下边距 24rpx
- **按钮尺寸**：88×88rpx（最小点击区域）
- **图片网格**：3列布局，图片间距 8rpx

### 颜色（Token映射）
| 元素 | Token | 色值 | 用途 |
|------|-------|------|------|
| 卡片背景 | `--color-ink-0` | #F7F9FC | 卡片主体背景 |
| 边框颜色 | `--color-ink-100` | #E9EDF3 | 卡片边框 |
| 主要文字 | `--color-ink-900` | #2C3640 | 标题和重要文字 |
| 次要文字 | `--color-ink-600` | #5A6672 | 内容和描述文字 |
| 品牌主色 | `--color-brand-500` | #3A7BD5 | 互动按钮和链接 |
| 成功色 | `--color-success-500` | #2AC28D | 收藏状态 |
| 风险色R1 | `--color-risk-r1` | #3A7BD5 | 观察级别风险 |
| 风险色R2 | `--color-risk-r2` | #F59E0B | 关注级别风险 |
| 风险色R3 | `--color-risk-r3` | #F97316 | 警示级别风险 |
| 风险色R4 | `--color-risk-r4` | #DC2626 | 危急级别风险 |

### 状态变化
- **normal**: 默认状态，白色背景，轻微阴影
- **hover**: 背景色变为 `--color-brand-50`，阴影加深
- **active**: 按下时缩放至 0.95，背景色加深
- **disabled**: 透明度降至 0.6，禁用所有交互
- **loading**: 显示加载动画，禁用交互
- **empty**: 显示空状态占位符
- **error**: 显示错误提示，提供重试按钮
- **weak-network**: 弱网模式下降级为只读，操作排队

### 可访问性
- **对比度**: 所有文本对比度 ≥ 4.5:1
- **文字替代**: 所有图标都有 `aria-label` 属性
- **非颜色区分**: 除了颜色变化，还提供图标和文字状态提示
- **键盘导航**: 支持键盘 Tab 键导航和 Enter 键激活
- **屏幕阅读器**: 完整的 ARIA 标签和角色描述

## 性能与包体

### 性能优化
- **图片懒加载**: 使用 `lazy-load` 属性，滚动到可视区域再加载
- **虚拟列表**: 在帖子列表中使用虚拟滚动，避免DOM过多
- **组件复用**: 使用 `recycle-view` 或类似技术复用组件实例
- **按需渲染**: 复杂内容（如九宫格图片）按需展开渲染

### 包体控制
- **主包归属**: 位于主包，因为树洞Tab是核心功能
- **依赖组件**: 依赖 `risk-banner` 和 `topic-chip` 组件
- **TDesign按需引入**: 只引入必要的 t-card、t-button 等组件
- **图标优化**: 使用雪碧图或字体图标减少包体体积

## 埋点（来自数据分析需求）

| 场景 | 事件名 | 参数 |
|------|--------|------|
| 帖子曝光 | `exp_post_card` | `postId`, `topic`, `riskLevel`, `position` |
| 抱抱互动 | `act_post_hug` | `postId`, `currentCount`, `userAction` |
| 评论点击 | `clk_post_comment` | `postId`, `source` |
| 收藏操作 | `act_post_save` | `postId`, `actionType` (add/remove) |
| 分享行为 | `act_post_share` | `postId`, `shareChannel` |
| 举报提交 | `act_post_report` | `postId`, `reportType` |
| 长按操作 | `act_post_longpress` | `postId`, `action` |
| 行动卡点击 | `act_action_card_tap` | `postId`, `actionId`, `actionType` |
| 风险提示点击 | `clk_risk_banner` | `postId`, `riskLevel`, `action` |

## 测试要点

### 单测
- **属性测试**: 验证不同 post 数据的正确渲染
- **事件测试**: 验证各种用户交互事件的正确触发
- **状态测试**: 验证加载、错误、空状态的处理
- **样式测试**: 验证不同模式和尺寸的正确显示

### E2E测试
- **首屏渲染**: 帖子列表首屏加载时间和渲染正确性
- **交互流程**: 完整的抱抱、评论、收藏、分享流程
- **错误处理**: 网络异常、数据错误的用户友好提示
- **无障碍测试**: 键盘导航和屏幕阅读器的支持

### 边界测试
- **空数据处理**: post 为 null 或空对象的处理
- **超长内容**: 超长文本和大量图片的处理
- **极端状态**: 极高风险内容的展示和交互限制
- **弱网环境**: 弱网下的降级策略和数据同步

## 示例（WXML/WXSS 片段）

### WXML 使用示例
```xml
<!-- 基础使用 -->
<post-card post="{{postData}}" />

<!-- 完整配置 -->
<post-card
  id="post-card"
  post="{{post}}"
  show-risk="{{true}}"
  show-actions="{{true}}"
  size="medium"
  mode="display"
  bind:hug="onPostHug"
  bind:comment="onPostComment"
  bind:save="onPostSave"
  bind:share="onPostShare"
  bind:tap="onPostTap"
>
  <!-- 自定义头部 -->
  <view slot="header" class="custom-header">
    <text>自定义头部内容</text>
  </view>

  <!-- 自定义内容 -->
  <view slot="content" class="custom-content">
    <text>自定义内容展示</text>
  </view>
</post-card>
```

### WXSS 样式示例
```scss
/* 组件基础样式 */
.post-card {
  width: 686rpx;
  background: var(--color-ink-0);
  border-radius: 24rpx;
  margin: 16rpx 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
}

.post-card:hover {
  background: var(--color-brand-50);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.post-card.active {
  transform: scale(0.95);
}

.post-card.disabled {
  opacity: 0.6;
  pointer-events: none;
}

/* 风险提示样式 */
.risk-banner {
  background: var(--color-risk-r1);
  color: white;
  padding: 12rpx 24rpx;
  border-radius: 0 0 24rpx 24rpx;
}

.risk-banner.risk-r2 {
  background: var(--color-risk-r2);
}

.risk-banner.risk-r3 {
  background: var(--color-risk-r3);
}

.risk-banner.risk-r4 {
  background: var(--color-risk-r4);
  animation: risk-pulse 2s infinite;
}

@keyframes risk-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 版本与变更记录

### 版本历史
- **v1.0.0** (2025-09-22): 初始版本，支持基本帖子展示和互动功能
- **v1.1.0** (计划): 添加行动卡生成和领取功能
- **v1.2.0** (计划): 支持视频内容和更丰富的媒体类型
- **v2.0.0** (计划): 重构为TypeScript，优化性能和可维护性

### 变更说明
- **v1.0.0**: 实现核心帖子展示、互动功能、风险提示系统
- **v1.1.0**: 增加AI智能生成的行动卡功能，促进从讨论到行动的转化
- **v1.2.0**: 支持视频内容，拓展多媒体表达形式
- **v2.0.0**: 全面TypeScript化，提供更好的开发体验和类型安全

---

**组件维护者**: MindGuard前端团队
**最后更新**: 2025-09-22
**相关文档**: [树洞功能文档](../页面文档/页面-树洞.md), [风险系统设计](../功能文档/功能-树洞风险提示与温和守护.md)