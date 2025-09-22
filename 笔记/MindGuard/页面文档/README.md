# 页面文档索引（MindGuard）

- 说明：本索引基于 `miniprogram/pages/*`、`miniprogram/packages/*`、`miniprogram/independent/*` 实际页面目录与现有文档生成，标注了“已有/新增”状态与主要跳转关系。预加载策略参考 `miniprogram/app.json` 的 `preloadRule`。

## 页面清单与状态

- 主包 Tabs（均“已有”）
  - 今天 pages/today/index → docs/页面文档/页面-今天.md（已有，预加载：community + sos）
  - 任务 pages/tasks/index → docs/页面文档/页面-任务.md（已有，预加载：profile）
  - 树洞 pages/treehole/index → docs/页面文档/页面-树洞.md（已有，预加载：community）
  - 随笔 pages/journal/index → docs/页面文档/页面-心情随笔.md（已有）
  - 我的 pages/mine/index → docs/页面文档/页面-我的.md（已有，预加载：profile）

- 分包-社区 packages/community（均“新增”）
  - post-detail/index → 页面-社区-帖子详情.md（新增）
  - post-editor/index → 页面-社区-发布帖子.md（新增）
  - topic/index → 页面-社区-话题聚合.md（新增）
  - action-feedback/index → 页面-社区-行动卡反馈.md（新增）
  - activities/index → 页面-社区-活动广场.md（新增）
  - booking/index → 页面-社区-预约中心.md（新增）
  - consultation/index → 页面-社区-心理咨询.md（新增）
  - customer-service/index → 页面-社区-客服与帮助.md（新增）
  - message/index → 页面-社区-消息中心.md（新增）
  - resources/index → 页面-社区-资源广场.md（新增）
  - search/index → 页面-社区-搜索.md（新增）
  - academic/index → 页面-社区-学术资源.md（新增）

- 分包-日记域 packages/journal（均“新增”）
  - diary-detail/index → 页面-日记域-日记详情.md（新增）
  - diary-edit/index → 页面-日记域-日记编辑.md（新增）
  - report-export/index → 页面-日记域-周报导出.md（新增）

 - 分包-个人 packages/profile（大多“新增”）
  - report-detail/index → 页面-个人-护心周报.md（新增）
  - badge-detail/index → 页面-个人-徽章详情.md（新增）
  - privacy-detail/index → 页面-个人-隐私中心.md（新增）
  - resource-map/index → 页面-个人-资源地图.md（新增）
  - profile-edit/index → 页面-个人-资料编辑.md（新增）
  - school-cooperation/index → 页面-个人-学校协同.md（已有）
  - audit/index → 页面-个人-审核中心.md（新增）
  - feedback/index → 页面-个人-问题反馈.md（新增）

- 分包-任务域 packages/tasks（“新增”）
  - task-detail/index → 页面-任务域-任务详情.md（新增）

- 独立分包 SOS independent/sos（“新增”）
  - index/index → 页面-SOS-主页.md（新增）
  - resource-switch/index → 页面-SOS-资源切换.md（新增）

- 工具分包
  - packages/breath/index/index → 页面-呼吸-主页.md（新增）
  - packages/mindfulness/index/index → 页面-正念-主页.md（新增）

## 路由关系图（ASCII）

