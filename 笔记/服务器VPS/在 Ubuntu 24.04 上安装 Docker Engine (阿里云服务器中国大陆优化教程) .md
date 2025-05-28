## **在 Ubuntu 24.04 上安装 Docker Engine (阿里云服务器/中国大陆优化教程) **

Docker 是个好东西，它像一个“魔法集装箱”，能把你的应用程序和它需要的所有东西都打包在一起，然后轻松地在任何地方运行，非常方便。本教程会手把手教你如何在 Ubuntu 24.04 (一个代号叫“Noble Numbat”的系统) 上安装 Docker，并且特别针对咱们中国大陆用户（尤其是用阿里云服务器的朋友）可能遇到的网络问题给出了优化方案。

---

### **第一步：清理“旧房子”并打好“地基” (卸载旧版 Docker 及系统准备)**

为了让新版 Docker 能顺利安家，咱们最好先把系统里可能存在的旧版 Docker 给“请出去”，免得它们打架。

1.  **删除旧的 Docker “指路牌”：**
    ```bash
    sudo rm -f /etc/apt/sources.list.d/*docker*.list
    ```
    * 这行命令是告诉系统：“以前指向旧 Docker 下载地址的那些‘指路牌’（配置文件），都删掉吧！”

2.  **卸载可能已安装的旧版 Docker 相关程序：**
    ```bash
    for pkg in docker.io docker-buildx-plugin docker-ce-cli docker-ce-rootless-extras docker-compose-plugin docker-doc docker-compose podman-docker containerd runc; do sudo apt-get remove -y $pkg; done
    ```
    * **小提示：** 这条命令会尝试删除一堆和 Docker 相关的旧软件包。如果系统提示某些包“找不到”（比如 `E: Unable to locate package docker.io`），别担心，这很正常！说明你之前就没装过这些，直接忽略就好。

3.  **（可选）彻底清扫 Docker 的“家”：**
    Docker 平时把它的所有宝贝——比如下载的镜像（可以理解为软件安装包）、你创建的容器（运行中的软件实例）、保存的数据（卷）和网络设置——都放在 `/var/lib/docker/` 这个文件夹里。卸载 Docker 程序本身并不会动这些数据。如果你想彻底清扫，让一切从零开始，就运行下面这两条命令：
    ```bash
    sudo rm -rf /var/lib/docker
    sudo rm -rf /var/lib/containerd
    ```
    * **严重警告：** **这会永久删除所有 Docker 数据！** 就像格式化硬盘一样。执行前一定一定确认这些数据你不再需要了！

4.  **更新系统“花名册”并安装“开工家伙”：**
    在装 Docker 之前，咱们先让系统更新一下可安装软件的列表，并装上几个后面会用到的“辅助工具”。
    ```bash
    sudo apt-get update
    sudo apt-get -y install apt-transport-https ca-certificates curl software-properties-common gnupg lsb-release
    ```
    * 这些工具能帮我们更安全、更方便地添加 Docker 的官方下载地址和管理软件包。

---

### **第二步：告诉系统从哪里下载 Docker (添加 Docker 软件包源)**

官方的 Docker 下载地址在国外，咱们国内访问可能有点慢或者不稳定。好在阿里云提供了国内的镜像服务器，速度快多了！我们就用它。

1.  **获取 Docker 的“官方认证章”（GPG 密钥）：**
    这个密钥就像一个官方印章，能保证我们下载的 Docker 软件是正版、没被篡改过的，用起来才放心。
    首先，咱们给这个“认证章”专门创建一个存放的安全文件夹（如果它还不存在的话）：
    ```bash
    sudo install -m 0755 -d /etc/apt/keyrings
    ```
    接着，从阿里云的镜像站下载这个“认证章”并添加到系统里：
    ```bash
    sudo curl -fsSL http://mirrors.cloud.aliyuncs.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -
    ```
    * `curl` 是一个下载工具，`|` 这个符号像个管道，把下载下来的密钥直接交给 `apt-key add -` 命令加到系统里。
    * **非阿里云服务器用户请注意：** 如果你的服务器不是阿里云的，或者你想用公共的阿里云镜像，可以把命令里的 `http://mirrors.cloud.aliyuncs.com` 换成 `https://mirrors.aliyun.com`（多了个 `s`，更安全）。

