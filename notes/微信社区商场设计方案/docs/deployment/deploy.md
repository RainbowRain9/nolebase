# 部署流程文档

## 概述

本文档详细描述了微信社区商场小程序的完整部署流程，包括开发环境、测试环境、生产环境的部署步骤、配置管理、监控告警等内容。

**部署架构**:
- **主要方案**: 微信小程序云开发一键部署
- **传统方案**: 服务器部署 (仅供参考)
- **推荐使用**: 云开发方案，简化部署流程

## 部署架构

### 系统架构图

```text
                    ┌─────────────────┐
                    │   微信小程序     │
                    │   (前端应用)     │
                    └─────────┬───────┘
                              │ HTTPS
                              ▼
                    ┌─────────────────┐
                    │   Nginx 反向代理 │
                    │   (负载均衡)     │
                    └─────────┬───────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Spring Boot    │
                    │   (后端服务)     │
                    └─────────┬───────┘
                              │
                    ┌─────────┼───────┐
                    ▼         ▼       ▼
            ┌─────────────┐ ┌─────┐ ┌─────────┐
            │   MySQL     │ │Redis│ │  文件存储 │
            │  (主数据库)  │ │缓存 │ │  (OSS)   │
            └─────────────┘ └─────┘ └─────────┘
```

### 环境规划

| 环境 | 域名 | 服务器配置 | 数据库 | 用途 |
|------|------|------------|--------|------|
| 开发环境 | dev.campus-mall.com | 2C4G | 单机MySQL | 日常开发测试 |
| 测试环境 | test.campus-mall.com | 4C8G | 单机MySQL | 功能测试、集成测试 |
| 预发环境 | pre.campus-mall.com | 4C8G | 主从MySQL | 上线前验证 |
| 生产环境 | api.campus-mall.com | 8C16G | 主从MySQL | 正式服务 |

## 开发环境部署

### 1. 本地开发环境

#### 后端服务部署

```bash
# 1. 克隆项目代码
git clone https://github.com/your-org/campus-mall-backend.git
cd campus-mall-backend

# 2. 配置开发环境
cp src/main/resources/application-dev.yml.example src/main/resources/application-dev.yml

# 编辑配置文件
vim src/main/resources/application-dev.yml
```

```yaml
# application-dev.yml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  profiles:
    active: dev

  # 数据库配置
  datasource:
    url: jdbc:mysql://localhost:3306/campus_mall?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: campus_mall_app
    password: ${DB_PASSWORD:your_password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  # Redis 配置
  redis:
    host: localhost
    port: 6379
    password: ${REDIS_PASSWORD:your_redis_password}
    timeout: 3000
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0

  # JPA 配置
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQL8Dialect

# 微信小程序配置
wechat:
  miniapp:
    appid: ${WECHAT_APP_ID:your_app_id}
    secret: ${WECHAT_APP_SECRET:your_app_secret}

# 日志配置
logging:
  level:
    com.campusmall: DEBUG
    org.springframework.web: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
```

#### 启动开发服务

```bash
# 方法1: 使用 Maven 启动
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 方法2: 使用 IDE 启动
# 在 IntelliJ IDEA 或 Eclipse 中直接运行 Application.java

# 方法3: 打包后启动
mvn clean package -DskipTests
java -jar target/campus-mall-backend-1.0.0.jar --spring.profiles.active=dev

# 验证服务启动
curl http://localhost:8080/api/actuator/health
```

#### 前端项目配置

```bash
# 1. 打开微信开发者工具
# 2. 导入小程序项目
# 3. 配置开发环境 API 地址

# 编辑 config/config.js
const config = {
  development: {
    baseUrl: 'http://localhost:8080/api',
    uploadUrl: 'http://localhost:8080/api/upload',
    wsUrl: 'ws://localhost:8080/ws'
  }
}

module.exports = config
```

### 2. Docker 容器化部署

#### 创建 Dockerfile

