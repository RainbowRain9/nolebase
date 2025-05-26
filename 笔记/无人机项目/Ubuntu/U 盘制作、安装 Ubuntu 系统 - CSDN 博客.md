> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/Guzarish/article/details/135205790)

制作 ubuntu U 盘启动盘
----------------

### 下载 Ubuntu 镜像

打开 Ubuntu 官网：[https://ubuntu.com/download/desktop](https://ubuntu.com/download/desktop) ，进入页面后，点击右边的【Download】按钮开始下载 Ubuntu 的 ISO 系统镜像文件

![[086c14619bf2601160b777f7a77049f0_MD5.png]]

### 下载安装并配置 U 盘启动盘

下载 Rufuse 写盘工具，完成后打开

下载地址：[http://rufus.ie/zh](http://rufus.ie/zh)

![[892758075f3ca5fbafac55f65ad2ffc2_MD5.png]]

插入用来做启动盘的 U 盘，如果 U 盘内有资料请注意进行备份，以免资料文件丢失，插入 U 盘后，在设备区域会显示 U 盘的容量大小。

![[2799f4534615e9d7666f4d7bd590b878_MD5.png]]

点击【选择】找到下载的 Ubuntu 系统镜像文件后，点击【打开】

![[52e8fb83ec76b74e68c82c419bb94e8e_MD5.png]]

点击【开始】，写入 Ubuntu 系统镜像到 U 盘

![[6608e50a210200cf635abf76b4513d47_MD5.png]]

如果出现以下提示，选择以 ISO 镜像模式写入，点击【OK】

![[ede5e8ebfc2971c53629a0cdc6072e49_MD5.png]]

耐心等待写入完成后，就可以拔掉 U 盘了

![[a00b0241ce010baec4b2f67c8fbc9524_MD5.jpg]]

安装 Ubuntu23.04
--------------

设置启动项

关闭你需要安装系统的主机，然后插入启动 U 盘，进行开机，当屏幕上出现 Logo，迅速按下【F7】键，进入引导启动菜单。

![[2d50e6e1caf0d2fa85b54d3e3c94e772_MD5.png]]

选择你的 U 盘作为启动项，回车

![[ed4f3ac93422553029c5ccb0c141caa2_MD5.png]]

到这里我们就进入了安装程序，选择 Try or Install Ubuntu，回车直接安装

![[eaa6be8c3a9acf96ee400b98b921a172_MD5.png]]

### 系统安装配置

根据自己的需求选择自己想要的语言，这里设置为中文，点击【下一步】继续安装

![[4a366a8121390bc195c3237dcc1768ab_MD5.png]]

点击【安装 Ubuntu】，点击【下一步】

![[ef8938545613232d2c1efb92c922a6d9_MD5.png]]

键盘布局默认即可，点击【下一步】

![[8bbb0f4eaa1df5ec6957292c7965c2dc_MD5.png]]

网络链接

选择【我现在不想连接到互联网】，点击【下一步】

![[8bbb0f4eaa1df5ec6957292c7965c2dc_MD5.png]]

更新选项

可以根据自己的需求选择【正常安装】或者是【最小安装】，勾选【为图形和 Wifi 硬件安装第三方软件】选项，点击【下一步】

![[e7db6897f781eff6b062fce5a2ed80a0_MD5.png]]

确认好分区后，点击【安装】

![[622207c6f164fec66ef0f42b9aa68107_MD5.png]]

时区这里可以设置成【shanghai】, 继续【下一步】

![[92724e3f6071552e8d9f6fc501128a11_MD5.png]]

创建用户名，填写完成自己的信息后，点击【下一步】继续安装

![[cfbf804e9073bf7eb7b6b1bce4f0182c_MD5.png]]

![[267282acfc7985d72368967e67fa2533_MD5.png]]

主题选择，默认即可，继续【下一步】

![[58eaac9df7deab1b36c9d247371b57cc_MD5.png]]

耐心等待安装完成

![[f49a04e7fee79575dc067cab7579bdba_MD5.png]]

安装完成后，拔掉 U 盘，点击【立即重启】就可以正常使用了

![[b06712e9f5fa48081e58e826ab0e7e00_MD5.png]]

![[28e49c0b95f90c2001a29564140cfbac_MD5.png]]

这就是安装 Ubuntu23.04 系统的全过程。