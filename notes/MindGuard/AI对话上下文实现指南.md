# AI对话上下文实现指南

## 概述

本文档说明如何在MindGuard项目中实现基于Dify API的对话上下文功能,确保用户可以查看和继续之前的对话。

## 核心机制

### 1. 用户标识
- **推荐方式**: 使用微信OpenID作为Dify API的`user`参数
- **自动获取**: 服务会自动从`user_info`缓存读取`_openid`字段
- **降级方案**: 如果OpenID不可用,使用sessionId作为降级
- **存储位置**:
  - 主要来源: 微信本地存储 `user_info._openid`
  - 性能缓存: 微信本地存储 `user_openid`

**注意**: 登录后,系统会自动将用户信息保存到`user_info`缓存,包含`_openid`字段,服务会自动从此处读取OpenID,**无需手动调用`setUserOpenid()`**。

### 2. 对话上下文维持
- **conversation_id**: Dify返回的UUID,用于标识和维持对话上下文
- **首次对话**: 不传`conversation_id`,从响应中获取并保存
- **后续对话**: 传递已有的`conversation_id`维持上下文
- **存储映射**: 通过`ask_sessions.dify_conversation_id`字段映射本地会话和Dify对话

## 已实现功能

### AskMessageService服务增强

#### 1. OpenID自动管理
```javascript
// 自动从user_info获取OpenID(无需手动设置)
const openid = askMessageService.getUserOpenid();
// 会自动从 wx.getStorageSync('user_info')._openid 读取

// 仅在特殊情况下手动设置(通常不需要)
askMessageService.setUserOpenid(openid);
```

**工作原理**:
```javascript
getUserOpenid() {
  // 1. 优先从user_openid缓存读取(性能优化)
  let openid = wx.getStorageSync('user_openid');

  // 2. 如果缓存不存在,从user_info读取
  if (!openid) {
    const userInfo = wx.getStorageSync('user_info');
    if (userInfo && userInfo._openid) {
      openid = userInfo._openid;
      // 3. 缓存到user_openid以提升后续读取性能
      wx.setStorageSync('user_openid', openid);
    }
  }

  return openid || null;
}
```

#### 2. 上下文对话
```javascript
// 创建新会话
const session = await askMessageService.createSession(agentId, {
  sessionType: 'general',
  triggerSource: 'manual_trigger'
});

// 发送第一条消息(自动使用OpenID作为user)
const result = await askMessageService.sendMessage(
  session.session_id,
  '你好,我感到有些焦虑'
);
// Dify将返回conversation_id,服务会自动保存到ask_sessions表

// 发送后续消息(自动使用已保存的conversation_id)
const result2 = await askMessageService.sendMessage(
  session.session_id,
  '你能帮我分析一下原因吗?'
);
// 这条消息会自动带上conversation_id,维持对话上下文
```

#### 3. 会话历史
```javascript
// 获取会话列表(包含dify_conversation_id)
const sessions = await askMessageService.getSessionList({
  limit: 20,
  sortBy: '-updated_at'
});

// 选择已有会话继续对话
const oldSessionId = sessions[0].id;
const continueResult = await askMessageService.sendMessage(
  oldSessionId,
  '我们继续之前的话题'
);
// 会自动使用该会话的conversation_id维持上下文
```

## 数据流程

### 首次对话流程
```
1. 用户登录 → 系统保存user_info(含_openid)到本地存储
2. 创建会话 → 生成session_id,dify_conversation_id为null
3. 发送第一条消息:
   - 自动从user_info读取_openid作为user参数
   - 不传conversation_id
   - 调用Dify API
4. 接收响应:
   - 提取conversation_id
   - 更新ask_sessions.dify_conversation_id字段
   - 更新内存缓存
5. 显示AI回复
```

### 继续对话流程
```
1. 用户选择已有会话
2. 发送消息:
   - 读取OpenID作为user参数
   - 从会话读取dify_conversation_id
   - 将conversation_id传递给Dify API
3. Dify基于conversation_id返回上下文相关的回复
4. 显示AI回复
```

### 会话列表查询流程
```
1. 调用askMessageManager云函数
   - type: 'get_conversation_list'
   - payload: { limit, sort_by }
2. 云函数查询ask_sessions表
   - 过滤条件: user_id, is_deleted=false
   - 排序: updated_at desc
3. 返回会话列表:
   - 包含session_id, session_title, dify_conversation_id
   - 包含agent信息, 创建/更新时间
4. 缓存到本地存储: 'heartchat_sessions'
```

## 页面集成示例

### 在登录页面保存OpenID

```javascript
// pages/login/index.js
const askMessageService = require('../../services/askMessage');

Page({
  async onLogin() {
    try {
      // 获取用户信息和OpenID
      const { openid } = await wx.cloud.callFunction({
        name: 'auth',
        data: { action: 'getOpenId' }
      });

      // 保存OpenID到服务
      askMessageService.setUserOpenid(openid);

      wx.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      console.error('登录失败:', error);
    }
  }
});
```

### 对话页面实现

