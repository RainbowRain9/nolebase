# 数据库迁移指南

## 概述

本文档详细描述了微信社区商场小程序数据库的迁移策略、版本管理、升级流程和回滚方案。数据库迁移采用版本化管理，确保数据库结构变更的可追踪性和可回滚性。

## 迁移策略

### 版本命名规范

```text
格式: V{主版本}.{次版本}.{修订版本}__{描述}.sql
示例: V1.0.1__create_user_tables.sql
     V1.0.2__add_user_indexes.sql
     V1.1.0__create_forum_tables.sql
```

### 迁移文件组织

```text
migrations/
├── V1.0.0__initial_database.sql          # 初始化数据库
├── V1.0.1__create_user_tables.sql        # 用户相关表
├── V1.0.2__create_forum_tables.sql       # 论坛相关表
├── V1.0.3__create_mall_tables.sql        # 商城相关表
├── V1.0.4__create_academic_tables.sql    # 教务相关表
├── V1.0.5__create_system_tables.sql      # 系统管理表
├── V1.0.6__add_indexes.sql               # 添加索引
├── V1.0.7__add_foreign_keys.sql          # 添加外键约束
├── V1.0.8__insert_initial_data.sql       # 初始化数据
└── rollback/
    ├── R1.0.1__drop_user_tables.sql      # 回滚脚本
    ├── R1.0.2__drop_forum_tables.sql
    └── ...
```

## 初始化迁移

### V1.0.0 - 数据库初始化

```sql
-- V1.0.0__initial_database.sql
-- 创建数据库和基础配置

-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_mall
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE campus_mall;

-- 设置基础配置
SET GLOBAL innodb_file_format = 'Barracuda';
SET GLOBAL innodb_file_per_table = ON;
SET GLOBAL innodb_large_prefix = ON;

-- 创建迁移记录表
CREATE TABLE schema_migrations (
    version VARCHAR(50) PRIMARY KEY COMMENT '版本号',
    description VARCHAR(255) NOT NULL COMMENT '描述',
    type ENUM('migration', 'rollback') NOT NULL COMMENT '类型',
    checksum VARCHAR(64) COMMENT '文件校验和',
    executed_by VARCHAR(100) NOT NULL COMMENT '执行人',
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '执行时间',
    execution_time INT COMMENT '执行时间(毫秒)',
    success TINYINT DEFAULT 1 COMMENT '是否成功'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据库迁移记录表';

-- 记录初始化版本
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.0', 'Initial database setup', 'migration', 'system');
```

### V1.0.1 - 用户相关表

```sql
-- V1.0.1__create_user_tables.sql
-- 创建用户相关表

USE campus_mall;

-- 用户基础信息表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    openid VARCHAR(64) UNIQUE NOT NULL COMMENT '微信OpenID',
    unionid VARCHAR(64) UNIQUE COMMENT '微信UnionID',
    nickname VARCHAR(50) NOT NULL COMMENT '用户昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    phone VARCHAR(20) UNIQUE COMMENT '手机号',
    email VARCHAR(100) COMMENT '邮箱',
    real_name VARCHAR(50) COMMENT '真实姓名',
    gender TINYINT DEFAULT 0 COMMENT '性别：0-未知，1-男，2-女',
    birthday DATE COMMENT '生日',

    -- 学籍信息
    student_id VARCHAR(20) UNIQUE COMMENT '学号',
    college VARCHAR(100) COMMENT '学院',
    major VARCHAR(100) COMMENT '专业',
    class_name VARCHAR(100) COMMENT '班级',
    grade VARCHAR(10) COMMENT '年级',

    -- 状态信息
    role ENUM('student', 'teacher', 'merchant', 'admin') DEFAULT 'student' COMMENT '用户角色',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    verify_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '认证状态',

    -- 统计信息
    post_count INT DEFAULT 0 COMMENT '发帖数',
    like_count INT DEFAULT 0 COMMENT '获赞数',
    follower_count INT DEFAULT 0 COMMENT '粉丝数',
    following_count INT DEFAULT 0 COMMENT '关注数',

    -- 时间信息
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) COMMENT '最后登录IP',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';

-- 用户登录日志表
CREATE TABLE user_login_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    login_type ENUM('wechat', 'phone') NOT NULL COMMENT '登录方式',
    ip_address VARCHAR(45) NOT NULL COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    device_info JSON COMMENT '设备信息',
    location VARCHAR(100) COMMENT '登录地点',
    login_result TINYINT NOT NULL COMMENT '登录结果：1-成功，0-失败',
    failure_reason VARCHAR(255) COMMENT '失败原因',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户登录日志表';

-- 用户关注关系表
CREATE TABLE user_follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关系ID',
    follower_id BIGINT NOT NULL COMMENT '关注者ID',
    following_id BIGINT NOT NULL COMMENT '被关注者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关注关系表';

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.1', 'Create user related tables', 'migration', USER());
```

### V1.0.2 - 论坛相关表

