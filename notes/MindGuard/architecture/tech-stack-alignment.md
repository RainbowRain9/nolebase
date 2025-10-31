# Tech Stack Alignment

| Category | Current Technology | Version | Usage in Enhancement | Notes |
|---|---|---|---|---|
| 前端框架 | 微信小程序原生框架 | 最新基础库 ≥ 2.32 | 扩展 5 个主包页面与 7 个分包 UI 交互 | 主包 < 2MB，分包 < 1MB（docs/分包规划方案.md） |
| UI 组件库 | TDesign Miniprogram | v1.0+ | 新增情绪打卡、任务、社区、SOS 等界面 | 需保持统一设计语言与响应式布局（CLAUDE.md） |
| 状态存储 | 微信小程序本地存储、全局状态 | - | 支持离线情绪打卡、任务缓存与同步 | 需与云端数据一致性策略配合 |
| 服务层 | miniprogram/services/\*.js 模块 | - | 承接 API 调用归一化与前端调用封装 | **注意**: Mock为硬编码/数据库样本，需规划集中化 |
| 后端运行 | 微信云开发 CloudBase 云函数 | Node.js | 扩展 checkinRecorder,suggestionOrchestrator,taskWorkflow 等逻辑 | 复用环境 `cloud1-9gpfk3ie94d8630a` |
| 数据库 | 微信云数据库 (NoSQL) | - | 增加情绪强度、任务闭环、社区风险字段等 | 必须保证迁移向后兼容，敏感数据加密 |
| AI 集成 | Dify 工作流与 API | 最新工作流配置 | 支持 AI 建议生成、风险评估、心语精灵多 Agent | 重点监控响应时延，确保降级策略 |
| 外部接口 | 微信开放平台 API | 最新 | 登录、订阅消息、内容安全接口调用 | 结合风控需求调整调用频率与错误处理 |
| 构建工具 | 微信开发者工具 + npm | 最新稳定版 | 构建小程序、部署云函数、依赖管理 | 需更新分包预加载与灰度发布策略 |
| 监控/日志 | 微信云开发日志 + 自定义遥测 | - | 追踪 AI 调用、社区风控、SOS 触发等关键指标 | 加强实时告警和异常分级机制 |
