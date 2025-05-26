---
created: 2025-05-14T11:06
updated: 2025-05-14T11:06
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_55944949/article/details/130468032?spm=1001.2014.3001.5502)

#### 目录

*   [ROS 安装](#ROS_11)
*   *   [准备](#_12)
    *   [方法一（推荐）使用小鱼 ROS 一键安装](#ROS_26)
    *   [方法二 使用官方教程](#__63)
*   [配置 rosdep(可选)](#rosdep_106)
*   *   [方法一（推荐）使用小鱼 ROS 一键安装](#ROS_109)
    *   [方法二 通过修改文件](#__130)
    *   *   [自动修改](#_140)
        *   *   *   [手动修改](#_151)
*   [参考](#_200)

**ROS 简介：** ROS 是一个适用于机器人的开源的元[操作系统](https://so.csdn.net/so/search?q=%E6%93%8D%E4%BD%9C%E7%B3%BB%E7%BB%9F&spm=1001.2101.3001.7020)。它提供了操作系统应有的服务，包括硬件抽象，底层设备控制，常用函数的实现，进程间消息传递，以及包管理。它也提供用于获取、编译、编写、和跨计算机运行代码所需的工具和库函数。在某些方面 ROS 相当于一种 “机器人框架（robot frameworks）**(来自 ROSwiki)**

**ROS 发展史**  
![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/52709f266c5debebea46b62d97e72895_MD5.png]]

> **注：** **此教程安装的是 ROS1，而 ROS Noetic 为 ROS1 最后一个版本，也就是说后续不会更新 ROS1 的版本，只会更新 ROS2。而且 ROS Noetic 支持 Ubuntu 20.04，所以 Ubuntu 20.04 以后的版本想要用 ROS1 ，可能需要自己下载 ROS 源码，然后编译源码来安装 ROS 。源码安装官方教程** 👉[noetic/Installation/Source - ROS Wiki](https://wiki.ros.org/noetic/Installation/Source)

**安装 ROS2 可以看下面教程** 👇  
[Ubuntu 安装 ROS(2) —— 以 ROS2 humble 为例 (最新、超详细图文教程，包含配置 rosdep)](https://blog.csdn.net/weixin_55944949/article/details/140373710?spm=1001.2014.3001.5501)

ROS 安装
------

### 准备

*   建议准备一个干净、换好源的 **Ubuntu 16.04** 及以上版本的虚拟机（建议 [清华源](https://mirrors-i.tuna.tsinghua.edu.cn/help/ubuntu/) ），本教程也适用其他 ROS1 版本。
    
*   查看 ubuntu 版本
    
    ```
    lsb_release -a
    
    ```
    

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/fd1077f9f5be271b16884a37e87ab848_MD5.png]]

*   根据自己的 Ubuntu 的版本选择 ROS 版本 (我的是 **Ubuntu 18.04** 所以对应 ROS 版本为 **melodic**）  
    ![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/947004684a7b220cef5cb17ae8d17bea_MD5.png]]

### 方法一（推荐）使用小鱼 ROS 一键安装

要使用小鱼的一键安装系列，需要下载一个脚本，然后执行这个脚本，进行 ROS 的安装与环境的配置（此脚本还可以安装很多工具，具体可以看[鱼香大佬的说明](https://fishros.org.cn/forum/topic/20/%E5%B0%8F%E9%B1%BC%E7%9A%84%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E7%B3%BB%E5%88%97?lang=zh-CN) ）

*   下载脚本并执行脚本

```
wget http://fishros.com/install -O fishros && . fishros

```

*   初次执行会让你输一次密码  
    ![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/a29f10c71dbdbba516dee615d5f09718_MD5.png]]
    
*   然后就会看见选择安装界面，小鱼脚本除了安装 ROS 还可以支持很多工具安装，这里我们选择 **1** **ROS 安装**  
    ![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/9fcc3dd974f64a392e82605ce77c165a_MD5.png]]
    
*   大家可以看到这里会显示出你当前的 Linux 发行版版本，而且他还支持 arm 平台（我在 jetson nano 试过，可以），接着会让你选择是否按照他提供的源（好像是清华源）进行安装，因为我己经换了源了这里 **选择 2** ，如果没换源可以**选 1**  
    ![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/f32afb4431d0c1fe55f22742be11555e_MD5.png]]
    
*   到这里就是**选择 ROS 版本** ，这里我**选择 1 melodic(ROS1)**  
    ![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/c4c365520780ca924d499893b5ad02b5_MD5.png]]
    
*   这里也**选 1**，后面就进行安装了（大概几分钟）
    

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/14e848ddb6c4f2f4e3262c284f9177ad_MD5.png]]

*   显示这个表示安装完成（可能会让你再次输入密码）

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/82c6200efdf186f300c965d430451636_MD5.png]]

*   可以打开用户目录下的 **.bashrc** 文件，可以在最后看到 **ROS 环境**

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/f21c395a4c6c0377f32424a5a8092368_MD5.png]]

*   在终端输入 **roscore** ，看到以下输出表示 ROS 安装成功，后面就可以自行选择配置 **rosdep**

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/e1b6bc69c860bd58569e0bfac7ed8237_MD5.png]]