```sql
-- V1.0.2__create_forum_tables.sql
-- 创建论坛相关表

USE campus_mall;

-- 论坛版块表
CREATE TABLE forum_boards (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '版块ID',
    name VARCHAR(50) NOT NULL COMMENT '版块名称',
    description TEXT COMMENT '版块描述',
    icon VARCHAR(255) COMMENT '版块图标',
    banner VARCHAR(255) COMMENT '版块横幅',
    color VARCHAR(7) DEFAULT '#1890ff' COMMENT '主题色',
    sort_order INT DEFAULT 0 COMMENT '排序权重',

    -- 统计信息
    post_count INT DEFAULT 0 COMMENT '帖子数量',
    member_count INT DEFAULT 0 COMMENT '成员数量',
    today_post_count INT DEFAULT 0 COMMENT '今日发帖数',

    -- 版块设置
    rules JSON COMMENT '版块规则',
    tags JSON COMMENT '版块标签',
    allow_anonymous TINYINT DEFAULT 1 COMMENT '是否允许匿名发帖',
    need_audit TINYINT DEFAULT 0 COMMENT '是否需要审核',

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-关闭',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛版块表';

-- 版块关注表
CREATE TABLE board_follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关注ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    board_id INT NOT NULL COMMENT '版块ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='版块关注表';

-- 帖子表
CREATE TABLE forum_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '帖子ID',
    title VARCHAR(200) NOT NULL COMMENT '帖子标题',
    content LONGTEXT NOT NULL COMMENT '帖子内容',
    content_type ENUM('text', 'markdown') DEFAULT 'text' COMMENT '内容类型',
    images JSON COMMENT '图片列表',

    -- 作者信息
    author_id BIGINT NOT NULL COMMENT '作者ID',
    is_anonymous TINYINT DEFAULT 0 COMMENT '是否匿名',

    -- 版块信息
    board_id INT NOT NULL COMMENT '版块ID',

    -- 标签和分类
    tags JSON COMMENT '标签列表',

    -- 统计信息
    view_count INT DEFAULT 0 COMMENT '浏览数',
    like_count INT DEFAULT 0 COMMENT '点赞数',
    comment_count INT DEFAULT 0 COMMENT '评论数',
    share_count INT DEFAULT 0 COMMENT '分享数',
    collect_count INT DEFAULT 0 COMMENT '收藏数',

    -- 热度计算
    hot_score DECIMAL(10,2) DEFAULT 0 COMMENT '热度分数',

    -- 状态信息
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶',
    is_hot TINYINT DEFAULT 0 COMMENT '是否热门',
    allow_comment TINYINT DEFAULT 1 COMMENT '是否允许评论',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除，2-审核中',

    -- 审核信息
    audit_status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' COMMENT '审核状态',
    audit_reason VARCHAR(255) COMMENT '审核原因',
    audited_by BIGINT COMMENT '审核人ID',
    audited_at TIMESTAMP NULL COMMENT '审核时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子表';

-- 评论表
CREATE TABLE forum_comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
    post_id BIGINT NOT NULL COMMENT '帖子ID',
    content TEXT NOT NULL COMMENT '评论内容',

    -- 作者信息
    author_id BIGINT NOT NULL COMMENT '作者ID',
    is_anonymous TINYINT DEFAULT 0 COMMENT '是否匿名',

    -- 回复关系
    parent_id BIGINT DEFAULT 0 COMMENT '父评论ID，0表示一级评论',
    reply_to_user_id BIGINT COMMENT '回复的用户ID',

    -- 统计信息
    like_count INT DEFAULT 0 COMMENT '点赞数',
    reply_count INT DEFAULT 0 COMMENT '回复数',

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',

    -- 设备信息
    ip_address VARCHAR(45) COMMENT 'IP地址',
    device VARCHAR(50) COMMENT '设备类型',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.2', 'Create forum related tables', 'migration', USER());
```

### V1.0.3 - 商城相关表

```sql
-- V1.0.3__create_mall_tables.sql
-- 创建商城相关表

USE campus_mall;

-- 商品分类表
CREATE TABLE product_categories (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    parent_id INT DEFAULT 0 COMMENT '父分类ID，0表示顶级分类',
    icon VARCHAR(255) COMMENT '分类图标',
    banner VARCHAR(255) COMMENT '分类横幅',
    description TEXT COMMENT '分类描述',
    sort_order INT DEFAULT 0 COMMENT '排序权重',
    level TINYINT DEFAULT 1 COMMENT '分类层级',
    path VARCHAR(255) COMMENT '分类路径',
    product_count INT DEFAULT 0 COMMENT '商品数量',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 商家信息表
CREATE TABLE merchants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商家ID',
    user_id BIGINT NOT NULL COMMENT '关联用户ID',
    business_name VARCHAR(100) NOT NULL COMMENT '商家名称',
    business_type ENUM('individual', 'enterprise') NOT NULL COMMENT '商家类型',
    business_license VARCHAR(255) COMMENT '营业执照',
    id_card VARCHAR(255) COMMENT '身份证',
    contact_person VARCHAR(50) NOT NULL COMMENT '联系人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    business_address VARCHAR(255) NOT NULL COMMENT '经营地址',
    business_scope TEXT COMMENT '经营范围',
    description TEXT COMMENT '商家介绍',
    avatar VARCHAR(255) COMMENT '商家头像',
    bank_account JSON COMMENT '银行账户信息',
    product_count INT DEFAULT 0 COMMENT '商品数量',
    order_count INT DEFAULT 0 COMMENT '订单数量',
    sales_amount DECIMAL(15,2) DEFAULT 0 COMMENT '销售金额',
    rating DECIMAL(3,2) DEFAULT 5.0 COMMENT '评分',
    review_count INT DEFAULT 0 COMMENT '评价数量',
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending' COMMENT '状态',
    verify_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '认证状态',
    audit_reason VARCHAR(255) COMMENT '审核原因',
    audited_by BIGINT COMMENT '审核人ID',
    audited_at TIMESTAMP NULL COMMENT '审核时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商家信息表';

-- 商品表
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    description LONGTEXT COMMENT '商品描述',
    category_id INT NOT NULL COMMENT '分类ID',
    merchant_id BIGINT NOT NULL COMMENT '商家ID',
    price DECIMAL(10,2) NOT NULL COMMENT '售价',
    original_price DECIMAL(10,2) COMMENT '原价',
    cost_price DECIMAL(10,2) COMMENT '成本价',
    stock INT DEFAULT 0 COMMENT '库存数量',
    sold_count INT DEFAULT 0 COMMENT '销售数量',
    images JSON COMMENT '商品图片列表',
    detail_images JSON COMMENT '详情图片列表',
    specifications JSON COMMENT '规格参数',
    tags JSON COMMENT '商品标签',
    shipping_info JSON COMMENT '配送信息',
    services JSON COMMENT '服务承诺',
    is_second_hand TINYINT DEFAULT 0 COMMENT '是否二手商品',
    condition_level ENUM('excellent', 'good', 'fair', 'poor') COMMENT '成色等级',
    purchase_date DATE COMMENT '购买日期',
    sell_reason VARCHAR(255) COMMENT '出售原因',
    region_id INT COMMENT '区域ID',
    view_count INT DEFAULT 0 COMMENT '浏览数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    rating DECIMAL(3,2) DEFAULT 5.0 COMMENT '评分',
    review_count INT DEFAULT 0 COMMENT '评价数',
    status ENUM('draft', 'pending', 'approved', 'rejected', 'offline') DEFAULT 'pending' COMMENT '状态',
    audit_reason VARCHAR(255) COMMENT '审核原因',
    audited_by BIGINT COMMENT '审核人ID',
    audited_at TIMESTAMP NULL COMMENT '审核时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 订单表
CREATE TABLE orders (
    id VARCHAR(32) PRIMARY KEY COMMENT '订单ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    merchant_id BIGINT NOT NULL COMMENT '商家ID',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '商品总金额',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    shipping_fee DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
    final_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
    shipping_address JSON NOT NULL COMMENT '收货地址信息',
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunding', 'refunded')
           DEFAULT 'pending' COMMENT '订单状态',
    payment_method VARCHAR(20) COMMENT '支付方式',
    payment_id VARCHAR(64) COMMENT '支付ID',
    paid_at TIMESTAMP NULL COMMENT '支付时间',
    logistics_company VARCHAR(50) COMMENT '物流公司',
    tracking_number VARCHAR(100) COMMENT '物流单号',
    shipped_at TIMESTAMP NULL COMMENT '发货时间',
    delivered_at TIMESTAMP NULL COMMENT '收货时间',
    remark TEXT COMMENT '订单备注',
    cancel_reason VARCHAR(255) COMMENT '取消原因',
    cancelled_at TIMESTAMP NULL COMMENT '取消时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.3', 'Create mall related tables', 'migration', USER());
```

