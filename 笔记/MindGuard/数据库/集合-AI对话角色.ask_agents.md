# 集合：AI对话角色（ask_agents）

## 1. 目的与使用场景
- 管理心语精灵/Ask心理助理可用的AI Agent 角色定义，覆盖系统内置模板、机构预置模板以及用户自定义角色。
- 为 Dify Chatbot & Agent API 提供 persona、提示词、语音配置等元数据来源，支持多 Agent 切换、个性化欢迎语、语音播报配置与会话快照。
- 作为 `ask_sessions`、`ask_messages` 中 `custom_agent_id` 的权威数据源，支撑角色列表展示、权限校验与版本回滚。

**枚举值**：
- agent_origin: `system_default`（平台内置）、`org_template`（机构模板）、`user_custom`（个人自定义）
- agent_key（系统内置）: `cbt_specialist`、`emotion_advisor`、`behavior_coach`、`crisis_interventionist`
- status: `active`（可用）、`inactive`（停用）、`archived`（归档）
- visibility: `global`（全局可见）、`org`（机构成员可见）、`private`（仅本人）
- review_status: `approved`（审核通过）、`pending`（待审核）、`rejected`（审核未通过）
- capability_tags: `cbt`、`emotion`、`behavior`、`crisis`、`journaling`、`task_planning`、`voice_support`
- tone_tags: `warm`、`rational`、`encouraging`、`direct`、`playful`
- default_voice.voice_type: `tts_standard`、`tts_emotional`

## 2. Schema 定义
| 字段 | 类型 | 必填 | 默认值 | 约束/校验 | 说明 | 隐私分级 |
|---|---|---|---|---|---|---|
| _id | string | 是 | - | TCB 自动 | 主键 | P1 |
| agent_key | string | 否 | - | 系统内置需唯一且在枚举内；自定义允许自定义前缀 | Agent 稳定标识 | P1 |
| agent_origin | string | 是 | system_default | 枚举(system_default,org_template,user_custom) | 角色来源 | P1 |
| owner_user_id | 指针id | 否 | - | 指向 users._id | 自定义角色的拥有者 | P1 |
| owner_org_id | 指针id | 否 | - | 指向 orgs._id | 机构模板归属 | P2 |
| visibility | string | 是 | global | 枚举(global,org,private) | 可见范围 | P1 |
| status | string | 是 | active | 枚举(active,inactive,archived) | 生效状态 | P1 |
| review_status | string | 否 | pending | 枚举(approved,pending,rejected) | 审核状态 | P2 |
| name | string | 是 | - | 长度 ≤ 32 | 展示名称 | P1 |
| subtitle | string | 否 | - | 长度 ≤ 60 | 子标题/定位 | P1 |
| description | string | 否 | - | 长度 ≤ 200 | 角色简介 | P1 |
| persona_prompt | string | 是 | - | 长度 ≤ 4000 | Dify system prompt/persona | P2 |
| greeting_message | string | 否 | - | 长度 ≤ 200 | 默认欢迎语 | P1 |
| fallback_message | string | 否 | - | 长度 ≤ 200 | 功能受限时默认提示 | P1 |
| capability_tags | array | 否 | [] | 元素在枚举内，长度 ≤ 8 | 能力标签 | P1 |
| tone_tags | array | 否 | [] | 元素在枚举内，长度 ≤ 5 | 语气标签 | P2 |
| modality_flags | object | 否 | {"text":true} | 布尔键 text/audio/file | 支持的交互形式 | P1 |
| default_language | string | 否 | zh-CN | ISO 639-1 | 角色主要语言 | P1 |
| default_voice | object | 否 | - | 包含 voice_id, voice_type, speaking_rate | 语音配置默认值 | P2 |
| avatar_url | string | 否 | - | URL | 头像地址 | P1 |
| theme_color | string | 否 | - | hex 色值 | UI 主题色 | P1 |
| dify_agent_id | string | 否 | - | UUID | Dify Agent 配置ID | P1 |
| dify_dataset_ids | array | 否 | [] | 元素为 UUID | 关联知识库 | P2 |
| dify_api_config | object | 否 | - | 见下方密钥配置结构 | Dify API配置 | P2 |
| dify_fallback_configs | array | 否 | [] | 见下方备用配置结构 | 故障转移配置 | P2 |
| prompt_variables | object | 否 | {} | JSON Schema: key ≤ 30，value 长度 ≤ 200 | 模板所需变量 | P2 |
| version | string | 是 | 1.0.0 | 语义化版本号 | P1 |
| revision_notes | string | 否 | - | 长度 ≤ 400 | 版本更新说明 | P1 |
| usage_stats | object | 否 | - | 包含 session_count, message_count, last_used_at, api_usage | 使用统计 | P1 |
| createdAt | date | 是 | - | 服务端时间 | 创建时间 | P1 |
| updatedAt | date | 是 | - | 服务端时间 | 更新时间 | P1 |
| publishedAt | date | 否 | - | - | 上线时间 | P1 |
| is_deleted | bool | 否 | false | - | 软删标记 | P2 |