```
pages/today/index
├─ tools → /packages/breath/index/index
├─ tools → /packages/mindfulness/index/index
├─ suggestion → /packages/tasks/task-detail/index?taskId=*
├─ sos → /independent/sos/index/index
└─ resources → /packages/community/resources/index

pages/tasks/index
└─ task item → /packages/tasks/task-detail/index?taskId=*

pages/treehole/index
├─ post card → /packages/community/post-detail/index?postId=*
│  ├─ edit → /packages/community/post-editor/index?postId=*&mode=edit
│  └─ topic → /packages/community/topic/index?topic=*
├─ create → /packages/community/post-editor/index
├─ action feedback → /packages/community/action-feedback/index?taskId=*
├─ search → /packages/community/search/index?q=*
├─ resources → /packages/community/resources/index
├─ activities → /packages/community/activities/index
├─ consultation → /packages/community/consultation/index?orgId=*
└─ message → /packages/community/message/index

pages/journal/index
├─ entry → /packages/journal/diary-detail/index?entryId=*
│  └─ edit → /packages/journal/diary-edit/index?entryId=*&mode=edit
└─ export → /packages/journal/report-export/index?range=week

pages/mine/index
├─ report → /packages/profile/report-detail/index
├─ badges → /packages/profile/badge-detail/index?badgeId=*
├─ privacy → /packages/profile/privacy-detail/index
├─ resource map → /packages/profile/resource-map/index
├─ edit profile → /packages/profile/profile-edit/index
├─ school cooperation → /packages/profile/school-cooperation/index
├─ feedback → /packages/profile/feedback/index
└─ (role) audit → /packages/profile/audit/index

independent/sos/index/index
├─ switch → /independent/sos/resource-switch/index
└─ map → /packages/profile/resource-map/index
```

## 预加载速览（来自 app.json preloadRule）
- 今天：community, sos（all）
- 任务：profile（all）
- 树洞：community（wifi）
- 我的：profile（all）
- 随笔：未声明

## 路由与参数（约定）

| 页面路径 | 页面中文名 | 参数 | 示例 |
| --- | --- | --- | --- |
| pages/today/index | 今天 | - | `wx.switchTab({url:'/pages/today/index'})` |
| pages/tasks/index | 任务 | - | `wx.switchTab({url:'/pages/tasks/index'})` |
| pages/treehole/index | 树洞 | - | `wx.switchTab({url:'/pages/treehole/index'})` |
| pages/journal/index | 随笔 | - | `wx.switchTab({url:'/pages/journal/index'})` |
| pages/mine/index | 我的 | - | `wx.switchTab({url:'/pages/mine/index'})` |
| packages/community/post-detail/index | 帖子详情 | postId | `/packages/community/post-detail/index?postId=abc` |
| packages/community/post-editor/index | 发布帖子 | mode(create/edit), postId? | `/packages/community/post-editor/index?mode=edit&postId=abc` |
| packages/community/topic/index | 话题聚合 | topic | `/packages/community/topic/index?topic=exam` |
| packages/community/action-feedback/index | 行动卡反馈 | taskId, postId? | `/packages/community/action-feedback/index?taskId=t1&postId=p1` |
| packages/community/activities/index | 活动广场 | - | `/packages/community/activities/index` |
| packages/community/booking/index | 预约中心 | type(activity/resource/consultation), targetId, slot? | `/packages/community/booking/index?type=activity&targetId=a1` |
| packages/community/consultation/index | 心理咨询 | orgId | `/packages/community/consultation/index?orgId=o1` |
| packages/community/customer-service/index | 客服与帮助 | - | `/packages/community/customer-service/index` |
| packages/community/message/index | 消息中心 | - | `/packages/community/message/index` |
| packages/community/resources/index | 资源广场 | category? | `/packages/community/resources/index?category=sleep` |
| packages/community/search/index | 搜索 | q, scope? | `/packages/community/search/index?q=焦虑&scope=post` |
| packages/community/academic/index | 学术资源 | category? | `/packages/community/academic/index?category=cbt` |
| packages/journal/diary-detail/index | 日记详情 | entryId | `/packages/journal/diary-detail/index?entryId=j1` |
| packages/journal/diary-edit/index | 日记编辑 | mode(create/edit), entryId? | `/packages/journal/diary-edit/index?mode=edit&entryId=j1` |
| packages/journal/report-export/index | 周报导出 | range(week/month) | `/packages/journal/report-export/index?range=week` |
| packages/profile/report-detail/index | 护心周报 | range? | `/packages/profile/report-detail/index?range=week` |
| packages/profile/badge-detail/index | 徽章详情 | badgeId | `/packages/profile/badge-detail/index?badgeId=b1` |
| packages/profile/privacy-detail/index | 隐私中心 | - | `/packages/profile/privacy-detail/index` |
| packages/profile/resource-map/index | 资源地图 | category? | `/packages/profile/resource-map/index?category=campus` |
| packages/profile/profile-edit/index | 资料编辑 | - | `/packages/profile/profile-edit/index` |
| packages/profile/school-cooperation/index | 学校协同 | - | `/packages/profile/school-cooperation/index` |
| packages/profile/audit/index | 审核中心 | filter? | `/packages/profile/audit/index?filter=pending` |
| packages/profile/feedback/index | 问题反馈 | - | `/packages/profile/feedback/index` |
| packages/tasks/task-detail/index | 任务详情 | taskId | `/packages/tasks/task-detail/index?taskId=t1` |
| packages/breath/index/index | 呼吸-主页 | - | `/packages/breath/index/index` |
| packages/mindfulness/index/index | 正念-主页 | - | `/packages/mindfulness/index/index` |
| independent/sos/index/index | SOS-主页 | entry_point? | `/independent/sos/index/index?entry_point=today` |
| independent/sos/resource-switch/index | SOS-资源切换 | - | `/independent/sos/resource-switch/index` |