### V1.0.4 - 教务相关表

```sql
-- V1.0.4__create_academic_tables.sql
-- 创建教务相关表

USE campus_mall;

-- 课程表
CREATE TABLE courses (
    id VARCHAR(20) PRIMARY KEY COMMENT '课程ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_code VARCHAR(20) NOT NULL COMMENT '课程代码',
    english_name VARCHAR(100) COMMENT '英文名称',
    credits DECIMAL(3,1) NOT NULL COMMENT '学分',
    hours INT NOT NULL COMMENT '学时',
    course_type ENUM('required', 'elective', 'public') NOT NULL COMMENT '课程类型',
    department VARCHAR(100) NOT NULL COMMENT '开课学院',
    description TEXT COMMENT '课程描述',
    prerequisites JSON COMMENT '先修课程',
    textbook VARCHAR(255) COMMENT '教材',
    reference_books JSON COMMENT '参考书目',
    assessment JSON COMMENT '考核方式',
    semester VARCHAR(10) NOT NULL COMMENT '开课学期',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-停开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- 学生成绩表
CREATE TABLE student_grades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '成绩ID',
    student_id VARCHAR(20) NOT NULL COMMENT '学号',
    course_id VARCHAR(20) NOT NULL COMMENT '课程ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_code VARCHAR(20) NOT NULL COMMENT '课程代码',
    credits DECIMAL(3,1) NOT NULL COMMENT '学分',
    semester VARCHAR(10) NOT NULL COMMENT '学期',
    teacher_name VARCHAR(50) NOT NULL COMMENT '任课教师',
    attendance_score DECIMAL(5,2) COMMENT '考勤成绩',
    homework_score DECIMAL(5,2) COMMENT '作业成绩',
    midterm_score DECIMAL(5,2) COMMENT '期中成绩',
    final_score DECIMAL(5,2) COMMENT '期末成绩',
    total_score DECIMAL(5,2) NOT NULL COMMENT '总成绩',
    gpa DECIMAL(3,2) COMMENT '绩点',
    class_rank INT COMMENT '班级排名',
    class_total INT COMMENT '班级总人数',
    major_rank INT COMMENT '专业排名',
    major_total INT COMMENT '专业总人数',
    status ENUM('passed', 'failed', 'retake') NOT NULL COMMENT '成绩状态',
    exam_date DATE COMMENT '考试日期',
    publish_date DATE COMMENT '成绩发布日期',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生成绩表';

-- 考试安排表
CREATE TABLE exams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '考试ID',
    course_id VARCHAR(20) NOT NULL COMMENT '课程ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_code VARCHAR(20) NOT NULL COMMENT '课程代码',
    exam_type ENUM('midterm', 'final', 'makeup') NOT NULL COMMENT '考试类型',
    exam_date DATE NOT NULL COMMENT '考试日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    duration INT NOT NULL COMMENT '考试时长（分钟）',
    classroom VARCHAR(50) NOT NULL COMMENT '考场',
    teacher_name VARCHAR(50) NOT NULL COMMENT '任课教师',
    proctors JSON COMMENT '监考老师',
    exam_form ENUM('open', 'closed', 'computer') NOT NULL COMMENT '考试形式',
    allowed_items JSON COMMENT '允许携带物品',
    prohibited_items JSON COMMENT '禁止携带物品',
    exam_rules JSON COMMENT '考试规则',
    notes TEXT COMMENT '注意事项',
    semester VARCHAR(10) NOT NULL COMMENT '学期',
    registration_deadline DATE COMMENT '报名截止日期',
    max_students INT COMMENT '最大人数',
    registered_count INT DEFAULT 0 COMMENT '已报名人数',
    status ENUM('upcoming', 'ongoing', 'finished', 'cancelled') DEFAULT 'upcoming' COMMENT '考试状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考试安排表';

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.4', 'Create academic related tables', 'migration', USER());
```

### V1.0.5 - 系统管理表