2.  **把阿里云的 Docker 下载地址加入系统的“软件商店列表”：**
    ```bash
    sudo add-apt-repository -y "deb [arch=$(dpkg --print-architecture)] http://mirrors.cloud.aliyuncs.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"
    ```
    * 这条命令会自动帮你识别电脑的类型（比如是普通的 64 位电脑还是其他架构）和 Ubuntu 系统的版本代号（比如 `noble`），然后把阿里云的 Docker 下载地址加到系统配置里。
    * **非阿里云服务器用户请注意：** 同样，如果需要，把命令里的 `http://mirrors.cloud.aliyuncs.com` 换成 `https://mirrors.aliyun.com`。

3.  **刷新一下“软件商店列表”：**
    添加了新的下载地址后，得告诉系统一声，让它更新下列表，这样才能找到 Docker。
    ```bash
    sudo apt-get update
    ```
    * **网络小贴士：** 如果这一步卡住不动或者报错，可能是网络不太给力。别急，教程末尾有专门的**“通用问题排查：网络连接问题”**部分帮你解决。

---

### **第三步：正式安装 Docker 和它的小伙伴们**

准备工作都做好了，现在可以正式安装 Docker 啦！

1.  **一键安装 Docker 主要部件：**
    ```bash
    sudo apt-get -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```
    * 这条命令会安装：
        * `docker-ce`: Docker 社区版，也就是 Docker 本尊。
        * `docker-ce-cli`: Docker 的命令行工具，我们之后就用它来指挥 Docker 干活。
        * `containerd.io`: 这是 Docker 运行容器的核心底层组件，可以理解为 Docker 的“发动机”。
        * `docker-buildx-plugin`: 一个高级工具，能帮你构建适用于多种不同电脑类型的镜像。
        * `docker-compose-plugin`: 用来管理多个容器组成的应用集群，非常方便。

---

### **第四步：启动 Docker 并让它“常驻后台”**

安装好了，我们得启动 Docker 服务，并设置成每次开机都自动运行，省得我们每次都手动开。

1.  **启动 Docker 服务：**
    ```bash
    sudo systemctl start docker
    ```

2.  **让 Docker 开机自动启动：**
    ```bash
    sudo systemctl enable docker
    ```

---

### **第五步：检查一下 Docker 是否安装成功**

跑几个简单的命令，看看 Docker 是不是已经在你的系统里“安家落户”并且能正常工作了。

1.  **问问 Docker 的版本号：**
    ```bash
    sudo docker -v
    ```
    如果屏幕上显示出 Docker 的版本信息（比如 `Docker version 24.0.7, build 4afbf8c`），那就说明 Docker 主程序已经装好了！

2.  **让 Docker 跑个“Hello World”打个招呼：**
    ```bash
    sudo docker run hello-world
    ```
    * 你可能会先看到 `Unable to find image 'hello-world:latest' locally` 这样的提示。**别慌，这不是报错！** 它只是说：“我本地没找到这个叫 `hello-world` 的小程（镜）序（像），我正尝试从网上帮你下载呢。”
    * 如果一切顺利，稍等片刻，你就会看到来自 Docker 的欢迎信息：
        ```
        Hello from Docker!
        This message shows that your installation appears to be working correctly.
        ...
        ```
    * 看到这个，就说明 Docker Engine 已经成功运行，并且能够从网上（我们配置的阿里云镜像源）下载并运行容器啦！因为用了阿里云的源，下载通常会比较快。

---

### **第六步：给 Docker 下载镜像再加个“速”（配置 Docker 镜像加速器，强烈推荐！）**

