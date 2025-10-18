# 组件：empty-state/空状态

> MindGuard小程序的通用空状态展示组件，支持多种场景的空状态提示，提供友好的用户引导和操作指引。

## 位置与作用

**出现页面**：
- **今天Tab**：首次使用时的心情打卡引导
- **心情随笔Tab**：暂无日记记录时的引导
- **任务Tab**：任务列表为空时的提示
- **树洞Tab**：暂无帖子时的社区引导
- **个人中心**：各功能模块为空时的状态提示
- **所有分包页面**：统一提供空状态体验

**承担任务**：
- 展示各种业务场景的空状态
- 提供清晰的用户引导和操作指引
- 支持图片、图标、文字的组合展示
- 集成操作按钮，引导用户进行下一步行动
- 支持不同风格和主题的空状态样式
- 提供友好的错误提示和重试机制

## Props（属性）

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `type` | String | ❌ | 'default' | 空状态类型：'default' \| 'data' \| 'network' \| 'permission' \| 'search' |
| `title` | String | ❌ | '' | 标题文字 |
| `description` | String | ❌ | '' | 描述文字 |
| `image` | String | ❌ | '' | 图片路径（本地或网络） |
| `icon` | String | ❌ | '' | 图标名称 |
| `actionText` | String | ❌ | '' | 操作按钮文字 |
| `actionType` | String | ❌ | 'button' | 操作类型：'button' \| 'link' \| 'refresh' |
| `showRefresh` | Boolean | ❌ | false | 是否显示刷新按钮 |
| `size` | String | ❌ | 'medium' | 尺寸：'small' \| 'medium' \| 'large' |
| `theme` | String | ❌ | 'light' | 主题：'light' \| 'dark' |

## Slots（插槽）

| 插槽名 | 用途 | 说明 |
|--------|------|------|
| `image` | 图片区域 | 可替换默认的空状态图片或图标 |
| `title` | 标题区域 | 可自定义标题显示样式 |
| `description` | 描述区域 | 可自定义描述文字内容 |
| `action` | 操作区域 | 可自定义操作按钮样式 |
| `extra` | 额外内容 | 可添加额外的提示信息或操作 |

## Events（事件）

| 事件名 | 触发时机 | 回调参数 | 埋点映射 |
|--------|---------|---------|---------|
| `onAction` | 用户点击操作按钮 | `{type: 'action', actionType: string, page: string}` | `act_empty_action` |
| `onRefresh` | 用户点击刷新按钮 | `{type: 'refresh', page: string, timestamp: number}` | `act_empty_refresh` |
| `onRetry` | 用户点击重试按钮 | `{type: 'retry', page: string, errorType: string}` | `act_empty_retry` |
| `onLoadMore` | 用户点击加载更多 | `{type: 'loadMore', page: string, context: object}` | `act_empty_loadmore` |

## Methods（外部可调）

| 方法名 | 入参与返回 | 使用示例 |
|--------|------------|---------|
| `show(type: string)` | 入参：类型；返回：void | `this.selectComponent('#empty').show('network')` |
| `hide()` | 入参：无；返回：void | `this.selectComponent('#empty').hide()` |
| `refresh()` | 入参：无；返回：void | `this.selectComponent('#empty').refresh()` |
| `updateConfig(config: object)` | 入参：配置；返回：void | `this.selectComponent('#empty').updateConfig({...})` |
| `setLoading(loading: boolean)` | 入参：加载状态；返回：void | `this.selectComponent('#empty').setLoading(true)` |

## Data Contract（数据契约）

### 输入字段
| 字段 | 来源服务/集合 | 说明 |
|------|-------------|------|
| `type` | 页面配置 | 空状态类型标识 |
| `title` | 页面配置 | 标题文字内容 |
| `description` | 页面配置 | 描述文字内容 |
| `image` | 资源文件 | 本地图片或网络图片路径 |
| `icon` | 图标库 | 图标名称或路径 |
| `actionText` | 多语言配置 | 操作按钮文字 |
| `actionType` | 页面配置 | 操作行为类型 |
| `theme` | 主题配置 | 主题样式配置 |

### 输出/回写
| 字段 | 目标集合/接口 | 权限 | 说明 |
|------|-------------|------|------|
| `user_events.event_type` | user_events集合 | 写 | 空状态交互事件记录 |
| `user_behavior.first_action` | analytics集合 | 写 | 用户首次行为分析 |
| `page_stats.empty_views` | analytics集合 | 写 | 页面空状态曝光统计 |

## 视觉与交互（对齐样式规范）

### 尺寸与间距
- **组件容器**：宽度 100%，最小高度 400rpx
- **图片区域**：图片最大宽度 320rpx，高度自适应
- **内容区域**：左右边距 48rpx，上下边距 48rpx
- **标题文字**：字体大小 32rpx，行高 44rpx
- **描述文字**：字体大小 28rpx，行高 40rpx
- **按钮尺寸**：最小高度 88rpx，左右内边距 48rpx