```sql
-- V1.0.5__create_system_tables.sql
-- 创建系统管理相关表

USE campus_mall;

-- 管理员表
CREATE TABLE admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '管理员ID',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码',
    real_name VARCHAR(50) NOT NULL COMMENT '真实姓名',
    email VARCHAR(100) COMMENT '邮箱',
    phone VARCHAR(20) COMMENT '手机号',
    avatar VARCHAR(255) COMMENT '头像',
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-禁用',
    last_login_at TIMESTAMP NULL COMMENT '最后登录时间',
    last_login_ip VARCHAR(45) COMMENT '最后登录IP',
    login_count INT DEFAULT 0 COMMENT '登录次数',
    failed_login_count INT DEFAULT 0 COMMENT '失败登录次数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- 举报记录表
CREATE TABLE reports (
    id VARCHAR(32) PRIMARY KEY COMMENT '举报ID',
    reporter_id BIGINT NOT NULL COMMENT '举报人ID',
    target_type ENUM('post', 'comment', 'user', 'product') NOT NULL COMMENT '举报对象类型',
    target_id VARCHAR(32) NOT NULL COMMENT '举报对象ID',
    reason ENUM('spam', 'inappropriate', 'harassment', 'fake', 'other') NOT NULL COMMENT '举报原因',
    description TEXT COMMENT '详细描述',
    evidence JSON COMMENT '证据材料',
    status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending' COMMENT '处理状态',
    processor_id INT COMMENT '处理人ID',
    process_result VARCHAR(255) COMMENT '处理结果',
    process_reason VARCHAR(255) COMMENT '处理原因',
    processed_at TIMESTAMP NULL COMMENT '处理时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报记录表';

-- 消息通知表
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    type ENUM('like', 'comment', 'reply', 'follow', 'system', 'order', 'activity') NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    target_type VARCHAR(50) COMMENT '目标类型',
    target_id VARCHAR(32) COMMENT '目标ID',
    sender_id BIGINT COMMENT '发送者ID',
    sender_avatar VARCHAR(255) COMMENT '发送者头像',
    is_read TINYINT DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
    read_at TIMESTAMP NULL COMMENT '阅读时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';

-- 系统配置表
CREATE TABLE system_configs (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '配置类型',
    category VARCHAR(50) NOT NULL COMMENT '配置分类',
    description VARCHAR(255) COMMENT '配置描述',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开：0-私有，1-公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.5', 'Create system management tables', 'migration', USER());
```

### V1.0.6 - 添加索引

```sql
-- V1.0.6__add_indexes.sql
-- 添加数据库索引

USE campus_mall;

-- 用户表索引
ALTER TABLE users ADD INDEX idx_openid (openid);
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD INDEX idx_student_id (student_id);
ALTER TABLE users ADD INDEX idx_role_status (role, status);
ALTER TABLE users ADD INDEX idx_college_major (college, major);
ALTER TABLE users ADD INDEX idx_created_at (created_at);

-- 用户登录日志表索引
ALTER TABLE user_login_logs ADD INDEX idx_user_id (user_id);
ALTER TABLE user_login_logs ADD INDEX idx_login_result (login_result);
ALTER TABLE user_login_logs ADD INDEX idx_created_at (created_at);
ALTER TABLE user_login_logs ADD INDEX idx_ip_address (ip_address);

-- 用户关注关系表索引
ALTER TABLE user_follows ADD UNIQUE KEY uk_follower_following (follower_id, following_id);
ALTER TABLE user_follows ADD INDEX idx_follower_id (follower_id);
ALTER TABLE user_follows ADD INDEX idx_following_id (following_id);
ALTER TABLE user_follows ADD INDEX idx_created_at (created_at);

-- 论坛版块表索引
ALTER TABLE forum_boards ADD INDEX idx_status_sort (status, sort_order);
ALTER TABLE forum_boards ADD INDEX idx_post_count (post_count);
ALTER TABLE forum_boards ADD INDEX idx_created_at (created_at);

-- 版块关注表索引
ALTER TABLE board_follows ADD UNIQUE KEY uk_user_board (user_id, board_id);
ALTER TABLE board_follows ADD INDEX idx_user_id (user_id);
ALTER TABLE board_follows ADD INDEX idx_board_id (board_id);
ALTER TABLE board_follows ADD INDEX idx_created_at (created_at);

-- 帖子表索引
ALTER TABLE forum_posts ADD INDEX idx_author_id (author_id);
ALTER TABLE forum_posts ADD INDEX idx_board_id (board_id);
ALTER TABLE forum_posts ADD INDEX idx_status_created (status, created_at);
ALTER TABLE forum_posts ADD INDEX idx_hot_score (hot_score);
ALTER TABLE forum_posts ADD INDEX idx_is_top_hot (is_top, is_hot);
ALTER TABLE forum_posts ADD INDEX idx_audit_status (audit_status);
ALTER TABLE forum_posts ADD INDEX idx_created_at (created_at);
ALTER TABLE forum_posts ADD FULLTEXT INDEX ft_title_content (title, content);

-- 评论表索引
ALTER TABLE forum_comments ADD INDEX idx_post_id (post_id);
ALTER TABLE forum_comments ADD INDEX idx_author_id (author_id);
ALTER TABLE forum_comments ADD INDEX idx_parent_id (parent_id);
ALTER TABLE forum_comments ADD INDEX idx_status_created (status, created_at);
ALTER TABLE forum_comments ADD INDEX idx_created_at (created_at);

-- 商品分类表索引
ALTER TABLE product_categories ADD INDEX idx_parent_id (parent_id);
ALTER TABLE product_categories ADD INDEX idx_status_sort (status, sort_order);
ALTER TABLE product_categories ADD INDEX idx_level (level);
ALTER TABLE product_categories ADD INDEX idx_product_count (product_count);

-- 商家信息表索引
ALTER TABLE merchants ADD INDEX idx_user_id (user_id);
ALTER TABLE merchants ADD INDEX idx_status (status);
ALTER TABLE merchants ADD INDEX idx_verify_status (verify_status);
ALTER TABLE merchants ADD INDEX idx_rating (rating);
ALTER TABLE merchants ADD INDEX idx_created_at (created_at);

-- 商品表索引
ALTER TABLE products ADD INDEX idx_category_id (category_id);
ALTER TABLE products ADD INDEX idx_merchant_id (merchant_id);
ALTER TABLE products ADD INDEX idx_status (status);
ALTER TABLE products ADD INDEX idx_price (price);
ALTER TABLE products ADD INDEX idx_sold_count (sold_count);
ALTER TABLE products ADD INDEX idx_rating (rating);
ALTER TABLE products ADD INDEX idx_is_second_hand (is_second_hand);
ALTER TABLE products ADD INDEX idx_region_id (region_id);
ALTER TABLE products ADD INDEX idx_created_at (created_at);
ALTER TABLE products ADD FULLTEXT INDEX ft_name_description (name, description);

-- 订单表索引
ALTER TABLE orders ADD INDEX idx_user_id (user_id);
ALTER TABLE orders ADD INDEX idx_merchant_id (merchant_id);
ALTER TABLE orders ADD INDEX idx_status (status);
ALTER TABLE orders ADD INDEX idx_payment_id (payment_id);
ALTER TABLE orders ADD INDEX idx_created_at (created_at);

-- 课程表索引
ALTER TABLE courses ADD INDEX idx_course_code (course_code);
ALTER TABLE courses ADD INDEX idx_department (department);
ALTER TABLE courses ADD INDEX idx_course_type (course_type);
ALTER TABLE courses ADD INDEX idx_semester (semester);
ALTER TABLE courses ADD INDEX idx_credits (credits);

-- 学生成绩表索引
ALTER TABLE student_grades ADD UNIQUE KEY uk_student_course_semester (student_id, course_id, semester);
ALTER TABLE student_grades ADD INDEX idx_student_id (student_id);
ALTER TABLE student_grades ADD INDEX idx_course_id (course_id);
ALTER TABLE student_grades ADD INDEX idx_semester (semester);
ALTER TABLE student_grades ADD INDEX idx_total_score (total_score);
ALTER TABLE student_grades ADD INDEX idx_status (status);

-- 考试安排表索引
ALTER TABLE exams ADD INDEX idx_course_id (course_id);
ALTER TABLE exams ADD INDEX idx_exam_date (exam_date);
ALTER TABLE exams ADD INDEX idx_classroom (classroom);
ALTER TABLE exams ADD INDEX idx_exam_type (exam_type);
ALTER TABLE exams ADD INDEX idx_semester (semester);
ALTER TABLE exams ADD INDEX idx_status (status);

-- 管理员表索引
ALTER TABLE admin_users ADD INDEX idx_username (username);
ALTER TABLE admin_users ADD INDEX idx_status (status);
ALTER TABLE admin_users ADD INDEX idx_created_at (created_at);

-- 举报记录表索引
ALTER TABLE reports ADD INDEX idx_reporter_id (reporter_id);
ALTER TABLE reports ADD INDEX idx_target_type_id (target_type, target_id);
ALTER TABLE reports ADD INDEX idx_status (status);
ALTER TABLE reports ADD INDEX idx_processor_id (processor_id);
ALTER TABLE reports ADD INDEX idx_created_at (created_at);

-- 消息通知表索引
ALTER TABLE notifications ADD INDEX idx_user_id (user_id);
ALTER TABLE notifications ADD INDEX idx_type (type);
ALTER TABLE notifications ADD INDEX idx_is_read (is_read);
ALTER TABLE notifications ADD INDEX idx_target_type_id (target_type, target_id);
ALTER TABLE notifications ADD INDEX idx_created_at (created_at);

-- 系统配置表索引
ALTER TABLE system_configs ADD INDEX idx_config_key (config_key);
ALTER TABLE system_configs ADD INDEX idx_category (category);
ALTER TABLE system_configs ADD INDEX idx_is_public (is_public);

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.6', 'Add database indexes', 'migration', USER());
```

