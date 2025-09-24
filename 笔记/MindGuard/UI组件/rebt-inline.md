# 组件：rebt-inline/REBT内联

> 理性情绪行为疗法（REBT）的内联编辑器组件，支持结构化情绪分析和认知重构，是MindGuard心理专业功能的核心组件。

## 位置与作用

**出现页面**：
- 主包：`pages/journal/index` - 心情随笔Tab页面
- 分包：`packages/journal/diary-detail/index` - 日记详情页
- 分包：`packages/journal/diary-edit/index` - 日记编辑页

**承担任务**：
- 提供A（诱发事件）-B（信念）-C（结果）-D（辩驳）-E（新信念）的结构化分析
- 引导用户识别非理性信念并进行认知重构
- 集成AI建议功能，提供专业的认知行为疗法指导
- 支持语音输入和多媒体内容记录
- 生成个性化的行动建议和任务

## Props（属性）

| 名称 | 类型 | 必填 | 默认 | 说明 |
|------|------|------|------|------|
| `visible` | Boolean | ✅ | false | 组件显示状态 |
| `data` | Object | ❌ | null | REBT分析数据对象 |
| `mode` | String | ❌ | 'analysis' | 模式：'analysis' \| 'guidance' \| 'quick' |
| `step` | String | ❌ | 'A' | 当前步骤：'A' \| 'B' \| 'C' \| 'D' \| 'E' |
| `editable` | Boolean | ❌ | true | 是否可编辑 |
| `showAI` | Boolean | ❌ | true | 是否显示AI建议功能 |
| `theme` | String | ❌ | 'light' | 主题：'light' \| 'dark' |

## Slots（插槽）

| 插槽名 | 用途 | 说明 |
|--------|------|------|
| `header` | 组件头部自定义 | 可替换默认的REBT标题区域 |
| `step-a` | A步骤自定义 | 可自定义诱发事件输入区域 |
| `step-b` | B步骤自定义 | 可自定义信念分析区域 |
| `step-c` | C步骤自定义 | 可自定义结果描述区域 |
| `step-d` | D步骤自定义 | 可自定义辩驳过程区域 |
| `step-e` | E步骤自定义 | 可自定义新信念总结区域 |
| `footer` | 底部操作区自定义 | 可自定义底部按钮组 |

## Events（事件）

| 事件名 | 触发时机 | 回调参数 | 埋点映射 |
|--------|---------|---------|---------|
| `onClose` | 用户点击关闭按钮 | `{type: 'close', step: string, data: object}` | `act_rebt_close` |
| `onSave` | 用户点击保存按钮 | `{type: 'save', data: object, completed: boolean}` | `act_rebt_save` |
| `onStepChange` | 步骤发生变化 | `{type: 'stepChange', fromStep: string, toStep: string}` | `act_rebt_step_change` |
| `onSuggest` | 用户请求AI建议 | `{type: 'suggest', step: string, context: object}` | `act_rebt_ai_suggest` |
| `onVoiceStart` | 开始语音录制 | `{type: 'voiceStart', step: string}` | `act_rebt_voice_start` |
| `onVoiceEnd` | 结束语音录制 | `{type: 'voiceEnd', step: string, duration: number}` | `act_rebt_voice_end` |
| `onComplete` | 完成REBT分析 | `{type: 'complete', data: object, suggestions: array}` | `act_rebt_complete` |

## Methods（外部可调）

| 方法名 | 入参与返回 | 使用示例 |
|--------|------------|---------|
| `show(step?: string)` | 入参：步骤；返回：void | `this.selectComponent('#rebt').show('B')` |
| `hide()` | 入参：无；返回：void | `this.selectComponent('#rebt').hide()` |
| `setData(data: object)` | 入参：REBT数据；返回：void | `this.selectComponent('#rebt').setData({...})` |
| `getCurrentData()` | 入参：无；返回：object | `this.selectComponent('#rebt').getCurrentData()` |
| `validateStep(step: string)` | 入参：步骤；返回：boolean | `this.selectComponent('#rebt').validateStep('A')` |
| `generateSuggestions()` | 入参：无；返回：Promise<`array`> | `this.selectComponent('#rebt').generateSuggestions()` |
| `exportData()` | 入参：无；返回：object | `this.selectComponent('#rebt').exportData()` |

## Data Contract（数据契约）

### 输入字段
| 字段 | 来源服务/集合 | 说明 |
|------|-------------|------|
| `data.id` | journals集合 | REBT记录唯一标识 |
| `data.journal_id` | journals集合 | 关联的日记ID |
| `data.step_a` | journals集合 | 诱发事件描述 |
| `data.step_b` | journals集合 | 非理性信念分析 |
| `data.step_c` | journals集合 | 情绪和行为结果 |
| `data.step_d` | journals集合 | 理性辩驳过程 |
| `data.step_e` | journals集合 | 新的理性信念 |
| `data.ai_suggestions` | journals集合 | AI生成的建议数组 |
| `data.completed` | journals集合 | 是否完成分析 |
| `data.created_at` | journals集合 | 创建时间 |
| `data.updated_at` | journals集合 | 更新时间 |