### 颜色（Token映射）
| 元素 | Token | 色值 | 用途 |
|------|-------|------|------|
| 组件背景 | `--color-ink-0` | #F7F9FC | 组件主体背景 |
| 标题文字 | `--color-ink-900` | #2C3640 | 主要标题文字 |
| 描述文字 | `--color-ink-600` | #5A6672 | 次要描述文字 |
| 按钮主色 | `--color-brand-500` | #3A7BD5 | 主要操作按钮 |
| 按钮次色 | `--color-ink-600` | #5A6672 | 次要操作按钮 |
| 图标颜色 | `--color-ink-400` | #8B95A7 | 图标和装饰元素 |
| 分割线 | `--color-ink-100` | #E9EDF3 | 内容分割线 |

### 状态变化
- **normal**: 默认状态，正常显示空状态内容
- **loading**: 加载状态，显示加载动画
- **error**: 错误状态，显示错误提示和重试按钮
- **refreshing**: 刷新状态，显示刷新动画
- **success**: 成功状态，显示成功提示（短暂显示后跳转）

### 可访问性
- **对比度**: 所有文本对比度 ≥ 4.5:1，确保清晰可读
- **按钮尺寸**: 所有可点击元素 ≥ 88×88rpx，符合微信小程序规范
- **文字替代**: 所有图片和图标都有对应的文字说明
- **屏幕阅读器**: 完整的ARIA标签，描述空状态的意义和操作

## 性能与包体

### 性能优化
- **图片懒加载**: 网络图片使用懒加载，避免首屏压力
- **图标优化**: 优先使用字体图标，减少包体体积
- **状态缓存**: 空状态配置缓存，避免重复计算
- **事件防抖**: 刷新和重试按钮使用防抖，避免重复操作

### 包体控制
- **主包归属**: 位于主包，为所有页面提供空状态展示
- **资源优化**: 空状态图片使用webp格式，减少体积
- **按需加载**: 复杂动画效果按需加载
- **代码压缩**: 组件代码已经过压缩和优化

## 埋点（来自数据分析需求）

| 场景 | 事件名 | 参数 |
|------|--------|------|
| 空状态曝光 | `exp_empty_state` | `pagePath`, `emptyType`, `scene`, `timestamp` |
| 操作按钮点击 | `act_empty_action` | `pagePath`, `actionType`, `buttonText`, `emptyType` |
| 刷新按钮点击 | `act_empty_refresh` | `pagePath`, `refreshType`, `emptyType` |
| 重试按钮点击 | `act_empty_retry` | `pagePath`, `errorType`, `retryCount` |
| 加载更多点击 | `act_empty_loadmore` | `pagePath`, `loadContext`, `emptyType` |

## 测试要点

### 单测
- **类型测试**: 验证不同空状态类型的正确显示
- **事件测试**: 验证各种用户交互事件的正确触发
- **样式测试**: 验证不同主题和尺寸配置的正确显示
- **图片测试**: 验证本地和网络图片的正确加载

### E2E测试
- **引导流程**: 首次用户的完整引导流程
- **错误恢复**: 网络异常、权限问题的恢复流程
- **操作转化**: 空状态到功能页面的转化率
- **重试机制**: 各种重试场景的功能验证

### 边界测试
- **超长文本**: 标题和描述文字超长的处理
- **无数据**: 完全无数据时的显示效果
- **快速操作**: 连续点击操作按钮的处理
- **弱网环境**: 弱网下的图片加载和显示

## 示例（WXML/WXSS 片段）

### WXML 使用示例
```xml
<!-- 基础使用 -->
<empty-state
  type="data"
  title="暂无数据"
  description="还没有相关内容，快来创建第一条记录吧！"
  action-text="立即创建"
  bind:action="onCreateAction"
/>

<!-- 完整配置 -->
<empty-state
  id="empty-state"
  type="network"
  title="网络连接失败"
  description="请检查网络设置后重试"
  image="/assets/images/empty-network.png"
  action-text="重新连接"
  show-refresh="{{true}}"
  size="large"
  theme="light"
  bind:action="onRetryAction"
  bind:refresh="onRefresh"
>
  <!-- 自定义图片 -->
  <view slot="image" class="custom-image">
    <image src="/assets/images/custom-empty.png" mode="aspectFit" />
  </view>

  <!-- 自定义标题 -->
  <view slot="title" class="custom-title">
    <text>自定义标题</text>
  </view>

  <!-- 自定义描述 -->
  <view slot="description" class="custom-description">
    <text>这是自定义的描述文字内容</text>
    <text>可以包含更多的详细信息</text>
  </view>

  <!-- 自定义操作 -->
  <view slot="action" class="custom-action">
    <button class="primary-btn" bindtap="onPrimaryAction">主要操作</button>
    <button class="secondary-btn" bindtap="onSecondaryAction">次要操作</button>
  </view>
</empty-state>
```

