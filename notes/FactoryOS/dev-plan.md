# FactoryOS Mock 扩展与前端联动开发计划（2025-10-29）

## 一、背景

- **目标功能**：注册登录、权限分配、请假流程、审批流程、打卡流程、员工管理。
- **现状**：Monorepo 提供基础 Auth/菜单 Mock，与 Vue Vben Admin 前端基座；需扩展业务域 Mock 与前端入口。
- **依赖**：`apps/backend-mock`、`apps/web-antd`、`packages/*` 公共模块。

## 二、里程碑安排

| 里程碑 | 时间 | 交付内容 |
| --- | --- | --- |
| M0 需求对齐 | 2025-10-28 | 核心流程梳理、类型草图、Mock/前端改造范围确认 |
| M1 Mock 能力 | 2025-10-29 | 注册、请假、审批、考勤、员工接口与示例数据；统一数据仓库 `mock-store` |
| M2 前端 API/体验 | 2025-10-29 | `factoryos` API 模块、注册页扩展、审批/员工/考勤页面接入 |
| M3 验证与文档 | 2025-10-29 | TS/单测通过、开发方案写入 `docs/architecture.md`、本开发计划产出 |
| M4 后续扩展（规划） | 2025-11-中旬 | 扩充出差/报销流程、对接 E2E、Mock 数据外部化 |

## 三、工作分解

### 1. Mock 服务扩展
- [x] 新增 `utils/mock-store.ts`：集中维护公司、部门、员工、请假、审批、考勤数据；封装审批状态流转。
- [x] 接口实现：
  - 注册 `POST /auth/register`
  - 请假 `POST /requests`、`GET /requests/mine`、`GET /requests/{id}`、`POST /requests/{id}/withdraw`
  - 审批 `GET /approvals/inbox|history`、`POST /approvals/{id}/approve|reject|transfer|consign|urge`
  - 员工 `GET /hr/org-tree`、`GET /hr/employees`
  - 考勤 `GET /attendance/records`、`GET /attendance/summary`
- [x] 构建验证 `pnpm -F @vben/backend-mock run build`

### 2. 前端 API 与注册流程
- [x] 新增 `apps/web-antd/src/api/factoryos`（requests / approvals / attendance / hr / types）。
- [x] `api/index.ts` 汇出；`core/auth.ts` 加入 `registerApi`。
- [x] 注册页补充姓名/公司/部门，调用 `registerApi` 后自动登录。
- [x] `vue-shim.d.ts` 填补 `.vue` 类型声明，确保 TS 检查无误。

### 3. 业务页面接入
- [x] 审批模块：`待我处理`、`审批历史`、`我发起的` 表格 + 筛选 + 操作（同意、驳回、催办、撤回）。
- [x] HR 模块：`组织架构` 树组件、`员工档案` 列表、`效率评估` 指标与异常打卡、`报告生成` 打卡报表下载基础。

### 4. 验证与交付
- [x] `pnpm -F @vben/web-antd exec tsc --noEmit`
- [x] `pnpm test:unit`
- [x] 文档同步：`docs/architecture.md` 新增数据模型与方案；本开发计划文档。

## 四、风险与对策

| 风险 | 描述 | 缓解策略 |
| --- | --- | --- |
| Mock 数据持续扩张 | 类型/字段变更多 | 统一 `mock-store` 管理，必要时拆分数据文件 |
| 前端权限/路由守卫缺失 | 新页面可能绕过校验 | 后续将 ActionBus + RBAC 守卫接入新操作按钮 |
| E2E 缺口 | 新流程仅单测保障 | M4 阶段补充 Playwright 场景（审批/请假/员工） |
| 真实后端差异 | 实际契约未定 | 保留类型枚举与字段的可扩展性，并在文档中注明 Mock 假设 |

## 五、后续待办

1. 扩展 `RequestCategory` 为报销/出差，Mock 数据加入对应字段差异。
2. 将 Mock 数据脱敏并转存 JSON，允许不同环境加载自定义样本。
3. 将审批/请假流程接入命令面板、ActionBus，并补充行为日志。
4. 拓展 `pnpm test:e2e` 场景，覆盖页面级交互。

