# public.products（产品）

> 基于工序产量单抽象出的可生产或交付的产品定义。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 产品唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| product_code | varchar(100) | NOT NULL | 产品编码或物料号 |
| name | varchar(255) | NOT NULL | 产品名称 |
| specification | varchar(255) | NULL | 规格/型号 |
| product_type | varchar(50) | NOT NULL DEFAULT 'component' | 分类 |
| unit | varchar(20) | NOT NULL DEFAULT '件' | 计量单位 |
| default_process_flow | jsonb | NOT NULL DEFAULT '{}'::jsonb | 默认工序流程 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| is_active | boolean | NOT NULL DEFAULT true | 是否启用 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：产品规格差异大，通过 JSON 保存流程，避免为每种工艺建立子表，但标准化校验需在应用层完成。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_products_company_id ON public.products(company_id);

## Row Level Security
```sql
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products readable within company"
    ON public.products
    FOR SELECT
    USING (
      company_id = current_company_id()
    );

CREATE POLICY "Products creatable by project managers"
    ON public.products
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.project_manager') OR has_role('Vibot.admin'))
    );

CREATE POLICY "Products updatable by project managers"
    ON public.products
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.project_manager') OR has_role('Vibot.admin'))
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.project_manager') OR has_role('Vibot.admin'))
    );

CREATE POLICY "Products deletable by admin"
    ON public.products
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:products` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `products` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 产品唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    product_code varchar(100) NOT NULL -- 产品编码或物料号,
    name varchar(255) NOT NULL -- 产品名称,
    specification varchar(255) NULL -- 规格/型号,
    product_type varchar(50) NOT NULL DEFAULT 'component' -- 分类,
    unit varchar(20) NOT NULL DEFAULT '件' -- 计量单位,
    default_process_flow jsonb NOT NULL DEFAULT '{}'::jsonb -- 默认工序流程,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展信息,
    is_active boolean NOT NULL DEFAULT true -- 是否启用,
    created_by uuid NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.products IS '基于工序产量单抽象出的可生产或交付的产品定义。';
COMMENT ON COLUMN public.products.id IS '产品唯一标识';
COMMENT ON COLUMN public.products.company_id IS '所属公司';
COMMENT ON COLUMN public.products.product_code IS '产品编码或物料号';
COMMENT ON COLUMN public.products.name IS '产品名称';
COMMENT ON COLUMN public.products.specification IS '规格/型号';
COMMENT ON COLUMN public.products.product_type IS '分类';
COMMENT ON COLUMN public.products.unit IS '计量单位';
COMMENT ON COLUMN public.products.default_process_flow IS '默认工序流程';
COMMENT ON COLUMN public.products.metadata IS '扩展信息';
COMMENT ON COLUMN public.products.is_active IS '是否启用';
COMMENT ON COLUMN public.products.created_by IS '创建人';
COMMENT ON COLUMN public.products.updated_by IS '更新人';
COMMENT ON COLUMN public.products.created_at IS '创建时间';
COMMENT ON COLUMN public.products.updated_at IS '更新时间';
```
