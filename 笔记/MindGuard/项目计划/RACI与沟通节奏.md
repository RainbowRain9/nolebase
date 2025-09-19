# MindGuard 《RACI 与沟通节奏》

## 1. 角色占位说明
- **产品负责人（PO）**：整体需求把控、跨团队协调。
- **技术负责人（Tech Lead）**：技术方案、架构决策与质量门控。
- **前端负责人（FE Lead）**：小程序前端实现与交付。
- **后端&云函数负责人（BE Lead）**：云函数、API、数据库设计与联调。
- **测试负责人（QA Lead）**：测试计划、自动化、验收报告。
- **风控与运营负责人（Ops/Risk Lead）**：风控策略、值班运维、提审与上线运营。
- **数据分析负责人（Data Lead）**：埋点方案、数据看板、埋点周报。
- **项目协调人（PMO）**：节奏管理、会议组织、沟通渠道维护。

## 2. RACI 汇总表（里程碑与关键任务）
| 任务/里程碑 | Responsible (R) | Accountable (A) | Consulted (C) | Informed (I) | 频率/里程碑窗口 | 产出物 | 截止时间 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M0 准备 | PO, Tech Lead | PMO | Ops/Risk Lead, Data Lead | 全体成员 | Sprint 1 | 启动会纪要、需求基线、CI 环境 | Week 2 结束 |
| M1 骨架与首页 | FE Lead | Tech Lead | PO, QA Lead | Ops/Risk Lead, Data Lead | Sprint 2 | 主包骨架、今天页 MVP、体验包 | Week 4 结束 |
| M2 核心流程 | FE Lead, BE Lead | Tech Lead | PO, QA Lead, Data Lead | Ops/Risk Lead, PMO | Sprint 3-4 | 核心流程 Demo、分包联调记录、埋点验证 | Week 8 结束 |
| M3 扩展与风控 | Ops/Risk Lead, FE Lead | Tech Lead | PO, Data Lead | QA Lead, PMO | Sprint 5 | 风控能力上线、SOS 分包、监控配置 | Week 10 结束 |
| M4 提审与发布 | QA Lead, Ops/Risk Lead | Tech Lead | PO, FE Lead, BE Lead | Data Lead, PMO | Sprint 6 | 提审包、回滚预案、发布确认 | Week 12 结束 |
| M5 运营与复盘 | Ops/Risk Lead, Data Lead | PMO | PO, QA Lead | FE Lead, BE Lead, Tech Lead | Sprint 7 | 上线日报、指标看板、复盘报告 | Week 14 结束 |
| 公共组件 WBS 交付 | FE Lead | Tech Lead | PO, QA Lead | PMO, Ops/Risk Lead | Sprint 1-2 | 组件库、冒烟测试报告 | 与 WBS 任务结束同步 |
| 今天页闭环交付 | FE Lead, BE Lead | Tech Lead | QA Lead, Data Lead | PMO | Sprint 2-3 | /api/moods/today 联调记录、主流程测试报告 | Week 6 |
| 日记模块交付 | FE Lead, BE Lead | Tech Lead | QA Lead, Data Lead | PMO | Sprint 3-4 | /api/journals 联调、专项测试报告 | Week 8 |
| 树洞风控交付 | FE Lead, BE Lead, Ops/Risk Lead | Tech Lead | QA Lead, Data Lead | PMO | Sprint 4-5 | 风控演练报告、告警配置 | Week 10 |
| 我的 Tab 与周报交付 | FE Lead, BE Lead | Tech Lead | PO, QA Lead, Data Lead | Ops/Risk Lead, PMO | Sprint 4-5 | 周报接口联调、功能测试报告 | Week 10 |
| SOS 分包与应急预案 | FE Lead, Ops/Risk Lead | Tech Lead | QA Lead, BE Lead | PMO, Data Lead | Sprint 5 | SOS 演练脚本、值班计划 | Week 10 |
| 云函数套件交付 | BE Lead | Tech Lead | QA Lead, Data Lead | PMO, Ops/Risk Lead | Sprint 2-5 | 云函数代码、单测、部署记录 | 每函数上线前 |
| 埋点全链路交付 | Data Lead, FE Lead | Tech Lead | QA Lead, PO | PMO, Ops/Risk Lead | Sprint 2-5 | 埋点对照表、ClickHouse 验证 | Week 8 |

## 3. 会议与沟通节奏
| 会议/沟通 | 角色 | 频率 | 产出物 | 截止时间 |
| --- | --- | --- | --- | --- |
| 每日站会（15 分钟） | PO、Tech Lead、FE Lead、BE Lead、QA Lead、Ops/Risk Lead、Data Lead、PMO | 工作日每日 10:00 | 昨日/今日计划、阻塞记录（Issue 更新） | 当日会议后立即同步 |
| 每周评审/计划会 | PO、Tech Lead、FE Lead、BE Lead、QA Lead、Ops/Risk Lead、Data Lead、PMO | 每周一 14:00 | 迭代回顾、下一周计划、看板调整 | 会后 2 小时内发布纪要 |
| 风险盘点会（必要时） | Tech Lead、Ops/Risk Lead、QA Lead、PMO、相关模块负责人 | 触发条件：出现 P0/P1 风险、关键路径延迟 | 风险清单、缓解方案、责任人 | 会议后 24 小时内执行跟进 |
| 冒烟与回归报告同步 | QA Lead → 全体 | 每次提测/提审前 | 冒烟/回归测试报告、缺陷清单 | 提测当晚 20:00 前 |
| 埋点周报 | Data Lead → PO、Tech Lead、Ops/Risk Lead、PMO | 每周五 17:00 | 埋点数据周报、漏斗趋势、异常说明 | 发布当日 17:00 |
| 仓库 Issue/看板同步 | PMO | 实时（需求/缺陷更新时） | 看板状态更新、Issue 评论 | 更新后 1 小时内通知相关人 |
| 版本发布广播 | Ops/Risk Lead、PMO | 每次发布前 24h 与发布当日 | 发布计划、风险提示、回滚预案 | 发布前 24 小时、发布完成后 1 小时 |

## 4. 沟通渠道说明
- **仓库 Issue/看板**：工作项追踪、阻塞记录、每日站会同步依据。
- **冒烟与回归报告**：由 QA 在共享盘与 Issue 附件中发布，确保所有模块得到结果反馈。
- **埋点周报**：Data Lead 每周推送至数据群与项目群，作为运营与产品决策输入。
- **会议纪要**：PMO 统一汇总于项目 Wiki/看板，确保 RACI 相关人获取最新动态。