### 2.1 密钥配置结构详细说明

**dify_api_config 对象结构**：
```json
{
  "api_key": "string",        // Dify API密钥，必填
  "base_url": "string",       // Dify服务地址，默认为 https://dify.icerain.love/v1
  "display_name": "string",   // 显示名称，用于前端展示
  "rate_limit": {             // 速率限制配置
    "requests_per_minute": number,   // 每分钟请求数限制，默认60
    "requests_per_hour": number,     // 每小时请求数限制，默认1000
    "requests_per_day": number       // 每日请求数限制，默认10000
  },
  "is_active": boolean,       // 是否启用，默认true
  "description": "string"     // 描述信息
}
```

**dify_fallback_configs 数组元素结构**：
```json
{
  "api_key": "string",        // 备用API密钥，必填
  "base_url": "string",       // 备用服务地址，可选
  "priority": number,         // 优先级，数字越小优先级越高，默认10
  "conditions": {             // 触发条件
    "error_codes": ["string"], // 触发使用的错误码列表
    "rate_limit_exceeded": boolean, // 是否在限流时触发
    "timeout_ms": number       // 超时时间（毫秒）
  }
}
```

**usage_stats.api_usage 对象结构**：
```json
{
  "total_requests": number,     // 总请求数
  "today_requests": number,     // 今日请求数
  "failed_requests": number,    // 失败请求数
  "last_used_at": Date,         // 最后使用时间
  "current_key_index": number   // 当前使用的密钥索引（用于轮询）
}
```

## 3. 索引与唯一约束
- 唯一索引：`[agent_origin, agent_key]`（仅 system_default / org_template 强制）
- 唯一索引：`[owner_user_id, agent_key]`（user_custom 范围内防重复）
- 单字段索引：`status`、`visibility`、`review_status`
- 复合索引：`[owner_org_id, status]`、`[owner_user_id, updatedAt desc]`
- 模糊检索索引：`[capability_tags, status]` 支撑能力筛选
- 设计理由：保证系统模板稳定下发、自定义角色按拥有者隔离，便于按状态/可见范围快速检索。

## 4. 访问控制（TCB 权限）
```json
{
  "read": "auth.role in ['dify_service','counselor','ops'] || visibility in ['global','org'] || owner_user_id == auth.uid",
  "write": "auth.role in ['dify_service','ops'] || owner_user_id == auth.uid"
}
```

系统/运营可全量管理；个人用户可读取全局模板及本人创建的私有模板，写入限本人或运营后台；机构模板由运营代维护并通过后台渠道控制成员可见性。

## 5. 关系与级联
- `owner_user_id` → `users`
- `owner_org_id` → `orgs`
- `dify_agent_id` ↔ Dify Agent 配置
- `ask_sessions.custom_agent_id` → 本集合
- `ask_messages.custom_agent_id` → 本集合
- 删除策略：设置 `is_deleted` 并置 `status=archived`；触发后台任务修正会话/消息引用并回落至系统默认 Agent。

## 6. 数据生命周期与合规
- 系统模板长期保留，版本迭代需保留历史版本用于审计。
- 用户自定义角色在用户注销或申请删除后 7 天内软删，30 天后匿名化关键信息。
- 审核记录（review_status）需保留至少 2 年以满足风控追溯。
- 语音配置数据不含用户语音内容，仅存储语音合成参数。

