# 页面：SOS 主页（路径：miniprogram/independent/sos/index/index）

## 1. 页面目标与角色
- 紧急求助主面板：快速联系资源、播放稳定化脚本、记录事件；面向处于危机的学生；主流程：全局/SOS。

## 2. 入口与去向（导航）
- 入口来源：长按全局 FAB 2s、今天页 SOS 入口、风险提示条。
- 去向页面：resource-switch（资源切换）、resource-map（导航）、拨号/IM。
- 路由：`wx.navigateTo({ url: '/independent/sos/index/index' })`
- 分包关系：independent/sos 独立分包；被 pages/today/index、pages/mine/index 预加载（all）。

## 3. 关键组件与交互
- 组件：风险级别条幅、紧急联系人卡、稳定化脚本播放器、求助方式选择器、确认弹窗。
- 交互：长按触发、倒计时取消、操作二次确认与震动反馈。
- 无障碍与文案：明确安全引导；文本/语音双通道。

## 4. 数据契约与接口
- 出参：`sos_event_id`, `selected_channel`, `contact_id`
- 集合：docs/数据库/集合-SOS事件.sos.md、docs/数据库/集合-用户.events.md
- 接口：docs/接口占位文档.md

## 5. 埋点与观测
- `pv_sos_home`
- `sos_fab_trigger`（entry_point, abort）
- `risk_signal_escalate`（如从风险条进入）

## 6. 异常与边界
- 失败：拨号失败/无网络 → 兜底提示与备用方案。
- 合规：最小必要信息展示与存储；操作审计。

## 7. 验收清单（DoD）
- [ ] FAB 长按触发/取消
- [ ] 资源联系/导航可用
- [ ] 事件写入与埋点
- [ ] 独立分包冷启动性能

## 8. 关联文档
- 功能：docs/功能文档/功能-SOS安全守护.md
- 分包：docs/分包规划方案.md

## 9. 变更记录
- 2025-09-22 by Codex：首次创建

