# 集合：AI对话消息（ask_messages）

## 1. 目的与使用场景
- 存储AI对话的详细消息记录，支持CBT技巧标记、效果评估和会话回溯。由Ask心理助理、Dify工作流、质量评估系统使用。
- 承载 Dify Chatbot/Agent 消息实体，记录语音转写、文字转语音任务状态，关联文件上传与引用明细，为心语精灵多Agent对话及后续自定义角色提供数据基座。

**枚举值**：
- message_type: `user`（用户消息）、`assistant`（AI回复）、`system`（系统消息）
- message_role: `opening`（开场）、`exploration`（探索）、`assessment`（评估）、`intervention`（干预）、`closure`（结束）、`follow_up`（跟进）
- delivery_status: `streaming`（流式生成中）、`completed`（生成完成）、`stopped`（用户手动停止）、`failed`（生成失败）
- content_type: `text`（纯文本）、`voice`（语音URL）、`audio`（语音文件附件）、`image`（图片）、`structured_form`（结构化表单）
- transcript_status: `pending`（待转写）、`processing`（转写中）、`completed`（已完成）、`failed`（失败）、`not_applicable`（非语音消息）
- agent_origin: `system_default`（内置模板）、`org_template`（机构模板）、`user_custom`（用户自定义）
- cbt_technique: `cognitive_restructuring`（认知重构）、`evidence_examination`（证据检验）、`alternative_thinking`（替代思维）、`behavioral_experiment`（行为实验）、`emotion_regulation`（情绪调节）、`mindfulness`（正念练习）、`problem_solving`（问题解决）、`none`（无特定技巧）
- effectiveness_score: `none`（未评估）、`low`（低效果）、`medium`（中等效果）、`high`（高效果）
- user_reaction: `helpful`（有帮助）、`neutral`（一般）、`confusing`（困惑）、`unhelpful`（没帮助）

## 2. Schema 定义
| 字段 | 类型 | 必填 | 默认值 | 约束/校验 | 说明 | 隐私分级 |
|---|---|---|---|---|---|---|
| _id | string | 是 | - | TCB 自动 | 主键 | P2 |
| session_id | 指针id | 是 | - | 指向 ask_sessions._id | 所属会话 | P2 |
| dify_message_id | string | 是 | - | UUID，唯一索引 | 映射 Dify 消息 ID | P1 |
| dify_task_id | string | 否 | - | UUID | Dify 流式任务 ID | P1 |
| agent_key | string | 否 | - | 枚举(cbt_specialist,emotion_advisor,behavior_coach,crisis_interventionist,custom_role) | 消息关联的Agent标识 | P1 |
| custom_agent_id | 指针id | 否 | - | 指向 ask_agents._id | 自定义 Agent 引用 | P1 |
| agent_origin | string | 否 | system_default | 枚举(system_default,org_template,user_custom) | Agent来源 | P1 |
| agent_snapshot | object | 否 | - | 包含 name, persona, version, origin, dify_agent_id | Agent 配置快照 | P2 |
| message_type | string | 是 | user | 枚举(user,assistant,system) | 消息类型 | P1 |
| message_role | string | 否 | exploration | 枚举(opening,exploration,assessment,intervention,closure,follow_up) | 消息角色 | P1 |
| delivery_status | string | 否 | completed | 枚举(streaming,completed,stopped,failed) | 生成状态 | P1 |
| response_mode | string | 否 | streaming | 枚举(streaming,blocking) | 请求响应模式 | P1 |
| content | string | 是 | - | 长度 ≤ 2000 | 文本或转写内容 | P3 |
| content_type | string | 否 | text | 枚举(text,voice,audio,image,structured_form) | 内容类型 | P2 |
| message_files | array | 否 | [] | 元素为对象{id,type,url,belongs_to,size,upload_file_id} | 引用的文件列表 | P2 |
| audio_metadata | object | 否 | - | 包含 audio_url, asset_id, duration_ms, transcript_status, language, tts_voice | 语音互转元数据 | P2 |
| suggested_questions | array | 否 | [] | 每项 ≤ 120 字符 | 下一轮建议问题 | P2 |
| emotion_analysis | object | 否 | - | 结构见下：必含 primary_emotion, secondary_emotions, intensity, valence, arousal, radar_dimensions{trust, openness, resistance, stress, control}, topic_keywords, emotion_triggers, cultural_context_notes, risk_level, scene_label, scene_token, recommended_agents, scene_strategy, summary, actionable_suggestions(=3)；数值字段范围 valence[-1,1] 其余 [0,1] | 情绪结构化分析 | P2 |
| inputs_snapshot | object | 否 | - | JSON Schema: key ≤ 30，值长度 ≤ 200 | 请求时传入的 inputs | P2 |
| retriever_resources | array | 否 | [] | 元素为对象{dataset_id,segment_id,score,content} | 检索引用片段 | P2 |
| usage_metrics | object | 否 | - | 包含 prompt_tokens, completion_tokens, latency_ms | 模型用量 | P1 |
| feedback | object | 否 | - | 包含 rating, comment | 点赞/点踩反馈 | P2 |
| cbt_technique | string | 否 | none | 枚举(cognitive_restructuring,evidence_examination,alternative_thinking,behavioral_experiment,emotion_regulation,mindfulness,problem_solving,none) | CBT技巧类型 | P2 |
| cbt_target | string | 否 | - | 长度 ≤ 100 | CBT目标描述 | P2 |
| cognitive_distortions | array | 否 | [] | 元素为 string | 识别的认知扭曲 | P3 |
| automatic_thoughts | array | 否 | [] | 元素为 string | 自动思维记录 | P3 |
| evidence_prompt | string | 否 | - | 长度 ≤ 500 | 证据检验提示 | P2 |
| evidence_response | string | 否 | - | 长度 ≤ 500 | 证据检验响应 | P2 |
| alternative_thoughts | array | 否 | [] | 元素为 string | 替代思维生成 | P2 |
| behavioral_suggestions | array | 否 | [] | 元素为 string | 行为建议 | P2 |
| effectiveness_score | string | 否 | none | 枚举(none,low,medium,high) | 效果评分 | P2 |
| user_reaction | string | 否 | - | 枚举(helpful,neutral,confusing,unhelpful) | 用户反馈 | P2 |
| risk_level_change | object | 否 | - | 包含 before, after, change_direction | 风险等级变化 | P3 |
| task_generated | bool | 否 | false | - | 是否生成任务 | P1 |
| generated_task_id | 指针id | 否 | - | 指向 tasks._id | 生成任务ID | P1 |
| processing_time_ms | number | 否 | - | ≥0 | AI处理时间(毫秒) | P1 |
| message_index | number | 是 | - | ≥0 | 消息序号 | P1 |
| parent_message_id | 指针id | 否 | - | 指向本表_id | 父消息ID | P2 |
| metadata | object | 否 | - | 包含技术细节 | 技术元数据 | P1 |
| createdAt | date | 是 | - | 服务端时间 | 发送时间 | P1 |
| is_deleted | bool | 否 | false | - | 软删标记 | P2 |

