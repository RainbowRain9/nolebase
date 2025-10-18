

这份教程将从一个全新的树莓派开始，涵盖所有必要的步骤，确保你或其他任何人都能一次性成功搭建这套系统。

---

### **树莓派无人机数传系统搭建终极教程 (MAVProxy + QGroundControl)**

本教程旨在指导你如何使用树莓派作为机载“伴侣计算机”，连接到Pixhawk等飞控的串口，并通过Wi-Fi网络将MAVLink遥测数据实时传输到地面站电脑上运行的QGroundControl (QGC)。

#### **系统架构**

`飞控` <-- `USB/串口线` --> `树莓派 (运行 MAVProxy)` <-- `Wi-Fi/局域网` --> `地面站电脑 (运行 QGC)`

---

### **第一部分：树莓派基础配置**

**目标：** 准备一个干净、网络通畅的树莓派操作系统。

1.  **烧录操作系统：**
    *   使用 "Raspberry Pi Imager" 工具，将最新版的 **Raspberry Pi OS Lite (64-bit)** 烧录到SD卡中。Lite版没有桌面环境，资源占用更少，更适合做服务器。
    *   在烧录设置中，提前配置好你的 **Wi-Fi名称和密码**，并 **启用SSH服务**。这可以让你从一开始就通过网络远程控制树莓派。

2.  **首次启动与连接：**
    *   将SD卡插入树莓派，通电启动。
    *   在你的电脑上打开终端（Windows上可用PowerShell或PuTTY），通过SSH连接到树莓派。你需要知道树莓派的IP地址（可以在路由器管理页面找到）。
    ```bash
    # 示例命令，将 zff 和 raspberrypi.local 替换为你的用户名和IP地址
    ssh zff@raspberrypi.local 
    ```

3.  **更新系统：**
    *   连接成功后，首先更新软件包列表和已安装的软件，确保系统是最新状态。
    ```bash
    sudo apt update
    sudo apt upgrade -y
    ```

---

### **第二部分：树莓派软件安装与配置**

**目标：** 安装运行MAVProxy所需的所有软件。

1.  **安装Python及依赖：**
    *   Raspberry Pi OS通常自带Python3。我们还需要安装pip（Python包管理器）和一些编译MAVProxy所需的依赖。
    ```bash
    sudo apt install python3-pip python3-venv screen -y
    ```
    *   `screen` 是一个终端复用工具，可以让我们在关闭SSH连接后，依然保持MAVProxy在后台运行（`systemd`是更好的方式，后面会讲）。

2.  **创建并激活Python虚拟环境 (推荐)：**
    *   为MAVProxy创建一个独立的环境，可以避免与系统其他Python包冲突。
    ```bash
    # 在你的主目录下创建虚拟环境
    python3 -m venv mavproxy_venv

    # 激活虚拟环境
    source mavproxy_venv/bin/activate
    ```
    *   激活后，你的终端提示符前会出现 `(mavproxy_venv)`。之后所有`pip install`命令都将安装在这个独立环境中。

3.  **安装MAVProxy：**
    *   在已激活的虚拟环境中，使用pip安装MAVProxy。
    ```bash
    pip install MAVProxy
    ```

---

### **第三部分：物理连接与串口配置**

**目标：** 正确连接飞控与树莓派，并配置树莓派串口。

1.  **物理接线：**
    *   将飞控的遥测端口（TELEM1或TELEM2）与树莓派的GPIO引脚连接。
    *   **接线原则：发送(TX)接接收(RX)，接收(RX)接发送(TX)。**
        *   飞控 `GND` <--> 树莓派 `GND` (任意一个GND引脚)
        *   飞控 `TX`  <--> 树莓派 `RX` (GPIO 15)
        *   飞控 `RX`  <--> 树莓派 `TX` (GPIO 14)
    *   **注意：** 飞控串口的VCC（电源）线**不要**连接到树莓派，以免造成电源冲突。飞控和树莓派应独立供电。

2.  **配置树莓派串口：**
    *   默认情况下，树莓派的硬件串口（`/dev/ttyAMA0`）被用作Linux的串行控制台。我们必须禁用它，才能让MAVProxy使用。
    ```bash
    sudo raspi-config
    ```
    *   在菜单中，选择 `3 Interface Options` -> `I6 Serial Port`。
    *   第一个问题 "Would you like a login shell to be accessible over serial?" 选择 **`<No>`**。
    *   第二个问题 "Would you like the serial port hardware to be enabled?" 选择 **`<Yes>`**。
    *   保存退出，并根据提示重启树莓派。

3.  **确认飞控串口参数：**
    *   登录你的地面站（例如在电脑上用USB直连飞控），检查你所连接的遥测端口（如SERIAL1或SERIAL2）的参数：
        *   `SERIALx_PROTOCOL` 应设置为 `1` (MAVLink 1) 或 `2` (MAVLink 2)。推荐使用 `2`。
        *   `SERIALx_BAUD` 应设置为你希望的波特率，例如 `57600` 或 `115200`。**这个波特率必须与之后MAVProxy命令中的波特率完全一致。**

---

### **第四部分：启动MAVProxy并建立数据链路**