虽然咱们安装 Docker 时用了阿里云的下载地址，但是 Docker 在拉取**其他程序镜像**（比如你想运行一个 Nginx 或者 MySQL 镜像）时，默认还是会去国外的 Docker Hub (registry-1.docker.io) 下载。在国内，这速度可能就不太理想了，甚至会超时失败。配置一个国内的“镜像加速器”就能解决这个问题。

1.  **找到你的阿里云“身份证号”（账号 ID）：**
    要用阿里云的镜像加速器，你需要知道你的阿里云账号 ID。
    * 登录 [阿里云控制台](https://www.aliyun.com/)。
    * 鼠标移到页面**右上角你的头像**上，在弹出的菜单里就能看到你的 **“账号 ID”**（通常是一串数字）。把它记下来。

2.  **登录阿里云容器镜像服务，拿到专属“加速通道”地址：**
    * 访问 [阿里云容器镜像服务控制台](https://cr.console.aliyun.com/)。
    * 在左边的导航栏里找到并点击 **“镜像加速器”**。页面上会显示一个为你生成的专属加速器地址，格式一般是 `https://<你的ID>.mirror.aliyuncs.com`。**复制这个完整的地址。**

3.  **创建或修改 Docker 的“配置文件”：**
    我们需要把这个加速器地址告诉 Docker。
    ```bash
    sudo nano /etc/docker/daemon.json
    ```
    * `nano` 是一个文本编辑器。如果这个文件不存在，这条命令会自动创建一个新文件。

4.  **把“加速通道”地址写进配置文件：**
    在打开的文件里，填入以下内容。记得把你自己的专属加速器地址替换掉 `<你的阿里云ID>` 部分。你也可以加上其他公共的加速器地址作为备用，万一哪个挂了还有其他的。

    **`daemon.json` 文件内容示例：**
    ```json
    {
      "registry-mirrors": [
        "https://<你的阿里云ID>.mirror.aliyuncs.com",  // 务必替换成你自己的专属加速器地址！
        "https://docker.mirrors.ustc.edu.cn",         // 中科大的公共加速器（备用选项）
        "http://hub-mirror.c.163.com"                // 网易的公共加速器（备用选项，注意是 http）
      ]
    }
    ```
    * **敲黑板，重点来了：**
        * **JSON 这种格式要求非常严格！** 所有的文字（比如 `registry-mirrors` 和那些网址）都必须用**英文双引号 `"`** 包起来。
        * 如果有多个加速器地址，它们之间用**英文逗号 `,`** 隔开，但最后一个地址后面**不能有逗号**。
        * 整个内容必须被一对 **花括号 `{}`** 包围。
        * 如果 `daemon.json` 文件之前就有其他内容，确保把 `"registry-mirrors": [...]` 这一整块正确地加到 JSON 对象里，和其他项目之间用逗号隔开。**如果不确定，最简单的方法是先清空文件，然后把上面的示例完整复制粘贴进去（替换好你自己的ID）。**

    编辑完成后，在 `nano` 编辑器里：
    1.  按 `Ctrl + O` (是字母O，不是数字0)，然后按 `回车`，保存文件。
    2.  按 `Ctrl + X`，退出编辑器。

5.  **让 Docker “重新上岗”并应用新配置：**
    ```bash
    sudo systemctl daemon-reload   # 通知系统 Docker 的配置变了
    sudo systemctl restart docker  # 重启 Docker 服务，让新配置生效
    ```

6.  **再跑一次 `hello-world` 试试（非必须，但推荐）：**
    重启 Docker 后，再运行一次 `hello-world`，理论上它会尝试通过加速器下载（如果本地还没有的话），或者直接运行（如果已经下载过了）。
    ```bash
    sudo docker run hello-world
    ```

---

### **第七步：让自己用 Docker 更“潇洒” (将当前用户添加到 `docker` 用户组，可选但强烈推荐)**

默认情况下，每次敲 `docker` 命令前面都得加个 `sudo`，表示“用管理员权限运行”，有点小麻烦。我们可以把自己（当前登录的用户）加入到一个叫 `docker` 的特殊用户组里，之后就不用每次都敲 `sudo` 了。

1.  **把自己拉进 `docker` 组：**
    ```bash
    sudo usermod -aG docker ${USER}
    ```
    * `${USER}` 是个特殊变量，它会自动替换成你当前登录的用户名。`-aG` 的意思是把用户追加（add）到指定的组（Group）。

2.  **让“组员证”生效：**
    这个组的更改不会马上生效。你需要：
    * **对于远程服务器（通过 SSH 连接的）：** 关闭当前的 SSH 连接窗口，然后重新连接一次。
    * **对于有图形界面的 Ubuntu 桌面版：** 注销当前用户，然后重新登录。
    * **最简单粗暴但有效的方法：** 直接重启你的服务器或虚拟机。

    * 有个 `newgrp docker` 命令有时也能临时切换，但它只在当前终端窗口生效，而且不总是完美解决问题，所以还是推荐上面的方法。

3.  **验证一下，不带 `sudo` 试试：**
    重新登录（或重启）后，打开一个新的终端，试试不加 `sudo` 运行 Docker 命令：
    ```bash
    docker run hello-world
    ```
    如果它能顺利跑起来，恭喜你！以后用 Docker 就更方便了。

---

## **通用问题排查：网络连接“疑难杂症”**

如果你的服务器在安装过程中，即使用了阿里云的镜像源，还是遇到网络不给力的情况（比如 `curl` 命令下载失败，或者 `apt-get update` 卡住不动），可以试试下面这些额外的“药方”：

1.  **手动下载 GPG “认证章”并上传 (如果 `curl` 下载密钥失败)：**
    如果 `sudo curl -fsSL http://mirrors.cloud.aliyuncs.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -` 这条命令老是失败，你可以：
    * **a) 在一台网络好的电脑上：** 用浏览器访问 `http://mirrors.cloud.aliyuncs.com/docker-ce/linux/ubuntu/gpg`，会看到一堆看起来像乱码的文本。把这些文本**全部复制**下来。
    * **b) 在你的 Ubuntu 服务器上：**
        ```bash
        sudo nano /etc/apt/trusted.gpg.d/docker.gpg
        ```
        把刚才复制的 GPG 密钥文本**粘贴**进去，然后保存并退出 (`Ctrl + O`, `回车`, `Ctrl + X`)。这样就手动把“认证章”放好了。