## 备注
- 若页面跳转参数或入口有变动，请同步更新本文与对应“页面-*.md”。

---

最后更新：2025-09-22 by Codex

---

## 页面 ⇄ 接口映射清单（依据 docs/接口占位文档.md）

| 页面 | 主要接口组 | 备注 |
| --- | --- | --- |
| pages/today/index | `/api/moods/today`, `/api/micro-tips`, `/api/tasks(POST)` | 情绪、微建议、写入任务 |
| pages/tasks/index | `/api/tasks(GET/PATCH)`, `/api/tasks/bulk`, `/api/tasks/summary` | 列表/批量/统计 |
| pages/treehole/index | `/api/treehole/posts(GET)`, `/api/treehole/risk-hints`, `/api/action-cards(POST)` | 信息流/风险提示/行动卡 |
| pages/journal/index | `/api/journals`, `/api/moods/trend`, `/api/checklists` | 随笔列表/趋势/清单联动 |
| pages/mine/index | `/api/reports/weekly`, `/api/badges`, `/api/privacy/consents`, `/api/user/profile`, `/api/preferences/night-mode`, `/api/resources` | 周报/徽章/隐私/资料/资源 |
| community/post-detail | `/api/treehole/posts(GET)` | 详情/评论同域（评论接口待补充） |
| community/post-editor | `/api/treehole/posts(POST)` | 发帖/草稿自检（服务端复核） |
| community/topic | `/api/treehole/posts(GET)` | 根据 `topic` 过滤 |
| community/action-feedback | `/api/tasks/review(POST)` | 回执写入任务体系 |
| community/activities | 建议新增：`/api/activities` | 活动列表/报名入口 |
| community/booking | 建议新增：`/api/booking` | 预约提交/冲突检测 |
| community/consultation | 建议新增：`/api/consultations` | 机构详情/可预约时段 |
| community/customer-service | 建议新增：`/api/support` | FAQ/在线客服入口 |
| community/message | 建议新增：`/api/notifications` | 通知中心（系统/互动/预约） |
| community/resources | `/api/resources(GET)` | 资源聚合/分类 |
| community/search | 建议新增：`/api/search` | 跨域搜索（post/topic/resource） |
| community/academic | `/api/resources(GET)` | `category=academic` |
| journal/diary-detail | `/api/journals(GET)`, `/api/checklists` | 详情/派生任务 |
| journal/diary-edit | `/api/journals(POST/PATCH)` | 创建/更新/附件上传 |
| journal/report-export | 建议新增：`/api/reports/export` | 生成图片/PDF/分享 |
| profile/report-detail | `/api/reports/weekly(GET)` | 周报详情/建议 |
| profile/badge-detail | `/api/badges(GET)` | 单枚徽章/条件 |
| profile/privacy-detail | `/api/privacy/consents(GET/PATCH)` | 授权开关/守护人 |
| profile/resource-map | `/api/resources(GET)` | 地图与资源列表 |
| profile/profile-edit | `/api/user/profile(GET/PATCH)` | 资料编辑/头像上传 |
| profile/school-cooperation | 建议新增：`/api/collaboration/*` | 预警列表/详情/指派/统计 |
| profile/audit | 建议新增：`/api/collaboration/alerts` | 审核决策/审计日志 |
| profile/feedback | 建议新增：`/api/feedback` | 提交问题反馈/进度查询 |
| tasks/task-detail | `/api/tasks(GET/PATCH)`, `/api/tasks/review(POST)` | 状态流转/复盘 |
| breath/index | 无强依赖；回执→`/api/tasks(POST)` | 本地练习为主，完成写任务 |
| mindfulness/index | 无强依赖；回执→`/api/tasks(POST)` | 本地练习为主，完成写任务 |
| sos/index | `/api/sos/trigger(POST)`, `/api/resources` | 触发事件/资源联动 |
| sos/resource-switch | `/api/resources(GET)` | 切换备用资源/记录结果 |

