# 组件：risk-banner/风险横幅

> MindGuard小程序的风险提示组件，用于展示不同等级的风险内容提示，支持自动跳转和用户引导，是社区安全保障的核心组件。

## 位置与作用

**出现页面**：
- **树洞Tab**：帖子风险等级提示和引导
- **帖子详情页**：详细风险提示和资源推荐
- **发布帖子页**：内容风险自检和提醒
- **SOS页面**：紧急风险提示和求助引导
- **个人中心**：风险提示设置和状态展示

**承担任务**：
- 展示R1-R4四级风险等级的视觉提示
- 提供风险相关的操作引导和资源链接
- 支持自动跳转到风险处理页面
- 集成风险等级的颜色标识和图标展示
- 提供用户可关闭的风险提示功能
- 支持自定义风险提示内容和样式

## Props（属性）

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `level` | String | ✅ | 'R1' | 风险等级：'R1' \| 'R2' \| 'R3' \| 'R4' |
| `title` | String | ❌ | '' | 标题文字 |
| `description` | String | ❌ | '' | 描述文字 |
| `showClose` | Boolean | ❌ | true | 是否显示关闭按钮 |
| `autoDismiss` | Boolean | ❌ | false | 是否自动消失 |
| `duration` | Number | ❌ | 5000 | 自动消失时间（毫秒） |
| `actionText` | String | ❌ | '' | 操作按钮文字 |
| `actionUrl` | String | ❌ | '' | 操作跳转链接 |
| `closable` | Boolean | ❌ | true | 是否可手动关闭 |
| `pulsing` | Boolean | ❌ | false | 是否显示脉冲动画（R4级别） |

## Slots（插槽）

| 插槽名 | 用途 | 说明 |
|--------|------|------|
| `icon` | 图标区域 | 可替换默认的风险等级图标 |
| `title` | 标题区域 | 可自定义标题显示样式 |
| `description` | 描述区域 | 可自定义描述文字内容 |
| `action` | 操作区域 | 可自定义操作按钮样式 |
| `extra` | 额外内容 | 可添加额外的提示信息或链接 |

## Events（事件）

| 事件名 | 触发时机 | 回调参数 | 埋点映射 |
|--------|---------|---------|---------|
| `onAction` | 用户点击操作按钮 | `{type: 'action', level: string, action: string, url: string}` | `act_risk_action` |
| `onClose` | 用户点击关闭按钮 | `{type: 'close', level: string, manual: boolean}` | `act_risk_close` |
| `onDismiss` | 横幅自动消失 | `{type: 'dismiss', level: string, duration: number}` | `act_risk_dismiss` |
| `onShow` | 横幅显示时 | `{type: 'show', level: string, trigger: string}` | `exp_risk_banner` |
| `onAutoNavigate` | 自动跳转触发 | `{type: 'autoNavigate', level: string, targetUrl: string}` | `act_risk_auto_navigate` |

## Methods（外部可调）

| 方法名 | 入参与返回 | 使用示例 |
|--------|------------|---------|
| `show(level: string)` | 入参：风险等级；返回：void | `this.selectComponent('#risk').show('R3')` |
| `hide()` | 入参：无；返回：void | `this.selectComponent('#risk').hide()` |
| `setLevel(level: string)` | 入参：风险等级；返回：void | `this.selectComponent('#risk').setLevel('R2')` |
| `updateContent(content: object)` | 入参：内容对象；返回：void | `this.selectComponent('#risk').updateContent({...})` |
| `startPulse()` | 入参：无；返回：void | `this.selectComponent('#risk').startPulse()` |
| `stopPulse()` | 入参：无；返回：void | `this.selectComponent('#risk').stopPulse()` |

## Data Contract（数据契约）

### 输入字段
| 字段 | 来源服务/集合 | 说明 |
|------|-------------|------|
| `level` | forum_posts集合 | 风险等级标识（R1-R4） |
| `title` | 风险提示配置 | 标题文字内容 |
| `description` | 风险提示配置 | 描述文字内容 |
| `actionText` | 风险提示配置 | 操作按钮文字 |
| `actionUrl` | 风险提示配置 | 操作跳转路径 |
| `autoDismiss` | 风险提示配置 | 自动消失配置 |
| `duration` | 风险提示配置 | 显示时长配置 |

### 输出/回写
| 字段 | 目标集合/接口 | 权限 | 说明 |
|------|-------------|------|------|
| `user_events.event_type` | user_events集合 | 写 | 风险提示交互事件记录 |
| `risk_assessments.user_action` | analytics集合 | 写 | 用户风险响应行为分析 |
| `content_moderation.banner_dismiss` | forum_posts集合 | 写 | 风险横幅关闭记录 |

## 视觉与交互（对齐样式规范）

