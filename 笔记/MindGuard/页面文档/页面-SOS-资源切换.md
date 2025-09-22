# 页面：SOS 资源切换（路径：miniprogram/independent/sos/resource-switch/index）

## 1. 页面目标与角色
- 在危机场景下快速切换并试用不同求助资源（热线/校内/同伴/线上），保障可达性；主流程：SOS。

## 2. 入口与去向（导航）
- 入口：SOS 主页“切换资源”。
- 去向：拨号/IM/地图、小程序跳转。
- 路由：`wx.navigateTo({ url: '/independent/sos/resource-switch/index' })`
- 分包：independent/sos（独立）。

## 3. 关键组件与交互
- 组件：资源列表（按可用性排序）、失败重试、备选方案建议、反馈按钮。
- 交互：失败自动切换下一个；记录尝试序列。

## 4. 数据契约与接口
- 集合：docs/数据库/集合-SOS事件.sos.md、docs/数据库/集合-资源地图.resources.md
- 接口：docs/接口占位文档.md

## 5. 埋点与观测
- `pv_sos_resource_switch`
- `clk_switch_resource`（resource_id, reason）
- `act_sos_contact_success`/`act_sos_contact_fail`

## 6. 异常与边界
- 弱网：优先本地可用通道（电话/短信）。
- 合规：最小必要信息；失败不暴露隐私。

## 7. 验收清单（DoD）
- [ ] 切换策略合理
- [ ] 可用性优先与失败兜底
- [ ] 事件链路记录

## 8. 关联文档
- 功能：docs/功能文档/功能-SOS安全守护.md

## 9. 变更记录
- 2025-09-22 by Codex：首次创建

