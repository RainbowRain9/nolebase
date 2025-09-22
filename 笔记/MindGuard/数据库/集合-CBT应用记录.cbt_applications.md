# 集合：CBT应用记录（cbt_applications）

## 1. 目的与使用场景
- 记录CBT（认知行为疗法）技巧的具体应用过程和效果，支持个性化推荐和疗效评估。由Ask心理助理、Dify工作流、效果评估系统使用。

**枚举值**：
- technique_type: `cognitive_restructuring`（认知重构）、`evidence_examination`（证据检验）、`behavioral_activation`（行为激活）、`exposure_therapy`（暴露疗法）、`relaxation_training`（放松训练）、`problem_solving`（问题解决）、`mindfulness`（正念练习）、`social_skills`（社交技能）
- application_context: `academic_stress`（学业压力）、`relationship_issues`（人际关系）、`self_esteem`（自尊问题）、`anxiety`（焦虑管理）、`depression'（情绪低落）、'anger_management`（愤怒管理）、`sleep_issues`（睡眠问题）
- difficulty_level: `beginner`（初级）、`intermediate`（中级）、`advanced`（高级）
- completion_status: `planned`（计划中）、`in_progress`（进行中）、`completed`（已完成）、`paused`（暂停）、`abandoned`（放弃）
- effectiveness_rating: `none`（未评估）、`poor`（效果差）、`fair`（一般）、`good`（良好）、`excellent`（优秀）

## 2. Schema 定义
| 字段 | 类型 | 必填 | 默认值 | 约束/校验 | 说明 | 隐私分级 |
|---|---|---|---|---|---|---|
| _id | string | 是 | - | TCB 自动 | 主键 | P2 |
| _openid | string | 是 | - | TCB 自动 | 用户 openid | P2 |
| user_id | 指针id | 是 | - | 指向 users._id | 用户指针 | P2 |
| session_id | 指针id | 否 | - | 指向 ask_sessions._id | 关联会话 | P2 |
| technique_type | string | 是 | - | 枚举(见上方列表) | CBT技巧类型 | P1 |
| technique_name | string | 是 | - | 长度 ≤ 50 | 具体技巧名称 | P1 |
| application_context | string | 是 | - | 枚举(见上方列表) | 应用场景 | P2 |
| difficulty_level | string | 是 | beginner | 枚举(beginner,intermediate,advanced) | 难度等级 | P1 |
| completion_status | string | 是 | planned | 枚举(planned,in_progress,completed,paused,abandoned) | 完成状态 | P1 |
| effectiveness_rating | string | 否 | none | 枚举(none,poor,fair,good,excellent) | 效果评分 | P2 |
| target_issue | string | 是 | - | 长度 ≤ 200 | 目标问题描述 | P3 |
| intervention_plan | string | 否 | - | 长度 ≤ 1000 | 干预计划详情 | P3 |
| implementation_notes | string | 否 | - | 长度 ≤ 1000 | 实施过程记录 | P3 |
| challenges_faced | array | 否 | [] | 元素为 string | 遇到的挑战 | P3 |
| coping_strategies | array | 否 | [] | 元素为 string | 应对策略 | P2 |
| insights_gained | array | 否 | [] | 元素为 string | 获得的洞察 | P2 |
| behavioral_outcomes | array | 否 | [] | 元素为 string | 行为结果 | P2 |
| emotional_outcomes | array | 否 | [] | 元素为 string | 情绪结果 | P2 |
| cognitive_changes | array | 否 | [] | 元素为 string | 认知改变 | P3 |
| practice_frequency | object | 否 | - | 包含 planned, actual, adherence_rate | 练习频率 | P2 |
| duration_minutes | number | 否 | - | ≥0 | 实际时长(分钟) | P1 |
| skill_mastery_level | number | 否 | - | 0-100 | 技能掌握度 | P2 |
| related_task_ids | array | 否 | [] | 指向 tasks._id | 关联任务 | P1 |
| follow_up_actions | array | 否 | [] | 元素为 object | 后续行动 | P1 |
| is_template_based | bool | 否 | false | - | 是否基于模板 | P1 |
| template_id | string | 否 | - | - | 使用的模板ID | P1 |
| ai_recommendation_score | number | 否 | - | 0-1 | AI推荐置信度 | P1 |
| counselor_reviewed | bool | 否 | false | - | 辅导员是否审核 | P2 |
| counselor_notes | string | 否 | - | 长度 ≤ 500 | 辅导员备注 | P3 |
| createdAt | date | 是 | - | 服务端时间 | 创建时间 | P1 |
| updatedAt | date | 是 | - | 服务端时间 | 更新时间 | P1 |
| completedAt | date | 否 | - | - | 完成时间 | P1 |
| is_deleted | bool | 否 | false | - | 软删标记 | P2 |

