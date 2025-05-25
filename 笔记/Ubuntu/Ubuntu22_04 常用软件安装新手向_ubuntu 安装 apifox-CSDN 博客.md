---
created: 2025-05-24T23:03
updated: 2025-05-24T23:03
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/lrclrk/article/details/127769623?ops_request_misc=%257B%2522request%255Fid%2522%253A%252280ff04a4905cdcbf68b924cc007b5e62%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=80ff04a4905cdcbf68b924cc007b5e62&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-1-127769623-null-null.142^v102^pc_search_result_base1&utm_term=Ubuntu22.04%E8%BD%AF%E4%BB%B6%E5%AE%89%E8%A3%85%E6%8E%A8%E8%8D%90&spm=1018.2226.3001.4187)

本文记录了初次使用 ubuntu 时常用软件的安装方法，快速打造一个较为舒适的使用环境。作者为新手，不喜勿喷。

1. 安装中文输入法
----------

```
sudo apt install fcitx5 fcitx5-chinese-addons

```

安装后重启

2. 安装 Chrome 浏览器
----------------

```
#下载安装包
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
#安装
sudo dpkg -i google-chrome-stable_current_amd64.deb

```

快捷方式所在位置为 / usr/share/applications/google-chrome.desktop

3. 安装并激活 Typora
---------------

```
sudo dpkg -i typora_1.4.4-1_amd64.deb

```

安装后邮箱，序列号输入任意值即可激活

