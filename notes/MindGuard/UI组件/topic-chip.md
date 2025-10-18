# 组件：topic-chip/话题标签

> MindGuard小程序的话题标签组件，支持话题的选择、展示和交互，是社区内容分类和导航的核心组件。

## 位置与作用

**出现页面**：
- **树洞Tab**：话题筛选和分类导航
- **发布帖子页**：话题选择和标签添加
- **帖子详情页**：话题标签展示和跳转
- **个人中心**：用户关注的话题展示
- **搜索页面**：话题搜索和筛选

**承担任务**：
- 展示各种话题标签和分类
- 支持单选和多选模式
- 提供话题搜索和筛选功能
- 集成话题的热度显示
- 支持自定义话题的创建
- 提供话题相关的统计信息

## Props（属性）

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `topic` | Object | ✅ | null | 话题数据对象 |
| `mode` | String | ❌ | 'display' | 模式：'display' \| 'select' \| 'multi-select' |
| `size` | String | ❌ | 'medium' | 尺寸：'small' \| 'medium' \| 'large' |
| `active` | Boolean | ❌ | false | 是否激活状态 |
| `disabled` | Boolean | ❌ | false | 是否禁用状态 |
| `showCount` | Boolean | ❌ | false | 是否显示数量统计 |
| `showHot` | Boolean | ❌ | false | 是否显示热度标识 |
| `clickable` | Boolean | ❌ | true | 是否可点击 |
| `rounded` | Boolean | ❌ | true | 是否圆角样式 |

## Slots（插槽）

| 插槽名 | 用途 | 说明 |
|--------|------|------|
| `icon` | 图标区域 | 可替换默认的话题图标 |
| `text` | 文字区域 | 可自定义话题文字显示 |
| `count` | 数量区域 | 可自定义数量统计显示 |
| `hot` | 热度区域 | 可自定义热度标识显示 |
| `extra` | 额外内容 | 可添加额外的标签信息 |

## Events（事件）

| 事件名 | 触发时机 | 回调参数 | 埋点映射 |
|--------|---------|---------|---------|
| `onSelect` | 用户选择话题 | `{type: 'select', topic: object, active: boolean}` | `act_topic_select` |
| `onDeselect` | 用户取消选择 | `{type: 'deselect', topic: object, active: boolean}` | `act_topic_deselect` |
| `onTap` | 用户点击标签 | `{type: 'tap', topic: object, mode: string}` | `clk_topic_chip` |
| `onLongPress` | 用户长按标签 | `{type: 'longPress', topic: object, duration: number}` | `act_topic_longpress` |
| `onHotClick` | 用户点击热度 | `{type: 'hotClick', topic: object, hotLevel: number}` | `act_topic_hot_click` |

## Methods（外部可调）

| 方法名 | 入参与返回 | 使用示例 |
|--------|------------|---------|
| `select()` | 入参：无；返回：void | `this.selectComponent('#topic').select()` |
| `deselect()` | 入参：无；返回：void | `this.selectComponent('#topic').deselect()` |
| `toggle()` | 入参：无；返回：void | `this.selectComponent('#topic').toggle()` |
| `updateTopic(topic: object)` | 入参：话题对象；返回：void | `this.selectComponent('#topic').updateTopic({...})` |
| `setActive(active: boolean)` | 入参：激活状态；返回：void | `this.selectComponent('#topic').setActive(true)` |

## Data Contract（数据契约）

### 输入字段
| 字段 | 来源服务/集合 | 说明 |
|------|-------------|------|
| `topic.id` | forum_topics集合 | 话题唯一标识 |
| `topic.name` | forum_topics集合 | 话题名称 |
| `topic.description` | forum_topics集合 | 话题描述 |
| `topic.icon` | forum_topics集合 | 话题图标 |
| `topic.color` | forum_topics集合 | 话题颜色 |
| `topic.count` | forum_topics集合 | 话题使用次数 |
| `topic.hot` | forum_topics集合 | 话题热度值 |
| `topic.category` | forum_topics集合 | 话题分类 |