## 3. 索引与唯一约束
- 单字段索引：`user_id`、`technique_type`、`application_context`、`completion_status`、`effectiveness_rating`
- 复合索引：`[user_id, createdAt desc]`、`[technique_type, effectiveness_rating, createdAt desc]`
- 场景索引：`[application_context, completion_status, createdAt desc]`
- 推荐索引：`[ai_recommendation_score desc, createdAt desc]`
- 设计理由：用户CBT应用历史；技巧效果分析；场景特定查询；个性化推荐。

## 4. 访问控制（TCB 权限）
```json
{
  "read": "_openid == auth.openid || auth.role in ['counselor','ops']",
  "write": "auth.role in ['dify_service','counselor','ops']"
}
```

用户可查看自身CBT应用记录；Dify服务负责写入；辅导员可查看和添加审核意见。

## 5. 关系与级联
- `user_id` → `users`
- `session_id` → `ask_sessions`
- `related_task_ids` → `tasks`
- 删除策略：软删保留审计；删除时保留匿名统计数据。

## 6. 数据生命周期与合规
- 留存：CBT应用记录保留2年用于长期疗效评估
- 匿名化：统计分析时对敏感内容进行脱敏处理
- 导出：用户可导出个人CBT应用历程用于专业咨询
- 审计字段：`createdAt`、`updatedAt`、`completedAt`、`effectiveness_rating`

## 7. API/云函数契约映射
| 接口/函数 | 读/写 | 使用字段 | 过滤条件 | 排序/分页 | 备注 |
| `/api/cbt/applications` GET | 读 | technique_type, application_context, completion_status, effectiveness_rating | `user_id = auth.uid` | `createdAt desc`, 分页 | 用户CBT应用列表 |
| `/api/cbt/applications` POST | 写 | technique_type, application_context, target_issue, intervention_plan | `_openid = auth.openid` | - | 创建CBT应用 |
| `/api/cbt/applications/{id}` PATCH | 写 | completion_status, effectiveness_rating, implementation_notes | `_id` 匹配 | - | 更新CBT应用状态 |
| 个性化推荐引擎 | 读 | technique_type, application_context, effectiveness_rating, skill_mastery_level | 用户历史 | `ai_recommendation_score desc` | CBT技巧推荐 |
| 效果分析系统 | 读 | 所有字段 | 时间范围 | - | CBT效果统计分析 |
| Dify工作流 `cbtTracker` | 写 | 所有字段 | - | - | CBT应用跟踪 |