```dockerfile
# Dockerfile
FROM openjdk:11-jre-slim

# 设置工作目录
WORKDIR /app

# 复制 jar 文件
COPY target/campus-mall-backend-*.jar app.jar

# 设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

# 暴露端口
EXPOSE 8080

# 启动命令
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

#### 创建 docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 后端服务
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - DB_HOST=mysql
      - DB_PASSWORD=campus_mall_2024
      - REDIS_HOST=redis
      - REDIS_PASSWORD=redis_2024
    depends_on:
      - mysql
      - redis
    networks:
      - campus-mall-network

  # MySQL 数据库
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root_password_2024
      - MYSQL_DATABASE=campus_mall
      - MYSQL_USER=campus_mall_app
      - MYSQL_PASSWORD=campus_mall_2024
    volumes:
      - mysql_data:/var/lib/mysql
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - campus-mall-network

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --requirepass redis_2024
    volumes:
      - redis_data:/data
    networks:
      - campus-mall-network

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - campus-mall-network

volumes:
  mysql_data:
  redis_data:

networks:
  campus-mall-network:
    driver: bridge
```

#### 启动容器化环境

```bash
# 1. 构建并启动所有服务
docker-compose up -d

# 2. 查看服务状态
docker-compose ps

# 3. 查看日志
docker-compose logs -f backend

# 4. 停止服务
docker-compose down

# 5. 重新构建并启动
docker-compose up -d --build
```

## 测试环境部署

### 1. 服务器准备

#### 系统环境配置

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装基础软件
sudo apt install -y curl wget git vim htop

# 3. 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 4. 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. 验证安装
docker --version
docker-compose --version
```

#### 创建部署目录

```bash
# 创建项目目录
sudo mkdir -p /opt/campus-mall
sudo chown $USER:$USER /opt/campus-mall
cd /opt/campus-mall

# 创建子目录
mkdir -p {backend,nginx,scripts,logs,data}
```

### 2. 配置管理

#### 环境变量配置

```bash
# 创建环境变量文件
cat > .env.test << EOF
# 应用配置
SPRING_PROFILES_ACTIVE=test
SERVER_PORT=8080

# 数据库配置
DB_HOST=mysql
DB_PORT=3306
DB_NAME=campus_mall
DB_USER=campus_mall_app
DB_PASSWORD=test_db_password_2024

# Redis 配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=test_redis_password_2024

# 微信配置
WECHAT_APP_ID=your_test_app_id
WECHAT_APP_SECRET=your_test_app_secret

# 文件上传配置
UPLOAD_PATH=/opt/campus-mall/data/uploads
MAX_FILE_SIZE=10MB

# 日志配置
LOG_LEVEL=INFO
LOG_PATH=/opt/campus-mall/logs
EOF
```

#### Nginx 配置

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # 基础配置
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # 上游服务器
    upstream backend {
        server backend:8080;
        keepalive 32;
    }

    # HTTP 服务器配置
    server {
        listen 80;
        server_name test.campus-mall.com;

        # 重定向到 HTTPS
        return 301 https://$server_name$request_uri;
    }

    # HTTPS 服务器配置
    server {
        listen 443 ssl http2;
        server_name test.campus-mall.com;

        # SSL 证书配置
        ssl_certificate /etc/nginx/ssl/test.campus-mall.com.crt;
        ssl_certificate_key /etc/nginx/ssl/test.campus-mall.com.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;

        # API 代理
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        # WebSocket 代理
        location /ws/ {
            proxy_pass http://backend/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # 静态文件
        location /uploads/ {
            alias /opt/campus-mall/data/uploads/;
            expires 30d;
            add_header Cache-Control "public, immutable";
        }

        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### 3. 自动化部署脚本

#### 创建部署脚本

```bash
#!/bin/bash
# deploy-test.sh - 测试环境部署脚本

set -e

# 配置变量
PROJECT_DIR="/opt/campus-mall"
BACKUP_DIR="/opt/campus-mall/backups"
LOG_FILE="/opt/campus-mall/logs/deploy.log"
BRANCH="develop"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 创建备份
backup_current() {
    log "创建当前版本备份..."
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p $BACKUP_DIR/$BACKUP_NAME

    # 备份数据库
    docker exec campus-mall_mysql_1 mysqldump -u root -p$MYSQL_ROOT_PASSWORD campus_mall > $BACKUP_DIR/$BACKUP_NAME/database.sql

    # 备份应用文件
    cp -r $PROJECT_DIR/backend $BACKUP_DIR/$BACKUP_NAME/

    log "备份完成: $BACKUP_NAME"
}