### 输出/回写
| 字段 | 目标集合/接口 | 权限 | 说明 |
|------|-------------|------|------|
| `user_events.event_type` | user_events集合 | 写 | 话题标签交互事件记录 |
| `topic_stats.usage_count` | forum_topics集合 | 写 | 话题使用统计更新 |
| `user_behavior.topic_preference` | analytics集合 | 写 | 用户话题偏好分析 |

## 视觉与交互（对齐样式规范）

### 尺寸与间距
- **标签容器**：高度自适应，最小宽度 120rpx
- **内容区域**：左右内边距 24rpx，上下内边距 12rpx
- **文字大小**：小号 24rpx，中号 28rpx，大号 32rpx
- **图标尺寸**：24×24rpx（小号），32×32rpx（中号），40×40rpx（大号）
- **圆角大小**：24rpx（小号），32rpx（中号），40rpx（大号）

### 颜色（Token映射）
| 元素 | Token | 色值 | 用途 |
|------|-------|------|------|
| 默认背景 | `--color-ink-50` | #EEF5FF | 标签默认背景 |
| 激活背景 | `--color-brand-500` | #3A7BD5 | 激活状态背景 |
| 禁用背景 | `--color-ink-100` | #E9EDF3 | 禁用状态背景 |
| 默认文字 | `--color-ink-700` | #4A5568 | 默认状态文字 |
| 激活文字 | `--color-ink-0` | #FFFFFF | 激活状态文字 |
| 禁用文字 | `--color-ink-400` | #8B95A7 | 禁用状态文字 |
| 热度颜色 | `--color-warning-500` | #F59E0B | 热度标识颜色 |
| 边框颜色 | `--color-ink-200` | #D7DEE7 | 标签边框颜色 |

### 状态变化
- **normal**: 默认状态，正常显示标签内容
- **active**: 激活状态，选中或高亮显示
- **disabled**: 禁用状态，不可交互状态
- **hover**: 悬停状态，鼠标悬停效果
- **selected**: 选中状态，多选模式下的选中
- **hot**: 热门状态，热门话题的特殊样式

### 可访问性
- **对比度**: 所有文本对比度 ≥ 4.5:1，确保清晰可读
- **颜色区分**: 除了颜色，还使用图标和边框区分状态
- **键盘导航**: 支持Tab键导航和Enter键激活
- **屏幕阅读器**: 完整的ARIA标签，描述标签功能

## 性能与包体

### 性能优化
- **虚拟列表**: 大量标签时使用虚拟滚动技术
- **样式缓存**: 标签样式预定义，减少动态计算
- **事件防抖**: 点击事件使用防抖，避免重复操作
- **图片懒加载**: 话题图标按需加载

### 包体控制
- **主包归属**: 位于主包，为所有话题相关页面提供支持
- **图标优化**: 使用字体图标或内联SVG
- **代码压缩**: 组件代码已经过压缩和优化
- **依赖控制**: 最小化外部依赖，确保组件独立性

## 埋点（来自数据分析需求）

| 场景 | 事件名 | 参数 |
|------|--------|------|
| 话题标签曝光 | `exp_topic_chip` | `topicId`, `topicName`, `mode`, `position` |
| 话题选择 | `act_topic_select` | `topicId`, `topicName`, `selectMode`, `topicCategory` |
| 话题取消选择 | `act_topic_deselect` | `topicId`, `topicName`, `selectMode` |
| 标签点击 | `clk_topic_chip` | `topicId`, `topicName`, `clickContext`, `hasCount` |
| 热度标识点击 | `act_topic_hot_click` | `topicId`, `topicName`, `hotLevel`, `topicCount` |
| 长按标签 | `act_topic_longpress` | `topicId`, `topicName`, `pressDuration`, `action` |

## 测试要点

### 单测
- **模式测试**: 验证不同模式下的正确显示和交互
- **状态测试**: 验证各种状态切换的正确性
- **事件测试**: 验证各种用户交互事件的正确触发
- **样式测试**: 验证不同尺寸和样式的正确显示

