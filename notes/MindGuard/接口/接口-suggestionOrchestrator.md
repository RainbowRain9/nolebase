# 接口-suggestionOrchestrator（云函数）

## 概述
- 模块名：`suggestionOrchestrator`
- 分包域：today/journal（由情绪打卡、随笔、复盘等触发）
- 主要职责：根据最新信号（打卡/随笔/任务复盘/社区）生成或刷新微建议，写入 `suggestions` 集合并排序
- 调用方：打卡完成回调、随笔生成建议、T+1 复盘、周报生成前刷新

## 入参加签与示例

请求（event）：
```json
{
  "reason": "checkin",
  "user_id": "usr_001",
  "features": {"mood_score": 45, "recent_tags": ["室友","噪音"]},
  "session_id": "sess_20240406_1",
  "top_k": 3
}
```

返回：
```json
{
  "ok": true,
  "data": [
    {"_id":"sg_001","title":"与室友约定安静时段","category":"relationship","priority_rank":1,"source":"model","status":"active"},
    {"_id":"sg_002","title":"午间 10 分钟冥想","category":"emotion","priority_rank":2,"source":"model","status":"active"}
  ]
}
```

## 读写集合
- 写入：`suggestions`（`user_id, session_id, title, category, priority_rank, source, feature_snapshot, status`）
- 读取：`checkins`（近况）、`tasks`（依从性）、`journals`（近期主题）

## 策略要点
- 会话去重：`[user_id, session_id, priority_rank]` 唯一
- 状态迁移：`active → accepted/skipped/expired`
- 刷新限制：`refresh_count` 计数与冷却时间

## 错误码与处理
- `E_SUGGESTION_DUP`：会话写入重复 → 覆盖或跳过
- `E_FEATURE_INSUFFICIENT`：缺少必要特征 → 降级为 curated 建议
- `E_INTERNAL`：内部错误 → 返回空列表

## 埋点映射
- 建议生成：`pv_today` 后异步曝光；接受：`suggestion_task_create`

## 安全与审计
- 存档 `feature_snapshot` 时脱敏具体标签；仅保留权重/聚合
- 审计：记录策略版本、输入特征指纹、输出建议清单

## 示例

请求：
```json
{"reason":"journal","user_id":"usr_001","features":{"mood_score":35,"recent_tags":["睡眠","压力"]},"session_id":"sess_20240407_1","top_k":3}
```

响应：
```json
{"ok":true,"data":[{"_id":"sg_101","title":"睡前写下三件感谢的事","category":"sleep","priority_rank":1,"source":"curated","status":"active"}]}
```

## 版本与变更记录
- 2025-09-22 初版：定义输入/输出、状态迁移与去重