### V1.0.7 - 添加外键约束

```sql
-- V1.0.7__add_foreign_keys.sql
-- 添加外键约束

USE campus_mall;

-- 用户登录日志表外键
ALTER TABLE user_login_logs
ADD CONSTRAINT fk_user_login_logs_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 用户关注关系表外键
ALTER TABLE user_follows
ADD CONSTRAINT fk_user_follows_follower_id
FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE user_follows
ADD CONSTRAINT fk_user_follows_following_id
FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE;

-- 版块关注表外键
ALTER TABLE board_follows
ADD CONSTRAINT fk_board_follows_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE board_follows
ADD CONSTRAINT fk_board_follows_board_id
FOREIGN KEY (board_id) REFERENCES forum_boards(id) ON DELETE CASCADE;

-- 帖子表外键
ALTER TABLE forum_posts
ADD CONSTRAINT fk_forum_posts_author_id
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE forum_posts
ADD CONSTRAINT fk_forum_posts_board_id
FOREIGN KEY (board_id) REFERENCES forum_boards(id) ON DELETE CASCADE;

-- 评论表外键
ALTER TABLE forum_comments
ADD CONSTRAINT fk_forum_comments_post_id
FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;

ALTER TABLE forum_comments
ADD CONSTRAINT fk_forum_comments_author_id
FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE;

-- 商品分类表外键（自关联）
ALTER TABLE product_categories
ADD CONSTRAINT fk_product_categories_parent_id
FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE CASCADE;

-- 商家信息表外键
ALTER TABLE merchants
ADD CONSTRAINT fk_merchants_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 商品表外键
ALTER TABLE products
ADD CONSTRAINT fk_products_category_id
FOREIGN KEY (category_id) REFERENCES product_categories(id);

ALTER TABLE products
ADD CONSTRAINT fk_products_merchant_id
FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- 订单表外键
ALTER TABLE orders
ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE orders
ADD CONSTRAINT fk_orders_merchant_id
FOREIGN KEY (merchant_id) REFERENCES merchants(id);

-- 学生成绩表外键
ALTER TABLE student_grades
ADD CONSTRAINT fk_student_grades_student_id
FOREIGN KEY (student_id) REFERENCES users(student_id);

ALTER TABLE student_grades
ADD CONSTRAINT fk_student_grades_course_id
FOREIGN KEY (course_id) REFERENCES courses(id);

-- 考试安排表外键
ALTER TABLE exams
ADD CONSTRAINT fk_exams_course_id
FOREIGN KEY (course_id) REFERENCES courses(id);

-- 举报记录表外键
ALTER TABLE reports
ADD CONSTRAINT fk_reports_reporter_id
FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE;

-- 消息通知表外键
ALTER TABLE notifications
ADD CONSTRAINT fk_notifications_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.7', 'Add foreign key constraints', 'migration', USER());
```

### V1.0.8 - 初始化数据

