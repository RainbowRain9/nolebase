# MindGuard UI组件文档

> MindGuard小程序UI组件的完整文档体系，提供组件开发规范、使用指南和最佳实践。

## 📚 文档结构

### 📖 核心文档
- **[组件文档总览](UI组件文档.md)** - 完整的组件清单、覆盖矩阵和重构建议
- **[命名与API一致化建议](命名与API一致化建议.md)** - 统一的命名规范和API设计指南
- **[覆盖矩阵](覆盖矩阵.csv)** - 页面与组件的覆盖关系表格
- **[校验报告](校验报告.md)** - 组件质量校验结果和改进建议

### 🎯 组件详细规格
- **[custom-navbar](custom-navbar.md)** - 自定义导航栏组件
- **[empty-state](empty-state.md)** - 空状态展示组件
- **[risk-banner](risk-banner.md)** - 风险提示横幅组件
- **[stats-row](stats-row.md)** - 统计数据行组件
- **[topic-chip](topic-chip.md)** - 话题标签组件
- **[post-card](post-card.md)** - 帖子卡片组件
- **[rebt-inline](rebt-inline.md)** - REBT心理疗法组件

## 🚀 快速开始

### 1. 组件使用原则
- **Token优先**: 严格使用设计Token，禁止硬编码颜色值
- **一致性**: 遵循统一的API命名和数据结构规范
- **无障碍**: 确保所有组件满足WCAG 2.1 AA标准
- **性能**: 优化包体体积和渲染性能

### 2. 标准使用模式
```xml
<!-- 基础组件使用 -->
<component-name
  id="unique-id"
  data="{{componentData}}"
  bind:event="onEventHandler"
>
  <!-- 自定义插槽内容 -->
  <view slot="slot-name">自定义内容</view>
</component-name>
```

### 3. 数据结构规范
```typescript
interface BaseComponentProps {
  id?: string;
  className?: string;
  style?: string;
  disabled?: boolean;
  loading?: boolean;
  visible?: boolean;
}

interface InteractiveComponentProps extends BaseComponentProps {
  onClick?: (event: Event) => void;
  onLongPress?: (event: Event) => void;
}
```

## 📋 组件分类

### 导航与头部组件
- **custom-navbar** - 自定义导航栏，支持返回、标题、操作按钮

### 内容展示组件
- **post-card** - 树洞帖子完整展示，包含图片、互动、风险提示
- **report-card** - 护心周报展示，包含图表、统计数据
- **badge-carousel** - 用户获得的护心徽章展示，支持滑动查看
- **rebt-inline** - 理性情绪行为疗法内联编辑器
- **stats-row** - 健康摘要统计数据展示
- **topic-chip** - 话题标签展示和选择

### 状态反馈组件
- **empty-state** - 各种场景的空状态展示
- **error-state** - 错误状态展示，支持重试和刷新
- **risk-banner** - 风险等级提示横幅，支持自动跳转
- **privacy-banner** - 隐私授权提醒横幅

### 交互组件
- **menu-list** - 网格布局的菜单列表

### 加载组件
- **skeleton-feed** - 信息流的骨架屏加载效果
- **skeleton-profile** - 个人资料的骨架屏加载效果

## 🎨 设计Token

### 颜色Token
```scss
// 品牌色
--color-brand-500: #3A7BD5;
--color-brand-400: #6FA4FF;
--color-brand-50: #EEF5FF;

// 文字色
--color-ink-900: #2C3640;
--color-ink-600: #5A6672;
--color-ink-400: #8B95A7;
--color-ink-0: #F7F9FC;

// 功能色
--color-success-500: #2AC28D;
--color-warning-500: #F59E0B;
--color-danger-500: #DC2626;

// 风险色
--color-risk-r1: #3A7BD5;
--color-risk-r2: #F59E0B;
--color-risk-r3: #F97316;
--color-risk-r4: #DC2626;
```

