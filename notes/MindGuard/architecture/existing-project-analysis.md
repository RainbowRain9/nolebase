# Existing Project Analysis

- **Primary Purpose**: 面向高校学生的心理健康支持小程序，覆盖“情绪打卡→AI建议→任务执行→社区守护”全闭环（docs/prd.md:30-64）。
- **Current Tech Stack**: 微信小程序前端 + TDesign 组件，CloudBase 云函数后端，Dify AI 工作流，NoSQL 数据库（CLAUDE.md:42-61）。
- **Architecture Style**: 明确的分层架构：展示层（主包+分包）、服务层（17 个 API 模块）、云函数层（7 个核心函数）、数据层（云数据库+存储）（CLAUDE.md:73-124）。
- **Deployment Method**: 依托微信开发者工具构建与上传，云函数通过 CloudBase 管理，分包灰度发布策略（CLAUDE.md:205-329）。

### Available Documentation
- 根级 `CLAUDE.md` 提供架构总览、模块结构与开发规范（CLAUDE.md:1-360）。
- `docs/prd.md` 定义功能/非功能需求、实施计划与风险（docs/prd.md:1-497）。
- `docs/分包规划方案.md` 描述主包与分包体积、预加载及路径治理（docs/分包规划方案.md:215-320）。
- `docs/数据库设计.md` 给出核心集合、索引与数据策略（docs/数据库设计.md:1-200）。

### Identified Constraints
- 主包需保持 <2MB，分包 <1MB，严格遵循现有分包规划（docs/分包规划方案.md:215-238）。
- 所有 API 返回需维持 `{ ok, data, error }` 格式和 Mock 对齐（CLAUDE.md:298-307）。
- 需复用现有 CloudBase 环境 `cloud1-9gpfk3ie94d8630a`，避免破坏既有工作流（CLAUDE.md:205-214）。
- 性能与可用性指标：加权页面加载 <2s，AI 响应 <5s，SOS 功能 100% 可用（docs/prd.md:93-101）。
- 数据迁移必须向后兼容，敏感信息需加密存储并遵循最小权限原则（docs/prd.md:95-108）。
