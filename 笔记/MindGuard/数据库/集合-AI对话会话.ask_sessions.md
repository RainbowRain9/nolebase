# 集合：AI对话会话（ask_sessions）

## 1. 目的与使用场景
- 记录用户与AI心理助理的完整对话会话，支持CBT认知行为疗法应用、风险评估和个性化推荐。由Ask心理助理功能、Dify工作流、埋点系统使用。

**枚举值**：
- session_type: `general`（常规对话）、`cbt_guided`（CBT引导）、`crisis_intervention`（危机干预）、`follow_up`（跟进回访）
- trigger_source: `mood_checkin`（情绪打卡触发）、`journal_negative`（负向随笔触发）、`treehole_risk`（树洞风险触发）、`manual_trigger`（手动触发）、`scheduled_checkin`（定时检查）
- cbt_focus: `cognitive_restructuring`（认知重构）、`behavioral_activation`（行为激活）、`emotion_regulation`（情绪调节）、`problem_solving`（问题解决）
- risk_level: `L0`（无风险）、`L1`（一般关注）、`L2`（需要关注）、`L3`（需要干预）、`L4`（紧急危机）

## 2. Schema 定义
| 字段 | 类型 | 必填 | 默认值 | 约束/校验 | 说明 | 隐私分级 |
|---|---|---|---|---|---|---|
| _id | string | 是 | - | TCB 自动 | 主键 | P2 |
| _openid | string | 是 | - | TCB 自动 | 用户 openid | P2 |
| user_id | 指针id | 是 | - | 指向 users._id | 用户指针 | P2 |
| session_type | string | 是 | general | 枚举(general,cbt_guided,crisis_intervention,follow_up) | 会话类型 | P1 |
| trigger_source | string | 是 | manual_trigger | 枚举(mood_checkin,journal_negative,treehole_risk,manual_trigger,scheduled_checkin) | 触发来源 | P1 |
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
| duration_seconds | number | 否 | - | ≥0 | 会话时长(秒) | P1 |
| intervention_triggered | bool | 否 | false | - | 是否触发干预 | P3 |
| createdAt | date | 是 | - | 服务端时间 | 创建时间 | P1 |
| updatedAt | date | 是 | - | 服务端时间 | 更新时间 | P1 |
| endedAt | date | 否 | - | - | 结束时间 | P1 |
| is_deleted | bool | 否 | false | - | 软删标记 | P2 |

## 3. 索引与唯一约束
- 单字段索引：`user_id`、`session_type`、`trigger_source`、`initial_risk_level`、`final_risk_level`
- 复合索引：`[user_id, createdAt desc]`、`[trigger_source, createdAt desc]`、`[initial_risk_level, createdAt desc]`
- 时间范围索引：`[createdAt desc, is_deleted]`
- 设计理由：用户会话历史查询；触发来源分析；风险级别筛查；时间范围过滤。

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
- `generated_task_ids` → `tasks`
- `counselor_handoff.counselor_id` → `users`（辅导员）
- 与 `ask_messages` 形成一对多关系
- 删除策略：软删保留审计；删除时匿名化处理敏感内容。

## 6. 数据生命周期与合规
- 留存：常规对话保留6个月；危机干预会话保留2年用于专业评估
- 匿名化：删除前对对话内容进行脱敏处理，保留CBT应用统计
- 导出：用户可导出自身对话记录，需身份验证
- 审计字段：`createdAt`、`updatedAt`、`endedAt`、`intervention_triggered`

## 7. API/云函数契约映射
| 接口/函数 | 读/写 | 使用字段 | 过滤条件 | 排序/分页 | 备注 |
| `/api/ask/sessions` GET | 读 | session_type, trigger_source, session_summary, createdAt, satisfaction_score | `user_id = auth.uid`, `is_deleted=false` | `createdAt desc`, 分页 | 对话历史列表 |
| `/api/ask/sessions` POST | 写 | session_type, trigger_source, initial_risk_level | `_openid = auth.openid` | - | 创建新会话 |
| `/api/ask/sessions/{id}` PATCH | 写 | final_risk_level, session_summary, satisfaction_score, follow_up_needed | `_id` 匹配 | - | 更新会话状态 |
| Dify工作流 `sessionManager` | 写 | 所有字段 | - | - | 会话生命周期管理 |
| 风险监控 `riskMonitor` | 读 | initial_risk_level, final_risk_level, intervention_triggered | 时间范围 | - | 风险会话统计 |

## 8. 示例文档（≥3条）
```json
{
  "_id": "ask_session_001",
  "_openid": "oAbcd123",
  "user_id": "usr_001",
  "session_type": "cbt_guided",
  "trigger_source": "mood_checkin",
  "cbt_focus": "cognitive_restructuring",
  "initial_risk_level": "L2",
  "final_risk_level": "L1",
  "session_summary": "用户因学业压力产生焦虑，通过认知重构技巧识别了非理性信念，制定了行为实验计划",
  "key_insights": ["完美主义思维模式", "考试失败恐惧", "自我价值感低"],
  "cbt_techniques_used": ["证据检验", "替代思维生成", "行为实验设计"],
  "generated_task_ids": ["task_cbt_001", "task_cbt_002"],
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
  "session_type": "crisis_intervention",
  "trigger_source": "journal_negative",
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
  "session_type": "general",
  "trigger_source": "manual_trigger",
  "session_summary": "用户咨询睡眠问题，获得了睡眠卫生建议和放松技巧",
  "key_insights": ["入睡困难", "作息不规律"],
  "cbt_techniques_used": ["睡眠卫生教育", "放松训练"],
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
// 用户的最近对话会话
const recentSessions = await db.collection('ask_sessions')
  .where({ user_id: auth.uid, is_deleted: false })
  .orderBy('createdAt', 'desc')
  .limit(10)
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
- 越权：非授权访问危机干预会话返回 `E_FORBIDDEN`

## 11. 变更影响评估
- 字段变更需同步Dify工作流payload、Ask心理助理UI、埋点 `ask_session_start/end`
- 索引调整影响会话历史查询性能和风险监控响应时间
- 新增CBT焦点领域需要更新AI模型知识库

## 12. 假设与待确认
- 假设会话与Dify工作流的session_id打通；待确认具体映射关系
- 待确认危机干预会话的辅导员通知机制和响应SLA
- 待确认CBT技巧的标准化分类和效果评估指标