# 拉取最新代码
pull_code() {
    log "拉取最新代码..."
    cd $PROJECT_DIR
    git fetch origin
    git checkout $BRANCH
    git pull origin $BRANCH

    # 显示当前版本信息
    COMMIT_HASH=$(git rev-parse --short HEAD)
    COMMIT_MSG=$(git log -1 --pretty=format:"%s")
    log "当前版本: $COMMIT_HASH - $COMMIT_MSG"
}

# 构建应用
build_app() {
    log "构建应用..."
    cd $PROJECT_DIR/backend

    # Maven 构建
    mvn clean package -DskipTests -Dmaven.test.skip=true

    if [ $? -eq 0 ]; then
        log "构建成功"
    else
        log "构建失败，退出部署"
        exit 1
    fi
}

# 部署应用
deploy_app() {
    log "部署应用..."
    cd $PROJECT_DIR

    # 停止现有服务
    docker-compose down

    # 启动新服务
    docker-compose up -d --build

    # 等待服务启动
    sleep 30

    # 健康检查
    health_check
}

# 健康检查
health_check() {
    log "执行健康检查..."

    for i in {1..10}; do
        if curl -f http://localhost:8080/api/actuator/health > /dev/null 2>&1; then
            log "健康检查通过"
            return 0
        fi
        log "健康检查失败，等待重试... ($i/10)"
        sleep 10
    done

    log "健康检查失败，部署失败"
    exit 1
}

# 发送通知
send_notification() {
    local status=$1
    local message="测试环境部署$status - $(date '+%Y-%m-%d %H:%M:%S')"

    # 这里可以集成钉钉、企业微信等通知方式
    log "发送通知: $message"
}

# 主函数
main() {
    log "开始部署测试环境..."

    backup_current
    pull_code
    build_app
    deploy_app

    log "部署完成"
    send_notification "成功"
}

# 错误处理
trap 'log "部署失败"; send_notification "失败"; exit 1' ERR

# 执行部署
main "$@"
```

#### 设置定时部署

```bash
# 添加到 crontab
crontab -e

# 每天凌晨 2 点自动部署
0 2 * * * /opt/campus-mall/scripts/deploy-test.sh >> /opt/campus-mall/logs/cron.log 2>&1
```

## 生产环境部署

### 1. 高可用架构

#### 负载均衡配置

```nginx
# nginx/nginx-prod.conf
upstream backend_cluster {
    # 后端服务集群
    server backend1:8080 weight=3 max_fails=3 fail_timeout=30s;
    server backend2:8080 weight=3 max_fails=3 fail_timeout=30s;
    server backend3:8080 weight=2 max_fails=3 fail_timeout=30s backup;

    # 会话保持
    ip_hash;

    # 健康检查
    keepalive 32;
}

server {
    listen 443 ssl http2;
    server_name api.campus-mall.com;

    # SSL 配置
    ssl_certificate /etc/nginx/ssl/api.campus-mall.com.crt;
    ssl_certificate_key /etc/nginx/ssl/api.campus-mall.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # API 代理
    location /api/ {
        proxy_pass http://backend_cluster/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置
        proxy_connect_timeout 5s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # 缓存配置
        proxy_cache api_cache;
        proxy_cache_valid 200 302 10m;
        proxy_cache_valid 404 1m;
        proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    }
}
```

#### 数据库主从配置

```yaml
# docker-compose-prod.yml
version: '3.8'