### 尺寸Token
```scss
// 间距系列
--spacing-xs: 8rpx;
--spacing-sm: 16rpx;
--spacing-md: 24rpx;
--spacing-lg: 32rpx;
--spacing-xl: 48rpx;

// 字体大小
--font-size-xs: 20rpx;
--font-size-sm: 24rpx;
--font-size-md: 28rpx;
--font-size-lg: 32rpx;
--font-size-xl: 36rpx;
```

## 🔧 开发规范

### 命名规范
- **组件文件名**: kebab-case (如 `post-card`)
- **组件类名**: PascalCase (如 `PostCard`)
- **事件名**: camelCase (如 `onItemTap`)
- **属性名**: camelCase (如 `isLoading`)

### 事件处理规范
```typescript
// 标准事件处理函数
handleEvent(type: string, data: any) {
  this.triggerEvent(type, {
    type,
    data,
    timestamp: Date.now(),
    // 其他标准字段
  });
}
```

### 样式规范
```scss
/* 使用Token */
.component {
  background: var(--color-ink-0);
  color: var(--color-ink-900);
  padding: var(--spacing-md);
}

/* 响应式设计 */
.component {
  /* 默认样式 */
}

@media (max-width: 750rpx) {
  .component {
    /* 移动端适配 */
  }
}
```

## 📊 质量标准

### 对比度要求
- **常规文本**: 对比度 ≥ 4.5:1
- **大文本**: 对比度 ≥ 3:1
- **非文本元素**: 对比度 ≥ 3:1

### 性能要求
- **包体体积**: 主包 < 2MB，分包 < 1MB
- **加载时间**: 首屏 < 1s，交互响应 < 100ms
- **内存使用**: 组件实例 < 50KB

### 无障碍要求
- **ARIA标签**: 所有交互元素都有完整标签
- **键盘导航**: 支持Tab键和方向键导航
- **屏幕阅读器**: 兼容主流屏幕阅读器

## 🎯 使用指南

### 1. 组件选择
根据使用场景选择合适的组件：
- **导航场景**: 使用 `custom-navbar`
- **内容展示**: 使用 `post-card`、`stats-row`
- **状态反馈**: 使用 `empty-state`、`risk-banner`
- **用户交互**: 使用 `topic-chip`、`menu-list`

### 2. 数据传递
```javascript
// 标准数据格式
const componentData = {
  id: 'unique-identifier',
  title: '组件标题',
  description: '组件描述',
  // 其他业务数据
};

// 事件处理
onComponentHandle(event) {
  const { type, data } = event.detail;
  // 处理事件
}
```

### 3. 自定义样式
```scss
/* 通过className自定义 */
.custom-style {
  background: var(--color-brand-50);
  border-radius: var(--radius-lg);
}

/* 通过插槽自定义 */
<view slot="custom-slot" class="custom-content">
  自定义内容
</view>
```

## 🐛 常见问题

### Q: 如何处理组件间的通信？
A: 推荐使用事件总线或页面级状态管理，避免直接组件间调用。

### Q: 如何优化组件性能？
A: 使用虚拟列表、图片懒加载、事件防抖等技术手段。

### Q: 如何确保组件的一致性？
A: 严格遵循设计Token和API规范，使用自动化工具进行检查。

## 📞 技术支持

- **文档维护**: MindGuard前端团队
- **设计支持**: MindGuard设计团队
- **问题反馈**: 通过GitHub Issues提交
- **功能建议**: 通过产品经理提出

## 📄 更新日志

### v1.0.0 (2025-09-22)
- ✅ 完成15个核心组件的文档编写
- ✅ 建立完整的组件规范体系
- ✅ 提供详细的使用指南和最佳实践
- ✅ 完成质量校验和优化建议

### 计划中的更新
- 🔄 v1.1.0: 增加组件自动化测试工具
- 🔄 v1.2.0: 完善国际化支持
- 🔄 v2.0.0: 组件库独立化和工具链建设

---

**文档版本**: v1.0.0
**最后更新**: 2025-09-22
**维护团队**: MindGuard前端团队 + 设计团队