2.  **给 `apt-get` 命令“搭梯子”（配置 Apt 代理，如果 `apt-get update` 卡住）：**
    如果你手头有可用的 HTTP 或 SOCKS5 代理服务器，可以暂时让 `apt-get` 通过代理来下载东西。
    * **a) 创建或编辑 Apt 的代理配置文件：**
        ```bash
        sudo nano /etc/apt/apt.conf.d/proxy.conf
        ```
    * **b) 添加代理配置信息：**
        * **如果是 HTTP 代理：**
            `Acquire::http::Proxy "http://你的代理服务器IP:端口/";`
            `Acquire::https::Proxy "http://你的代理服务器IP:端口/";`
        * **如果是 SOCKS5 代理：**
            `Acquire::socks::Proxy "socks5://你的代理服务器IP:端口/";`
            把 `你的代理服务器IP:端口` 替换成你实际的代理地址和端口号。保存并退出。
    * **c) 再次尝试运行 `sudo apt-get update`。**
    * **重要：** 等 `apt-get update` 和 Docker 安装成功后，**一定记得把 `/etc/apt/apt.conf.d/proxy.conf` 文件里的代理配置删除掉，或者在每一行前面加个 `#` 注释掉**，不然以后系统更新可能会一直走代理，或者出其他问题。

---

太棒了！你现在已经在 Ubuntu 24.04 上成功安装了 Docker Engine，还学会了怎么对付那些烦人的网络问题。现在，你可以开始尽情探索 Docker 的强大功能，享受“一次打包，处处运行”的乐趣了！

如果在安装或使用过程中遇到任何搞不定的问题，别犹豫，随时可以提出来交流！