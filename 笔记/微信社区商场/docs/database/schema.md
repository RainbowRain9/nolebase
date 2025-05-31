# 数据库结构设计文档

## 概述

本文档详细描述了微信社区商场小程序的完整数据库结构设计，包括所有表结构、字段说明、索引设计、约束关系等。数据库采用MySQL 8.0，支持高并发访问和数据一致性。

## 数据库设计原则

1. **规范化设计**: 遵循第三范式，减少数据冗余
2. **性能优化**: 合理设计索引，优化查询性能
3. **扩展性**: 预留扩展字段，支持业务发展
4. **数据安全**: 敏感数据加密存储，完整的权限控制
5. **一致性**: 使用外键约束保证数据一致性

## 数据库配置

```sql
-- 数据库创建
CREATE DATABASE campus_mall
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- 基础配置
SET GLOBAL innodb_file_format = 'Barracuda';
SET GLOBAL innodb_file_per_table = ON;
SET GLOBAL innodb_large_prefix = ON;
```

## 用户相关表

### 1. 用户基础信息表 (users)

```sql
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_openid (openid),
    INDEX idx_phone (phone),
    INDEX idx_student_id (student_id),
    INDEX idx_role_status (role, status),
    INDEX idx_college_major (college, major),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户基础信息表';
```

### 2. 用户登录日志表 (user_login_logs)

```sql
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_login_result (login_result),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户登录日志表';
```

### 3. 用户关注关系表 (user_follows)

```sql
CREATE TABLE user_follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关系ID',
    follower_id BIGINT NOT NULL COMMENT '关注者ID',
    following_id BIGINT NOT NULL COMMENT '被关注者ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',

    -- 外键约束
    FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_follower_following (follower_id, following_id),

    -- 索引
    INDEX idx_follower_id (follower_id),
    INDEX idx_following_id (following_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户关注关系表';
```

## 论坛相关表

### 4. 论坛版块表 (forum_boards)

```sql
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_status_sort (status, sort_order),
    INDEX idx_post_count (post_count),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='论坛版块表';
```

### 5. 版块关注表 (board_follows)

```sql
CREATE TABLE board_follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关注ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    board_id INT NOT NULL COMMENT '版块ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES forum_boards(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_board (user_id, board_id),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_board_id (board_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='版块关注表';
```

### 6. 帖子表 (forum_posts)

```sql
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES forum_boards(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_author_id (author_id),
    INDEX idx_board_id (board_id),
    INDEX idx_status_created (status, created_at),
    INDEX idx_hot_score (hot_score),
    INDEX idx_is_top_hot (is_top, is_hot),
    INDEX idx_audit_status (audit_status),
    INDEX idx_created_at (created_at),

    -- 全文索引
    FULLTEXT INDEX ft_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子表';
```

### 7. 评论表 (forum_comments)

```sql
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES forum_comments(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_post_id (post_id),
    INDEX idx_author_id (author_id),
    INDEX idx_parent_id (parent_id),
    INDEX idx_status_created (status, created_at),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';
```

### 8. 帖子互动表 (post_interactions)

```sql
CREATE TABLE post_interactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '互动ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    post_id BIGINT NOT NULL COMMENT '帖子ID',
    interaction_type ENUM('like', 'collect', 'share') NOT NULL COMMENT '互动类型',
    platform VARCHAR(20) COMMENT '分享平台',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_post_type (user_id, post_id, interaction_type),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_post_id (post_id),
    INDEX idx_interaction_type (interaction_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子互动表';
```

### 9. 评论点赞表 (comment_likes)

```sql
CREATE TABLE comment_likes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '点赞ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    comment_id BIGINT NOT NULL COMMENT '评论ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '点赞时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES forum_comments(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_comment (user_id, comment_id),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论点赞表';
```

## 商城相关表

### 10. 商品分类表 (product_categories)

```sql
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

    -- 统计信息
    product_count INT DEFAULT 0 COMMENT '商品数量',

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (parent_id) REFERENCES product_categories(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_parent_id (parent_id),
    INDEX idx_status_sort (status, sort_order),
    INDEX idx_level (level),
    INDEX idx_product_count (product_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';
```

### 11. 商家信息表 (merchants)

```sql
CREATE TABLE merchants (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商家ID',
    user_id BIGINT NOT NULL COMMENT '关联用户ID',
    business_name VARCHAR(100) NOT NULL COMMENT '商家名称',
    business_type ENUM('individual', 'enterprise') NOT NULL COMMENT '商家类型',

    -- 证件信息
    business_license VARCHAR(255) COMMENT '营业执照',
    id_card VARCHAR(255) COMMENT '身份证',

    -- 联系信息
    contact_person VARCHAR(50) NOT NULL COMMENT '联系人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    contact_email VARCHAR(100) COMMENT '联系邮箱',
    business_address VARCHAR(255) NOT NULL COMMENT '经营地址',

    -- 经营信息
    business_scope TEXT COMMENT '经营范围',
    description TEXT COMMENT '商家介绍',
    avatar VARCHAR(255) COMMENT '商家头像',

    -- 银行信息
    bank_account JSON COMMENT '银行账户信息',

    -- 统计信息
    product_count INT DEFAULT 0 COMMENT '商品数量',
    order_count INT DEFAULT 0 COMMENT '订单数量',
    sales_amount DECIMAL(15,2) DEFAULT 0 COMMENT '销售金额',
    rating DECIMAL(3,2) DEFAULT 5.0 COMMENT '评分',
    review_count INT DEFAULT 0 COMMENT '评价数量',

    -- 状态信息
    status ENUM('pending', 'approved', 'rejected', 'suspended') DEFAULT 'pending' COMMENT '状态',
    verify_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '认证状态',

    -- 审核信息
    audit_reason VARCHAR(255) COMMENT '审核原因',
    audited_by BIGINT COMMENT '审核人ID',
    audited_at TIMESTAMP NULL COMMENT '审核时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_verify_status (verify_status),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商家信息表';
```

