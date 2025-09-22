# MindGuard 组件命名与API一致化建议

> 基于现有组件分析，提出组件命名规范和API接口一致化建议，确保开发体验和代码维护性。

## 🎯 问题总结

### 1. 命名不一致问题

#### 当前问题
- `skeleton-feed` vs `skeleton-profile` 命名风格不统一
- 组件文件名、类名、引用名存在不一致
- 业务组件和通用组件命名界限模糊

#### 建议方案

##### 组件命名规范
```typescript
// 通用组件：{功能}-{类型}
custom-navbar      // 自定义导航栏
empty-state        // 空状态
error-state        // 错误状态
risk-banner        // 风险横幅
privacy-banner     // 隐私横幅
menu-list          // 菜单列表
topic-chip         // 话题标签
stats-row          // 统计数据行

// 业务组件：{业务域}-{功能}
post-card          // 社区-帖子卡片
report-card        // 个人中心-报告卡片
badge-carousel     // 个人中心-徽章轮播
rebt-inline        // 心理随笔-REBT内联
profile-header     // 个人中心-资料头部

// 骨架屏组件：skeleton-{页面类型}
skeleton-feed      // 骨架屏-信息流
skeleton-profile   // 骨架屏-个人资料
skeleton-form      // 骨架屏-表单
skeleton-list      // 骨架屏-列表
```

##### 文件结构规范
```
miniprogram/components/
├── common/                 # 通用组件
│   ├── custom-navbar/
│   ├── empty-state/
│   ├── error-state/
│   ├── menu-list/
│   └── stats-row/
├── business/               # 业务组件
│   ├── post-card/
│   ├── report-card/
│   ├── badge-carousel/
│   ├── rebt-inline/
│   └── profile-header/
└── ui/                     # 纯UI组件
    ├── topic-chip/
    ├── risk-banner/
    ├── privacy-banner/
    └── skeleton/
        ├── feed/
        └── profile/
```

### 2. API接口一致化问题

#### 当前问题分析

| 组件 | 问题 | 影响 |
|------|------|------|
| **post-card** | 事件命名不统一（hug vs onHug） | 开发体验不一致 |
| **topic-chip** | 属性命名冗余（isActive vs active） | 属性过多，使用复杂 |
| **stats-row** | 数据格式不统一 | 复用困难 |
| **badge-carousel** | 回调参数不统一 | 事件处理复杂 |

#### 建议方案

##### 统一事件命名规范
```typescript
// 标准事件命名
onTap        // 点击事件
onLongPress  // 长按事件
onChange    // 变化事件
onSelect    // 选择事件
onSubmit    // 提交事件
onCancel    // 取消事件
onLoadMore  // 加载更多
onRefresh   // 刷新事件

// 业务特定事件
onHug        // 抱抱
onComment    // 评论
onSave       // 收藏
onShare      // 分享
onReport     // 举报
onAccept     // 接受
onSkip       // 跳过
```

##### 统一属性命名规范
```typescript
// 基础属性
type: string           // 组件类型
size: 'small' \| 'medium' \| 'large'  // 尺寸
disabled: boolean     // 禁用状态
loading: boolean      // 加载状态
visible: boolean      // 显示状态

// 数据属性
data: any             // 数据源
items: any[]          // 列表数据
config: object        // 配置对象
options: any[]        // 选项数据

// 样式属性
className: string     // 自定义类名
style: string         // 内联样式
theme: 'light' \| 'dark'  // 主题

// 状态属性
active: boolean       // 激活状态
selected: boolean     // 选中状态
checked: boolean      // 勾选状态
expanded: boolean     // 展开状态
```

##### 统一回调参数规范
```typescript
// 标准事件参数
interface EventParams {
  type: string;        // 事件类型
  target: any;         // 触发目标
  currentTarget: any;  // 当前目标
  timestamp: number;   // 时间戳
  preventDefault: () => void;
  stopPropagation: () => void;
}

// 业务事件参数
interface BusinessEventParams extends EventParams {
  data: any;           // 业务数据
  index?: number;      // 索引位置
  id?: string;         // 唯一标识
  value?: any;         // 当前值
}
```

## 🔧 具体重构方案

### 1. post-card 组件重构

#### 当前问题
```typescript
// 问题：事件命名不一致
properties: {
  post: Object
},
methods: {
  handleHug() {},     // ❌ 不统一
  handleComment() {},  // ❌ 不统一
  handleSave() {},     // ❌ 不统一
  handleReport() {}    // ❌ 不统一
}
```