```sql
-- V1.0.8__insert_initial_data.sql
-- 插入初始化数据

USE campus_mall;

-- 插入默认管理员
INSERT INTO admin_users (username, password, real_name, email, status) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '系统管理员', 'admin@campus-mall.com', 1);

-- 插入论坛版块
INSERT INTO forum_boards (name, description, icon, color, sort_order, status) VALUES
('学习交流', '学术讨论、学习资料分享', 'https://cdn.campus-mall.com/icons/study.png', '#1890ff', 1, 1),
('二手闲置', '二手物品交易、闲置物品转让', 'https://cdn.campus-mall.com/icons/secondhand.png', '#52c41a', 2, 1),
('校园生活', '校园活动、生活分享', 'https://cdn.campus-mall.com/icons/life.png', '#722ed1', 3, 1),
('求职招聘', '实习招聘、求职信息', 'https://cdn.campus-mall.com/icons/job.png', '#fa8c16', 4, 1),
('失物招领', '失物招领、寻物启事', 'https://cdn.campus-mall.com/icons/lost.png', '#eb2f96', 5, 1);

-- 插入商品分类
INSERT INTO product_categories (name, parent_id, icon, sort_order, level, path, status) VALUES
('数码产品', 0, 'https://cdn.campus-mall.com/icons/digital.png', 1, 1, '1', 1),
('生活用品', 0, 'https://cdn.campus-mall.com/icons/life.png', 2, 1, '2', 1),
('学习用品', 0, 'https://cdn.campus-mall.com/icons/study.png', 3, 1, '3', 1),
('服装配饰', 0, 'https://cdn.campus-mall.com/icons/clothes.png', 4, 1, '4', 1),
('运动健身', 0, 'https://cdn.campus-mall.com/icons/sports.png', 5, 1, '5', 1);

-- 插入二级分类
INSERT INTO product_categories (name, parent_id, icon, sort_order, level, path, status) VALUES
('手机通讯', 1, '', 1, 2, '1/6', 1),
('电脑办公', 1, '', 2, 2, '1/7', 1),
('数码配件', 1, '', 3, 2, '1/8', 1),
('日用百货', 2, '', 1, 2, '2/9', 1),
('美妆护肤', 2, '', 2, 2, '2/10', 1),
('食品饮料', 2, '', 3, 2, '2/11', 1),
('教材教辅', 3, '', 1, 2, '3/12', 1),
('文具用品', 3, '', 2, 2, '3/13', 1),
('男装', 4, '', 1, 2, '4/14', 1),
('女装', 4, '', 2, 2, '4/15', 1),
('鞋靴', 4, '', 3, 2, '4/16', 1),
('运动器材', 5, '', 1, 2, '5/17', 1),
('户外用品', 5, '', 2, 2, '5/18', 1);

-- 插入系统配置
INSERT INTO system_configs (config_key, config_value, config_type, category, description, is_public) VALUES
('site_name', '校园社区商场', 'string', 'basic', '网站名称', 1),
('site_description', '专为大学生打造的校园社区商场平台', 'string', 'basic', '网站描述', 1),
('contact_email', 'support@campus-mall.com', 'string', 'contact', '联系邮箱', 1),
('contact_phone', '400-123-4567', 'string', 'contact', '联系电话', 1),
('max_upload_size', '10485760', 'number', 'upload', '最大上传文件大小(字节)', 0),
('allowed_file_types', '["jpg","jpeg","png","gif","pdf","doc","docx"]', 'json', 'upload', '允许上传的文件类型', 0),
('post_audit_enabled', 'false', 'boolean', 'forum', '帖子是否需要审核', 0),
('product_audit_enabled', 'true', 'boolean', 'mall', '商品是否需要审核', 0),
('merchant_commission_rate', '0.02', 'number', 'mall', '商家佣金费率', 0),
('points_exchange_rate', '100', 'number', 'points', '积分兑换比例(积分:元)', 0);

-- 记录迁移
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.8', 'Insert initial data', 'migration', USER());
```

## 回滚脚本

### 回滚脚本示例

```sql
-- rollback/R1.0.8__remove_initial_data.sql
-- 回滚初始化数据

USE campus_mall;

-- 删除系统配置
DELETE FROM system_configs WHERE config_key IN (
    'site_name', 'site_description', 'contact_email', 'contact_phone',
    'max_upload_size', 'allowed_file_types', 'post_audit_enabled',
    'product_audit_enabled', 'merchant_commission_rate', 'points_exchange_rate'
);

-- 删除商品分类
DELETE FROM product_categories;

-- 删除论坛版块
DELETE FROM forum_boards;

-- 删除管理员
DELETE FROM admin_users WHERE username = 'admin';

-- 记录回滚
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('R1.0.8', 'Remove initial data', 'rollback', USER());
```

```sql
-- rollback/R1.0.7__remove_foreign_keys.sql
-- 回滚外键约束

USE campus_mall;

-- 删除外键约束
ALTER TABLE user_login_logs DROP FOREIGN KEY fk_user_login_logs_user_id;
ALTER TABLE user_follows DROP FOREIGN KEY fk_user_follows_follower_id;
ALTER TABLE user_follows DROP FOREIGN KEY fk_user_follows_following_id;
ALTER TABLE board_follows DROP FOREIGN KEY fk_board_follows_user_id;
ALTER TABLE board_follows DROP FOREIGN KEY fk_board_follows_board_id;
ALTER TABLE forum_posts DROP FOREIGN KEY fk_forum_posts_author_id;
ALTER TABLE forum_posts DROP FOREIGN KEY fk_forum_posts_board_id;
ALTER TABLE forum_comments DROP FOREIGN KEY fk_forum_comments_post_id;
ALTER TABLE forum_comments DROP FOREIGN KEY fk_forum_comments_author_id;
ALTER TABLE product_categories DROP FOREIGN KEY fk_product_categories_parent_id;
ALTER TABLE merchants DROP FOREIGN KEY fk_merchants_user_id;
ALTER TABLE products DROP FOREIGN KEY fk_products_category_id;
ALTER TABLE products DROP FOREIGN KEY fk_products_merchant_id;
ALTER TABLE orders DROP FOREIGN KEY fk_orders_user_id;
ALTER TABLE orders DROP FOREIGN KEY fk_orders_merchant_id;
ALTER TABLE student_grades DROP FOREIGN KEY fk_student_grades_student_id;
ALTER TABLE student_grades DROP FOREIGN KEY fk_student_grades_course_id;
ALTER TABLE exams DROP FOREIGN KEY fk_exams_course_id;
ALTER TABLE reports DROP FOREIGN KEY fk_reports_reporter_id;
ALTER TABLE notifications DROP FOREIGN KEY fk_notifications_user_id;

-- 记录回滚
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('R1.0.7', 'Remove foreign key constraints', 'rollback', USER());
```

## 迁移管理工具

### 迁移执行脚本

