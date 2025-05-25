---
created: 2025-05-20T13:21
updated: 2025-05-20T13:36
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/m0_68036862/article/details/147961878?ops_request_misc=%257B%2522request%255Fid%2522%253A%25222a977ec65afdd46bcce61e8c7168c0cb%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=2a977ec65afdd46bcce61e8c7168c0cb&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-4-147961878-null-null.142^v102^pc_search_result_base1&utm_term=yolo%E5%B0%8F%E7%9B%AE%E6%A0%87%E6%A3%80%E6%B5%8B&spm=1018.2226.3001.4187)

### 一、项目介绍

### 摘要

本项目基于 YOLOv8 算法开发了一套专门针对小目标[车辆检测](https://so.csdn.net/so/search?q=%E8%BD%A6%E8%BE%86%E6%A3%80%E6%B5%8B&spm=1001.2101.3001.7020)的计算机视觉系统，使用了一个包含 5236 张训练图像和 2245 张验证图像的自定义数据集。系统专注于单一类别 ('car') 的检测任务，通过优化 YOLOv8 的网络结构和训练策略，显著提升了模型对小尺寸车辆的识别能力。该系统能够在复杂场景中准确检测各类小型车辆目标，包括远距离车辆、部分遮挡车辆以及低分辨率环境下的车辆目标。实验结果表明，经过针对性优化的 YOLOv8 模型在小目标车辆检测任务上达到了较高的精度和召回率，验证了该系统在实际应用中的有效性。

### 项目意义

#### 1. 技术应用价值

小目标检测一直是[计算机视觉领域](https://so.csdn.net/so/search?q=%E8%AE%A1%E7%AE%97%E6%9C%BA%E8%A7%86%E8%A7%89%E9%A2%86%E5%9F%9F&spm=1001.2101.3001.7020)的难点问题，特别是在智能交通系统和自动驾驶应用中，远距离小尺寸车辆的准确识别对系统安全性至关重要。本项目通过定制化的 YOLOv8 解决方案，有效解决了传统检测方法在小目标上表现不佳的问题。系统采用的单类别专注设计 ('car') 避免了多类别检测中的干扰，使模型能够集中学习车辆特征，特别是小尺寸车辆在各种光照、天气和遮挡条件下的表现特征。

#### 2. 实际应用场景

该系统可广泛应用于多个实际场景：(1) 城市交通监控系统中，用于统计远距离车流密度；(2) 高速公路智能监控，检测远处驶来的车辆；(3) 无人机航拍图像中的车辆识别与分析；(4) 自动驾驶系统的环境感知模块，增强对远处车辆的早期识别能力；(5) 停车场的车位状态监测系统。在这些应用中，小目标车辆检测的准确性直接关系到整个系统的性能和可靠性。

#### 3. 数据集价值

项目构建的包含 7481 张标注图像 (5236 训练 + 2245 验证) 的专业[车辆数据集](https://so.csdn.net/so/search?q=%E8%BD%A6%E8%BE%86%E6%95%B0%E6%8D%AE%E9%9B%86&spm=1001.2101.3001.7020)具有重要价值。该数据集专注于车辆特别是小尺寸车辆的多样化样本，涵盖了不同角度、光照条件和遮挡情况，为后续相关研究提供了宝贵资源。数据集的规模和质量保证了模型训练的充分性和评估的可靠性。

#### 4. 算法优化贡献

在算法层面，本项目对 YOLOv8 进行了针对小目标检测的多项优化：(1) 调整特征金字塔结构增强小目标特征提取；(2) 优化锚框尺寸适应小目标比例；(3) 采用高分辨率输入提升小目标识别率；(4) 设计专门的数据增强策略增加小目标样本多样性。这些优化策略不仅提升了本系统的性能，也为其他小目标检测任务提供了可借鉴的技术方案。

#### 5. 社会经济效益

从社会效益角度看，准确的小目标车辆检测技术可以提升交通管理效率，减少交通事故，促进智能交通系统发展。经济效益方面，该系统可以降低人工监控成本，提高自动化处理能力，为相关企业创造商业价值。随着智慧城市和自动驾驶技术的发展，此类专用检测系统的市场需求将持续增长。

综上所述，本项目开发的小目标车辆检测系统不仅具有重要的技术研究价值，也具备广阔的应用前景和社会经济效益，为智能交通和自动驾驶领域提供了实用的技术解决方案。

**目录**

[一、项目介绍](#t8)

[摘要](#t9)

[项目意义](#t10)

[二、项目功能展示](#t11)

[系统功能](#t12)

[图片检测](#t13)

[视频检测](#t14)

[摄像头实时检测](#t15)

[三、数据集介绍](#t16)

[数据集概述](#t17)

[数据集特点](#t18)

[数据集配置文件](#t19)

[数据集制作流程](#t20)

[四、项目环境配置](#t21)

[创建虚拟环境](#t22)

[pycharm 中配置 anaconda](#t23)

[安装所需要库](#t24)

[五、模型训练](#t25)

[训练代码](#t26)

[训练结果](#t27)

[六、核心代码​](#t28)

### [七、项目源码 (视频简介内)](#%E4%B8%83%E3%80%81%E9%A1%B9%E7%9B%AE%E6%BA%90%E7%A0%81%E4%B8%8B%E8%BD%BD%E9%93%BE%E6%8E%A5)

[基于深度学习 YOLOv8 的小目标车辆检测系统（YOLOv8+YOLO 数据集 + UI 界面 + Python 项目源码 + 模型）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1PcE6zSEEB/?spm_id_from=333.1387.upload.video_card.click&vd_source=549d0b4e2b8999929a61a037fcce3b0f "基于深度学习YOLOv8的小目标车辆检测系统（YOLOv8+YOLO数据集+UI界面+Python项目源码+模型）_哔哩哔哩_bilibili")

基于深度学习 YOLOv8 的小目标车辆检测系统（YOLOv8+YOLO 数据集 + UI 界面 + Python 项目源码 + 模型）

### 二、项目功能展示

### **系统功能**

✅ **图片检测**：可对图片进行检测，返回检测框及类别信息。

✅ **视频检测**：支持视频文件输入，检测视频中每一帧的情况。

✅ **摄像头实时检测**：连接 **USB 摄像头**，实现实时监测。

✅**参数实时调节（置信度和 IoU 阈值）**

![](https://i-blog.csdnimg.cn/direct/6269371d1a4c4441b565d541040f4799.png)

![](https://i-blog.csdnimg.cn/direct/ccf3fb8cb7c045c99be2fb4844814c42.png)![](https://i-blog.csdnimg.cn/direct/b2ddd01f8613407ca4a1e32375d79800.png)![](https://i-blog.csdnimg.cn/direct/6fa3eccd24b742c18fda9a6555138773.png)![](https://i-blog.csdnimg.cn/direct/7f8d208c67284586a9f7f8a733288558.png)![](https://i-blog.csdnimg.cn/direct/c69d272ad5d643b6b2b2894461625a49.png)

*   #### **图片检测**
    

        该功能允许用户通过单张图片进行目标检测。输入一张图片后，YOLO 模型会实时分析图像，识别出其中的目标，并在图像中框出检测到的目标，输出带有目标框的图像。**批量图片检测**

        用户可以一次性上传多个图片进行批量处理。该功能支持对多个图像文件进行并行处理，并返回每张图像的目标检测结果，适用于需要大规模处理图像数据的应用场景。

*   #### **视频检测**
    

        视频检测功能允许用户将视频文件作为输入。YOLO 模型将逐帧分析视频，并在每一帧中标记出检测到的目标。最终结果可以是带有目标框的视频文件或实时展示，适用于视频监控和分析等场景。

*   #### **摄像头实时检测**
    

        该功能支持通过连接摄像头进行实时目标检测。YOLO 模型能够在摄像头拍摄的实时视频流中进行目标检测，实时识别并显示检测结果。此功能非常适用于安防监控、无人驾驶、智能交通等应用，提供即时反馈。

**核心特点：**

*   **高精度**：基于 YOLO 模型，提供精确的目标检测能力，适用于不同类型的图像和视频。
*   **实时性**：特别优化的算法使得实时目标检测成为可能，无论是在视频还是摄像头实时检测中，响应速度都非常快。
*   **批量处理**：支持高效的批量图像和视频处理，适合大规模数据分析。

### 三、数据集介绍

#### **数据集概述**

本数据集专门针对**小目标车辆检测**任务构建，包含 **7,481 张**高质量标注图像，涵盖多种复杂场景（如城市道路、高速公路、停车场、航拍视角等）。数据经过严格筛选和增强，确保模型在不同环境下的泛化能力。

*   **训练集**：5,236 张
    
*   **验证集**：2,245 张
    
*   **类别数（nc）**：1（仅检测车辆，适用于专注车辆识别的任务）
    
*   **标注格式**：YOLO 格式（每张图像对应一个`.txt`文件，存储归一化边界框坐标）
    

#### **数据集特点**

1.  **小目标占比高**
    
    *   数据集中包含大量远距离、低分辨率车辆目标，目标尺寸通常小于 80×80 像素，挑战模型对小目标的敏感度。
        
2.  **多样化场景**
    
    *   覆盖白天、夜间、雨天、雾天等多种光照和天气条件。
        
    *   包含城市道路、高速公路、停车场、航拍视角等多种拍摄角度。
        
3.  **复杂背景与遮挡**
    
    *   部分车辆被树木、建筑物、其他车辆遮挡，模拟真实交通场景。
        
    *   包含密集车流、交通拥堵等挑战性场景。
        
4.  **多尺度车辆**
    
    *   数据集中车辆尺寸差异大，涵盖近景大型车辆和远景小型车辆，提升模型多尺度适应能力。
        
5.  **高质量标注**
    
    *   采用人工 + 半自动标注，确保边界框精准贴合车辆轮廓。
        
    *   标注经过交叉验证，减少错误标注。
        

#### **数据集配置文件**

采用标准 YOLO 格式，关键配置如下：

```
# train and val data as 1) directory: path/images/, 2) file: path/images.txt, or 3) list: [path1/images/, path2/images/]
train: F:\images\train
val: F:\images\val
 
 
# number of classes
nc: 2
 
# class names
names: ['person', 'car']
```

#### **数据集制作流程**

1.  **数据采集**
    
    *   **来源**：公开数据集（如 UA-DETRAC、COCO Vehicle）、无人机航拍、交通监控摄像头、自动驾驶仿真数据。
        
    *   **设备**：高清摄像头、无人机、行车记录仪等。
        
    *   **场景覆盖**：确保多样化，包括不同天气、光照、视角。
        
2.  **数据清洗**
    
    *   剔除模糊、过曝、低分辨率图像。
        
    *   去除无车辆或标注错误的样本。
        
3.  **数据标注**
    
    *   使用 **LabelImg** 或 **CVAT** 工具进行边界框标注。
        
    *   标注格式：`[class_id, x_center, y_center, width, height]`（归一化坐标）。
        
    *   多人标注 + 交叉验证，确保标注一致性。
        
4.  **数据增强（提升小目标检测能力）**
    
    *   **Mosaic 增强**：拼接多张图像，模拟密集小目标场景。
        
    *   **随机缩放**：增强模型对不同尺寸车辆的适应能力。
        
    *   **CutMix**：混合不同图像，提高遮挡情况下的检测鲁棒性。
        
    *   **光照调整**：模拟不同天气（雾天、夜间低光）。
        
5.  ![](https://i-blog.csdnimg.cn/direct/53d4a52fd0f0462987ee7361af262f19.png)![](https://i-blog.csdnimg.cn/direct/309c0ec946f340cf8824e85a6f20f2e2.png)![](https://i-blog.csdnimg.cn/direct/c782247f46bb4c2b943e3deec5a1e578.png)![](https://i-blog.csdnimg.cn/direct/7ed05190afce4743b2e2970a8f0c87d2.jpeg)![](https://i-blog.csdnimg.cn/direct/b4a84e1a5f2b439581d934d8b851e3f7.jpeg)![](https://i-blog.csdnimg.cn/direct/5c3d4780b54d40cc8cd2b9e83e31a8d9.jpeg)![](https://i-blog.csdnimg.cn/direct/0aa5fab9c59e4c69a8413fe51e0bd543.jpeg)
    

### 四、项目环境配置

#### 创建虚拟环境

首先新建一个 Anaconda 环境，每个项目用不同的环境，这样项目中所用的依赖包互不干扰。

终端输入

conda create -n yolov8 python==3.9

![](https://i-blog.csdnimg.cn/direct/73276d17ebdd4998a700e5beb674ed32.png)

**激活虚拟环境**

conda activate yolov8  
 

![](https://i-blog.csdnimg.cn/direct/64ea28d3b3aa4604aaf816a533a3ae26.png)

**安装 cpu 版本 pytorch**

```
pip install torch torchvision torchaudio

```

![](https://i-blog.csdnimg.cn/direct/2a8a7a8b98124b1385ddf069ca03b401.png)

#### **pycharm 中配置 anaconda**

![](https://i-blog.csdnimg.cn/direct/1c8d769b07634e61a04b5fa661a4e14c.png)

![](https://i-blog.csdnimg.cn/direct/cb6ad78aa1d94dc1b49156e3ee4f2824.png)

#### **安装所需要库**

pip install -r requirements.txt

![](https://i-blog.csdnimg.cn/direct/47593a96521349499f999eca04b7b513.png)

### 五、模型训练

#### 训练代码

```
from ultralytics import YOLO
 
model_path = 'yolov8s.pt'
data_path = 'datasets/data.yaml'
 
if __name__ == '__main__':
    model = YOLO(model_path)
    results = model.train(data=data_path,
                          epochs=500,
                          batch=64,
                          device='0',
                          workers=0,
                          project='runs/detect',
                          name='exp',
                          )
```

```
根据实际情况更换模型
yolov8n.yaml (nano)：轻量化模型，适合嵌入式设备，速度快但精度略低。
yolov8s.yaml (small)：小模型，适合实时任务。
yolov8m.yaml (medium)：中等大小模型，兼顾速度和精度。
yolov8b.yaml (base)：基本版模型，适合大部分应用场景。
yolov8l.yaml (large)：大型模型，适合对精度要求高的任务。

```

*   `--batch 64`：每批次 64 张图像。
*   `--epochs 500`：训练 500 轮。
*   `--datasets/data.yaml`：数据集配置文件。
*   `--weights yolov8s.pt`：初始化模型权重，`yolov8s.pt` 是预训练的轻量级 YOLO 模型。

#### 训练结果

![](https://i-blog.csdnimg.cn/direct/2483c148c7f2443fbce375da1eb25bf1.png)![](https://i-blog.csdnimg.cn/direct/c649fade781045d3a0d7bf260beae050.png)![](https://i-blog.csdnimg.cn/direct/3cdc3888beaa4087b48335f0cc3538a4.png)![](https://i-blog.csdnimg.cn/direct/d3c051dfcbd24665aa4b5224295010b5.png)![](https://i-blog.csdnimg.cn/direct/99351864345246f3965bdfd7a1c16f04.png)![](https://i-blog.csdnimg.cn/direct/046b0b7bd5814df18148879db167313f.jpeg)![](https://i-blog.csdnimg.cn/direct/9df829cdcd104aa38c5208c740b5d1be.jpeg)![](https://i-blog.csdnimg.cn/direct/292a40b7772c42bfa11a7fd605e655e4.jpeg)![](https://i-blog.csdnimg.cn/direct/5305741bf76c4a34b8b57a9bffe9ea96.jpeg)![](https://i-blog.csdnimg.cn/direct/eb978e64a4c24c14b1755c7d94ae3770.jpeg)![](https://i-blog.csdnimg.cn/direct/a7c2014df6124507a6772627ddf30f09.jpeg)

### 六、核心代码![](https://i-blog.csdnimg.cn/direct/5599cba441fb482d88fd87c1b595da96.png)

```
from PyQt5 import QtCore, QtGui, QtWidgets
from PyQt5.QtCore import Qt, QTimer
from PyQt5.QtGui import QImage, QPixmap, QIcon
from PyQt5.QtWidgets import (QFileDialog, QMessageBox, QTableWidgetItem,
                             QStyledItemDelegate, QHeaderView)
import cv2
import numpy as np
from ultralytics import YOLO
import os
import datetime
import sys
 
 
class CenteredDelegate(QStyledItemDelegate):
    def initStyleOption(self, option, index):
        super().initStyleOption(option, index)
        option.displayAlignment = Qt.AlignCenter
 
 
class Ui_MainWindow(object):
    def setupUi(self, MainWindow):
        MainWindow.setObjectName("MainWindow")
        MainWindow.resize(1400, 900)
        MainWindow.setWindowTitle("YOLOv8 目标检测系统")
 
        # 设置窗口图标
        if hasattr(sys, '_MEIPASS'):
            icon_path = os.path.join(sys._MEIPASS, 'icon.ico')
        else:
            icon_path = 'icon.ico'
        if os.path.exists(icon_path):
            MainWindow.setWindowIcon(QIcon(icon_path))
 
        self.centralwidget = QtWidgets.QWidget(MainWindow)
        self.centralwidget.setObjectName("centralwidget")
 
        # 主布局
        self.main_layout = QtWidgets.QHBoxLayout(self.centralwidget)
        self.main_layout.setContentsMargins(10, 10, 10, 10)
        self.main_layout.setSpacing(15)
 
        # 左侧布局 (图像显示)
        self.left_layout = QtWidgets.QVBoxLayout()
        self.left_layout.setSpacing(15)
 
        # 原始图像组
        self.original_group = QtWidgets.QGroupBox("原始图像")
        self.original_group.setMinimumHeight(400)
        self.original_img_label = QtWidgets.QLabel()
        self.original_img_label.setAlignment(QtCore.Qt.AlignCenter)
        self.original_img_label.setText("等待加载图像...")
        self.original_img_label.setStyleSheet("background-color: #F0F0F0; border: 1px solid #CCCCCC;")
 
        original_layout = QtWidgets.QVBoxLayout()
        original_layout.addWidget(self.original_img_label)
        self.original_group.setLayout(original_layout)
        self.left_layout.addWidget(self.original_group)
 
        # 检测结果图像组
        self.result_group = QtWidgets.QGroupBox("检测结果")
        self.result_group.setMinimumHeight(400)
        self.result_img_label = QtWidgets.QLabel()
        self.result_img_label.setAlignment(QtCore.Qt.AlignCenter)
        self.result_img_label.setText("检测结果将显示在这里")
        self.result_img_label.setStyleSheet("background-color: #F0F0F0; border: 1px solid #CCCCCC;")
 
        result_layout = QtWidgets.QVBoxLayout()
        result_layout.addWidget(self.result_img_label)
        self.result_group.setLayout(result_layout)
        self.left_layout.addWidget(self.result_group)
 
        self.main_layout.addLayout(self.left_layout, stretch=3)
 
        # 右侧布局 (控制面板)
        self.right_layout = QtWidgets.QVBoxLayout()
        self.right_layout.setSpacing(15)
 
        # 模型选择组
        self.model_group = QtWidgets.QGroupBox("模型设置")
        self.model_group.setStyleSheet("QGroupBox { font-weight: bold; }")
        self.model_layout = QtWidgets.QVBoxLayout()
 
        # 模型选择
        self.model_combo = QtWidgets.QComboBox()
        self.model_combo.addItems(["best.pt"])
        self.model_combo.setCurrentIndex(0)
 
        # 加载模型按钮
        self.load_model_btn = QtWidgets.QPushButton(" 加载模型")
        self.load_model_btn.setIcon(QIcon.fromTheme("document-open"))
        self.load_model_btn.setStyleSheet(
            "QPushButton { padding: 8px; background-color: #4CAF50; color: white; border-radius: 4px; }"
            "QPushButton:hover { background-color: #45a049; }"
        )
 
        self.model_layout.addWidget(self.model_combo)
        self.model_layout.addWidget(self.load_model_btn)
        self.model_group.setLayout(self.model_layout)
        self.right_layout.addWidget(self.model_group)
 
        # 参数设置组
        self.param_group = QtWidgets.QGroupBox("检测参数")
        self.param_group.setStyleSheet("QGroupBox { font-weight: bold; }")
        self.param_layout = QtWidgets.QFormLayout()
        self.param_layout.setLabelAlignment(Qt.AlignLeft)
        self.param_layout.setFormAlignment(Qt.AlignLeft)
        self.param_layout.setVerticalSpacing(15)
 
        # 置信度滑块
        self.conf_slider = QtWidgets.QSlider(Qt.Horizontal)
        self.conf_slider.setRange(1, 99)
        self.conf_slider.setValue(25)
        self.conf_value = QtWidgets.QLabel("0.25")
        self.conf_value.setAlignment(Qt.AlignCenter)
        self.conf_value.setStyleSheet("font-weight: bold; color: #2196F3;")
 
        # IoU滑块
        self.iou_slider = QtWidgets.QSlider(Qt.Horizontal)
        self.iou_slider.setRange(1, 99)
        self.iou_slider.setValue(45)
        self.iou_value = QtWidgets.QLabel("0.45")
        self.iou_value.setAlignment(Qt.AlignCenter)
        self.iou_value.setStyleSheet("font-weight: bold; color: #2196F3;")
 
        self.param_layout.addRow("置信度阈值:", self.conf_slider)
        self.param_layout.addRow("当前值:", self.conf_value)
        self.param_layout.addRow(QtWidgets.QLabel(""))  # 空行
        self.param_layout.addRow("IoU阈值:", self.iou_slider)
        self.param_layout.addRow("当前值:", self.iou_value)
 
        self.param_group.setLayout(self.param_layout)
        self.right_layout.addWidget(self.param_group)
 
        # 功能按钮组
        self.func_group = QtWidgets.QGroupBox("检测功能")
        self.func_group.setStyleSheet("QGroupBox { font-weight: bold; }")
        self.func_layout = QtWidgets.QVBoxLayout()
        self.func_layout.setSpacing(10)
 
        # 图片检测按钮
        self.image_btn = QtWidgets.QPushButton(" 图片检测")
        self.image_btn.setIcon(QIcon.fromTheme("image-x-generic"))
 
        # 视频检测按钮
        self.video_btn = QtWidgets.QPushButton(" 视频检测")
        self.video_btn.setIcon(QIcon.fromTheme("video-x-generic"))
 
        # 摄像头检测按钮
        self.camera_btn = QtWidgets.QPushButton(" 摄像头检测")
        self.camera_btn.setIcon(QIcon.fromTheme("camera-web"))
 
        # 停止检测按钮
        self.stop_btn = QtWidgets.QPushButton(" 停止检测")
        self.stop_btn.setIcon(QIcon.fromTheme("process-stop"))
        self.stop_btn.setEnabled(False)
 
        # 保存结果按钮
        self.save_btn = QtWidgets.QPushButton(" 保存结果")
        self.save_btn.setIcon(QIcon.fromTheme("document-save"))
        self.save_btn.setEnabled(False)
 
        # 设置按钮样式
        button_style = """
        QPushButton {
            padding: 10px;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            text-align: left;
        }
        QPushButton:hover {
            background-color: #0b7dda;
        }
        QPushButton:disabled {
            background-color: #cccccc;
        }
        """
 
        for btn in [self.image_btn, self.video_btn, self.camera_btn,
                    self.stop_btn, self.save_btn]:
            btn.setStyleSheet(button_style)
            self.func_layout.addWidget(btn)
 
        self.func_group.setLayout(self.func_layout)
        self.right_layout.addWidget(self.func_group)
 
        # 检测结果表格组
        self.table_group = QtWidgets.QGroupBox("检测结果详情")
        self.table_group.setStyleSheet("QGroupBox { font-weight: bold; }")
        self.table_layout = QtWidgets.QVBoxLayout()
 
        self.result_table = QtWidgets.QTableWidget()
        self.result_table.setColumnCount(4)
        self.result_table.setHorizontalHeaderLabels(["类别", "置信度", "左上坐标", "右下坐标"])
        self.result_table.horizontalHeader().setSectionResizeMode(QHeaderView.Stretch)
        self.result_table.verticalHeader().setVisible(False)
        self.result_table.setSelectionBehavior(QtWidgets.QAbstractItemView.SelectRows)
        self.result_table.setEditTriggers(QtWidgets.QAbstractItemView.NoEditTriggers)
 
        # 设置表格样式
        self.result_table.setStyleSheet("""
            QTableWidget {
                border: 1px solid #e0e0e0;
                alternate-background-color: #f5f5f5;
            }
            QHeaderView::section {
                background-color: #2196F3;
                color: white;
                padding: 5px;
                border: none;
            }
            QTableWidget::item {
                padding: 5px;
            }
        """)
 
        # 设置居中代理
        delegate = CenteredDelegate(self.result_table)
        self.result_table.setItemDelegate(delegate)
 
        self.table_layout.addWidget(self.result_table)
        self.table_group.setLayout(self.table_layout)
        self.right_layout.addWidget(self.table_group, stretch=1)
 
        self.main_layout.addLayout(self.right_layout, stretch=1)
 
        MainWindow.setCentralWidget(self.centralwidget)
 
        # 状态栏
        self.statusbar = QtWidgets.QStatusBar(MainWindow)
        self.statusbar.setStyleSheet("QStatusBar { border-top: 1px solid #c0c0c0; }")
        MainWindow.setStatusBar(self.statusbar)
 
        # 初始化变量
        self.model = None
        self.cap = None
        self.timer = QTimer()
        self.is_camera_running = False
        self.current_image = None
        self.current_result = None
        self.video_writer = None
        self.output_path = "output"
 
        # 创建输出目录
        if not os.path.exists(self.output_path):
            os.makedirs(self.output_path)
 
        # 连接信号槽
        self.load_model_btn.clicked.connect(self.load_model)
        self.image_btn.clicked.connect(self.detect_image)
        self.video_btn.clicked.connect(self.detect_video)
        self.camera_btn.clicked.connect(self.detect_camera)
        self.stop_btn.clicked.connect(self.stop_detection)
        self.save_btn.clicked.connect(self.save_result)
        self.conf_slider.valueChanged.connect(self.update_conf_value)
        self.iou_slider.valueChanged.connect(self.update_iou_value)
        self.timer.timeout.connect(self.update_camera_frame)
 
        # 设置全局样式
        self.set_style()
 
    def set_style(self):
        style = """
        QMainWindow {
            background-color: #f5f5f5;
        }
        QGroupBox {
            border: 1px solid #e0e0e0;
            border-radius: 5px;
            margin-top: 10px;
            padding-top: 15px;
        }
        QGroupBox::title {
            subcontrol-origin: margin;
            left: 10px;
            padding: 0 3px;
        }
        QLabel {
            color: #333333;
        }
        QComboBox {
            padding: 5px;
            border: 1px solid #cccccc;
            border-radius: 3px;
        }
        QSlider::groove:horizontal {
            height: 6px;
            background: #e0e0e0;
            border-radius: 3px;
        }
        QSlider::handle:horizontal {
            width: 16px;
            height: 16px;
            margin: -5px 0;
            background: #2196F3;
            border-radius: 8px;
        }
        QSlider::sub-page:horizontal {
            background: #2196F3;
            border-radius: 3px;
        }
        """
        self.centralwidget.setStyleSheet(style)
 
    def load_model(self):
        model_name = self.model_combo.currentText().split(" ")[0]
        try:
            self.model = YOLO(model_name)
            self.statusbar.showMessage(f"模型 {model_name} 加载成功", 3000)
            self.image_btn.setEnabled(True)
            self.video_btn.setEnabled(True)
            self.camera_btn.setEnabled(True)
        except Exception as e:
            QMessageBox.critical(None, "错误", f"模型加载失败: {str(e)}")
 
    def update_conf_value(self):
        conf = self.conf_slider.value() / 100
        self.conf_value.setText(f"{conf:.2f}")
 
    def update_iou_value(self):
        iou = self.iou_slider.value() / 100
        self.iou_value.setText(f"{iou:.2f}")
 
    def detect_image(self):
        if self.model is None:
            QMessageBox.warning(None, "警告", "请先加载模型")
            return
 
        file_path, _ = QFileDialog.getOpenFileName(
            None, "选择图片", "",
            "图片文件 (*.jpg *.jpeg *.png *.bmp);;所有文件 (*)"
        )
        if file_path:
            try:
                # 读取图片
                img = cv2.imread(file_path)
                img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
 
                # 显示原始图片
                self.display_image(img, self.original_img_label)
                self.current_image = img.copy()
 
                # 检测图片
                conf = self.conf_slider.value() / 100
                iou = self.iou_slider.value() / 100
 
                self.statusbar.showMessage("正在检测图片...")
                QtWidgets.QApplication.processEvents()  # 更新UI
 
                results = self.model.predict(img, conf=conf, iou=iou)
                result_img = results[0].plot()
 
                # 显示检测结果
                self.display_image(result_img, self.result_img_label)
                self.current_result = result_img.copy()
 
                # 更新结果表格
                self.update_result_table(results[0])
 
                self.save_btn.setEnabled(True)
                self.statusbar.showMessage(f"图片检测完成: {os.path.basename(file_path)}", 3000)
 
            except Exception as e:
                QMessageBox.critical(None, "错误", f"图片检测失败: {str(e)}")
                self.statusbar.showMessage("图片检测失败", 3000)
 
    def detect_video(self):
        if self.model is None:
            QMessageBox.warning(None, "警告", "请先加载模型")
            return
 
        file_path, _ = QFileDialog.getOpenFileName(
            None, "选择视频", "",
            "视频文件 (*.mp4 *.avi *.mov *.mkv);;所有文件 (*)"
        )
        if file_path:
            try:
                self.cap = cv2.VideoCapture(file_path)
                if not self.cap.isOpened():
                    raise Exception("无法打开视频文件")
 
                # 获取视频信息
                fps = self.cap.get(cv2.CAP_PROP_FPS)
                width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
                height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
 
                # 创建视频写入器
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                output_file = os.path.join(self.output_path, f"output_{timestamp}.mp4")
                fourcc = cv2.VideoWriter_fourcc(*'mp4v')
                self.video_writer = cv2.VideoWriter(output_file, fourcc, fps, (width, height))
 
                # 启用停止按钮，禁用其他按钮
                self.stop_btn.setEnabled(True)
                self.save_btn.setEnabled(True)
                self.image_btn.setEnabled(False)
                self.video_btn.setEnabled(False)
                self.camera_btn.setEnabled(False)
 
                # 开始处理视频
                self.timer.start(30)  # 30ms间隔
                self.statusbar.showMessage(f"正在处理视频: {os.path.basename(file_path)}...")
 
            except Exception as e:
                QMessageBox.critical(None, "错误", f"视频检测失败: {str(e)}")
                self.statusbar.showMessage("视频检测失败", 3000)
```

### 七、项目源码 (视频简介内)

        **完整全部资源文件**（包括测试图片，_py_ 文件，训练数据集、训练代码、界面代码等），这里已打包上传至博主的面包多平台，见可参考博客与视频，已将所有涉及的文件同时打包到里面，点击即可运行，完整文件截图如下：

![](https://i-blog.csdnimg.cn/direct/a4091bc3d238469591806942c4e74068.png)

演示与介绍视频：

[基于深度学习 YOLOv8 的小目标车辆检测系统（YOLOv8+YOLO 数据集 + UI 界面 + Python 项目源码 + 模型）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1PcE6zSEEB/?spm_id_from=333.1387.upload.video_card.click&vd_source=549d0b4e2b8999929a61a037fcce3b0f "基于深度学习YOLOv8的小目标车辆检测系统（YOLOv8+YOLO数据集+UI界面+Python项目源码+模型）_哔哩哔哩_bilibili")

基于深度学习 YOLOv8 的小目标车辆检测系统（YOLOv8+YOLO 数据集 + UI 界面 + Python 项目源码 + 模型