# 集合：AI对话会话（ask_sessions）

## 1. 目的与使用场景
- 记录用户与AI心理助理的完整对话会话，支持CBT认知行为疗法应用、风险评估和个性化推荐。由Ask心理助理功能、Dify工作流、埋点系统及心语精灵多Agent能力使用。
- 维护与Dify Chatbot/Agent Service API的会话映射，支撑会话管理（列表、重命名、删除）、对话消息、语音/文字互转与文件附件能力。

**枚举值**：
- session_type: `general`（常规对话）、`cbt_guided`（CBT引导）、`crisis_intervention`（危机干预）、`follow_up`（跟进回访）
- trigger_source: `mood_checkin`（情绪打卡触发）、`journal_negative`（负向随笔触发）、`treehole_risk`（树洞风险触发）、`manual_trigger`（手动触发）、`scheduled_checkin`（定时检查）
- cbt_focus: `cognitive_restructuring`（认知重构）、`behavioral_activation`（行为激活）、`emotion_regulation`（情绪调节）、`problem_solving`（问题解决）
- risk_level: `L0`（无风险）、`L1`（一般关注）、`L2`（需要关注）、`L3`（需要干预）、`L4`（紧急危机）
- active_agent_key: `cbt_specialist`（CBT助手）、`emotion_advisor`（情绪顾问）、`behavior_coach`（行为导师）、`crisis_interventionist`（危机干预）、`custom_role`（自定义角色）
- agent_origin: `system_default`（内置模板）、`org_template`（机构模板）、`user_custom`（用户自定义）

## 2. Schema 定义
| 字段 | 类型 | 必填 | 默认值 | 约束/校验 | 说明 | 隐私分级 |
|---|---|---|---|---|---|---|
| _id | string | 是 | - | TCB 自动 | 主键 | P2 |
| _openid | string | 是 | - | TCB 自动 | 用户 openid | P2 |
| user_id | 指针id | 是 | - | 指向 users._id | 用户指针 | P2 |
| dify_conversation_id | string | 是 | - | UUID，唯一索引 | 与 Dify 会话 ID 对齐 | P1 |
| session_title | string | 否 | - | 长度 ≤ 60 | 展示名称，对应会话重命名 | P2 |
| session_type | string | 是 | general | 枚举(general,cbt_guided,crisis_intervention,follow_up) | 会话类型 | P1 |
| trigger_source | string | 是 | manual_trigger | 枚举(mood_checkin,journal_negative,treehole_risk,manual_trigger,scheduled_checkin) | 触发来源 | P1 |
| active_agent_key | string | 否 | cbt_specialist | 枚举(cbt_specialist,emotion_advisor,behavior_coach,crisis_interventionist,custom_role) | 当前 Agent | P1 |
| custom_agent_id | 指针id | 否 | - | 指向 ask_agents._id | 自定义Agent引用 | P1 |
| agent_origin | string | 否 | system_default | 枚举(system_default,org_template,user_custom) | Agent来源 | P1 |
| agent_snapshot | object | 否 | - | 包含 name, persona, version, origin, dify_agent_id | Agent 配置快照 | P2 |
| conversation_variables | object | 否 | {} | JSON Schema: key ≤ 30，值长度 ≤ 200 | Dify 会话变量/inputs | P2 |
| modality_flags | object | 否 | {"text":true} | 布尔键 text/audio/file | 会话是否包含语音或文件 | P1 |
| voice_config | object | 否 | - | 包含 tts_voice, stt_language, enable_tts | 语音配置快照 | P2 |
| cbt_focus | string | 否 | - | 枚举(cognitive_restructuring,behavioral_activation,emotion_regulation,problem_solving) | CBT焦点领域 | P2 |
| initial_risk_level | string | 否 | L0 | 枚举(L0/L1/L2/L3/L4) | 初始风险评估 | P3 |
| final_risk_level | string | 否 | - | 枚举(L0/L1/L2/L3/L4) | 最终风险评估 | P3 |
| session_summary | string | 否 | - | 长度 ≤ 1000 | 会话摘要 | P2 |
| key_insights | array | 否 | [] | 元素为 string | 关键洞察点 | P2 |
| cbt_techniques_used | array | 否 | [] | 元素为 string | 应用的CBT技巧 | P2 |
| generated_task_ids | array | 否 | [] | 指向 tasks._id | 生成的任务ID | P1 |
| counselor_handoff | object | 否 | - | 包含 handoff_reason, counselor_id, handoff_time | 转交辅导员信息 | P3 |
| satisfaction_score | number | 否 | - | 1-5 | 满意度评分 | P2 |
| follow_up_needed | bool | 否 | false | - | 是否需要跟进 | P1 |
| follow_up_at | date | 否 | - | - | 跟进时间 | P1 |
| message_count | number | 否 | 0 | ≥0 | 消息数量 | P1 |
| audio_message_count | number | 否 | 0 | ≥0 | 语音消息数量 | P1 |
| attachment_count | number | 否 | 0 | ≥0 | 附件数量 | P1 |
| duration_seconds | number | 否 | - | ≥0 | 会话时长(秒) | P1 |
| intervention_triggered | bool | 否 | false | - | 是否触发干预 | P3 |
| createdAt | date | 是 | - | 服务端时间 | 创建时间 | P1 |
| updatedAt | date | 是 | - | 服务端时间 | 更新时间 | P1 |
| endedAt | date | 否 | - | - | 结束时间 | P1 |
| is_deleted | bool | 否 | false | - | 软删标记 | P2 |

