# 组件：stats-row/统计数据行

> MindGuard小程序的统计数据展示组件，支持多种数据格式的统一展示，包含趋势分析和交互功能，是数据可视化的核心组件。

## 位置与作用

**出现页面**：
- **今天Tab**：情绪状态、任务完成度等今日数据展示
- **个人中心**：徽章数量、护心周报等统计数据
- **周报详情**：详细的健康数据分析
- **徽章详情**：成就进度和统计信息
- **任务管理**：任务完成情况和进度统计

**承担任务**：
- 展示各类统计数据和指标
- 支持趋势分析和对比功能
- 提供数据的可视化展示
- 集成交互式数据探索功能
- 支持多种数据格式的统一处理
- 提供用户友好的数据解读

## Props（属性）

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `items` | Array | ✅ | [] | 统计数据项数组 |
| `layout` | String | ❌ | 'horizontal' | 布局方式：'horizontal' \| 'vertical' \| 'grid' |
| `size` | String | ❌ | 'medium' | 尺寸：'small' \| 'medium' \| 'large' |
| `showTrend` | Boolean | ❌ | true | 是否显示趋势指示器 |
| `clickable` | Boolean | ❌ | false | 是否可点击 |
| `border` | Boolean | ❌ | true | 是否显示边框 |
| `spacing` | Number | ❌ | 16 | 间距大小（rpx） |
| `theme` | String | ❌ | 'light' | 主题：'light' \| 'dark' |

## Slots（插槽）

| 插槽名 | 用途 | 说明 |
|--------|------|------|
| `item` | 单个数据项 | 可自定义单个数据项的展示样式 |
| `label` | 标签区域 | 可自定义数据标签的显示 |
| `value` | 数值区域 | 可自定义数值的显示样式 |
| `trend` | 趋势区域 | 可自定义趋势指示器的显示 |
| `extra` | 额外内容 | 可添加额外的统计信息或操作 |

## Events（事件）

| 事件名 | 触发时机 | 回调参数 | 埋点映射 |
|--------|---------|---------|---------|
| `onItemClick` | 用户点击数据项 | `{type: 'itemClick', item: object, index: number}` | `act_stats_item_click` |
| `onItemLongPress` | 用户长按数据项 | `{type: 'itemLongPress', item: object, index: number}` | `act_stats_item_longpress` |
| `onTrendClick` | 用户点击趋势指示器 | `{type: 'trendClick', item: object, trend: string}` | `act_stats_trend_click` |
| `onLoadMore` | 用户点击加载更多 | `{type: 'loadMore', currentItems: array}` | `act_stats_loadmore` |
| `onRefresh` | 用户点击刷新 | `{type: 'refresh', timestamp: number}` | `act_stats_refresh` |

## Methods（外部可调）

| 方法名 | 入参与返回 | 使用示例 |
|--------|------------|---------|
| `updateItems(items: array)` | 入参：数据项数组；返回：void | `this.selectComponent('#stats').updateItems([...])` |
| `addItem(item: object)` | 入参：数据项；返回：void | `this.selectComponent('#stats').addItem({...})` |
| `removeItem(index: number)` | 入参：索引；返回：void | `this.selectComponent('#stats').removeItem(0)` |
| `refreshData()` | 入参：无；返回：void | `this.selectComponent('#stats').refreshData()` |
| `setLoading(loading: boolean)` | 入参：加载状态；返回：void | `this.selectComponent('#stats').setLoading(true)` |

## Data Contract（数据契约）

### 输入字段
| 字段 | 来源服务/集合 | 说明 |
|------|-------------|------|
| `items[].label` | 多个服务 | 数据项标签文字 |
| `items[].value` | 多个服务 | 数据值（数字或字符串） |
| `items[].unit` | 多个服务 | 数据单位 |
| `items[].trend` | 多个服务 | 趋势：'up' \| 'down' \| 'stable' |
| `items[].change` | 多个服务 | 变化值 |
| `items[].color` | 多个服务 | 自定义颜色 |
| `items[].icon` | 多个服务 | 图标标识 |
| `items[].clickable` | 多个服务 | 是否可点击 |
| `items[].url` | 多个服务 | 跳转链接 |

