# 集合：AI对话消息（ask_messages）

## 1. 目的与使用场景
- 存储AI对话的详细消息记录，支持CBT技巧标记、效果评估和会话回溯。由Ask心理助理、Dify工作流、质量评估系统使用。

**枚举值**：
- message_type: `user`（用户消息）、`assistant`（AI回复）、`system`（系统消息）
- cbt_technique: `cognitive_restructuring`（认知重构）、`evidence_examination`（证据检验）、`alternative_thinking`（替代思维）、`behavioral_experiment`（行为实验）、`emotion_regulation`（情绪调节）、`mindfulness`（正念练习）、`problem_solving`（问题解决）、`none`（无特定技巧）
- message_role: `opening`（开场）、`exploration`（探索）、`assessment`（评估）、`intervention`（干预）、`closure`（结束）、`follow_up`（跟进）
- effectiveness_score: `none`（未评估）、`low`（低效果）、`medium`（中等效果）、`high`（高效果）

## 2. Schema 定义
| 字段 | 类型 | 必填 | 默认值 | 约束/校验 | 说明 | 隐私分级 |
|---|---|---|---|---|---|---|
| _id | string | 是 | - | TCB 自动 | 主键 | P2 |
| session_id | 指针id | 是 | - | 指向 ask_sessions._id | 所属会话 | P2 |
| message_type | string | 是 | user | 枚举(user,assistant,system) | 消息类型 | P1 |
| message_role | string | 否 | exploration | 枚举(opening,exploration,assessment,intervention,closure,follow_up) | 消息角色 | P1 |
| content | string | 是 | - | 长度 ≤ 2000 | 消息内容 | P3 |
| content_type | string | 否 | text | 枚举(text,voice,image,structured_form) | 内容类型 | P2 |
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
- 单字段索引：`session_id`、`message_type`、`cbt_technique`、`effectiveness_score`
- 复合索引：`[session_id, message_index asc]`、`[session_id, createdAt asc]`
- 时间范围索引：`[createdAt desc, session_id]`
- 效果评估索引：`[cbt_technique, effectiveness_score, createdAt desc]`
- 设计理由：会话内消息顺序；CBT技巧效果分析；时间范围查询；用户反馈统计。

## 4. 访问控制（TCB 权限）
```json
{
  "read": "auth.role in ['dify_service','counselor','ops']",
  "write": "auth.role in ['dify_service','ops']"
}
```

仅Dify服务可写入；用户不能直接访问消息详情；辅导员和运营可查看用于质量控制。

## 5. 关系与级联
- `session_id` → `ask_sessions`
- `generated_task_id` → `tasks`
- `parent_message_id` → `ask_messages`（自身引用）
- 删除策略：随会话软删；独立消息删除需保持会话完整性。

## 6. 数据生命周期与合规
- 留存：常规消息保留6个月；危机干预消息保留2年
- 匿名化：删除前对具体内容进行脱敏，保留CBT应用统计
- 加密：消息内容加密存储，传输使用HTTPS
- 审计字段：`createdAt`、`processing_time_ms`、`effectiveness_score`

## 7. API/云函数契约映射
| 接口/函数 | 读/写 | 使用字段 | 过滤条件 | 排序/分页 | 备注 |
| Dify对话服务 | 写 | 所有字段 | `session_id` 匹配 | - | 消息记录 |
| CBT效果分析 | 读 | cbt_technique, effectiveness_score, user_reaction | 时间范围 | - | 技巧效果统计 |
| 质量评估系统 | 读 | content, processing_time_ms, user_reaction | 抽样条件 | - | 对话质量评估 |
| 风险监控 | 读 | risk_level_change, cognitive_distortions | 风险条件 | - | 风险变化分析 |

## 8. 示例文档（≥3条）
```json
{
  "_id": "msg_001",
  "session_id": "ask_session_001",
  "message_type": "user",
  "message_role": "exploration",
  "content": "我觉得这次考试肯定会失败，大家都比我强，我什么都学不会",
  "content_type": "text",
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
  "message_type": "assistant",
  "message_role": "assessment",
  "content": "我注意到你提到'肯定失败'和'什么都学不会'，这些想法可能包含了一些认知扭曲。让我们一起来检验一下这些想法：有什么具体证据支持你'肯定会失败'这个想法吗？",
  "content_type": "text",
  "cbt_technique": "evidence_examination",
  "cbt_target": "灾难化思维识别",
  "evidence_prompt": "检验'肯定失败'的证据",
  "evidence_response": "引导用户寻找支持/反对证据",
  "processing_time_ms": 1200,
  "message_index": 2,
  "parent_message_id": "msg_001",
  "metadata": {
    "model": "gpt-4",
    "tokens_used": 150,
    "technique_confidence": 0.85
  },
  "createdAt": "2024-04-06T10:35:15Z"
}
{
  "_id": "msg_003",
  "session_id": "ask_session_001",
  "message_type": "user",
  "message_role": "intervention",
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
  "message_type": "assistant",
  "message_role": "closure",
  "content": "很好！你找到了证据来挑战原来的想法。现在你有了更平衡的认知：虽然考试有挑战，但你的努力和进步是真实的。我建议你制定一个具体的复习计划，这样可以减少焦虑。要帮你生成一个复习任务吗？",
  "content_type": "text",
  "cbt_technique": "cognitive_restructuring",
  "cbt_target": "认知重构完成",
  "behavioral_suggestions": ["制定复习计划", "分解学习任务", "设定合理目标"],
  "task_generated": true,
  "generated_task_id": "task_study_plan_001",
  "effectiveness_score": "high",
  "processing_time_ms": 800,
  "message_index": 4,
  "parent_message_id": "msg_003",
  "createdAt": "2024-04-06T10:36:20Z"
}
```

## 9. 常用查询样例（≥3条）
```javascript
// 会话的消息列表
const sessionMessages = await db.collection('ask_messages')
  .where({ session_id: sessionId, is_deleted: false })
  .orderBy('message_index', 'asc')
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
  .field({ processing_time_ms: true, cbt_technique: true })
  .get();
```

## 10. 边界与错误码
- 超长消息：内容超过2000字符返回 `E_MESSAGE_TOO_LONG`
- 顺序错误：message_index不连续返回 `E_MESSAGE_SEQUENCE_ERROR`
- 处理超时：AI响应超过10秒记录异常
- 敏感内容：检测到高风险内容触发审核流程

## 11. 变更影响评估
- 新增CBT技巧类型需要更新AI模型知识库和分类体系
- 字段变更影响Dify工作流的数据结构和对话逻辑
- 效果评估机制变更影响算法优化和服务质量监控

## 12. 假设与待确认
- 假设消息序号由Dify服务维护；待确认并发场景的序号生成策略
- 待确认效果评分的收集机制：自动评估vs用户主动反馈
- 待确认敏感内容检测的具体规则和处理流程