services:
  # MySQL 主库
  mysql-master:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=campus_mall
      - MYSQL_USER=campus_mall_app
      - MYSQL_PASSWORD=${DB_PASSWORD}
    volumes:
      - mysql_master_data:/var/lib/mysql
      - ./mysql/master.cnf:/etc/mysql/conf.d/master.cnf
    ports:
      - "3306:3306"
    networks:
      - campus-mall-network

  # MySQL 从库
  mysql-slave:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=campus_mall
      - MYSQL_USER=campus_mall_readonly
      - MYSQL_PASSWORD=${DB_READONLY_PASSWORD}
    volumes:
      - mysql_slave_data:/var/lib/mysql
      - ./mysql/slave.cnf:/etc/mysql/conf.d/slave.cnf
    ports:
      - "3307:3306"
    depends_on:
      - mysql-master
    networks:
      - campus-mall-network

  # Redis 集群
  redis-master:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_master_data:/data
    ports:
      - "6379:6379"
    networks:
      - campus-mall-network

  redis-slave:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --slaveof redis-master 6379 --masterauth ${REDIS_PASSWORD}
    volumes:
      - redis_slave_data:/data
    depends_on:
      - redis-master
    networks:
      - campus-mall-network

volumes:
  mysql_master_data:
  mysql_slave_data:
  redis_master_data:
  redis_slave_data:

networks:
  campus-mall-network:
    driver: bridge
```

### 2. 生产环境配置

#### 应用配置文件

```yaml
# application-prod.yml
server:
  port: 8080
  tomcat:
    max-threads: 200
    min-spare-threads: 10
    connection-timeout: 20000
    max-connections: 8192