### 输出/回写
| 字段 | 目标集合/接口 | 权限 | 说明 |
|------|-------------|------|------|
| `user_events.event_type` | user_events集合 | 写 | 统计数据交互事件记录 |
| `analytics_data.item_clicks` | analytics集合 | 写 | 数据项点击分析 |
| `user_behavior.data_explore` | analytics集合 | 写 | 用户数据探索行为分析 |

## 视觉与交互（对齐样式规范）

### 尺寸与间距
- **组件容器**：宽度 100%，最小高度 120rpx
- **数据项**：最小宽度 160rpx（横向），高度 88rpx（纵向）
- **标签文字**：字体大小 24rpx，行高 32rpx
- **数值文字**：字体大小 32rpx，行高 44rpx
- **趋势图标**：24×24rpx，边距 8rpx
- **点击区域**：最小 88×88rpx

### 颜色（Token映射）
| 元素 | Token | 色值 | 用途 |
|------|-------|------|------|
| 组件背景 | `--color-ink-0` | #F7F9FC | 组件主体背景 |
| 标签文字 | `--color-ink-600` | #5A6672 | 数据标签文字 |
| 数值文字 | `--color-ink-900` | #2C3640 | 主要数值文字 |
| 趋势上升 | `--color-success-500` | #2AC28D | 上升趋势颜色 |
| 趋势下降 | `--color-danger-500` | #DC2626 | 下降趋势颜色 |
| 趋势稳定 | `--color-warning-500` | #F59E0B | 稳定趋势颜色 |
| 边框颜色 | `--color-ink-100` | #E9EDF3 | 组件边框颜色 |
| 点击反馈 | `--color-brand-50` | #EEF5FF | 点击反馈背景 |

### 状态变化
- **normal**: 默认状态，正常显示统计数据
- **loading**: 加载状态，显示加载动画
- **refreshing**: 刷新状态，显示刷新动画
- **hover**: 悬停状态，可点击项高亮效果
- **active**: 激活状态，点击按下效果
- **disabled**: 禁用状态，不可交互状态

### 可访问性
- **对比度**: 所有文本对比度 ≥ 4.5:1，确保清晰可读
- **颜色区分**: 除了颜色，还使用图标和文字区分趋势
- **键盘导航**: 支持Tab键导航和Enter键激活
- **屏幕阅读器**: 完整的ARIA标签，描述数据含义

## 性能与包体

### 性能优化
- **虚拟列表**: 大量数据时使用虚拟滚动技术
- **懒加载**: 图片和复杂图表按需加载
- **防抖节流**: 点击事件使用防抖，避免重复操作
- **缓存机制**: 数据缓存，减少重复请求

### 包体控制
- **主包归属**: 位于主包，为所有数据展示页面提供支持
- **图标优化**: 使用字体图标或内联SVG
- **代码压缩**: 组件代码已经过压缩和优化
- **依赖控制**: 最小化外部依赖，确保组件独立性

## 埋点（来自数据分析需求）

| 场景 | 事件名 | 参数 |
|------|--------|------|
| 统计行曝光 | `exp_stats_row` | `pagePath`, `itemCount`, `layout`, `dataType` |
| 数据项点击 | `act_stats_item_click` | `itemLabel`, `itemValue`, `clickPosition`, `hasTrend` |
| 趋势指示点击 | `act_stats_trend_click` | `itemLabel`, `trendType`, `changeValue` |
| 长按数据项 | `act_stats_item_longpress` | `itemLabel`, `itemValue`, `pressDuration` |
| 刷新数据 | `act_stats_refresh` | `pagePath`, `refreshType`, `itemCount` |

## 测试要点