## 3. 索引与唯一约束
- 唯一索引：`dify_conversation_id`
- 单字段索引：`user_id`、`session_type`、`trigger_source`、`initial_risk_level`、`final_risk_level`、`active_agent_key`、`custom_agent_id`
- 复合索引：`[user_id, updatedAt desc]`、`[trigger_source, createdAt desc]`、`[initial_risk_level, createdAt desc]`
- 时间范围索引：`[createdAt desc, is_deleted]`
- 统计索引：`[active_agent_key, createdAt desc]`、`[custom_agent_id, updatedAt desc]` 支撑多Agent使用分析与自定义角色统计
- 设计理由：用户会话历史查询；触发来源分析；风险级别筛查；Agent 切换统计；自定义角色活跃度；时间范围过滤；与 Dify 会话的幂等同步。

## 4. 访问控制（TCB 权限）
```json
{
  "read": "_openid == auth.openid || auth.role in ['counselor','ops']",
  "write": "auth.role in ['dify_service','counselor','ops']"
}
```

Dify服务负责写入；用户可读取自身会话；辅导员在紧急情况下可访问。

## 5. 关系与级联
- `user_id` → `users`
- `dify_conversation_id` ↔ Dify `/conversations` API 响应 `id`
- `custom_agent_id` → `ask_agents`
- `generated_task_ids` → `tasks`
- `counselor_handoff.counselor_id` → `users`（辅导员）
- 与 `ask_messages` 形成一对多关系
- 删除策略：软删保留审计；删除时匿名化处理敏感内容；同步调用 Dify `DELETE /conversations/{id}` 作业由后台任务处理。

## 6. 数据生命周期与合规
- 留存：常规对话保留6个月；危机干预会话保留2年用于专业评估
- 匿名化：删除前对对话内容进行脱敏处理，保留CBT应用统计
- 导出：用户可导出自身对话记录，需身份验证
- 审计字段：`createdAt`、`updatedAt`、`endedAt`、`intervention_triggered`

## 7. API/云函数契约映射
| 接口/函数 | 读/写 | 使用字段 | 过滤条件 | 排序/分页 | 备注 |
| `/api/ask/sessions` GET | 读 | session_type, trigger_source, session_summary, session_title, createdAt, satisfaction_score, modality_flags | `user_id = auth.uid`, `is_deleted=false` | `createdAt desc`, 分页 | 对话历史列表 |
| `/api/ask/sessions` POST | 写 | session_type, trigger_source, initial_risk_level, dify_conversation_id, active_agent_key, custom_agent_id, agent_origin | `_openid = auth.openid` | - | 创建新会话并落地 Dify 映射 |
| `/api/ask/sessions/{id}` PATCH | 写 | final_risk_level, session_summary, session_title, satisfaction_score, follow_up_needed, voice_config, custom_agent_id, agent_origin | `_id` 匹配 | - | 更新会话状态 |
| `/api/ask/sessions/{id}/modality` PATCH | 写 | modality_flags, audio_message_count, attachment_count | `_id` 匹配 | - | 会话内语音/附件统计刷新 |
| 云函数 `difySessionManager` | 写 | dify_conversation_id, conversation_variables, agent_snapshot, custom_agent_id | - | - | 管理会话变量写回 Dify `/conversations` |
| Dify工作流 `sessionManager` | 写 | 所有字段 | - | - | 会话生命周期管理 |
| Dify `GET /conversations` 同步任务 | 读 | dify_conversation_id, session_title, updatedAt | `user_id`, `is_deleted=false` | `updatedAt desc` | nightly 校准 Dify 名称、更新时间 |
| 风险监控 `riskMonitor` | 读 | initial_risk_level, final_risk_level, intervention_triggered | 时间范围 | - | 风险会话统计 |

