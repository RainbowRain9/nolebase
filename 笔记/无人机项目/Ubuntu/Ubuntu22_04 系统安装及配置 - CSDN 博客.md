---
created: 2025-05-24T22:17
updated: 2025-05-24T22:23
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/cheagoun/article/details/139808169?ops_request_misc=&request_id=&biz_id=102&utm_term=Ubuntu22.04%E5%AE%89%E8%A3%85%E6%95%99%E7%A8%8B&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-139808169.142^v102^pc_search_result_base1&spm=1018.2226.3001.4187)

**文章目录**

[一、选择 “安装”](#%E4%B8%80%E3%80%81%E9%80%89%E6%8B%A9%E2%80%9C%E5%AE%89%E8%A3%85%E2%80%9D)

[二、选择 “语言”](#%E4%BA%8C%E3%80%81%E9%80%89%E6%8B%A9%E2%80%9C%E8%AF%AD%E8%A8%80%E2%80%9D)

[三、安装器更新](#%E4%B8%89%E3%80%81%E5%AE%89%E8%A3%85%E5%99%A8%E6%9B%B4%E6%96%B0)

[四、键盘布局](#%E5%9B%9B%E3%80%81%E9%94%AE%E7%9B%98%E5%B8%83%E5%B1%80)

[五、选择安装类型](#%E4%BA%94%E3%80%81%E9%80%89%E6%8B%A9%E5%AE%89%E8%A3%85%E7%B1%BB%E5%9E%8B)

[六、网络配置](#%E5%85%AD%E3%80%81%E7%BD%91%E7%BB%9C%E9%85%8D%E7%BD%AE)

[七、代理设置](#%E4%B8%83%E3%80%81%E4%BB%A3%E7%90%86%E8%AE%BE%E7%BD%AE)

[八、镜像地址](#%E5%85%AB%E3%80%81%E9%95%9C%E5%83%8F%E5%9C%B0%E5%9D%80)

[九、磁盘划分](#%E4%B9%9D%E3%80%81%E7%A3%81%E7%9B%98%E5%88%92%E5%88%86)

[十、设置用户名、主机名、登录密码](#%E5%8D%81%E3%80%81%E8%AE%BE%E7%BD%AE%E7%94%A8%E6%88%B7%E5%90%8D%E3%80%81%E4%B8%BB%E6%9C%BA%E5%90%8D%E3%80%81%E7%99%BB%E5%BD%95%E5%AF%86%E7%A0%81)

[十一、升级到 Ubuntu Pro](#%E5%8D%81%E4%B8%80%E3%80%81%E5%8D%87%E7%BA%A7%E5%88%B0Ubuntu%20Pro)

[十二、SSH 设置](#%E5%8D%81%E4%BA%8C%E3%80%81SSH%E8%AE%BE%E7%BD%AE)

[十三、选装软件包](#%E5%8D%81%E4%B8%89%E3%80%81%E9%80%89%E8%A3%85%E8%BD%AF%E4%BB%B6%E5%8C%85)

[十四、开始安装进程](#%E5%8D%81%E5%9B%9B%E3%80%81%E5%BC%80%E5%A7%8B%E5%AE%89%E8%A3%85%E8%BF%9B%E7%A8%8B)

[十五、配置静态 IP](#%E5%8D%81%E4%BA%94%E3%80%81%E9%85%8D%E7%BD%AE%E9%9D%99%E6%80%81IP)

[十六、设置时区](#%E5%8D%81%E5%85%AD%E3%80%81%E8%AE%BE%E7%BD%AE%E6%97%B6%E5%8C%BA)

[十七、包管理工具](#%E5%8D%81%E4%B8%83%E3%80%81%E5%8C%85%E7%AE%A1%E7%90%86%E5%B7%A5%E5%85%B7)

[十八、防火墙设置](#%E5%8D%81%E5%85%AB%E3%80%81%E9%98%B2%E7%81%AB%E5%A2%99%E8%AE%BE%E7%BD%AE)

[十九、修改 linux 参数（调大最大文件句柄数）](#%E5%8D%81%E4%B9%9D%E3%80%81%E4%BF%AE%E6%94%B9linux%E5%8F%82%E6%95%B0)

[二十、如何使用 root 账号](#%E4%BA%8C%E5%8D%81%E3%80%81%E5%A6%82%E4%BD%95%E4%BD%BF%E7%94%A8root%E8%B4%A6%E5%8F%B7)

[二十一、安装 JDK](#%E4%BA%8C%E5%8D%81%E4%B8%80%E3%80%81%E5%AE%89%E8%A3%85JDK)

[二十二、安装 Docker](#%E4%BA%8C%E5%8D%81%E4%BA%8C%E3%80%81%E5%AE%89%E8%A3%85Docker)

[二十三、参考文章](#%E4%BA%8C%E5%8D%81%E4%B8%89%E3%80%81%E5%8F%82%E8%80%83%E6%96%87%E7%AB%A0)

> **前置条件：**
>
> 下载 Ubuntu22.04 系统镜像（**下载地址：**链接: https://caiyun.139.com/m/i?1A5CwYL2AP5A5
> 提取码: fLRJ），结合 rufus 和系统镜像制作 USB 启动盘，在物理机服务器上通过 USB 启动盘进行安装；或通过 Esxi 虚拟化平台创建虚拟机，然后在虚拟机中使用系统镜像进行安装。

# 一、选择 “安装”

![911fbd3cff368504eb555d422f702875_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932419.jpg)

# 二、选择 “语言”

![35ab8b736884d1fa187a24f583c0fd6e_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932421.jpg)

选择语言为英文，不管有没有中文，都选英文。主要是字符集等一系列可能引发小问题。

# 三、安装器更新

![82a478f22847347679c648da1aafc642_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932422.jpg)

这里选择不更新

# 四、键盘布局

![61284d6ac5cd4d8f0e1b00109837dc8e_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932423.jpg)

键盘布局，默认选项。

# 五、选择安装类型

![fb0b4a34641ba1eb7cbbe4ba3dce86bb_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932424.jpg)

安装版本，选择默认的 server 版，没有选 minimized 版。就不纠结那些默认安装包啥的了。遇到问题再说，减少麻烦。

# 六、网络配置

**方案一：**

![74e6fb148239063a28a2e02d3e6b0cb0_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932425.jpg)

网络配置，这里可以默认，待安装完成后，再进入系统，修改网络配置文件来进行配置静态 IP。(**参考:** 十五、配置静态 IP)

**方案二：**

![b0717bb5a4525fa9cb4e28016e15ed8e_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932426.jpg)

也可以在安装过程中，直接配置静态 IP。如上图，选择 “Edit IPv4” 进入如下界面：

![29514f432add1d6a7d41e51441e5a733_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932427.jpg)

在该界面中，配置 IP 相关信息。

**注意事项：**

1）Subnet：子网网段，配置的是 192.168.111.0/24。最后的 24 就是所谓的掩码。24 的意思是 3 个 8 位。其实 IP 地址由四个 255 容量的数构成，而 255 加上 0 刚好是 256 个数，是 2 的 8 次方，也就是刚好是 8 位数表示的范围。这里的 24 的意思就是前三个 8 位不动，也就是 192.168.111 的部分。最后剩余的是可以动的。它与掩码：255.255.255.0 含义相同。
2）Address：具体的 IP 地址
3）Gateway：网关地址
4）Name Servers：域名服务器地址，就是 DNS，用英文逗号分隔多个 DNS。DNS 是 Domain Name Server 的缩写，这里只是没有写 Domain 罢了。
5）Search domains：可以不填，我们这里用不到。

## 1. Subnet (子网)

- **你的信息：** `192.168.100.0/24`
- **含义：** 这表示你的局域网 (LAN) 所在的网络段。`192.168.100.0` 是网络地址，`/24` 是子网掩码，表示前24位是网络位，后8位是主机位。这意味着你的网络中的设备 IP 地址范围是 `192.168.100.1` 到 `192.168.100.254`。
- **如何填写：** 这个信息通常不需要你直接“填写”到某个配置项中，它更多是用来**理解**你的网络环境。当你设置 IP 地址和子网掩码时，系统会自动识别出这个子网。
    - 在某些配置工具中，你可能需要单独输入 IP 地址和子网掩码（例如 `255.255.255.0`）。
    - 在另一些工具中，你可能需要输入 `192.168.100.X/24` 这种 CIDR 格式，其中 `/24` 就包含了子网信息。

---

## 2. Address (IP 地址)

- **你的信息：** `192.168.100.171` (选择一个未被占用的 IP 地址，例如 `192.168.100.200` 或 `192.168.100.171` 如果你确定它是静态的且不会冲突)
- **含义：** 这是你希望为你的计算机设置的**静态 IP 地址**。
    - **`192.168.100.171`：** 这是你目前通过 DHCP 获取到的 IP 地址。如果你想将它设置为静态地址，并且确定你的路由器（或 DHCP 服务器）不会将这个地址分配给其他设备，那么使用它是一个方便的选择。**但更推荐选择一个在 DHCP 分配范围之外的地址，以避免未来的 IP 冲突。**
    - **`192.168.100.200`：** 这是一个很好的选择，因为它通常位于 DHCP 分配范围的末端，冲突的可能性较小。
- **如何选择和填写：**
    1. **检查 DHCP 范围：** 登录你的路由器管理界面，查看 DHCP 服务器的 IP 地址分配范围。例如，如果 DHCP 范围是 `192.168.100.2` 到 `192.168.100.150`，那么 `192.168.100.200` 就是一个安全的静态 IP 地址。
    2. **选择一个未被占用的地址：** 确保你选择的地址目前没有被网络中的其他设备使用。你可以尝试 `ping` 你想使用的地址，如果没有任何响应，那它很可能是空闲的。
    3. **填写：** 在网络配置中，将这个地址填入“IP 地址”或“IPv4 地址”字段。
        - **推荐：** `192.168.100.200` (或任何你确定未被占用的地址，例如 `192.168.100.201`, `192.168.100.202` 等)。
        - **子网掩码：** 通常会有一个单独的字段填写子网掩码，填写 `255.255.255.0`。或者，如果支持 CIDR 格式，直接在 IP 地址后面加上 `/24`，例如 `192.168.100.200/24`。

---

## 3. Gateway (网关)

- **你的信息：** `192.168.100.1`
- **含义：** 这是你的路由器（或连接到外部网络的设备）在局域网中的 IP 地址。所有发往局域网外部（例如互联网）的数据包都会通过这个地址转发。
- **如何填写：** 这个地址通常是固定的，你的路由器就是这个地址。
    - **填写：** 在网络配置中，将 `192.168.100.1` 填入“网关”或“默认网关”字段。

---

## 4. Name servers (DNS 服务器)

- **你的信息：** `114.114.114.114, 8.8.8.8` (可以填写多个，用逗号分隔，提供备用 DNS)
- **含义：** DNS (Domain Name System) 服务器负责将你访问的域名（例如 `www.google.com`）解析成对应的 IP 地址。
    - **`114.114.114.114`：** 这是中国电信提供的公共 DNS 服务器。
    - **`8.8.8.8`：** 这是 Google 提供的公共 DNS 服务器。
    - **填写多个的好处：** 当第一个 DNS 服务器无法响应时，系统会自动尝试使用列表中的下一个 DNS 服务器，提高了网络访问的可靠性。
- **如何填写：**
    - 在网络配置中，通常会有“DNS 服务器”或“名称服务器”字段。
    - **填写：**
        - 如果只有一个输入框，并且支持逗号分隔，就填写 `114.114.114.114, 8.8.8.8`。
        - 如果提供多个输入框（例如“首选 DNS”、“备用 DNS”），则分别填写 `114.114.114.114` 和 `8.8.8.8`。

# 七、代理设置

![1b1360314a6935a05676958587540593_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932428.jpg)

默认选项，不设置。

# 八、镜像地址

![8fd3d3cdfb6b057a96c0ee22af77df55_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932429.jpg)

​国内也没有被墙，可以不改。不过，最近感觉越来越慢了，可以改成阿里云的：http://mirrors.aliyun.com/ubuntu/

![e706ca4b7361f7061e2ad50292921a01_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932430.jpg)

# 九、******磁盘划分******

![4d22b568848290df223e3f6026d738ee_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932431.jpg)

该界面默认设置，不修改。
默认使用 LVM 逻辑卷，便于后期动态在线调整磁盘空间。

![91cb4cbd54bcb344050ab033965def41_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932432.jpg)

选择 / 分区，然后 Unmount 卸载。

**注意：**不要 Unmount 卸载 /boot 分区，该分区是系统的引导分区。若卸载了，系统就出问题了。

![f89e8d0194da0675d1f6a82bd3d41ece_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932433.jpg)

然后将默认创建的 lv 逻辑卷删除，后面根据自己的需要手动创建 lv 逻辑卷。

![a8fe5ed263dc80f682edfa0cd3410162_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932434.jpg)

对删除操作进行二次确认

![04bf67f9084d8d855454249641863c2f_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932435.jpg)

创建 lv 逻辑卷

![06d3b5688ecb57be26acde7d3ba5cb5c_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932436.jpg)

根据需要填写 lv 逻辑卷的名称、Size 大小、分区格式、加载点目录。

这里只创建了一个 lv 逻辑卷，名称是 lv-0，并将所有磁盘空间都分给该 lv 逻辑卷。分区格式是 ext4，加载点是 / 根目录。

如下，就创建好了 lv 逻辑卷：

![02a69c1bc4a1de487367907b6375b70d_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932437.jpg)

下一步，将执行 lv 逻辑卷的数据清理操作（包括格式化），如下：

![ff869e2e4467f2e5a62f6b174e231a78_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932438.jpg)

**补充示例：**

如下示例中，总的磁盘空间是 800GB，其中，默认的 /boot 分区占用 2GB，创建了 2 个 lv 逻辑卷，一个是 / ，磁盘空间是 150GB; 另一个 是 /data，磁盘空间是所有剩下的磁盘空间 647.996GB。

![cba0470fe36ae8807a52aa3ebe48f2c0_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932439.jpg)

创建 /data 逻辑卷时，加载点选项需要先选择 Other，然后手动输入 / data，如下图：

![c7d6c9d6048efd7e6200f3a4ab3d5d2a_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932440.jpg)

# 十、设置用户名、主机名、登录密码

![027f73a979d6bd00630a995e0debc68f_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932441.jpg)

Your name：是使用在者的名称，没有太多实际意义，但是必须填写。
Your server's name： 配置服务名
Pick a username：这个用户名为登录系统的用户名
Password：需要输入两次相同密码，建议密码设置相对复杂些，避免被爆破

# 十一、升级到 Ubuntu Pro

![ae67270e31df93ca4d7c8da665774b30_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932442.jpg)

默认跳过即可

# 十二、SSH 设置

![610e49872b89b7caac3acf4aa8c47fac_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932443.jpg)

默认 Install OpenSSH Server 未选中，通过上 / 下箭头移动到 Install OpenSSH Server 选项，按键盘空格键可以选中该选项。

如果不选该内容，系统安装上之后无法通过 SSH 登录服务器。

# 十三、选装软件包

![b303cc61870c725f46c7ec2cf7632159_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932444.jpg)

可以什么都不选，然后直接安装。

# 十四、开始安装进程

![4c28a9f1c7965c3f01e320410aa1ddd9_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932445.jpg)

然后就是等待安装完成。

![19ffb1da879937f12f996b475dc3ea9a_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932447.jpg)

当显示 Installation complete 时，表示安装完成。然后选中 Cancel update and reboot 进行重启系统。

重启就能正常进入系统了。不过我这是虚拟机，正常进入系统之前需要点 Enter 键先移除 iso 镜像，如下图：

![f7a044fb674aac72bf76aef3ee1a686f_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932448.jpg)

按 Enter 键进入系统

![4e1219dd02909f82ca8bf7158e34ac41_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932449.jpg)

# 十五、配置静态 IP

> **说明：**若 六、网络配置 中已按**方案二**进行了配置，这里可以直接跳过。

在 Ubuntu 系统中配置静态 IP 地址，你可以编辑 / etc/netplan 目录下的 YAML 配置文件。以下是一个配置静态 IP 的例子：
找到 Netplan 配置文件，通常命名为 01-netcfg.yaml，00-installer-config.yaml 或类似。
ls /etc/netplan
编辑该配置文件。使用文本编辑器，例如 nano 或 vim 或 vi：
sudo vi /etc/netplan/00-installer-config.yaml
修改配置文件以设置静态 IP。以下是一个配置示例：

![3b543ab68156ca80ff8c1e8f2c33733d_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932450.jpg)

确保将 enp160 替换为你的网络接口名称，192.168.111.194 替换为你想要的静态 IP 地址，/24 是子网掩码（相当于 255.255.255.0），192.168.111.1 是默认网关，8.8.8.8 和 114.114.114.114 是 DNS 服务器地址。
配置生效：

```
sudo netplan apply

```

确认配置已生效：

```
ip addr

```

配置好了静态 IP 后，就可以使用 Linux 客户端工具（如 SecureCRT）来连接该主机了。

![bf089895c7550c8ce3b33cbe170fc3df_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270932451.png)

# 十六、设置时区

Ubuntu 默认的时区是有问题的，可以通过如下指令修正：

```
sudo cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

```

另外，还可以通过 tzselect 自行选择可用的时区，效果与上述指令相同。

# 十七、包管理工具

Ubuntu 的包管理工具是 apt，而不是 Centos7 中的 yum。执行如下指令，将包更新到最新：

```
sudo apt update
sudo apt upgrade
```

# 十八、防火墙设置

Ubuntu 防火墙默认是关着的。

基础操作指令如下：

```
# 开启防火墙
sudo ufw enable
 
# 设置防火墙默认拒绝
sudo ufw default deny 
 
# 关闭防火墙
sudo ufw disable 
 
# 查看防火墙状态
sudo ufw status 
```

# 十九、修改 linux 参数（调大最大文件句柄数）

**方法一：**

```
sudo vi /etc/security/limits.conf

```

在最后追加如下内容：

```
* soft nproc 65536
* hard nproc 65536
* soft nofile 65536
* hard nofile 65536
```

**含义如下：**
1）soft nproc: 可打开的文件描述符的最大数 (软限制)
2）hard nproc： 可打开的文件描述符的最大数 (硬限制)
3）soft nofile：单个用户可用的最大进程数量 (软限制)
4）hard nofile：单个用户可用的最大进程数量 (硬限制)

**方法二：**

```
sudo vi /etc/profile
#文件末尾添加下面这行，并保存： 
ulimit -n 65535
 
# 重新加载修改的环境变量文件
sudo source /etc/profile  
```

# 二十、如何使用 root 账号

进入管理员模式

```
sudo su

```

# 二十一、安装 JDK

**方法一：**

```
sudo apt-get install openjdk-8-jdk

```

**方法二：**

1、从 Oracle 官网下载 JDK 压缩包（链接: https://caiyun.139.com/m/i?1A5CvGQGVgTcJ 提取码: 7Ub6）。
2、解压压缩包

```
tar -xzf jdk-8u131-linux-x64.tar.gz -C /usr/local/

```

3、配置环境变量。

```
sudo vi ~/.bashrc
 
#添加以下行：
export JAVA_HOME=/usr/local/jdk1.8.0_131
export PATH=$JAVA_HOME/bin:$PATH
```

4、重新加载配置文件：

```
source ~/.bashrc

```

5、验证安装是否成功：

```
java -version

```

# 二十二、安装 Docker

1、卸载原有可能存在的 Docker 软件

```
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

```

2、更新软件源

```
sudo apt-get update
sudo apt-get upgrade
```

3、安装 docker 依赖

```
apt-get install ca-certificates curl gnupg lsb-release

```

4、添加 docker 秘钥

```
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -

```

看到 ok 就添加成功了
5、添加 Docker 软件源

```
sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"

```

这些必须全部命中
6、安装 Docker

```
apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin

```

7、查看是否安装成功

```
docker --version

```

显示版本信息表示安装成功
8、配置用户组，这样就可以不用每次使用 docker 都要 sudo 了

```
sudo usermod -aG docker $USER

```

9、重启计算机

```
sudo reboot

```

10、启动 Docker

```
systemctl start docker

```

11、设置开机启动 Docker

```
systemctl enable docker

```

12、查看 docker 进程状态

```
systemctl status docker

```

13、配置国内镜像地址

```
sudo vi /etc/docker/daemon.json
##添加如下内容
{
"registry-mirrors": [
    "http://hub-mirror.c.163.com",
    "https://9ca7kqhd.mirror.aliyuncs.com",
    "https://registry.docker-cn.com"
]
}
```

14、重启

```
systemctl restart docker

```

# 二十三、参考文章

[1、手把手教你如何安装 Ubuntu18.04.5 LTS Server 版操作系统](https://blog.51cto.com/iopera/4690890 "1、手把手教你如何安装Ubuntu18.04.5 LTS Server版操作系统")

2、[Ubuntu22.04 安装及初始配置](https://zhuanlan.zhihu.com/p/661672842?utm_id=0 "Ubuntu22.04安装及初始配置")

3、[ubuntu 安装 Docker（超级详细，常见错误解决方案也有附上）](https://blog.csdn.net/Apricity_L/article/details/137064982 "ubuntu安装Docker（超级详细，常见错误解决方案也有附上）")