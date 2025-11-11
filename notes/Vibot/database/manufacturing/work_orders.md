# public.work_orders（工序工单）

> 对工序产量送检单的简化建模，聚焦产品、批号与工序产出。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 工单唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| work_order_code | varchar(50) | NOT NULL | 审批编号/工单号 |
| approval_request_id | uuid | NULL REFERENCES approval_requests(id) ON DELETE SET NULL | 关联审批 |
| related_order_id | uuid | NULL REFERENCES orders(id) ON DELETE SET NULL | 关联订单 |
| product_id | uuid | NULL REFERENCES products(id) ON DELETE SET NULL | 关联产品 |
| product_name_snapshot | varchar(255) | NOT NULL | 当时的产品名称 |
| specification_snapshot | varchar(255) | NULL | 当时的规格 |
| batch_no | varchar(100) | NULL | 生产批号 |
| process_name | varchar(100) | NOT NULL | 加工工序 |
| next_process | varchar(100) | NULL | 下一道工序 |
| status | varchar(20) | NOT NULL DEFAULT 'in_progress' | 审批状态 |
| approval_status | varchar(20) | NOT NULL DEFAULT 'pending' | 审批结果 |
| metrics | jsonb | NOT NULL DEFAULT '{}'::jsonb | 产量及良品率指标 |
| duration_hours | numeric(10,2) | NULL | 本工序耗时（小时） |
| duration_details | jsonb | NOT NULL DEFAULT '[]'::jsonb | 耗时拆分 |
| operator_name | varchar(100) | NULL | 经办人 |
| work_date | date | NULL | 作业日期 |
| attachments | jsonb | NOT NULL DEFAULT '[]'::jsonb | 附件列表 |
| remarks | text | NULL | 备注 |
| metadata | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| created_by | uuid | NULL REFERENCES users(id) | 创建人 |
| updated_by | uuid | NULL REFERENCES users(id) | 更新人 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：将多列拆分值揉成 JSON，显著减少子表，但后续要配合指标解析或物化视图做报表。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- approval_request_id → approval_requests(id) ON DELETE SET NULL
- related_order_id → orders(id) ON DELETE SET NULL
- product_id → products(id) ON DELETE SET NULL
- created_by → users(id)
- updated_by → users(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_work_orders_company_id ON public.work_orders(company_id);

## Row Level Security
```sql
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Work orders readable to project teams"
    ON public.work_orders
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.manufacturing_lead')
        OR has_role('Vibot.project_manager')
        OR created_by = auth.uid()
      )
    );

CREATE POLICY "Work orders creatable by manufacturing"
    ON public.work_orders
    FOR INSERT
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.manufacturing_lead')
        OR has_role('Vibot.project_manager')
      )
    );

CREATE POLICY "Work orders updatable by manufacturing"
    ON public.work_orders
    FOR UPDATE
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.manufacturing_lead')
        OR has_role('Vibot.project_manager')
      )
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (
        has_role('Vibot.manufacturing_lead')
        OR has_role('Vibot.project_manager')
      )
    );

CREATE POLICY "Work orders deletable by admin"
    ON public.work_orders
    FOR DELETE
    USING (
      company_id = current_company_id()
      AND has_role('Vibot.admin')
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:work_orders` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `work_orders` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.work_orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 工单唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    work_order_code varchar(50) NOT NULL -- 审批编号/工单号,
    approval_request_id uuid NULL REFERENCES approval_requests(id) ON DELETE SET NULL -- 关联审批,
    related_order_id uuid NULL REFERENCES orders(id) ON DELETE SET NULL -- 关联订单,
    product_id uuid NULL REFERENCES products(id) ON DELETE SET NULL -- 关联产品,
    product_name_snapshot varchar(255) NOT NULL -- 当时的产品名称,
    specification_snapshot varchar(255) NULL -- 当时的规格,
    batch_no varchar(100) NULL -- 生产批号,
    process_name varchar(100) NOT NULL -- 加工工序,
    next_process varchar(100) NULL -- 下一道工序,
    status varchar(20) NOT NULL DEFAULT 'in_progress' -- 审批状态,
    approval_status varchar(20) NOT NULL DEFAULT 'pending' -- 审批结果,
    metrics jsonb NOT NULL DEFAULT '{}'::jsonb -- 产量及良品率指标,
    duration_hours numeric(10,2) NULL -- 本工序耗时（小时）,
    duration_details jsonb NOT NULL DEFAULT '[]'::jsonb -- 耗时拆分,
    operator_name varchar(100) NULL -- 经办人,
    work_date date NULL -- 作业日期,
    attachments jsonb NOT NULL DEFAULT '[]'::jsonb -- 附件列表,
    remarks text NULL -- 备注,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展信息,
    created_by uuid NULL REFERENCES users(id) -- 创建人,
    updated_by uuid NULL REFERENCES users(id) -- 更新人,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.work_orders IS '对工序产量送检单的简化建模，聚焦产品、批号与工序产出。';
COMMENT ON COLUMN public.work_orders.id IS '工单唯一标识';
COMMENT ON COLUMN public.work_orders.company_id IS '所属公司';
COMMENT ON COLUMN public.work_orders.work_order_code IS '审批编号/工单号';
COMMENT ON COLUMN public.work_orders.approval_request_id IS '关联审批';
COMMENT ON COLUMN public.work_orders.related_order_id IS '关联订单';
COMMENT ON COLUMN public.work_orders.product_id IS '关联产品';
COMMENT ON COLUMN public.work_orders.product_name_snapshot IS '当时的产品名称';
COMMENT ON COLUMN public.work_orders.specification_snapshot IS '当时的规格';
COMMENT ON COLUMN public.work_orders.batch_no IS '生产批号';
COMMENT ON COLUMN public.work_orders.process_name IS '加工工序';
COMMENT ON COLUMN public.work_orders.next_process IS '下一道工序';
COMMENT ON COLUMN public.work_orders.status IS '审批状态';
COMMENT ON COLUMN public.work_orders.approval_status IS '审批结果';
COMMENT ON COLUMN public.work_orders.metrics IS '产量及良品率指标';
COMMENT ON COLUMN public.work_orders.duration_hours IS '本工序耗时（小时）';
COMMENT ON COLUMN public.work_orders.duration_details IS '耗时拆分';
COMMENT ON COLUMN public.work_orders.operator_name IS '经办人';
COMMENT ON COLUMN public.work_orders.work_date IS '作业日期';
COMMENT ON COLUMN public.work_orders.attachments IS '附件列表';
COMMENT ON COLUMN public.work_orders.remarks IS '备注';
COMMENT ON COLUMN public.work_orders.metadata IS '扩展信息';
COMMENT ON COLUMN public.work_orders.created_by IS '创建人';
COMMENT ON COLUMN public.work_orders.updated_by IS '更新人';
COMMENT ON COLUMN public.work_orders.created_at IS '创建时间';
COMMENT ON COLUMN public.work_orders.updated_at IS '更新时间';
```