### 输出/回写
| 字段 | 目标集合/接口 | 权限 | 说明 |
|------|-------------|------|------|
| `journals.rebt_struct` | journals集合 | 写 | REBT结构化数据 |
| `suggestions.content` | suggestions集合 | 写 | 生成的建议内容 |
| `behavior_tasks.title` | behavior_tasks集合 | 写 | 生成的行动任务 |
| `user_events.event_type` | user_events集合 | 写 | REBT分析完成事件 |
| `analytics_data.rebt_usage` | analytics集合 | 写 | REBT使用分析数据 |

## 视觉与交互（对齐样式规范）

### 尺寸与间距
- **组件容器**：宽度 686rpx，最小高度 800rpx
- **步骤指示器**：高度 80rpx，圆角 40rpx
- **内容区域**：左右边距 32rpx，上下边距 24rpx
- **输入框**：高度 120rpx，圆角 16rpx
- **按钮尺寸**：88×88rpx（最小点击区域）

### 颜色（Token映射）
| 元素 | Token | 色值 | 用途 |
|------|-------|------|------|
| 组件背景 | `--color-ink-0` | #F7F9FC | 组件主体背景 |
| 步骤指示器 | `--color-cbt-purple` | #6D28D9 | REBT专业功能色 |
| 已完成步骤 | `--color-success-500` | #2AC28D | 已完成的步骤标记 |
| 当前步骤 | `--color-brand-500` | #3A7BD5 | 当前进行中的步骤 |
| 输入框边框 | `--color-ink-200` | #D7DEE7 | 输入框边框颜色 |
| 输入框聚焦 | `--color-brand-400` | #6FA4FF | 输入框聚焦状态 |
| 按钮主色 | `--color-brand-500` | #3A7BD5 | 主要操作按钮 |
| 按钮次色 | `--color-ink-600` | #5A6672 | 次要操作按钮 |
| AI建议背景 | `--color-cbt-purple-50` | #EDE9FE | AI建议区域背景 |
| 文字主色 | `--color-ink-900` | #2C3640 | 主要文字颜色 |
| 文字次色 | `--color-ink-600` | #5A6672 | 次要文字颜色 |

### 状态变化
- **normal**: 默认展开状态，显示当前步骤内容
- **editing**: 编辑状态，输入框获得焦点，显示输入工具栏
- **loading**: AI建议生成中，显示加载动画
- **completed**: 完成状态，所有步骤标记为已完成
- **disabled**: 禁用状态，无法进行编辑操作
- **error**: 错误状态，显示错误提示和重试按钮
- **voice-recording**: 语音录制状态，显示录音动画和波形

### 可访问性
- **对比度**: 所有文本对比度 ≥ 4.5:1，REBT专用色对比度经过特殊优化
- **步骤指示**: 除了颜色变化，还提供图标和文字状态提示
- **键盘导航**: 支持Tab键在步骤间切换，Enter键确认
- **屏幕阅读器**: 完整的ARIA标签，描述每个步骤的作用和状态
- **语音提示**: 语音录制时提供音频和视觉双重反馈

## 性能与包体

### 性能优化
- **懒加载**: REBT内容在需要时才加载，避免首屏压力
- **步骤缓存**: 每个步骤的内容独立缓存，避免重复渲染
- **AI防抖**: AI建议请求使用防抖，避免频繁调用
- **语音优化**: 语音录制使用Web Audio API，减少资源占用

### 包体控制
- **主包归属**: 位于主包，因为心情随笔是核心功能
- **独立模块**: REBT功能相对独立，便于后续拆分
- **CDN资源**: 语音识别和AI处理使用云端服务，减少本地包体
- **按需加载**: 复杂的图表和可视化功能按需加载

## 埋点（来自数据分析需求）

| 场景 | 事件名 | 参数 |
|------|--------|------|
| REBT组件曝光 | `exp_rebt_component` | `journalId`, `mode`, `step` |
| 步骤切换 | `act_rebt_step_change` | `fromStep`, `toStep`, `timeSpent` |
| 内容输入 | `act_rebt_content_input` | `step`, `contentType`, `length` |
| AI建议请求 | `act_rebt_ai_suggest` | `step`, `context`, `responseTime` |
| 语音录制 | `act_rebt_voice_record` | `step`, `duration`, `success` |
| 保存操作 | `act_rebt_save` | `step`, `completionRate`, `dataSize` |
| 完成分析 | `act_rebt_complete` | `totalTime`, `stepsCompleted`, `suggestionsCount` |
| 任务生成 | `act_rebt_task_generated` | `taskId`, `suggestionSource`, `priority` |

## 测试要点

### 单测
- **步骤流程**: 测试A-E五个步骤的完整流程
- **数据验证**: 测试输入数据的验证和错误处理
- **AI集成**: 测试AI建议功能的正确调用和响应处理
- **语音功能**: 测试语音录制、转写和保存功能

### E2E测试
- **完整REBT流程**: 从A步骤到E步骤的完整分析流程
- **AI建议体验**: AI建议的生成、展示和应用流程
- **数据同步**: REBT数据与日记、任务的同步机制
- **错误恢复**: 网络异常、AI服务不可用时的降级处理

