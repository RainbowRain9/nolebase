---
created: 2025-05-27T19:27
updated: 2025-05-27T19:54
---

# Windows远程桌面连接Ubuntu16.04服务器配置指南

## 安装与配置步骤

### 1. 在Linux主机上安装XFCE桌面环境

```bash
sudo apt update
sudo apt install xubuntu-desktop -y
```

这会下载并安装XFCE桌面环境以及一些相关的基本应用程序。这个过程可能需要一些时间。

### 2. 配置 `~/.xsession` 文件以使用XFCE

```bash
echo '#!/bin/sh' > ~/.xsession
echo 'unset DBUS_SESSION_BUS_ADDRESS' >> ~/.xsession
echo 'unset XDG_RUNTIME_DIR' >> ~/.xsession
echo 'startxfce4' >> ~/.xsession # 这一行是关键，启动XFCE
chmod +x ~/.xsession
```

**注意：** 我们将 `. /etc/X11/Xsession` 替换为 `startxfce4`，因为我们希望 `xrdp` 直接启动XFCE会话。

### 3. 重启 `xrdp` 服务

```bash
sudo systemctl restart xrdp
```

### 4. 从Windows客户端连接

- 使用Windows的"远程桌面连接"客户端
- 连接到你的Linux主机的Tailscale IP (例如 `100.71.73.88`)
- 在 `xrdp` 登录界面，**仍然选择 `sesman-Xvnc` 模块**
- 输入你的Linux用户名和密码

## 已知问题与解决方案

### 已知Bug

- **远程桌面与ToDesk冲突**：启用远程桌面后，无法使用ToDesk等靠服务器中转的远程控制程序

### 解决ToDesk连接冲突

如需使用ToDesk连接，需要临时关闭xrdp服务：

```bash
sudo systemctl stop xrdp
```

然后重启系统以确保完全释放相关资源：

```bash
sudo reboot
```

使用完ToDesk后，如需恢复远程桌面功能，重新启动xrdp服务：

```bash
sudo systemctl start xrdp
```

### 推荐连接方式

- **使用Tailscale打洞**：避开服务器中转，直接建立P2P连接
- **校园网环境**：在同一校园网环境下使用，可以获得较低的连接延迟
- **实操建议**：在校园网环境中使用Tailscale打洞进行连接效果最佳

### Tailscale连接状态检查

使用以下命令检查Tailscale连接状态：

```bash
tailscale status
```

连接状态说明：

- **direct**：表示打洞成功，已建立P2P直连（理想状态）
- **relay**：表示打洞失败，正通过Tailscale服务器中转流量（性能较差）

示例输出：

```
100.71.73.88    robot102-ms-7b79     rainbowxxx@ linux   -
100.97.160.1    rainbowrain          rainbowxxx@ windows active; direct 10.98.4.9:41641, tx 497612616 rx 17823288
100.65.210.17   samsung-sm-s9180     rainbowxxx@ android offline
```

在这个示例中，Windows设备显示"direct"表示已成功建立P2P连接。