### 单测
- **数据格式测试**: 验证不同数据格式的正确显示
- **布局测试**: 验证不同布局方式的正确排列
- **事件测试**: 验证各种用户交互事件的正确触发
- **趋势测试**: 验证趋势指示器的正确显示和计算

### E2E测试
- **数据加载**: 完整的数据加载和展示流程
- **交互探索**: 用户点击和长按的探索行为
- **刷新机制**: 数据刷新和更新的正确性
- **响应式测试**: 不同屏幕尺寸的适配效果

### 边界测试
- **空数据处理**: 空数据或异常数据的处理
- **大数据量**: 大量数据的性能和显示效果
- **快速操作**: 快速点击和连续操作的响应
- **异常恢复**: 网络异常和数据错误的恢复

## 示例（WXML/WXSS 片段）

### WXML 使用示例
```xml
<!-- 基础使用 -->
<stats-row
  items="{{statsData}}"
  layout="horizontal"
  show-trend="{{true}}"
  clickable="{{true}}"
  bind:itemClick="onStatsItemClick"
/>

<!-- 完整配置 -->
<stats-row
  id="stats-row"
  items="{{healthStats}}"
  layout="grid"
  size="medium"
  show-trend="{{true}}"
  clickable="{{true}}"
  border="{{true}}"
  spacing="16"
  theme="light"
  bind:itemClick="onStatsItemClick"
  bind:trendClick="onTrendClick"
  bind:refresh="onRefresh"
>
  <!-- 自定义数据项 -->
  <view slot="item" class="custom-item" wx:for="{{healthStats}}" wx:key="label">
    <view class="custom-label">{{item.label}}</view>
    <view class="custom-value">{{item.value}}{{item.unit}}</view>
    <view class="custom-trend" wx:if="{{item.trend}}">
      <icon type="trend-{{item.trend}}" size="16" />
      <text>{{item.change}}</text>
    </view>
  </view>

  <!-- 自定义标签 -->
  <view slot="label" class="custom-label">
    <text>{{item.label}}</text>
    <icon type="info" size="12" wx:if="{{item.description}}" />
  </view>

  <!-- 自定义数值 -->
  <view slot="value" class="custom-value">
    <text class="number">{{item.value}}</text>
    <text class="unit">{{item.unit}}</text>
  </view>

  <!-- 自定义趋势 -->
  <view slot="trend" class="custom-trend">
    <view class="trend-icon {{item.trend}}">
      <icon type="arrow-{{item.trend}}" size="12" />
    </view>
    <text class="trend-value">{{item.change}}</text>
  </view>
</stats-row>
```