### 专业性测试
- **心理学准确性**: REBT模型的专业性和准确性验证
- **建议质量**: AI生成建议的专业性和有用性评估
- **用户体验**: 心理脆弱用户的使用体验和安全性评估
- **隐私保护**: 敏感心理数据的加密和保护机制

## 示例（WXML/WXSS 片段）

### WXML 使用示例
```xml
<!-- 基础使用 -->
<rebt-inline visible="{{showREBT}}" data="{{rebtdData}}" />

<!-- 完整配置 -->
<rebt-inline
  id="rebt-component"
  visible="{{showREBT}}"
  data="{{currentREBT}}"
  mode="analysis"
  step="{{currentStep}}"
  editable="{{true}}"
  showAI="{{true}}"
  theme="light"
  bind:close="onREBTClose"
  bind:save="onREBTSave"
  bind:stepChange="onStepChange"
  bind:suggest="onAISuggest"
  bind:complete="onREBTComplete"
>
  <!-- 自定义头部 -->
  <view slot="header" class="custom-header">
    <text>理性情绪行为疗法分析</text>
    <text>让我们一起识别和改变非理性信念</text>
  </view>

  <!-- 自定义底部 -->
  <view slot="footer" class="custom-footer">
    <button bindtap="onSaveProgress">保存进度</button>
    <button bindtap="onGetHelp">需要帮助</button>
  </view>
</rebt-inline>
```

### WXSS 样式示例
```scss
/* 组件基础样式 */
.rebt-inline {
  width: 686rpx;
  min-height: 800rpx;
  background: var(--color-ink-0);
  border-radius: 32rpx;
  margin: 16rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

/* 步骤指示器 */
.step-indicator {
  display: flex;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  margin-bottom: 32rpx;
}

.step-item {
  flex: 1;
  text-align: center;
  position: relative;
}

.step-item::after {
  content: '';
  position: absolute;
  top: 20rpx;
  left: 50%;
  width: 100%;
  height: 2rpx;
  background: var(--color-ink-200);
  z-index: 1;
}

.step-item:last-child::after {
  display: none;
}

.step-icon {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: var(--color-ink-200);
  color: var(--color-ink-600);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 8rpx;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.step-item.active .step-icon {
  background: var(--color-brand-500);
  color: white;
  transform: scale(1.1);
}

.step-item.completed .step-icon {
  background: var(--color-success-500);
  color: white;
}

/* 内容区域 */
.step-content {
  padding: 0 32rpx 32rpx;
}

.step-input {
  width: 100%;
  min-height: 120rpx;
  background: white;
  border: 2rpx solid var(--color-ink-200);
  border-radius: 16rpx;
  padding: 16rpx;
  font-size: 28rpx;
  line-height: 40rpx;
  transition: all 0.3s ease;
}

.step-input:focus {
  border-color: var(--color-brand-400);
  box-shadow: 0 0 0 4rpx rgba(58, 123, 213, 0.1);
}

/* AI建议区域 */
.ai-suggestions {
  background: var(--color-cbt-purple-50);
  border-radius: 16rpx;
  padding: 24rpx;
  margin: 24rpx 0;
}

.ai-suggestion-item {
  background: white;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 12rpx;
  border-left: 4rpx solid var(--color-cbt-purple);
}

/* 语音录制动画 */
.voice-recording {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  padding: 24rpx;
  background: var(--color-brand-50);
  border-radius: 16rpx;
}

.voice-wave {
  width: 200rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.voice-bar {
  width: 4rpx;
  height: 20rpx;
  background: var(--color-brand-500);
  border-radius: 2rpx;
  animation: wave 1s ease-in-out infinite;
}

.voice-bar:nth-child(2) { animation-delay: 0.1s; }
.voice-bar:nth-child(3) { animation-delay: 0.2s; }
.voice-bar:nth-child(4) { animation-delay: 0.3s; }
.voice-bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes wave {
  0%, 100% { height: 20rpx; }
  50% { height: 40rpx; }
}
```

## 版本与变更记录

### 版本历史
- **v1.0.0** (2025-09-22): 初始版本，支持基本REBT分析流程
- **v1.1.0** (计划): 集成更先进的AI模型，提升建议质量
- **v1.2.0** (计划): 支持多语言和跨文化适应
- **v2.0.0** (计划): 增强可视化分析，添加图表展示

### 变更说明
- **v1.0.0**: 实现REBT的A-E五个步骤的完整分析流程
- **v1.1.0**: 升级AI模型，提供更个性化和专业化的认知重构建议
- **v1.2.0**: 支持多语言界面，适应不同文化背景的用户需求
- **v2.0.0**: 添加情绪趋势图表、信念变化轨迹等可视化功能

---

**组件维护者**: MindGuard前端团队 + 心理学专业团队
**最后更新**: 2025-09-22
**相关文档**: [REBT疗法说明](../功能文档/功能-理性情绪行为疗法.md), [AI工作流配置](../dify/rebt-workflow.md)