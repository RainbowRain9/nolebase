# 集合：SOS 事件（sos）

## 1. 目的与使用场景
- 记录用户触发的 SOS 流程，包括触发来源、处置进度、守护者通知结果。支撑 SOS 云函数、风险升级、运维监控。由 `/api/sos/trigger`、人工值班后台使用。

## 2. Schema 定义
| 字段 | 类型 | 必填 | 默认值 | 约束/校验 | 说明 | 隐私分级 |
|---|---|---|---|---|---|---|
| _id | string | 是 | - | TCB 自动 | 主键 | P3 |
| user_id | 指针id | 是 | - | 指向 users._id | 发起人 | P3 |
| trigger_source | string | 是 | miniapp | 枚举(miniapp,floating_button,treehole_moderation,guardian) | 触发来源 | P3 |
| entry_point | string | 否 | today | 枚举(today,global,treehole,report) | 入口 | P2 |
| status | string | 是 | pending | 枚举(pending,contacting,connected,resolved,cancelled) | 流转状态 | P2 |
| severity_level | string | 是 | medium | 枚举(low,medium,high,critical) | 严重程度 | P3 |
| guardian_contact_ids | array | 否 | [] | 指针id | 通知的守护者 | P2 |
| notify_results | array | 否 | [] | `{contact_id,status,channel}` | 通知结果 | P2 |
| assigned_handler | string | 否 | - | - | 值班人员 ID | P2 |
| handler_role | string | 否 | counselor | 枚举(counselor,ops,medical) | 处理角色 | P2 |
| escalation_steps | array | 否 | [] | `{time,status,notes}` | 升级日志 | P3 |
| user_notes | string | 否 | - | 长度 ≤ 512 | 用户补充信息 | P3 |
| location_hint | object | 否 | - | `{geo: geo, description}` | 位置线索 | P3 |
| cancel_reason | string | 否 | - | 枚举(misclick,issue_resolved,other) | 取消原因 | P2 |
| resolved_at | date | 否 | - | ISO 字符串 | 关闭时间 | P2 |
| createdAt | date | 是 | - | 服务端时间 | 创建时间 | P2 |
| updatedAt | date | 是 | - | 服务端时间 | 更新时间 | P2 |

## 3. 索引与唯一约束
- 单字段索引：`user_id`、`status`、`severity_level`
- 复合索引：`[status, createdAt desc]`、`[user_id, createdAt desc]`
- 唯一性约束：无
- 设计理由：值班台按状态与时间排序处理；用户历史查阅按时间倒序。

## 4. 访问控制（TCB 权限）
```json
{
  "read": "user_id == auth.uid || auth.role in ['counselor','ops']",
  "write": "auth.role in ['sos_service','counselor','ops']"
}
```

用户可查看自身事件；辅导员/运营负责处置与更新。


5. 关系与级联
- `user_id` → `users`
- `guardian_contact_ids` → `users`（守护者）
- 与 `reports`（risk_alert）、`notifications`（SOS 通知）、`events`（sos_fab_trigger）关联
- 删除策略：原则上不删除；如应监管要求需脱敏用户信息，仅保留统计。
- 反范式：`notify_results`、`escalation_steps` 嵌入方便展示完整链路。


6. 数据生命周期与合规
- 留存：保留 3 年满足心理危机干预记录要求。
- 匿名化：导出前去除个人标识，仅保留事件序列。
- 审计：`createdAt`、`updatedAt`、`assigned_handler`、`notify_results`。


7. API/云函数契约映射
| 接口/函数 | 读/写 | 使用字段 | 过滤条件 | 排序/分页 | 备注 |
| `/api/sos/trigger` | 写 | trigger_source, entry_point, user_notes, location_hint | `_openid = auth.openid` | - | 用户触发 |
| 值班后台 `updateSosStatus` | 写 | status, assigned_handler, escalation_steps, notify_results, resolved_at | `_id` | - | 人工处理 |
| 护心周报生成 | 读 | severity_level, status, resolved_at | `user_id`, 时间范围 | - | 风险摘要 |
| 通知服务 `pushGuardianAlert` | 读 | guardian_contact_ids, notify_results | `status='pending'` | - | 守护者通知 |

8. 示例文档（≥3条）
```json
{
  "_id": "sos_20240406_01",
  "user_id": "usr_002",
  "trigger_source": "miniapp",
  "entry_point": "today",
  "status": "contacting",
  "severity_level": "high",
  "guardian_contact_ids": ["usr_guard_01"],
  "notify_results": [{"contact_id": "usr_guard_01", "status": "sent", "channel": "phone"}],
  "assigned_handler": "counselor_zhang",
  "handler_role": "counselor",
  "escalation_steps": [{"time": "2024-04-06T14:05:00Z", "status": "contacting", "notes": "拨打守护者电话"}],
  "user_notes": "感到情绪失控，想找人聊聊",
  "createdAt": "2024-04-06T14:02:00Z",
  "updatedAt": "2024-04-06T14:06:00Z"
}
{
  "_id": "sos_20240403_02",
  "user_id": "usr_001",
  "trigger_source": "floating_button",
  "entry_point": "global",
  "status": "resolved",
  "severity_level": "medium",
  "assigned_handler": "ops_li",
  "escalation_steps": [{"time": "2024-04-03T21:10:00Z", "status": "connected", "notes": "IM 已接入"}],
  "resolved_at": "2024-04-03T21:30:00Z",
  "createdAt": "2024-04-03T21:05:00Z",
  "updatedAt": "2024-04-03T21:30:00Z"
}
{
  "_id": "sos_20240328_05",
  "user_id": "usr_003",
  "trigger_source": "treehole_moderation",
  "status": "cancelled",
  "severity_level": "medium",
  "cancel_reason": "misclick",
  "createdAt": "2024-03-28T12:00:00Z",
  "updatedAt": "2024-03-28T12:10:00Z"
}
```

9. 常用查询样例（≥3条）
```javascript
// 值班台拉取待处理事件
const pending = await db.collection('sos').where({ status: db.command.in(['pending','contacting']) })
  .orderBy('createdAt', 'asc').limit(50).get();

// 用户查看历史记录
const history = await db.collection('sos').where({ user_id: auth.uid })
  .orderBy('createdAt', 'desc').get();

// 统计当月高危事件
const highCount = await db.collection('sos').where({
  severity_level: 'critical',
  createdAt: db.command.gte(new Date(Date.now() - 30 * 86400000).toISOString())
}).count();
```

10. 边界与错误码
- 高频触发：同用户 10 分钟内重复触发返回 `E_SOS_RATE_LIMIT`。
- 未绑定守护者：写入时 `guardian_contact_ids` 为空则提醒，返回 `E_SOS_NO_GUARDIAN`。
- 越权更新：非值班角色修改返回 `E_FORBIDDEN`。

11. 变更影响评估
- 字段调整需同步 `/api/sos/trigger`、守护者通知模板、埋点 `sos_fab_trigger`。
- 索引调整影响值班台响应速度与监控看板。

12. 假设与待确认
- 假设守护者均存在于 users 集合；待确认是否需要支持外部联系人号码。
- 待确认是否需记录音频通话录音链接。
