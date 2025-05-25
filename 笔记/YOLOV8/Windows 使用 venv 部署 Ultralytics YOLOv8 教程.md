---
created: 2025-05-19T23:16
updated: 2025-05-19T23:29
---

# Windows 使用 venv 部署 Ultralytics YOLOv8 教程

本教程将指导您在 Windows 系统上，使用 Python 内置的 `venv` 工具创建虚拟环境，并在指定目录 (`D:\Code\github\yolo_project`) 中安装和运行 Ultralytics YOLOv8。

**前提条件：**

1. **已安装 Python：** 确保您已经在 Windows 上安装了 Python (推荐版本 3.8 - 3.11)。您可以从 Python 官网 ([python.org](http://python.org/)) 下载并安装。
    - **重要：** 在安装 Python 时，请务必勾选 "Add Python to PATH" (或类似选项)，这样才能在命令行中直接使用 `python` 命令。
2. **命令行工具：** 您可以使用 Windows 的 `cmd` (命令提示符) 或者 `PowerShell`。本教程将以 `cmd` 为例，命令在 `PowerShell` 中也基本通用。

---

## 步骤 1：创建项目目录

首先，我们创建您希望存放项目的文件夹。

1. 打开文件资源管理器，导航到 `D:\Code\github\`。
2. 在 `github` 文件夹内，创建一个新的文件夹，例如命名为 `yolo_project`。
    - 所以您的项目路径将是 `D:\Code\github\yolo_project`

---

## 步骤 2：创建并激活 venv 虚拟环境 (yolo8)

现在，我们将在项目目录中创建虚拟环境。

1. **打开命令提示符 (cmd)：**
    
    - 您可以在 Windows 搜索栏输入 `cmd` 并打开 "命令提示符"。
2. **导航到项目目录：** 在命令提示符中输入以下命令，然后按 Enter：

    ```
    D:
    cd D:\Code\github\yolo_project
    
    ```

    (如果您的 `Code` 或 `github` 文件夹不存在，请先创建它们，或者直接使用 `cd D:\` 然后 `mkdir Code`，`cd Code`，`mkdir github`，`cd github`，`mkdir yolo_project`，`cd yolo_project`)
    
3. **创建虚拟环境：** 在 `D:\Code\github\yolo_project` 目录下，输入以下命令来创建一个名为 `yolo8` 的虚拟环境：

    ```
    python -m venv yolo8
    
    ```

    执行完毕后，您会在 `D:\Code\github\yolo_project` 目录下看到一个名为 `yolo8` 的新文件夹，这就是您的虚拟环境。
    
4. **激活虚拟环境：** 要开始使用虚拟环境，您需要激活它。在命令提示符中，输入以下命令：

    ```
    yolo8\Scripts\activate
    
    ```

    激活成功后，您会看到命令行提示符的开头出现了 `(yolo8)`，如下所示：

    ```
    (yolo8) D:\Code\github\yolo_project>
    
    ```

    这表示您现在正处于 `yolo8` 虚拟环境中，之后所有通过 `pip` 安装的包都将安装到这个环境中，而不会影响全局 Python 环境。

---

## 步骤 3：安装 Ultralytics YOLOv8

在激活的虚拟环境中，我们可以使用 `pip` 来安装 Ultralytics 包。

1. 确保您的虚拟环境已激活 (提示符前有 `(yolo8)`)。
    
2. 输入以下命令安装 `ultralytics`：`pip` 会自动下载并安装 `ultralytics` 包及其所有依赖项 (如 PyTorch, OpenCV 等)。这个过程可能需要一些时间，具体取决于您的网络速度。

    ```
    pip install ultralytics
    
    ```
    
3. **（可选）升级 pip 和 setuptools：** 为了确保最佳兼容性，可以先升级 pip 和 setuptools： 然后再执行 `pip install ultralytics`。

    ```
    python -m pip install --upgrade pip setuptools
    
    ```

---

## 步骤 4：准备测试图片和模型

1. **准备测试图片：** 将您想要测试的图片（例如，我们之前讨论的 `1.jpg`）放到您的项目目录 `D:\Code\github\yolo_project` 中，或者您可以指定图片的完整路径。
2. **模型文件 (`.pt`)：** 当您运行 YOLOv8 命令时，如果本地没有对应的 `.pt` 模型文件，它会自动尝试下载。
    - 如果您在之前的 WSL 尝试中已经成功下载了 `yolov8s-seg.pt`，您可以将其复制到 `D:\Code\github\yolo_project` 目录中，这样可以避免重新下载。
    - 如果网络下载仍然有问题，您可以像之前讨论的那样，手动从浏览器下载模型文件 (例如 `yolov8s-seg.pt` 来自 `https://github.com/ultralytics/assets/releases/download/v8.3.0/yolov8s-seg.pt`) 并将其放入项目目录。

---

## 步骤 5：运行 YOLOv8 预测

现在，一切准备就绪，可以在激活的虚拟环境中运行 YOLOv8 了。

1. 确保您的虚拟环境已激活，并且您位于项目目录 `D:\Code\github\yolo_project`。
    
2. 假设您的测试图片是 `1.jpg`，并且您想使用 `yolov8s-seg.pt` 模型进行图像分割，并且希望在 CPU 上运行并显示结果。在命令提示符中输入：

    ```
    yolo task=segment mode=predict model=yolov8s-seg.pt source="1.jpg" show=True device=cpu
    
    ```
    
    - `task=segment`: 指定任务为分割。
    - `mode=predict`: 指定模式为预测。
    - `model=yolov8s-seg.pt`: 指定使用的模型。如果此文件不在当前目录，YOLO 会尝试下载。如果已下载并放在当前目录，则直接使用。
    - `source="1.jpg"`: 指定输入图片。如果图片不在当前目录，请提供完整路径，例如 `source="D:\path\to\your\image.jpg"`。
    - `show=True`: 会尝试显示带有结果的图片。
    - `device=cpu`: 明确指定使用 CPU 运行。

---

## 步骤 6：查看结果

- 如果 `show=True` 成功执行，您应该会看到一个窗口弹出，显示带有分割结果的图片。
- YOLOv8 通常会将结果保存在项目目录下的 `runs` 文件夹内的一个子文件夹中（例如 `runs\segment\predict`）。您可以去这个文件夹查看保存的图片或视频。

---

## 步骤 7：退出虚拟环境

当您完成工作，想要退出虚拟环境时，在命令提示符中输入：

```
deactivate

```

执行后，命令行提示符会恢复到正常状态，不再显示 `(yolo8)`。

---

## 可选：后续使用

- **重新激活环境：** 当您下次想在这个项目中工作时，只需：
    1. 打开命令提示符。
    2. 导航到项目目录: `cd D:\\\\Code\\\\github\\\\yolo_project`
    3. 激活虚拟环境: `yolo8\\\\Scripts\\\\activate`
- **安装其他包：** 如果您的项目需要其他 Python 包，确保先激活虚拟环境，然后再使用 `pip install <package_name>` 安装。

---

**注意事项：**

- **网络问题：** 如果 `pip install ultralytics` 或模型自动下载失败，请检查您的网络连接和防火墙设置。您可能需要配置代理，或者手动下载 `.whl` 文件进行安装（对于 `ultralytics`）和 `.pt` 文件（对于模型）。
- **PyTorch 版本：** `ultralytics` 会自动安装兼容的 PyTorch 版本。通常您不需要手动干预。
- **管理员权限：** 一般情况下，创建虚拟环境和安装包不需要管理员权限。只有当您尝试向受保护的系统目录写入时才需要。

---

希望这个教程能帮助您顺利在 Windows 上使用 `venv` (名为 `yolo8` 的环境) 部署和运行 YOLOv8！如果您在任何步骤遇到问题，请随时告诉我。