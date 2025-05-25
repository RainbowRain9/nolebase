---
created: 2025-05-14T11:05
updated: 2025-05-14T11:05
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_55944949/article/details/130848009?spm=1001.2014.3001.5502)

#### 目录

*   *   [前言](#_1)
*   [概念介绍](#_16)
*   [环境建议](#_50)
*   [参考](#_73)

### 前言

搭建 PX4 仿真环境一个有挑战性的过程，如果没有一个有经验的人来带的话会走很多弯路。我在搭建 PX4 仿真环境的时候，不知道 Linux、ROS、git，语言也只会一个 C 语言，没有任何无人机基础，纯小白一个，靠着自学与网上的各种教程，花了一两个月才搭好基本的仿真环境框架。我会将搭建步骤一步步演示，强烈建议大家看看 [环境建议](##%E7%8E%AF%E5%A2%83%E5%BB%BA%E8%AE%AE) 这一节，概念的话了解就行。

**搭建仿真环境系列教程**👇

[ubuntu 搭建 PX4 无人机仿真环境 (1) —— 概念介绍](https://blog.csdn.net/weixin_55944949/article/details/130848009?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (2) —— MAVROS 安装](https://blog.csdn.net/weixin_55944949/article/details/130877689?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (3) —— ubuntu 安装 QGC 地面站](https://blog.csdn.net/weixin_55944949/article/details/130895363?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (4) —— 仿真环境搭建](https://blog.csdn.net/weixin_55944949/article/details/130895608?spm=1001.2014.3001.5501)

[ubuntu 安装 ROS melodic(最新、超详细图文教程)](https://blog.csdn.net/weixin_55944949/article/details/130468032?spm=1001.2014.3001.5502)

概念介绍
----

在搭建环境之前还是希望大家能看看这些概念，避免大家概念模糊。

*   **PX4**

所谓无人机的飞控，就是无人机的飞行控制系统。无人机飞控能够稳定无人机飞行姿态，并能控制无人机自主或半自主飞行，是无人机的大脑。而 **PX4** 是自动驾驶仪软件（或称为固件），基于 Nuttx 实时操作系统开发的，可以驱动无人机或无人车。它是 **Pixhawk** 的原生固件，虽然起步比 APM 晚。它与**地面站**（地面控制站）在一起组成一个完全独立的自动驾驶系统。它是一个在 GitHub 上开源的一个项目，[项目地址](https://github.com/PX4/PX4-Autopilot/) , 还有官方参考[文档](https://docs.px4.io/main/zh/) (这里建议新手多看看官方文档)。

*   **QGC**

**QGC 地面站是 Dronecode 地面控制站称为 QGC 地面站** 。它是基于 **Qt** 开发的。如果使用的是 **PX4 固件** ，**建议使用 QGC 地面站** 。使用者可以用 QGroundControl 将 PX4 固件加载（烧写）到飞行器控制硬件上，可以设置飞行器，更改不同参数，获取实时飞行信息以及创建和执行完全自主的任务，如航点规划。QGroundControl 是跨平台的，可以在 Windows，Android，MacOS 或 Linux 上运行。它是一个在 GitHub 上开源的一个项目，[项目地址](https://github.com/mavlink/qgroundcontrol) , 还有官方参考[文档](http://qgroundcontrol.com/)

*   **MAVSDK**

**MAVSDK** 基于 Mavlink 协议的 sdk 包，可以使机载电脑与 MAVLink 协议兼容的无人机通信，从而控制无人机。**多用于 PX4 固件** ，它最初是使用 C++ 写的，经过发展，现在已经支持 Python、Java、C#、Rust、Swift、Go、JavaScript，适合多平台开发。它是一个在 GitHub 上开源的一个项目，[mavlink/MAVSDK: API and library for MAVLink compatible systems](https://github.com/mavlink/MAVSDK) ，还有官方参考 [Introduction · MAVSDK Guide](https://mavsdk.mavlink.io/main/en/index.html)

*   **APM**

**Ardupilot Mega 或称为 APM** 也是一款自驾仪软件，是早在 2007 年由 DIY 无人机社区 (DIY Drones) 推出的飞控产品。APM 刚开始是基于 Arduino 的开源平台，后来软件代码不断状大，原来的硬件不能胜任最新代码，再后来开发者就把 Ardupilot 代码转移到了 Pixhawk 平台上，基于 Nuttx 实时操作系统，兼容了 Pixhawh 硬件平台。目前主要是支持的 5 种设备的目录包括 ArduPlane(固定翼)、ArduCopter(直升机 / 多旋翼)、APMrover2、AntennaTracker、ArduSub。它是一个在 GitHub 上开源的一个项目，[项目地址](https://github.com/ArduPilot/ardupilot) , 还有官方参考[文档](https://ardupilot.org/plane/docs/common-simulation.html) 。

*   **MP**

**Misson Planner 简称 MP** ，是 Windows 平台运行的一款 APM/PIX 的专属地面站，基于 **C#** 开发的，对于 Windows 兼容更好，其他平台也可以运行，但兼容性不是很好。如果使用 **APM 固件** ，**建议使用 MP 地面站** 。它的基本功能与 **QGC** 是一样的，虽然功能强大多样，但是太冗余。它是一个在 GitHub 上开源的一个项目，[项目地址](https://github.com/ArduPilot/MissionPlanner) , 还有官方参考[文档](https://ardupilot.org/planner/)

*   **Dronekit**

**DroneKit** 是一款 Python 语言的无人机开发库，同样基于 Mavlink 协议，可以对使用 MAVLink 通讯协议的 ArduPilot 和 PX4 无人机进行控制，**多用于 ArduPilot 固件** 。它最初是使用 Python 编写的，后面也支持了 Java，跨平台性没有 MAVSDK 好，但个人觉得更容易上手。它是一个在 GitHub 上开源的一个项目，[DroneKit-Python library for communicating with Drones via MAVLink.](https://github.com/dronekit/dronekit-python) , 还有官方参考 [DroneKit-Python’s documentation](https://dronekit-python.readthedocs.io/en/latest/)

*   **MAVROS**

**MAVROS 是一个 ROS（Robot Operating System）软件包** ，它提供了一组 ROS 节点，可以将 ROS 系统与 MAVLink 协议兼容的无人机（例如 Pixhawk）集成在一起，所以不管是什么固件，只要是支持 MAVLink 协议，都可以用 MAVROS。通过 MAVROS，ROS 系统可以与无人机通信，接收和发送 MAVLink 消息，控制无人机的姿态、速度和位置等。MAVROS 也提供了许多其他功能，例如姿态解算、飞行模式切换、航点导航和状态反馈等。

MAVROS 的设计旨在使它易于与 ROS 系统集成，它提供了一组简单的 ROS 服务和 ROS 消息，可以用于**机载电脑与无人机进行通信和控制无人机** ，实现无人机的自主飞行。此外，MAVROS 还提供了一组 C++ API 和 Python API，使开发人员可以轻松地编写自己的 ROS 节点，使用 MAVLink 协议控制无人机。

环境建议
----

大家安装的时候可能会碰到跟教程的步骤一样但是运行出错的问题，这大概率就是环境问题，只要环境选好了，就会少很多麻烦。

*   **Ubuntu：**

**对于新手直接用在虚拟机里装 ubuntu 就可以，如果后续对仿真的性能有要求，可以在自己的笔记本上装双系统，或者组个 Linux 主机也行。至于 ubuntu 的版本 我目前接触到的最多的是 18.04 (ROS1 melodic) 和 20.04(ROS1 noetic) ，而 PX4 官方目前的最新稳定版固件 (v1.14) 也只支持 18.04 、20.04 、22.04 。大家可以根据自己需要自行选择，但是目前不建议使用 ROS2 ，因为现在 ROS2 的一些资料不如 ROS1 多，而且有些功能包还没有很好的移植过去，所以推荐用 ROS1。**

*   **依赖安装：**

在正式安装之前还需要安装很多依赖，官方也提供了一个安装脚本，里面包括需要的 **python 包、软件库、交叉编译器，gazebo 等** ，脚本会根据你的 ubuntu 的版本自行选择安装。建议大家使用他提供的脚本就行，使用方法可以看这篇文章👇  
[ubuntu 搭建 PX4 无人机仿真环境 (4) —— 仿真环境搭建](https://blog.csdn.net/weixin_55944949/article/details/130895608?spm=1001.2014.3001.5501)

*   **交叉编译器：**

交叉编译器可以将宿主机上的程序编译后，能够在目标机上运行。一般是在 **x86 架构** 的平台上写好程序，然后用交叉编译器编译，再将可执行文件烧到 **arm 架构** 的平台上。**如果想自己编译飞控固件烧到飞控上，就需要安装交叉编译器**。

（建了个交流群，方便大家交流学习 😁）  
![](https://i-blog.csdnimg.cn/blog_migrate/5d2d7f1e81424944d1f52303a4273933.jpeg#pic_center)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！

参考
--

[Introduction · MAVSDK Guide (mavlink.io)](https://mavsdk.mavlink.io/main/en/index.html)

[DroneKit-Python’s documentation](https://dronekit-python.readthedocs.io/en/latest/)

[Plane documentation (ardupilot.org)](https://ardupilot.org/plane/docs/common-simulation.html)

[PX4 documentation](https://docs.px4.io/main/zh/getting_started/px4_basic_concepts.html)

[PX4（Pixhawk）和 Audupilot（APM）的区别与联系](https://blog.csdn.net/KP1995/article/details/109008960?utm_medium=distribute.pc_relevant.none-task-blog-2~default~baidujs_baidulandingword~default-1-109008960-blog-112607407.pc_relevant_3mothn_strategy_and_data_recovery&spm=1001.2101.3001.4242.2&utm_relevant_index=3)

[ArduPilot 与 Pixhawk 什么关系？ - 知乎 (zhihu.com)](https://zhuanlan.zhihu.com/p/109639638)

[PX4 和 ardupilot(APM) 的对比](https://blog.csdn.net/sinat_16643223/article/details/107861365)