---
created: 2025-05-14T10:50
updated: 2025-05-14T10:50
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_55944949/article/details/130255886)

**前言：** 此教程包含 VM 虚拟机安装 Ubuntu **(以 18.04 为例, 但同时也适用 18.04 版本以上)** 、ubuntu 换源、[安装 VMTools](https://so.csdn.net/so/search?q=%E5%AE%89%E8%A3%85VMTools&spm=1001.2101.3001.7020)、安装中文输入法。

#### 目录

*   *   [VM 虚拟机安装 ubuntu](#VMubuntu_4)
    *   *   [一 配置虚拟机](#__5)
        *   [二 安装虚拟机](#__76)
    *   [配置 Ubuntu](#Ubuntu_126)
    *   *   [一 换源](#__127)
        *   *   [1.1 检查是否要换源](#11__130)
            *   [1.2 通过 Software&Updates 软件换源](#12__SoftwareUpdates__147)
            *   [3.3 通过修改文件换源](#33__177)
        *   [二 安装 VMTools](#_VMTools_199)
        *   [三 安装中文输入法](#__274)

### [VM 虚拟机安装](https://so.csdn.net/so/search?q=VM%E8%99%9A%E6%8B%9F%E6%9C%BA%E5%AE%89%E8%A3%85&spm=1001.2101.3001.7020) ubuntu

#### 一 配置虚拟机

1.  打开主页，点击新建虚拟机，会出现一个新建虚拟机向导，选自定义，然后点击下一步  
    ![2bc7fc0baf514342fec78658f208c971_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935114.png)
    
2.  后面都是默认**下一步**，要确认选择是否相同  
    ![41796910dbb0a561adb49b939e74a03c_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935116.png) 
    ![67551893fcfb2e8214d70211caabb371_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935117.png) 
    ![4980defb0d9248b68d27fd52e1debcbd_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935118.png) 
    （操作系统版本要根据自己镜像系统是多少位，用的那个 Linux 发行版 自行选择）
    
3.  虚拟机名称可以默认，也可以更改，但不能跟已经存在的虚拟机重名。存放位置建议都把虚拟机都放在一个文件夹下，再把虚拟机放在不同的文件夹下，而且要在空间大的硬盘下。  
    ![4c9ee10cca0faa9c9eb40ce0c2009f62_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935119.png)
    
4.  处理器配置
    
    处理器内核总数对应的是物理 CPU 的线程数（逻辑处理器数量）。 所以配置虚拟机时，我们只需要关心 CPU 实际的线程数 是多少就行了，即配置的 **处理器内核总数 < CPU 实际的线程数** 就行了。
    
    我们可以打开任务管理器，“性能” 界面，点击 cpu，就可以看到了。
    
    **内核**：即 CPU 核心数。
    
    **逻辑处理器**：即线程数。  
    ![625d86db7713fdcfa3a413aff9401a0a_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935120.png) 
    ![f56b2a3cfcc23806517832bde6bd0100_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935121.png)
    

大家按照自己的需要和根据电脑的配置，自行选择，点击下一步

5.  虚拟机内存设置
    
    在虚拟机中内存配置取决于主机内存和虚拟机运行程序需要的内存。虚拟机内存是共享了一部分主机的内存的，你设置了虚拟机内存，其实是设置了虚拟机的最大内存，并不是每次虚拟机里执行任务都要消耗这么多内存。已经分配给虚拟机，但是虚拟机没用到的内存实际上是让主机在需要的时候使用的，也就是分配给虚拟机的内存，虚拟机如果没用，主机还是可以用的。
    
    首先虚拟机内存肯定是要小于主机内存的，其次要根据你要在虚拟机上运行的项目，否则过小就会出现进程被 **killed** 的情况。
    
    如果只是学习 Linux，那就 **2GB** 就可以了。要跑仿真或深度学习项目，建议 **4GB** 以上 （不过到后面如果觉得小了，还可以添加）  
    ![7e7cabb4487324726f321db32d280e2f_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935122.png)
    
6.  后面都是默认，下一步 要确认选择是否相同
    

![50ad2f67bf7ed60bbf64decb3d4e7794_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935123.png) 
![f40169f45533dad16ef496cdba17453a_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935124.png)

![07308cb39356d413bb7404d5480ced0b_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935125.png) 
![e1a88e27e9431de77cfa2827b9b3cd22_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935126.png)

7.  虚拟机磁盘设置

将**虚拟磁盘拆分为多个文件**，可以更轻松地在计算机之间移动虚拟机，但可能会降低大容量磁盘的性能。

将**虚拟磁盘存储为单个文件**，虽然提高了磁盘的读写性能，但是对于对于大文件的移动和存储是一个问题。

虚拟机的磁盘大小跟你主机硬盘大小，和你实际应用有关，最大不能超过主机硬盘剩余容量的大小。比如我将虚拟机存在 D 盘下，那我虚拟机的磁盘大小不能大于 D 盘剩余容量的大小。

没什么特殊需求默认大小即可，后面不够可以增加，不过需要设置一下。

![31677384f7ef0256dff6f31fa6f0485b_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935127.png)

默认下一步

![a80c959783a2ffd1bebb5abf246b4043_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935128.png)

8.  设置硬件
    
    点击自定义硬件，可以看到你前面步骤的设置，再移除**打印机**  
    ![64cb42cb489919a081459502309f148f_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935129.png)
    

![90aef835590319ff70b65e980eadcff0_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935130.png)

打开 **CD/DVD** 页面，点击自定义 ISO 映像文件 ，点击浏览找到你下好的镜像文件，再关闭，点击完成即可

![cc4f778425351238b57dc5ba3d572f37_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935131.png)

#### 二 安装虚拟机

1.  打开虚拟机，看到 **welcome** 界面，点击 install ubuntu 。  
    ![af38d7fb0deba1f49e617457cf64aef3_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935132.png)
    
2.  键盘布局选默认
    

![b4ad28211d54f6cfe9abf4d6168eb243_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935133.png)

默认即可

![9468e28719ef49fa7cb367baa64e900d_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935134.png)

3.  Installation type 选择 Something else 来自定义分区，继续  
    （ **注：也可以选择 Erase disk and install Ubuntu ，这里不是真的清除物理机磁盘上全部的内容，只是清除虚拟机申请虚拟磁盘空间的大小，然后系统自动分区** ）  
    ![7a08c88b0345e980dc739dc78ba0f180_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935135.png)

点击 **New Partition Table** 生成新的分区表，后面创建的 分区都会挂载到 /dev/sda 下

![014abe821536976105d2840e0c440f04_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935136.png)

![2bf4c893414d959688033a63f76bf701_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935137.png)

**分区参考**

<table><thead><tr><th>/boot</th><th>ext4</th><th>Linux 的内核及引导系统程序所需要的文件，比如 vmlinuz initrd.img 文件都位于这个目录中。在一般情况下，GRUB 或 LILO 系统引导管理器也位于这个目录；启动撞在文件存放位置，如 kernels，initrd，grub</th><th>&gt;200MB 建议 512MB</th></tr></thead><tbody><tr><td><strong>swap</strong></td><td><strong>swap area</strong></td><td><strong>交换空间：交换分区相当于 Windows 中的 “虚拟内存”，如果内存低的话（1-4G），物理内存的两倍，高点的话（8-16G）要么等于物理内存，要么物理内存 + 2g 左右</strong></td><td>虚拟机内存不会很高，可以等于内存。我分了 2GB 所以 swap 也是 <strong>2GB</strong></td></tr><tr><td><strong>/</strong></td><td><strong>ext4</strong></td><td><strong>根目录</strong></td><td><strong>剩余全部分到根目录下</strong></td></tr></tbody></table>

> **注：** 如果不想过多分区，也可以直接全部挂到根目录下，也就是只有一个 `/ 分区` ，不过建议分成 `/ 分区` 和 `swap 分区` 。

**分区步骤：**  
点 **free space** ，**再点 +** 会弹出一个创建分区的框，按照自己的需求先创建 **/boot 分区**、然后 **swap 分区**、 **/ 分区**，其他的分区策略也可以

![c936ef3cde306828b602de076f92a7ad_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935138.png)

**结果**  
![b73ea54e90fc4060a92f312a1df97af7_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935139.png)

4.  点击 install now 后，会让你选地区，直接选上海就可以了  
    ![41cda75aec19aa1189e8b4541312ed40_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935140.png)
    
5.  创建用户  
    ![29418681d165f11dbcda229e2d4672e0_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935141.png)
    

接下来就是等安装了

![b314f238f4f930e678f8fe9fc21b1236_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935142.png)

### 配置 Ubuntu

#### 一 换源

因为 Ubuntu 中大部分的软件 **安装 / 更新** 都是利用 `apt`命令，从 ubuntu 的服务器直接安装的（apt 是一个软件包管理工具），要切换软件源，有可能因为网络原因，没有换源也可以，但是为了后面的开发，还是要换源的。

##### 1.1 检查是否要换源

输入下面命令：

```
sudo cat /etc/apt/sources.list

```

如下图所示：  
![dde0ed076d9d3035fea7e5b0de1a5902_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935143.png) 
输入下面命令：

```
sudo apt update

```

如下图所示，你会发现我根本就没换清华源，怎么就变成了清华源。原因是 **cn.archive.ubuntu.com 已经自动跳转到清华源 ，所以如果你是这种情况，那么就直接跳过换源这一步。**  
![482b7e5425c7ca77f115d93a21aa983e_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935144.png)

##### 1.2 通过 Software&Updates 软件换源

> ** 注：** 经过测试发现，在 Ubuntu 20.04、Ubuntu 22.04 中使用这个软件切换成清华源，会变成  
> `https://mirrors.tuna.tsinghua.edu.cn/ubuntu-ports/` ，有个 ports 后缀，这是给 arm 架构的 Ubuntu 用的软件源，如果出现这种情况，直接把 ports 后缀删掉，变成`https://mirrors.tuna.tsinghua.edu.cn/ubuntu/` 就可以了。

点击这个，打开软件菜单，在里面找到 Software&Updates(软件和更新)  
![27db4de48b2a18c04bfe983d0e183962_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935145.png)

打开后，点击 **Download from** 这个框，选择 **other**

![72dfb940046372286ceba274be88dd89_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935146.png)

往上翻，找到 **china** ，然后点开，找到 **清华源** ，然后点击

![de02ef73bfd2d2719c05663eb66bd335_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935147.png)

![2d3ed209803dcfc9645aacb3d899fc7b_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935148.png)

点击后，会让你输密码，权限认证

![47fb946bf4542d7babf6f829e8415ca9_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935149.png)

认证后，点击 **close** ，会出现一个提示框，点击 **reload** ，然后等待

![aaf21e3dcccac01a22e83e96578366a6_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935150.png)  
![ac28a29848c7eb1b3212ae611e4fed39_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935151.png)

更新完后，按 **ctrl + Alt + t** (这是打开终端的快捷键) 打开终端,， 在终端输入 `sudo apt-get update` , 输入密码

![1fafac7b54bbc5b55b2d16c5e965ce55_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935152.png)

##### 3.3 通过修改文件换源

下载脚本：

```
wget https://gitee.com/tyx6/mytools/raw/main/common/update_software_source.sh

```

![f5b25bf6560c19b7d16eaa80ac513dad_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935153.png)

执行脚本：

```
chmod +x update_software_source.sh
sudo ./update_software_source.sh

```

![5a4ca51fb3693e6690ddc369dacdcbf9_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935154.png)

输入下面命令：

```
sudo apt update

```

#### 二 安装 VMTools

一般只有在 VMware 虚拟机中安装好了 **VMware Tools**，才能实现主机与虚拟机之间的文件共享，同时可支持自由拖拽的功能，鼠标也可在虚拟机与主机之前自由移动（不用再按 ctrl+alt），且虚拟机屏幕也可实现全屏化，ubuntu 系统的分辨率可随 vmware 软件窗口的大小而改变。

那为什么不先安装 **VMware Tools** 呢？🧐

一般安装 **VMware Tools** 是在 VMware 的菜单栏上依次点击：虚拟机 ==> 安装 VMware Tools ，然后解压下载好的压缩包，再执行安装脚本。但看似过程简单，其实能否安装完成还是得看玄学😂  
一次在浏览 vm 官网时看到，官网上推荐的是一个叫 **open-vm-tools** 的软件，官网的介绍是：`可以使用命令行在 Linux 虚拟机上手动安装 VMware Tools。对于 Linux 的较高发行版，请使用集成的 open-vm-tools 版本。`自己也实测过 **（18.04 以上版本应该没问题，18.04 以前的版本没试过）**

**过程：**

1.  **Ubuntu、Debian 及相关操作系统**
    
    1.  请确保已更新软件包索引：
        
        ```
        sudo apt-get update
        
        ```
        
    2.  如果虚拟机具有 GUI（X11 等），请安装或升级
        
        open-vm-tools-desktop：
        
        ```
        sudo apt-get install open-vm-tools-desktop
        
        ```
        
    3.  否则，请使用以下命令安装
        
        open-vm-tools：
        
        ```
        sudo apt-get install open-vm-tools
        
        ```
        
2.  **RHEL、Fedora 和 CentOS**
    
    1.  如果虚拟机具有 GUI（X11 等），请安装或升级
        
        open-vm-tools-desktop：
        
        ```
        sudo yum install open-vm-tools-desktop
        
        ```
        
    2.  否则，请安装
        
        open-vm-tools：
        
        ```
        sudo yum install open-vm-tools
        
        ```
        
3.  **SLE 和 OpenSuSE**
    
    1.  如果虚拟机具有 GUI（X11 等），请安装或升级
        
        open-vm-tools-desktop：
        
        ```
        zypper install open-vm-tools-desktop
        
        ```
        
    2.  否则，请安装
        
        open-vm-tools：
        
        ```
        zypper install open-vm-tools
        
        ```
        

**安装完后 输入 reboot 重启，就可以了。**

#### 三 安装中文输入法

**注：大家也可以尝试安装搜狗输入法**

1.  安装输入法（ ibus 框架）

```
sudo apt-get install ibus-pinyin

```

2.  打开 **Setting->Region&Language->Manage Installed Languages** ，如果是第一次打开会有一个提示框，点击 **install** ，输入密码，等待安装即可  
    ![45df1f4e05ef909dd6fca66cd706860f_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935155.png)

然后，点击 **Install / Remove Languages** ，选择简体中文，然后重启系统（如果已经安装好了，直接下一步）  
![918013d9ae5f95f01f16d1e7518fd516_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935156.png)

返回 **Region&Language** 页面，点击 **+ 号** ，选择 **chinese** ，然后再点击 **Chinese(Intelligent Pingyin)**，点 **add** j 即可。  
![4360e2bffa031f78d8fe10a9ae079ee1_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935157.png)  
**win + space** 可以切换输入法，**shift** 可以切换中文输入法的中文模式和英文模式

> **注：** 在我的教程中 **ubuntu** 的系统语言选的是英语，如果想使用中文语言，可以在 **Region&Language** 界面，点击 **Language** ，在弹出的界面中选择汉语，点击 Done ，重启即可![fe9ada5de2fc72185bd5c25d1570d6f1_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935158.png) 
> ![34e36219a3678aebc53bb7a2947733ef_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270935159.png)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！