### WXSS 样式示例
```scss
/* 组件基础样式 */
.empty-state {
  width: 100%;
  min-height: 400rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  background: var(--color-ink-0);
  transition: all 0.3s ease;
}

/* 图片区域 */
.empty-state-image {
  width: 240rpx;
  height: 240rpx;
  margin-bottom: 32rpx;
  position: relative;
}

.empty-state-image image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.empty-state-icon {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state-icon image {
  width: 100%;
  height: 100%;
}

/* 内容区域 */
.empty-state-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 540rpx;
}

.empty-state-title {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--color-ink-900);
  line-height: 44rpx;
  margin-bottom: 16rpx;
  text-align: center;
}

.empty-state-description {
  font-size: 28rpx;
  color: var(--color-ink-600);
  line-height: 40rpx;
  text-align: center;
  margin-bottom: 32rpx;
}

/* 操作区域 */
.empty-state-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  width: 100%;
  max-width: 400rpx;
}

.empty-state-button {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 44rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.empty-state-button.primary {
  background: var(--color-brand-500);
  color: white;
}

.empty-state-button.primary:hover {
  background: var(--color-brand-600);
  transform: translateY(-2rpx);
}

.empty-state-button.secondary {
  background: transparent;
  color: var(--color-brand-500);
  border: 2rpx solid var(--color-brand-500);
}

.empty-state-button.secondary:hover {
  background: var(--color-brand-50);
}

/* 刷新按钮 */
.empty-state-refresh {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  border-radius: 50%;
  background: var(--color-brand-50);
  margin-top: 24rpx;
  transition: all 0.3s ease;
}

.empty-state-refresh:hover {
  background: var(--color-brand-100);
  transform: scale(1.05);
}

.empty-state-refresh-icon {
  width: 40rpx;
  height: 40rpx;
}

/* 加载状态 */
.empty-state.loading .empty-state-image {
  animation: pulse 2s ease-in-out infinite;
}

.empty-state.loading .empty-state-refresh-icon {
  animation: rotate 1s linear infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 尺寸变体 */
.empty-state.small {
  min-height: 300rpx;
  padding: 32rpx;
}

.empty-state.small .empty-state-image {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 24rpx;
}

.empty-state.small .empty-state-title {
  font-size: 28rpx;
  line-height: 40rpx;
}

.empty-state.small .empty-state-description {
  font-size: 24rpx;
  line-height: 36rpx;
}

.empty-state.large {
  min-height: 500rpx;
  padding: 64rpx;
}

.empty-state.large .empty-state-image {
  width: 320rpx;
  height: 320rpx;
  margin-bottom: 40rpx;
}

.empty-state.large .empty-state-title {
  font-size: 36rpx;
  line-height: 48rpx;
}

.empty-state.large .empty-state-description {
  font-size: 32rpx;
  line-height: 44rpx;
}

/* 主题适配 */
.empty-state.dark {
  background: var(--color-ink-900);
}

.empty-state.dark .empty-state-title {
  color: var(--color-ink-0);
}

.empty-state.dark .empty-state-description {
  color: var(--color-ink-300);
}

.empty-state.dark .empty-state-button.secondary {
  color: var(--color-brand-400);
  border-color: var(--color-brand-400);
}

.empty-state.dark .empty-state-button.secondary:hover {
  background: var(--color-brand-900);
}

/* 错误状态 */
.empty-state.error .empty-state-image {
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10rpx); }
  75% { transform: translateX(10rpx); }
}

/* 成功状态 */
.empty-state.success .empty-state-image {
  animation: success-bounce 0.6s ease-out;
}

@keyframes success-bounce {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

## 版本与变更记录

### 版本历史
- **v1.0.0** (2025-09-22): 初始版本，支持基本空状态展示
- **v1.1.0** (计划): 支持更多场景类型和自定义样式
- **v1.2.0** (计划): 添加动画效果和交互反馈
- **v2.0.0** (计划): 支持智能推荐和个性化空状态

### 变更说明
- **v1.0.0**: 实现基础空状态功能，支持多种场景类型
- **v1.1.0**: 增加更多场景支持，提供更丰富的自定义选项
- **v1.2.0**: 添加动画效果，提升用户体验和交互反馈
- **v2.0.0**: 支持AI智能推荐，根据用户行为展示个性化空状态

---

**组件维护者**: MindGuard前端团队
**最后更新**: 2025-09-22
**相关文档**: [状态管理规范](../功能文档/功能-状态管理.md), [用户体验设计](../功能文档/功能-用户体验设计.md)