### 尺寸与间距
- **横幅容器**：宽度 100%，高度 96rpx（基础高度）
- **内容区域**：左右边距 32rpx，上下内边距 24rpx
- **图标尺寸**：48×48rpx，圆角 50%
- **文字区域**：左内边距 24rpx，右内边距 32rpx
- **按钮尺寸**：64×32rpx（小按钮），88×88rpx（标准按钮）

### 颜色（Token映射）
| 元素 | Token | 色值 | 用途 |
|------|-------|------|------|
| R1背景 | `--color-risk-r1` | #3A7BD5 | 观察级别风险 |
| R2背景 | `--color-risk-r2` | #F59E0B | 关注级别风险 |
| R3背景 | `--color-risk-r3` | #F97316 | 警示级别风险 |
| R4背景 | `--color-risk-r4` | #DC2626 | 危急级别风险 |
| 文字颜色 | `--color-ink-0` | #FFFFFF | 风险提示文字 |
| 图标颜色 | `--color-ink-0` | #FFFFFF | 风险提示图标 |
| 关闭按钮 | `--color-ink-0` | #FFFFFF | 关闭按钮颜色 |
| 边框颜色 | `--color-risk-border` | rgba(255,255,255,0.3) | 边框和分割线 |

### 状态变化
- **normal**: 默认状态，正常显示风险提示内容
- **pulsing**: 脉冲状态，R4级别的紧急提醒动画
- **dismissing**: 消失中状态，横幅逐渐淡出
- **hover**: 悬停状态，操作按钮高亮效果
- **active**: 激活状态，按钮按下效果
- **closed**: 关闭状态，横幅已隐藏

### 可访问性
- **对比度**: 所有文本对比度 ≥ 4.5:1，确保清晰可读
- **颜色区分**: 除了颜色，还使用图标和文字区分风险等级
- **键盘导航**: 支持Tab键导航和Enter键激活
- **屏幕阅读器**: 完整的ARIA标签，描述风险等级和操作

## 性能与包体

### 性能优化
- **动画优化**: 使用CSS3动画和transform，减少重排重绘
- **定时器管理**: 合理管理自动消失的定时器，避免内存泄漏
- **事件节流**: 关闭按钮点击事件使用节流，防止重复操作
- **样式缓存**: 风险等级样式预定义，减少动态计算

### 包体控制
- **主包归属**: 位于主包，为所有风险相关页面提供支持
- **图标优化**: 使用内联SVG或字体图标，减少资源请求
- **代码压缩**: 组件代码已经过压缩和优化
- **依赖控制**: 最小化外部依赖，确保组件独立性

## 埋点（来自数据分析需求）

| 场景 | 事件名 | 参数 |
|------|--------|------|
| 风险横幅曝光 | `exp_risk_banner` | `riskLevel`, `pagePath`, `triggerType`, `content` |
| 风险操作点击 | `act_risk_action` | `riskLevel`, `actionType`, `targetUrl`, `buttonText` |
| 风险提示关闭 | `act_risk_close` | `riskLevel`, `closeType` (manual/auto), `displayTime` |
| 自动跳转触发 | `act_risk_auto_navigate` | `riskLevel`, `targetUrl`, `autoDismissTime` |
| 风险等级切换 | `act_risk_level_change` | `fromLevel`, `toLevel`, `changeReason` |

## 测试要点

### 单测
- **等级测试**: 验证四个风险等级的正确显示和样式
- **事件测试**: 验证各种用户交互事件的正确触发
- **动画测试**: 验证脉冲动画和过渡效果的正确性
- **自动消失**: 验证自动消失功能的准确性和时机

### E2E测试
- **风险引导流程**: 完整的风险提示到用户操作的转化流程
- **自动跳转验证**: 自动跳转功能的正确性和用户体验
- **关闭机制**: 手动关闭和自动消失的稳定性测试
- **多场景覆盖**: 不同页面和场景下的风险提示效果

### 边界测试
- **快速操作**: 快速点击关闭按钮的处理
- **网络异常**: 跳转链接异常时的降级处理
- **状态切换**: 风险等级快速切换的显示效果
- **性能压力**: 大量风险提示同时出现的性能表现

## 示例（WXML/WXSS 片段）

### WXML 使用示例
```xml
<!-- 基础使用 -->
<risk-banner
  level="R2"
  title="内容需要关注"
  description="该内容可能包含情绪困扰，建议谨慎处理"
  action-text="查看帮助"
  action-url="/pages/help/index"
  bind:action="onRiskAction"
  bind:close="onRiskClose"
/>

<!-- 完整配置 -->
<risk-banner
  id="risk-banner"
  level="R3"
  title="需要紧急关注"
  description="检测到可能的情绪危机，建议立即寻求帮助"
  action-text="立即求助"
  action-url="/packages/sos/index"
  show-close="{{true}}"
  auto-dismiss="{{false}}"
  pulsing="{{true}}"
  bind:action="onSOSAction"
  bind:close="onRiskClose"
  bind:show="onRiskShow"
>
  <!-- 自定义图标 -->
  <view slot="icon" class="custom-icon">
    <image src="/assets/icons/risk-warning.png" mode="aspectFit" />
  </view>

  <!-- 自定义标题 -->
  <view slot="title" class="custom-title">
    <text>自定义风险标题</text>
  </view>

  <!-- 自定义描述 -->
  <view slot="description" class="custom-description">
    <text>这是自定义的风险描述内容</text>
    <text>可以包含更多的详细信息和引导</text>
  </view>

  <!-- 自定义操作 -->
  <view slot="action" class="custom-action">
    <button class="sos-btn" bindtap="onSOSClick">紧急求助</button>
    <button class="help-btn" bindtap="onHelpClick">查看帮助</button>
  </view>
</risk-banner>
```