## 8. 示例文档（≥3条）
```json
{
  "_id": "cbt_app_001",
  "_openid": "oAbcd123",
  "user_id": "usr_001",
  "session_id": "ask_session_001",
  "technique_type": "cognitive_restructuring",
  "technique_name": "灾难化思维识别与挑战",
  "application_context": "academic_stress",
  "difficulty_level": "intermediate",
  "completion_status": "completed",
  "effectiveness_rating": "good",
  "target_issue": "考试前的灾难化思维：认为自己肯定会失败",
  "intervention_plan": "1. 识别灾难化思维 2. 寻找反证据 3. 生成替代思维 4. 行为验证",
  "implementation_notes": "用户能够识别自己的灾难化思维，并找到了具体的反证据。在引导下生成了更平衡的替代思维。",
  "challenges_faced": ["初期难以识别自动化思维", "对替代思维持怀疑态度"],
  "coping_strategies": ["证据检验法", "可能性评估", "过往成功经验回顾"],
  "insights_gained": ["自己的想法并不总是事实", "有证据表明自己有能力应对考试", "灾难化思维会增加焦虑"],
  "cognitive_changes": ["从'肯定失败'到'有可能考好'", "认识到自己有能力影响结果"],
  "emotional_outcomes": ["焦虑程度降低", "自信心提升", "学习动力增强"],
  "practice_frequency": {
    "planned": "每天3次",
    "actual": "每天2-3次",
    "adherence_rate": 0.85
  },
  "duration_minutes": 120,
  "skill_mastery_level": 75,
  "ai_recommendation_score": 0.88,
  "counselor_reviewed": true,
  "counselor_notes": "用户对认知重构技巧掌握良好，建议继续强化其他认知扭曲的识别。",
  "createdAt": "2024-04-06T10:30:00Z",
  "updatedAt": "2024-04-10T15:20:00Z",
  "completedAt": "2024-04-10T15:20:00Z"
}
{
  "_id": "cbt_app_002",
  "_openid": "oAbcd456",
  "user_id": "usr_002",
  "technique_type": "behavioral_activation",
  "technique_name": "行为激活：逐步增加愉悦活动",
  "application_context": "depression",
  "difficulty_level": "beginner",
  "completion_status": "in_progress",
  "target_issue": "情绪低落，缺乏动力，减少社交活动",
  "intervention_plan": "从简单的愉悦活动开始，逐步增加活动频率和复杂性",
  "implementation_notes": "用户开始记录每日活动，识别愉悦程度。计划每天增加一个小型愉悦活动。",
  "challenges_faced": ["初期活动动力不足", "对活动的愉悦感体验较弱"],
  "coping_strategies": ["活动分级",同伴支持", "即时奖励"],
  "behavioral_outcomes": ["开始记录活动日志", "完成了3次小型愉悦活动"],
  "emotional_outcomes": ["情绪略有改善", "对活动的抵触减少"],
  "practice_frequency": {
    "planned": "每天",
    "actual": "每周4-5次",
    "adherence_rate": 0.65
  },
  "skill_mastery_level": 40,
  "ai_recommendation_score": 0.75,
  "createdAt": "2024-04-05T09:00:00Z",
  "updatedAt": "2024-04-08T16:30:00Z"
}
{
  "_id": "cbt_app_003",
  "_openid": "oAbcd789",
  "user_id": "usr_003",
  "session_id": "ask_session_002",
  "technique_type": "relaxation_training",
  "technique_name": "深呼吸放松技巧",
  "application_context": "anxiety",
  "difficulty_level": "beginner",
  "completion_status": "completed",
  "effectiveness_rating": "excellent",
  "target_issue": "社交场合中的紧张和焦虑",
  "intervention_plan": "学习4-7-8呼吸法，在焦虑时应用",
  "implementation_notes": "用户很快掌握了呼吸技巧，并在实际社交场景中成功应用。报告焦虑明显减轻。",
  "insights_gained": ["身体放松可以影响心理状态", "简单的技巧也很有效", "需要提前练习"],
  "behavioral_outcomes": ["能够主动应用放松技巧", "社交回避行为减少"],
  "emotional_outcomes": ["焦虑强度降低", "自信心提升", "社交意愿增强"],
  "practice_frequency": {
    "planned": "每天练习，焦虑时使用",
    "actual": "每天练习，实际使用了3次",
    "adherence_rate": 0.9
  },
  "duration_minutes": 45,
  "skill_mastery_level": 85,
  "related_task_ids": ["task_relaxation_001"],
  "ai_recommendation_score": 0.92,
  "createdAt": "2024-04-06T14:20:00Z",
  "updatedAt": "2024-04-07T11:15:00Z",
  "completedAt": "2024-04-07T11:15:00Z"
}
```

## 9. 常用查询样例（≥3条）
```javascript
// 用户的CBT应用历史
const userApplications = await db.collection('cbt_applications')
  .where({ user_id: auth.uid, is_deleted: false })
  .orderBy('createdAt', 'desc')
  .limit(20)
  .get();

// 技巧效果统计
const techniqueEffectiveness = await db.collection('cbt_applications')
  .where({
    technique_type: 'cognitive_restructuring',
    effectiveness_rating: db.command.in(['good', 'excellent']),
    createdAt: db.command.gte(new Date(Date.now() - 90 * 86400000).toISOString())
  })
  .count();

// 应用场景分析
const contextAnalysis = await db.collection('cbt_applications')
  .where({
    application_context: 'academic_stress',
    completion_status: 'completed'
  })
  .field({ technique_type: true, effectiveness_rating: true, skill_mastery_level: true })
  .get();

// 个性化推荐候选
const recommendations = await db.collection('cbt_applications')
  .where({
    user_id: targetUserId,
    completion_status: 'completed',
    effectiveness_rating: db.command.in(['good', 'excellent'])
  })
  .field({ technique_type: true, application_context: true, skill_mastery_level: true })
  .get();
```

## 10. 边界与错误码
- 技巧不适用：推荐的技巧与用户状态不匹配返回 `E_TECHNIQUE_NOT_SUITABLE`
- 进度异常：练习频率过低时发送提醒通知
- 效果不佳：连续多个应用效果评分低触发辅导员关注
- 难度不当：用户掌握度与难度不匹配时建议调整

## 11. 变更影响评估
- 新增CBT技巧类型需要更新AI知识库和推荐算法
- 效果评估体系变更影响个性化推荐准确性
- 模板系统变更影响用户使用体验和学习效果

## 12. 假设与待确认
- 假设skill_mastery_level基于多个因素自动计算；待确认具体算法
- 待确认CBT技巧之间的依赖关系和前置条件
- 待确认辅导员审核的具体流程和标准