## 8. 示例文档（≥3条）
```json
{
  "_id": "ask_session_001",
  "_openid": "oAbcd123",
  "user_id": "usr_001",
  "dify_conversation_id": "3c90c3cc-0d44-4b50-8888-8dd25736052a",
  "session_title": "焦虑情绪梳理",
  "session_type": "cbt_guided",
  "trigger_source": "mood_checkin",
  "active_agent_key": "cbt_specialist",
  "agent_origin": "system_default",
  "agent_snapshot": {
    "name": "CBT助手",
    "persona": "认知行为疗法专家",
    "version": "2024.04",
    "origin": "system_default",
    "dify_agent_id": "agt_cbt_default"
  },
  "conversation_variables": {
    "mood": "anxious",
    "scene": "exam_preparation"
  },
  "modality_flags": {
    "text": true,
    "audio": true,
    "file": false
  },
  "voice_config": {
    "tts_voice": "calm_female_cn",
    "stt_language": "zh-CN",
    "enable_tts": true
  },
  "cbt_focus": "cognitive_restructuring",
  "initial_risk_level": "L2",
  "final_risk_level": "L1",
  "session_summary": "用户因学业压力产生焦虑，通过认知重构技巧识别了非理性信念，制定了行为实验计划",
  "key_insights": ["完美主义思维模式", "考试失败恐惧", "自我价值感低"],
  "cbt_techniques_used": ["证据检验", "替代思维生成", "行为实验设计"],
  "generated_task_ids": ["task_cbt_001", "task_cbt_002"],
  "audio_message_count": 3,
  "attachment_count": 0,
  "satisfaction_score": 4,
  "follow_up_needed": true,
  "follow_up_at": "2024-04-08T14:00:00Z",
  "message_count": 15,
  "duration_seconds": 480,
  "createdAt": "2024-04-06T10:30:00Z",
  "updatedAt": "2024-04-06T18:30:00Z",
  "endedAt": "2024-04-06T18:30:00Z"
}
{
  "_id": "ask_session_002",
  "_openid": "oAbcd456",
  "user_id": "usr_002",
  "dify_conversation_id": "6f7d9099-9ee9-4d9d-9cf1-0a0e2df4a001",
  "session_type": "crisis_intervention",
  "trigger_source": "journal_negative",
  "active_agent_key": "crisis_interventionist",
  "agent_origin": "system_default",
  "agent_snapshot": {
    "name": "危机干预",
    "persona": "紧急心理支持专家",
    "version": "2024.04",
    "origin": "system_default",
    "dify_agent_id": "agt_crisis_default"
  },
  "conversation_variables": {
    "riskFlag": "high",
    "autoEscalated": true
  },
  "modality_flags": {
    "text": true,
    "audio": false,
    "file": true
  },
  "attachment_count": 2,
  "initial_risk_level": "L3",
  "final_risk_level": "L2",
  "session_summary": "用户表达强烈的绝望情绪，进行了危机干预和资源推荐，已转交辅导员跟进",
  "key_insights": ["绝望感", "社交孤立", "无价值感"],
  "cbt_techniques_used": ["情绪稳定技巧", "安全规划", "社会支持激活"],
  "counselor_handoff": {
    "handoff_reason": "crisis_risk",
    "counselor_id": "counselor_001",
    "handoff_time": "2024-04-06T16:45:00Z"
  },
  "intervention_triggered": true,
  "message_count": 8,
  "duration_seconds": 320,
  "createdAt": "2024-04-06T16:20:00Z",
  "updatedAt": "2024-04-06T16:45:00Z",
  "endedAt": "2024-04-06T16:45:00Z"
}
{
  "_id": "ask_session_003",
  "_openid": "oAbcd789",
  "user_id": "usr_003",
  "dify_conversation_id": "b1dd8a56-847c-4a3f-bb0d-02e93d702010",
  "session_type": "general",
  "trigger_source": "manual_trigger",
  "active_agent_key": "custom_role",
  "custom_agent_id": "ask_agent_usr003_01",
  "agent_origin": "user_custom",
  "agent_snapshot": {
    "name": "暖心导师",
    "persona": "擅长睡眠卫生与自我关怀的导师",
    "version": "2024.05",
    "origin": "user_custom",
    "dify_agent_id": "agt_usr003_sleep"
  },
  "session_summary": "用户咨询睡眠问题，获得了睡眠卫生建议和放松技巧",
  "key_insights": ["入睡困难", "作息不规律"],
  "cbt_techniques_used": ["睡眠卫生教育", "放松训练"],
  "audio_message_count": 0,
  "attachment_count": 0,
  "satisfaction_score": 5,
  "message_count": 6,
  "duration_seconds": 180,
  "createdAt": "2024-04-05T22:15:00Z",
  "updatedAt": "2024-04-05T22:45:00Z",
  "endedAt": "2024-04-05T22:45:00Z"
}
```

