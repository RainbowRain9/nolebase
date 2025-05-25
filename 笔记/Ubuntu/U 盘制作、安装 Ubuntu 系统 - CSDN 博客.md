> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/Guzarish/article/details/135205790)

制作 ubuntu U 盘启动盘
----------------

### 下载 Ubuntu 镜像

打开 Ubuntu 官网：[https://ubuntu.com/download/desktop](https://ubuntu.com/download/desktop) ，进入页面后，点击右边的【Download】按钮开始下载 Ubuntu 的 ISO 系统镜像文件

![](https://i-blog.csdnimg.cn/blog_migrate/3f59d1e8506cc77c7afcf12d851b789b.png)

### 下载安装并配置 U 盘启动盘

下载 Rufuse 写盘工具，完成后打开

下载地址：[http://rufus.ie/zh](http://rufus.ie/zh)

![](https://i-blog.csdnimg.cn/blog_migrate/b29170a2517084c0ac65df1621ef7ece.png)

插入用来做启动盘的 U 盘，如果 U 盘内有资料请注意进行备份，以免资料文件丢失，插入 U 盘后，在设备区域会显示 U 盘的容量大小。

![](https://i-blog.csdnimg.cn/blog_migrate/70d1e5de419523f9b90dce3cd21e60eb.png)

点击【选择】找到下载的 Ubuntu 系统镜像文件后，点击【打开】

![](https://i-blog.csdnimg.cn/blog_migrate/2fe6094cac43e91d805a15c2209baaa6.png)

点击【开始】，写入 Ubuntu 系统镜像到 U 盘

![](https://i-blog.csdnimg.cn/blog_migrate/28f30ddea6369c4b62163e212fde0aef.png)

如果出现以下提示，选择以 ISO 镜像模式写入，点击【OK】

![](https://i-blog.csdnimg.cn/blog_migrate/32ad5e42d6d099be2a6a8b18d65ac3ff.png)

耐心等待写入完成后，就可以拔掉 U 盘了

![](https://i-blog.csdnimg.cn/blog_migrate/0fc200ed20bae1a4d50ff3d0e0d24525.png)

安装 Ubuntu23.04
--------------

设置启动项

关闭你需要安装系统的主机，然后插入启动 U 盘，进行开机，当屏幕上出现 Logo，迅速按下【F7】键，进入引导启动菜单。

![](https://i-blog.csdnimg.cn/blog_migrate/506797f8dc7b6085a420e82ea81c73a4.png)

选择你的 U 盘作为启动项，回车

![](https://i-blog.csdnimg.cn/blog_migrate/737206b22fadd51516e5d0974f0d54aa.png)

到这里我们就进入了安装程序，选择 Try or Install Ubuntu，回车直接安装

![](https://i-blog.csdnimg.cn/blog_migrate/ba4bf00e910281a3bfb43cb794db1b2e.png)

### 系统安装配置

根据自己的需求选择自己想要的语言，这里设置为中文，点击【下一步】继续安装

![](https://i-blog.csdnimg.cn/blog_migrate/42adcb9374db647811cfe4545f28e558.png)

点击【安装 Ubuntu】，点击【下一步】

![](https://i-blog.csdnimg.cn/blog_migrate/ad5879b5e120d8e7f43963b4e1e2acec.png)

键盘布局默认即可，点击【下一步】

![](https://i-blog.csdnimg.cn/blog_migrate/cab95d5f524c193233f98b26c36fe401.png)

网络链接

选择【我现在不想连接到互联网】，点击【下一步】

![](https://i-blog.csdnimg.cn/blog_migrate/fabb5db9cc0f16cf3866c20adebac888.png)

更新选项

可以根据自己的需求选择【正常安装】或者是【最小安装】，勾选【为图形和 Wifi 硬件安装第三方软件】选项，点击【下一步】

![](https://i-blog.csdnimg.cn/blog_migrate/3e11530524cad6f3ed00028613f76ace.png)

确认好分区后，点击【安装】

![](https://i-blog.csdnimg.cn/blog_migrate/90eadb84907ec09b0e755de977482fa5.png)

时区这里可以设置成【shanghai】, 继续【下一步】

![](https://i-blog.csdnimg.cn/blog_migrate/365533139f37437faacf6f82d42aba60.png)

创建用户名，填写完成自己的信息后，点击【下一步】继续安装

![](https://i-blog.csdnimg.cn/blog_migrate/2a41603c1f1b633958f07cdf04740d75.png)

![](https://i-blog.csdnimg.cn/blog_migrate/79411e63417a764b2b596b5eeb4e8075.png)

主题选择，默认即可，继续【下一步】

![](https://i-blog.csdnimg.cn/blog_migrate/202e4844e1cc7dc40b0feeeb3012d19b.png)

耐心等待安装完成

![](https://i-blog.csdnimg.cn/blog_migrate/18ef90e90dc93e12880d6e16e58a6a3c.png)

安装完成后，拔掉 U 盘，点击【立即重启】就可以正常使用了

![](https://i-blog.csdnimg.cn/blog_migrate/7d574e4d44b894f19c6e3f3927eb3a88.png)

![](https://i-blog.csdnimg.cn/blog_migrate/457356b3cbefbeb1cf0fbb30a3b9a373.png)

这就是安装 Ubuntu23.04 系统的全过程。