spring:
  profiles:
    active: prod

  # 数据源配置
  datasource:
    # 主库（写）
    master:
      url: jdbc:mysql://mysql-master:3306/campus_mall?useUnicode=true&characterEncoding=utf8&useSSL=true&serverTimezone=Asia/Shanghai
      username: campus_mall_app
      password: ${DB_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        maximum-pool-size: 20
        minimum-idle: 5
        connection-timeout: 30000
        idle-timeout: 600000
        max-lifetime: 1800000
        leak-detection-threshold: 60000

    # 从库（读）
    slave:
      url: jdbc:mysql://mysql-slave:3306/campus_mall?useUnicode=true&characterEncoding=utf8&useSSL=true&serverTimezone=Asia/Shanghai
      username: campus_mall_readonly
      password: ${DB_READONLY_PASSWORD}
      driver-class-name: com.mysql.cj.jdbc.Driver
      hikari:
        maximum-pool-size: 15
        minimum-idle: 3

  # Redis 配置
  redis:
    cluster:
      nodes:
        - redis-master:6379
        - redis-slave:6379
    password: ${REDIS_PASSWORD}
    timeout: 3000
    lettuce:
      pool:
        max-active: 16
        max-idle: 8
        min-idle: 2

  # JPA 配置
  jpa:
    hibernate:
      ddl-auto: none
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        jdbc:
          batch_size: 50
        order_inserts: true
        order_updates: true

# 监控配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when-authorized
  metrics:
    export:
      prometheus:
        enabled: true

# 日志配置
logging:
  level:
    root: INFO
    com.campusmall: INFO
    org.springframework.security: WARN
  pattern:
    file: "%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n"
  file:
    name: /opt/campus-mall/logs/application.log
  logback:
    rollingpolicy:
      max-file-size: 100MB
      max-history: 30
      total-size-cap: 3GB
```

### 3. 蓝绿部署

#### 蓝绿部署脚本

```bash
#!/bin/bash
# blue-green-deploy.sh - 蓝绿部署脚本

set -e

# 配置变量
BLUE_PORT=8080
GREEN_PORT=8081
NGINX_CONFIG="/etc/nginx/sites-available/campus-mall"
HEALTH_CHECK_URL="http://localhost"

# 获取当前活跃环境
get_active_env() {
    if grep -q ":$BLUE_PORT" $NGINX_CONFIG; then
        echo "blue"
    else
        echo "green"
    fi
}

# 获取待部署环境
get_target_env() {
    local active=$(get_active_env)
    if [ "$active" = "blue" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# 部署到目标环境
deploy_to_target() {
    local target_env=$1
    local target_port

    if [ "$target_env" = "blue" ]; then
        target_port=$BLUE_PORT
    else
        target_port=$GREEN_PORT
    fi

    echo "部署到 $target_env 环境 (端口: $target_port)..."

    # 停止目标环境
    docker-compose -f docker-compose-$target_env.yml down

    # 启动目标环境
    docker-compose -f docker-compose-$target_env.yml up -d

    # 等待服务启动
    sleep 30

    # 健康检查
    for i in {1..10}; do
        if curl -f $HEALTH_CHECK_URL:$target_port/api/actuator/health > /dev/null 2>&1; then
            echo "$target_env 环境健康检查通过"
            return 0
        fi
        echo "等待 $target_env 环境启动... ($i/10)"
        sleep 10
    done

    echo "$target_env 环境健康检查失败"
    return 1
}

# 切换流量
switch_traffic() {
    local target_env=$1
    local target_port

    if [ "$target_env" = "blue" ]; then
        target_port=$BLUE_PORT
    else
        target_port=$GREEN_PORT
    fi

    echo "切换流量到 $target_env 环境..."

    # 更新 Nginx 配置
    sed -i "s/:808[0-9]/:$target_port/g" $NGINX_CONFIG

    # 重新加载 Nginx
    nginx -t && nginx -s reload

    echo "流量已切换到 $target_env 环境"
}

# 清理旧环境
cleanup_old_env() {
    local old_env=$1

    echo "清理 $old_env 环境..."
    docker-compose -f docker-compose-$old_env.yml down
    echo "$old_env 环境已清理"
}

# 主函数
main() {
    echo "开始蓝绿部署..."

    local active_env=$(get_active_env)
    local target_env=$(get_target_env)

    echo "当前活跃环境: $active_env"
    echo "目标部署环境: $target_env"

    # 部署到目标环境
    if deploy_to_target $target_env; then
        # 切换流量
        switch_traffic $target_env

        # 等待一段时间确保稳定
        sleep 60

        # 清理旧环境
        cleanup_old_env $active_env

        echo "蓝绿部署完成"
    else
        echo "部署失败，保持当前环境"
        exit 1
    fi
}

# 执行部署
main "$@"
```

## 监控和告警

### 1. Prometheus + Grafana 监控

#### Prometheus 配置

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  # Spring Boot 应用监控
  - job_name: 'campus-mall-backend'
    static_configs:
      - targets: ['backend1:8080', 'backend2:8080', 'backend3:8080']
    metrics_path: '/api/actuator/prometheus'
    scrape_interval: 10s

  # MySQL 监控
  - job_name: 'mysql'
    static_configs:
      - targets: ['mysql-exporter:9104']

  # Redis 监控
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # Nginx 监控
  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx-exporter:9113']

  # 系统监控
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### 告警规则配置

```yaml
# prometheus/alert_rules.yml
groups:
  - name: campus-mall-alerts
    rules:
      # 应用健康检查
      - alert: ApplicationDown
        expr: up{job="campus-mall-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "应用服务下线"
          description: "{{ $labels.instance }} 应用服务已下线超过1分钟"

      # 高错误率告警
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "高错误率告警"
          description: "{{ $labels.instance }} 5xx错误率超过10%"

      # 响应时间告警
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 3m
        labels:
          severity: warning
        annotations:
          summary: "响应时间过长"
          description: "{{ $labels.instance }} 95%响应时间超过2秒"

      # 数据库连接告警
      - alert: DatabaseConnectionHigh
        expr: hikaricp_connections_active / hikaricp_connections_max > 0.8
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "数据库连接池使用率过高"
          description: "{{ $labels.instance }} 数据库连接池使用率超过80%"

      # 内存使用告警
      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "内存使用率过高"
          description: "{{ $labels.instance }} 内存使用率超过85%"

      # CPU 使用告警
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "CPU使用率过高"
          description: "{{ $labels.instance }} CPU使用率超过80%"

      # 磁盘空间告警
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "磁盘空间不足"
          description: "{{ $labels.instance }} 磁盘可用空间少于10%"
```

#### Grafana 仪表板配置

```json
{
  "dashboard": {
    "title": "校园社区商场监控仪表板",
    "panels": [
      {
        "title": "应用状态",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"campus-mall-backend\"}",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "QPS",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[1m])",
            "legendFormat": "{{instance}}"
          }
        ]
      },
      {
        "title": "响应时间",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th percentile"
          }
        ]
      },
      {
        "title": "错误率",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "5xx Error Rate"
          }
        ]
      },
      {
        "title": "数据库连接池",
        "type": "graph",
        "targets": [
          {
            "expr": "hikaricp_connections_active",
            "legendFormat": "Active Connections"
          },
          {
            "expr": "hikaricp_connections_max",
            "legendFormat": "Max Connections"
          }
        ]
      }
    ]
  }
}
```

### 2. 日志管理

#### ELK Stack 配置

```yaml
# docker-compose-logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.5.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
      - xpack.security.enabled=false
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    ports:
      - "9200:9200"

  logstash:
    image: docker.elastic.co/logstash/logstash:8.5.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
      - ./logstash/config:/usr/share/logstash/config
      - /opt/campus-mall/logs:/var/log/campus-mall
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.5.0
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  elasticsearch_data:
```

#### Logstash 配置

```ruby
# logstash/pipeline/logstash.conf
input {
  file {
    path => "/var/log/campus-mall/application.log"
    start_position => "beginning"
    codec => multiline {
      pattern => "^\d{4}-\d{2}-\d{2}"
      negate => true
      what => "previous"
    }
  }
}

