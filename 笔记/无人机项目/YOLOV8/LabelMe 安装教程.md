# LabelMe 安装教程 (适用于您当前的项目环境)

**前提条件：**

*   您已经按照之前的方式创建并激活了名为 `yolo8` 的Python虚拟环境。
*   您的网络连接正常，以便下载安装包。

**安装步骤：**

1.  **打开命令行工具：**
    *   您可以直接在Windows搜索栏搜索 "cmd" 或 "PowerShell" 并打开它。

2.  **导航到您的项目目录（可选，但推荐）：**
    *   在命令行中输入以下命令并按回车，进入您的项目根目录：
        ```bash
        cd D:\Code\github\yolo_project
        ```
    *   虽然不是必须在此目录下操作，但通常保持在项目根目录进行环境管理是个好习惯。

3.  **激活您的 `yolo8` 虚拟环境：**
    *   在命令行中输入以下命令并按回车：
        ```bash
        yolo8\Scripts\activate
        ```
    *   成功激活后，您应该会在命令行提示符前看到 `(yolo8)` 字样，例如：
        `(yolo8) D:\Code\github\yolo_project>`

4.  **使用pip安装LabelMe：**
    *   在已激活的 `yolo8` 环境中，输入以下命令并按回车来安装LabelMe：
        ```bash
        pip install labelme
        ```
    *   pip会自动下载并安装LabelMe及其依赖包。请耐心等待安装完成。

5.  **验证安装（可选）：**
    *   安装完成后，您可以输入以下命令来验证LabelMe是否成功安装：
        ```bash
        labelme --help
        ```
    *   如果安装成功，您会看到LabelMe的帮助信息和可用命令选项。

6.  **启动LabelMe：**
    *   要启动LabelMe图形界面，只需在已激活 `yolo8` 环境的命令行中输入：
        ```bash
        labelme
        ```
    *   这会打开LabelMe的标注工具。

**提示：**

*   **依赖问题：** 如果在安装过程中遇到关于 `PyQt5` 或其他依赖的错误，可以尝试单独安装它们，然后再安装LabelMe：
    ```bash
    pip install PyQt5
    pip install labelme
    ```
*   **更新pip：** 确保您的pip是最新版本，有时旧版pip可能导致安装问题：
    ```bash
    python -m pip install --upgrade pip
    ```
*   **集成到 `workflows.bat`：** 您之前提供的 `workflows.bat` 脚本中已经包含了启动LabelMe的选项（选项1）。只要LabelMe在您的 `yolo8` 虚拟环境中正确安装，该脚本的相应功能就能正常工作。

现在，您应该可以在您的 `yolo8` 虚拟环境中成功使用LabelMe进行图像标注了。