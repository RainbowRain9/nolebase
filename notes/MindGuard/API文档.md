# MindGuard API 文档

> **MindGuard** 心理健康支持小程序 API 接口文档
>
> 版本：v1.0.0 | 更新时间：2025年10月20日
>
> 文档状态：✅ 完整 | 🔄 持续更新中

---

## 📖 文档导航

- [概览](#概览)
- [认证规范](#认证规范)
- [服务层API](#服务层api)
- [云函数API](#云函数api)
- [数据模型](#数据模型)
- [错误处理](#错误处理)
- [开发指南](#开发指南)

---

## 🎯 概览

### 项目架构

MindGuard 采用分层架构设计，包含以下核心层级：

```
┌─────────────────────────────────────┐
│           小程序前端层              │
│  - 5个主Tab页面 + 7个分包页面        │
│  - TDesign UI组件库                │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│           服务层 (API层)            │
│  - 18个服务模块                     │
│  - Mock数据支持                     │
│  - 数据归一化处理                   │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│           云函数层                  │
│  - 19个云函数                       │
│  - Dify AI工作流集成                │
│  - 业务逻辑编排                     │
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│           数据层                    │
│  - 微信云数据库 (NoSQL)             │
│  - 云存储                           │
└─────────────────────────────────────┘
```

### 技术栈

- **前端**: 微信小程序 (WXML/WXSS/JS)
- **后端**: 微信云开发 (CloudBase)
- **AI能力**: Dify 工作流
- **UI框架**: TDesign Miniprogram
- **数据库**: NoSQL (微信云数据库)

### 核心功能模块

1. **情绪健康闭环**: 情绪打卡 → AI建议 → 任务执行 → 行为改善
2. **社区守护系统**: 树洞发帖 → 风险识别 → 互助支持 → 危机干预
3. **成长激励体系**: 徽章系统 → 周报生成 → 趋势分析 → 成长记录
4. **AI对话系统**: 多Agent对话 → 专业支持 → 个性化建议

---

## 🔐 认证规范

### 微信小程序认证

所有API调用需要通过微信小程序的云开发认证系统：

```javascript
// 微信小程序登录流程
wx.cloud.callFunction({
  name: 'wxlogin',
  data: {
    code: 'wx_code'  // 微信登录code
  }
});
```

### Mock模式控制

开发环境可通过Mock开关控制数据来源：

```javascript
// 启用Mock模式（开发调试）
wx.setStorageSync('USE_MOCK', true);

// 禁用Mock模式（生产环境）
wx.setStorageSync('USE_MOCK', false);
```

---

## 📡 服务层API

### 1. 认证服务 (auth.js)

#### `getCurrentUser()` - 获取当前用户信息

**接口描述**: 获取当前登录用户的详细信息

**请求参数**:
```javascript
{
  // 暂无参数
}
```

**响应数据**:
```javascript
{
  id: 'user_001',
  openid: 'ox_xxx',
  nickname: '小明',
  avatarUrl: 'https://xxx.jpg',
  profile: {
    school: '清华大学',
    grade: '大三',
    major: '计算机科学'
  },
  permissions: ['user', 'community_moderator'],
  createdAt: '2024-01-01T00:00:00Z'
}
```

**使用示例**:
```javascript
import { getCurrentUser } from '../services/auth';

const user = await getCurrentUser();
if (user) {
  console.log('当前用户:', user.nickname);
}
```

---

### 2. 情绪打卡服务 (checkins.js)

#### `getTodayCheckin()` - 获取今日打卡

**接口描述**: 获取用户今天的情绪打卡记录

**请求参数**: 无

**响应数据**:
```javascript
{
  id: 'ck_20241020_a',
  mood: 'calm',                    // 情绪类型
  intensity: 4,                    // 情绪强度 1-5
  energyLevel: 3,                  // 能量水平 1-5
  tags: ['放松', '阅读'],          // 情绪标签
  note: '今天读了喜欢的书，心情很好',
  hasCheckedIn: true,              // 是否已打卡
  date: '2024-10-20',
  createdAt: '2024-10-20T20:30:00Z'
}
```

#### `createCheckin(payload)` - 创建打卡记录

**接口描述**: 创建新的情绪打卡记录

**请求参数**:
```javascript
{
  mood: 'calm',                    // 情绪类型 (必填)
  intensity: 4,                    // 情绪强度 1-5 (必填)
  energyLevel: 3,                  // 能量水平 1-5 (可选)
  tags: ['放松', '阅读'],          // 情绪标签 (可选)
  note: '今天读了喜欢的书'         // 打卡备注 (可选)
}
```

**响应数据**: 同 `getTodayCheckin()` 格式

#### `listRecent(params)` - 获取近期打卡列表

**接口描述**: 获取用户近期的情绪打卡记录

**请求参数**:
```javascript
{
  range: 'week',                   // 查询范围: 'week' | 'month'
  limit: 7,                       // 返回数量限制
  offset: 0                       // 偏移量
}
```

**响应数据**:
```javascript
{
  data: [
    {
      id: 'ck_20241020_a',
      mood: 'calm',
      intensity: 4,
      date: '2024-10-20',
      hasCheckedIn: true
    }
    // ... 更多记录
  ],
  hasMore: false,
  total: 7
}
```

#### `getMoodWheel(params)` - 获取心情轮数据

**接口描述**: 获取情绪可视化数据，用于生成心情轮图表

**请求参数**:
```javascript
{
  range: 'week'                    // 查询范围: 'week' | 'month'
}
```

**响应数据**:
```javascript
{
  range: 'week',
  startDate: '2024-10-14',
  endDate: '2024-10-20',
  emotionData: [
    {
      date: '2024-10-20',
      emotion: 'calm',
      intensity: 4,
      color: '#5B8FF9',
      label: '平静'
    }
    // ... 更多数据点
  ],
  statistics: {
    totalDays: 7,
    checkedDays: 5,
    dominantEmotion: 'calm',
    averageIntensity: 3.8
  }
}
```

**使用示例**:
```javascript
import { getTodayCheckin, createCheckin, getMoodWheel } from '../services/checkins';

// 获取今日打卡
const todayCheckin = await getTodayCheckin();

// 创建新打卡
const newCheckin = await createCheckin({
  mood: 'calm',
  intensity: 4,
  tags: ['放松'],
  note: '今天心情不错'
});

// 获取心情轮数据
const moodWheel = await getMoodWheel({ range: 'week' });
```

---

### 3. 任务服务 (tasks.js)

#### `getTodayTasks()` - 获取今日任务

**接口描述**: 获取用户今天的所有任务列表

**请求参数**: 无

**响应数据**:
```javascript
{
  data: [
    {
      id: 'task_001',
      title: '晚间复盘 5 分钟',
      description: '回顾今天的收获和感受，为明天做准备',
      status: 'pending',             // pending | in_progress | completed | skipped
      source: 'suggestion',          // suggestion | journal | action_card
      category: 'emotion',
      priority: 'medium',           // low | medium | high
      estimatedDurationMinutes: 5,
      dueAt: '2024-10-20T22:00:00Z',
      checklistSteps: [
        {
          text: '回顾今天的重要事件',
          isDone: false
        }
      ]
    }
    // ... 更多任务
  ],
  summary: {
    total: 4,
    completed: 2,
    pending: 1,
    inProgress: 1,
    completionRate: 0.5
  }
}
```

#### `createTaskFromSuggestion(payload)` - 从建议创建任务

**接口描述**: 将AI建议转化为可执行任务

**请求参数**:
```javascript
{
  suggestionId: 'sg_001',          // 建议ID (必填)
  customTitle: '自定义任务标题',    // 自定义标题 (可选)
  dueTime: '2024-10-20T22:00:00Z'  // 截止时间 (可选)
}
```

**响应数据**: 同任务对象格式

#### `updateStatus(taskId, status)` - 更新任务状态

**接口描述**: 更新任务的执行状态

**请求参数**:
```javascript
{
  taskId: 'task_001',              // 任务ID (必填)
  status: 'completed',             // 新状态 (必填)
  checklistUpdate: {               // 检查清单更新 (可选)
    stepIndex: 0,                  // 步骤索引
    isDone: true                   // 是否完成
  }
}
```

**响应数据**: 更新后的完整任务对象

#### `getSummary(params)` - 获取任务统计

**接口描述**: 获取任务完成情况的统计数据

**请求参数**:
```javascript
{
  range: 'week',                   // 统计范围: 'week' | 'month'
  category: 'all'                  // 任务分类: 'all' | 'emotion' | 'relationship' | 'study'
}
```

**响应数据**:
```javascript
{
  range: 'week',
  totalTasks: 15,
  completedTasks: 12,
  completionRate: 0.8,
  categoryStats: {
    emotion: { total: 5, completed: 4 },
    relationship: { total: 6, completed: 5 },
    study: { total: 4, completed: 3 }
  },
  dailyStats: [
    { date: '2024-10-14', completed: 2, total: 3 },
    { date: '2024-10-15', completed: 3, total: 4 }
    // ... 每日统计
  ]
}
```

**使用示例**:
```javascript
import { getTodayTasks, updateStatus, getSummary } from '../services/tasks';

// 获取今日任务
const todayTasks = await getTodayTasks();

// 更新任务状态
const updatedTask = await updateStatus('task_001', 'completed');

// 获取任务统计
const summary = await getSummary({ range: 'week' });
```

---

### 4. 微建议服务 (suggestions.js)

#### `getTodaySuggestions()` - 获取今日建议

**接口描述**: 获取基于用户情绪状态生成的个性化建议

**请求参数**: 无

**响应数据**:
```javascript
{
  data: [
    {
      id: 'sg_001',
      title: '与室友约定安静时段',
      description: '准备三个建议时段，与室友讨论并确认',
      category: 'relationship',
      priority: 'medium',
      estimatedDurationMinutes: 20,
      reasoning: '基于你最近的情绪状态，良好的室友关系有助于改善心情',
      status: 'active',             // active | accepted | skipped
      createdAt: '2024-10-20T09:00:00Z'
    }
    // ... 更多建议
  ],
  meta: {
    total: 3,
    new: 1,
    basedOnMood: 'anxious',
    generatedAt: '2024-10-20T08:30:00Z'
  }
}
```

#### `acceptSuggestion(id)` - 接受建议

**接口描述**: 接受AI建议，并可选择创建为任务

**请求参数**:
```javascript
{
  id: 'sg_001',                    // 建议ID (必填)
  createTask: true,                // 是否创建为任务 (可选)
  taskDueTime: '2024-10-20T22:00:00Z' // 任务截止时间 (可选)
}
```

**响应数据**: 接受后的建议对象

#### `skipSuggestion(id)` - 跳过建议

**接口描述**: 跳过当前建议，获取下一个建议

**请求参数**:
```javascript
{
  id: 'sg_001',                    // 建议ID (必填)
  reason: '暂时不需要'             // 跳过原因 (可选)
}
```

**响应数据**: 跳过后的建议对象

---

### 5. 社区服务 (forum.js)

#### `fetchFeed(params)` - 获取帖子列表

**接口描述**: 获取社区帖子流，支持多种筛选和排序

**请求参数**:
```javascript
{
  page: 1,                         // 页码 (默认: 1)
  pageSize: 20,                   // 每页数量 (默认: 20)
  topic: 'all',                    // 话题筛选: 'all' | 'study' | 'emotion' | 'relationship'
  sort: 'latest',                  // 排序: 'latest' | 'popular' | 'hugged'
  riskFilter: 'all'               // 风险筛选: 'all' | 'safe' | 'watch'
}
```

**响应数据**:
```javascript
{
  data: [
    {
      id: 'post_001',
      title: '期末周的压力',
      content: '最近准备考研，和室友节奏不同有点焦虑...',
      aliasName: '小蓝鲸',
      anonymityMode: 'anon',       // anon | pseudonym
      tags: ['考研', '室友', '焦虑'],
      topic: 'study',
      moodThermometer: 38,         // 情绪温度计 0-100
      riskScore: 0.35,            // 风险评分 0-1
      riskFlag: 'watch',          // none | watch | escalated | crisis
      riskLevel: 2,               // 风险等级 1-4
      status: 'published',
      commentCount: 5,
      hugCount: 18,
      isHugged: false,
      isFavorited: false,
      publishedAt: '2024-10-20T15:30:00Z',
      images: []
    }
    // ... 更多帖子
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 150,
    hasMore: true
  },
  filters: {
    activeTopic: 'study',
    activeSort: 'latest'
  }
}
```

#### `publishPost(params)` - 发布帖子

**接口描述**: 发布新的社区帖子

**请求参数**:
```javascript
{
  title: '期末周的压力',            // 标题 (必填)
  content: '最近准备考研...',      // 内容 (必填)
  anonymityMode: 'anon',          // 匿名模式 (必填)
  aliasName: '小蓝鲸',            // 别名 (pseudonym模式必填)
  tags: ['考研', '室友'],          // 标签 (可选)
  topic: 'study',                 // 话题 (可选)
  moodThermometer: 38,            // 情绪温度计 (可选)
  images: ['https://xxx.jpg']     // 图片列表 (可选)
}
```

**响应数据**: 发布成功的完整帖子对象

#### `getPostDetail(postId)` - 获取帖子详情

**接口描述**: 获取指定帖子的详细信息

**请求参数**:
```javascript
{
  postId: 'post_001'              // 帖子ID (必填)
}
```

**响应数据**: 完整的帖子对象，包含详细内容

#### `submitComment(params)` - 提交评论

**接口描述**: 对帖子进行评论回复

**请求参数**:
```javascript
{
  postId: 'post_001',             // 帖子ID (必填)
  content: '理解你的感受...',     // 评论内容 (必填)
  parentId: null,                 // 父评论ID (回复评论时使用)
  anonymityMode: 'anon'           // 匿名模式 (必填)
}
```

**响应数据**:
```javascript
{
  id: 'comment_001',
  postId: 'post_001',
  content: '理解你的感受...',
  aliasName: '小海豚',
  anonymityMode: 'anon',
  parentId: null,
  createdAt: '2024-10-20T16:00:00Z',
  likeCount: 2,
  isLiked: false
}
```

#### `toggleInteraction(params)` - 互动操作

**接口描述**: 对帖子进行抱抱、收藏等互动操作

**请求参数**:
```javascript
{
  postId: 'post_001',             // 帖子ID (必填)
  action: 'hug',                  // 操作类型: 'hug' | 'favorite' | 'unhug' | 'unfavorite'
}
```

**响应数据**:
```javascript
{
  success: true,
  newCounts: {
    hugCount: 19,                  // 更新后的抱抱数
    favoriteCount: 5               // 更新后的收藏数
  },
  userAction: 'hugged'             // 用户当前状态
}
```

#### `getCommunityHighlight()` - 获取社区高亮

**接口描述**: 获取社区精选内容和统计信息

**请求参数**: 无

**响应数据**:
```javascript
{
  featuredPosts: [
    {
      id: 'post_featured',
      title: '如何应对考试焦虑',
      highlightReason: 'helpful',
      stats: { hugCount: 45, commentCount: 23 }
    }
  ],
  activeTopics: [
    { topic: 'study', postCount: 89 },
    { topic: 'emotion', postCount: 67 }
  ],
  communityStats: {
    totalPosts: 1250,
    activeUsers: 340,
    helpfulInteractions: 2340
  }
}
```

**使用示例**:
```javascript
import { fetchFeed, publishPost, submitComment, toggleInteraction } from '../services/forum';

// 获取帖子列表
const feed = await fetchFeed({ page: 1, topic: 'study' });

// 发布帖子
const newPost = await publishPost({
  title: '分享一个放松方法',
  content: '深呼吸练习很有帮助...',
  anonymityMode: 'anon',
  topic: 'emotion'
});

// 发表评论
const comment = await submitComment({
  postId: 'post_001',
  content: '谢谢分享，很有用！',
  anonymityMode: 'anon'
});

// 点赞互动
const interaction = await toggleInteraction({
  postId: 'post_001',
  action: 'hug'
});
```

---

### 6. 日记服务 (journals.js)

#### `listJournals(params)` - 获取日记列表

**接口描述**: 获取用户的日记列表，支持多种筛选条件

**请求参数**:
```javascript
{
  page: 1,                         // 页码
  pageSize: 20,                   // 每页数量
  keyword: '焦虑',                 // 关键词搜索 (可选)
  tags: ['室友'],                  // 标签筛选 (可选)
  dateRange: {                    // 日期范围 (可选)
    start: '2024-10-01',
    end: '2024-10-20'
  },
  moodRange: {                    // 情绪范围 (可选)
    min: 40,
    max: 80
  },
  entryType: 'all',               // 类型筛选: 'all' | 'text' | 'voice' | 'image'
  shareScope: 'all'              // 分享范围: 'all' | 'private' | 'guardian'
}
```

**响应数据**:
```javascript
{
  data: [
    {
      id: 'journal_001',
      entryType: 'text',           // text | voice | image | mixed
      title: '与室友调解',
      bodyText: '今天和组员开会...',
      moodScore: 68,              // 情绪评分 0-100
      moodTags: ['室友', '沟通'],
      mediaRefs: [],              // 音频/图片引用
      rebtStruct: {               // REBT分析结构
        A: '室友打游戏很吵',      // 诱发事件
        B: '他们不尊重我',        // 不合理信念
        C: '焦虑',                // 情绪后果
        D: '尝试约定时间',        // 辩论
        E: '得到了理解'           // 新的有效信念
      },
      shareScope: 'private',       // private | guardian | public
      source: 'journal_page',
      isFavorited: false,
      createdAt: '2024-10-20T20:20:00Z',
      updatedAt: '2024-10-20T20:25:00Z'
    }
    // ... 更多日记
  ],
  pagination: {
    page: 1,
    pageSize: 20,
    total: 45,
    hasMore: true
  },
  filters: {
    activeTags: ['室友'],
    activeMoodRange: { min: 40, max: 80 }
  }
}
```

#### `getJournal(params)` - 获取日记详情

**接口描述**: 获取指定日记的详细内容

**请求参数**:
```javascript
{
  id: 'journal_001'               // 日记ID (必填)
}
```

**响应数据**: 完整的日记对象

#### `createJournal(payload)` - 创建日记

**接口描述**: 创建新的日记记录

**请求参数**:
```javascript
{
  entryType: 'text',              // 日记类型 (必填)
  title: '今天的心情',             // 标题 (可选)
  bodyText: '今天...',            // 文本内容 (text类型必填)
  moodScore: 68,                 // 情绪评分 (可选)
  moodTags: ['学习', '压力'],      // 情绪标签 (可选)
  shareScope: 'private',          // 分享范围 (必填)
  rebtStruct: {                  // REBT分析 (可选)
    A: '事件',
    B: '想法',
    C: '情绪',
    D: '辩论',
    E: '新信念'
  },
  mediaFiles: [                   // 媒体文件 (可选)
    {
      type: 'voice',
      url: 'cloud://xxx.mp3',
      duration: 120
    }
  ]
}
```

**响应数据**: 创建成功的完整日记对象

#### `updateJournal(id, payload)` - 更新日记

**接口描述**: 更新现有日记的内容

**请求参数**:
```javascript
{
  id: 'journal_001',             // 日记ID (必填)
  title: '更新后的标题',          // 新标题 (可选)
  bodyText: '更新后的内容',       // 新内容 (可选)
  moodScore: 75,                 // 新情绪评分 (可选)
  rebtStruct: {...}             // 新REBT分析 (可选)
}
```

**响应数据**: 更新后的完整日记对象

#### `extractREBT(params)` - 提取REBT分析

**接口描述**: 基于日记内容自动提取REBT分析结构

**请求参数**:
```javascript
{
  journalId: 'journal_001',       // 日记ID (必填)
  autoAnalyze: true              // 是否自动分析 (可选)
}
```

**响应数据**:
```javascript
{
  rebtStruct: {
    A: '室友打游戏很吵',
    B: '他们不尊重我',
    C: '焦虑',
    D: '尝试约定时间',
    E: '得到了理解'
  },
  confidence: 0.85,               // 分析置信度
  suggestions: [
    '尝试与室友进行友好沟通',
    '寻找折中的解决方案'
  ]
}
```

#### `generateSuggestion(journalId)` - 生成微建议

**接口描述**: 基于日记内容生成个性化建议

**请求参数**:
```javascript
{
  journalId: 'journal_001'        // 日记ID (必填)
}
```

**响应数据**:
```javascript
{
  suggestions: [
    {
      title: '制定室友公约',
      description: '与室友商定学习和休息时间',
      category: 'relationship',
      priority: 'high'
    }
  ],
  reasoning: '基于日记中提到的室友沟通问题，建议建立明确的约定'
}
```

**使用示例**:
```javascript
import { listJournals, createJournal, extractREBT } from '../services/journals';

// 获取日记列表
const journals = await listJournals({
  page: 1,
  tags: ['室友'],
  moodRange: { min: 40, max: 80 }
});

// 创建日记
const newJournal = await createJournal({
  entryType: 'text',
  title: '今天与室友的沟通',
  bodyText: '今天尝试和室友讨论了作息时间问题...',
  moodScore: 68,
  moodTags: ['室友', '沟通'],
  shareScope: 'private'
});

// 提取REBT分析
const rebtAnalysis = await extractREBT({
  journalId: newJournal.id,
  autoAnalyze: true
});
```

---

### 7. AI对话服务 (askMessage.js)

#### `createSession(agentId, options)` - 创建会话

**接口描述**: 与指定的AI助手创建新的对话会话

**请求参数**:
```javascript
{
  agentId: 'cbt_specialist',       // Agent ID (必填)
  options: {
    title: 'CBT助手的对话',       // 自定义会话标题 (可选)
    initialMessage: '我最近感觉压力很大', // 初始消息 (可选)
    context: {                    // 上下文信息 (可选)
      recentMood: 'anxious',
      currentIssues: ['学业压力', '人际关系']
    }
  }
}
```

**响应数据**:
```javascript
{
  id: 'session_001',
  title: 'CBT助手的对话 - 10/20 22:35',
  agent: 'CBT助手',
  agentId: 'cbt_specialist',
  messageCount: 0,
  preview: '',
  date: '2024-10-20T22:35:00+08:00',
  sessionData: {
    session_id: 'cloud_session_xxx',
    agent_snapshot: {
      name: 'CBT助手',
      description: '专业的认知行为治疗助手',
      avatar: 'https://xxx.jpg'
    },
    inputs: {
      user_context: {...}
    }
  }
}
```

#### `sendMessage(sessionId, content, options)` - 发送消息

**接口描述**: 向AI助手发送消息并获得回复

**请求参数**:
```javascript
{
  sessionId: 'session_001',       // 会话ID (必填)
  content: '我最近失眠很严重，该怎么办？', // 消息内容 (必填)
  options: {
    streamResponse: true,        // 是否流式响应 (可选)
    saveToHistory: true          // 是否保存到历史 (可选)
  }
}
```

**响应数据**:
```javascript
{
  id: 'msg_001',
  type: 'ai',                     // user | ai
  content: '我理解失眠带来的困扰。让我们从CBT的角度来分析...',
  time: '刚刚',
  timestamp: 1696345678000,
  sessionId: 'session_001',
  suggestedQuestions: [          // 推荐问题
    '你尝试过哪些改善睡眠的方法？',
    '失眠通常在什么时候发生？'
  ],
  status: 'completed',            // streaming | completed
  metadata: {
    responseTime: 2.5,           // 响应时间(秒)
    tokenUsage: 156              // token使用量
  }
}
```

#### `sendStreamingMessage(sessionId, content, onProgress, options)` - 流式发送

**接口描述**: 发送消息并实时接收AI回复流

**请求参数**:
```javascript
{
  sessionId: 'session_001',       // 会话ID (必填)
  content: '我最近感觉压力很大',   // 消息内容 (必填)
  onProgress: (chunk) => {       // 流式回调 (必填)
    console.log('收到片段:', chunk);
  },
  options: {
    temperature: 0.7,            // 生成温度 (可选)
    maxTokens: 1000              // 最大token数 (可选)
  }
}
```

**响应数据**: 通过回调函数实时返回内容片段

#### `getMessageHistory(sessionId, options)` - 获取消息历史

**接口描述**: 获取指定会话的完整消息历史

**请求参数**:
```javascript
{
  sessionId: 'session_001',       // 会话ID (必填)
  options: {
    limit: 50,                   // 消息数量限制 (可选)
    before: 'msg_123',           // 获取指定消息之前的记录 (可选)
    includeStreaming: false      // 是否包含流式消息 (可选)
  }
}
```

**响应数据**:
```javascript
{
  data: [
    {
      id: 'msg_001',
      type: 'user',
      content: '我最近失眠很严重',
      time: '2分钟前',
      timestamp: 1696345678000
    },
    {
      id: 'msg_002',
      type: 'ai',
      content: '我理解失眠带来的困扰...',
      time: '1分钟前',
      timestamp: 1696345680000,
      suggestedQuestions: [...]
    }
    // ... 更多消息
  ],
  hasMore: false,
  totalCount: 12
}
```

#### `getAvailableAgents(visibility)` - 获取可用Agent列表

**接口描述**: 获取当前可用的AI助手列表

**请求参数**:
```javascript
{
  visibility: 'public'            // 可见性: 'public' | 'all'
}
```

**响应数据**:
```javascript
{
  data: [
    {
      id: 'cbt_specialist',
      name: 'CBT助手',
      description: '专业的认知行为治疗助手，帮助你识别和改变负面思维模式',
      category: 'therapy',
      avatar: 'https://xxx.jpg',
      capabilities: ['cbt_analysis', 'emotion_regulation', 'behavior_change'],
      isActive: true,
      usageCount: 1250,
      rating: 4.8
    },
    {
      id: 'emotion_companion',
      name: '情绪伙伴',
      description: '温暖的情绪陪伴者，提供情感支持和积极倾听',
      category: 'support',
      avatar: 'https://xxx.jpg',
      capabilities: ['emotional_support', 'active_listening', 'empathy'],
      isActive: true,
      usageCount: 890,
      rating: 4.9
    }
    // ... 更多Agent
  ]
}
```

#### `getAgentDetail(agentId)` - 获取Agent详情

**接口描述**: 获取指定AI助手的详细信息

**请求参数**:
```javascript
{
  agentId: 'cbt_specialist'       // Agent ID (必填)
}
```

**响应数据**:
```javascript
{
  id: 'cbt_specialist',
  name: 'CBT助手',
  description: '专业的认知行为治疗助手，基于认知行为疗法(CBT)原理...',
  longDescription: 'CBT助手运用认知行为疗法的核心技术...',
  category: 'therapy',
  avatar: 'https://xxx.jpg',
  capabilities: [
    {
      name: '认知重建',
      description: '帮助识别和挑战负面自动化思维'
    },
    {
      name: '行为激活',
      description: '制定积极的行为计划'
    }
  ],
  specialties: ['焦虑', '抑郁', '压力管理', '睡眠问题'],
  approaches: ['CBT', '正念', '问题解决'],
  sessionStats: {
    totalSessions: 1250,
    averageRating: 4.8,
    helpfulRate: 0.92
  },
  examples: [
    {
      situation: '面对考试焦虑',
      response: '让我们用CBT的方法来分析考试焦虑...'
    }
  ]
}
```

**使用示例**:
```javascript
import {
  createSession,
  sendMessage,
  getMessageHistory,
  getAvailableAgents
} from '../services/askMessage';

// 获取可用Agent
const agents = await getAvailableAgents('public');

// 创建会话
const session = await createSession('cbt_specialist', {
  initialMessage: '我最近感觉压力很大'
});

// 发送消息
const response = await sendMessage(session.id, '我最近失眠很严重，该怎么办？');

// 获取消息历史
const history = await getMessageHistory(session.id);
```

---

### 8. 周报服务 (reports.js)

#### `getLatestReport()` - 获取最新周报

**接口描述**: 获取用户最新的护心周报

**请求参数**: 无

**响应数据**:
```javascript
{
  id: 'rep_week_2024w42_usr001',
  headline: '情绪平稳，任务完成率 80%',
  periodLabel: '10.14 - 10.20',
  moodScore: 67,
  moodSummary: {
    average: 68,
    peak: 80,
    trough: 45,
    tags: ['室友', '学习', '放松'],
    emotionData: [
      { date: '2024-10-20', emotion: 'calm', intensity: 4 }
      // ... 更多情绪数据
    ],
    trends: {
      direction: 'stable',        // improving | declining | stable
      changePercent: 2.5
    }
  },
  taskMetrics: {
    completion: 0.8,              // 完成率
    totalTasks: 4,
    completedTasks: 3,
    categoryBreakdown: {
      emotion: { completed: 2, total: 2 },
      relationship: { completed: 1, total: 1 },
      study: { completed: 0, total: 1 }
    }
  },
  recommendations: [
    {
      type: 'suggestion',
      title: '增加户外活动时间',
      description: '基于你久坐的学习模式，建议每天增加30分钟户外活动',
      priority: 'high',
      actionable: true
    }
  ],
  riskDigest: {
    level: 'R1',                  // R1-R4 风险等级
    alerts: [],                   // 风险提醒
    protectiveFactors: ['规律作息', '社交支持']
  },
  achievements: [
    {
      type: 'milestone',
      title: '连续打卡7天',
      achievedAt: '2024-10-20T09:00:00Z'
    }
  ],
  generatedAt: '2024-10-20T08:00:00Z'
}
```

#### `getWeeklyReport(weekOffset)` - 获取指定周周报

**接口描述**: 获取指定周数的护心周报

**请求参数**:
```javascript
{
  weekOffset: 0                   // 周偏移量 (0=本周, -1=上周, 1=下周)
}
```

**响应数据**: 同 `getLatestReport()` 格式

#### `exportReport(options)` - 导出周报

**接口描述**: 导出周报为指定格式

**请求参数**:
```javascript
{
  weekOffset: 0,                  // 周偏移量 (必填)
  format: 'pdf',                  // 导出格式: 'pdf' | 'image' | 'text'
  includeDetails: true,           // 是否包含详细信息
  language: 'zh-CN'              // 导出语言
}
```

**响应数据**:
```javascript
{
  downloadUrl: 'cloud://exports/weekly_report_2024w42.pdf',
  fileName: 'MindGuard周报_2024年第42周.pdf',
  fileSize: 1024000,              // 文件大小(字节)
  expiresAt: '2024-10-27T00:00:00Z' // 下载链接过期时间
}
```

#### `createTaskFromSuggestion(suggestion)` - 从周报建议创建任务

**接口描述**: 将周报中的建议转化为可执行任务

**请求参数**:
```javascript
{
  suggestion: {
    title: '增加户外活动时间',
    description: '每天增加30分钟户外活动',
    category: 'health',
    estimatedDurationMinutes: 30
  }
}
```

**响应数据**: 创建的任务对象

**使用示例**:
```javascript
import { getLatestReport, exportReport } from '../services/reports';

// 获取最新周报
const latestReport = await getLatestReport();

// 导出周报PDF
const exportResult = await exportReport({
  weekOffset: 0,
  format: 'pdf',
  includeDetails: true
});
```

---

## ☁️ 云函数API

### 1. 用户登录云函数 (wxlogin)

**接口描述**: 微信小程序用户登录

**请求参数**:
```javascript
{
  code: 'wx_code_string'          // 微信登录凭证 (必填)
}
```

**响应数据**:
```javascript
{
  ok: true,
  data: {
    openid: 'ox_xxx',
    sessionKey: 'xxx',
    unionid: 'ux_xxx',            // 可选
    userInfo: {
      isNewUser: false,
      profile: {
        nickname: '小明',
        avatarUrl: 'https://xxx.jpg'
      }
    }
  },
  error: null
}
```

---

### 2. 情绪打卡云函数 (checkinRecorder)

**接口描述**: 记录和查询情绪打卡数据

**请求参数**:
```javascript
{
  action: 'create',               // 操作类型: 'create' | 'get_today' | 'list_recent'
  data: {                         // 创建打卡时的数据
    primary_emotion: 'calm',      // 主要情绪
    mood_intensity: 4,            // 情绪强度 1-5
    energy_level: 3,              // 能量水平 1-5
    tags: ['放松', '阅读'],        // 情绪标签
    note: '今天心情不错'          // 打卡备注
  },
  options: {                      // 查询选项
    range: 'week',                // 查询范围
    limit: 7
  }
}
```

**响应数据**:
```javascript
{
  ok: true,
  data: {
    checkin: {
      id: 'ck_20241020_a',
      mood: 'calm',
      intensity: 4,
      date: '2024-10-20',
      createdAt: '2024-10-20T20:30:00Z'
    }
  },
  error: null
}
```

---

### 3. 任务工作流云函数 (taskWorkflow)

**接口描述**: 任务管理工作流

**请求参数**:
```javascript
{
  action: 'create_from_suggestion', // 操作类型
  taskId: 'task_001',             // 任务ID
  status: 'completed',            // 新状态
  metadata: {
    source: 'suggestion',
    completedAt: '2024-10-20T21:00:00Z'
  }
}
```

**响应数据**:
```javascript
{
  ok: true,
  data: {
    task: {
      id: 'task_001',
      status: 'completed',
      updatedAt: '2024-10-20T21:00:00Z'
    },
    suggestions: []               // 后续建议
  },
  error: null
}
```

---

### 4. 树洞审核云函数 (treeholeModeration)

**接口描述**: 社区内容自动审核

**请求参数**:
```javascript
{
  content: '帖子内容文本',
  moodThermometer: 38,            // 情绪温度计
  userInfo: {
    isNewUser: false,
    previousPosts: 5
  }
}
```

**响应数据**:
```javascript
{
  ok: true,
  data: {
  riskScore: 0.35,                // 风险评分 0-1
  riskLevel: 2,                   // 风险等级 1-4
  riskFlag: 'watch',              // none | watch | escalated | crisis
  autoActions: [
    'send_support_notification',
    'increase_monitoring'
  ],
  shouldAlertHuman: false
  },
  error: null
}
```

---

### 5. SOS中继云函数 (sosRelay)

**接口描述**: SOS紧急求助事件处理

**请求参数**:
```javascript
{
  eventType: 'sos_triggered',     // 事件类型
  userInfo: {
    userId: 'user_001',
    location: '北京市海淀区',
    emergencyContact: '138xxxx'
  },
  urgencyLevel: 'high',           // 紧急程度
  description: '感到非常焦虑，需要帮助'
}
```

**响应数据**:
```javascript
{
  ok: true,
  data: {
    eventId: 'sos_001',
  responseActions: [
    'contact_counselor',
    'send_resources',
    'notify_guardian'
  ],
  estimatedResponseTime: 300,     // 秒
  supportContact: '400-xxx-xxxx'
  },
  error: null
}
```

---

## 📊 数据模型

### 用户模型 (User)

```javascript
{
  _id: 'user_001',
  _openid: 'ox_xxx',
  profile: {
    nickname: '小明',
    avatarUrl: 'https://xxx.jpg',
    school: '清华大学',
    grade: '大三',
    major: '计算机科学'
  },
  preferences: {
    notificationEnabled: true,
    privacyLevel: 'standard',
    language: 'zh-CN'
  },
  stats: {
    totalCheckins: 45,
    streakDays: 7,
    tasksCompleted: 23,
    communityHelps: 12
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-10-20T20:00:00Z'
}
```

### 情绪打卡模型 (Checkin)

```javascript
{
  _id: 'ck_20241020_a',
  _openid: 'ox_xxx',
  mood: 'calm',                   // 情绪类型
  intensity: 4,                   // 情绪强度 1-5
  energy_level: 3,                // 能量水平 1-5
  tags: ['放松', '阅读'],         // 情绪标签
  note: '今天读了喜欢的书，心情很好',
  date: '2024-10-20',
  hasCheckedIn: true,
  createdAt: '2024-10-20T20:30:00Z'
}
```

### 任务模型 (Task)

```javascript
{
  _id: 'task_001',
  _openid: 'ox_xxx',
  title: '晚间复盘 5 分钟',
  description: '回顾今天的收获和感受',
  status: 'pending',              // pending | in_progress | completed | skipped
  source: 'suggestion',           // suggestion | journal | action_card
  category: 'emotion',
  priority: 'medium',             // low | medium | high
  estimated_duration_minutes: 5,
  due_at: '2024-10-20T22:00:00Z',
  completed_at: null,
  checklist_steps: [
    { text: '回顾今天的重要事件', is_done: false, order: 1 }
  ],
  created_at: '2024-10-20T09:00:00Z',
  updated_at: '2024-10-20T20:00:00Z'
}
```

### 微建议模型 (Suggestion)

```javascript
{
  _id: 'sg_001',
  _openid: 'ox_xxx',
  title: '与室友约定安静时段',
  description: '准备三个建议时段，与室友讨论并确认',
  category: 'relationship',
  priority: 'medium',
  estimated_duration_minutes: 20,
  reasoning: '基于你最近的情绪状态...',
  status: 'active',               // active | accepted | skipped
  metadata: {
    based_on_checkin: 'ck_20241019_a',
    generated_by: 'dify_workflow'
  },
  created_at: '2024-10-20T08:30:00Z'
}
```

### 社区帖子模型 (ForumPost)

```javascript
{
  _id: 'post_001',
  _openid: 'ox_xxx',
  title: '期末周的压力',
  content: '最近准备考研，和室友节奏不同有点焦虑...',
  alias_name: '小蓝鲸',
  anonymity_mode: 'anon',         // anon | pseudonym
  tags: ['考研', '室友', '焦虑'],
  topic: 'study',
  mood_thermometer: 38,           // 情绪温度计 0-100
  risk_score: 0.35,               // 风险评分 0-1
  risk_flag: 'watch',             // none | watch | escalated | crisis
  risk_level: 2,                  // 风险等级 1-4
  status: 'published',            // draft | published | moderated | hidden
  stats: {
    comment_count: 5,
    hug_count: 18,
    view_count: 156
  },
  images: ['cloud://xxx.jpg'],
  created_at: '2024-10-20T15:30:00Z',
  updated_at: '2024-10-20T16:00:00Z'
}
```

### 日记模型 (Journal)

```javascript
{
  _id: 'journal_001',
  _openid: 'ox_xxx',
  entry_type: 'text',             // text | voice | image | mixed
  title: '与室友调解',
  body_text: '今天和组员开会...',
  mood_score: 68,                 // 情绪评分 0-100
  mood_tags: ['室友', '沟通'],
  media_refs: [],                 // 音频/图片引用
  rebt_struct: {                  // REBT分析结构
    A: '室友打游戏很吵',          // 诱发事件
    B: '他们不尊重我',            // 不合理信念
    C: '焦虑',                    // 情绪后果
    D: '尝试约定时间',            // 辩论
    E: '得到了理解'               // 新的有效信念
  },
  share_scope: 'private',         // private | guardian | public
  source: 'journal_page',
  is_favorited: false,
  created_at: '2024-10-20T20:20:00Z',
  updated_at: '2024-10-20T20:25:00Z'
}
```

### AI对话会话模型 (AskSession)

```javascript
{
  _id: 'session_001',
  _openid: 'ox_xxx',
  agent_id: 'cbt_specialist',
  title: 'CBT助手的对话 - 10/20 22:35',
  session_data: {
    session_id: 'cloud_session_xxx',
    agent_snapshot: {...},
    message_count: 12,
    inputs: {...}
  },
  stats: {
    message_count: 12,
    last_activity: '2024-10-20T22:35:00Z'
  },
  created_at: '2024-10-20T22:00:00Z',
  updated_at: '2024-10-20T22:35:00Z'
}
```

### AI对话消息模型 (AskMessage)

```javascript
{
  _id: 'msg_001',
  _openid: 'ox_xxx',
  session_id: 'session_001',
  type: 'user',                   // user | ai
  content: '我最近感觉压力很大...',
  metadata: {
    suggested_questions: [],
    token_usage: 156,
    response_time: 2.5
  },
  status: 'completed',            // streaming | completed
  created_at: '2024-10-20T22:30:00Z'
}
```

### 护心周报模型 (WeeklyReport)

```javascript
{
  _id: 'rep_week_2024w42_usr001',
  _openid: 'ox_xxx',
  week_number: 42,
  year: 2024,
  headline: '情绪平稳，任务完成率 80%',
  period_label: '10.14 - 10.20',
  mood_score: 67,
  mood_summary: {
    average: 68,
    peak: 80,
    trough: 45,
    tags: ['室友', '学习'],
    emotion_data: [...],
    trends: {
      direction: 'stable',
      change_percent: 2.5
    }
  },
  task_metrics: {
    completion: 0.8,
    total_tasks: 4,
    completed_tasks: 3,
    category_breakdown: {...}
  },
  recommendations: [...],
  risk_digest: {
    level: 'R1',
    alerts: [],
    protective_factors: []
  },
  achievements: [...],
  generated_at: '2024-10-20T08:00:00Z'
}
```

---

## ⚠️ 错误处理

### 统一错误响应格式

#### 服务层错误
```javascript
// API调用失败
{
  error: 'NETWORK_ERROR',
  message: '网络连接失败，请检查网络设置',
  code: 1001,
  details: {
    url: '/api/checkins',
    method: 'GET',
    timestamp: 1696345678000
  }
}

// 数据验证失败
{
  error: 'VALIDATION_ERROR',
  message: '数据验证失败',
  code: 1002,
  details: {
    field: 'mood_intensity',
    reason: '必须是1-5的数字',
    value: 6
  }
}

// 权限错误
{
  error: 'PERMISSION_DENIED',
  message: '没有权限访问此资源',
  code: 1003,
  details: {
    required_permission: 'admin',
    user_permission: 'user'
  }
}
```

#### 云函数错误
```javascript
{
  ok: false,
  error: 'CLOUD_FUNCTION_ERROR',
  message: '云函数调用失败',
  details: {
    function_name: 'checkinRecorder',
    error_code: 'DATABASE_ERROR',
    error_message: '数据库连接超时'
  }
}
```

### 常见错误码

| 错误码 | 错误类型 | 描述 | 解决方案 |
|--------|----------|------|----------|
| 1001 | NETWORK_ERROR | 网络连接失败 | 检查网络设置，重试请求 |
| 1002 | VALIDATION_ERROR | 数据验证失败 | 检查请求参数格式 |
| 1003 | PERMISSION_DENIED | 权限不足 | 联系管理员获取权限 |
| 1004 | RESOURCE_NOT_FOUND | 资源不存在 | 检查资源ID是否正确 |
| 1005 | RATE_LIMIT_EXCEEDED | 请求频率超限 | 稍后重试 |
| 2001 | CLOUD_FUNCTION_ERROR | 云函数执行失败 | 检查云函数日志 |
| 2002 | DATABASE_ERROR | 数据库操作失败 | 检查数据库连接 |
| 3001 | AI_SERVICE_ERROR | AI服务异常 | 稍后重试或联系技术支持 |
| 3002 | CONTENT_MODERATION | 内容审核失败 | 修改内容后重试 |

### 错误处理最佳实践

#### 服务层错误处理
```javascript
async function apiCall() {
  try {
    const result = await wx.cloud.callFunction({
      name: 'someFunction',
      data: requestData
    });

    if (!result.result.ok) {
      throw new APIError(result.result.error, result.result.message);
    }

    return normalizeData(result.result.data);
  } catch (error) {
    console.error('API调用失败:', error);

    // 记录错误遥测
    telemetry.report('api_error', {
      function: 'someFunction',
      error: error.message,
      timestamp: Date.now()
    });

    // 返回标准化错误
    return {
      error: 'API_ERROR',
      message: error.message || '请求失败，请稍后重试',
      code: error.code || 1001
    };
  }
}
```

#### 页面层错误处理
```javascript
Page({
  async loadData() {
    try {
      wx.showLoading({ title: '加载中...' });

      const data = await someApi();
      this.setData({ data });

    } catch (error) {
      console.error('数据加载失败:', error);

      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none',
        duration: 2000
      });

      // 降级处理：使用缓存数据
      const cachedData = wx.getStorageSync('cached_data');
      if (cachedData) {
        this.setData({ data: cachedData });
      }
    } finally {
      wx.hideLoading();
    }
  }
});
```

---

## 🛠️ 开发指南

### 环境搭建

#### 1. 微信开发者工具
- 下载并安装最新版微信开发者工具
- 导入项目代码，选择小程序项目
- 配置AppID和项目路径

#### 2. 云开发环境
- 在微信开发者工具中开通云开发
- 创建云开发环境（环境ID: `cloud1-9gpfk3ie94d8630a`）
- 配置环境变量和安全规则

#### 3. 依赖安装
```bash
# 在 miniprogram 目录下
npm install

# 构建npm
# 微信开发者工具 → 工具 → 构建npm
```

### Mock数据使用

#### 启用Mock模式
```javascript
// 在小程序启动时设置
wx.setStorageSync('USE_MOCK', true);

// 检查Mock状态
const isMockMode = wx.getStorageSync('USE_MOCK');
console.log('Mock模式:', isMockMode);
```

#### 添加新的Mock数据
```javascript
// services/exampleService.js
const MOCK_EXAMPLE_DATA = [
  {
    id: 'example_001',
    title: 'Mock数据示例',
    status: 'active'
  }
];

async function getExampleData() {
  if (shouldUseMock()) {
    return MOCK_EXAMPLE_DATA;
  }

  // 真实API调用
  const result = await callFunction('exampleFunction');
  return result.data;
}
```

### 添加新服务

#### 1. 创建服务文件
```javascript
// services/newService.js
'use strict';

const { shouldUseMock } = require('../utils/request');

// Mock数据
const MOCK_NEW_DATA = [
  {
    id: 'new_001',
    name: '示例数据'
  }
];

// 数据归一化
function normalizeNewItem(raw) {
  if (!raw) return null;

  return {
    id: raw.id || raw._id,
    name: raw.name || '',
    createdAt: raw.created_at
  };
}

// API接口
async function getNewData() {
  if (shouldUseMock()) {
    return MOCK_NEW_DATA.map(normalizeNewItem);
  }

  const result = await callFunction('newFunction');
  return result.data.map(normalizeNewItem);
}

// 导出接口
module.exports = {
  getNewData,
  normalizeNewItem
};
```

#### 2. 在页面中使用
```javascript
// pages/example/index.js
const { getNewData } = require('../../services/newService');

Page({
  data: {
    newData: []
  },

  async onLoad() {
    await this.loadNewData();
  },

  async loadNewData() {
    try {
      const data = await getNewData();
      this.setData({ newData: data });
    } catch (error) {
      console.error('加载数据失败:', error);
    }
  }
});
```

### 云函数开发

#### 1. 创建云函数
```javascript
// cloudfunctions/newFunction/index.js
'use strict';

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 主入口函数
exports.main = async (event, context) => {
  const { action, data } = event;

  try {
    switch (action) {
      case 'create':
        return await createData(data);
      case 'list':
        return await listData(data);
      default:
        return {
          ok: false,
          error: 'UNKNOWN_ACTION',
          message: '未知的操作类型'
        };
    }
  } catch (error) {
    console.error('云函数执行失败:', error);

    return {
      ok: false,
      error: 'CLOUD_FUNCTION_ERROR',
      message: error.message
    };
  }
};

// 创建数据
async function createData(data) {
  const result = await db.collection('new_collection').add({
    data: {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    }
  });

  return {
    ok: true,
    data: {
      id: result._id,
      ...data
    }
  };
}

// 查询数据
async function listData(options = {}) {
  const { limit = 20, offset = 0 } = options;

  const result = await db.collection('new_collection')
    .orderBy('created_at', 'desc')
    .limit(limit)
    .skip(offset)
    .get();

  return {
    ok: true,
    data: result.data
  };
}
```

#### 2. 云函数配置
```json
// cloudfunctions/newFunction/package.json
{
  "name": "newFunction",
  "version": "1.0.0",
  "description": "新的云函数",
  "main": "index.js",
  "dependencies": {
    "wx-server-sdk": "~2.6.3"
  }
}
```

### 数据库设计

#### 集合命名规范
- 使用下划线分隔的小写命名
- 用户相关数据以用户维度分表
- 时间字段统一使用ISO格式

#### 索引设计
```javascript
// 为常用查询字段添加索引
db.collection('checkins').createIndex({
  _openid: 1,
  date: -1
});

db.collection('tasks').createIndex({
  _openid: 1,
  status: 1,
  due_at: 1
});
```

#### 数据验证
```javascript
// 云函数中的数据验证
function validateTaskData(data) {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('任务标题不能为空');
  }

  if (data.estimated_duration_minutes &&
      (data.estimated_duration_minutes < 1 || data.estimated_duration_minutes > 480)) {
    errors.push('预估时长必须在1-480分钟之间');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### 测试策略

#### 1. 单元测试
```javascript
// services/__tests__/newService.test.js
const { getNewData, normalizeNewItem } = require('../newService');

describe('NewService', () => {
  beforeEach(() => {
    // 启用Mock模式
    wx.setStorageSync('USE_MOCK', true);
  });

  test('normalizeNewItem 应该正确归一化数据', () => {
    const raw = { _id: 'test_001', name: '测试', created_at: '2024-10-20' };
    const normalized = normalizeNewItem(raw);

    expect(normalized.id).toBe('test_001');
    expect(normalized.name).toBe('测试');
    expect(normalized.createdAt).toBe('2024-10-20');
  });

  test('getNewData 应该返回Mock数据', async () => {
    const data = await getNewData();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});
```

#### 2. 集成测试
```javascript
// tests/api.test.js
describe('API集成测试', () => {
  test('情绪打卡完整流程', async () => {
    // 1. 创建打卡
    const checkin = await createCheckin({
      mood: 'calm',
      intensity: 4,
      note: '测试打卡'
    });
    expect(checkin.id).toBeDefined();

    // 2. 获取今日打卡
    const todayCheckin = await getTodayCheckin();
    expect(todayCheckin.id).toBe(checkin.id);

    // 3. 获取心情轮数据
    const moodWheel = await getMoodWheel({ range: 'week' });
    expect(moodWheel.emotionData).toContainEqual(
      expect.objectContaining({
        emotion: 'calm',
        intensity: 4
      })
    );
  });
});
```

### 性能优化

#### 1. 分包加载策略
```json
// app.json 分包配置
{
  "subpackages": [
    {
      "root": "packages/community",
      "name": "community",
      "pages": [...],
      "independent": false
    }
  ],
  "preloadRule": {
    "pages/today/index": {
      "packages": ["packages/community"],
      "network": "all"
    }
  }
}
```

#### 2. 数据缓存策略
```javascript
// 缓存工具函数
class DataCache {
  static set(key, data, ttl = 3600000) { // 默认1小时
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    wx.setStorageSync(key, cacheData);
  }

  static get(key) {
    const cached = wx.getStorageSync(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      wx.removeStorageSync(key);
      return null;
    }

    return cached.data;
  }

  static clear(pattern) {
    const info = wx.getStorageInfoSync();
    info.keys.forEach(key => {
      if (key.includes(pattern)) {
        wx.removeStorageSync(key);
      }
    });
  }
}

// 使用缓存
async function getCachedData(cacheKey, apiFunction, ttl = 3600000) {
  // 尝试从缓存获取
  let data = DataCache.get(cacheKey);
  if (data) {
    console.log('使用缓存数据:', cacheKey);
    return data;
  }

  // 缓存未命中，调用API
  console.log('调用API获取数据:', cacheKey);
  data = await apiFunction();

  // 缓存结果
  DataCache.set(cacheKey, data, ttl);

  return data;
}
```

#### 3. 图片优化
```javascript
// 图片压缩和格式转换
async function optimizeImage(imagePath) {
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: imagePath,
      quality: 80,
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: reject
    });
  });
}

// CDN图片处理
function getCdnImageUrl(originalUrl, options = {}) {
  const { width = 300, height = 300, quality = 80 } = options;

  if (!originalUrl.includes('cdn.example.com')) {
    return originalUrl;
  }

  const url = new URL(originalUrl);
  url.searchParams.set('w', width);
  url.searchParams.set('h', height);
  url.searchParams.set('q', quality);

  return url.toString();
}
```

### 安全最佳实践

#### 1. 数据验证
```javascript
// 输入数据验证
function validateUserInput(data, rules) {
  const errors = [];

  for (const field in rules) {
    const rule = rules[field];
    const value = data[field];

    // 必填验证
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} 是必填项`);
      continue;
    }

    // 类型验证
    if (value && rule.type && typeof value !== rule.type) {
      errors.push(`${field} 必须是 ${rule.type} 类型`);
    }

    // 长度验证
    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(`${field} 长度不能超过 ${rule.maxLength} 个字符`);
    }

    // 正则验证
    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(`${field} 格式不正确`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 使用示例
const validation = validateUserInput(inputData, {
  title: {
    required: true,
    type: 'string',
    maxLength: 100
  },
  moodIntensity: {
    required: true,
    type: 'number',
    pattern: /^[1-5]$/
  }
});
```

#### 2. 敏感信息处理
```javascript
// 敏感信息脱敏
function maskSensitiveInfo(data) {
  const sensitiveFields = ['phone', 'email', 'idCard'];
  const maskedData = { ...data };

  sensitiveFields.forEach(field => {
    if (maskedData[field]) {
      if (field === 'phone') {
        maskedData[field] = maskedData[field].replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
      } else if (field === 'email') {
        maskedData[field] = maskedData[field].replace(/(.{2}).*(@.*)/, '$1****$2');
      }
    }
  });

  return maskedData;
}

// 安全的云函数调用
async function secureCloudCall(functionName, data) {
  // 添加安全标识
  const secureData = {
    ...data,
    _timestamp: Date.now(),
    _nonce: Math.random().toString(36).substr(2, 9)
  };

  try {
    const result = await wx.cloud.callFunction({
      name: functionName,
      data: secureData
    });

    // 验证响应完整性
    if (result.result && result.result._signature) {
      // TODO: 验证签名
    }

    return result;
  } catch (error) {
    console.error('安全云函数调用失败:', error);
    throw error;
  }
}
```

### 监控和日志

#### 1. 遥测数据收集
```javascript
// 遥测事件上报
function trackEvent(eventName, properties = {}) {
  const event = {
    name: eventName,
    properties: {
      ...properties,
      timestamp: Date.now(),
      user_id: getCurrentUserId(),
      session_id: getSessionId(),
      app_version: getAppVersion()
    }
  };

  // 上报到遥测系统
  telemetry.report(event.name, event.properties);

  // 本地日志记录
  console.log('遥测事件:', event);
}

// 页面访问统计
function trackPageView(pageName, duration = null) {
  trackEvent('page_view', {
    page_name: pageName,
    duration: duration,
    referrer: getCurrentPages().slice(-2)[0]?.route || 'direct'
  });
}

// 用户行为跟踪
function trackUserAction(action, target, properties = {}) {
  trackEvent('user_action', {
    action,
    target,
    ...properties
  });
}
```

#### 2. 错误监控
```javascript
// 全局错误处理
App({
  onError(error) {
    console.error('全局错误:', error);

    // 上报错误信息
    trackEvent('app_error', {
      error_message: error.message,
      error_stack: error.stack,
      page_url: getCurrentPages().slice(-1)[0]?.route,
      user_agent: wx.getSystemInfoSync()
    });

    // 显示友好提示
    wx.showToast({
      title: '应用出现异常',
      icon: 'none',
      duration: 2000
    });
  }
});

// Promise错误处理
function handleAsyncError(promise, context = 'unknown') {
  return promise.catch(error => {
    console.error(`异步错误 [${context}]:`, error);

    trackEvent('async_error', {
      context,
      error_message: error.message,
      error_stack: error.stack
    });

    // 重新抛出错误
    throw error;
  });
}
```

---

## 📚 相关文档

- [项目概览](../CLAUDE.md)
- [数据库设计](../docs/数据库设计.md)
- [UI组件文档](../docs/UI组件文档.md)
- [测试用例](../docs/测试用例.md)
- [功能列表](../docs/功能列表.md)

---

## 📞 技术支持

- **文档维护**: 开发团队
- **最后更新**: 2025年10月20日
- **版本**: v1.0.0
- **联系方式**: 请通过项目Issue或内部沟通渠道反馈问题

---

*本文档由 MindGuard 开发团队维护，确保信息的准确性和时效性。如有疑问或建议，欢迎提出反馈。*