```bash
#!/bin/bash
# migrate.sh - 数据库迁移执行脚本

set -e

# 配置
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="campus_mall"
DB_USER="root"
DB_PASS=""
MIGRATION_DIR="./migrations"
ROLLBACK_DIR="./migrations/rollback"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查MySQL连接
check_connection() {
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        log_error "无法连接到MySQL数据库"
        exit 1
    fi
}

# 获取当前数据库版本
get_current_version() {
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" \
          -se "SELECT version FROM schema_migrations WHERE type='migration' ORDER BY executed_at DESC LIMIT 1;" 2>/dev/null || echo ""
}

# 获取所有已执行的迁移
get_executed_migrations() {
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" \
          -se "SELECT version FROM schema_migrations WHERE type='migration' ORDER BY version;" 2>/dev/null || echo ""
}

# 执行迁移文件
execute_migration() {
    local file=$1
    local version=$(basename "$file" | cut -d'_' -f1)

    log_info "执行迁移: $file"

    # 计算文件校验和
    checksum=$(md5sum "$file" | cut -d' ' -f1)

    # 记录开始时间
    start_time=$(date +%s%3N)

    # 执行迁移
    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" < "$file"; then
        # 记录结束时间
        end_time=$(date +%s%3N)
        execution_time=$((end_time - start_time))

        # 更新迁移记录
        mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" \
              -e "UPDATE schema_migrations SET checksum='$checksum', execution_time=$execution_time WHERE version='$version';"

        log_info "迁移 $version 执行成功 (耗时: ${execution_time}ms)"
        return 0
    else
        log_error "迁移 $version 执行失败"
        return 1
    fi
}

# 执行回滚文件
execute_rollback() {
    local file=$1
    local version=$(basename "$file" | cut -d'_' -f1 | sed 's/R/V/')

    log_warn "执行回滚: $file"

    if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" < "$file"; then
        log_info "回滚 $version 执行成功"
        return 0
    else
        log_error "回滚 $version 执行失败"
        return 1
    fi
}

# 迁移到最新版本
migrate_up() {
    log_info "开始数据库迁移..."

    check_connection

    # 获取已执行的迁移
    executed_migrations=$(get_executed_migrations)

    # 遍历迁移文件
    for file in $(ls "$MIGRATION_DIR"/V*.sql | sort -V); do
        version=$(basename "$file" | cut -d'_' -f1)

        # 检查是否已执行
        if echo "$executed_migrations" | grep -q "^$version$"; then
            log_info "跳过已执行的迁移: $version"
            continue
        fi

        # 执行迁移
        if ! execute_migration "$file"; then
            log_error "迁移失败，停止执行"
            exit 1
        fi
    done

    current_version=$(get_current_version)
    log_info "数据库迁移完成，当前版本: $current_version"
}

# 回滚到指定版本
migrate_down() {
    local target_version=$1

    if [ -z "$target_version" ]; then
        log_error "请指定目标版本"
        exit 1
    fi

    log_warn "开始回滚到版本: $target_version"

    check_connection

    current_version=$(get_current_version)
    log_info "当前版本: $current_version"

    # 获取需要回滚的版本列表
    versions_to_rollback=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" \
                          -se "SELECT version FROM schema_migrations WHERE type='migration' AND version > '$target_version' ORDER BY version DESC;")

    # 执行回滚
    for version in $versions_to_rollback; do
        rollback_version="R${version#V}"
        rollback_file="$ROLLBACK_DIR/${rollback_version}*.sql"

        if ls $rollback_file 1> /dev/null 2>&1; then
            rollback_file=$(ls $rollback_file | head -1)
            if ! execute_rollback "$rollback_file"; then
                log_error "回滚失败，停止执行"
                exit 1
            fi
        else
            log_warn "未找到版本 $version 的回滚脚本"
        fi
    done

    log_info "回滚完成"
}

# 显示迁移状态
show_status() {
    log_info "数据库迁移状态:"

    check_connection

    current_version=$(get_current_version)
    echo "当前版本: $current_version"
    echo ""

    echo "已执行的迁移:"
    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" \
          -e "SELECT version, description, executed_at, execution_time FROM schema_migrations WHERE type='migration' ORDER BY executed_at;"
}

# 主函数
main() {
    case "$1" in
        "up")
            migrate_up
            ;;
        "down")
            migrate_down "$2"
            ;;
        "status")
            show_status
            ;;
        *)
            echo "用法: $0 {up|down <version>|status}"
            echo "  up      - 迁移到最新版本"
            echo "  down    - 回滚到指定版本"
            echo "  status  - 显示迁移状态"
            exit 1
            ;;
    esac
}

main "$@"
```

## 迁移最佳实践

### 1. 迁移文件编写规范

```sql
-- 文件头部注释
-- V1.0.1__create_user_tables.sql
-- 创建用户相关表
-- 作者: 开发团队
-- 创建时间: 2024-01-15
-- 依赖版本: V1.0.0

USE campus_mall;

-- 开启事务（可选，根据需要）
START TRANSACTION;

-- 具体的DDL语句
CREATE TABLE users (
    -- 表结构定义
);

-- 提交事务
COMMIT;
```

### 2. 数据迁移注意事项

```sql
-- 大数据量迁移示例
-- 分批处理，避免长时间锁表

-- 方法1：使用LIMIT分批处理
UPDATE users SET status = 1 WHERE status IS NULL LIMIT 1000;

-- 方法2：使用临时表
CREATE TEMPORARY TABLE temp_user_updates AS
SELECT id FROM users WHERE status IS NULL LIMIT 1000;

UPDATE users u
JOIN temp_user_updates t ON u.id = t.id
SET u.status = 1;

DROP TEMPORARY TABLE temp_user_updates;
```

### 3. 索引创建策略

```sql
-- 在线添加索引（MySQL 5.6+）
ALTER TABLE users ADD INDEX idx_email (email), ALGORITHM=INPLACE, LOCK=NONE;

-- 对于大表，建议在业务低峰期执行
-- 可以使用pt-online-schema-change工具
```

### 4. 外键约束管理

```sql
-- 添加外键前检查数据完整性
SELECT COUNT(*) FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE u.id IS NULL;

-- 如果有孤立数据，先清理
DELETE FROM orders WHERE user_id NOT IN (SELECT id FROM users);

-- 然后添加外键
ALTER TABLE orders ADD CONSTRAINT fk_orders_user_id
FOREIGN KEY (user_id) REFERENCES users(id);
```

## 环境管理

### 开发环境迁移