## 3. 索引与唯一约束
- 唯一索引：`dify_message_id`
- 单字段索引：`session_id`、`message_type`、`content_type`、`delivery_status`、`cbt_technique`、`effectiveness_score`、`agent_key`、`custom_agent_id`、`emotion_analysis.risk_level`
- 复合索引：`[session_id, message_index asc]`、`[session_id, createdAt asc]`
- 时间范围索引：`[createdAt desc, session_id]`
- 含检索引用索引：`[retriever_resources.dataset_id, createdAt desc]`
- 设计理由：会话内消息顺序；流式/停止状态追踪；CBT技巧效果分析；时间范围查询；引用文档快速定位；与 Dify 消息幂等同步。

## 4. 访问控制（TCB 权限）
```json
{
  "read": "auth.role in ['dify_service','counselor','ops']",
  "write": "auth.role in ['dify_service','ops']"
}
```

仅Dify服务可写入；用户不能直接访问消息详情；辅导员和运营可查看用于质量控制。语音文件与附件的 URL 需通过临时凭证下发，避免越权访问。

## 5. 关系与级联
- `session_id` → `ask_sessions`
- `dify_message_id` ↔ Dify `/messages` API 响应 `id`
- `message_files.upload_file_id` → `attachments`（云存储文件）
- `emotion_analysis.recommended_agents[]` → `ask_agents.agent_key`
- `generated_task_id` → `tasks`
- `parent_message_id` → `ask_messages`（自身引用）
- `custom_agent_id` → `ask_agents`
- 删除策略：随会话软删；独立消息删除需保持会话完整性；同步触发 Dify 消息撤回任务由后台异步执行。

## 6. 数据生命周期与合规
- 留存：常规消息保留6个月；危机干预消息保留2年
- 匿名化：删除前对具体内容进行脱敏，保留CBT应用统计
- 加密：消息内容加密存储，传输使用HTTPS
- 审计字段：`createdAt`、`processing_time_ms`、`effectiveness_score`

