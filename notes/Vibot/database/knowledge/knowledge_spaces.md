# public.knowledge_spaces（资料库空间）

> 资料库命名空间，按公司与业务域划分访问边界。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 空间唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| code | varchar(50) | NOT NULL | 空间编码（公司内唯一） |
| name | varchar(255) | NOT NULL | 名称 |
| description | text | NULL | 说明 |
| visibility | varchar(20) | NOT NULL DEFAULT 'company' CHECK (visibility IN ('private','company','public')) | 可见范围 |
| default_permissions | jsonb | NOT NULL DEFAULT '{}'::jsonb | 角色权限模板 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展配置 |
| created_by | uuid | NOT NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：空间粒度授权便于对接不同资料类型，但需要前端同步展示 visibility 状态，避免误公开。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_knowledge_spaces_company_id ON public.knowledge_spaces(company_id);

## Row Level Security
```sql
ALTER TABLE public.knowledge_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Knowledge spaces readable within company"
    ON public.knowledge_spaces
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        visibility <> 'private'
        OR created_by = auth.uid()
        OR has_role('Vibot.admin')
      )
    );

CREATE POLICY "Knowledge spaces manageable by owners"
    ON public.knowledge_spaces
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (
        created_by = auth.uid()
        OR has_role('Vibot.admin')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        created_by = auth.uid()
        OR has_role('Vibot.admin')
      )
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:knowledge_spaces` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `knowledge_spaces` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.knowledge_spaces (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 空间唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    code varchar(50) NOT NULL -- 空间编码（公司内唯一）,
    name varchar(255) NOT NULL -- 名称,
    description text NULL -- 说明,
    visibility varchar(20) NOT NULL DEFAULT 'company' CHECK (visibility IN ('private','company','public')) -- 可见范围,
    default_permissions jsonb NOT NULL DEFAULT '{}'::jsonb -- 角色权限模板,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展配置,
    created_by uuid NOT NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.knowledge_spaces IS '资料库命名空间，按公司与业务域划分访问边界。';
COMMENT ON COLUMN public.knowledge_spaces.id IS '空间唯一标识';
COMMENT ON COLUMN public.knowledge_spaces.company_id IS '所属公司';
COMMENT ON COLUMN public.knowledge_spaces.code IS '空间编码（公司内唯一）';
COMMENT ON COLUMN public.knowledge_spaces.name IS '名称';
COMMENT ON COLUMN public.knowledge_spaces.description IS '说明';
COMMENT ON COLUMN public.knowledge_spaces.visibility IS '可见范围';
COMMENT ON COLUMN public.knowledge_spaces.default_permissions IS '角色权限模板';
COMMENT ON COLUMN public.knowledge_spaces.metadata IS '扩展配置';
COMMENT ON COLUMN public.knowledge_spaces.created_by IS '创建人';
COMMENT ON COLUMN public.knowledge_spaces.updated_by IS '更新人';
COMMENT ON COLUMN public.knowledge_spaces.created_at IS '创建时间';
COMMENT ON COLUMN public.knowledge_spaces.updated_at IS '更新时间';
```
