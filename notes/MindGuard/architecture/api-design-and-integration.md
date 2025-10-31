# API Design and Integration
- **API Integration Strategy**: 沿用现有“服务层 -> 云函数”调用模式，将新增能力绑定到既有CloudBase函数。
- **Authentication**: 保持微信会话鉴权。新增审核/SOS接口采用角色权限校验。
- **Versioning**: 在云函数内部保留v1逻辑，通过`apiVersion`参数实现向后兼容。

### New/Extended API Endpoints (as Cloud Function Actions)

#### SubmitSuggestionFeedback
- **Endpoint**: `cloudfunctions/suggestionOrchestrator`
- **Action**: `submitFeedback`
- **Purpose**: 收集微建议即时反馈。
- **Request**: `{ "action": "submitFeedback", "payload": { "suggestionId": "...", "feedbackType": "...", ... } }`
- **Response**: `{ "ok": true, "data": { "feedbackId": "...", "aggregatedScore": 4.6 } }`

#### LogTaskExecutionEvent
- **Endpoint**: `cloudfunctions/taskWorkflow`
- **Action**: `logExecutionEvent`
- **Purpose**: 记录任务执行事件与复盘数据。
- **Request**: `{ "action": "logExecutionEvent", "payload": { "taskId": "...", "eventType": "complete", ... } }`
- **Response**: `{ "ok": true, "data": { "logId": "...", "latestExecutionScore": 0.82 } }`

#### RecordModerationDecision
- **Endpoint**: `cloudfunctions/treeholeModeration`
- **Action**: `recordModerationDecision`
- **Purpose**: 保存审核结果并按需触发SOS。
- **Request**: `{ "action": "recordModerationDecision", "payload": { "targetId": "...", "decision": { "actionTaken": "escalate", ... }, ... } }`
- **Response**: `{ "ok": true, "data": { "auditId": "...", "sosTriggered": true } }`