### 方法二 使用官方教程

其实这跟小鱼的脚本本质上差不多，只是小鱼的脚本已经帮你把环境依赖、版本选择、网络问题都跟你封装、解决好了，还有一种是用**源码安装 ROS** , 之前在树莓派上试过，大家有兴趣可以尝试了解一下 。 [官方教程 - ROS Wiki](http://wiki.ros.org/melodic/Installation/Ubuntu)

1.  加入 ROS 清华镜像源

```
sudo sh -c '. /etc/lsb-release && echo "deb http://mirrors.tuna.tsinghua.edu.cn/ros/ubuntu/ `lsb_release -cs` main" > /etc/apt/sources.list.d/ros-latest.list'

```

2.  设置 key

```
sudo apt-key adv --keyserver 'hkp://keyserver.ubuntu.com:80' --recv-key C1CF6E31E6BADE8868B172B4F42ED6FBAB17C654

```

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/d3eee25765284bf0e72792d1cfbdf0d5_MD5.png]]

3.  安装

```
sudo apt update
sudo apt install ros-melodic-desktop
# for noetic
# sudo apt install ros-noetic-desktop

```

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/5ecd9c2f73b4bbf10daaeaee87048de7_MD5.png]]

4.  设置环境

```
#对于Ubuntu20
# echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
echo "source /opt/ros/melodic/setup.bash" >> ~/.bashrc
source ~/.bashrc  #使环境生效

```

可以打开用户目录下的 **.bashrc** 文件，可以在最后看到 **ROS 环境**

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/1cfe4dc866ea70980c3e117dba003b84_MD5.png]]

在终端输入 **roscore** ，后面就可以自行选择配置 **rosdep**

配置 rosdep(可选)
-------------

**在使用许多 ROS 工具之前，需要初始化 `rosdep`，有些功能包源码编译需要`rosdep` 来安装这些系统依赖项，不配置也不影响 ros 使用，所以后面需要时再来配置也可以。**

### 方法一（推荐）使用小鱼 ROS 一键安装

*   下载脚本并执行脚本 (因为每次执行这个脚本后，都会自动删除脚本，所以需要重新执行)
    
    ```
    wget http://fishros.com/install -O fishros && . fishros
    
    ```
    
*   这里我们**选择 3 配置 rosdep**
    

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/ee4ad4ffe9873182f6c97de7a27784d0_MD5.png]]

*   安装好后显示如下，在终端输入 **rosdepc update** 进行配置  
    **(注：使用小鱼 ROS 一键安装 rosdep，在后续使用时请将 rosdep 替换为 rosdepc 使用)**  
    ![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/6a96fa1402da6b7bc9e62d0cd15b09e8_MD5.png]]
    