## 7. API/云函数契约映射
| 接口/函数 | 读/写 | 使用字段 | 过滤条件 | 排序/分页 | 备注 |
| `/api/ask/agents` GET | 读 | name, description, capability_tags, visibility, status, default_voice | `status='active'`, `visibility` scope | `name asc` | 用户端 Agent 列表 |
| `/api/ask/agents` POST | 写 | name, description, capability_tags, persona_prompt, visibility, default_voice | 用户鉴权 | - | 创建自定义角色（需审核） |
| `/api/ask/agents/{id}` PATCH | 写 | status, visibility, persona_prompt, version, revision_notes | `_id` 匹配 | - | 更新角色配置 |
| `/api/ask/agents/{id}/review` POST | 写 | review_status, revision_notes | `_id` 匹配 | - | 运营审核接口 |
| 云函数 `agentRegistrySync` | 写 | dify_agent_id, dify_dataset_ids, prompt_variables | 批量更新 | - | 同步 Dify Agent 配置 |
| Dify工作流 `agentBootstrap` | 读 | agent_key, persona_prompt, default_voice | `status='active'` | - | 初始化多 Agent 对话上下文 |

## 8. 示例文档（≥3条）
```json
{
  "_id": "ask_agent_system_cbt",
  "agent_key": "cbt_specialist",
  "agent_origin": "system_default",
  "visibility": "global",
  "status": "active",
  "review_status": "approved",
  "name": "CBT助手",
  "subtitle": "认知行为疗法专家",
  "description": "擅长认知重构、证据检验与替代思维引导",
  "persona_prompt": "你是一名受过专业训练的CBT心理咨询师...",
  "greeting_message": "你好，我是CBT助手，我们一起梳理你的想法。",
  "capability_tags": ["cbt", "task_planning"],
  "tone_tags": ["warm", "rational"],
  "modality_flags": {"text": true, "audio": true},
  "default_language": "zh-CN",
  "default_voice": {"voice_id": "calm_female_cn", "voice_type": "tts_standard", "speaking_rate": 0.95},
  "avatar_url": "https://cdn.mindguard.ai/agents/cbt.png",
  "theme_color": "#7C3AED",
  "dify_agent_id": "agt_cbt_default",
  "dify_dataset_ids": ["dataset_cbt_ref"],
  "dify_api_config": {
    "api_key": "dify-cbt-primary-key-2024",
    "base_url": "https://dify.icerain.love/v1",
    "display_name": "CBT专用密钥",
    "rate_limit": {
      "requests_per_minute": 100,
      "requests_per_hour": 2000,
      "requests_per_day": 20000
    },
    "is_active": true,
    "description": "CBT助手专用的API密钥，支持高并发请求"
  },
  "dify_fallback_configs": [
    {
      "api_key": "dify-cbt-backup-key-2024",
      "base_url": "https://dify-backup.icerain.love/v1",
      "priority": 10,
      "conditions": {
        "error_codes": ["429", "503"],
        "rate_limit_exceeded": true,
        "timeout_ms": 5000
      }
    }
  ],
  "prompt_variables": {},
  "version": "2024.04",
  "usage_stats": {
    "session_count": 1820,
    "message_count": 44210,
    "last_used_at": "2024-04-08T03:10:00Z",
    "api_usage": {
      "total_requests": 45890,
      "today_requests": 1240,
      "failed_requests": 12,
      "current_key_index": 0
    }
  },
  "createdAt": "2024-03-01T02:00:00Z",
  "updatedAt": "2024-04-06T11:20:00Z",
  "publishedAt": "2024-03-05T00:00:00Z"
}
{
  "_id": "ask_agent_org_sleep",
  "agent_key": "sleep_coach",
  "agent_origin": "org_template",
  "owner_org_id": "org_university_001",
  "visibility": "org",
  "status": "active",
  "review_status": "approved",
  "name": "睡眠教练",
  "subtitle": "高校心理中心睡眠专员",
  "persona_prompt": "你是一名睡眠健康指导顾问，提供基于循证的睡眠卫生建议...",
  "greeting_message": "晚上好，我来帮你优化睡眠节奏。",
  "capability_tags": ["behavior", "journaling"],
  "tone_tags": ["encouraging"],
  "modality_flags": {"text": true, "audio": false},
  "default_language": "zh-CN",
  "default_voice": null,
  "avatar_url": "https://cdn.mindguard.ai/agents/sleep.png",
  "theme_color": "#0EA5E9",
  "dify_agent_id": "agt_sleep_org001",
  "dify_dataset_ids": ["dataset_sleep_manual"],
  "dify_api_config": {
    "api_key": "dify-sleep-org-key-001",
    "base_url": "https://dify.icerain.love/v1",
    "display_name": "睡眠教练机构密钥",
    "rate_limit": {
      "requests_per_minute": 60,
      "requests_per_hour": 1000,
      "requests_per_day": 10000
    },
    "is_active": true,
    "description": "高校心理中心睡眠教练专用密钥"
  },
  "prompt_variables": {"campus": "东岚大学"},
  "version": "2024.03",
  "revision_notes": "补充睡前放松练习链接",
  "usage_stats": {
    "session_count": 210,
    "message_count": 4980,
    "last_used_at": "2024-04-07T16:30:00Z",
    "api_usage": {
      "total_requests": 5180,
      "today_requests": 85,
      "failed_requests": 2,
      "current_key_index": 0
    }
  },
  "createdAt": "2024-03-15T10:00:00Z",
  "updatedAt": "2024-04-05T09:45:00Z",
  "publishedAt": "2024-03-20T08:00:00Z"
}
{
  "_id": "ask_agent_usr003_01",
  "agent_key": "usr003_sleep_mate",
  "agent_origin": "user_custom",
  "owner_user_id": "usr_003",
  "visibility": "private",
  "status": "active",
  "review_status": "pending",
  "name": "暖心导师",
  "subtitle": "陪伴式睡眠鼓励者",
  "description": "结合呼吸训练与自我安抚技巧的贴心伙伴",
  "persona_prompt": "你是用户的暖心导师，关注睡眠和自我关怀...",
  "greeting_message": "嗨，先深呼吸一下，我在这里陪你。",
  "capability_tags": ["behavior", "emotion"],
  "tone_tags": ["warm", "encouraging"],
  "modality_flags": {"text": true, "audio": true},
  "default_language": "zh-CN",
  "default_voice": {"voice_id": "calm_female_cn", "voice_type": "tts_emotional", "speaking_rate": 0.9},
  "avatar_url": "https://cdn.mindguard.ai/agents/custom/usr003.png",
  "theme_color": "#F97316",
  "dify_agent_id": "agt_usr003_sleep",
  "dify_dataset_ids": [],
  "dify_api_config": {
    "api_key": "dify-user-custom-key-003",
    "base_url": "https://dify.icerain.love/v1",
    "display_name": "用户自定义密钥",
    "rate_limit": {
      "requests_per_minute": 30,
      "requests_per_hour": 500,
      "requests_per_day": 5000
    },
    "is_active": true,
    "description": "用户自定义角色暖心导师的专用密钥"
  },
  "prompt_variables": {"nickname": "小晨"},
  "version": "2024.05",
  "usage_stats": {
    "session_count": 6,
    "message_count": 140,
    "last_used_at": "2024-04-06T22:00:00Z",
    "api_usage": {
      "total_requests": 145,
      "today_requests": 12,
      "failed_requests": 0,
      "current_key_index": 0
    }
  },
  "createdAt": "2024-04-05T21:00:00Z",
  "updatedAt": "2024-04-06T22:05:00Z"
}
```