**目标：** 在树莓派上成功运行MAVProxy，并将其配置为UDP数据转发器。

1.  **获取地面站电脑的IP地址：**
    *   在你的**地面站电脑**上打开终端或命令提示符，查找其在局域网中的IP地址。
    *   **Linux/macOS:** `ip addr` 或 `ifconfig`
    *   **Windows:** `ipconfig`
    *   记下这个IP地址，例如 `192.168.100.171`。

2.  **启动MAVProxy：**
    *   SSH连接到树莓派，并激活Python虚拟环境。
    ```bash
    source mavproxy_venv/bin/activate
    ```
    *   执行以下命令启动MAVProxy。**这是整个流程中最关键的命令。**
    ```bash
    # 将波特率 115200 和 IP 地址 192.168.100.171 替换为你的实际配置
    mavproxy.py --master=/dev/ttyAMA0,115200 --out=udp:192.168.100.171:14550
    ```    *   **命令解析：**
        *   `--master=/dev/ttyAMA0,115200`: 指定MAVProxy的主连接。`/dev/ttyAMA0` 是树莓派的硬件串口，`115200` 是与飞控约定的波特率。
        *   `--out=udp:192.168.100.171:14550`: 创建一个UDP输出。数据将被**单播**到你地面站电脑的IP地址 (`192.168.100.171`) 的 `14550` 端口。这是最稳定可靠的方式。

3.  **验证MAVProxy连接：**
    *   如果一切正常，你会在终端看到类似输出，证明MAVProxy已成功连接飞控：
    ```
    Connect /dev/ttyAMA0,115200 source_system=255
    Log Directory: 
    Telemetry log: mav.tlog
    Waiting for heartbeat from /dev/ttyAMA0
    MAV> Detected vehicle 1:1 on link 0
    online system 1
    ...
    Received 818 parameters
    ```

---

### **第五部分：地面站电脑配置与连接**

**目标：** 在地面站电脑上安装并配置QGC，接收来自树莓派的数据。

1.  **下载并安装QGroundControl：**
    *   访问 QGroundControl官网 [<sup>1</sup>](http://qgroundcontrol.com/downloads/) 下载并安装适合你操作系统的最新版本。

2.  **连接到MAVLink流：**
    *   确保你的电脑和树莓派连接在**同一个Wi-Fi或局域网**下。
    *   **先启动树莓派上的MAVProxy**，让数据流开始发送。
    *   然后打开QGroundControl。在大多数情况下，QGC会自动检测到网络中 `14550` 端口的MAVLink数据流，并自动连接。你会看到界面上的仪表盘开始跳动，地图上出现飞机图标。

3.  **手动配置UDP连接 (如果自动连接失败)：**
    *   点击QGC左上角的紫色 "Q" 图标，进入 **Application Settings (应用程序设置)**。
    *   选择左侧的 **Comm Links (通讯连接)**。
    *   点击 **Add (添加)** 按钮。
    *   **类型(Type):** 选择 `UDP`。
    *   **名称(Name):** 输入一个自定义名称，如 "树莓派数传"。
    *   **Listening Port (监听端口):** 保持默认的 `14550`。
    *   点击 **OK** 保存。
    *   **【重要】** 在Comm Links页面，你可能会看到新创建的连接。**此时，请完全关闭QGroundControl，然后重新打开它。**
    *   **QGC的某些系统设置（尤其是通讯连接的更改）需要重启应用才能完全生效。**
    *   重启后，QGC应该会使用你新配置的UDP链接进行监听和连接。

---

### **第六部分：自动化运行 (推荐)**

**目标：** 将MAVProxy设置为开机自启动的后台服务，实现“上电即用”。

1.  在树莓派上，创建一个`systemd`服务文件：
    ```bash
    sudo nano /etc/systemd/system/mavproxy.service
    ```

2.  将以下内容粘贴到文件中，并**修改 `ExecStart` 行中的IP地址为你电脑的实际IP**：
    ```ini
    [Unit]
    Description=MAVProxy Service for Drone Telemetry
    After=network.target

    [Service]
    ExecStart=/home/zff/mavproxy_venv/bin/mavproxy.py --master=/dev/ttyAMA0,115200 --out=udp:192.168.100.171:14550
    Restart=on-failure
    User=zff
    Group=zff
    WorkingDirectory=/home/zff

    [Install]
    WantedBy=multi-user.target
    ```
    *   **注意：** `ExecStart` 和 `User` 等路径和用户名要换成你自己的。

3.  保存并退出 (`Ctrl+X`, `Y`, `Enter`)。

4.  启用并启动服务：
    ```bash
    sudo systemctl daemon-reload          # 重新加载systemd配置
    sudo systemctl enable mavproxy.service  # 设置开机自启动
    sudo systemctl start mavproxy.service   # 立即启动服务
    ```

5.  检查服务状态：
    ```bash
    sudo systemctl status mavproxy.service
    ```
    如果看到 `Active: active (running)`，则表示服务已在后台成功运行。

至此，你已经成功搭建了一套强大、稳定且可扩展的无人机数传系统。每次飞行时，只需给飞控和树莓派通电，它们就会自动连接并将数据发送到你的地面站电脑。