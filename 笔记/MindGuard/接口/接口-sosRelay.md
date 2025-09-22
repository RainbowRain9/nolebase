# 接口-sosRelay（云函数）

## 概述
- 模块名：`sosRelay`
- 分包域：`independent/sos`（独立分包，保证紧急可用）
- 主要职责：触发 SOS 流程、最小必要信息转介、值班/资源联动、生成风险告警报告
- 调用方：独立 SOS 页面、树洞高风险升级、AI 风控链路

## 入参加签与示例

请求（event）：
```json
{
  "trigger": "fab_long_press",
  "risk_level": "L4",
  "risk_context": {
    "source": "treehole",
    "post_id": "post_900",
    "risk_score": 0.92
  },
  "consent_scopes": ["share_minimal"],
  "preferred_channel": "phone",
  "geo_hint": null,
  "user_contact_masked": "+86-138****2233"
}
```

返回：
```json
{
  "ok": true,
  "ticket_id": "sos_20240406_01",
  "handoff": {
    "channel": "phone",
    "target": "university_counseling_center",
    "eta_minutes": 5
  }
}
```

## 读写集合
- 写入：`reports`（`report_type='risk_alert'`，字段 `risk_digest`）
- 写入（规划）：`sos_events`（触发记录与链路追踪）
- 读取：`users`（守护/联系人最小必要字段）

## 典型调用流
- 独立页触发：independent/sos → CALL `sosRelay` → 返回工单与联络方式
- 树洞升级：`treeholeModeration` 判定 R3/R4 → CALL `sosRelay` → 记录 risk_alert

## 错误码与处理
- `E_SOS_CONSENT_REQUIRED`：缺少授权；提示授权并重试
- `E_SOS_CHANNEL_UNAVAILABLE`：所选通道不可用；回退其它通道
- `E_SOS_RATE_LIMITED`：频控；提示稍后重试
- `E_INTERNAL`：内部错误；降级为资源列表展示

## 埋点映射
- 触发：`sos_fab_trigger`
- 升级：`risk_signal_escalate`

## 安全与审计
- 最小必要信息：仅在同意范围内共享；不落地明文隐私
- 审计：记录调用者、时间、渠道、风险等级、同意范围

## 示例

请求：
```json
{"trigger":"fab_long_press","risk_level":"L4","consent_scopes":["share_minimal"],"preferred_channel":"phone"}
```

响应：
```json
{"ok":true,"ticket_id":"sos_20240406_01","handoff":{"channel":"phone","target":"university_counseling_center","eta_minutes":5}}
```

## 版本与变更记录
- 2025-09-22 初版：增加参数定义/错误码/埋点与报告写入