### E2E测试
- **选择流程**: 完整的话题选择和取消流程
- **多选交互**: 多选模式下的选择和取消
- **话题跳转**: 点击标签跳转到相关内容页面
- **搜索筛选**: 搜索功能的话题筛选效果

### 边界测试
- **长文本处理**: 超长话题名称的显示处理
- **大量标签**: 大量标签的性能和显示效果
- **快速操作**: 快速点击和连续操作的响应
- **异常数据**: 异常话题数据的处理和显示

## 示例（WXML/WXSS 片段）

### WXML 使用示例
```xml
<!-- 基础使用 -->
<topic-chip
  topic="{{currentTopic}}"
  mode="select"
  bind:select="onTopicSelect"
  bind:deselect="onTopicDeselect"
/>

<!-- 完整配置 -->
<topic-chip
  id="topic-chip"
  topic="{{topicData}}"
  mode="multi-select"
  size="medium"
  active="{{isActive}}"
  disabled="{{false}}"
  show-count="{{true}}"
  show-hot="{{true}}"
  clickable="{{true}}"
  rounded="{{true}}"
  bind:select="onTopicSelect"
  bind:deselect="onTopicDeselect"
  bind:tap="onTopicTap"
  bind:longPress="onTopicLongPress"
>
  <!-- 自定义图标 -->
  <view slot="icon" class="custom-icon">
    <image src="/assets/icons/{{topicData.icon}}.png" mode="aspectFit" />
  </view>

  <!-- 自定义文字 -->
  <view slot="text" class="custom-text">
    <text>{{topicData.name}}</text>
    <text class="category">{{topicData.category}}</text>
  </view>

  <!-- 自定义数量 -->
  <view slot="count" class="custom-count">
    <text>{{topicData.count}}</text>
  </view>

  <!-- 自定义热度 -->
  <view slot="hot" class="custom-hot">
    <icon type="fire" size="12" />
    <text>{{topicData.hot}}</text>
  </view>
</topic-chip>
```