## 7. API/云函数契约映射
| 接口/函数 | 读/写 | 使用字段 | 过滤条件 | 排序/分页 | 备注 |
| Dify `POST /chat-messages` | 写 | dify_message_id, dify_task_id, agent_key, custom_agent_id, content, content_type, message_files, delivery_status, response_mode, inputs_snapshot | - | - | 新消息创建，流式 chunk 聚合后写入 |
| Dify `GET /messages` | 读 | dify_message_id, agent_key, agent_origin, message_files, retriever_resources, emotion_analysis | `dify_conversation_id` | `createdAt desc` | 历史消息拉取回填 |
| Dify `GET /messages/{message_id}/suggested` | 读 | suggested_questions | `dify_message_id` | - | 下一轮建议问题缓存 |
| Dify `POST /chat-messages/{task_id}/stop` | 写 | dify_task_id, delivery_status | `delivery_status='streaming'` | - | 停止流式生成后更新状态 |
| `/api/ask/messages` GET | 读 | content, content_type, audio_metadata, message_files, usage_metrics, agent_key, agent_origin, emotion_analysis | `session_id`, `is_deleted=false` | `message_index asc` | 小程序消息列表 |
| `/api/ask/messages` POST | 写 | message_type, message_role, content, content_type, audio_metadata, message_files, agent_key, custom_agent_id | - | - | 用户消息写入 |
| `/api/ask/messages/{id}/emotion` PATCH | 写 | emotion_analysis | `_id` 匹配 | - | 情绪分析回填接口 |
| CBT效果分析 | 读 | cbt_technique, effectiveness_score, user_reaction | 时间范围 | - | 技巧效果统计 |
| 质量评估系统 | 读 | content, processing_time_ms, user_reaction, feedback | 抽样条件 | - | 对话质量评估 |
| 风险监控 | 读 | risk_level_change, cognitive_distortions, audio_metadata | 风险条件 | - | 风险变化分析 |