## 9. 常用查询样例（≥3条）
```javascript
// 获取全局可用且启用的系统角色
const globalAgents = await db.collection('ask_agents')
  .where({ status: 'active', visibility: 'global', is_deleted: false })
  .field({ name: true, agent_key: true, capability_tags: true, default_voice: true })
  .orderBy('name', 'asc')
  .get();

// 获取用户自定义角色（含审核状态）
const userAgents = await db.collection('ask_agents')
  .where({ owner_user_id: auth.uid, agent_origin: 'user_custom', is_deleted: false })
  .orderBy('updatedAt', 'desc')
  .field({ name: true, status: true, review_status: true, version: true })
  .get();

// 机构模板列表
const orgTemplates = await db.collection('ask_agents')
  .where({ owner_org_id: auth.orgId, agent_origin: 'org_template', status: 'active' })
  .field({ name: true, capability_tags: true, theme_color: true })
  .get();

// 带语音支持的角色，用于语音播报配置
const voiceAgents = await db.collection('ask_agents')
  .where({ 'modality_flags.audio': true, status: 'active' })
  .field({ name: true, default_voice: true, agent_key: true })
  .get();

// 根据Agent ID获取API密钥配置
const getAgentApiKey = async (agentId) => {
  const agentDoc = await db.collection('ask_agents').doc(agentId).get();
  if (!agentDoc.data) return null;

  const agent = agentDoc.data;
  return agent.dify_api_config && agent.dify_api_config.is_active
    ? {
        api_key: agent.dify_api_config.api_key,
        base_url: agent.dify_api_config.base_url || 'https://dify.icerain.love/v1',
        display_name: agent.dify_api_config.display_name,
        rate_limit: agent.dify_api_config.rate_limit
      }
    : null;
};

// 获取具有特定能力标签的活跃Agent及其API配置
const getAgentsByCapability = async (capability) => {
  return await db.collection('ask_agents')
    .where({
      capability_tags: db.command.in([capability]),
      status: 'active',
      'dify_api_config.is_active': true
    })
    .field({
      name: true,
      agent_key: true,
      capability_tags: true,
      'dify_api_config.api_key': true,
      'dify_api_config.base_url': true,
      'dify_api_config.display_name': true
    })
    .orderBy('usage_stats.api_usage.today_requests', 'asc')
    .get();
};

// 更新Agent API使用统计
const updateAgentApiUsage = async (agentId, increment = 1) => {
  return await db.collection('ask_agents').doc(agentId).update({
    data: {
      'usage_stats.api_usage.total_requests': db.command.inc(increment),
      'usage_stats.api_usage.today_requests': db.command.inc(increment),
      'usage_stats.api_usage.last_used_at': new Date(),
      updatedAt: new Date()
    }
  });
};
```