### WXSS 样式示例
```scss
/* 组件基础样式 */
.topic-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  border-radius: 32rpx;
  background: var(--color-ink-50);
  border: 2rpx solid var(--color-ink-200);
  color: var(--color-ink-700);
  font-size: 28rpx;
  line-height: 40rpx;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
}

/* 尺寸变体 */
.topic-chip.small {
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  font-size: 24rpx;
  line-height: 32rpx;
}

.topic-chip.large {
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 32rpx;
  line-height: 44rpx;
}

/* 状态样式 */
.topic-chip.active {
  background: var(--color-brand-500);
  border-color: var(--color-brand-500);
  color: var(--color-ink-0);
}

.topic-chip.disabled {
  background: var(--color-ink-100);
  border-color: var(--color-ink-100);
  color: var(--color-ink-400);
  cursor: not-allowed;
}

.topic-chip.disabled:hover {
  transform: none;
  box-shadow: none;
}

.topic-chip.hot {
  border-color: var(--color-warning-500);
  box-shadow: 0 0 0 2rpx rgba(245, 158, 11, 0.2);
}

/* 交互效果 */
.topic-chip.clickable:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.topic-chip.clickable:active {
  transform: translateY(0);
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
}

/* 图标区域 */
.topic-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.topic-icon image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 文字区域 */
.topic-text {
  display: flex;
  align-items: center;
  gap: 4rpx;
  white-space: nowrap;
}

.topic-name {
  font-weight: 500;
}

.topic-category {
  font-size: 0.8em;
  opacity: 0.7;
}

/* 数量显示 */
.topic-count {
  margin-left: 8rpx;
  font-size: 0.8em;
  opacity: 0.8;
  background: rgba(0, 0, 0, 0.1);
  padding: 2rpx 8rpx;
  border-radius: 12rpx;
}

.topic-chip.active .topic-count {
  background: rgba(255, 255, 255, 0.2);
}

/* 热度标识 */
.topic-hot {
  margin-left: 8rpx;
  display: flex;
  align-items: center;
  gap: 2rpx;
  font-size: 0.8em;
  color: var(--color-warning-500);
  font-weight: 600;
}

.topic-hot-icon {
  width: 16rpx;
  height: 16rpx;
}

/* 多选模式 */
.topic-chip.multi-select {
  padding-left: 48rpx;
  position: relative;
}

.topic-chip.multi-select::before {
  content: '';
  position: absolute;
  left: 16rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 20rpx;
  height: 20rpx;
  border: 2rpx solid var(--color-ink-400);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.topic-chip.multi-select.selected::before {
  background: var(--color-brand-500);
  border-color: var(--color-brand-500);
}

.topic-chip.multi-select.selected::after {
  content: '';
  position: absolute;
  left: 22rpx;
  top: 50%;
  transform: translateY(-50%);
  width: 8rpx;
  height: 8rpx;
  background: white;
  border-radius: 50%;
}

/* 圆角样式 */
.topic-chip.rounded {
  border-radius: 32rpx;
}

.topic-chip.rounded.small {
  border-radius: 24rpx;
}

.topic-chip.rounded.large {
  border-radius: 40rpx;
}

/* 方角样式 */
.topic-chip:not(.rounded) {
  border-radius: 8rpx;
}

/* 主题适配 */
.topic-chip.dark {
  background: var(--color-ink-800);
  border-color: var(--color-ink-600);
  color: var(--color-ink-200);
}

.topic-chip.dark.active {
  background: var(--color-brand-500);
  border-color: var(--color-brand-500);
  color: var(--color-ink-0);
}

.topic-chip.dark.disabled {
  background: var(--color-ink-700);
  border-color: var(--color-ink-700);
  color: var(--color-ink-400);
}

/* 加载状态 */
.topic-chip.loading {
  opacity: 0.6;
  pointer-events: none;
}

.topic-chip.loading .topic-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 自定义样式覆盖 */
.topic-chip .custom-icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 12rpx;
}

.topic-chip .custom-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2rpx;
}

.topic-chip .custom-text .category {
  font-size: 0.7em;
  opacity: 0.6;
}

.topic-chip .custom-count {
  margin-left: 12rpx;
  font-weight: 600;
}

.topic-chip .custom-hot {
  margin-left: 12rpx;
  display: flex;
  align-items: center;
  gap: 4rpx;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .topic-chip {
    font-size: 24rpx;
    line-height: 32rpx;
    padding: 8rpx 16rpx;
  }

  .topic-chip.medium {
    padding: 12rpx 20rpx;
  }

  .topic-chip.large {
    padding: 14rpx 24rpx;
  }
}

/* 动画效果 */
.topic-chip {
  animation: chip-appear 0.3s ease-out;
}

@keyframes chip-appear {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* 特殊状态 */
.topic-chip.very-hot {
  animation: hot-pulse 2s ease-in-out infinite;
}

@keyframes hot-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8rpx rgba(245, 158, 11, 0);
  }
}
```

## 版本与变更记录

### 版本历史
- **v1.0.0** (2025-09-22): 初始版本，支持基本话题标签功能
- **v1.1.0** (计划): 支持话题搜索和智能推荐
- **v1.2.0** (计划): 添加话题创建和管理功能
- **v2.0.0** (计划): 支持话题趋势分析和个性化推荐

### 变更说明
- **v1.0.0**: 实现基础话题标签展示和选择功能
- **v1.1.0**: 增加搜索功能和智能话题推荐
- **v1.2.0**: 添加话题创建、编辑和管理功能
- **v2.0.0**: 支持AI话题分析和个性化推荐算法

---

**组件维护者**: MindGuard前端团队
**最后更新**: 2025-09-22
**相关文档**: [社区功能设计](../功能文档/功能-树洞社区.md), [交互设计规范](../前端样式/样式规范/交互规范.md)