```bash
# 开发环境快速重置
./migrate.sh down V1.0.0
./migrate.sh up

# 或者直接重建数据库
mysql -e "DROP DATABASE IF EXISTS campus_mall_dev;"
mysql -e "CREATE DATABASE campus_mall_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
./migrate.sh up
```

### 测试环境迁移

```bash
# 测试环境迁移前备份
mysqldump campus_mall_test > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

# 执行迁移
./migrate.sh up

# 验证迁移结果
./migrate.sh status
```

### 生产环境迁移

```bash
# 生产环境迁移流程
# 1. 备份数据库
mysqldump --single-transaction --routines --triggers campus_mall > backup_prod_$(date +%Y%m%d_%H%M%S).sql

# 2. 在从库先执行迁移测试
./migrate.sh up

# 3. 验证从库数据一致性
# 4. 主库维护窗口执行迁移
./migrate.sh up

# 5. 验证应用功能正常
```

## 故障处理

### 迁移失败处理

```bash
# 1. 查看错误日志
tail -f /var/log/mysql/error.log

# 2. 检查迁移状态
./migrate.sh status

# 3. 手动修复数据
mysql -u root -p campus_mall

# 4. 标记迁移为已完成（谨慎使用）
INSERT INTO schema_migrations (version, description, type, executed_by)
VALUES ('V1.0.X', 'Manual fix for failed migration', 'migration', 'admin');
```

### 回滚失败处理

```bash
# 1. 检查回滚脚本是否存在
ls migrations/rollback/R1.0.X*.sql

# 2. 手动执行回滚
mysql -u root -p campus_mall < migrations/rollback/R1.0.X__rollback_script.sql

# 3. 更新迁移记录
mysql -u root -p campus_mall -e "DELETE FROM schema_migrations WHERE version='V1.0.X';"
```

## 性能优化

### 迁移性能优化

```sql
-- 1. 临时禁用外键检查（谨慎使用）
SET FOREIGN_KEY_CHECKS = 0;
-- 执行迁移操作
SET FOREIGN_KEY_CHECKS = 1;

-- 2. 临时禁用二进制日志
SET sql_log_bin = 0;
-- 执行迁移操作
SET sql_log_bin = 1;

-- 3. 调整InnoDB参数
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
-- 执行迁移操作
SET GLOBAL innodb_flush_log_at_trx_commit = 1;
```

### 大表迁移策略

```sql
-- 1. 在线DDL（MySQL 5.6+）
ALTER TABLE large_table ADD COLUMN new_column INT, ALGORITHM=INPLACE, LOCK=NONE;

-- 2. 使用pt-online-schema-change
pt-online-schema-change --alter "ADD COLUMN new_column INT" D=campus_mall,t=large_table --execute

-- 3. 分区表迁移
ALTER TABLE large_table PARTITION BY RANGE (YEAR(created_at)) (
    PARTITION p2023 VALUES LESS THAN (2024),
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

## 监控和告警

### 迁移监控脚本

```bash
#!/bin/bash
# migration_monitor.sh - 迁移监控脚本

# 检查迁移状态
check_migration_status() {
    local expected_version="V1.0.8"
    local current_version=$(mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -D"$DB_NAME" \
                           -se "SELECT version FROM schema_migrations WHERE type='migration' ORDER BY executed_at DESC LIMIT 1;")

    if [ "$current_version" != "$expected_version" ]; then
        echo "WARNING: Database version mismatch. Expected: $expected_version, Current: $current_version"
        # 发送告警通知
        send_alert "Database migration version mismatch"
    fi
}

# 检查数据库连接
check_database_connection() {
    if ! mysql -h"$DB_HOST" -u"$DB_USER" -p"$DB_PASS" -e "SELECT 1;" > /dev/null 2>&1; then
        echo "ERROR: Cannot connect to database"
        send_alert "Database connection failed"
    fi
}

# 发送告警
send_alert() {
    local message="$1"
    # 这里可以集成钉钉、企业微信、邮件等告警方式
    echo "ALERT: $message" | mail -s "Database Migration Alert" admin@campus-mall.com
}

# 主函数
main() {
    check_database_connection
    check_migration_status
}

main "$@"
```

## 文档维护

### 迁移记录模板

```markdown
# 迁移记录 - V1.0.X

## 基本信息
- **版本号**: V1.0.X
- **描述**: 添加用户积分系统
- **执行人**: 张三
- **执行时间**: 2024-01-15 10:00:00
- **预计耗时**: 30分钟
- **实际耗时**: 25分钟

## 变更内容
- 新增用户积分表 (user_points)
- 新增积分变动记录表 (point_transactions)
- 修改用户表，添加总积分字段

## 影响评估
- **数据量**: 新增2个表，修改1个表
- **停机时间**: 无需停机
- **回滚风险**: 低风险，有完整回滚脚本

## 验证步骤
1. 检查表结构是否正确创建
2. 验证外键约束是否生效
3. 测试积分相关功能

## 回滚方案
- 回滚脚本: R1.0.X__remove_points_system.sql
- 回滚时间: 预计5分钟

## 注意事项
- 执行前需要备份数据库
- 建议在业务低峰期执行
```

## 总结

### 迁移流程总览

1. **规划阶段**
   - 分析需求变更
   - 设计数据库结构
   - 编写迁移脚本
   - 准备回滚方案

2. **测试阶段**
   - 开发环境测试
   - 测试环境验证
   - 性能影响评估
   - 回滚流程测试

3. **执行阶段**
   - 数据库备份
   - 执行迁移脚本
   - 验证迁移结果
   - 应用功能测试

4. **监控阶段**
   - 性能监控
   - 错误日志检查
   - 业务指标观察
   - 用户反馈收集

### 关键原则

1. **安全第一**: 始终备份，准备回滚方案
2. **渐进式迁移**: 分步骤执行，降低风险
3. **充分测试**: 多环境验证，确保稳定性
4. **文档完整**: 详细记录，便于维护
5. **监控告警**: 实时监控，及时发现问题

### 工具推荐

- **Flyway**: Java生态的数据库迁移工具
- **Liquibase**: 跨平台的数据库版本控制工具
- **pt-online-schema-change**: Percona的在线DDL工具
- **gh-ost**: GitHub开源的在线DDL工具

---

*文档版本: v1.0*
*最后更新: 2025年5月*
*维护人员: 数据库管理员*
