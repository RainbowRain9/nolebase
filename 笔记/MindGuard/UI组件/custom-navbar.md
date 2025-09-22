# 组件：custom-navbar/自定义导航栏

> MindGuard小程序的核心导航组件，支持全页面统一的导航体验，包含返回、标题、操作按钮等完整功能。

## 位置与作用

**出现页面**：
- **所有页面**：作为统一导航栏组件，覆盖主包和所有分包页面

**承担任务**：
- 提供页面间导航和返回功能
- 展示页面标题和副标题
- 支持自定义操作按钮和菜单
- 集成搜索、分享等通用功能
- 支持沉浸式导航和状态栏适配
- 提供统一的导航交互体验

## Props（属性）

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `title` | String | ✅ | '' | 页面标题 |
| `subtitle` | String | ❌ | '' | 副标题/描述文字 |
| `showBack` | Boolean | ❌ | true | 是否显示返回按钮 |
| `backText` | String | ❌ | '返回' | 返回按钮文字 |
| `backgroundColor` | String | ❌ | 'white' | 导航栏背景色 |
| `titleColor` | String | ❌ | 'dark' | 标题文字颜色：'dark' \| 'light' |
| `border` | Boolean | ❌ | true | 是否显示底部边框 |
| `fixed` | Boolean | ❌ | true | 是否固定定位 |
| `placeholder` | Boolean | ❌ | true | 是否占位（fixed=true时有效）|
| `zIndex` | Number | ❌ | 1000 | 层级优先级 |
| `capsule` | Object | ❌ | null | 自定义胶囊按钮配置 |
| `actions` | Array | ❌ | [] | 右侧操作按钮数组 |

## Slots（插槽）

| 插槽名 | 用途 | 说明 |
|--------|------|------|
| `left` | 左侧区域 | 可替换默认的返回按钮区域 |
| `title` | 标题区域 | 可自定义标题显示样式 |
| `right` | 右侧区域 | 可自定义操作按钮区域 |
| `subtitle` | 副标题区域 | 可自定义副标题显示 |
| `content` | 内容区域 | 可完全自定义导航栏内容 |

## Events（事件）

| 事件名 | 触发时机 | 回调参数 | 埋点映射 |
|--------|---------|---------|---------|
| `onBack` | 用户点击返回按钮 | `{type: 'back', from: string, timestamp: number}` | `act_nav_back` |
| `onHome` | 用户点击返回首页 | `{type: 'home', from: string, timestamp: number}` | `act_nav_home` |
| `onAction` | 用户点击操作按钮 | `{type: 'action', action: string, data: object}` | `act_nav_action` |
| `onSearch` | 用户点击搜索按钮 | `{type: 'search', keyword: string}` | `act_nav_search` |
| `onShare` | 用户点击分享按钮 | `{type: 'share', from: string}` | `act_nav_share` |
| `onMenu` | 用户点击菜单按钮 | `{type: 'menu', position: object}` | `act_nav_menu` |

## Methods（外部可调）

| 方法名 | 入参与返回 | 使用示例 |
|--------|------------|---------|
| `setTitle(title: string)` | 入参：标题；返回：void | `this.selectComponent('#navbar').setTitle('新标题')` |
| `setBackgroundColor(color: string)` | 入参：颜色；返回：void | `this.selectComponent('#navbar').setBackgroundColor('#F7F9FC')` |
| `showLoading()` | 入参：无；返回：void | `this.selectComponent('#navbar').showLoading()` |
| `hideLoading()` | 入参：无；返回：void | `this.selectComponent('#navbar').hideLoading()` |
| `addAction(action: object)` | 入参：操作对象；返回：void | `this.selectComponent('#navbar').addAction({...})` |
| `removeAction(id: string)` | 入参：操作ID；返回：void | `this.selectComponent('#navbar').removeAction('search')` |

## Data Contract（数据契约）

### 输入字段
| 字段 | 来源服务/集合 | 说明 |
|------|-------------|------|
| `actions[].id` | 页面配置 | 操作按钮唯一标识 |
| `actions[].icon` | 页面配置 | 操作按钮图标 |
| `actions[].text` | 页面配置 | 操作按钮文字 |
| `actions[].type` | 页面配置 | 操作类型：'button' \| 'menu' \| 'search' |
| `actions[].visible` | 页面配置 | 是否显示 |
| `capsule.style` | 页面配置 | 胶囊按钮样式配置 |
| `capsule.position` | 页面配置 | 胶囊按钮位置配置 |

