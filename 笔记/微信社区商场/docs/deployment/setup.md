# 环境搭建指南

## 概述

本文档详细描述了微信社区商场小程序的完整开发环境搭建流程，包括前端开发环境、后端服务环境、数据库环境、缓存环境等所有必要组件的安装和配置。

## 系统要求

### 硬件要求

| 组件 | 最低配置 | 推荐配置 |
|------|----------|----------|
| CPU | 双核 2.0GHz | 四核 2.5GHz+ |
| 内存 | 8GB | 16GB+ |
| 硬盘 | 50GB 可用空间 | 100GB+ SSD |
| 网络 | 稳定的互联网连接 | 带宽 ≥ 10Mbps |

### 操作系统支持

- **Windows**: Windows 10/11 (64位)
- **macOS**: macOS 10.14+
- **Linux**: Ubuntu 18.04+, CentOS 7+

## 前端开发环境

### 1. 微信开发者工具

#### 下载安装

1. 访问 [微信开发者工具官网](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 根据操作系统下载对应版本
3. 安装并启动开发者工具

#### 配置步骤

```bash
# 1. 使用微信扫码登录
# 2. 创建小程序项目
# 项目名称: 校园社区商场
# 目录: 选择项目根目录
# AppID: 填写小程序AppID（测试可使用测试号）
# 开发模式: 小程序
# 后端服务: 不使用云服务
```

#### 开发者工具配置

```json
// project.config.json
{
  "description": "校园社区商场小程序",
  "packOptions": {
    "ignore": [
      {
        "type": "file",
        "value": ".eslintrc.js"
      },
      {
        "type": "file",
        "value": ".gitignore"
      },
      {
        "type": "file",
        "value": "README.md"
      }
    ]
  },
  "setting": {
    "urlCheck": false,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "lazyloadPlaceholderEnable": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    },
    "enableEngineNative": false,
    "useIsolateContext": false,
    "userConfirmedBundleSwitch": false,
    "packNpmManually": false,
    "packNpmRelationList": [],
    "minifyWXSS": true,
    "disableUseStrict": false,
    "minifyWXML": true,
    "showES6CompileOption": false,
    "useCompilerPlugins": false
  },
  "compileType": "miniprogram",
  "libVersion": "2.19.4",
  "appid": "your_app_id_here",
  "projectname": "campus-mall",
  "debugOptions": {
    "hidedInDevtools": []
  },
  "scripts": {},
  "staticServerOptions": {
    "baseURL": "",
    "servePath": ""
  },
  "isGameTourist": false,
  "condition": {
    "search": {
      "list": []
    },
    "conversation": {
      "list": []
    },
    "game": {
      "list": []
    },
    "plugin": {
      "list": []
    },
    "gamePlugin": {
      "list": []
    },
    "miniprogram": {
      "list": []
    }
  }
}
```

### 2. Node.js 环境

#### 安装 Node.js

```bash
# 方法1: 官网下载安装
# 访问 https://nodejs.org/
# 下载 LTS 版本 (推荐 v18.x 或 v20.x)

# 方法2: 使用 nvm 管理多版本 (推荐)
# Windows 用户安装 nvm-windows
# macOS/Linux 用户安装 nvm

# 安装最新 LTS 版本
nvm install --lts
nvm use --lts

# 验证安装
node --version  # 应显示 v18.x.x 或更高版本
npm --version   # 应显示 8.x.x 或更高版本
```

#### 配置 npm

```bash
# 设置 npm 镜像源（提高下载速度）
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 安装常用全局工具
npm install -g yarn pnpm nodemon pm2

# 验证安装
yarn --version
pnpm --version
```

### 3. 代码编辑器

#### 推荐 Visual Studio Code

```bash
# 下载安装 VS Code
# 访问 https://code.visualstudio.com/

# 安装推荐插件
# 1. 微信小程序开发插件
code --install-extension ms-ceintl.vscode-language-pack-zh-hans
code --install-extension johnsoncodehk.volar
code --install-extension bradlc.vscode-tailwindcss

# 2. JavaScript/TypeScript 插件
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next

# 3. 通用开发插件
code --install-extension ms-vscode.vscode-json
code --install-extension redhat.vscode-yaml
code --install-extension ms-vscode.vscode-markdown
```

#### VS Code 配置

```json
// .vscode/settings.json
{
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "emmet.includeLanguages": {
    "wxml": "html"
  },
  "emmet.triggerExpansionOnTab": true,
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[wxml]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[wxss]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## 后端开发环境

### 1. Java 开发环境

#### 安装 JDK

```bash
# 方法1: 下载 Oracle JDK 或 OpenJDK
# 推荐使用 JDK 11 或 JDK 17 LTS 版本

# 方法2: 使用包管理器安装
# Windows (使用 Chocolatey)
choco install openjdk11

# macOS (使用 Homebrew)
brew install openjdk@11

# Ubuntu/Debian
sudo apt update
sudo apt install openjdk-11-jdk

# CentOS/RHEL
sudo yum install java-11-openjdk-devel

# 验证安装
java -version
javac -version
```

#### 配置环境变量

```bash
# Windows 系统
# 1. 设置 JAVA_HOME
# JAVA_HOME = C:\Program Files\Java\jdk-11.0.x

# 2. 添加到 PATH
# PATH = %JAVA_HOME%\bin;%PATH%

# Linux/macOS 系统
# 添加到 ~/.bashrc 或 ~/.zshrc
export JAVA_HOME=/usr/lib/jvm/java-11-openjdk
export PATH=$JAVA_HOME/bin:$PATH

# 重新加载配置
source ~/.bashrc
```

### 2. Maven 构建工具

#### 安装 Maven

```bash
# 方法1: 官网下载
# 访问 https://maven.apache.org/download.cgi
# 下载 Binary zip archive

# 方法2: 使用包管理器
# Windows (Chocolatey)
choco install maven

# macOS (Homebrew)
brew install maven

# Ubuntu/Debian
sudo apt install maven

# CentOS/RHEL
sudo yum install maven

# 验证安装
mvn -version
```

#### 配置 Maven

```xml
<!-- ~/.m2/settings.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0
          http://maven.apache.org/xsd/settings-1.0.0.xsd">

  <!-- 本地仓库路径 -->
  <localRepository>${user.home}/.m2/repository</localRepository>

  <!-- 镜像配置 -->
  <mirrors>
    <mirror>
      <id>aliyun-maven</id>
      <name>阿里云Maven镜像</name>
      <url>https://maven.aliyun.com/repository/public</url>
      <mirrorOf>central</mirrorOf>
    </mirror>
  </mirrors>

  <!-- 配置文件 -->
  <profiles>
    <profile>
      <id>jdk-11</id>
      <activation>
        <activeByDefault>true</activeByDefault>
        <jdk>11</jdk>
      </activation>
      <properties>
        <maven.compiler.source>11</maven.compiler.source>
        <maven.compiler.target>11</maven.compiler.target>
        <maven.compiler.compilerVersion>11</maven.compiler.compilerVersion>
      </properties>
    </profile>
  </profiles>
</settings>
```

### 3. Spring Boot 项目初始化

#### 使用 Spring Initializr

```bash
# 方法1: 在线生成
# 访问 https://start.spring.io/
# 配置项目信息并下载

# 方法2: 使用命令行工具
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,mysql,redis,security,validation \
  -d type=maven-project \
  -d language=java \
  -d bootVersion=2.7.0 \
  -d baseDir=campus-mall-backend \
  -d groupId=com.campusmall \
  -d artifactId=campus-mall-backend \
  -d name=campus-mall-backend \
  -d description="校园社区商场后端服务" \
  -d packageName=com.campusmall \
  -d packaging=jar \
  -d javaVersion=11 \
  -o campus-mall-backend.zip

# 解压并进入项目目录
unzip campus-mall-backend.zip
cd campus-mall-backend
```

## 数据库环境

### 1. MySQL 数据库

#### 安装 MySQL 8.0

```bash
# Windows 系统
# 1. 下载 MySQL Installer
# 访问 https://dev.mysql.com/downloads/installer/
# 选择 mysql-installer-community-8.0.x.x.msi

# 2. 安装配置
# - 选择 Developer Default 安装类型
# - 设置 root 密码（建议使用强密码）
# - 配置 MySQL 服务自启动

# macOS 系统 (使用 Homebrew)
brew install mysql@8.0
brew services start mysql@8.0

# Ubuntu/Debian 系统
sudo apt update
sudo apt install mysql-server-8.0

# CentOS/RHEL 系统
sudo yum install mysql-server
sudo systemctl start mysqld
sudo systemctl enable mysqld

# 验证安装
mysql --version
```

#### MySQL 安全配置

```bash
# 运行安全配置脚本
sudo mysql_secure_installation

# 配置选项说明:
# 1. 设置 root 密码强度验证: Y
# 2. 设置 root 密码: 输入强密码
# 3. 移除匿名用户: Y
# 4. 禁止 root 远程登录: N (开发环境可选 N)
# 5. 移除测试数据库: Y
# 6. 重新加载权限表: Y
```

#### MySQL 配置优化

```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf (Linux)
# C:\ProgramData\MySQL\MySQL Server 8.0\my.ini (Windows)

[mysqld]
# 基础配置
port = 3306
bind-address = 0.0.0.0
default-storage-engine = INNODB

# 字符集配置
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci
init_connect = 'SET NAMES utf8mb4'

# 内存配置
innodb_buffer_pool_size = 1G
innodb_log_file_size = 256M
innodb_log_buffer_size = 16M
query_cache_size = 128M
query_cache_type = 1

# 连接配置
max_connections = 1000
max_connect_errors = 10000
wait_timeout = 28800
interactive_timeout = 28800

# InnoDB 配置
innodb_file_per_table = 1
innodb_flush_log_at_trx_commit = 2
innodb_flush_method = O_DIRECT
innodb_thread_concurrency = 8

# 日志配置
general_log = 1
general_log_file = /var/log/mysql/general.log
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# 二进制日志
log-bin = mysql-bin
binlog_format = ROW
expire_logs_days = 7

[mysql]
default-character-set = utf8mb4

[client]
default-character-set = utf8mb4
```

#### 创建数据库和用户

```sql
-- 连接到 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE campus_mall CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建应用用户
CREATE USER 'campus_mall_app'@'%' IDENTIFIED BY 'strong_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON campus_mall.* TO 'campus_mall_app'@'%';

-- 创建只读用户（用于报表查询）
CREATE USER 'campus_mall_readonly'@'%' IDENTIFIED BY 'readonly_password_here';
GRANT SELECT ON campus_mall.* TO 'campus_mall_readonly'@'%';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证用户创建
SELECT User, Host FROM mysql.user WHERE User LIKE 'campus_mall%';
```

### 2. Redis 缓存

#### 安装 Redis

```bash
# Windows 系统
# 1. 下载 Redis for Windows
# 访问 https://github.com/microsoftarchive/redis/releases
# 下载 Redis-x64-x.x.x.msi

# 2. 或使用 WSL2 + Ubuntu 安装

# macOS 系统 (使用 Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian 系统
sudo apt update
sudo apt install redis-server

# CentOS/RHEL 系统
sudo yum install epel-release
sudo yum install redis
sudo systemctl start redis
sudo systemctl enable redis

# 验证安装
redis-cli ping
# 应返回 PONG
```

#### Redis 配置

```conf
# /etc/redis/redis.conf (Linux)
# C:\Program Files\Redis\redis.windows.conf (Windows)

# 网络配置
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 300

# 内存配置
maxmemory 512mb
maxmemory-policy allkeys-lru

# 持久化配置
save 900 1
save 300 10
save 60 10000

# AOF 配置
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec

# 安全配置
requirepass your_redis_password_here

# 日志配置
loglevel notice
logfile /var/log/redis/redis-server.log

# 数据库数量
databases 16
```

#### Redis 性能测试

```bash
# 基础性能测试
redis-benchmark -h 127.0.0.1 -p 6379 -a your_password -c 50 -n 10000

# 测试特定操作
redis-benchmark -h 127.0.0.1 -p 6379 -a your_password -t set,get -n 100000 -q

# 连接测试
redis-cli -h 127.0.0.1 -p 6379 -a your_password
> SET test_key "Hello Redis"
> GET test_key
> DEL test_key
```

## 开发工具环境

### 1. Git 版本控制

#### 安装 Git

```bash
# Windows 系统
# 下载 Git for Windows: https://git-scm.com/download/win

# macOS 系统
brew install git

# Ubuntu/Debian 系统
sudo apt install git

# CentOS/RHEL 系统
sudo yum install git

# 验证安装
git --version
```

#### Git 配置

```bash
# 全局配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input  # Linux/macOS
git config --global core.autocrlf true   # Windows

# 配置编辑器
git config --global core.editor "code --wait"

# 配置别名
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --all"

# 查看配置
git config --list
```

### 2. API 测试工具

#### 安装 Postman

```bash
# 下载安装 Postman
# 访问 https://www.postman.com/downloads/

# 或使用命令行工具 curl
# 已包含在大多数系统中

# 验证 curl
curl --version

# 测试 API 连接示例
curl -X GET "http://localhost:8080/api/health" \
  -H "Content-Type: application/json"
```

#### 配置 Postman 环境

```json
// Postman 环境变量配置
{
  "name": "Campus Mall Development",
  "values": [
    {
      "key": "base_url",
      "value": "http://localhost:8080",
      "enabled": true
    },
    {
      "key": "api_version",
      "value": "v1",
      "enabled": true
    },
    {
      "key": "auth_token",
      "value": "",
      "enabled": true
    }
  ]
}
```

### 3. 数据库管理工具

#### 推荐工具

```bash
# 1. MySQL Workbench (官方工具)
# 下载: https://dev.mysql.com/downloads/workbench/

# 2. DBeaver (免费开源)
# 下载: https://dbeaver.io/download/

# 3. Navicat (商业软件)
# 下载: https://www.navicat.com/

# 4. 命令行工具 mycli (增强版 mysql 客户端)
pip install mycli

# 使用 mycli 连接数据库
mycli -h localhost -u campus_mall_app -p campus_mall
```

## 微信开发环境

### 1. 微信公众平台配置

#### 注册小程序账号

```text
1. 访问微信公众平台: https://mp.weixin.qq.com/
2. 点击"立即注册" -> 选择"小程序"
3. 填写账号信息并完成邮箱验证
4. 完成主体信息登记（个人或企业）
5. 获取小程序 AppID 和 AppSecret
```

#### 开发设置配置

```text
1. 登录小程序管理后台
2. 进入"开发" -> "开发设置"
3. 配置服务器域名:
   - request 合法域名: https://your-api-domain.com
   - socket 合法域名: wss://your-websocket-domain.com
   - uploadFile 合法域名: https://your-upload-domain.com
   - downloadFile 合法域名: https://your-download-domain.com

4. 配置业务域名（用于 web-view）
5. 下载校验文件并上传到服务器根目录
```

### 2. 微信支付配置

#### 申请微信支付

```text
1. 在小程序后台申请微信支付功能
2. 完成商户号申请和资质审核
3. 获取以下关键信息:
   - 商户号 (mch_id)
   - API 密钥 (api_key)
   - 证书文件 (apiclient_cert.p12)
```

#### 支付配置文件

```properties
# application-wechat.properties
# 微信小程序配置
wechat.miniapp.appid=your_app_id
wechat.miniapp.secret=your_app_secret

# 微信支付配置
wechat.pay.appid=your_app_id
wechat.pay.mchid=your_merchant_id
wechat.pay.apikey=your_api_key
wechat.pay.certpath=classpath:cert/apiclient_cert.p12
wechat.pay.notifyurl=https://your-domain.com/api/v1/payment/notify
```

## 环境验证

### 1. 系统环境检查

#### 创建环境检查脚本

```bash
#!/bin/bash
# check_environment.sh - 环境检查脚本

echo "=== 校园社区商场小程序环境检查 ==="
echo ""

# 检查 Node.js
echo "检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js: $NODE_VERSION"
    if [[ "$NODE_VERSION" < "v16" ]]; then
        echo "⚠ 警告: 建议使用 Node.js v16 或更高版本"
    fi
else
    echo "✗ Node.js 未安装"
fi

# 检查 npm
echo "检查 npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✓ npm: $NPM_VERSION"
else
    echo "✗ npm 未安装"
fi

# 检查 Java
echo "检查 Java..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1)
    echo "✓ Java: $JAVA_VERSION"
else
    echo "✗ Java 未安装"
fi

# 检查 Maven
echo "检查 Maven..."
if command -v mvn &> /dev/null; then
    MVN_VERSION=$(mvn --version | head -n 1)
    echo "✓ Maven: $MVN_VERSION"
else
    echo "✗ Maven 未安装"
fi

# 检查 MySQL
echo "检查 MySQL..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    echo "✓ MySQL: $MYSQL_VERSION"

    # 测试数据库连接
    echo "测试数据库连接..."
    if mysql -h localhost -u campus_mall_app -p -e "SELECT 1;" 2>/dev/null; then
        echo "✓ 数据库连接正常"
    else
        echo "⚠ 数据库连接失败，请检查用户名密码"
    fi
else
    echo "✗ MySQL 未安装"
fi

# 检查 Redis
echo "检查 Redis..."
if command -v redis-cli &> /dev/null; then
    REDIS_VERSION=$(redis-cli --version)
    echo "✓ Redis: $REDIS_VERSION"

    # 测试 Redis 连接
    echo "测试 Redis 连接..."
    if redis-cli ping &> /dev/null; then
        echo "✓ Redis 连接正常"
    else
        echo "⚠ Redis 连接失败，请检查服务状态"
    fi
else
    echo "✗ Redis 未安装"
fi

# 检查 Git
echo "检查 Git..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    echo "✓ Git: $GIT_VERSION"
else
    echo "✗ Git 未安装"
fi

echo ""
echo "=== 环境检查完成 ==="
```

#### 运行环境检查

```bash
# 给脚本执行权限
chmod +x check_environment.sh

# 运行检查
./check_environment.sh
```

### 2. 项目环境验证

#### 后端服务验证

```bash
# 1. 克隆项目（如果还没有）
git clone https://github.com/your-org/campus-mall-backend.git
cd campus-mall-backend

# 2. 安装依赖
mvn clean install

# 3. 运行测试
mvn test

# 4. 启动应用
mvn spring-boot:run

# 5. 验证健康检查接口
curl http://localhost:8080/actuator/health

# 预期响应:
# {"status":"UP"}
```

#### 前端项目验证

```bash
# 1. 打开微信开发者工具
# 2. 导入项目
# 3. 检查编译是否正常
# 4. 在模拟器中测试基础功能

# 或使用命令行验证
cd campus-mall-miniprogram

# 检查项目配置
cat project.config.json

# 检查依赖（如果使用 npm）
npm install
npm run build
```

### 3. 数据库初始化验证

```bash
# 1. 连接数据库
mysql -h localhost -u campus_mall_app -p campus_mall

# 2. 检查数据库结构
SHOW TABLES;

# 3. 检查迁移记录
SELECT * FROM schema_migrations ORDER BY executed_at;

# 4. 验证基础数据
SELECT COUNT(*) FROM forum_boards;
SELECT COUNT(*) FROM product_categories;
SELECT COUNT(*) FROM system_configs;
```

## 故障排除

### 1. 常见问题及解决方案

#### Node.js 相关问题

```bash
# 问题1: npm 安装依赖失败
# 解决方案:
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# 问题2: 权限错误 (macOS/Linux)
# 解决方案:
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# 问题3: 网络超时
# 解决方案:
npm config set registry https://registry.npmmirror.com
npm config set timeout 60000
```

#### MySQL 相关问题

```bash
# 问题1: 连接被拒绝
# 检查服务状态
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# 启动服务
sudo systemctl start mysql  # Linux
brew services start mysql  # macOS

# 问题2: 密码认证失败
# 重置 root 密码
sudo mysql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'new_password';
FLUSH PRIVILEGES;

# 问题3: 字符集问题
# 检查字符集设置
SHOW VARIABLES LIKE 'character_set%';
SHOW VARIABLES LIKE 'collation%';
```

#### Redis 相关问题

```bash
# 问题1: Redis 服务未启动
# 启动 Redis 服务
sudo systemctl start redis  # Linux
brew services start redis  # macOS
redis-server  # 直接启动

# 问题2: 内存不足
# 检查内存使用
redis-cli info memory

# 清理缓存
redis-cli FLUSHALL

# 问题3: 配置文件错误
# 检查配置文件语法
redis-server --test-config /etc/redis/redis.conf
```

#### 微信开发者工具问题

```text
问题1: 项目导入失败
解决方案:
1. 检查 project.config.json 文件格式
2. 确认 AppID 是否正确
3. 重新创建项目

问题2: 编译错误
解决方案:
1. 检查代码语法错误
2. 清除缓存重新编译
3. 更新开发者工具版本

问题3: 真机调试失败
解决方案:
1. 检查手机微信版本
2. 确认开发者权限
3. 重新扫码调试
```

### 2. 性能优化建议

#### 数据库优化

```sql
-- 1. 检查慢查询
SHOW VARIABLES LIKE 'slow_query_log';
SHOW VARIABLES LIKE 'long_query_time';

-- 2. 分析表结构
ANALYZE TABLE users, forum_posts, products;

-- 3. 检查索引使用情况
SHOW INDEX FROM forum_posts;
EXPLAIN SELECT * FROM forum_posts WHERE board_id = 1;
```

#### Redis 优化

```bash
# 1. 监控 Redis 性能
redis-cli --latency-history -i 1

# 2. 检查内存使用
redis-cli info memory

# 3. 优化配置
# 在 redis.conf 中调整以下参数:
# maxmemory-policy allkeys-lru
# save 900 1
# tcp-keepalive 300
```

#### 应用优化

```bash
# 1. JVM 参数优化
export JAVA_OPTS="-Xms512m -Xmx2g -XX:+UseG1GC"

# 2. Spring Boot 配置优化
# 在 application.yml 中:
server:
  tomcat:
    max-threads: 200
    min-spare-threads: 10
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
```

## 开发环境最佳实践

### 1. 项目结构规范

```text
campus-mall/
├── backend/                 # 后端项目
│   ├── src/main/java/
│   ├── src/main/resources/
│   ├── src/test/
│   ├── pom.xml
│   └── README.md
├── miniprogram/            # 小程序项目
│   ├── pages/
│   ├── components/
│   ├── utils/
│   ├── app.js
│   ├── app.json
│   └── project.config.json
├── docs/                   # 文档目录
│   ├── api/
│   ├── database/
│   ├── deployment/
│   └── development/
├── scripts/               # 脚本目录
│   ├── deploy.sh
│   ├── migrate.sh
│   └── check_environment.sh
└── README.md
```

### 2. 环境变量管理

```bash
# 创建环境变量文件
# .env.development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=campus_mall
DB_USER=campus_mall_app
DB_PASSWORD=your_password

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

WECHAT_APP_ID=your_app_id
WECHAT_APP_SECRET=your_app_secret

# 加载环境变量
source .env.development
```

### 3. 代码质量工具

```bash
# 1. 安装代码检查工具
npm install -g eslint prettier

# 2. 配置 ESLint
npx eslint --init

# 3. 配置 Prettier
echo '{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}' > .prettierrc

# 4. 配置 Git hooks
npm install -D husky lint-staged
npx husky install
```

## 总结

### 环境搭建检查清单

- [ ] **前端环境**
  - [ ] 微信开发者工具已安装并配置
  - [ ] Node.js v16+ 已安装
  - [ ] npm/yarn 已配置镜像源
  - [ ] VS Code 已安装必要插件

- [ ] **后端环境**
  - [ ] JDK 11+ 已安装并配置环境变量
  - [ ] Maven 已安装并配置镜像源
  - [ ] Spring Boot 项目可正常启动

- [ ] **数据库环境**
  - [ ] MySQL 8.0 已安装并优化配置
  - [ ] 数据库用户已创建并授权
  - [ ] Redis 已安装并配置密码

- [ ] **开发工具**
  - [ ] Git 已安装并配置用户信息
  - [ ] API 测试工具已安装
  - [ ] 数据库管理工具已安装

- [ ] **微信环境**
  - [ ] 小程序账号已注册
  - [ ] 服务器域名已配置
  - [ ] 微信支付已申请（如需要）

### 下一步操作

1. **运行环境检查脚本**确认所有组件正常
2. **克隆项目代码**并完成初始化
3. **执行数据库迁移**创建表结构
4. **启动后端服务**并验证 API 接口
5. **导入小程序项目**并测试基础功能
6. **配置开发工具**提高开发效率

### 技术支持

如果在环境搭建过程中遇到问题，可以：

1. 查看本文档的故障排除部分
2. 检查官方文档和社区资源
3. 联系技术团队获取支持

---

*文档版本: v1.0*
*最后更新: 2024年12月*
*维护人员: 开发团队*