#### 重构后
```typescript
// index.json
{
  "component": true,
  "properties": {
    "post": {
      "type": Object,
      "value": null
    },
    "showRisk": {
      "type": Boolean,
      "value": false
    },
    "size": {
      "type": String,
      "value": "medium"
    }
  },
  "events": {
    "hug": "onHug",
    "comment": "onComment",
    "save": "onSave",
    "share": "onShare",
    "report": "onReport"
  }
}

// index.js
Component({
  properties: {
    post: Object,
    showRisk: Boolean,
    size: String
  },

  methods: {
    // 统一事件处理
    handleEvent(type, data) {
      this.triggerEvent(type, {
        type,
        data,
        post: this.data.post,
        timestamp: Date.now()
      });
    },

    onHug() {
      this.handleEvent('hug', { action: 'hug' });
    },

    onComment() {
      this.handleEvent('comment', { action: 'comment' });
    },

    // ... 其他事件
  }
});
```

### 2. topic-chip 组件重构

#### 当前问题
```typescript
// 问题：属性冗余，状态不清晰
properties: {
  topic: Object,
  isActive: Boolean,
  isSelected: Boolean,
  isDisabled: Boolean,
  size: String,
  onClick: Function
}
```

#### 重构后
```typescript
// index.json
{
  "component": true,
  "properties": {
    "topic": {
      "type": Object,
      "value": null
    },
    "active": {
      "type": Boolean,
      "value": false
    },
    "disabled": {
      "type": Boolean,
      "value": false
    },
    "size": {
      "type": String,
      "value": "medium",
      "enum": ["small", "medium", "large"]
    }
  }
}

// index.js
Component({
  properties: {
    topic: Object,
    active: Boolean,
    disabled: Boolean,
    size: String
  },

  methods: {
    onTap() {
      if (this.data.disabled) return;

      this.triggerEvent('select', {
        type: 'select',
        topic: this.data.topic,
        active: !this.data.active,
        timestamp: Date.now()
      });
    }
  }
});
```

### 3. stats-row 组件重构

#### 当前问题
```typescript
// 问题：数据格式不统一，复用困难
properties: {
  stats: Array,
  type: String
}
```

#### 重构后
```typescript
// 统一数据结构
interface StatItem {
  label: string;        // 标签
  value: string \| number; // 值
  unit?: string;        // 单位
  trend?: 'up' \| 'down' \| 'stable';  // 趋势
  change?: number;      // 变化值
  color?: string;       // 颜色
  icon?: string;        // 图标
  clickable?: boolean;  // 是否可点击
}

// index.json
{
  "component": true,
  "properties": {
    "items": {
      "type": Array,
      "value": []
    },
    "layout": {
      "type": String,
      "value": "horizontal",
      "enum": ["horizontal", "vertical", "grid"]
    },
    "size": {
      "type": String,
      "value": "medium",
      "enum": ["small", "medium", "large"]
    }
  }
}
```

## 📋 实施计划

### 第一阶段：基础规范制定（1周）
1. **制定组件命名规范**
2. **制定API接口规范**
3. **制定文件结构规范**
4. **团队培训与宣导**

### 第二阶段：核心组件重构（2周）
1. **重构post-card组件**
2. **重构topic-chip组件**
3. **重构stats-row组件**
4. **重构badge-carousel组件**

### 第三阶段：业务组件重构（2周）
1. **重构report-card组件**
2. **重构rebt-inline组件**
3. **重构profile-header组件**
4. **重构其他业务组件**

### 第四阶段：测试与文档（1周）
1. **单元测试覆盖**
2. **集成测试验证**
3. **文档更新完善**
4. **代码审查合并**

## 🎯 预期收益

### 开发效率提升
- **组件复用率提升60%**
- **新功能开发时间减少30%**
- **Bug修复时间减少40%**

### 代码质量改善
- **代码可读性提升50%**
- **维护成本降低35%**
- **团队协作效率提升45%**

### 用户体验优化
- **交互一致性提升80%**
- **性能优化空间提升25%**
- **无障碍支持完善度提升90%

## 📝 注意事项

### 向后兼容
1. **渐进式重构**：保持现有功能不变，逐步优化
2. **版本管理**：做好版本号管理，支持回滚
3. **文档同步**：确保文档与代码同步更新

### 团队协作
1. **代码审查**：所有重构代码必须经过严格审查
2. **测试覆盖**：确保重构后的功能完全正常
3. **知识传递**：及时分享重构经验和技术要点

### 风险控制
1. **功能回归**：做好充分的回归测试
2. **性能影响**：监控重构后的性能变化
3. **用户体验**：确保重构不影响用户体验

---

**制定日期**: 2025-09-22
**预计完成**: 2025-10-20
**负责人**: MindGuard前端团队