### 12. 商品表 (products)

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '商品ID',
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    description LONGTEXT COMMENT '商品描述',
    category_id INT NOT NULL COMMENT '分类ID',
    merchant_id BIGINT NOT NULL COMMENT '商家ID',

    -- 价格信息
    price DECIMAL(10,2) NOT NULL COMMENT '售价',
    original_price DECIMAL(10,2) COMMENT '原价',
    cost_price DECIMAL(10,2) COMMENT '成本价',

    -- 库存信息
    stock INT DEFAULT 0 COMMENT '库存数量',
    sold_count INT DEFAULT 0 COMMENT '销售数量',

    -- 商品图片
    images JSON COMMENT '商品图片列表',
    detail_images JSON COMMENT '详情图片列表',

    -- 商品规格
    specifications JSON COMMENT '规格参数',

    -- 商品标签
    tags JSON COMMENT '商品标签',

    -- 配送信息
    shipping_info JSON COMMENT '配送信息',

    -- 服务承诺
    services JSON COMMENT '服务承诺',

    -- 二手商品特有字段
    is_second_hand TINYINT DEFAULT 0 COMMENT '是否二手商品',
    condition_level ENUM('excellent', 'good', 'fair', 'poor') COMMENT '成色等级',
    purchase_date DATE COMMENT '购买日期',
    sell_reason VARCHAR(255) COMMENT '出售原因',

    -- 区域信息
    region_id INT COMMENT '区域ID',

    -- 统计信息
    view_count INT DEFAULT 0 COMMENT '浏览数',
    favorite_count INT DEFAULT 0 COMMENT '收藏数',
    rating DECIMAL(3,2) DEFAULT 5.0 COMMENT '评分',
    review_count INT DEFAULT 0 COMMENT '评价数',

    -- 状态信息
    status ENUM('draft', 'pending', 'approved', 'rejected', 'offline') DEFAULT 'pending' COMMENT '状态',

    -- 审核信息
    audit_reason VARCHAR(255) COMMENT '审核原因',
    audited_by BIGINT COMMENT '审核人ID',
    audited_at TIMESTAMP NULL COMMENT '审核时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_category_id (category_id),
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_sold_count (sold_count),
    INDEX idx_rating (rating),
    INDEX idx_is_second_hand (is_second_hand),
    INDEX idx_region_id (region_id),
    INDEX idx_created_at (created_at),

    -- 全文索引
    FULLTEXT INDEX ft_name_description (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';
```

### 13. 购物车表 (shopping_cart)

```sql
CREATE TABLE shopping_cart (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '购物车ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    quantity INT NOT NULL DEFAULT 1 COMMENT '数量',
    specifications VARCHAR(255) COMMENT '规格信息',
    is_selected TINYINT DEFAULT 1 COMMENT '是否选中',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '添加时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_product_spec (user_id, product_id, specifications),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';
```

### 14. 订单表 (orders)

```sql
CREATE TABLE orders (
    id VARCHAR(32) PRIMARY KEY COMMENT '订单ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    merchant_id BIGINT NOT NULL COMMENT '商家ID',

    -- 金额信息
    total_amount DECIMAL(10,2) NOT NULL COMMENT '商品总金额',
    discount_amount DECIMAL(10,2) DEFAULT 0 COMMENT '优惠金额',
    shipping_fee DECIMAL(10,2) DEFAULT 0 COMMENT '运费',
    final_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',

    -- 收货地址
    shipping_address JSON NOT NULL COMMENT '收货地址信息',

    -- 订单状态
    status ENUM('pending', 'paid', 'shipped', 'completed', 'cancelled', 'refunding', 'refunded')
           DEFAULT 'pending' COMMENT '订单状态',

    -- 支付信息
    payment_method VARCHAR(20) COMMENT '支付方式',
    payment_id VARCHAR(64) COMMENT '支付ID',
    paid_at TIMESTAMP NULL COMMENT '支付时间',

    -- 物流信息
    logistics_company VARCHAR(50) COMMENT '物流公司',
    tracking_number VARCHAR(100) COMMENT '物流单号',
    shipped_at TIMESTAMP NULL COMMENT '发货时间',
    delivered_at TIMESTAMP NULL COMMENT '收货时间',

    -- 订单备注
    remark TEXT COMMENT '订单备注',

    -- 取消信息
    cancel_reason VARCHAR(255) COMMENT '取消原因',
    cancelled_at TIMESTAMP NULL COMMENT '取消时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (merchant_id) REFERENCES merchants(id),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_status (status),
    INDEX idx_payment_id (payment_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';
```

### 15. 订单商品表 (order_items)

```sql
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '订单项ID',
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    product_name VARCHAR(200) NOT NULL COMMENT '商品名称',
    product_image VARCHAR(255) COMMENT '商品图片',
    specifications VARCHAR(255) COMMENT '规格信息',
    price DECIMAL(10,2) NOT NULL COMMENT '商品单价',
    quantity INT NOT NULL COMMENT '购买数量',
    total_amount DECIMAL(10,2) NOT NULL COMMENT '小计金额',

    -- 外键约束
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id),

    -- 索引
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品表';
```

### 16. 支付记录表 (payments)

```sql
CREATE TABLE payments (
    id VARCHAR(32) PRIMARY KEY COMMENT '支付ID',
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    payment_method VARCHAR(20) NOT NULL COMMENT '支付方式',
    amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',

    -- 第三方支付信息
    transaction_id VARCHAR(100) COMMENT '第三方交易号',
    payment_params JSON COMMENT '支付参数',

    -- 支付状态
    status ENUM('pending', 'success', 'failed', 'cancelled') DEFAULT 'pending' COMMENT '支付状态',

    -- 时间信息
    expire_time TIMESTAMP NOT NULL COMMENT '过期时间',
    paid_at TIMESTAMP NULL COMMENT '支付完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 外键约束
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id),

    -- 索引
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';
```

### 17. 退款申请表 (refunds)

```sql
CREATE TABLE refunds (
    id VARCHAR(32) PRIMARY KEY COMMENT '退款ID',
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    amount DECIMAL(10,2) NOT NULL COMMENT '退款金额',
    reason VARCHAR(255) NOT NULL COMMENT '退款原因',
    description TEXT COMMENT '详细说明',
    evidence JSON COMMENT '证据图片',

    -- 退款状态
    status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'pending' COMMENT '退款状态',

    -- 处理信息
    processed_by BIGINT COMMENT '处理人ID',
    process_reason VARCHAR(255) COMMENT '处理原因',
    processed_at TIMESTAMP NULL COMMENT '处理时间',

    -- 退款完成信息
    refund_transaction_id VARCHAR(100) COMMENT '退款交易号',
    refunded_at TIMESTAMP NULL COMMENT '退款完成时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (user_id) REFERENCES users(id),

    -- 索引
    INDEX idx_order_id (order_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款申请表';
```

### 18. 商品评价表 (product_reviews)

```sql
CREATE TABLE product_reviews (
    id VARCHAR(32) PRIMARY KEY COMMENT '评价ID',
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    rating TINYINT NOT NULL COMMENT '评分：1-5星',
    content TEXT NOT NULL COMMENT '评价内容',
    images JSON COMMENT '评价图片',
    tags JSON COMMENT '评价标签',
    specifications VARCHAR(255) COMMENT '规格信息',
    is_anonymous TINYINT DEFAULT 0 COMMENT '是否匿名',

    -- 有用性统计
    helpful_count INT DEFAULT 0 COMMENT '有用数',

    -- 商家回复
    merchant_reply TEXT COMMENT '商家回复',
    replied_at TIMESTAMP NULL COMMENT '回复时间',

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '评价时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id),

    -- 唯一约束
    UNIQUE KEY uk_order_product_user (order_id, product_id, user_id),

    -- 索引
    INDEX idx_product_id (product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_rating (rating),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品评价表';
```

### 19. 评价有用性投票表 (review_helpful)

```sql
CREATE TABLE review_helpful (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '投票ID',
    review_id VARCHAR(32) NOT NULL COMMENT '评价ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    is_helpful TINYINT NOT NULL COMMENT '是否有用：1-有用，0-无用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '投票时间',

    -- 外键约束
    FOREIGN KEY (review_id) REFERENCES product_reviews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_review_user (review_id, user_id),

    -- 索引
    INDEX idx_review_id (review_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价有用性投票表';
```

### 20. 商品收藏表 (product_favorites)

```sql
CREATE TABLE product_favorites (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '收藏ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    product_id BIGINT NOT NULL COMMENT '商品ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '收藏时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_product (user_id, product_id),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品收藏表';
```

### 21. 商家关注表 (merchant_follows)

```sql
CREATE TABLE merchant_follows (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '关注ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    merchant_id BIGINT NOT NULL COMMENT '商家ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关注时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_merchant (user_id, merchant_id),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商家关注表';
```

## 教务相关表

### 22. 课程表 (courses)

```sql
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

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-停开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_course_code (course_code),
    INDEX idx_department (department),
    INDEX idx_course_type (course_type),
    INDEX idx_semester (semester),
    INDEX idx_credits (credits)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';
```

### 23. 课程安排表 (course_schedules)

```sql
CREATE TABLE course_schedules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '排课ID',
    course_id VARCHAR(20) NOT NULL COMMENT '课程ID',
    teacher_id VARCHAR(20) NOT NULL COMMENT '教师工号',
    teacher_name VARCHAR(50) NOT NULL COMMENT '教师姓名',
    classroom VARCHAR(50) NOT NULL COMMENT '教室',
    week_day TINYINT NOT NULL COMMENT '星期几：1-7',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    start_week TINYINT NOT NULL COMMENT '开始周次',
    end_week TINYINT NOT NULL COMMENT '结束周次',
    weeks VARCHAR(50) COMMENT '上课周次',
    class_names JSON COMMENT '上课班级',
    semester VARCHAR(10) NOT NULL COMMENT '学期',

    -- 外键约束
    FOREIGN KEY (course_id) REFERENCES courses(id),

    -- 索引
    INDEX idx_course_id (course_id),
    INDEX idx_teacher_id (teacher_id),
    INDEX idx_classroom (classroom),
    INDEX idx_week_day_time (week_day, start_time),
    INDEX idx_semester (semester)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程安排表';
```

### 24. 学生成绩表 (student_grades)

```sql
CREATE TABLE student_grades (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '成绩ID',
    student_id VARCHAR(20) NOT NULL COMMENT '学号',
    course_id VARCHAR(20) NOT NULL COMMENT '课程ID',
    course_name VARCHAR(100) NOT NULL COMMENT '课程名称',
    course_code VARCHAR(20) NOT NULL COMMENT '课程代码',
    credits DECIMAL(3,1) NOT NULL COMMENT '学分',
    semester VARCHAR(10) NOT NULL COMMENT '学期',
    teacher_name VARCHAR(50) NOT NULL COMMENT '任课教师',

    -- 成绩信息
    attendance_score DECIMAL(5,2) COMMENT '考勤成绩',
    homework_score DECIMAL(5,2) COMMENT '作业成绩',
    midterm_score DECIMAL(5,2) COMMENT '期中成绩',
    final_score DECIMAL(5,2) COMMENT '期末成绩',
    total_score DECIMAL(5,2) NOT NULL COMMENT '总成绩',
    gpa DECIMAL(3,2) COMMENT '绩点',

    -- 排名信息
    class_rank INT COMMENT '班级排名',
    class_total INT COMMENT '班级总人数',
    major_rank INT COMMENT '专业排名',
    major_total INT COMMENT '专业总人数',

    -- 状态信息
    status ENUM('passed', 'failed', 'retake') NOT NULL COMMENT '成绩状态',
    exam_date DATE COMMENT '考试日期',
    publish_date DATE COMMENT '成绩发布日期',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '录入时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (student_id) REFERENCES users(student_id),
    FOREIGN KEY (course_id) REFERENCES courses(id),

    -- 唯一约束
    UNIQUE KEY uk_student_course_semester (student_id, course_id, semester),

    -- 索引
    INDEX idx_student_id (student_id),
    INDEX idx_course_id (course_id),
    INDEX idx_semester (semester),
    INDEX idx_total_score (total_score),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学生成绩表';
```

### 25. 考试安排表 (exams)

```sql
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

    -- 报名信息
    registration_deadline DATE COMMENT '报名截止日期',
    max_students INT COMMENT '最大人数',
    registered_count INT DEFAULT 0 COMMENT '已报名人数',

    -- 状态信息
    status ENUM('upcoming', 'ongoing', 'finished', 'cancelled') DEFAULT 'upcoming' COMMENT '考试状态',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (course_id) REFERENCES courses(id),

    -- 索引
    INDEX idx_course_id (course_id),
    INDEX idx_exam_date (exam_date),
    INDEX idx_classroom (classroom),
    INDEX idx_exam_type (exam_type),
    INDEX idx_semester (semester),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考试安排表';
```

### 26. 考试报名表 (exam_registrations)

```sql
CREATE TABLE exam_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '报名ID',
    exam_id BIGINT NOT NULL COMMENT '考试ID',
    student_id VARCHAR(20) NOT NULL COMMENT '学号',
    student_name VARCHAR(50) NOT NULL COMMENT '学生姓名',
    seat_number VARCHAR(10) COMMENT '座位号',
    registration_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',

    -- 外键约束
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES users(student_id),

    -- 唯一约束
    UNIQUE KEY uk_exam_student (exam_id, student_id),

    -- 索引
    INDEX idx_exam_id (exam_id),
    INDEX idx_student_id (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='考试报名表';
```

### 27. 教室信息表 (classrooms)

```sql
CREATE TABLE classrooms (
    id VARCHAR(20) PRIMARY KEY COMMENT '教室ID',
    name VARCHAR(50) NOT NULL COMMENT '教室名称',
    building VARCHAR(50) NOT NULL COMMENT '教学楼',
    floor TINYINT NOT NULL COMMENT '楼层',
    capacity INT NOT NULL COMMENT '容量',
    type ENUM('normal', 'multimedia', 'lab', 'conference') DEFAULT 'normal' COMMENT '教室类型',
    equipment JSON COMMENT '设备列表',
    features JSON COMMENT '特色功能',
    description TEXT COMMENT '教室描述',

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态：1-可用，0-维修',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_building (building),
    INDEX idx_capacity (capacity),
    INDEX idx_type (type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教室信息表';
```

### 28. 教室借用申请表 (classroom_bookings)

```sql
CREATE TABLE classroom_bookings (
    id VARCHAR(32) PRIMARY KEY COMMENT '申请ID',
    classroom_id VARCHAR(20) NOT NULL COMMENT '教室ID',
    applicant_id BIGINT NOT NULL COMMENT '申请人ID',
    applicant_name VARCHAR(50) NOT NULL COMMENT '申请人姓名',
    use_date DATE NOT NULL COMMENT '使用日期',
    start_time TIME NOT NULL COMMENT '开始时间',
    end_time TIME NOT NULL COMMENT '结束时间',
    purpose VARCHAR(100) NOT NULL COMMENT '使用目的',
    description TEXT NOT NULL COMMENT '活动描述',
    expected_attendees INT NOT NULL COMMENT '预计参与人数',
    contact_person VARCHAR(50) NOT NULL COMMENT '联系人',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    equipment_needs JSON COMMENT '设备需求',
    special_requirements TEXT COMMENT '特殊要求',

    -- 审核信息
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '申请状态',
    review_comment VARCHAR(255) COMMENT '审核意见',
    reviewed_by BIGINT COMMENT '审核人ID',
    reviewed_at TIMESTAMP NULL COMMENT '审核时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (classroom_id) REFERENCES classrooms(id),
    FOREIGN KEY (applicant_id) REFERENCES users(id),

    -- 索引
    INDEX idx_classroom_id (classroom_id),
    INDEX idx_applicant_id (applicant_id),
    INDEX idx_use_date (use_date),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教室借用申请表';
```

## 活动相关表

### 29. 校园活动表 (campus_activities)

```sql
CREATE TABLE campus_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '活动ID',
    title VARCHAR(200) NOT NULL COMMENT '活动标题',
    description LONGTEXT NOT NULL COMMENT '活动描述',
    organizer VARCHAR(100) NOT NULL COMMENT '主办方',
    organizer_contact VARCHAR(100) COMMENT '联系方式',

    -- 活动时间地点
    start_time TIMESTAMP NOT NULL COMMENT '开始时间',
    end_time TIMESTAMP NOT NULL COMMENT '结束时间',
    location VARCHAR(255) NOT NULL COMMENT '活动地点',

    -- 报名信息
    max_participants INT COMMENT '最大参与人数',
    registration_start TIMESTAMP COMMENT '报名开始时间',
    registration_end TIMESTAMP COMMENT '报名结束时间',
    registration_fee DECIMAL(8,2) DEFAULT 0 COMMENT '报名费用',

    -- 活动图片
    cover_image VARCHAR(255) COMMENT '封面图片',
    images JSON COMMENT '活动图片',

    -- 报名要求
    requirements TEXT COMMENT '报名要求',
    materials_needed JSON COMMENT '需要材料',

    -- 统计信息
    view_count INT DEFAULT 0 COMMENT '浏览数',
    registration_count INT DEFAULT 0 COMMENT '报名人数',

    -- 状态信息
    status ENUM('draft', 'pending', 'approved', 'rejected', 'published', 'cancelled', 'completed')
           DEFAULT 'draft' COMMENT '活动状态',

    -- 审核信息
    audit_reason VARCHAR(255) COMMENT '审核原因',
    audited_by BIGINT COMMENT '审核人ID',
    audited_at TIMESTAMP NULL COMMENT '审核时间',

    -- 发布信息
    publisher_id BIGINT NOT NULL COMMENT '发布者ID',
    published_at TIMESTAMP NULL COMMENT '发布时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (publisher_id) REFERENCES users(id),

    -- 索引
    INDEX idx_publisher_id (publisher_id),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time),
    INDEX idx_registration_end (registration_end),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='校园活动表';
```

### 30. 活动报名表 (activity_registrations)

```sql
CREATE TABLE activity_registrations (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '报名ID',
    activity_id BIGINT NOT NULL COMMENT '活动ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    user_name VARCHAR(50) NOT NULL COMMENT '用户姓名',
    user_phone VARCHAR(20) COMMENT '联系电话',
    user_email VARCHAR(100) COMMENT '邮箱',

    -- 报名信息
    registration_data JSON COMMENT '报名表单数据',
    materials JSON COMMENT '提交材料',

    -- 支付信息
    fee_amount DECIMAL(8,2) DEFAULT 0 COMMENT '费用金额',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid' COMMENT '支付状态',
    paid_at TIMESTAMP NULL COMMENT '支付时间',

    -- 签到信息
    check_in_status TINYINT DEFAULT 0 COMMENT '签到状态：0-未签到，1-已签到',
    check_in_time TIMESTAMP NULL COMMENT '签到时间',

    -- 状态信息
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending' COMMENT '报名状态',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '报名时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (activity_id) REFERENCES campus_activities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_activity_user (activity_id, user_id),

    -- 索引
    INDEX idx_activity_id (activity_id),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动报名表';
```

## 系统管理表

### 31. 管理员表 (admin_users)

```sql
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_username (username),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';
```

### 32. 角色表 (admin_roles)

```sql
CREATE TABLE admin_roles (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '角色ID',
    role_code VARCHAR(50) UNIQUE NOT NULL COMMENT '角色代码',
    role_name VARCHAR(100) NOT NULL COMMENT '角色名称',
    description TEXT COMMENT '角色描述',
    level INT DEFAULT 0 COMMENT '角色级别',
    status TINYINT DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 索引
    INDEX idx_role_code (role_code),
    INDEX idx_level (level),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';
```

### 33. 权限表 (admin_permissions)

```sql
CREATE TABLE admin_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '权限ID',
    permission_code VARCHAR(100) UNIQUE NOT NULL COMMENT '权限代码',
    permission_name VARCHAR(100) NOT NULL COMMENT '权限名称',
    module VARCHAR(50) NOT NULL COMMENT '所属模块',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    resource VARCHAR(100) COMMENT '资源标识',
    description TEXT COMMENT '权限描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 索引
    INDEX idx_permission_code (permission_code),
    INDEX idx_module (module),
    INDEX idx_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';
```

### 34. 管理员角色关联表 (admin_user_roles)

```sql
CREATE TABLE admin_user_roles (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    user_id INT NOT NULL COMMENT '管理员ID',
    role_id INT NOT NULL COMMENT '角色ID',
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '分配时间',
    assigned_by INT COMMENT '分配人ID',
    expires_at TIMESTAMP NULL COMMENT '过期时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_user_role (user_id, role_id),

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员角色关联表';
```

### 35. 角色权限关联表 (admin_role_permissions)

```sql
CREATE TABLE admin_role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '关联ID',
    role_id INT NOT NULL COMMENT '角色ID',
    permission_id INT NOT NULL COMMENT '权限ID',
    granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '授权时间',
    granted_by INT COMMENT '授权人ID',

    -- 外键约束
    FOREIGN KEY (role_id) REFERENCES admin_roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES admin_permissions(id) ON DELETE CASCADE,

    -- 唯一约束
    UNIQUE KEY uk_role_permission (role_id, permission_id),

    -- 索引
    INDEX idx_role_id (role_id),
    INDEX idx_permission_id (permission_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限关联表';
```

### 36. 管理员操作日志表 (admin_operation_logs)

```sql
CREATE TABLE admin_operation_logs (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    admin_id INT NOT NULL COMMENT '管理员ID',
    module VARCHAR(50) NOT NULL COMMENT '操作模块',
    action VARCHAR(50) NOT NULL COMMENT '操作动作',
    resource_type VARCHAR(50) COMMENT '资源类型',
    resource_id VARCHAR(100) COMMENT '资源ID',
    description TEXT COMMENT '操作描述',
    request_data JSON COMMENT '请求数据',
    response_data JSON COMMENT '响应数据',
    ip_address VARCHAR(45) COMMENT 'IP地址',
    user_agent TEXT COMMENT '用户代理',
    status TINYINT DEFAULT 1 COMMENT '操作结果：1-成功，0-失败',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',

    -- 外键约束
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_admin_id (admin_id),
    INDEX idx_module_action (module, action),
    INDEX idx_resource_type_id (resource_type, resource_id),
    INDEX idx_created_at (created_at),
    INDEX idx_ip_address (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作日志表';
```

## 举报相关表

### 37. 举报记录表 (reports)

```sql
CREATE TABLE reports (
    id VARCHAR(32) PRIMARY KEY COMMENT '举报ID',
    reporter_id BIGINT NOT NULL COMMENT '举报人ID',
    target_type ENUM('post', 'comment', 'user', 'product') NOT NULL COMMENT '举报对象类型',
    target_id VARCHAR(32) NOT NULL COMMENT '举报对象ID',
    reason ENUM('spam', 'inappropriate', 'harassment', 'fake', 'other') NOT NULL COMMENT '举报原因',
    description TEXT COMMENT '详细描述',
    evidence JSON COMMENT '证据材料',

    -- 处理信息
    status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending' COMMENT '处理状态',
    processor_id INT COMMENT '处理人ID',
    process_result VARCHAR(255) COMMENT '处理结果',
    process_reason VARCHAR(255) COMMENT '处理原因',
    processed_at TIMESTAMP NULL COMMENT '处理时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '举报时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 外键约束
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_target_type_id (target_type, target_id),
    INDEX idx_status (status),
    INDEX idx_processor_id (processor_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='举报记录表';
```

## 消息通知表

### 38. 消息通知表 (notifications)

```sql
CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '通知ID',
    user_id BIGINT NOT NULL COMMENT '接收用户ID',
    type ENUM('like', 'comment', 'reply', 'follow', 'system', 'order', 'activity') NOT NULL COMMENT '通知类型',
    title VARCHAR(200) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',

    -- 关联信息
    target_type VARCHAR(50) COMMENT '目标类型',
    target_id VARCHAR(32) COMMENT '目标ID',
    sender_id BIGINT COMMENT '发送者ID',
    sender_avatar VARCHAR(255) COMMENT '发送者头像',

    -- 状态信息
    is_read TINYINT DEFAULT 0 COMMENT '是否已读：0-未读，1-已读',
    read_at TIMESTAMP NULL COMMENT '阅读时间',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    INDEX idx_target_type_id (target_type, target_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='消息通知表';
```

## 统计数据表

### 39. 用户统计表 (user_statistics)

```sql
CREATE TABLE user_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    total_users INT DEFAULT 0 COMMENT '总用户数',
    new_users INT DEFAULT 0 COMMENT '新增用户数',
    active_users INT DEFAULT 0 COMMENT '活跃用户数',
    student_count INT DEFAULT 0 COMMENT '学生数量',
    teacher_count INT DEFAULT 0 COMMENT '教师数量',
    merchant_count INT DEFAULT 0 COMMENT '商家数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 唯一约束
    UNIQUE KEY uk_stat_date (stat_date),

    -- 索引
    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户统计表';
```

### 40. 内容统计表 (content_statistics)

```sql
CREATE TABLE content_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    total_posts INT DEFAULT 0 COMMENT '总帖子数',
    new_posts INT DEFAULT 0 COMMENT '新增帖子数',
    total_comments INT DEFAULT 0 COMMENT '总评论数',
    new_comments INT DEFAULT 0 COMMENT '新增评论数',
    pending_audit INT DEFAULT 0 COMMENT '待审核内容数',
    reported_content INT DEFAULT 0 COMMENT '被举报内容数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 唯一约束
    UNIQUE KEY uk_stat_date (stat_date),

    -- 索引
    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容统计表';
```

### 41. 交易统计表 (transaction_statistics)

```sql
CREATE TABLE transaction_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '统计ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    total_orders INT DEFAULT 0 COMMENT '总订单数',
    completed_orders INT DEFAULT 0 COMMENT '完成订单数',
    total_amount DECIMAL(15,2) DEFAULT 0 COMMENT '总交易金额',
    refund_amount DECIMAL(15,2) DEFAULT 0 COMMENT '退款金额',
    new_merchants INT DEFAULT 0 COMMENT '新增商家数',
    active_merchants INT DEFAULT 0 COMMENT '活跃商家数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

    -- 唯一约束
    UNIQUE KEY uk_stat_date (stat_date),

    -- 索引
    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易统计表';
```

## 系统配置表

### 42. 系统配置表 (system_configs)

```sql
CREATE TABLE system_configs (
    id INT PRIMARY KEY AUTO_INCREMENT COMMENT '配置ID',
    config_key VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string' COMMENT '配置类型',
    category VARCHAR(50) NOT NULL COMMENT '配置分类',
    description VARCHAR(255) COMMENT '配置描述',
    is_public TINYINT DEFAULT 0 COMMENT '是否公开：0-私有，1-公开',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',

    -- 索引
    INDEX idx_config_key (config_key),
    INDEX idx_category (category),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';
```

### 43. 文件上传记录表 (file_uploads)

```sql
CREATE TABLE file_uploads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '文件ID',
    user_id BIGINT COMMENT '上传用户ID',
    original_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
    file_name VARCHAR(255) NOT NULL COMMENT '存储文件名',
    file_path VARCHAR(500) NOT NULL COMMENT '文件路径',
    file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
    file_type VARCHAR(100) NOT NULL COMMENT '文件类型',
    mime_type VARCHAR(100) NOT NULL COMMENT 'MIME类型',
    file_hash VARCHAR(64) COMMENT '文件哈希值',

    -- 使用信息
    usage_type ENUM('avatar', 'post_image', 'product_image', 'document', 'other') NOT NULL COMMENT '使用类型',
    reference_id VARCHAR(32) COMMENT '关联对象ID',

    -- 状态信息
    status TINYINT DEFAULT 1 COMMENT '状态：1-正常，0-删除',

    -- 时间信息
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',

    -- 外键约束
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,

    -- 索引
    INDEX idx_user_id (user_id),
    INDEX idx_file_hash (file_hash),
    INDEX idx_usage_type (usage_type),
    INDEX idx_reference_id (reference_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件上传记录表';
```

## 索引优化建议

### 复合索引设计

```sql
-- 用户表复合索引
ALTER TABLE users ADD INDEX idx_role_status_created (role, status, created_at);
ALTER TABLE users ADD INDEX idx_college_major_grade (college, major, grade);

-- 帖子表复合索引
ALTER TABLE forum_posts ADD INDEX idx_board_status_hot (board_id, status, is_hot, hot_score);
ALTER TABLE forum_posts ADD INDEX idx_author_status_created (author_id, status, created_at);

-- 商品表复合索引
ALTER TABLE products ADD INDEX idx_category_status_price (category_id, status, price);
ALTER TABLE products ADD INDEX idx_merchant_status_created (merchant_id, status, created_at);

-- 订单表复合索引
ALTER TABLE orders ADD INDEX idx_user_status_created (user_id, status, created_at);
ALTER TABLE orders ADD INDEX idx_merchant_status_created (merchant_id, status, created_at);

-- 成绩表复合索引
ALTER TABLE student_grades ADD INDEX idx_student_semester_score (student_id, semester, total_score);
```

### 分区表建议

```sql
-- 日志表按月分区
ALTER TABLE user_login_logs PARTITION BY RANGE (YEAR(created_at)*100 + MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    -- 继续添加分区...
    PARTITION p_future VALUES LESS THAN MAXVALUE
);

-- 操作日志表按月分区
ALTER TABLE admin_operation_logs PARTITION BY RANGE (YEAR(created_at)*100 + MONTH(created_at)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    -- 继续添加分区...
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

## 数据库维护

### 定期维护任务

```sql
-- 1. 统计信息更新（每日执行）
ANALYZE TABLE users, forum_posts, products, orders;

-- 2. 索引优化（每周执行）
OPTIMIZE TABLE users, forum_posts, products, orders;

-- 3. 清理过期数据（每月执行）
DELETE FROM user_login_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
DELETE FROM admin_operation_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH) AND is_read = 1;

-- 4. 更新统计计数（每日执行）
UPDATE forum_boards SET
    post_count = (SELECT COUNT(*) FROM forum_posts WHERE board_id = forum_boards.id AND status = 1),
    today_post_count = (SELECT COUNT(*) FROM forum_posts WHERE board_id = forum_boards.id AND status = 1 AND DATE(created_at) = CURDATE());

UPDATE users SET
    post_count = (SELECT COUNT(*) FROM forum_posts WHERE author_id = users.id AND status = 1),
    like_count = (SELECT COUNT(*) FROM post_interactions WHERE user_id = users.id AND interaction_type = 'like');
```

### 备份策略

```bash
# 全量备份（每日凌晨执行）
mysqldump --single-transaction --routines --triggers --all-databases > backup_$(date +%Y%m%d).sql

# 增量备份（每小时执行）
mysqlbinlog --start-datetime="$(date -d '1 hour ago' '+%Y-%m-%d %H:00:00')" /var/log/mysql/mysql-bin.* > incremental_$(date +%Y%m%d_%H).sql

# 备份保留策略
# - 全量备份保留30天
# - 增量备份保留7天
# - 月度备份永久保留
```

### 监控指标

```sql
-- 1. 数据库连接数监控
SHOW STATUS LIKE 'Threads_connected';
SHOW STATUS LIKE 'Max_used_connections';

-- 2. 查询性能监控
SELECT * FROM performance_schema.events_statements_summary_by_digest
ORDER BY avg_timer_wait DESC LIMIT 10;

-- 3. 表空间使用监控
SELECT
    table_schema,
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'campus_mall'
ORDER BY (data_length + index_length) DESC;

-- 4. 慢查询监控
SELECT * FROM mysql.slow_log ORDER BY start_time DESC LIMIT 10;
```

## 性能优化建议

### 查询优化

1. **避免SELECT ***：明确指定需要的字段
2. **合理使用LIMIT**：分页查询时使用适当的LIMIT
3. **优化JOIN查询**：确保JOIN条件有索引支持
4. **使用EXISTS替代IN**：在子查询中使用EXISTS性能更好
5. **避免在WHERE子句中使用函数**：会导致索引失效

### 索引优化

1. **复合索引顺序**：将选择性高的字段放在前面
2. **覆盖索引**：让索引包含查询所需的所有字段
3. **前缀索引**：对于长字符串字段使用前缀索引
4. **删除无用索引**：定期检查并删除未使用的索引

### 配置优化

```ini
# MySQL配置优化建议
[mysqld]
# 内存配置
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
query_cache_size = 128M

# 连接配置
max_connections = 1000
max_connect_errors = 10000
wait_timeout = 28800

# InnoDB配置
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_thread_concurrency = 8

# 查询缓存
query_cache_type = 1
query_cache_limit = 2M

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2
```

## 数据安全

### 敏感数据加密

```sql
-- 用户密码加密存储
-- 使用bcrypt或Argon2算法，不在数据库层面加密

-- 身份证号加密存储
-- 使用AES加密，密钥管理在应用层

-- 手机号脱敏显示
SELECT
    id,
    CONCAT(LEFT(phone, 3), '****', RIGHT(phone, 4)) AS masked_phone
FROM users;
```

### 权限控制

```sql
-- 创建应用专用数据库用户
CREATE USER 'campus_mall_app'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON campus_mall.* TO 'campus_mall_app'@'%';

-- 创建只读用户（用于报表查询）
CREATE USER 'campus_mall_readonly'@'%' IDENTIFIED BY 'readonly_password';
GRANT SELECT ON campus_mall.* TO 'campus_mall_readonly'@'%';

-- 创建备份用户
CREATE USER 'campus_mall_backup'@'localhost' IDENTIFIED BY 'backup_password';
GRANT SELECT, LOCK TABLES, SHOW VIEW, EVENT, TRIGGER ON campus_mall.* TO 'campus_mall_backup'@'localhost';
```

## 数据字典总结

### 表统计信息

| 模块 | 表数量 | 主要功能 |
|------|--------|----------|
| 用户管理 | 3 | 用户信息、登录日志、关注关系 |
| 论坛系统 | 6 | 版块、帖子、评论、互动 |
| 商城系统 | 12 | 商品、订单、支付、评价 |
| 教务系统 | 7 | 课程、成绩、考试、教室 |
| 活动系统 | 2 | 校园活动、报名管理 |
| 系统管理 | 6 | 管理员、权限、日志 |
| 其他系统 | 7 | 举报、通知、统计、配置 |
| **总计** | **43** | **完整的校园社区商场系统** |

### 关键设计特点

1. **统一的ID设计**：用户使用BIGINT自增ID，订单等使用VARCHAR(32)字符串ID
2. **完整的审核流程**：内容发布、商家入驻、活动申请都有审核机制
3. **丰富的统计信息**：各种计数字段支持实时统计展示
4. **灵活的JSON字段**：使用JSON存储复杂的结构化数据
5. **完善的索引设计**：针对查询场景设计了合理的索引
6. **数据一致性保证**：使用外键约束和唯一约束保证数据完整性
7. **扩展性考虑**：预留了扩展字段和灵活的枚举值

### 存储空间估算

基于10万用户规模的存储空间估算：

| 表名 | 预估记录数 | 单条记录大小 | 预估空间 |
|------|------------|--------------|----------|
| users | 100,000 | 2KB | 200MB |
| forum_posts | 500,000 | 5KB | 2.5GB |
| forum_comments | 2,000,000 | 1KB | 2GB |
| products | 50,000 | 3KB | 150MB |
| orders | 200,000 | 2KB | 400MB |
| 其他表 | - | - | 1GB |
| **总计** | - | - | **约6.25GB** |

---

*文档版本: v1.0*
*最后更新: 2025年5月*
*维护人员: 数据库管理员*