### 输出/回写
| 字段 | 目标集合/接口 | 权限 | 说明 |
|------|-------------|------|------|
| `user_events.event_type` | user_events集合 | 写 | 导航行为事件记录 |
| `page_views.page_path` | analytics集合 | 写 | 页面访问路径记录 |
| `user_flows.entry_point` | analytics集合 | 写 | 用户入口路径分析 |

## 视觉与交互（对齐样式规范）

### 尺寸与间距
- **导航栏高度**：88rpx（标准高度）+ 状态栏高度（自适应）
- **内容区域**：左右边距 32rpx，上下内边距 8rpx
- **返回按钮**：88×88rpx（最小点击区域）
- **标题区域**：最大宽度 400rpx，左内边距 24rpx
- **操作按钮**：88×88rpx，间距 16rpx

### 颜色（Token映射）
| 元素 | Token | 色值 | 用途 |
|------|-------|------|------|
| 默认背景 | `--color-ink-0` | #F7F9FC | 浅色主题背景 |
| 深色背景 | `--color-ink-900` | #2C3640 | 深色主题背景 |
| 标题文字 | `--color-ink-900` | #2C3640 | 主要标题文字 |
| 副标题文字 | `--color-ink-600` | #5A6672 | 次要说明文字 |
| 图标颜色 | `--color-ink-700` | #4A5568 | 图标和按钮颜色 |
| 边框颜色 | `--color-ink-100` | #E9EDF3 | 底部分隔线 |
| 遮罩背景 | `--color-mask` | rgba(0,0,0,0.3) | 弹出层遮罩 |

### 状态变化
- **normal**: 默认状态，正常显示所有元素
- **loading**: 加载状态，显示加载动画
- **transparent**: 透明状态，背景透明，文字颜色自动适应
- **immersive**: 沉浸状态，内容延伸到状态栏下方
- **fixed**: 固定状态，滚动时固定在顶部
- **static**: 静态状态，随页面滚动
- **custom**: 自定义状态，完全由插槽内容控制

### 可访问性
- **对比度**: 所有文本对比度 ≥ 4.5:1，深色背景时使用浅色文字
- **按钮尺寸**: 所有可点击元素 ≥ 88×88rpx，符合微信小程序规范
- **状态反馈**: 按钮点击有视觉反馈，支持键盘导航
- **屏幕阅读器**: 完整的ARIA标签，描述导航栏功能

## 性能与包体

### 性能优化
- **样式优化**: 使用CSS变量实现主题切换，减少样式计算
- **事件节流**: 返回按钮点击事件使用节流，防止重复跳转
- **状态栏适配**: 使用 `wx.getSystemInfoSync()` 获取状态栏高度
- **内存管理**: 组件销毁时清理事件监听器和定时器

### 包体控制
- **主包归属**: 位于主包，为所有页面提供导航功能
- **依赖分析**: 无外部依赖，纯组件实现
- **图标优化**: 使用字体图标或base64内嵌SVG，减少网络请求
- **代码压缩**: 组件代码已经过压缩和优化

## 埋点（来自数据分析需求）

| 场景 | 事件名 | 参数 |
|------|--------|------|
| 导航栏曝光 | `exp_navbar` | `pagePath`, `title`, `style`, `actionCount` |
| 返回按钮点击 | `act_nav_back` | `fromPage`, `targetPage`, `timestamp` |
| 首页按钮点击 | `act_nav_home` | `fromPage`, `timestamp` |
| 操作按钮点击 | `act_nav_action` | `actionId`, `actionType`, `pagePath` |
| 搜索按钮点击 | `act_nav_search` | `pagePath`, `searchContext` |
| 分享按钮点击 | `act_nav_share` | `pagePath`, `shareContent` |
| 菜单按钮点击 | `act_nav_menu` | `pagePath`, `menuType` |

## 测试要点

### 单测
- **属性测试**: 验证不同属性组合的正确渲染
- **事件测试**: 验证各种用户交互事件的正确触发
- **样式测试**: 验证不同主题和样式配置的正确显示
- **适配测试**: 验证不同机型和系统版本的兼容性

### E2E测试
- **导航流程**: 完整的页面间导航和返回流程
- **按钮交互**: 所有操作按钮的点击和功能验证
- **状态栏适配**: 不同机型的状态栏高度适配
- **主题切换**: 深色/浅色主题的切换效果

### 边界测试
- **空数据处理**: title为空或过长时的处理
- **异常状态**: 网络异常、权限不足时的降级显示
- **极端配置**: 大量操作按钮时的布局处理
- **性能测试**: 快速切换页面时的性能表现

## 示例（WXML/WXSS 片段）