## 8. 示例文档（≥3条）
```json
{
  "_id": "msg_001",
  "session_id": "ask_session_001",
  "dify_message_id": "af3fbf0f-32f1-4b57-9b18-0ee6c0cdb001",
  "agent_key": "cbt_specialist",
  "agent_origin": "system_default",
  "agent_snapshot": {
    "name": "CBT助手",
    "persona": "认知行为疗法专家",
    "version": "2024.04",
    "origin": "system_default",
    "dify_agent_id": "agt_cbt_default"
  },
  "message_type": "user",
  "message_role": "exploration",
  "delivery_status": "completed",
  "content": "我觉得这次考试肯定会失败，大家都比我强，我什么都学不会",
  "content_type": "text",
  "inputs_snapshot": {
    "mood": "anxious"
  },
  "cognitive_distortions": ["灾难化思维", "过度概括", "负面过滤"],
  "automatic_thoughts": ["我肯定失败", "别人都比我强", "我学不会"],
  "risk_level_change": {
    "before": "L2",
    "after": "L2",
    "change_direction": "stable"
  },
  "message_index": 1,
  "createdAt": "2024-04-06T10:35:00Z"
}
{
  "_id": "msg_002",
  "session_id": "ask_session_001",
  "dify_message_id": "4fcde6aa-c6a0-4fcc-9c72-4a32e4bde202",
  "dify_task_id": "1f6a6ecd-2a6c-4b8e-9fd7-5be51f56aa11",
  "agent_key": "cbt_specialist",
  "agent_origin": "system_default",
  "agent_snapshot": {
    "name": "CBT助手",
    "persona": "认知行为疗法专家",
    "version": "2024.04",
    "origin": "system_default",
    "dify_agent_id": "agt_cbt_default"
  },
  "message_type": "assistant",
  "message_role": "assessment",
  "delivery_status": "completed",
  "response_mode": "streaming",
  "content": "我注意到你提到'肯定失败'和'什么都学不会'，这些想法可能包含了一些认知扭曲。让我们一起来检验一下这些想法：有什么具体证据支持你'肯定会失败'这个想法吗？",
  "content_type": "text",
  "cbt_technique": "evidence_examination",
  "cbt_target": "灾难化思维识别",
  "evidence_prompt": "检验'肯定失败'的证据",
  "evidence_response": "引导用户寻找支持/反对证据",
  "processing_time_ms": 1200,
  "usage_metrics": {
    "prompt_tokens": 150,
    "completion_tokens": 280,
    "latency_ms": 1200
  },
  "retriever_resources": [
    {
      "dataset_id": "dataset_cbt_ref",
      "segment_id": "segment_001",
      "score": 0.82,
      "content": "考试焦虑的常见认知扭曲"
    }
  ],
  "emotion_analysis": {
    "primary_emotion": "anxiety",
    "secondary_emotions": ["worry", "self-doubt"],
    "intensity": 0.72,
    "valence": -0.6,
    "arousal": 0.68,
    "radar_dimensions": {
      "trust": 0.55,
      "openness": 0.62,
      "resistance": 0.48,
      "stress": 0.74,
      "control": 0.41
    },
    "topic_keywords": ["考试", "失败", "比较"],
    "emotion_triggers": ["即将考试", "同伴比较"],
    "cultural_context_notes": "高考导向环境中常见的成绩焦虑",
    "risk_level": 1,
    "scene_label": "exam_pressure",
    "scene_token": "scene_exam_pressure",
    "recommended_agents": ["cbt_specialist", "behavior_coach"],
    "scene_strategy": "cbt_cognitive_restructuring",
    "summary": "用户因考试焦虑产生灾难化思维，需要引导检验证据并强化自我效能感。",
    "actionable_suggestions": [
      "邀请用户列出过去成功经验",
      "引导识别最坏情况及应对方案",
      "建议安排短时放松练习"
    ]
  },
  "message_index": 2,
  "parent_message_id": "msg_001",
  "metadata": {
    "model": "gpt-4",
    "technique_confidence": 0.85
  },
  "createdAt": "2024-04-06T10:35:15Z"
}
{
  "_id": "msg_003",
  "session_id": "ask_session_001",
  "dify_message_id": "4ffab012-9473-4a1c-b835-cfbb8b0cd503",
  "agent_key": "cbt_specialist",
  "agent_origin": "system_default",
  "message_type": "user",
  "message_role": "intervention",
  "delivery_status": "completed",
  "content": "其实我上次小测验考了85分，而且老师说我进步很大。而且我每天复习4小时，应该不会太差。",
  "content_type": "text",
  "automatic_thoughts": ["上次考了85分", "老师说我有进步", "每天复习4小时"],
  "alternative_thoughts": ["我有可能考得不错", "努力会有回报"],
  "risk_level_change": {
    "before": "L2",
    "after": "L1",
    "change_direction": "improving"
  },
  "message_index": 3,
  "parent_message_id": "msg_002",
  "createdAt": "2024-04-06T10:36:00Z"
}
{
  "_id": "msg_004",
  "session_id": "ask_session_001",
  "dify_message_id": "b8039d3e-28e4-4d04-9d1f-813ff6f00504",
  "agent_key": "cbt_specialist",
  "agent_origin": "system_default",
  "agent_snapshot": {
    "name": "CBT助手",
    "persona": "认知行为疗法专家",
    "version": "2024.04",
    "origin": "system_default",
    "dify_agent_id": "agt_cbt_default"
  },
  "message_type": "assistant",
  "message_role": "closure",
  "delivery_status": "completed",
  "content": "很好！你找到了证据来挑战原来的想法。现在你有了更平衡的认知：虽然考试有挑战，但你的努力和进步是真实的。我建议你制定一个具体的复习计划，这样可以减少焦虑。要帮你生成一个复习任务吗？",
  "content_type": "text",
  "cbt_technique": "cognitive_restructuring",
  "cbt_target": "认知重构完成",
  "behavioral_suggestions": ["制定复习计划", "分解学习任务", "设定合理目标"],
  "suggested_questions": [
    "还有哪些情境会触发类似的想法？",
    "你希望我帮你安排哪种复习任务？"
  ],
  "task_generated": true,
  "generated_task_id": "task_study_plan_001",
  "effectiveness_score": "high",
  "processing_time_ms": 800,
  "message_index": 4,
  "parent_message_id": "msg_003",
  "createdAt": "2024-04-06T10:36:20Z"
}
{
  "_id": "msg_005",
  "session_id": "ask_session_001",
  "dify_message_id": "c912c65e-7d3b-4e22-836c-22ef1f52c505",
  "agent_key": "custom_role",
  "custom_agent_id": "ask_agent_usr003_01",
  "agent_origin": "user_custom",
  "agent_snapshot": {
    "name": "暖心导师",
    "persona": "擅长睡眠卫生与自我关怀的导师",
    "version": "2024.05",
    "origin": "user_custom",
    "dify_agent_id": "agt_usr003_sleep"
  },
  "message_type": "assistant",
  "message_role": "intervention",
  "delivery_status": "completed",
  "content": "<audio>",
  "content_type": "audio",
  "audio_metadata": {
    "asset_id": "audio_task_7788",
    "audio_url": "https://cdn.mindguard.ai/audio/task_7788.mp3",
    "duration_ms": 42000,
    "language": "zh-CN",
    "transcript_status": "completed",
    "transcript_text": "你好，我会把我们的关键要点录音发送给你，随时回放练习。",
    "tts_voice": "calm_female_cn"
  },
  "message_files": [
    {
      "id": "upload_001",
      "type": "audio",
      "url": "https://cdn.mindguard.ai/audio/task_7788.mp3",
      "belongs_to": "assistant",
      "size": 5234210
    }
  ],
  "message_index": 5,
  "createdAt": "2024-04-06T10:36:35Z"
}
```