*   显示这个表示配置成功
    

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/4f2d1d537ed3cf95436223f76e9d0dbb_MD5.png]]

### 方法二 通过修改文件

这个 rosdep 请求的是国外的服务器，所以会被墙。有些是通过代理的方式，但这个不稳定，因为时间久了要么代理跑路了，要么被墙了。它需要的文件都官方都放在 github 上的，那么我们可以改 url 地址即可。

*   安装依赖

```
sudo apt install python-rosdep python-rosinstall python-rosinstall-generator python-wstool build-essential
# 对于Ubuntu20
# sudo apt install python3-rosdep python3-rosinstall python3-rosinstall-generator python3-wstool build-essential

```

#### 自动修改

*   使用脚本

```
  wget https://gitee.com/tyx6/mytools/raw/main/ros/Mrosdep.py
  sudo python3 Mrosdep.py

```

**注：此脚本在 rosdistro 目录下，是为了方便编写的，如果脚本执行失败可以手动修改，或者在评论区提问**  
![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/f5d202bcfa3d58c906197f22460ad651_MD5.png]]

###### 手动修改

**修改 4 个文件，都是将地址 https://raw.githubusercontent.com/… 改为 https://gitee.com/tyx6/rosdistro/raw/master/**

> **注：由于在 Ubuntu 20.04 中 ros 支持 python3，所以将文件地址中的 python2.7 改为 python3**
> 
> **比如：/usr/lib/python2.7/dist-packages/rosdep2/sources_list.py 改为 /usr/lib/python3/dist-packages/rosdep2/sources_list.py**

```
sudo gedit /usr/lib/python2.7/dist-packages/rosdep2/sources_list.py
# 在大概64行 修改 DEFAULT_SOURCES_LIST_URL = 'https://gitee.com/tyx6/mytools/raw/main/ros/20-default.list'

sudo gedit /usr/lib/python2.7/dist-packages/rosdistro/__init__.py
# 大概在68行的地址

sudo gedit /usr/lib/python2.7/dist-packages/rosdep2/gbpdistro_support.py
# 大概在34行的地址
 
sudo gedit /usr/lib/python2.7/dist-packages/rosdep2/rep3.py
# 大概在36行的地址


```

**修改 sources_list.py 文件**  
![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/1ec112d642f1611915a2032ee3fa2d21_MD5.png]]

**修改 init.py 文件**  
![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/abe9cc0825be745c8ea05082dc6a4539_MD5.png]]

**修改 gbpdistro_support.py 文件**  
![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/ab579a3dd5393eeb5adb9b1396b38638_MD5.png]]

**修改 rep3.py 文件**  
![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/3739cb940af20d5bac7f2f4da2412bd4_MD5.png]]

**2. 开始配置**

```
sudo rosdep init

```

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/2837be66b256d751d8c932c027bc187f_MD5.png]]

```
rosdep update

```

![[_resources/ubuntu 安装 ROS(1) —— 以 ROS1 melodic 为例-CSDN 博客/6906298f777f8da7cff0eb3e3a7486d5_MD5.png]]

参考
--

[ROS 官方教程](https://wiki.ros.org/melodic/Installation/Ubuntu)  
[小鱼的一键安装系列 | 鱼香 ROS (fishros.org.cn)](https://fishros.org.cn/forum/topic/20/%E5%B0%8F%E9%B1%BC%E7%9A%84%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E7%B3%BB%E5%88%97?lang=zh-CN)  
[Target Platforms (ROS.org)](https://www.ros.org/reps/rep-0003.html)  
[ROS 与操作系统版本对应关系_ros 版本与 ubuntu 对应版本 - CSDN 博客](https://blog.csdn.net/maizousidemao/article/details/119846292)  
[rosdep 是什么？怎么用 | 鱼香 ROS (fishros.org.cn)](https://fishros.org.cn/forum/topic/2124/rosdep%E6%98%AF%E4%BB%80%E4%B9%88-%E6%80%8E%E4%B9%88%E7%94%A8)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！