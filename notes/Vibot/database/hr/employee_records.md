# public.employee_records（员工档案）

> 员工主数据与雇佣信息。

## 字段定义
| field_name | data_type | constraints | comment |
| --- | --- | --- | --- |
| id | uuid | PRIMARY KEY DEFAULT gen_random_uuid() | 档案唯一标识 |
| company_id | uuid | NOT NULL REFERENCES companies(id) ON DELETE CASCADE | 所属公司 |
| user_id | uuid | NOT NULL REFERENCES users(id) ON DELETE CASCADE | 关联用户 |
| employee_code | varchar(50) | NOT NULL | 员工编号 |
| employment_type | varchar(30) | NOT NULL | 用工类型 |
| position_title | varchar(150) | NOT NULL | 职位 |
| manager_id | uuid | NULL REFERENCES employee_records(id) | 直属上级 |
| hire_date | date | NULL | 入职日期 |
| termination_date | date | NULL | 离职日期 |
| salary_currency | char(3) | NULL | 薪资币种 |
| salary_amount | numeric(12,2) | NULL | 薪资金额 |
| org_path | ltree | NULL | 组织路径 |
| profile | jsonb | NOT NULL DEFAULT '{}'::jsonb | 扩展信息 |
| status | varchar(20) | NOT NULL DEFAULT 'active' | 在职状态 |
| created_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | timestamptz | NOT NULL DEFAULT CURRENT_TIMESTAMP | 更新时间 |

## 设计权衡
**设计权衡**：去除技能相关表后把能力标签并入 profile，结构简单但缺乏关系约束。

## 外键与引用完整性
- company_id → companies(id) ON DELETE CASCADE
- user_id → users(id) ON DELETE CASCADE
- manager_id → employee_records(id)

## 索引策略
- CREATE INDEX IF NOT EXISTS idx_employee_records_company_id ON public.employee_records(company_id);
- CREATE INDEX IF NOT EXISTS idx_employee_records_org_path_gist ON public.employee_records USING GIST(org_path);

## Row Level Security
```sql
ALTER TABLE public.employee_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee records readable within company"
    ON public.employee_records
    FOR SELECT
    USING (
      company_id = current_company_id()
      AND (
        has_role('Vibot.admin')
        OR has_role('Vibot.hr_manager')
        OR user_id = auth.uid()
        OR manager_id IN (
          SELECT id FROM public.employee_records er
          WHERE er.user_id = auth.uid()
        )
      )
    );

CREATE POLICY "Employee records managed by HR"
    ON public.employee_records
    FOR ALL
    USING (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    )
    WITH CHECK (
      company_id = current_company_id()
      AND (has_role('Vibot.admin') OR has_role('Vibot.hr_manager'))
    );
```

## Supabase 集成要点
- 启用 Realtime 频道 `public:employee_records` 以便前端订阅关键变更。
- 仅允许 Edge Functions 使用 `service_role` 执行涉及 `employee_records` 的变更逻辑，并且在函数内调用 `current_company_id()` / `has_role()` 进行隔离。
- 通过 `supabase db diff` 维护 DDL & RLS，禁止跳过迁移。

## 初始化片段
```sql
CREATE TABLE IF NOT EXISTS public.employee_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() -- 档案唯一标识,
    company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE -- 所属公司,
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE -- 关联用户,
    employee_code varchar(50) NOT NULL -- 员工编号,
    employment_type varchar(30) NOT NULL -- 用工类型,
    position_title varchar(150) NOT NULL -- 职位,
    manager_id uuid NULL REFERENCES employee_records(id) -- 直属上级,
    hire_date date NULL -- 入职日期,
    termination_date date NULL -- 离职日期,
    salary_currency char(3) NULL -- 薪资币种,
    salary_amount numeric(12,2) NULL -- 薪资金额,
    org_path ltree NULL -- 组织路径,
    profile jsonb NOT NULL DEFAULT '{}'::jsonb -- 扩展信息,
    status varchar(20) NOT NULL DEFAULT 'active' -- 在职状态,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 创建时间,
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP -- 更新时间
);
COMMENT ON TABLE public.employee_records IS '员工主数据与雇佣信息。';
COMMENT ON COLUMN public.employee_records.id IS '档案唯一标识';
COMMENT ON COLUMN public.employee_records.company_id IS '所属公司';
COMMENT ON COLUMN public.employee_records.user_id IS '关联用户';
COMMENT ON COLUMN public.employee_records.employee_code IS '员工编号';
COMMENT ON COLUMN public.employee_records.employment_type IS '用工类型';
COMMENT ON COLUMN public.employee_records.position_title IS '职位';
COMMENT ON COLUMN public.employee_records.manager_id IS '直属上级';
COMMENT ON COLUMN public.employee_records.hire_date IS '入职日期';
COMMENT ON COLUMN public.employee_records.termination_date IS '离职日期';
COMMENT ON COLUMN public.employee_records.salary_currency IS '薪资币种';
COMMENT ON COLUMN public.employee_records.salary_amount IS '薪资金额';
COMMENT ON COLUMN public.employee_records.org_path IS '组织路径';
COMMENT ON COLUMN public.employee_records.profile IS '扩展信息';
COMMENT ON COLUMN public.employee_records.status IS '在职状态';
COMMENT ON COLUMN public.employee_records.created_at IS '创建时间';
COMMENT ON COLUMN public.employee_records.updated_at IS '更新时间';
```
