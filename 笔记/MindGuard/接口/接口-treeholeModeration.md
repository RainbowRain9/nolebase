# 接口-treeholeModeration（云函数）

## 概述
- 模块名：`treeholeModeration`
- 分包域：`packages/community`
- 主要职责：树洞内容风控与审核；返回风险等级与建议，必要时升级 SOS
- 调用方：发帖编辑器发布前草稿自检、服务端异步巡检、运营后台人工复核

## 入参加签与示例

请求（event）：
```json
{
  "type": "post",
  "content": "最近情绪很差……",
  "metadata": {"mood_thermometer": 25, "topic": "emotion"},
  "post_id": null,
  "user_role": "user"
}
```

返回：
```json
{
  "ok": true,
  "risk_score": 0.72,
  "risk_flag": "escalated",
  "risk_level": "L3",
  "auto": "review",
  "manual": "pending",
  "suggestions": ["建议联系辅导员或使用SOS"],
  "action": {"upgrade_to_sos": true}
}
```

## 读写集合
- 读写：`posts.moderation_result`，`posts.risk_flag`，`posts.risk_level`
- 触发：当 `risk_level in ["L3","L4"]` → CALL `sosRelay`
- 互动审核（可选）：`comments.status`、`comments.risk_flag`

## 错误码与处理
- `E_MOD_EMPTY_CONTENT`：内容为空
- `E_MOD_TOO_LONG`：超出上限
- `E_MOD_INTERNAL`：审核服务异常 → 回退为 `manual=pending`

## 埋点映射
- `treehole_post_publish`（结果字段含 `risk_score`/`auto`）
- `risk_signal_escalate`（当升级时）

## 安全与审计
- 不回传原文到日志；仅记录哈希或向量 ID（参考 `posts.content_hash`/`content_vector_id`）
- 审计：审核结果、操作者、决策时间、风险等级

## 示例

请求：
```json
{"type":"post","content":"我不想活了……","metadata":{"mood_thermometer":10}}
```

响应：
```json
{"ok":true,"risk_score":0.95,"risk_flag":"escalated","risk_level":"L4","auto":"review","manual":"pending","suggestions":["立即使用SOS"],"action":{"upgrade_to_sos":true}}
```

## 版本与变更记录
- 2025-09-22 初版：定义参数与联动 `sosRelay`

