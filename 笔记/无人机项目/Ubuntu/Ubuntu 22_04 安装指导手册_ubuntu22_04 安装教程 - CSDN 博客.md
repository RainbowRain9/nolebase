---
created: 2025-05-24T20:42
updated: 2025-05-24T22:05
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_43628293/article/details/147103949?ops_request_misc=&request_id=&biz_id=102&utm_term=Ubuntu22.04%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-3-147103949.142^v102^pc_search_result_base1&spm=1018.2226.3001.4187)

Ubuntu 22.04 安装指导手册
# 一、安装前准备

## 1.1 系统要求

*   **操作系统**：Windows 11（已安装）
*   **硬件要求**：
    *   CPU：Intel i3 或更高性能处理器
    *   内存：至少 4GB RAM（推荐 8GB）
    *   存储：至少 100GB 可用磁盘空间

**官方的安装教程也可供参考：https://ubuntu.com/tutorials/install-ubuntu-desktop**

## 1.2 下载 Ubuntu 22.04 镜像

*   访问 [Ubuntu 官网](https://releases.ubuntu.com/22.04.5/），下载 Ubuntu 22.04 LTS 桌面版镜像文件。
    官网下载
    [Get Ubuntu | Download | Ubuntu](%E5%AE%98%E7%BD%91%E4%B8%8B%E8%BD%BD%20Get%20Ubuntu%20%7C%20Download%20%7C%20Ubuntu%20%20%E5%AE%98%E7%BD%91%E4%B8%8B%E8%BD%BD%E9%80%9F%E5%BA%A6%E6%AF%94%E8%BE%83%E6%85%A2%EF%BC%8C%E4%B8%8D%E6%98%AF%E5%BE%88%E6%8E%A8%E8%8D%90%E3%80%82%20%20%E5%8E%86%E5%8F%B2%E7%89%88%E6%9C%AC%EF%BC%9AIndex%20of%20/releases%20%28ubuntu.com%29%20%201.2%E3%80%81%E6%B8%85%E5%8D%8E%E9%95%9C%E5%83%8F%E7%BD%91%E7%AB%99%E4%B8%8B%E8%BD%BD%20%E6%B8%85%E5%8D%8E%E5%A4%A7%E5%AD%A6%E5%BC%80%E6%BA%90%E8%BD%AF%E4%BB%B6%E9%95%9C%E5%83%8F%E7%AB%99%20%7C%20Tsinghua%20Open%20Source%20Mirror%20%20%E8%AF%A5%E6%96%B9%E5%BC%8F%E4%B8%8B%E8%BD%BD%E5%BE%88%E5%BF%AB%EF%BC%8C%E6%8E%A8%E8%8D%90%E4%BD%BF%E7%94%A8%E3%80%82%E4%B8%8B%E8%BD%BD%E6%96%B9%E5%BC%8F%E5%A6%82%E4%B8%8B%EF%BC%9A%20%201.2.1%E3%80%81%E8%BF%9B%E5%85%A5%E9%95%9C%E5%83%8F%E7%BD%91%E7%AB%99%E7%9B%B4%E6%8E%A5%E6%90%9C%E7%B4%A2ubuntu%EF%BC%8C%E7%84%B6%E5%90%8E%E9%80%89%E6%8B%A9ubuntu-releases%20%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%E2%80%94%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E7%89%88%E6%9D%83%E5%A3%B0%E6%98%8E%EF%BC%9A%E6%9C%AC%E6%96%87%E4%B8%BA%E5%8D%9A%E4%B8%BB%E5%8E%9F%E5%88%9B%E6%96%87%E7%AB%A0%EF%BC%8C%E9%81%B5%E5%BE%AA%20CC%204.0%20BY-SA%20%E7%89%88%E6%9D%83%E5%8D%8F%E8%AE%AE%EF%BC%8C%E8%BD%AC%E8%BD%BD%E8%AF%B7%E9%99%84%E4%B8%8A%E5%8E%9F%E6%96%87%E5%87%BA%E5%A4%84%E9%93%BE%E6%8E%A5%E5%92%8C%E6%9C%AC%E5%A3%B0%E6%98%8E%E3%80%82%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%E5%8E%9F%E6%96%87%E9%93%BE%E6%8E%A5%EF%BC%9Ahttps://blog.csdn.net/m0_56121792/article/details/141221079)

官网下载速度比较慢，不是很推荐。

历史版本：[Index of /releases (ubuntu.com)](https://old-releases.ubuntu.com/releases/?_gl=1*1y6h74l*_gcl_au*ODcyNTEwMDA4LjE3MjM3MDI1ODY.&_ga=2.216769366.1705909699.1725865927-315392988.1696667415)

**清华镜像网站下载**
[清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/)

该方式下载很快，推荐使用。下载方式如下：进入镜像网站直接搜索 ubuntu，然后选择 ubuntu-releases，选择想要下载的版本，选择桌面版本：ubuntu-22.04.4-desktop-amd64.iso

## 1.3 制作 Ubuntu 启动盘

*   **工具推荐**：Rufus（免费开源工具，官网下载：[Rufus 官网](https://rufus.ie/zh/#google_vignette)）主要用于创建可启动的 USB 闪存驱动器或 DVD，特别适用于从 USB 设备安装操作系统，具有简易使用、轻量化等特点。这里推荐在官方网站上进行下载，往下拖拽后可以看到下载链接，按需进行下载即可。
    
*   **制作步骤**：
    
    1.  将需要烧录的 U 盘（格式化后的空白 U 盘，容量建议 8GB 以上）插入计算机，双击打开 Rufus.exe 软件。设备为需要使用的 U 盘，引导类型选择选择之前下载好的 Ubuntu 22.04 操作系统镜像文件。
    2.  点击 开始 即可进行烧录。一路 OK、确认，等待烧录完成。

![](https://i-blog.csdnimg.cn/direct/96630af9c1b342319a814dcbd3ed50a3.png)

## 1.4 磁盘分区

*   **工具**：Windows 自带的磁盘管理工具
*   **分区步骤**：
    1.  右键点击 “此电脑”，选择 “管理”。
    2.  在 “计算机管理” 窗口中，点击“磁盘管理”。
    3.  选择一个剩余空间足够的盘（如 D 盘、E 盘等），右键点击选择 “压缩卷”。
    4.  输入压缩空间量（建议分出大于 100GB 的空间即 102400MB），点击 “压缩”。
        部分电脑在压缩磁盘时，可压缩空间远小于实际剩余空间，可以使用 [MyDefrag 4.3.1](https://www.techspot.com/downloads/3720-jkdefrag-mydefrag.html)
        进行磁盘整理，具体教程请参考[此链接中博文](https://www.pahh.cn/archives/mydefrag--qing-liang-ji-ci-pan-sui-pian-zheng-li-gong-ju)。

# 二、安装 Ubuntu 22.04

## 2.1 进入 BIOS 设置

*   **步骤**：
    1.  重启电脑，在开机时按下 Del 键（不同电脑可能不同，如 F2、F12 等，请根据自己电脑型号查询，在浏览器中搜索自己的电脑品牌 + 型号 + 如何进入 BIOS）。
        Secure Boot 设置，Security—>Secure Boot —>Disabled
    2.  进入 BIOS 设置后，找到 “Secure Boot” 选项，设置为 “Disabled”。“Secure Boot” 选项（安全启动，用于确保电脑只能启动原装系统。如果电脑重装了其他系统，那么这个系统是启动不了的。说白了，就是垄断。所以安装完其他系统，必须关闭 secure boot，新系统才能启动）设置为 Disabled。
    3.  F10 保存设置并重启电脑。

## 2.2 从 U 盘引导启动

*   **步骤**：
    1.  将之前步骤中制作好的 Ubuntu 启动盘插入电脑的 USB 口，重启电脑，在开机时按下上一步骤中进入电脑 bios 的按键（不同电脑可能不同，请根据自己电脑型号查询）。
    2.  在引导菜单中，将 USB 设备设置为启动项目，或者使用上下箭头将 USB 启动项放在最前面的位置，第一位。设置完成后按下 F10（一般情况下都是这个按键来保存）保存并退出。

## 2.3 Ubuntu 安装向导

*   **步骤**：

开机，进入引导界面，光标选择到 Try or Install Ubuntu，再按回车；
![](https://i-blog.csdnimg.cn/direct/6bcbe745093340448e651155b4792217.png)
2、Ubuntu 准备安装前的加载过程；

![](https://i-blog.csdnimg.cn/direct/0390458ef0554f15ac5953a4af2fe12e.png)

3、进入安装向导，左侧选择 English 或中文 (简体)，再点击安装 Ubuntu，为方便使用 Ubuntn 终端，我选择的是 English；安装时建议大家先使用英文，因为中英文字符编码不一样，如果安装时使用中文，后续开发时可能会出现报错，虽然都可以解决，但大佬们应该不屑回答这些小问题的，也没有相应的文档，而先使用英文，安装完成后将语言改成中文，其他如桌面文件夹名称等都不改变，就可以避免这类问题。

4、选择您的键盘布局，找到并选择 English（为了更广泛的适配性，选美式布局），再点击继续；

![](https://i-blog.csdnimg.cn/direct/daaaa46372c94f228cb14f289fc31ed3.png)

1.  选择语言：建议选择 “English”（后续可更改系统语言）。
2.  键盘布局：选择 “English (US)”。
3.  安装模式：选择 “Minimal installation”（最小化安装，减少安装时间）同时可以避免安装一些不必要的游戏、office 软件。
4.  安装类型：选择 “Something else”（手动分区）。

## 2.4 手动分区

在这里，可以看到在前面步骤中已经分好的空闲分区，上图是单硬盘的情况，只有一个空闲分区，大小是你分区时给定的；

双硬盘的话还能看到另一个空闲分区，大小 200M 左右，所以下面的分区操作单双硬盘存在一点差别。

在这里，我们进行手动分区，假设你留出的空闲分区为 500G，点击空闲盘符，点击 "+" 进行分区，如下：

1）efi：如果是单硬盘，在唯一的一个空闲分区上添加，大小 2048M，逻辑分区，空间起始位置，用于 efi，，对于装载引导程序而言，相信该空间大小已绰绰有余；如果是双硬盘，找到事先分好的空闲分区添加，逻辑分区，空间起始位置，用于 efi。这个分区必不可少，用于安装 ubuntu 启动项，以下步骤单双硬盘就一样了。

*   **分区方案**：
    1.  **efi 分区**：
        *   大小：2048MB
        *   类型：逻辑分区
        *   位置：空间起始位置
        *   用途：EFI 系统分区
    2.  **swap 分区**：
        *   大小：物理内存（内存条大小）的 2 倍（如 32GB）
        *   类型：逻辑分区
        *   位置：空间起始位置
        *   用途：交换空间
    3.  **根目录（/）分区**：
        *   大小：100GB（可根据需求调整）
        *   类型：主分区
        *   位置：空间起始位置
        *   文件系统：ext4
        *   挂载点：/
    4.  **家目录（/home）分区**：
        *   大小：剩余所有空间
        *   类型：逻辑分区
        *   位置：空间起始位置
        *   文件系统：ext4
        *   挂载点：/home

## 2.5 完成安装

*   **步骤**：
    1.  （非常重要！！！）在分区界面下方，选择安装启动项的位置（选择 efi 分区），我们刚刚不是创建了 2048M 的 efi 分区吗，现在你看看这个区前面的编号是多少，比如是 / dev/sda1, 不同的机子会有不同的编号，此处为 / dev/nvme0n1p5。下拉列表选择这个 efi 分区编号（这里一定要注意，windows 的启动项也是 efi 文件，大小大概是 104M，而我们创建的 ubuntu 的 efi 大小是 2048M，一定要选对）。
    2.  点击 “Install Now” 按钮，开始安装。
    3.  设置用户名、密码等信息，等待安装完成。
    4.  安装完成后，重启电脑，拔出 U 盘
    5.  重启后你会看到以下界面，第一项是 ubuntu 启动项，第二项是 ubuntu 高级设置，第三项是 windows 启动项，第四项不用管，默认选择的是第一个，回车进 ubuntu 系统。（关于这个启动项的默认选项也是可以手动配置的，避免主力为 windows 的电脑每次进入系统都需要手动选择 windows，具体方式比较简单，自行百度）

![](https://i-blog.csdnimg.cn/direct/a8c5296ae66b48dcb8f579de100cc16e.png)

# 三、安装后配置

## 3.1 设置服务器镜像源

Ubuntu 中 大部分 的软件 安装 / 更新 都是利用 apt 命令，从 ubuntu 的服务器 直接安装的

Ubuntu 官方的服务器在国外，为了提高软件 安装 / 更新速度，ubuntu 提供了 选择最佳服务器 的功能，可以帮助我们方便的找到一个速度最快的 镜像服务器！

所谓 镜像服务器，就是 所有服务器的内容是相同的（镜像），但是根据所在位置不同，速度不同，通常国内服务器速度会更快一些！

按照以下步骤操作可以设置 ubuntu 的服务器

1.  进入 系统设置
    
2.  打开 软件和更新
    
3.  设置 下载自… 其他站点
    
4.  通过 选择最佳服务器 选择速度最快的 镜像源，如下图所示：
![](https://i-blog.csdnimg.cn/direct/164c6b2e5653441b8cc5e274135b8d25.png)
    Ubuntu22.04 更换国内镜像源（阿里云）
    Ubuntu 采用 apt 作为软件安装工具，其镜像源列表记录在 / etc/apt/source.list 文件中。

首先将 source.list 复制为 source.list.bak 备份。

cp /etc/apt/source.list /etc/apt/source.list.bak
修改完成后保存 source.list 文件，需要执行命令后才能生效：

sudo apt update
本文为 Ubuntu 22.04 的阿里云镜像源列表。若为其他版本，将所有 jammy 更改为其他版本代号即可。
常用的 Ubuntu 版本代号如下：
Ubuntu 22.04：jammy
Ubuntu 20.04：focal
Ubuntu 18.04：bionic
Ubuntu 16.04：xenia

```
vim /etc/apt/source.list

```

将文件内容清空，然后复制下方代码粘贴，wq 保存退出即可。

```
deb https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy main restricted universe multiverse
 
deb https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-security main restricted universe multiverse
 
deb https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-updates main restricted universe multiverse
 
# deb https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse
# deb-src https://mirrors.aliyun.com/ubuntu/ jammy-proposed main restricted universe multiverse
 
deb https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse
deb-src https://mirrors.aliyun.com/ubuntu/ jammy-backports main restricted universe multiverse


```

修改完成后保存 source.list 文件，需要执行下面命令后才能生效：

```
sudo apt update

```

## 3.2 系统更新

*   **步骤**：
    使用以下命令完成系统更新：
    sudo apt-get update
    sudo apt-get upgrade

这个步骤以防后面安装依赖包，导致有些工具安装不上，所以最好第一步将 build-essential 安装好

sudo apt-get install build-essential
安装 vim 工具，因为比较习惯了，用 vi 也可以；

sudo apt-get install vim

或者使用下面的方式：

1.  打开 “Software Updater”（软件更新器）。
2.  点击 “Install Now”（立即安装），更新所有软件包。

## 3.3 安装语言包

*   **步骤**：
    1.  打开 “Language Support”（语言支持）。
    2.  在 “Language” 选项卡中，选择“Chinese (Simplified)”。
    3.  点击 “Apply”（应用），等待语言包安装完成。
    4.  注销并重新登录，系统语言将更改为中文。注意：文件夹名称建议保持英文不变。以下是具体步骤：1. 进入设置界面

点击下图箭头所示处， 选择 "Settings"，进入设置界面，2. 找到 Region&Language(区域和时间)；选择 "Manage Installed Languages" 点击 "Install" 输入密码并点击 "Authenticate" 安装完成出现如下界面后，点击 "Install/Remove Languages" 选择要安装的语言，这里我们选择 "Chinese(simplified)“(简体中文)，如要安装其他语言可按需选择，然后点击"Apply”，等待安装完成；找到下图的 "Language" 一栏，向下滚动找到 "汉语 (中国)“，按住鼠标不松将其拖动到最上方；点击"Close”，然后重启 Ubuntu；重启后会出现如下界面，大体意思是询问你是否要将文件夹名从英文状态改为中文，这里我们选择 "保留旧的名称"，并勾选上 "下次不再询问我"。到这里更改语言设置就完成了。

## 3.3 安装常用软件

*   **推荐软件**：
    *   浏览器：Firefox、Chrome
    *   办公软件：WPS
    *   编程工具：VS Code、VIM、PyCharm

# 四、常见问题解答

## 4.1 无法从 U 盘引导启动

*   **解决方法**：
    1.  检查 BIOS 设置，确保 “Secure Boot” 和“Fast Boot”已禁用。
    2.  检查 U 盘是否制作正确，尝试重新制作启动盘。

## 4.2 分区时提示空间不足

*   **解决方法**：
    1.  检查压缩卷时输入的空间大小是否正确。
    2.  尝试删除不必要的文件，释放更多磁盘空间。

## 4.3 安装过程中卡顿或死机

*   **解决方法**：
    1.  检查电脑硬件是否满足系统要求。
    2.  尝试重新安装系统，确保安装介质无损坏。

通过以上步骤，您应该能够成功安装并配置 Ubuntu 22.04 系统。如果在安装过程中遇到任何问题，可以参考 Ubuntu 官方文档或寻求社区帮助。