```javascript
// packages/chat/pages/conversation/index.js
const askMessageService = require('../../../../services/askMessage');

Page({
  data: {
    sessionId: null,
    messages: [],
    inputText: ''
  },

  async onLoad(options) {
    const { sessionId } = options;

    if (sessionId) {
      // 加载已有会话
      this.setData({ sessionId });
      await this.loadMessages(sessionId);
    } else {
      // 创建新会话
      await this.createNewSession();
    }
  },

  async createNewSession() {
    try {
      const session = await askMessageService.createSession('cbt_specialist');
      this.setData({ sessionId: session.session_id });
      console.log('创建新会话:', session);
    } catch (error) {
      wx.showToast({ title: '创建会话失败', icon: 'error' });
    }
  },

  async loadMessages(sessionId) {
    try {
      const messages = await askMessageService.getMessageHistory(sessionId);
      this.setData({ messages });
    } catch (error) {
      console.error('加载消息历史失败:', error);
    }
  },

  async onSendMessage() {
    const { sessionId, inputText } = this.data;
    if (!inputText.trim()) return;

    try {
      wx.showLoading({ title: '发送中...' });

      // 发送消息(自动处理conversation_id)
      const result = await askMessageService.sendMessage(sessionId, inputText);

      // 更新消息列表
      const messages = [...this.data.messages];
      messages.push({
        id: result.user_message_id,
        type: 'user',
        content: inputText
      });
      messages.push({
        id: result.ai_message_id,
        type: 'ai',
        content: result.dify_response.answer
      });

      this.setData({ messages, inputText: '' });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({ title: '发送失败', icon: 'error' });
    }
  }
});
```

### 会话列表页面

```javascript
// packages/chat/pages/sessions/index.js
const askMessageService = require('../../../../services/askMessage');

Page({
  data: {
    sessions: []
  },

  async onLoad() {
    await this.loadSessions();
  },

  async loadSessions() {
    try {
      wx.showLoading({ title: '加载中...' });
      const sessions = await askMessageService.getSessionList({
        limit: 20,
        sortBy: '-updated_at'
      });
      this.setData({ sessions });
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      console.error('加载会话列表失败:', error);
    }
  },

  onSessionTap(e) {
    const { sessionId } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/packages/chat/pages/conversation/index?sessionId=${sessionId}`
    });
  },

  onNewChat() {
    wx.navigateTo({
      url: '/packages/chat/pages/conversation/index'
    });
  }
});
```

## 云函数配置

### ask云函数增强
需要确保`ask`云函数支持以下参数:
- `user`: 用户OpenID
- `conversation_id`: 可选,用于继续已有对话
- `query`: 用户消息内容
- `agentId`: Agent标识

```javascript
// cloudfunctions/ask/index.js
exports.main = async (event, context) => {
  const { action, user, conversation_id, query, agentId, inputs } = event;

  if (action === 'proxyChatWithDify') {
    // 构建Dify API请求
    const requestBody = {
      query,
      user, // 使用OpenID
      inputs: inputs || {},
      response_mode: 'blocking'
    };

    // 如果有conversation_id,添加到请求中
    if (conversation_id) {
      requestBody.conversation_id = conversation_id;
    }

    // 获取Agent的API密钥
    const apiKey = await getAgentApiKey(agentId);

    // 调用Dify API
    const response = await callDifyAPI(apiKey, requestBody);

    return {
      success: true,
      data: response // 包含answer和conversation_id
    };
  }
};
```

### askMessageManager云函数增强
需要支持更新会话的`dify_conversation_id`:

```javascript
// cloudfunctions/askMessageManager/index.js
exports.main = async (event, context) => {
  const { type, payload } = event;
  const db = cloud.database();

  switch (type) {
    case 'update_session':
      const { session_id, update_data } = payload;
      await db.collection('ask_sessions')
        .doc(session_id)
        .update({
          data: {
            ...update_data,
            updatedAt: new Date()
          }
        });
      return { ok: true };

    case 'get_conversation_list':
      const { limit = 20, sort_by = '-updated_at' } = payload;
      const sessions = await db.collection('ask_sessions')
        .where({
          _openid: '{openid}', // 自动注入
          is_deleted: false
        })
        .orderBy(sort_by.replace('-', ''), sort_by.startsWith('-') ? 'desc' : 'asc')
        .limit(limit)
        .get();
      return { ok: true, data: sessions.data };

    // ... 其他操作
  }
};
```

## 数据库索引确认

确保`ask_sessions`表有以下索引(已在Schema中定义):
- 唯一索引: `dify_conversation_id`
- 复合索引: `[user_id, updatedAt desc]`
- 单字段索引: `user_id`, `is_deleted`

## 测试验证

### 1. 首次对话测试
```javascript
// 1. 确认OpenID已保存
console.log('OpenID:', askMessageService.getUserOpenid());

// 2. 创建会话并发送消息
const session = await askMessageService.createSession('cbt_specialist');
const result = await askMessageService.sendMessage(session.session_id, '你好');

// 3. 检查conversation_id是否已保存
const updatedSession = await askMessageService.getSession(session.session_id);
console.log('Conversation ID:', updatedSession.dify_conversation_id);
```

### 2. 上下文对话测试
```javascript
// 继续之前的会话
const result2 = await askMessageService.sendMessage(session.session_id, '我刚才说了什么?');
// AI应该能够基于conversation_id回忆起之前的对话内容
```

### 3. 会话列表测试
```javascript
// 获取会话列表
const sessions = await askMessageService.getSessionList();
console.log('会话数量:', sessions.length);
console.log('第一个会话:', sessions[0]);
// 应该包含dify_conversation_id字段
```

## 注意事项

1. **OpenID获取时机**: 必须在用户登录成功后立即调用`setUserOpenid()`
2. **conversation_id为空**: 首次对话时conversation_id为null是正常的,会在首次响应后自动保存
3. **会话缓存**: 会话列表会缓存到本地存储,注意在会话变更时更新缓存
4. **错误处理**: conversation_id不存在或过期时,Dify会返回错误,需要创建新会话
5. **并发控制**: 避免同时对同一会话发送多条消息,可能导致conversation_id更新冲突

## 下一步优化

1. 实现会话重命名功能(已有接口支持)
2. 添加会话删除和归档功能
3. 实现消息的编辑和重发
4. 添加会话搜索和筛选功能
5. 优化本地缓存策略,减少网络请求