说明：带“建议新增”的接口为占位建议，待后端评审入库到 docs/接口占位文档.md。

## 页面 ⇄ 测试用例锚点（依据 docs/测试用例.md）

| 页面 | 关联用例ID | 备注 |
| --- | --- | --- |
| pages/today/index | TODAY-001/002/003/004 | 情绪打卡/微建议/复盘 |
| pages/tasks/index | TASK-001…010 | 看板/筛选/批量/番茄/提醒 |
| pages/treehole/index | HOLE-001/002/003 | 发帖/行动卡/高危触达 |
| pages/journal/index | JOUR-001/002/003/004 | 多模录入/趋势/派生任务/预警 |
| pages/mine/index | MINE-001/002/003/004 | 周报/成长/授权/资源触达 |
| community/post-detail | HOLE-003/004 | 风险提示/评论再预警 |
| community/post-editor | HOLE-001 | 自检与发布 |
| community/topic | 建议新增：HOLE-TOPIC-001 | 话题聚合筛选/订阅 |
| community/action-feedback | TASK-004，建议新增：AF-001 | 复盘回执与回链 |
| community/activities | 建议新增：ACT-001 | 活动列表/报名 |
| community/booking | 建议新增：BOOK-001 | 预约提交流程 |
| community/consultation | 建议新增：CONS-001 | 机构详情/可用时段 |
| community/customer-service | 建议新增：CS-001 | FAQ/客服/反馈入口 |
| community/message | TASK-010，建议新增：MSG-001 | 通知分组/已读/跳转 |
| community/resources | MINE-004 | 资源触达与记录 |
| community/search | 建议新增：SRCH-001 | 搜索历史/联想/结果跳转 |
| community/academic | 建议新增：ACD-001 | 学术资源筛选/收藏 |
| journal/diary-detail | JOUR-003 | 派生任务链路 |
| journal/diary-edit | JOUR-001/004 | 多模录入/负向预警 |
| journal/report-export | 建议新增：REP-EXP-001 | 导出与分享 |
| profile/report-detail | MINE-001 | 从周报生成任务 |
| profile/badge-detail | 建议新增：BADGE-001 | 详情/分享 |
| profile/privacy-detail | MINE-003 | 授权变更与审计 |
| profile/resource-map | MINE-004 | 资源触达记录 |
| profile/profile-edit | 建议新增：PROF-EDIT-001 | 资料修改/头像上传 |
| profile/school-cooperation | 建议新增：SCH-COOP-001 | 风控闭环/指派/审计 |
| profile/audit | 建议新增：AUDIT-001 | 审核决策流程 |
| profile/feedback | 建议新增：FEED-001 | 提交/进度/通知 |
| tasks/task-detail | TASK-004/006 | 状态流转/番茄与复盘 |
| breath/index | 建议新增：BR-001 | 练习完成与回执 |
| mindfulness/index | 建议新增：MF-001 | 练习完成与回执 |
| sos/index | 建议新增：SOS-001 | 触发/取消/资源联动 |
| sos/resource-switch | 建议新增：SOS-SW-001 | 切换与可用性记录 |

注：建议新增的用例ID为锚点预留，便于在 docs/测试用例.md 中增补对应条目。