获取链接：[https://pan.baidu.com/s/1DyB60zz2wy0znx8XaKtkjg](https://pan.baidu.com/s/1DyB60zz2wy0znx8XaKtkjg)

提取码：1234

免责申明：仅提供安装服务教程，资源来源于网络，仅用于研究学习，请在使用后 24 小时内删除

4. 安装 jdk8
----------

官网地址：[https://www.oracle.com/java/technologies/downloads/#java8](https://www.oracle.com/java/technologies/downloads/#java8)

```
#解压文件
tar -zxvf jdk-8u311-linux-x64.tar.gz
#添加环境变量
sudo vi /etc/profile
#在其后添加
export JAVA_HOME=/usr/local/java/jdk1.8.0_311
export JRE_HOME=${JAVA_HOME}/jre
export CLASSPATH=.:${JAVA_HOME}/lib:${JRE_HOME}/lib
export PATH=${JAVA_HOME}/bin:$PATH
#使环境变量生效
source /etc/profile

```

5. 安装并激活 [JetBrains](https://so.csdn.net/so/search?q=JetBrains&spm=1001.2101.3001.7020) 全家桶
-------------------------------------------------------------------------------------------

以 IDEA 为例

官网地址：[https://www.jetbrains.com/idea/download/other.html](https://www.jetbrains.com/idea/download/other.html)

```
#进入破解文件下的linux/linuxjihuo2021
chmod +x ./linux.sh
./linux.sh
tar -zxvf ideaIU-2021.3.3.tar.gz
cd idea-IU-213.7172.25/bin
sh ./idea.sh
#输入linuxjihuo2021/acitvation code.txt中的code激活，关闭自动更新
#编辑桌面快捷方式
[Desktop Entry]
Name=idea
Exec=sh /home/lzy/Downloads/idea-IU-213.7172.25/bin/idea.sh
Terminal=false
Type=Application
Icon=/home/lzy/Downloads/idea-IU-213.7172.25/bin/idea.png
Comment=idea
Categories=Application;

```

激活文件获取链接：[https://pan.baidu.com/s/1cboVSEpwoTm0jQQJ1XqFMw](https://pan.baidu.com/s/1cboVSEpwoTm0jQQJ1XqFMw)  
提取码：1234

免责申明：仅提供安装服务教程，资源来源于网络，仅用于研究学习，请在使用后 24 小时内删除

6. 安装 Tomcat
------------

官网地址：https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.54/bin/apache-tomcat-9.0.54.tar.gz

```
#下载文件
wget https://archive.apache.org/dist/tomcat/tomcat-9/v9.0.54/bin/apache-tomcat-9.0.54.tar.gz
#解压文件
tar -zxvf apache-tomcat-9.0.54.tar.gz
#进入tomcat的bin文件夹
cd apache-tomcat-9.0.54/bin
#启动tomcat
./startup.sh
#关闭tomcat
./shutdown.sh

```

7. 安装 maven
-----------

官网地址：[https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)

```
#下载文件
wget https://dlcdn.apache.org/maven/maven-3/3.8.6/binaries/apache-maven-3.8.6-bin.tar.gz
#添加环境变量
sudo vi /etc/profile
#在其后添加
export M2_HOME=/home/lzy/Downloads/maven
export PATH=$M2_HOME/bin:$PATH
#使环境变量生效
source /etc/profile

```

修改 setting.xml 文件

```
<--! 换源 -->
<mirror>
  <id>alimaven</id>
  <mirrorOf>central</mirrorOf>
  <name>aliyun maven</name>
  <url>https://maven.aliyun.com/repository/public</url>
  <!-- <blocked>true</blocked> -->
</mirror>
<--! 设置本地仓库位置 -->
<localRepository>/home/lzy/Downloads/maven/repository</localRepository>

```

8. 安装 VSCode
------------

```
#下载安装包
wget https://vscode.cdn.azure.cn/stable/dfd34e8260c270da74b5c2d86d61aee4b6d56977/code_1.66.2-1649664567_amd64.deb
#安装
sudo dpkg -i code_1.66.2-1649664567_amd64.deb

```

9. 安装 MySQL
-----------

```
#安装
sudo apt install mysql-server
#修改密码
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password by 'password';
#将root的localhost改为%，谁都可以连接
use mysql
update user set host = '%' where user = 'root'
#刷新生效
FLUSH PRIVILEGES

```

10. 安装 git
----------

```
#安装
sudo apt install git
#设置信息
git config --global user.name "lzy"
git config --global user.email "lha602@163.com"
git config --global http.sslverify false
#修改host信息，github代理ip为140.82.113.4
sudo vim /etc/hosts
#在其后添加
69.171.224.40 github.global.ssl.fastly.net
185.199.111.153 assets-cdn.github.com
140.82.113.4 github.com
140.82.113.4 www.github.com

```

11. 安装 redis
------------

```
#安装
sudo apt install redis-server
#修改配置文件
sudo vi /etc/redis/redis.conf
#远程连接
# 将 bind 127.0.0.1 ::1 改为 bind 0.0.0.0
#采用守护线程的方式启动
#将daemonize no改为daemonize yes
#设置密码
#requirepass 自己的密码
#启动
sudo service redis start
#或
sudo redis-server /etc/redis/redis.conf
#关闭
sudo service redis stop
#重启
sudo service redis restart
#客户端连接
redis-cli

```

12. 安装 Go
---------

官网地址：https://golang.google.cn/

```
#解压文件
tar zxvf go1.19.3.linux-amd64.tar.gz
#设置 env
go env -w GO111MODULE=on
#使用七牛云的
go env -w GOPROXY=https://goproxy.cn,direct
#设置环境变量
export GOROOT=/home/lzy/Downloads/go
export PATH=$GOROOT/bin:$PATH
export GOPATH=/home/lzy/Documents/GoProjects/GOPATH
#更新环境变量
source /etc/profile

```

13. 安装 C/C++ 环境
---------------

```
sudo apt install build-essential gdb
#验证
gcc --version
g++ --version
gdb --version
make --verison

```

14. 安装 nodejs
-------------

```
#下载压缩包
wget https://npm.taobao.org/mirrors/node/v12.16.1/node-v12.16.1-linux-x64.tar.gz
#解压
tar -zxvf node-v12.16.1-linux-x64.tar.gz
#设置软链接并验证
ln -s nodejs/node-v12.16.1-linux-x64/bin/node /usr/local/bin/
ln -s nodejs/node-v12.16.1-linux-x64/bin/npm /usr/local/bin/
#npm换源
npm set registry https://registry.npm.taobao.org/
#安装vue脚手架
npm i -g @vue/cli

```

15. 安装网易云音乐
-----------

官网地址：https://music.163.com/#/download

```
#安装
sudo dpkg -i netease-cloud-music_1.2.1_amd64_ubuntu_20190428.deb
vi /opt/netease/netease-cloud-music/netease-cloud-music.bash
#!/bin/sh
HERE="$(dirname "$(readlink -f "${0}")")"
export LD_LIBRARY_PATH="${HERE}"/libs:$LD_LIBRARY_PATH
export QT_PLUGIN_PATH="${HERE}"/plugins
export QT_QPA_PLATFORM_PLUGIN_PATH="${HERE}"/plugins/platforms
cd /lib/x86_64-linux-gnu/
exec "${HERE}"/netease-cloud-music $@
#上面其实只添加了一行cd /lib/x86_64-linux-gnu/

```

16. 安装 WPS
----------

官网地址：[https://linux.wps.cn/#](https://linux.wps.cn/#)

```
sudo dpkg -i wps-office_11.1.0.11664_amd64.deb

```

17. 安装 apifox
-------------

官网地址：[https://www.apifox.cn/](https://www.apifox.cn/)

```
sudo dpkg -i apifox_2.2.7_amd64.deb

```