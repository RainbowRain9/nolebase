# Data Models and Schema Changes

### New Data Models

#### SuggestionFeedback
- **Purpose**: 记录用户对 AI 微建议的即时反馈，支撑模型调优与个性化排序。
- **Integration**: 与现有 `suggestions`、`tasks` 集合关联，形成“建议 → 反馈 → 任务执行”闭环。
- **Key Attributes**:
  - `suggestion_id`: string – 对应的微建议标识
  - `user_id`: string – 用户标识
  - `feedback_type`: string – 反馈类型 (helpful/neutral/not_helpful)
  - `feedback_score`: number – 1-5 满意度评分
  - `comment`: string – 可选文字说明
  - `action_taken`: string – 是否转化为任务、收藏或忽略
  - `createdAt`: date, `updatedAt`: date
- **Relationships**: With Existing: `suggestions`, `tasks`. With New: `TaskExecutionLog`.

#### TaskExecutionLog
- **Purpose**: 精细记录任务执行过程、打卡记录与复盘数据，满足 PRD 中对任务闭环的统计与周报需求。
- **Integration**: 与 `tasks`、`checkins`、`reports` 集成，为周报和徽章系统提供详尽数据。
- **Key Attributes**:
  - `task_id`: string – 任务唯一标识
  - `user_id`: string – 用户标识
  - `event_type`: string – 执行事件 (start/complete/review)
  - `event_payload`: object – 事件详情
  - `linked_checkin_id`: string – 对应情绪回执
  - `effectiveness_score`: number – 执行后自评效果 0-1
  - `createdAt`: date, `updatedAt`: date
- **Relationships**: With Existing: `tasks`, `checkins`, `reports`. With New: `ModerationAuditTrail`.

#### ModerationAuditTrail
- **Purpose**: 为树洞风控与 SOS 保障建立完整审核日志，满足 PRD 对“风险识别 → 审核 → 干预”链路的审计要求。
- **Integration**: 与 `posts`, `comments`, `sos_events`, `notifications` 交互。
- **Key Attributes**:
  - `target_type`: string – 被审核对象类型
  - `target_id`: string – 对象 ID
  - `risk_snapshot`: object – 风险指标
  - `action_taken`: string – 采取的措施
  - `reviewer_id`: string – 审核人
  - `follow_up_task_id`: string – 后续干预任务
  - `createdAt`: date, `updatedAt`: date
- **Relationships**: With Existing: `posts`, `comments`, `sos_events`, `notifications`. With New: `TaskExecutionLog`.

### Schema Integration Strategy
- **New Tables**: `suggestion_feedback`, `task_execution_logs`, `moderation_audit_trail`.
- **Modified Tables**: 
  - `suggestions`: add `feedback_count`, `last_feedback_at`.
  - `tasks`: add `latest_execution_score`.
  - `posts`: add `last_reviewed_at`, `audit_status`.
  - `checkins`: add `mood_intensity`, `energy_level`.
- **New Indexes**: For new collections and updated fields to support queries.
- **Migration Strategy**: Use cloud function batch processing to add default fields. Create `mock_datasets` collection to centralize future mock data.
- **Backward Compatibility**: Ensure old data defaults gracefully and APIs tolerate missing new fields.
