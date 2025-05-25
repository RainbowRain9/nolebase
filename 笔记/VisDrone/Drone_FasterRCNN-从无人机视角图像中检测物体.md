---
title: Drone_FasterRCNN-从无人机视角图像中检测物体
created: 2025-05-18
source: Cherry Studio
tags: 
updated: 2025-05-19T21:28
---
# Drone_FasterRCNN (WSL 2 + Conda 版本)

## 引言：Drone_FasterRCNN 仓库简介

`Drone_FasterRCNN` 是一个专注于从无人机视角图像中检测物体的项目。它是著名的 `maskrcnn-benchmark` 仓库的一个分支 (fork)，由用户 `oulutan` 维护。

### 主要功能与目的：

*   **无人机视角目标检测：** 其核心功能是利用 Faster R-CNN 模型，专门针对无人机拍摄的图像进行目标检测。正如其描述所说："Faster RCNN trained for detecting objects from drone views."
*   **基于 VisDrone 数据集训练：** 该项目提供了一个在 VisDrone 数据集 ([http://aiskyeye.com/](http://aiskyeye.com/)) 上训练好的模型检查点 (checkpoint)。这意味着模型已经学习了从无人机视角识别多种物体的能力。
*   **提供预训练模型和演示：** 仓库包含了预训练的模型权重（您需要从提供的 Google Drive 链接下载）和演示代码 (`drone_demo/demo.py`)，方便用户快速上手并在自己的无人机图像上进行测试。仓库中展示的示例图片和视频链接也直观地展示了其检测效果。
*   **继承 `maskrcnn-benchmark` 的强大能力：** 作为 `maskrcnn-benchmark` ([https://github.com/facebookresearch/maskrcnn-benchmark](https://github.com/facebookresearch/maskrcnn-benchmark)) 的分支，它继承了其高效、模块化的特性，支持 PyTorch 1.0，并具备较快的训练和推理速度、内存效率以及多 GPU 支持等优点（如原始 README 中所述）。

本教程将指导您如何在 WSL 2 环境下，使用 Conda 虚拟环境，根据您提供的指南一步步安装、配置并运行 `Drone_FasterRCNN` 项目，特别是其针对无人机视角的检测功能。

---

## 目标：

在 WSL 2 环境下，使用 Conda 管理环境，并根据您分享的指南成功安装和运行 `Drone_FasterRCNN`。

## 前提条件：

*   Windows 10 (版本 2004 或更高) 或 Windows 11。
*   WSL 2 已安装并已安装一个 Linux 发行版 (例如 Ubuntu)。**所有后续命令都应在您的 WSL 2 Linux 发行版的终端中执行。**
*   Anaconda 或 Miniconda 已安装 *在您的 WSL 2 Linux 发行版内*。
*   `git` (版本控制系统) 已安装 *在您的 WSL 2 Linux 发行版内*。
*   稳定的网络连接。
*   **对于 GPU 加速 (强烈推荐)：**
    *   一台拥有 NVIDIA GPU 的 Windows 主机。
    *   在 Windows 主机上安装了适用于 WSL 的最新 NVIDIA GPU 驱动。
    *   在您的 WSL 2 Linux 发行版内部安装了与 PyTorch 1.1.0 兼容的 CUDA Toolkit。（**注意：** 在 WSL 2 中配置 CUDA 可能较为复杂，请务必参考 NVIDIA 和 Microsoft 的官方文档。如果遇到困难，您可以先尝试 CPU 推理。）

---

## 步骤 1：在 WSL 2 中创建项目目录和 Conda 虚拟环境

1.  **创建项目目录 (在 WSL 2 中)：**
    打开您的 WSL 2 终端：
    ```bash
    mkdir ~/drone_fasterrcnn_project  # 您可以取任何您喜欢的名字
    cd ~/drone_fasterrcnn_project
    ```
    *后续所有操作都建议在此项目录下进行。*

2.  **创建并激活 Conda 虚拟环境 (在 WSL 2 中)：**
    我们将创建一个名为 `drone_frcnn_env` 的环境，并指定 Python 3.7 (PyTorch 1.1.0 对较旧的 Python 版本兼容性更好)。
    ```bash
    conda create -n drone_frcnn_env python=3.7 -y
    conda activate drone_frcnn_env
    ```
    成功激活后，您的终端提示符前应出现 `(drone_frcnn_env)`。

---

## 步骤 2：安装核心依赖 (根据您提供的指南)

1.  **安装指定版本的 PyTorch 和 TorchVision：**
    在激活的 `drone_frcnn_env` 环境中执行：
    ```bash
    pip install torch==1.1.0 torchvision==0.3.0 -f https://download.pytorch.org/whl/torch_stable.html
    ```
    *   **GPU 用户重要提示 (WSL 2)：**
        *   此命令默认可能安装 CPU 版本的 PyTorch。
        *   要使用 GPU，您必须确保已在 WSL 2 Linux 发行版内部正确安装了 CUDA Toolkit，并且该 CUDA 版本与 PyTorch 1.1.0 兼容。
        *   安装 PyTorch 后，您可以在 Python 解释器中检查 GPU 是否可用：
            ```python
            import torch
            print(f"PyTorch version: {torch.__version__}")
            print(f"CUDA available: {torch.cuda.is_available()}")
            if torch.cuda.is_available():
                print(f"CUDA version: {torch.version.cuda}")
                print(f"GPU name: {torch.cuda.get_device_name(0)}")
            ```
            如果 `torch.cuda.is_available()` 返回 `False`，则 PyTorch 将使用 CPU。

2.  **安装其他必要的 Python 依赖：**
    ```bash
    pip install ninja yacs cython matplotlib tqdm opencv-contrib-python
    ```

---

## 步骤 3：克隆 Drone_FasterRCNN 仓库并安装其组件

1.  **克隆 `Drone_FasterRCNN` 仓库：**
    确保您当前在项目目录 (`~/drone_fasterrcnn_project`) 下。
    ```bash
    git clone https://github.com/oulutan/Drone_FasterRCNN.git
    ```

2.  **进入仓库目录：**
    ```bash
    cd Drone_FasterRCNN
    ```
    *接下来的安装步骤都需要在此 `Drone_FasterRCNN` 目录下执行。*

3.  **安装 `pycocotools` (COCO API)：**
    根据指南，`pycocotools` 将在此处下载并安装。
    ```bash
    # 确保您在 ./Drone_FasterRCNN 目录下
    git clone https://github.com/cocodataset/cocoapi.git
    cd cocoapi/PythonAPI
    python setup.py build_ext install
    cd ../..
    ```
    执行完毕后，您应该回到了 `Drone_FasterRCNN` 目录下。

4.  **安装 `maskrcnn-benchmark` (PyTorch Detection)：**
    这将安装库并使用符号链接，方便您修改文件而无需重新构建。
    ```bash
    # 确保您在 ./Drone_FasterRCNN 目录下
    python setup.py build develop
    ```

---

## 步骤 4：测试基础安装 (可选，使用通用 Faster R-CNN 模型)

您的指南中提到了一个测试安装的步骤，它使用的是一个通用的预训练模型。

1.  **进入 `demo` 目录：**
    *注意：这不是 `drone_demo` 目录。*
    ```bash
    # 确保您在 ./Drone_FasterRCNN 目录下
    cd demo
    ```

2.  **下载预训练模型权重：**
    ```bash
    wget https://download.pytorch.org/models/maskrcnn/e2e_faster_rcnn_X_101_32x8d_FPN_1x.pth
    ```

3.  **运行测试脚本：**
    ```bash
    python demo.py
    ```
    这应该会运行一个使用下载的通用模型进行检测的演示。观察输出。

4.  **返回 `Drone_FasterRCNN` 主目录：**
    ```bash
    cd ..
    ```

---

## 步骤 5：运行无人机视角目标检测演示 (核心步骤)

这是针对无人机图像检测的部分，使用在 VisDrone 数据集上训练的模型。

1.  **下载 VisDrone 预训练模型权重：**
    根据指南，模型权重需要从以下链接下载：
    [https://drive.google.com/file/d/1SCJf2JJmyCbxpDuy4njFaDw7xPqurpaQ/view?usp=sharing](https://drive.google.com/file/d/1SCJf2JJmyCbxpDuy4njFaDw7xPqurpaQ/view?usp=sharing)

    *   **下载方法：** 建议使用 Windows 主机上的浏览器访问上述链接下载模型权重文件 (通常是 `.pth` 文件)。
    *   **放置文件：** 将下载好的模型权重文件移动到 WSL 2 项目的 `Drone_FasterRCNN/drone_demo/` 目录下。
        *   **方法 A (使用文件资源管理器)：** 在 Windows 文件资源管理器的地址栏输入 `\\wsl$` 或 `\\wsl.localhost\<your-distro-name>` (例如 `\\wsl.localhost\Ubuntu`)，然后导航到您的项目路径 (`home/<your_username>/drone_fasterrcnn_project/Drone_FasterRCNN/drone_demo/`)，将文件复制过去。
        *   **方法 B (使用 WSL 2 终端命令)：** 假设模型下载到了 Windows 的 `Downloads` 文件夹，文件名为 `model_visdrone.pth` (请根据实际下载的文件名调整)。在 WSL 2 终端中：
            ```bash
            # 确保您在 Drone_FasterRCNN 目录下
            # 示例路径，请根据您的 Windows 用户名和实际文件名修改
            cp /mnt/c/Users/YourWindowsUsername/Downloads/model_visdrone.pth ./drone_demo/
            ```
        *   **重要提示：** 检查 `drone_demo/demo.py` 脚本中加载模型的路径和文件名。如果下载的文件名与脚本中硬编码的文件名不同（例如，脚本可能期望 `model.pth` 或类似名称），您需要**重命名您下载的文件**以匹配脚本的期望，或修改脚本中的文件名。

2.  **进入 `drone_demo` 目录：**
    ```bash
    # 确保您在 ./Drone_FasterRCNN 目录下
    cd drone_demo
    ```

3.  **运行无人机演示脚本：**
    ```bash
    python demo.py
    ```

### 3.1. 可能遇到的问题与解决方案

在运行 `python demo.py` (尤其是在 `drone_demo` 目录下尝试运行无人机特定演示时) 时，您可能会遇到以下问题：

1.  **问题 1：CUDA GPU 不可用 (`RuntimeError: No CUDA GPUs are available`)**

    *   **现象：** 即使您没有 NVIDIA GPU，或者 WSL 2 中的 CUDA 配置不正确，程序默认可能仍尝试使用 GPU，导致类似以下的错误：
        ```
        Traceback (most recent call last):
          ...
        RuntimeError: No CUDA GPUs are available
        ```
        或者，如果 PyTorch 版本较新，可能是 `AssertionError: Torch not compiled with CUDA enabled`。
    *   **解决方案：强制使用 CPU**
        您需要修改 `predictor.py` 文件以强制模型在 CPU 上运行。根据项目的导入结构，这个文件通常是 `Drone_FasterRCNN/demo/predictor.py` (即使您是从 `drone_demo` 目录运行脚本，它也可能导入位于 `Drone_FasterRCNN/demo/` 目录下的 `predictor.py`)。
        打开 `~/drone_fasterrcnn_project/Drone_FasterRCNN/demo/predictor.py` 文件。
        找到类似以下的代码片段 (通常在 `COCODemo` 或类似类的 `__init__` 方法中)：
        ```python
        self.device = torch.device(cfg.MODEL.DEVICE)
        self.model.to(self.device)
        ```
        将其修改为：
        ```python
        # 强制使用CPU，忽略配置
        self.device = torch.device("cpu")
        self.model.to(self.device)
        ```
        保存文件后重试运行 `demo.py`。

2.  **问题 2：OpenCV `putText` 函数参数错误 (`cv2.error:... in function 'putText'`)**

    *   **现象：** 在模型成功加载并进行预测后，当脚本尝试将检测结果（如类别名称和置信度）绘制到图像上时，可能会遇到类似以下的错误：
        ```
        Traceback (most recent call last):
          File "demo.py", line 21, in <module>
            predictions = coco_demo.run_on_opencv_image(image)
          File "/home/chy/drone_fasterrcnn_project/Drone_FasterRCNN/demo/predictor.py", line 184, in run_on_opencv_image
            result = self.overlay_class_names(result, top_predictions)
          File "/home/chy/drone_fasterrcnn_project/Drone_FasterRCNN/demo/predictor.py", line 368, in overlay_class_names
            image, s, (x, y), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 1
        cv2.error: OpenCV(4.x.x) :-1: error: (-5:Bad argument) in function 'putText'
        > Overload resolution failed:
        >  - Can't parse 'org'. Sequence item with index 0 has a wrong type
        ```
        这通常意味着传递给 `cv2.putText` 函数的坐标 `(x, y)` (即 `org` 参数) 不是整数类型。
    *   **解决方案：确保坐标为整数**
        您需要修改 `Drone_FasterRCNN/demo/predictor.py` 文件中的 `overlay_class_names` 方法。
        打开 `~/drone_fasterrcnn_project/Drone_FasterRCNN/demo/predictor.py` 文件。
        找到 `overlay_class_names` 方法。在该方法内部，找到绘制文本前获取坐标 `x, y` 的地方，并确保它们被显式转换为整数。
        找到类似以下的代码块：
        ```python
        # ...
        for box, score, label in zip(boxes, scores, labels):
            x, y = box[:2]
            s = template.format(label, score)
            cv2.putText(
                image, s, (x, y), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 1
            )
        # ...
        ```
        将其修改为，在 `cv2.putText` 调用前添加类型转换：
        ```python
        # ...
        for box, score, label in zip(boxes, scores, labels):
            x, y = box[:2]
            # 确保x和y是整数
            x = int(x)
            y = int(y)
            s = template.format(label, score)
            cv2.putText(
                image, s, (x, y), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 1
            )
        # ...
        ```
        或者，如果 `x` 和 `y` 可能是 PyTorch 张量 (tensor)，更稳妥的转换方式是先使用 `.item()` (如果存在) 再转换为 `int`：
        ```python
        # ...
        for box, score, label in zip(boxes, scores, labels):
            x, y = box[:2]
            if hasattr(x, 'item'):  # 检查是否是 tensor
                x = x.item()
            if hasattr(y, 'item'):
                y = y.item()
            x = int(x)
            y = int(y)
            s = template.format(label, score)
            cv2.putText(
                image, s, (x, y), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 1
            )
        # ...
        ```
        保存文件后重试运行 `demo.py`。

在应用这些修改后，脚本应该能够正常运行并在 CPU 上处理图像，同时正确地在输出图像上标注检测结果。

4.  **观察结果：**
    *   脚本可能会在终端打印检测信息。
    *   如果您的 WSLg (WSL GUI 支持) 配置正确，可能会弹出一个窗口显示带有检测框的图像。如果未出现窗口或出现显示错误，请检查脚本是否会将结果图像保存到文件中 (例如，指南中展示的 `drone_res.jpg` 就是一个输出示例)。
    *   指南中还提供了一个样本输出视频链接，您可以对照参考预期的效果。

---

## 步骤 6：后续与提示

*   **原始 README：** 您提供的文件后面部分（"Original Readme"）包含了更多关于 `maskrcnn-benchmark` 库的高级用法，如多 GPU 训练、添加自定义数据集等。当您熟悉了基础操作后，可以参考这些部分进行更深入的探索。
*   **WSL 2 注意事项：**
    *   **GPU/CUDA 问题：** 这是 WSL 2 中最常见的挑战。确保驱动和工具包版本兼容。
    *   **文件路径：** 在 WSL 2 终端中始终使用 Linux 风格的路径。
    *   **GUI 显示：** WSLg 对 GUI 应用的支持在不断改进，但有时可能需要调整 `DISPLAY` 环境变量或安装额外的 X 11 应用来测试。如果 `demo.py` 尝试显示窗口但失败，检查它是否也将结果保存为文件。

---

## 步骤 7：完成实验后

当您完成实验后，可以停用 Conda 环境：
```bash
conda deactivate
```

---

希望这个更新后的教程对您和其他遇到类似问题的用户有所帮助！