## 10. 边界与错误码
- 重复 key：同来源/同所有者下 `agent_key` 冲突返回 `E_AGENT_KEY_DUPLICATED`
- 审核中：`review_status=pending` 的角色在未审核前不可设为全局，违规操作返回 `E_AGENT_REVIEW_PENDING`
- 状态异常：停用或归档角色被引用返回 `E_AGENT_INACTIVE`
- 权限不足：非拥有者尝试编辑自定义角色返回 `E_AGENT_FORBIDDEN`
- 删除保护：系统默认角色禁用删除，操作返回 `E_AGENT_SYSTEM_LOCKED`
- **API密钥配置错误**：
  - `E_AGENT_API_KEY_MISSING`：Agent未配置API密钥或密钥已失效
  - `E_AGENT_API_KEY_INACTIVE`：Agent的API密钥已停用
  - `E_AGENT_RATE_LIMIT_EXCEEDED`：超过Agent的API调用频率限制
  - `E_AGENT_API_KEY_INVALID`：Agent的API密钥格式无效
  - `E_AGENT_FALLBACK_KEY_EXHAUSTED`：所有备用密钥均已尝试且失败
- **使用统计错误**：
  - `E_AGENT_USAGE_STATS_CORRUPTED`：使用统计数据损坏
  - `E_AGENT_API_USAGE_OVERFLOW`：API使用计数溢出

## 11. 变更影响评估
- 角色字段调整需同步前端心语精灵 Agent 配置、Dify Agent 模板与 `ask_sessions.agent_snapshot`
- 审核状态逻辑变化需更新运营后台流程及通知机制
- 能力标签改动影响角色筛选与推荐算法，需要同步埋点口径
- 删除或归档角色需批量修正会话/消息引用，可能触发大量后台任务
- **API密钥配置变更**：
  - 修改 `dify_api_config` 字段结构需更新所有相关云函数的密钥解析逻辑
  - API密钥停用或删除会影响正在进行中的对话，需要优雅降级处理
  - 速率限制调整需监控API调用失败率，确保服务质量
  - 备用密钥配置变更影响故障转移机制的可靠性
- **使用统计变更**：
  - API使用统计字段调整需更新数据分析报表和监控仪表板
  - 统计逻辑变更影响计费系统和资源配额管理

## 12. 假设与待确认
- 假设系统内置角色版本通过 CI/CD 管理；待确认版本回滚流程
- 待确认机构模板的审批与发布权限边界
- 待确认用户自定义角色的审核 SLA 与敏感内容过滤策略
- 待确认 persona_prompt 中引用外部知识库的校验规范
- 待确认角色被删除时会话是否自动回退到系统默认 Agent
- **API密钥相关假设**：
  - 假设API密钥存储在Agent文档中比独立集合更高效；待确认大量密钥查询时的性能表现
  - 假设备用密钥按优先级顺序使用；待确认多密钥切换的延迟和失败率
  - 假设密钥使用统计实时更新不影响响应性能；待确认高并发场景下的统计准确性
  - 待确认不同Agent的API密钥权限隔离策略
  - 待确认API密钥轮换和更新的自动化流程