filter {
  if [message] =~ /^\d{4}-\d{2}-\d{2}/ {
    grok {
      match => {
        "message" => "%{TIMESTAMP_ISO8601:timestamp} \[%{DATA:thread}\] %{LOGLEVEL:level} %{DATA:logger} - %{GREEDYDATA:msg}"
      }
    }

    date {
      match => [ "timestamp", "yyyy-MM-dd HH:mm:ss" ]
    }

    if [level] == "ERROR" {
      mutate {
        add_tag => [ "error" ]
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "campus-mall-logs-%{+YYYY.MM.dd}"
  }

  stdout {
    codec => rubydebug
  }
}
```

## 故障处理

### 1. 常见故障及处理方案

#### 应用无法启动

```bash
# 1. 检查应用日志
docker logs campus-mall-backend

# 2. 检查配置文件
cat /opt/campus-mall/backend/src/main/resources/application-prod.yml

# 3. 检查数据库连接
mysql -h mysql-master -u campus_mall_app -p

# 4. 检查端口占用
netstat -tlnp | grep 8080

# 5. 重启服务
docker-compose restart backend
```

#### 数据库连接失败

```bash
# 1. 检查数据库服务状态
docker ps | grep mysql

# 2. 检查数据库日志
docker logs campus-mall_mysql-master_1

# 3. 检查网络连通性
docker exec campus-mall_backend_1 ping mysql-master

# 4. 检查用户权限
mysql -h mysql-master -u root -p
SHOW GRANTS FOR 'campus_mall_app'@'%';

# 5. 重启数据库服务
docker-compose restart mysql-master
```

#### Redis 连接失败

```bash
# 1. 检查 Redis 服务状态
docker ps | grep redis

# 2. 测试 Redis 连接
redis-cli -h redis-master -p 6379 -a your_password ping

# 3. 检查 Redis 配置
docker exec campus-mall_redis-master_1 cat /etc/redis/redis.conf

# 4. 检查内存使用
redis-cli -h redis-master -p 6379 -a your_password info memory

# 5. 重启 Redis 服务
docker-compose restart redis-master
```

#### 高负载处理

```bash
# 1. 检查系统负载
top
htop
iostat -x 1

# 2. 检查应用性能
curl http://localhost:8080/api/actuator/metrics

# 3. 扩容处理
# 水平扩容
docker-compose up -d --scale backend=3

# 垂直扩容
# 修改 docker-compose.yml 中的资源限制
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 4G

# 4. 数据库优化
# 检查慢查询
mysql -e "SHOW PROCESSLIST;"
mysql -e "SELECT * FROM information_schema.processlist WHERE time > 10;"

# 5. 缓存优化
# 检查缓存命中率
redis-cli info stats | grep keyspace
```

### 2. 回滚策略

#### 快速回滚脚本

```bash
#!/bin/bash
# rollback.sh - 快速回滚脚本

set -e

BACKUP_DIR="/opt/campus-mall/backups"
LOG_FILE="/opt/campus-mall/logs/rollback.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

# 列出可用备份
list_backups() {
    log "可用备份列表:"
    ls -la $BACKUP_DIR/ | grep backup_
}

# 回滚到指定备份
rollback_to_backup() {
    local backup_name=$1

    if [ -z "$backup_name" ]; then
        log "请指定备份名称"
        list_backups
        exit 1
    fi

    local backup_path="$BACKUP_DIR/$backup_name"

    if [ ! -d "$backup_path" ]; then
        log "备份不存在: $backup_name"
        exit 1
    fi

    log "开始回滚到备份: $backup_name"

    # 停止当前服务
    docker-compose down

    # 恢复应用文件
    cp -r $backup_path/backend/* /opt/campus-mall/backend/

    # 恢复数据库
    mysql -h mysql-master -u root -p < $backup_path/database.sql

    # 启动服务
    docker-compose up -d

    # 健康检查
    sleep 30
    if curl -f http://localhost:8080/api/actuator/health > /dev/null 2>&1; then
        log "回滚成功"
    else
        log "回滚后健康检查失败"
        exit 1
    fi
}

# 主函数
main() {
    case "$1" in
        "list")
            list_backups
            ;;
        "rollback")
            rollback_to_backup "$2"
            ;;
        *)
            echo "用法: $0 {list|rollback <backup_name>}"
            exit 1
            ;;
    esac
}

main "$@"
```

## 性能优化

### 1. 应用层优化

```yaml
# JVM 参数优化
JAVA_OPTS: >
  -Xms2g -Xmx4g
  -XX:+UseG1GC
  -XX:MaxGCPauseMillis=200
  -XX:+HeapDumpOnOutOfMemoryError
  -XX:HeapDumpPath=/opt/campus-mall/logs/
  -Dspring.profiles.active=prod
```

### 2. 数据库优化

```sql
-- 慢查询优化
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- 连接池优化
SET GLOBAL max_connections = 1000;
SET GLOBAL wait_timeout = 28800;

-- 缓存优化
SET GLOBAL query_cache_size = 268435456;
SET GLOBAL query_cache_type = 1;
```

### 3. 缓存策略

```bash
# Redis 内存优化
redis-cli CONFIG SET maxmemory 2gb
redis-cli CONFIG SET maxmemory-policy allkeys-lru

# 缓存预热
redis-cli EVAL "
  local keys = redis.call('KEYS', 'cache:*')
  for i=1,#keys do
    redis.call('EXPIRE', keys[i], 3600)
  end
  return #keys
" 0
```

## 总结

### 部署检查清单

- [ ] **环境准备**
  - [ ] 服务器资源充足
  - [ ] 网络配置正确
  - [ ] 域名解析配置
  - [ ] SSL 证书安装

- [ ] **应用部署**
  - [ ] 代码构建成功
  - [ ] 配置文件正确
  - [ ] 数据库迁移完成
  - [ ] 健康检查通过

- [ ] **监控告警**
  - [ ] Prometheus 监控配置
  - [ ] Grafana 仪表板配置
  - [ ] 告警规则配置
  - [ ] 日志收集配置

- [ ] **安全配置**
  - [ ] 防火墙规则配置
  - [ ] SSL/TLS 配置
  - [ ] 访问控制配置
  - [ ] 数据备份策略

### 运维建议

1. **定期备份**: 每日自动备份数据库和应用文件
2. **监控告警**: 7x24小时监控，及时响应告警
3. **性能优化**: 定期分析性能指标，持续优化
4. **安全更新**: 及时更新系统和应用安全补丁
5. **容量规划**: 根据业务增长预测，提前扩容
6. **故障演练**: 定期进行故障演练，提高应急响应能力

---

*文档版本: v1.0*
*最后更新: 2025年5月*
*维护人员: 运维团队*