## 9. 常用查询样例（≥3条）
```javascript
// 用户的最近对话会话（含 Dify 映射）
const recentSessions = await db.collection('ask_sessions')
  .where({ user_id: auth.uid, is_deleted: false })
  .orderBy('updatedAt', 'desc')
  .limit(10)
  .field({ session_title: true, dify_conversation_id: true, modality_flags: true, active_agent_key: true })
  .get();

// 风险会话统计
const riskSessions = await db.collection('ask_sessions')
  .where({
    initial_risk_level: db.command.in(['L3', 'L4']),
    createdAt: db.command.gte(new Date(Date.now() - 30 * 86400000).toISOString())
  })
  .count();

// CBT技术应用统计
const cbtStats = await db.collection('ask_sessions')
  .where({
    session_type: 'cbt_guided',
    createdAt: db.command.gte(new Date(Date.now() - 7 * 86400000).toISOString())
  })
  .field({ cbt_techniques_used: true, satisfaction_score: true })
  .get();

// 语音能力启用的会话，用于同步语音转写配置
const voiceEnabledSessions = await db.collection('ask_sessions')
  .where({ 'voice_config.enable_tts': true, is_deleted: false })
  .field({ dify_conversation_id: true, voice_config: true })
  .get();

// 自定义 Agent 会话，用于构建个性化 Agent 列表
const customAgentSessions = await db.collection('ask_sessions')
  .where({ custom_agent_id: db.command.exists(true), is_deleted: false })
  .field({ custom_agent_id: true, agent_snapshot: true, user_id: true })
  .get();

// 需要跟进的会话
const followUpSessions = await db.collection('ask_sessions')
  .where({
    follow_up_needed: true,
    follow_up_at: db.command.lte(new Date().toISOString())
  })
  .get();
```

## 10. 边界与错误码
- 超长会话：消息数量超过100条返回 `E_SESSION_TOO_LONG`
- 风险升级：L3/L4级别自动触发辅导员通知流程
- 并发会话：同一用户同时存在活跃会话返回 `E_SESSION_ACTIVE_EXISTS`
- Dify映射：缺失 `dify_conversation_id` 或远端不存在返回 `E_DIFY_SESSION_NOT_FOUND`
- 语音配置：语音互转功能未启用但收到语音统计更新返回 `E_SESSION_VOICE_DISABLED`
- 附件统计：文件计数与消息实际附件不一致返回 `E_SESSION_FILE_MISMATCH`
- 自定义 Agent：`custom_agent_id` 不存在或归属不匹配返回 `E_SESSION_AGENT_INVALID`
- 越权：非授权访问危机干预会话返回 `E_FORBIDDEN`

## 11. 变更影响评估
- 字段变更需同步Dify工作流payload、Ask心理助理UI、埋点 `ask_session_start/end`
- 索引调整影响会话历史查询性能和风险监控响应时间
- 新增CBT焦点领域需要更新AI模型知识库
- `custom_agent_id` 依赖 `ask_agents` 集合，需保持版本快照一致，更新需触发会话重放校验

## 12. 假设与待确认
- 假设会话与Dify工作流的 `dify_conversation_id` 已唯一映射；待确认历史数据回填策略
- 待确认危机干预会话的辅导员通知机制和响应SLA
- 待确认CBT技巧的标准化分类和效果评估指标
- 待确认自定义角色(`custom_role`)Agent的配置存储结构与版本管理策略
- 待确认机构模板(`org_template`)的跨组织共享及权限边界
- 待确认用户自定义Agent的审核流程与风控要求