### WXML 使用示例
```xml
<!-- 基础使用 -->
<custom-navbar title="页面标题" />

<!-- 完整配置 -->
<custom-navbar
  id="navbar"
  title="树洞社区"
  subtitle="分享你的心情故事"
  show-back="{{true}}"
  background-color="white"
  title-color="dark"
  border="{{true}}"
  fixed="{{true}}"
  placeholder="{{true}}"
  actions="{{actions}}"
  bind:back="onNavBack"
  bind:action="onNavAction"
  bind:search="onSearch"
>
  <!-- 自定义左侧 -->
  <view slot="left" class="custom-left">
    <icon type="home" size="20" />
  </view>

  <!-- 自定义标题 -->
  <view slot="title" class="custom-title">
    <text>{{pageTitle}}</text>
    <text class="subtitle">{{pageSubtitle}}</text>
  </view>

  <!-- 自定义右侧 -->
  <view slot="right" class="custom-right">
    <icon type="search" size="20" bindtap="onSearch" />
    <icon type="more" size="20" bindtap="onMore" />
  </view>
</custom-navbar>
```

### WXSS 样式示例
```scss
/* 组件基础样式 */
.custom-navbar {
  width: 100%;
  min-height: 88rpx;
  background: var(--color-ink-0);
  position: relative;
  z-index: 1000;
  transition: all 0.3s ease;
}

/* 导航栏内容 */
.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  position: relative;
}

/* 左侧返回区域 */
.navbar-left {
  display: flex;
  align-items: center;
  min-width: 88rpx;
  height: 88rpx;
}

.navbar-back {
  display: flex;
  align-items: center;
  padding: 0 16rpx;
  height: 100%;
}

.navbar-back-icon {
  width: 32rpx;
  height: 32rpx;
  margin-right: 8rpx;
}

.navbar-back-text {
  font-size: 28rpx;
  color: var(--color-ink-700);
}

/* 标题区域 */
.navbar-title {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  padding: 0 24rpx;
}

.navbar-title-text {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--color-ink-900);
  line-height: 44rpx;
}

.navbar-subtitle {
  font-size: 24rpx;
  color: var(--color-ink-600);
  line-height: 32rpx;
  margin-top: 4rpx;
}

/* 右侧操作区域 */
.navbar-right {
  display: flex;
  align-items: center;
  min-width: 88rpx;
  height: 88rpx;
  justify-content: flex-end;
}

.navbar-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 88rpx;
  height: 88rpx;
  position: relative;
}

.navbar-action-icon {
  width: 40rpx;
  height: 40rpx;
}

.navbar-action-text {
  font-size: 24rpx;
  color: var(--color-ink-700);
}

/* 底部边框 */
.navbar-border {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1rpx;
  background: var(--color-ink-100);
  transform: scaleY(0.5);
}

/* 状态栏占位 */
.navbar-placeholder {
  width: 100%;
  background: var(--color-ink-0);
}

/* 主题适配 */
.custom-navbar.dark {
  background: var(--color-ink-900);
}

.custom-navbar.dark .navbar-title-text {
  color: var(--color-ink-0);
}

.custom-navbar.dark .navbar-subtitle {
  color: var(--color-ink-300);
}

.custom-navbar.dark .navbar-back-text {
  color: var(--color-ink-200);
}

.custom-navbar.dark .navbar-border {
  background: var(--color-ink-700);
}

/* 透明状态 */
.custom-navbar.transparent {
  background: transparent;
}

.custom-navbar.transparent .navbar-title-text {
  color: white;
  text-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.3);
}

/* 沉浸状态 */
.custom-navbar.immersive {
  background: transparent;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

/* 加载状态 */
.navbar-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 24rpx;
}

.navbar-loading-icon {
  width: 32rpx;
  height: 32rpx;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## 版本与变更记录

### 版本历史
- **v1.0.0** (2025-09-22): 初始版本，支持基本导航功能
- **v1.1.0** (计划): 支持自定义主题和动态样式切换
- **v1.2.0** (计划): 添加更多操作按钮类型和菜单功能
- **v2.0.0** (计划): 支持国际化多语言和ARIA增强

### 变更说明
- **v1.0.0**: 实现基础导航功能，包括返回、标题、操作按钮
- **v1.1.0**: 增加主题切换、动态背景、沉浸式支持
- **v1.2.0**: 扩展操作按钮类型，支持下拉菜单、搜索框等复杂交互
- **v2.0.0**: 全面支持国际化，增强无障碍访问功能

---

**组件维护者**: MindGuard前端团队
**最后更新**: 2025-09-22
**相关文档**: [导航系统设计](../功能文档/功能-导航系统.md), [样式规范](../前端样式/样式规范/README.md)