### WXSS 样式示例
```scss
/* 组件基础样式 */
.stats-row {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  background: var(--color-ink-0);
  border-radius: 16rpx;
  padding: 24rpx;
  box-sizing: border-box;
}

/* 横向布局 */
.stats-row.horizontal {
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
}

.stats-row.horizontal .stats-item {
  flex: 1;
  min-width: 160rpx;
  text-align: center;
}

/* 纵向布局 */
.stats-row.vertical {
  flex-direction: column;
  gap: 24rpx;
}

.stats-row.vertical .stats-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 网格布局 */
.stats-row.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;
}

.stats-row.grid .stats-item {
  text-align: center;
}

/* 单个数据项 */
.stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16rpx;
  border-radius: 12rpx;
  transition: all 0.3s ease;
  position: relative;
}

.stats-item.clickable {
  cursor: pointer;
}

.stats-item.clickable:hover {
  background: var(--color-brand-50);
  transform: translateY(-2rpx);
}

.stats-item.clickable:active {
  transform: translateY(0);
}

/* 数据标签 */
.stats-label {
  font-size: 24rpx;
  color: var(--color-ink-600);
  line-height: 32rpx;
  margin-bottom: 8rpx;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 数值区域 */
.stats-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4rpx;
}

.stats-number {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--color-ink-900);
  line-height: 44rpx;
}

.stats-unit {
  font-size: 20rpx;
  color: var(--color-ink-600);
  line-height: 28rpx;
}

/* 趋势指示器 */
.stats-trend {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  margin-top: 8rpx;
  font-size: 20rpx;
  line-height: 28rpx;
}

.stats-trend.up {
  color: var(--color-success-500);
}

.stats-trend.down {
  color: var(--color-danger-500);
}

.stats-trend.stable {
  color: var(--color-warning-500);
}

.stats-trend-icon {
  width: 16rpx;
  height: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-trend-icon.up {
  transform: rotate(-45deg);
}

.stats-trend-icon.down {
  transform: rotate(45deg);
}

/* 边框样式 */
.stats-row.with-border {
  border: 2rpx solid var(--color-ink-100);
}

.stats-row.with-border .stats-item:not(:last-child) {
  border-right: 2rpx solid var(--color-ink-100);
}

/* 尺寸变体 */
.stats-row.small .stats-label {
  font-size: 20rpx;
  line-height: 28rpx;
}

.stats-row.small .stats-number {
  font-size: 28rpx;
  line-height: 40rpx;
}

.stats-row.small .stats-unit {
  font-size: 18rpx;
  line-height: 24rpx;
}

.stats-row.small .stats-trend {
  font-size: 18rpx;
  line-height: 24rpx;
}

.stats-row.large .stats-label {
  font-size: 28rpx;
  line-height: 40rpx;
}

.stats-row.large .stats-number {
  font-size: 40rpx;
  line-height: 56rpx;
}

.stats-row.large .stats-unit {
  font-size: 24rpx;
  line-height: 32rpx;
}

.stats-row.large .stats-trend {
  font-size: 24rpx;
  line-height: 32rpx;
}

/* 加载状态 */
.stats-row.loading .stats-item {
  opacity: 0.6;
}

.stats-row.loading .stats-number {
  animation: loading-pulse 1.5s ease-in-out infinite;
}

@keyframes loading-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* 主题适配 */
.stats-row.dark {
  background: var(--color-ink-900);
  border-color: var(--color-ink-700);
}

.stats-row.dark .stats-label {
  color: var(--color-ink-300);
}

.stats-row.dark .stats-number {
  color: var(--color-ink-0);
}

.stats-row.dark .stats-unit {
  color: var(--color-ink-400);
}

.stats-row.dark .stats-item.clickable:hover {
  background: var(--color-ink-800);
}

/* 自定义样式覆盖 */
.stats-row .custom-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.stats-row .custom-label {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-weight: 500;
}

.stats-row .custom-value {
  display: flex;
  align-items: baseline;
  gap: 2rpx;
}

.stats-row .custom-value .number {
  font-weight: 700;
}

.stats-row .custom-trend {
  display: flex;
  align-items: center;
  gap: 4rpx;
  font-weight: 500;
}

.stats-row .custom-trend .trend-icon {
  width: 12rpx;
  height: 12rpx;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .stats-row.grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 500rpx) {
  .stats-row.horizontal {
    flex-direction: column;
    gap: 16rpx;
  }

  .stats-row.grid {
    grid-template-columns: 1fr;
  }
}
```

## 版本与变更记录

### 版本历史
- **v1.0.0** (2025-09-22): 初始版本，支持基本统计数据显示
- **v1.1.0** (计划): 支持更多图表类型和交互功能
- **v1.2.0** (计划): 添加数据导出和分享功能
- **v2.0.0** (计划): 支持AI数据分析和智能推荐

### 变更说明
- **v1.0.0**: 实现基础统计数据展示功能
- **v1.1.0**: 增加图表类型和交互探索功能
- **v1.2.0**: 添加数据导出、分享等高级功能
- **v2.0.0**: 支持AI智能分析和个性化推荐

---

**组件维护者**: MindGuard前端团队
**最后更新**: 2025-09-22
**相关文档**: [数据可视化规范](../功能文档/功能-数据可视化.md), [用户体验设计](../功能文档/功能-用户体验设计.md)