## 9. 常用查询样例（≥3条）
```javascript
// 会话的消息列表（含语音与附件元数据）
const sessionMessages = await db.collection('ask_messages')
  .where({ session_id: sessionId, is_deleted: false })
  .orderBy('message_index', 'asc')
  .field({ content: true, content_type: true, audio_metadata: true, message_files: true, agent_key: true, agent_origin: true, emotion_analysis: true })
  .get();

// CBT技巧效果统计
const cbtEffectiveness = await db.collection('ask_messages')
  .where({
    cbt_technique: 'cognitive_restructuring',
    effectiveness_score: db.command.in(['medium', 'high']),
    createdAt: db.command.gte(new Date(Date.now() - 30 * 86400000).toISOString())
  })
  .count();

// 认知扭曲识别统计
const distortionStats = await db.collection('ask_messages')
  .where({
    message_type: 'user',
    cognitive_distortions: db.command.exists(true)
  })
  .field({ cognitive_distortions: true })
  .get();

// AI响应时间分析
const responseTime = await db.collection('ask_messages')
  .where({
    message_type: 'assistant',
    processing_time_ms: db.command.exists(true)
  })
  .field({ processing_time_ms: true, cbt_technique: true, usage_metrics: true })
  .get();

// 待转写语音消息同步队列
const pendingTranscript = await db.collection('ask_messages')
  .where({ 'audio_metadata.transcript_status': db.command.in(['pending', 'processing']) })
  .field({ dify_message_id: true, audio_metadata: true })
  .get();

// 用户自定义 Agent 的消息评估
const customAgentMessages = await db.collection('ask_messages')
  .where({ custom_agent_id: db.command.exists(true), is_deleted: false })
  .orderBy('createdAt', 'desc')
  .limit(20)
  .field({ custom_agent_id: true, agent_snapshot: true, effectiveness_score: true, user_reaction: true, emotion_analysis: true })
  .get();

// 最近高风险情绪消息（risk_level >=2）
const riskEmotionMessages = await db.collection('ask_messages')
  .where({ 'emotion_analysis.risk_level': db.command.gte(2), is_deleted: false })
  .orderBy('createdAt', 'desc')
  .limit(50)
  .field({ session_id: true, emotion_analysis: true, agent_key: true })
  .get();
```

## 10. 边界与错误码
- 超长消息：内容超过2000字符返回 `E_MESSAGE_TOO_LONG`
- 顺序错误：message_index不连续返回 `E_MESSAGE_SEQUENCE_ERROR`
- 处理超时：AI响应超过10秒记录异常
- 流式终止：停止任务失败返回 `E_MESSAGE_STOP_FAILED`
- 语音互转：转写或合成失败返回 `E_AUDIO_TRANSFORM_FAILED`
- 附件：文件未上传或引用无效返回 `E_MESSAGE_FILE_INVALID`
- 自定义 Agent：`custom_agent_id` 与会话或用户不匹配返回 `E_MESSAGE_AGENT_INVALID`
- 敏感内容：检测到高风险内容触发审核流程

## 11. 变更影响评估
- 新增CBT技巧类型需要更新AI模型知识库和分类体系
- 字段变更影响Dify工作流的数据结构和对话逻辑
- 效果评估机制变更影响算法优化和服务质量监控
- `custom_agent_id` / `agent_snapshot` 需与 `ask_agents` 同步，更新需触发历史消息快照校验

## 12. 假设与待确认
- 假设消息序号由Dify服务维护；待确认并发场景的序号生成策略
- 待确认效果评分的收集机制：自动评估vs用户主动反馈
- 待确认敏感内容检测的具体规则和处理流程
- 待确认语音互转服务的重试策略与失败告警标准
- 待确认自定义角色消息的字段扩展（例如 persona、style 标签）
- 待确认自定义 Agent 消息的版本兼容策略，历史消息是否需要更新 snapshot
