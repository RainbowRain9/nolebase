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
![](https://i-blog.csdnimg.cn/blog_migrate/7f7e099a3ca3e7bdf333004d96b7d44c.png)

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
    

![](https://i-blog.csdnimg.cn/blog_migrate/4faf7a5e56ca983cd702333bd6e621c3.png#pic_center)

*   根据自己的 Ubuntu 的版本选择 ROS 版本 (我的是 **Ubuntu 18.04** 所以对应 ROS 版本为 **melodic**）  
    ![](https://i-blog.csdnimg.cn/blog_migrate/f71dd8dfd4b162af017cca6d4e2d2ba6.png#pic_center)

### 方法一（推荐）使用小鱼 ROS 一键安装

要使用小鱼的一键安装系列，需要下载一个脚本，然后执行这个脚本，进行 ROS 的安装与环境的配置（此脚本还可以安装很多工具，具体可以看[鱼香大佬的说明](https://fishros.org.cn/forum/topic/20/%E5%B0%8F%E9%B1%BC%E7%9A%84%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E7%B3%BB%E5%88%97?lang=zh-CN) ）

*   下载脚本并执行脚本

```
wget http://fishros.com/install -O fishros && . fishros

```

*   初次执行会让你输一次密码  
    ![](https://i-blog.csdnimg.cn/blog_migrate/e6a38bbe447ea84a1424deea969b185a.png#pic_center)
    
*   然后就会看见选择安装界面，小鱼脚本除了安装 ROS 还可以支持很多工具安装，这里我们选择 **1** **ROS 安装**  
    ![](https://i-blog.csdnimg.cn/blog_migrate/a7a69ce3184efaafff598143cc927998.png#pic_center)
    
*   大家可以看到这里会显示出你当前的 Linux 发行版版本，而且他还支持 arm 平台（我在 jetson nano 试过，可以），接着会让你选择是否按照他提供的源（好像是清华源）进行安装，因为我己经换了源了这里 **选择 2** ，如果没换源可以**选 1**  
    ![](https://i-blog.csdnimg.cn/blog_migrate/360adedb2d1b7061ab5f58ae8ef9b2aa.png#pic_center)
    
*   到这里就是**选择 ROS 版本** ，这里我**选择 1 melodic(ROS1)**  
    ![](https://i-blog.csdnimg.cn/blog_migrate/bc655b76959d63032312fdaf65609f65.png#pic_center)
    
*   这里也**选 1**，后面就进行安装了（大概几分钟）
    

![](https://i-blog.csdnimg.cn/blog_migrate/0364bb3223c2bd7ec65dc652efed5417.png#pic_center)

*   显示这个表示安装完成（可能会让你再次输入密码）

![](https://i-blog.csdnimg.cn/blog_migrate/18cc3945bb95e6619e3882073f4a47aa.png#pic_center)

*   可以打开用户目录下的 **.bashrc** 文件，可以在最后看到 **ROS 环境**

![](https://i-blog.csdnimg.cn/blog_migrate/1c4e85afa7c3300d129325aedeff4ba9.png#pic_center)

*   在终端输入 **roscore** ，看到以下输出表示 ROS 安装成功，后面就可以自行选择配置 **rosdep**

![](https://i-blog.csdnimg.cn/blog_migrate/dbc16597dabc0ae21990b7c91a852eb2.png#pic_center)

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

![](https://i-blog.csdnimg.cn/blog_migrate/04e0f412f2b0543b6a994e10c997cac0.png#pic_center)

3.  安装

```
sudo apt update
sudo apt install ros-melodic-desktop
# for noetic
# sudo apt install ros-noetic-desktop

```

![](https://i-blog.csdnimg.cn/blog_migrate/27f84fd58ed1a54121a3d26ab2e977af.png#pic_center)

4.  设置环境

```
#对于Ubuntu20
# echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
echo "source /opt/ros/melodic/setup.bash" >> ~/.bashrc
source ~/.bashrc  #使环境生效

```

可以打开用户目录下的 **.bashrc** 文件，可以在最后看到 **ROS 环境**

![](https://i-blog.csdnimg.cn/blog_migrate/fe0163fc1e5f1aaf514da4482541f06c.png#pic_center)

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
    

![](https://i-blog.csdnimg.cn/blog_migrate/c0d281a45457960f2d84ba5643c57f6d.png#pic_center)

*   安装好后显示如下，在终端输入 **rosdepc update** 进行配置  
    **(注：使用小鱼 ROS 一键安装 rosdep，在后续使用时请将 rosdep 替换为 rosdepc 使用)**  
    ![](https://i-blog.csdnimg.cn/blog_migrate/18ecebbb5d7f79389269cc199e45a842.png#pic_center)
    
*   显示这个表示配置成功
    

![](https://i-blog.csdnimg.cn/blog_migrate/4f7af4d6370d15ce3913c25481481ea6.png#pic_center)

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
![](https://i-blog.csdnimg.cn/direct/f08552e12c4040a3ad603f78a6f2dafa.png#pic_center)

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
![](https://i-blog.csdnimg.cn/direct/6f4c417d55ec43548674ba9381c91aba.png#pic_center)

**修改 init.py 文件**  
![](https://i-blog.csdnimg.cn/direct/5e2f40420d28477aba123e0f17588b20.png#pic_center)

**修改 gbpdistro_support.py 文件**  
![](https://i-blog.csdnimg.cn/direct/bd6e60de93794af5a2aeac8481f125f0.png#pic_center)

**修改 rep3.py 文件**  
![](https://i-blog.csdnimg.cn/direct/902b3f7d4d7845fab4c3828a9df0fe3e.png#pic_center)

**2. 开始配置**

```
sudo rosdep init

```

![](https://i-blog.csdnimg.cn/blog_migrate/c93464140c167d45cc19b413fd690890.png#pic_center)

```
rosdep update

```

![](https://i-blog.csdnimg.cn/blog_migrate/db76961fc5ca9720a9d76e2830589c27.png#pic_center)

参考
--

[ROS 官方教程](https://wiki.ros.org/melodic/Installation/Ubuntu)  
[小鱼的一键安装系列 | 鱼香 ROS (fishros.org.cn)](https://fishros.org.cn/forum/topic/20/%E5%B0%8F%E9%B1%BC%E7%9A%84%E4%B8%80%E9%94%AE%E5%AE%89%E8%A3%85%E7%B3%BB%E5%88%97?lang=zh-CN)  
[Target Platforms (ROS.org)](https://www.ros.org/reps/rep-0003.html)  
[ROS 与操作系统版本对应关系_ros 版本与 ubuntu 对应版本 - CSDN 博客](https://blog.csdn.net/maizousidemao/article/details/119846292)  
[rosdep 是什么？怎么用 | 鱼香 ROS (fishros.org.cn)](https://fishros.org.cn/forum/topic/2124/rosdep%E6%98%AF%E4%BB%80%E4%B9%88-%E6%80%8E%E4%B9%88%E7%94%A8)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！