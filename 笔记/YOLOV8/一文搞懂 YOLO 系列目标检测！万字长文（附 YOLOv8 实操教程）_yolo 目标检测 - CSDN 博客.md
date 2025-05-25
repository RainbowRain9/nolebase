> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/qq_45591302/article/details/139843795?ops_request_misc=%257B%2522request%255Fid%2522%253A%25222a977ec65afdd46bcce61e8c7168c0cb%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=2a977ec65afdd46bcce61e8c7168c0cb&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-139843795-null-null.142^v102^pc_search_result_base1&utm_term=yolo%E5%B0%8F%E7%9B%AE%E6%A0%87%E6%A3%80%E6%B5%8B&spm=1018.2226.3001.4187)

> **目标检测入门精品文章**

 **本文介绍目标检测基础概念，算法发展历史，YOLOV8 环境配置，数据集标注，模型评估指标，改进策略。帮助小白从入门到精通。**

![](https://i-blog.csdnimg.cn/blog_migrate/a8fe1f4ccefedc4b30762c278cd92c43.png)

**目录**

[一、目标检测基础](#t0)

[1.1 基本概念](#t1)

[1.2 发展历史](#t2)

 [1.3 目标检测四大任务](#t3)

[1.4 目标检测算法的分类](#t4)

[二、环境配置](#t5)

[2.1 下载 YOLOv8 项目，Anaconda 和 PyCharm](#t6)

[2.2 安装 Anaconda 和 PyCharm](#t7)

[2.3 创建虚拟环境](#t8)

[2.4 租用 GPU，搭建环境](#t9)

[三、目标检测流程](#t10)

[3.1 训练](#t11)

[3.2 测试](#t12)

[四、数据集](#t13)

[4.1 简介](#t14)

[4.2 数据集标注](#t15)

[1 Labelme](#1%20Labelme)

[2 LabelImg](#2%20LabelImg)

[4.3 VOC 数据集转换](#t16)

[五、模型评价指标](#t17)

一、目标检测基础
--------

### 1.1 基本概念

        目标检测（Object Detection）是计算机视觉领域的重要任务之一，**旨在识别图像或视频中的特定目标并将其位置标记出来。**与图像分类任务不同，目标检测要求不仅能够识别目标类别，还需要精确地定位**目标的位置。**由于各类物体有不同的外观、形状和姿态，加上成像时光照、遮挡等因素的干扰，目标检测一直是计算机视觉领域最具有挑战性的问题。

### 1.2 发展历史

        **目标检测技术的发展历史**可以追溯到 20 世纪 80 年代。在早期阶段，目标检测主要依赖于手工设计的特征提取算法和分类器。这些方法通常基于边缘、纹理、颜色等低级特征，并结合模板匹配或统计模型进行目标检测。然而，这些方法受限于特征的表达能力和鲁棒性，对于复杂场景的检测效果较差。

        随着计算机视觉和机器学习的快速发展，基于机器学习的目标检测方法逐渐兴起。其中，主要的突破之一是提出了基于特征的机器学习方法，如 Haar 特征和 HOG 特征。这些方法通过训练分类器来学习目标的特征表示，从而实现目标的检测。然而，这些方法仍然需要手动设计特征，并且对于复杂的目标来说，特征的表示能力较弱。

        近年来，深度学习的兴起极大地推动了目标检测技术的发展。基于深度学习的目标检测方法将深度神经网络引入目标检测领域，并取得了重大突破。最具代表性的方法之一是基于区域的卷积神经网络 (R-CNN)，它将目标检测任务分解为候选区域提取和区域分类两个子任务。后续的方法，如 Fast R-CNN、Faster R-CNN 和 YOLO(You Only Look Once) 等进一步改进了速度和准确性。这些方法不仅能够自动学习特征表示，还能够在端到端的框架下进行目标检测。

        YOLO（You Only Look Once）是一种对象检测算法，由 Joseph Redmon 等人于 2015 年提出。YOLO 的核心思想是将对象检测任务转化为一个回归问题，通过一个卷积神经网络直接在图像上进行推理，实现实时对象检测。

**YOLO 的发展历程可以分为以下几个阶段：**

        **YOLO v1**：YOLO 的第一个版本是在 2015 年提出的，它采用了一个全卷积神经网络，将输入图像分为 S×S 个网格，每个网格预测 B 个边界框和各自边界框的类别概率。然后，通过阈值筛选和非极大值抑制（NMS）来获得最终的检测结果。YOLO v1 在速度和准确率上取得了很大的突破，但对小目标和近似目标的检测效果较差。

![](https://i-blog.csdnimg.cn/blog_migrate/a2724995275be7b5a539c97bd8a27a51.png)

        **YOLOv5** 是由 Ultralytics 团队在 2020 年开发的。YOLOv5 相比于之前的版本在精度和速度上都有显著提升。它采用了一种轻量化的结构，包括多个不同大小的卷积层和池化层，用于提取图像特征。与以往的版本相比，YOLOv5 引入了新的网络架构，以及一种新的训练方法，使用更大的数据集和更长的训练时间，从而提高了算法的性能。

       **YOLOv8** 是由 Ultralytics 公司在 2023 年 1 月发布的最新一代实时目标检测模型。YOLOv8 采用了先进的骨干网络和颈部架构，实现了改进的特征提取和目标检测性能。它采用了无锚点的分割 Ultralytics 头部设计，这有助于提高准确性并使检测过程更加高效。YOLOv8 还专注于在准确性和速度之间保持最佳平衡，适合于不同应用领域的实时目标检测任务。此外，YOLOv8 提供了一系列预训练模型，以满足不同任务和性能要求，使得用户可以根据自己的具体用例找到合适的模型。

![](https://i-blog.csdnimg.cn/blog_migrate/f2310c3a08723ea859f736612b7ac75b.png)

        **YOLOv9** 由中国台湾 Academia Sinica、台北科技大学等机构联合开发。YOLOv9 引入了**程序化梯度信息**（Programmable Gradient Information, PGI），这是一种全新的概念，旨在解决深层网络中信息丢失的问题。传统的目标检测网络在传递深层信息时，往往会丢失对最终预测至关重要的细节，而 PGI 技术能够保证网络在学习过程中保持完整的输入信息，从而获得更可靠的梯度信息，提高权重更新的准确性。这一创新显著提高了目标检测的准确率，为实时高精度目标检测提供了可能。此外，YOLOv9 采用了全新的网络架构——**泛化高效层聚合网络**（Generalized Efficient Layer Aggregation Network, GELAN）。GELAN 通过梯度路径规划，优化了网络结构，利用传统的卷积操作符实现了超越当前最先进方法（包括基于深度卷积的方法）的参数利用效率。这一设计不仅提高了模型的性能，同时也保证了模型的高效性，使 YOLOv9 能够在保持轻量级的同时，达到前所未有的准确度和速度。

论文地址：[https://arxiv.org/abs/2402.13616](https://arxiv.org/abs/2402.13616 "https://arxiv.org/abs/2402.13616")

Yolov9 源代码：[https://github.com/WongKinYiu/yolov9](https://github.com/WongKinYiu/yolov9 "https://github.com/WongKinYiu/yolov9")

 **YOLOv10** 是清华大学的研究人员在 Ultralytics 的基础上，引入了一种新的实时目标检测方法，解决了 YOLO 以前版本在后处理和模型架构方面的不足。通过消除非最大抑制（NMS）和优化各种模型组件，YOLOv10 在显著降低计算开销的同时实现了最先进的性能。大量实验证明，YOLOv10 在多个模型尺度上实现了卓越的精度 - 延迟权衡。

YOLOv10 的结构建立在以前 YOLO 模型的基础上，同时引入了几项关键创新。模型架构由以下部分组成：

        **主干网络**：YOLOv10 中的主干网络负责特征提取，它使用了增强版的 CSPNet（跨阶段部分网络），以改善梯度流并减少计算冗余。

        **颈部网络**：颈部设计用于汇聚不同尺度的特征，并将其传递到头部。它包括 PAN（路径聚合网络）层，可实现有效的多尺度特征融合。

        **一对多头**：在训练过程中为每个对象生成多个预测，以提供丰富的监督信号并提高学习准确性。

        **一对一头**：在推理过程中为每个对象生成一个最佳预测，无需 NMS，从而减少延迟并提高效率。

论文：[https://arxiv.org/pdf/2405.14458](https://arxiv.org/pdf/2405.14458 "https://arxiv.org/pdf/2405.14458")  

源码: [GitHub - THU-MIG/yolov10: YOLOv10: Real-Time End-to-End Object Detection](https://github.com/THU-MIG/yolov10 "GitHub - THU-MIG/yolov10: YOLOv10: Real-Time End-to-End Object Detection")  

 **YOLOv11** 作为 YOLO 系列的最新版本，在多个方面进行了创新和改进，以下是其主要创新点：

1. **架构优化**

*   **C3K2 块**：YOLOv11 引入了 C3K2 块，这是一种改进的特征提取模块，继承自 C2f 模块，通过更高效的卷积结构提升了特征提取能力。
    
*   **SPFF 模块**：空间金字塔快速池化（SPFF）模块被集成到架构中，增强了多尺度特征融合能力。
    
*   **C2PSA 模块**：跨阶段部分空间注意力（C2PSA）模块通过空间注意力机制，提升了模型对小物体和部分遮挡物体的检测能力。
    

2. **特征提取能力增强**

*   YOLOv11 采用了改进的骨干网络（Backbone）和颈部结构（Neck），增强了特征提取能力，能够更精确地处理复杂任务。
    
*   骨干网络基于优化后的 CSPDarknet53，增加了轻量化模块如 SPPF，提升了特征提取的鲁棒性。
    

3. **效率和速度优化**

*   **GPU 优化**：YOLOv11 在 GPU 上进行了优化训练，显著提升了训练速度和推理速度。
    
*   **参数减少**：与 YOLOv8 相比，YOLOv11 在参数数量上减少了 22%，同时保持了更高的平均精度（mAP），提高了计算效率。
    

4. **检测头改进**

*   检测头引入了 DWConv（深度可分离卷积），使模型更加轻量级，同时提高了小物体检测的准确性。
    

        目前，目标检测技术仍在不断发展。一方面，研究者们致力于提高目标检测的准确性和效率。另一方面，一些新的方向也在探索中，如目标实例分割、多目标跟踪等。可以预见，随着技术的不断进步，目标检测技术将在更广泛的应用领域中发挥更大的作用。

![](https://i-blog.csdnimg.cn/blog_migrate/9c0a5fcc021520d075f488b443a8bb3d.png)

###  1.3 目标检测四大任务

*   **分类 - Classification**：解决 “是什么？” 的问题，即给定一张图片或一段视频判断里面包含什么类别的目标。
    
*   **定位 - Location**：解决 “在哪里？” 的问题，即定位出这个目标的的位置。
    
*   **检测 - Detection**：解决 “是什么？在哪里？” 的问题，即定位出这个目标的的位置并且知道目标物是什么。
    
*   **分割 - Segmentation**：分为实例的分割（Instance-level）和场景分割（Scene-level），解决 “每一个像素属于哪个目标物或场景” 的问题。
    

![](https://i-blog.csdnimg.cn/blog_migrate/c3c78a1b8c84562c7201b0e1c0194341.png)

        目标检测任务可分为两个关键的子任务：**目标分类**和**目标定位**。**目标分类任务负责判断输入图像或所选择图像区域（Proposals）中是否有感兴趣类别的物体出现，输出一系列带分数的标签表明感兴趣类别的物体出现在输入图像或所选择图像区域（Proposals）中的可能性。目标定位任务负责确定输入图像或所选择图像区域（Proposals）中感兴趣类别的物体的位置和范围，输出物体的包围盒、或物体中心、或物体的闭合边界等，通常使用方形包围盒，即 Bounding Box 用来表示物体的位置信息。**

### 1.4 [目标检测算法](https://so.csdn.net/so/search?q=%E7%9B%AE%E6%A0%87%E6%A3%80%E6%B5%8B%E7%AE%97%E6%B3%95&spm=1001.2101.3001.7020)的分类

        目前主流的目标检测算法主要是基于深度学习模型，大概可以分成两大类别：

（1）**One-Stage（单阶段）**目标检测算法，这类检测算法不需要 Region Proposal 阶段，可以通过一个 Stage 直接产生物体的类别概率和位置坐标值，比较典型的算法有 YOLO、SSD 和 CornerNet；One-Stage 目标检测算法可以在一个 stage 直接产生物体的类别概率和位置坐标值，相比于 Two-Stage 的目标检测算法不需要 Region Proposal 阶段，整体流程较为简单。如下图所示，在 Testing 的时候输入图片通过 CNN 网络产生输出，解码（后处理）生成对应检测框即可；在 Training 的时候则需要将 Ground Truth 编码成 CNN 输出对应的格式以便计算对应损失 loss。

![](https://i-blog.csdnimg.cn/blog_migrate/f215c575e15af23562b305f9c1043755.png)

目前对于 One-Stage 算法的主要创新主要集中在如何设计 CNN 结构、如何构建网络目标以及如何设计损失函数上。 

（2）**Two-Stage（双阶段）**目标检测算法，这类检测算法将检测问题划分为两个阶段，第一个阶段首先产生候选区域（Region Proposals），包含目标大概的位置信息，然后第二个阶段对候选区域进行分类和位置精修，这类算法的典型代表有 R-CNN，Fast R-CNN，Faster R-CNN 等。目标检测模型的主要性能指标是检测准确度和速度，其中准确度主要考虑物体的定位以及分类准确度。一般情况下，Two-Stage 算法在准确度上有优势，而 One-Stage 算法在速度上有优势。不过，随着研究的发展，两类算法都在两个方面做改进，均能在准确度以及速度上取得较好的结果。 

        Two-Stage 目标检测算法流程如下图所示，在 Testing 的时候输入图片经过**卷积神经网络**产生第一阶段输出，对输出进行解码处理生成候选区域，然后获取对应候选区域的特征表示（ROIs），然后对 ROIs 进一步精化产生第二阶段的输出，解码（后处理）生成最终结果，解码生成对应检测框即可；在 Training 的时候需要将 Ground Truth 编码成 CNN 输出对应的格式以便计算对应损失 loss。

![](https://i-blog.csdnimg.cn/blog_migrate/04506be1fc8e673722d67ab7f04ba58a.png)

二、[环境配置](https://so.csdn.net/so/search?q=%E7%8E%AF%E5%A2%83%E9%85%8D%E7%BD%AE&spm=1001.2101.3001.7020)
------------------------------------------------------------------------------------------------------

        想要搭建 YOLOv8 目标检测模型，首先需要**下载代码，配置环境**。让我们开始吧！

### 2.1 下载 YOLOv8 项目，Anaconda 和 PyCharm

        首先点击以下网址，下载 YOLOv8 项目：

[ultralytics/ultralytics: NEW - YOLOv8 🚀 in PyTorch > ONNX > OpenVINO > CoreML > TFLite (github.com)](https://github.com/ultralytics/ultralytics "ultralytics/ultralytics: NEW - YOLOv8 🚀 in PyTorch > ONNX > OpenVINO > CoreML > TFLite (github.com)")

        打开项目，点击 Code, 下载下来，解压。如下图所示。

![](https://i-blog.csdnimg.cn/blog_migrate/3076218fad0e4536f1b54ade9dfa237a.png)

解压后会得到一个文件夹。如下图所示。

![](https://i-blog.csdnimg.cn/blog_migrate/cd8ae49b4d117ec21ec0c9a2eba017c6.png)

### 2.2 安装 Anaconda 和 PyCharm

Anaconda 官网：[Download Anaconda Distribution | Anaconda](https://www.anaconda.com/download/ "Download Anaconda Distribution | Anaconda")

PyCharm 官网：[PyCharm：适用于数据科学和 Web 开发的 Python IDE (jetbrains.com)](https://www.jetbrains.com/zh-cn/pycharm/ "PyCharm：适用于数据科学和 Web 开发的 Python IDE (jetbrains.com)")

PyCharm 建议下载专业版的，上网找个激活码就 ok。

安装过程很简单，网上教程一大堆，随便找个一步步来就可以。就不再赘述。

![](https://i-blog.csdnimg.cn/blog_migrate/79b3fcbcd5f04053d1eaea42ce46694e.png)

### 2.3 创建虚拟环境

**安装好 Anaconda 之后，在开始菜单栏会有文件夹，打开 Anaconda Prompt（记住不能错，必须是 Anaconda Prompt）**

**![](https://i-blog.csdnimg.cn/blog_migrate/fe0f6531e0aa0e6e89c54cdbfe277da4.png)**

**新建虚拟环境**

```
conda activate yolov8
# -c pytorch可以去掉，即不指定pytorch官方channel下载，国内快一点
conda install pytorch==1.13.0 torchvision==0.14.0 torchaudio==0.13.0 pytorch-cuda=11.6 -c nvidia
# 或者pip下载 (2选1)
pip install torch==1.13.0+cu116 torchvision==0.14.0+cu116 torchaudio==0.13.0 --extra-index-url https://download.pytorch.org/whl/cu116
 
```

右击 YOLOv8 项目以 PyCharm 打开，在环境里面使用我们刚刚创建的 yolov8  


### 2.4 租用 GPU，搭建环境

        由于目标检测训练时间长，内存占用大，不建议在自己的电脑上训练，**推荐租用 GUP 进行训练**，价格也很便宜，通常在 1-2 元一小时。

AutoDL 是一个国内的 GPU 租用平台，AutoDL 可以提供服务稳定、价格公道的 GPU 租用服务。更为学生提供免费升级会员通道，享极具性价比的会员价格。 并且操作简单，解决了本地深度学习任务中显卡性能不够用的问题。

本文详细介绍如何租用，和配置环境。链接：[http://t.csdnimg.cn/7n7hL](http://t.csdnimg.cn/7n7hL "http://t.csdnimg.cn/7n7hL")

![](https://i-blog.csdnimg.cn/blog_migrate/7a784975ad46a2a741867aa19a6b2d09.png)

三、目标检测流程
--------

        基于深度学习的目标检测主要包括**训练**和**测试**两个部分。

### 3.1 训练

        **训练的主要目的是利用训练数据集进行检测网络的参数学习。**训练数据集包含大量的视觉图像及标注信息（物体位置及类别）。如图（a）所示，训练阶段的主要过程包括数据预处理、检测网络以及标签匹配与损失计算等部分。

1）数据预处理。数据预处理旨在增强训练数据多样性，进而提升检测网络的检测能力。常用的数据增强手段有翻转、缩放、均值归一化和色调变化等。

![](https://i-blog.csdnimg.cn/blog_migrate/f26fb62df02181d334cca62e4c323110.png#pic_center)

2）检测网络。检测网络一般包括基础骨干、特征融合及预测网络 3 部分。目标检测器的基础骨干通常采用用于图像分类的深度卷积网络，如 AlexNet 、VGGNet、ResNet 和 DenseNet 等。近期，研究人员开始采用基于 Transformer 的基础骨干网络，如 ViT（vision transformer）、Swin 和 PVT（pyramid vision transformer）等。通常将大规模图像分类数据库 ImageNet 上的预训练权重作为检测器骨干网络的初始权重。

特征融合主要是对基础骨干提取的特征进行融合，用于后续分类和回归。常见的特征融合方式是特征金字塔结构。

最后，预测网络进行分类和回归等任务。在两阶段目标检测方法中，分类和回归通常采用全连接的方式，而在单阶段的方法中，分类和回归等通常采用全卷积的方式。与此同时，检测器通常还需要一些初始化，如锚点框初始化、角点初始化和查询特征初始化等。

3）标签分配与损失计算。标签分配主要是为检测器预测提供真实值。在目标检测中，标签分配的准则包括交并比（intersection over union，IoU）准则、距离准则、似然估计准则和二分匹配等。交并比准则通常用于基于锚点框的目标检测方法，根据锚点框与物体真实框之间的交并比将锚点框分配到对应的物体。距离准则通常用于无锚点框的目标检测方法，根据点到物体中心的距离将其分配到对应的物体。似然估计准则和二分匹配通常基于分类和回归的联合损失进行最优标签分配。基于标签分类的结果，采用损失函数计算分类和回归等任务的损失，并利用反向传播算法更新检测网络的权重。常用的分类损失函数有交叉熵损失函数、聚焦损失函数等，而回归损失函数有 L1 损失函数、平滑 L1 损失函数、交并比 IoU 损失函数、GIoU （generalized IoU）损失函数（Rezatofighi 等，2019）和 CIoU（complete-IoU）损失函数等。

### 3.2 测试

![](https://i-blog.csdnimg.cn/blog_migrate/eb86ffbaa5c8423d2737f728e999ec5a.png#pic_center)

        基于训练阶段学习的检测网络，在测试阶段输出给定图像中存在物体的类别以及位置信息。如图（b）所示，主要包括输入图像、检测网络和后处理等过程。对于一幅给定的图像，先利用训练好的检测网络生成分类和回归结果。一般而言，大部分目标检测方法在同一物体周围会生成多个检测结果。因此，大部分目标检测方法需要一个后处理步骤，旨在为每个物体保留一个检测结果并去除其他冗余的检测结果。最常用的后处理方法为非极大值抑制方法（non-maximum suppression，NMS）。

        NMS 试图为每个物体保留一个分类得分最高的检测结果。Bodla 等人（2017）认为 NMS 方法容易将距离较近的多个物体检测结果合并，造成部分物体漏检的问题。为解决这一问题，Bodla 等人（2017）对 NMS 进行改进并提出 Soft-NMS。该方法通过降低交并比高的检测结果的分类得分来抑制冗余检测。Jiang 等人（2018）提出 IoUNet，预测检测框与物体真实框之间的交并比，并根据预测的交并比值进行非极大值抑制。He 等人（2018）提出学习检测框的定位方差，并利用定位方差线性加权邻近检测框来提升当前检测框的定位精度。

四、数据集
-----

### 4.1 简介

 **数据集是必不可少的部分，数据集的优劣直接影响训练效果。一般来说，一个完整的数据集应该包括训练集、测试集和验证集**。通常，数据集会被划分为训练集和测试集，比如将数据集的 70% 用作训练集，30% 用作测试集。在进行训练时，可以使用交叉验证的方法将训练集再次划分为训练子集和验证子集，用于模型的训练和验证。

        **训练集**是用于模型的训练的数据集。在训练过程中，模型使用训练集中的样本进行学习和参数调整，通过不断迭代优化模型的参数，使模型能够更好地拟合训练集中的数据。

        **测试集**是用于模型的评估的数据集。在训练完成后，使用测试集中的样本来评估模型的性能和泛化能力。测试集中的样本是模型没有看到过的样本，可以用来判断模型是否过拟合了训练集，以及模型在真实场景中的表现如何。

        **验证集**是用于模型的调优的数据集。在训练过程中，可以使用验证集对模型进行调参，比如选择合适的模型结构、调整超参数等。验证集的作用是帮助选择最佳的模型，并避免使用测试集对模型进行过度调优。

### 4.2 [数据集标注](https://so.csdn.net/so/search?q=%E6%95%B0%E6%8D%AE%E9%9B%86%E6%A0%87%E6%B3%A8&spm=1001.2101.3001.7020)

        模型的建立需要收集图片并且进行标注。YOLOv8 标注的文件格式如下：

![](https://i-blog.csdnimg.cn/blog_migrate/a8caefea7df51486755b53488032b8b3.png)

        其中，每一行通常包含五个数字，分别是类别标签和四个坐标值。这四个坐标值的含义如下：

1.  **类别标签（Class Label）**：第一个数字表示目标对象的类别。例如，如果数据集中有多个类别，每个类别会被分配一个唯一的整数标签。
    
2.  **中心点的 x 坐标（Center x）**：第二个数字表示目标框中心点的 x 坐标，该坐标是相对于图像宽度的比例值，范围在 0 到 1 之间。
    
3.  **中心点的 y 坐标（Center y）**：第三个数字表示目标框中心点的 y 坐标，该坐标是相对于图像高度的比例值，范围在 0 到 1 之间。
    
4.  **宽度（Width）**：第四个数字表示目标框的宽度，也是相对于图像宽度的比例值，范围在 0 到 1 之间。
    
5.  **高度（Height）**：第五个数字表示目标框的高度，是相对于图像高度的比例值，范围在 0 到 1 之间。
    

        手动标注很累，推荐使用下面的项目进行标注：

##### 1 Labelme

![](https://i-blog.csdnimg.cn/blog_migrate/299699d1f8119ffe797b0f0d633dfc32.jpeg#pic_center)

labelme 是一款开源的图像 / 视频标注工具，标签可用于目标检测、分割和分类。灵感是来自于 MIT 开源的一款标注工具 LabelMe。labelme 具有的特点是：

*   支持图像的标注的组件有：矩形框，多边形，圆，线，点（rectangle, polygons, circle, lines, points）
*   支持视频标注
*   GUI 自定义
*   支持导出 VOC 格式用于 semantic/instance segmentation
*   支出导出 COCO 格式用于 instance segmentation

项目地址：[GitHub - labelmeai/labelme: Image Polygonal Annotation with Python (polygon, rectangle, circle, line, point and image-level flag annotation).](https://github.com/wkentaro/labelme "GitHub - labelmeai/labelme: Image Polygonal Annotation with Python (polygon, rectangle, circle, line, point and image-level flag annotation).")

##### 2 LabelImg

![](https://i-blog.csdnimg.cn/blog_migrate/1f245f82d6e9fc2a88171ecf136ab1c9.png#pic_center)

LabelImg 是一个图形化的图像注释工具。它是用 Python 编写的，使用 Qt 作为其图形界面。注释被保存为 PASCAL VOC 格式的 XML 文件，该格式被 ImageNet 使用。此外，它还支持 YOLO 和 Create ML 格式。LabelImg 是由 Tzutalin 在几十位贡献者的帮助下创建的流行的图像注释工具，现在已经不再积极开发，并成为 Label Studio 社区的一部分。

项目地址：[GitHub - HumanSignal/labelImg: LabelImg is now part of the Label Studio community. The popular image annotation tool created by Tzutalin is no longer actively being developed, but you can check out Label Studio, the open source data labeling tool for images, text, hypertext, audio, video and time-series data.](https://github.com/heartexlabs/labelImg "GitHub - HumanSignal/labelImg: LabelImg is now part of the Label Studio community. The popular image annotation tool created by Tzutalin is no longer actively being developed, but you can check out Label Studio, the open source data labeling tool for images, text, hypertext, audio, video and time-series data.")

### 4.3 VOC 数据集转换

        VOC 数据集不能直接使用，VOC 数据集使用 XML 文件存储标注信息，而 YOLO 格式的标注文件为 TXT 格式，每行表示一个目标，包含类别 ID、中心点坐标、宽度和高度等信息。需要转换后使用。包括两个步骤：**格式转换**和**数据集划分**。

**格式转换代码：    （注意修改路径）**

```
import xml.etree.ElementTree as ET
import os, cv2
import numpy as np
from os import listdir
from os.path import join
 
classes = []
 
def convert(size, box):
    dw = 1. / (size[0])
    dh = 1. / (size[1])
    x = (box[0] + box[1]) / 2.0 - 1
    y = (box[2] + box[3]) / 2.0 - 1
    w = box[1] - box[0]
    h = box[3] - box[2]
    x = x * dw
    w = w * dw
    y = y * dh
    h = h * dh
    return (x, y, w, h)
 
 
def convert_annotation(xmlpath, xmlname):
    with open(xmlpath, "r", encoding='utf-8') as in_file:
        txtname = xmlname[:-4] + '.txt'
        txtfile = os.path.join(txtpath, txtname)
        tree = ET.parse(in_file)
        root = tree.getroot()
        filename = root.find('filename')
        img = cv2.imdecode(np.fromfile('{}/{}.{}'.format(imgpath, xmlname[:-4], postfix), np.uint8), cv2.IMREAD_COLOR)
        h, w = img.shape[:2]
        res = []
        for obj in root.iter('object'):
            cls = obj.find('name').text
            if cls not in classes:
                classes.append(cls)
            cls_id = classes.index(cls)
            xmlbox = obj.find('bndbox')
            b = (float(xmlbox.find('xmin').text), float(xmlbox.find('xmax').text), float(xmlbox.find('ymin').text),
                 float(xmlbox.find('ymax').text))
            bb = convert((w, h), b)
            res.append(str(cls_id) + " " + " ".join([str(a) for a in bb]))
        if len(res) != 0:
            with open(txtfile, 'w+') as f:
                f.write('\n'.join(res))
 
 
if __name__ == "__main__":
    postfix = 'png'    # 图像后缀
    imgpath = r'E:\helmet\test\images'    # 图像文件路径
    xmlpath = r'E:\helmet\test\annotations'   # xml文件文件路径
    txtpath = r'E:\helmet\test\labels'      # 生成的txt文件路径
    
    if not os.path.exists(txtpath):
        os.makedirs(txtpath, exist_ok=True)
    
    list = os.listdir(xmlpath)
    error_file_list = []
    for i in range(0, len(list)):
        try:
            path = os.path.join(xmlpath, list[i])
            if ('.xml' in path) or ('.XML' in path):
                convert_annotation(path, list[i])
                print(f'file {list[i]} convert success.')
            else:
                print(f'file {list[i]} is not xml format.')
        except Exception as e:
            print(f'file {list[i]} convert error.')
            print(f'error message:\n{e}')
            error_file_list.append(list[i])
    print(f'this file convert failure\n{error_file_list}')
    print(f'Dataset Classes:{classes}')
```

**数据集划分代码：    （注意修改路径）**

```
import os
import shutil
import random
 
def make_yolo_dataset(images_folder, labels_folder, output_folder, train_ratio=0.8, val_ratio=0.1, test_ratio=0.1):
    # 创建目标文件夹
    os.makedirs(os.path.join(output_folder, 'images/train'), exist_ok=True)
    os.makedirs(os.path.join(output_folder, 'images/val'), exist_ok=True)
    os.makedirs(os.path.join(output_folder, 'images/test'), exist_ok=True)
    os.makedirs(os.path.join(output_folder, 'labels/train'), exist_ok=True)
    os.makedirs(os.path.join(output_folder, 'labels/val'), exist_ok=True)
    os.makedirs(os.path.join(output_folder, 'labels/test'), exist_ok=True)
 
    # 获取图片和标签的文件名（不包含扩展名）
    image_files = [os.path.splitext(f)[0] for f in os.listdir(images_folder) if f.endswith('.jpg')]
    label_files = [os.path.splitext(f)[0] for f in os.listdir(labels_folder) if f.endswith('.txt')]
    matched_files = list(set(image_files) & set(label_files))
 
    # 打乱顺序并划分为训练集、验证集和测试集
    random.shuffle(matched_files)
    train_count = int(len(matched_files) * train_ratio)
    val_count = int(len(matched_files) * val_ratio)
    train_files = matched_files[:train_count]
    val_files = matched_files[train_count:train_count + val_count]
    test_files = matched_files[train_count + val_count:]
 
    # 移动文件到对应文件夹
    def move_files(files, src_images_path, src_labels_path, dst_images_path, dst_labels_path):
        for file in files:
            src_image_file = os.path.join(src_images_path, f"{file}.jpg")
            src_label_file = os.path.join(src_labels_path, f"{file}.txt")
            dst_image_file = os.path.join(dst_images_path, f"{file}.jpg")
            dst_label_file = os.path.join(dst_labels_path, f"{file}.txt")
 
            if os.path.exists(src_image_file) and os.path.exists(src_label_file):
                shutil.copy(src_image_file, dst_image_file)
                shutil.copy(src_label_file, dst_label_file)
 
    # 移动文件
    move_files(train_files, images_folder, labels_folder, os.path.join(output_folder, 'images/train'), os.path.join(output_folder, 'labels/train'))
    move_files(val_files, images_folder, labels_folder, os.path.join(output_folder, 'images/val'), os.path.join(output_folder, 'labels/val'))
    move_files(test_files, images_folder, labels_folder, os.path.join(output_folder, 'images/test'), os.path.join(output_folder, 'labels/test'))
 
    print("数据集划分完成！")
 
# 使用示例
images_folder = 'path/to/yolo_dataset/images'
labels_folder = 'path/to/yolo_dataset/labels'
output_folder = 'path/to/yolo_dataset/split'
make_yolo_dataset(images_folder, labels_folder, output_folder)
```

五、模型评价指标
--------

        **在模型训练完成之后，需要对模型的优劣作出评估**，YOLO 系列算法的评价指标包括：

1. 准确率（Precision）：指模型预测为正样本中实际为正样本的比例。

![](https://i-blog.csdnimg.cn/blog_migrate/211f5df13e32ec4587903e4924ecd6a7.png)

        **𝑇𝑃、𝐹𝑃、𝑇𝑁、𝐹𝑁分别代表被模型预测为正类的正样本、被 模型预测为正类的负样本、被模型预测为负类的负样本和被模型预测为负类的正 样本。𝑃表示正确预测的正样本在所有被预测为正样本中的百分比，𝑅表示正确预 测的正样本在所有正样本中的百分比。|𝑄𝑅| 表示目标类别的数量，𝑞表示检测目标 的类别，𝐴𝑃(𝑞) 表示类别𝑞的𝐴𝑃值。** 

**![](https://i-blog.csdnimg.cn/blog_migrate/8926cf07b1a80c0a959476f92321f273.png)**

2. 召回率（Recall）：指实际为正样本中模型预测为正样本的比例。

3. F1 值（F1-score）：综合考虑准确率和召回率的指标，由准确率和召回率的加权调和平均值计算而得。

4. 平均准确率均值（mean average precision，mAP）：用于衡量模型在不同类别上的平均准确率。mAP 是多个类别准确率的均值。

5.FPS（Frame Per Second）：评估模型检测速度时常用的指标是 FPS，即每秒帧率， 表示每秒内可以检测的图片数量。

6. 参数量（Params）：Params 被用来评估模型的空间复杂度。

7. 浮点运算次数（GFLOPs）：GFLOPs 被用来评估模型的 时间复杂度。

 **论文中需要使用这些指标，对比不同模型，确定哪些模型是优秀的。**如图所示：

![](https://i-blog.csdnimg.cn/direct/de0ed4a333de442f915013dc39591367.png)

持续更新中。。。。。