### WXSS 样式示例
```scss
/* 组件基础样式 */
.risk-banner {
  width: 100%;
  min-height: 96rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  position: relative;
  transition: all 0.3s ease;
}

/* 风险等级颜色 */
.risk-banner.level-R1 {
  background: var(--color-risk-r1);
}

.risk-banner.level-R2 {
  background: var(--color-risk-r2);
}

.risk-banner.level-R3 {
  background: var(--color-risk-r3);
}

.risk-banner.level-R4 {
  background: var(--color-risk-r4);
}

/* 内容区域 */
.risk-content {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.risk-icon {
  width: 48rpx;
  height: 48rpx;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.risk-icon image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.risk-text {
  flex: 1;
  min-width: 0;
  margin-right: 32rpx;
}

.risk-title {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--color-ink-0);
  line-height: 40rpx;
  margin-bottom: 4rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.risk-description {
  font-size: 24rpx;
  color: var(--color-ink-0);
  line-height: 32rpx;
  opacity: 0.9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 操作区域 */
.risk-action {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-shrink: 0;
}

.risk-action-button {
  height: 64rpx;
  padding: 0 32rpx;
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.2);
  color: var(--color-ink-0);
  font-size: 24rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.risk-action-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2rpx);
}

.risk-action-button:active {
  transform: translateY(0);
}

/* 关闭按钮 */
.risk-close {
  width: 32rpx;
  height: 32rpx;
  margin-left: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.risk-close:hover {
  transform: scale(1.1);
}

.risk-close:active {
  transform: scale(0.9);
}

.risk-close image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 脉冲动画 */
.risk-banner.pulsing {
  animation: risk-pulse 2s ease-in-out infinite;
}

@keyframes risk-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}

/* R4级别特殊效果 */
.risk-banner.level-R4.pulsing {
  animation: risk-emergency 1.5s ease-in-out infinite;
}

@keyframes risk-emergency {
  0%, 100% {
    opacity: 1;
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 0 8rpx rgba(220, 38, 38, 0);
  }
}

/* 消失动画 */
.risk-banner.dismissing {
  animation: dismiss-out 0.3s ease-out forwards;
}

@keyframes dismiss-out {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20rpx);
  }
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .risk-banner {
    padding: 20rpx 24rpx;
    min-height: 80rpx;
  }

  .risk-title {
    font-size: 26rpx;
  }

  .risk-description {
    font-size: 22rpx;
  }

  .risk-action-button {
    height: 56rpx;
    padding: 0 24rpx;
    font-size: 22rpx;
  }
}

/* 暗色主题适配 */
.risk-banner.dark {
  border: 2rpx solid rgba(255, 255, 255, 0.1);
}

.risk-banner.dark .risk-action-button {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 自定义样式覆盖 */
.risk-banner .custom-icon {
  width: 56rpx;
  height: 56rpx;
}

.risk-banner .custom-title {
  font-size: 30rpx;
  font-weight: 600;
}

.risk-banner .custom-description {
  font-size: 26rpx;
  line-height: 36rpx;
}

.risk-banner .custom-action {
  display: flex;
  gap: 12rpx;
}

.risk-banner .sos-btn {
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-risk-r4);
  border: none;
}

.risk-banner .help-btn {
  background: transparent;
  color: var(--color-ink-0);
  border: 2rpx solid var(--color-ink-0);
}
```

## 版本与变更记录

### 版本历史
- **v1.0.0** (2025-09-22): 初始版本，支持四级风险提示
- **v1.1.0** (计划): 支持智能风险识别和个性化提示
- **v1.2.0** (计划): 添加更多风险处理资源和引导
- **v2.0.0** (计划): 支持AI风险评估和实时监控

### 变更说明
- **v1.0.0**: 实现基础风险提示功能，支持四个风险等级
- **v1.1.0**: 增加AI智能识别，提供更精准的风险评估
- **v1.2.0**: 扩展风险处理资源，提供更全面的用户引导
- **v2.0.0**: 支持实时风险监控和动态调整策略

---

**组件维护者**: MindGuard前端团队 + 安全团队
**最后更新**: 2025-09-22
**相关文档**: [风险系统设计](../功能文档/功能-树洞风险提示与温和守护.md), [安全规范](../功能文档/功能-安全保障机制.md)