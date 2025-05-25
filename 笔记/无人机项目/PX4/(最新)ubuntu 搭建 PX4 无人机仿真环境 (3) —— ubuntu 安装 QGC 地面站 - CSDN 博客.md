---
created: 2025-05-14T11:06
updated: 2025-05-14T11:06
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_55944949/article/details/130895363?spm=1001.2014.3001.5502)

#### 目录

*   *   [前言](#_1)
*   [1. 安装依赖](#1__18)
*   [2. 下载](#2__37)
*   [3. 安装](#3__55)
*   [4. 错误解决](#4__65)
*   [参考](#_91)

### 前言

**QGC (QGroundControl) 是一个开源地面站，基于 QT 开发的，有跨平台的功能。本教程以 Ubuntu 18.04，QGC v4.2.6 为例，但也适用于其他 Ubuntu 发行版。QGC 版本也可以自行选择，如果发现不行可以降低 QGC 的版本。**

**搭建仿真环境系列教程** 👇

[ubuntu 搭建 PX4 无人机仿真环境 (1) —— 概念介绍](https://blog.csdn.net/weixin_55944949/article/details/130848009?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (2) —— MAVROS 安装 (适用于 ROS1、ROS2)](https://blog.csdn.net/weixin_55944949/article/details/130877689?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (3) —— ubuntu 安装 QGC 地面站](https://blog.csdn.net/weixin_55944949/article/details/130895363?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (4) —— 仿真环境搭建](https://blog.csdn.net/weixin_55944949/article/details/130895608?spm=1001.2014.3001.5501)

[ubuntu 安装 ROS melodic(最新、超详细图文教程)](https://blog.csdn.net/weixin_55944949/article/details/130468032?spm=1001.2014.3001.5502)

1. 安装依赖
-------

```
sudo usermod -a -G dialout $USER
sudo apt-get remove modemmanager -y
sudo apt install gstreamer1.0-plugins-bad gstreamer1.0-libav gstreamer1.0-gl -y
sudo apt install libqt5gui5 -y
sudo apt install libfuse2 -y

```

**注： 如果你是 Ubuntu 20.04 或更高的版本，使用下面命令：**

```
sudo usermod -a -G dialout $USER
sudo apt-get remove modemmanager -y
sudo apt install gstreamer1.0-plugins-bad gstreamer1.0-libav gstreamer1.0-gl -y
sudo apt install libfuse2 -y
sudo apt install libxcb-xinerama0 libxkbcommon-x11-0 libxcb-cursor0 -y

```

2. 下载
-----

打开 [官方教程](https://docs.qgroundcontrol.com/master/en/qgc-user-guide/getting_started/download_and_install.html) ，往下滑找到 **Ubuntu Linux** ，点击下载 **（官网上默认下载最新稳定版）**  
![](https://i-blog.csdnimg.cn/blog_migrate/dea690a63932ff388846a9585fcb88b4.png#pic_center)

> 如果需要其他版本，可以打开 [releases](https://github.com/mavlink/qgroundcontrol/releases/) 找到自己想要的版本，点击 AppImage 后缀的安装包即可。
> 
> **或者使用下面👇提供的安装包 (v4.2.6)**
> 
> ```
> https://wwl.lanzout.com/i4FKL1u020hg
> 密码:4d0o
> 
> ```
> 
> **还要稍微处理一下，改个名:**
> 
> ```
> mv QGroundControl.appimage QGroundControl.AppImage
> 
> ```

3. 安装
-----

浏览器默认下载到 **Downloads** 目录

```
cd ~/Downloads/
chmod +x QGroundControl.AppImage
./QGroundControl.AppImage

```

4. 错误解决
-------

**错误** 1️⃣：  
![](https://i-blog.csdnimg.cn/blog_migrate/0a0fb12c7c2e685add3a25e4ed6bcc75.png#pic_center)  
**原因是缺少依赖 ，输入下面命令安装即可。**

```
sudo apt-get install libsdl2-mixer-2.0-0 libsdl2-image-2.0-0 libsdl2-2.0-0

```

**错误** 2️⃣：

```
/tmp/.mount_QGrounh5iaaC/QGroundControl: /lib/x86_64-linux-gnu/libm.so.6: version `GLIBC_2.29' not found (required by /tmp/.mount_QGrounh5iaaC/QGroundControl)
/tmp/.mount_QGrounh5iaaC/QGroundControl: /usr/lib/x86_64-linux-gnu/libstdc++.so.6: version `GLIBCXX_3.4.26' not found (required by /tmp/.mount_QGrounh5iaaC/QGroundControl)

```

**原因是系统的 glibc 库版本低于 QGC 的要求，但是这是系统自带的，不建议升级，所以重新下载低版本的 QGC 就可以了。**

再次运行，成功！（后面就可以双击安装包打开了）  
![](https://i-blog.csdnimg.cn/blog_migrate/1dc44d42f7a272b5210b758c274af122.png#pic_center)

**注：** 如果不习惯英文界面在设置里更换  
![](https://i-blog.csdnimg.cn/blog_migrate/c2c31a060d85c3bc6ad022527be39995.png#pic_center)  
![](https://i-blog.csdnimg.cn/blog_migrate/ae272a42679fada7361b1c4731a5900b.png#pic_center)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！

参考
--

[官方教程](https://docs.qgroundcontrol.com/master/en/qgc-user-guide/getting_started/download_and_install.html)

[PX4 documentation](https://docs.px4.io/main/zh/getting_started/px4_basic_concepts.html)

[打开地面站错误，缺少组件 error while loading shared libraries：libSDL2-2.0.so.0: cannot open shared object file: N-CSDN 博客](https://blog.csdn.net/m2301023/article/details/122745716)