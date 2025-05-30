---
created: 2025-05-20T10:37
updated: 2025-05-20T13:32
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [opticsjournal.net](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FullText)

> 针对无人机航拍图像中小目标特征信息少、目标尺度变化大致使算法的小目标识别与定位精度不高的问题，提出一种基于 YOLOv8n 的无人机小目标检测算法。

1　引言
---

随着无人机（UAV）在农业、救援、环境监测、城市管理、** 等领域的广泛应用［[1](#Ref_1)］，为减少对人工的依赖并扩大通用场景，无人机平台通常结合计算机视觉技术感知周围环境，其中目标检测是最常见的场景解析方法之一。尽管现有的目标检测模型在自然场景检测方面取得了显著进步，但将这种通用目标检测模型直接应用于无人机航拍图像时仍然存在以下问题［[2](#Ref_2)］：1）与传统图像不同，无人机图像采集视角特殊，具有更广阔的视野，导致图像中目标宽高比差异较大，以小目标居多，且存在目标遮挡和重叠现象，增大了检测难度；2）无人机图像中的目标类型多样，背景复杂多变，包括建筑物、道路、车辆、植被等，而通用目标检测模型可能在特定类型的目标上性能较强，因此，需要对目标多样性进行充分考虑；3）受到无人机平台自身的限制，无法解决目标检测计算能耗大的问题，因此多采用移动设备进行实时计算［[3](#Ref_3)］。然而，移动端部署目标检测网络往往受到低算力的限制。为解决这一问题，研究者们通常采用轻量化设计和模型压缩等方法来降低网络的复杂度和减少参数量，从而降低计算量和内存消耗，加快推理速度。然而，轻量化结构会降低网络的特征提取与融合能力，无人机图像以小目标为主，网络提取能力的不足会降低无人机目标检测的精度。因此，如何在轻量化的同时保持网络的特征提取能力，以确保检测精度仍是当前的难点问题。

目前，常用的目标检测模型主要包括基于候选区域和基于回归的算法。基于候选区域的算法也称为两阶段目标检测算法，是一种结合深度卷积神经网络和区域推荐的目标检测方法，第一阶段主要为区域帧推荐，第二阶段主要为区域帧识别，如 R-CNN［[4](#Ref_4)］、Faster R-CNN［[5](#Ref_5)］、D2Det［[6](#Ref_6)］等。其中，Faster R-CNN 是应用较广泛的方法，其网络结构参数的计算成本巨大，检测速度较慢，很难满足实时检测要求。基于回归的算法也称为单阶段目标检测算法，与两阶段算法相比，单阶段算法具有简单高效且实时性强的优势，然而与两阶段算法相比，其在准确性和精度上表现相对较差，代表算法包括 SSD［[7](#Ref_7)］、YOLO［[8](#Ref_8)-[10](#Ref_10)］系列。

为了提升复杂场景下无人机对目标的检测精度，Liu 等［[11](#Ref_11)］基于 SSD 算法，利用 ResNet-50 作为辅助主干网络保留更多的浅层特征，以增加特征融合的丰富度，提高对小目标的识别精度。然而，ResNet-50 的参数较多，会占用较大的内存空间，不利于无人机设备部署。Liu 等［[12](#Ref_12)］基于密集场景对 YOLOv5 进行改进，提出一种特征增强块 FEBlock，为不同感受野特征生成自适应权重，将主要权重赋予密集的小目标区域，并将 FEBlock 与空间金字塔相结合，对每个最大池化结果进行特征增强，但是过于复杂的金字塔结构导致模型的实时性和计算量提高。Lou 等［[13](#Ref_13)］针对复杂场景中小目标检测问题提出了 DC-YOLOv8 模型，设计了 MDC 模块，将深度可分离卷积、最大池化、3×3 卷积连接，以补充下采样过程中丢失的信息，改进特征融合网络，更全面地保留浅层和深层信息，但是 MDC 模块可能会引入一些不必要的噪声，而深度可分离卷积也可能会引入一些与目标无关的特征，处理这些噪声需要额外的后处理步骤，进一步增加了模型的复杂性和计算成本。

为了提升模型的特征融合能力，加强特征信息的利用，Li 等［[14](#Ref_14)］提出一种基于 YOLOv8s 模型的小参数目标检测网络，采用 Bi-FPN 替换 YOLOv8 的 PAFPN 结构，并利用 Ghostblock 模块改进骨干网络，实现参数更少、检测性能更好的神经网络模型，但在多尺度与复杂背景下对小目标的检测效果有待提升。Lan 等［[15](#Ref_15)］提出一种多尺度特征优化网络，设计特征优化融合模块，通过学习像素位移来增强不同级别上下文信息不一致的特征融合，促进更有效的特征融合，同时利用特征增强模块来提取更丰富的梯度流信息，抑制不兼容信息。该方法有效缓解了目标尺度变化的问题，但对小目标的检测效果有待提升。

为了增强模型的特征提取能力。Wang 等［[16](#Ref_16)］对 YOLOv8 进行改进，将动态稀疏注意力机制 BiFormer 集成到骨干网络中，增强模型对特征图中关键信息的关注，设计了一种特征处理模块 FFNB 来充分融合浅层和深层特征，并在此基础上增添两个检测头，降低小目标的漏检率。然而，由于增加了两个检测层，模型的结构变得复杂，浅层特征图尺寸较大，使得模型的计算量增大，推理时间延长。

上述方法利用不同策略解决了无人机视角下小目标数量多、尺度差异大、背景复杂与目标遮挡等问题，但是对于图像中不同层级包含的特征信息的利用不够充分，在复杂场景中多尺度目标的检测效果仍有提升空间，一定程度上以模型的计算复杂度、检测的实时性为代价换取检测精度的提升。为了在保持较高检测精度的同时，降低无人机平台的部署难度，本文提出一种基于改进 YOLOv8 的无人机小目标检测算法，在保持算法计算量、降低算法参数量的同时提升小目标检测精度，并在 VisDrone2019 无人机数据集上取得了良好的效果。首先，设计多尺度特征融合层，连接不同层次的特征图，增强上下文信息的收集，同时加强底层特征细节信息的利用，以提高小目标的检测精度。其次，在颈部网络中引入三重特征融合结构和尺度序列特征融合结构，将不同尺度的特征图融合，使算法能够充分利用多尺度信息，以获取更全面的目标特征，提升对不同尺度目标的检测效果。然后，使用纯卷积神经网络 ConvNeXt v2 替换基准模型的骨干网络，以提高复杂背景下网络的抽象特征提取能力。最后，采用层自适应幅度剪枝算法，消除改进算法内部的冗余连接与节点来平衡模型的计算复杂度和检测精度。

2　YOLO 系列算法
-----------

YOLO 系列算法是目前主流的实时目标检测器，具有轻量级的网络架构、有效的特征融合方法，以及更准确的检测结果等优点。YOLOv5 采用深度学习技术实现实时高效的目标检测。与 YOLOv4 相比，YOLOv5 在模型结构、训练策略、检测性能等方面都有较大的改进。YOLOv5 采用 CSP （cross stage partial）网络结构，有效减少了重复计算，提高了计算效率。不过，YOLOv5 在小目标检测方面还存在一些不足，对密集目标的检测效果也有待提高。此外，YOLOv5 在遮挡、姿态变化等复杂情况下的性能仍需提升。

YOLOv7 提出一种新的训练策略，称为可训练免费赠品袋（TBoF），用于提高实时目标检测器的性能。TBoF 方法包括一系列可训练的技巧，如数据增强、混合等。该方法通过将 TBoF 应用于 3 种不同类型的目标检测器，可以显著提高目标检测器的准确性，增强其泛化能力。然而，YOLOv7 也受到训练数据、模型结构和超参数的限制，在某些情况下出现性能下降。此外，该方法需要更多的计算资源和更长的训练时间才能达到最佳性能。

YOLOv8［[17](#Ref_17)］由 Ultralytics 团队于 2023 年发布，其结合众多实时目标检测器的优点，在保持高准确度的同时达到较快的运行速度，能够更高效地完成目标检测、图像分割等任务。YOLOv8 依据网络的深度与宽度差异，分为 YOLOv8n、YOLOv8s、YOLOv8m、YOLOv8l、YOLOv8x 5 种模型，YOLOv8 框架如图 1 所示。YOLOv8 仍然采用 YOLOv5 中的 CSP 思想、特征融合方法［包含特征金字塔网络［[18](#Ref_18)］（FPN）和路径聚合网络［[19](#Ref_19)］（PAN）两部分］和 SPPF 模块，主要改进如下：1）在保留 YOLOv5 原有思想的前提下，参照 YOLOv7 的 ELAN 结构设计了 C2f 模块；2）检测头部分采用目前流行的分类头和检测头分开的方法；3）采用无锚框机制，直接预测小目标的边缘，滤除标签中的噪声干扰项，降低模型的超参数、网络复杂度，使计算速度更接近 YOLO 系列的高速标签。

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840409.jpeg)

# 图 1. YOLOv8 网络框图

# Fig. 1. YOLOv8 network architecture

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_01.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

YOLOv9 在 YOLOv7 的基础上进行构建，引入了可编程梯度信息（PGI），由主分支、辅助可逆分支和多级辅助信息 3 个部分组成。辅助可逆分支可以生成可靠的梯度信息，为主分支提供反向传输；多级辅助信息则可以减轻在深度监督和具有多个预测分支的轻量级模型中的误差积累。这种设计使得模型在训练过程中能够更好地学习目标特征，提高检测性能。同时，在模型推理阶段不需要辅助训练分支等模块，所以 YOLOv9 在推理阶段不会耗费额外的推理时间。然而，YOLOv9 需要大量的标注数据进行训练，目前无人机数据集部分目标样本的训练数据不足，可能会导致模型过拟合或者性能下降。此外，在面对新的、与训练数据分布不同的任务时，YOLOv9 可能需要更多的调整和优化才能取得较好的效果。

YOLOv10 在后处理阶段采用一种新的 NMS-free 方法，提出了双重标签分配策略，在训练过程中同时进行一对多和一对一的标签分配。一对多标签分配用于提供全面监督，而一对一分配用于最终预测，使得推理时无需 NMS，既保留了丰富的监督信息，又大幅提升了推理效率。该模型还引入了标准化的匹配方法，以确保这些双分支之间的一致性，优化训练和推理过程。YOLOv10 虽然采用非极大值抑制方法，后处理速度更快，延迟时间更短，但是参数较少，置信度较低，往往会遗漏较小的对象，在小目标物体数量更多的无人机航拍领域表现出一定的劣势。

与其余 YOLO 算法相比：首先，YOLOv8 具有更快的推理和训练速度，这使得 YOLOv8 更适合需要快速响应的实时应用；其次，YOLOv8 的计算需求相对较低，模型参数量较少，适合在计算资源有限的环境中运行，相对简单的架构使其更容易训练和部署，所需的计算资源和内存更少；最后，YOLOv8 具有很强的可扩展性，可以支持不同版本的 YOLO 算法，并且可以在不同版本之间切换，便于比较不同版本的性能，这为 YOLO 项目的研究提供了便利。 综合比较之下，本文选择计算复杂度最低的 YOLOv8n 版本作为基准模型。

3　基本工作
------

针对无人机航拍图像小目标占比较高、不同目标尺度差异较大造成的细节信息不足和特征融合信息单一的问题，对 YOLOv8n 模型进行改进工作。首先，为了提高模型特征提取能力，在 YOLOv8n 模型的 Backbone 网络采用 ConvNeXt v2 替换 DarkNet-53；其次，为了充分利用多尺度信息获取更全面的目标特征，在 Neck 网络引入三重特征融合机制和尺度序列特征融合模块；然后，在 Head 层设计多尺度特征融合层来加强上下文信息的收集，以提升对多尺度小目标的识别能力；最后，采用层自适应幅度剪枝算法来平衡模型的计算复杂度与计算精度。改进算法的整体框图如图 2 所示。

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840410.jpeg)

# 图 2. 基于 YOLOv8n 网络的改进算法整体框图

# Fig. 2. Improved algorithm architecture based on YOLOv8n network

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_02.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

3.1　ConvNeXt v2
---------------

在无人机小目标检测领域，无人机在飞行过程中会面临各种复杂的环境条件，如光照变化、背景干扰等，从而干扰网络对于小目标特征信息的提取。为了有效应对复杂的背景和环境因素对检测性能的干扰，引入一种先进的纯卷积神经网络架构 ConvNeXt v2［[20](#Ref_20)］。

ConvNeXt v2 采用 ResNet-50 架构作为基础，并借鉴 Swin Transformer［[21](#Ref_21)］网络结构进行搭建。随着网络层数的增加，ConvNeXt v2 的深度卷积结构能够深入挖掘图像中的特征，学习到更高级、更抽象的特征表示。这些特征在区分小目标和复杂背景方面发挥了重要作用，尤其是在光照变化、天气影响等复杂条件下，深度卷积可以提取出具有更强鲁棒性的特征。对于不同的环境条件下，图像的特征分布发生变化的问题，ConvNeXt v2 能够根据输入图像的特点动态调整特征提取过程。通过自适应的参数调整，ConvNeXt v2 在各种复杂环境中都能保持较好的特征提取性能。

YOLO 算法以检测速度快而闻名，但在处理复杂背景下的小目标时，可能会因为其相对简单的特征提取网络而出现精度不足的问题；ConvNeXt v2 则能够深入挖掘图像的特征信息，为小目标检测提供更丰富的特征表示，为无人机小目标检测提供更精细的特征。因此，将骨干网络替换为 ConvNeXt v2 进行特征提取，有利于解决复杂背景下的小目标检测问题。

3.2　ASF-Neck
------------

针对无人机航拍场景中的多尺度问题，为了检测到大小各异的目标，需要对不同层级的特征进行融合。在模型结构确定之初，不同层级的特征图所能学习的特征随之确定，但是 YOLOv8 在采用特征金字塔和特征聚合网络结构进行特征融合的过程中，经过多次的卷积和上下采样操作，容易导致深层特征细节信息丢失。特别是受无人机视角变化影响，小目标在特征图上的表现较为模糊，特征信息较少，而模型层次的加深，加剧了这种情况，降低了模型对小目标的检测精度。为了避免多次特征融合造成的信息丢失，加强细节信息的利用，搭建了新的 Neck 网络 ASF-Neck，利用三重特征编码（TFE）机制［[22](#Ref_22)］和尺度序列特征融合（SSFF）模块［[23](#Ref_23)］，充分利用不同尺度的特征信息来获取更加丰富多样的目标特征信息，有效提升模型的目标理解与表达能力。ASF-Neck 首先对不同尺度的特征图（_P_2~_P_5）通过标准卷积处理，用 TFE 模块将这些不同尺度的特征图融合，形成一个综合特征表示，提升模型对小目标的感知能力；然后，使用 C2f 模块提取特征；最后，通过 SSFF 模块聚合来自网络不同层的特征，将深、浅层的特征进行融合，加强模型的细节信息获取能力，进而在较少计算量的情况下提升模型的表现能力。

TFE 模块是一种特征融合机制，能同时融合特征提取网络中 3 个不同尺寸的特征图，形成一个综合特征表示，而从感受野的角度来理解特征融合机制，可以将其定义为不同尺寸感受野信息的叠加。为了捕获更多的上下文信息和细节信息，提升模型对多尺度目标的定位和识别能力，在 ASF-Neck 中设置两个 TFE 模块，与 YOLOv8 相比，分别增加了对_P_2、_P_3 与_P_3、_P_4 层特征图包含信息的利用，从而捕捉_P_2 层包含的细节信息和局部上下文信息，清晰地显示小目标的边缘、纹理以及周围的局部环境。同时，获取 _P_4 层丰富的语义信息和全局上下文信息。全局上下文信息有助于理解小目标所处的环境和位置关系，从而有效提升模型对于目标的理解与表达能力。

TFE 模块的输入分别为、_N_×_N_以及 2_N_×2_N_大小的特征图。首先，对小尺寸特征图进行最近邻插值上采样，以得到_N_×_N_大小的中尺寸特征图；然后，对大尺寸特征图进行自适应最大池化和自适应平均池化，有助于保留高分辨率特征，得到_N_×_N_大小的中尺寸特征图；最后，将 3 个相同大小、不同层级的特征图按通道进行拼接，得到输出的特征映射。具有与相同的分辨率和三倍的通道数，计算公式［[22](#Ref_22)］如下

（1）

可以看到，由、和串联而成。TFE 模块结构如图 3 所示。

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840411.jpeg)

# 图 3. TFE 特征连接模块

# Fig. 3. TFE feature concatenation module

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_03.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

SSFF 模块是处理多尺度信息的关键组件［[24](#Ref_24)］，其主要功能是增强神经网络在提取不同尺度特征时的能力。通过聚合来自网络不同层的特征，SSFF 模块能够提供更为丰富和细致的特征表示，有助于改善模型在处理不同尺寸目标时的表现。对于需要精确定位及识别图像中多尺度目标的无人机图像目标检测任务而言，通过 SSFF 模块可以更有效地识别和理解图像中的细节，从而提高整体的检测和识别性能。

SSFF 模块（图 4）基于包含目标检测大部分信息的高分辨率特征层_P_3 设计，能够更好地将具有相同长宽比的深层特征图的高级信息与浅层特征图的详细信息结合。首先，将骨干网络生成的不同细节或尺度的二维特征图作为输入，与一系列标准差递增的高斯滤波器进行卷积［[25](#Ref_25)-[26](#Ref_26)］，即

（2）（3）

式中：表示宽度为_w_、高度为_h_的二维特征图；为二维高斯滤波器的标准差缩放参数；* 为卷积运算。其次，将这些不同尺度的特征图水平堆叠，并使用 3D 卷积提取其尺度序列特征［[27](#Ref_27)］。上述高斯平滑的输出特征图具有不同的分辨率，使用最近邻插值法将所有特征图对齐到与_P_3 相同的分辨率。然后，将特征层从三维张量变为四维张量，沿着深度维度将特征图连接，形成一个用于后续卷积的三维特征图。最后，使用 3D 卷积、3D 批归一化完成尺度序列特征提取。

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840412.jpeg)

# 图 4. SSFF 模块结构

# Fig. 4. Structure of SSFF module

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_04.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

3.3　多尺度特征融合层
------------

在无人机航拍场景中，由于无人机飞行高度较高、视野宽广，航拍数据集中小目标占比较大。VisDrone2019 数据集［[28](#Ref_28)］的目标尺寸分布见图 5。由图 5 可知：宽度和高度尺寸小于 0.05 的小目标分布最密，颜色最深；尺寸在 0.05~0.15 范围的中尺寸目标以及尺寸大于 0.15 的大尺寸目标分布广泛、宽高差异较大。

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840413.jpeg)

# 图 5. 目标尺寸分布

# Fig. 5. Distribution of target sizes

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_05.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

在目标检测过程中，浅层网络的感受野较小，语义信息较弱，但细节表示能力较强。随着卷积次数的增多，网络结构的感受野增大，引起细节表示能力削弱和抽象特征增强，所以利用不同层级的特征信息会影响目标检测的准确性。由于 VisDrone2019 数据集中小目标的尺寸较小，并且 YOLOv8 的上采样倍数较大，仅利用深层特征图难以学习到小目标的特征信息。为了利用不同尺寸感受野所包含的信息，设计了多尺度特征融合层（MSFH）模块，以连接不同层级的特征图，增强上下文信息收集能力，同时加强底层特征细节信息的利用，提高小目标的检测精度。MSFH 检测层结构如图 6 所示。

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840414.jpeg)

# 图 6. MSFH 结构

# Fig. 6. MSFH structure

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_06.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

MSFH 检测层是由 SSFF 模块结合小目标检测层衍生而来的结构，用于解决原始 YOLOv8 小目标检测对特征信息利用不足的问题。YOLOv8 默认有 3 个检测头，分别对应不同尺寸的目标。首先，通过增加第 4 个检测层，将检测特征图的维度由 20×20、40×40 和 80×80 扩大至 160×160，以增强对小目标的检测能力。然后，结合特征融合结构 SSFF，融合浅层特征图和经过颈部网络处理的多种尺度特征图，适应不同大小的目标。对于小目标，利用高分辨率特征图更精细的细节信息；对于尺度变化差异大的目标，结合低分辨率特征图包含的上下文信息，从全局的角度理解图像的空间布局，从而为小目标的检测提供空间位置和目标所处场景的参考。最后，通过特征加法连接深层和浅层网络，进一步提升模型对小目标的关注度，从而提高算法在无人机航拍数据集上的检测性能。

3.4　层自适应幅度剪枝
------------

多尺度特征融合能够加强小目标的特征表示能力，进而提高小目标的检测性能。然而，多尺度特征融合的使用加重了计算负担，给无人机的实际部署带来了困难。对此，采用基于权重大小的层自适应幅度剪枝（LAMP）算法［[29](#Ref_29)］，解决模型计算复杂度和检测精度的平衡问题。LAMP 消除了神经网络内部的冗余连接与节点，并解决了神经网络剪枝层间稀疏性问题，在复杂度和准确性之间取得更好的平衡。通过计算每一层的权重对输出的敏感度，并根据敏感度 LAMP 分数的大小来确定每一层的稀疏度。对于对输出影响较小的层，选择较高的稀疏度；对于对输出影响较大的层，选择较低的稀疏度。根据给定的索引映射对权重进行升序排列，即当指标成立时，有，其中表示由索引_u_映射到_W_的条目。权重张量_W_的第_u_个权重索引的 LAMP 分数计算公式［[29](#Ref_29)］如下：

（4）

在计算 LAMP 分数后，将连接从最低分到最高分排列，根据全局稀疏性约束，分数最低的连接会被剪枝，直至满足要求。在整个剪枝过程中，必须在每一层至少保留一个连接，在达到所需的稀疏度级别之前重复上述步骤。通过 LAMP 的应用，有效减少了模型参数量和计算量，使改进算法更适合在资源受限的无人机平台进行部署。

4　实验结果与分析
---------

为验证改进算法的检测效果，在相同的实验环境、参数设置和评价指标下，基于 VisDrone2019 数据集对改进算法与目前主流目标检测算法进行对比分析，并设置消融实验进一步验证各改进模块的有效性。

4.1　实验环境与参数设置
-------------

实验由一台计算机完成，计算机 GPU 型号为 NVIDIA GeForce RTX 3060 Ti，运行内存为 8 GB，操作系统为 64 位 Windows 11，深度学习框架为 Pytorch 1.12.1，编程语言为 Python3.8、CUDA11.6。训练过程中不加载预训练权重，批尺寸设置为 4，图片输入尺寸为 640 pixel×640 pixel，总训练轮数设置为 200，多线程设置为 8，学习速率值为 0.01，动量参数值为 0.937，置信度阈值为 0.001。

4.2　数据集
-------

本文使用 VisDrone2019 数据集［[28](#Ref_28)］进行训练、验证和测试实验。该数据集由天津大学机器学习与数据挖掘实验室通过无人机捕获收集，共包括 8629 幅静态图像，其中训练集 6471 幅，验证集 548 幅，测试集 1610 幅。所有图像包含 10 个种类的目标，分别为行人、人（驾驶工具或者静止不动的人）、汽车、面包车、巴士、卡车、摩托车、自行车、遮阳篷 - 三轮车和三轮车，均包含小型车辆和行人等小目标，并涵盖了多种复杂场景。

4.3　评价指标
--------

目前，YOLOv8 模型的性能评价指标主要包括 mAP50、mAP50-95、参数量（parameters）、每秒浮点操作数（FLOPS）［[30](#Ref_30)］。其中，mAP50（）表示所有类别的平均精确率（AP）在平均交并比阈值为 50% 时的平均值，计算公式［[31](#Ref_31)］为

（5）

式中：为第_i_类样本的平均精确率；_N_为总类别数。

mAP50-95（）表示所有类别的平均精确率在平均交并比阈值以 5% 为步长，从 50% 增大到 95% 时 10 个平均精确率的均值，计算公式［[31](#Ref_31)］如下：

（6）

参数量是神经网络模型中需要学习的可调整权重和偏置值等参数的数量，包括输入层、隐藏层和输出层的神经元数量、卷积层的滤波器数量等。这些参数是模型的关键部分，用于表示神经网络中各个连接的强度和偏移量，从而决定了网络的行为和输出。

FLOPS 用于衡量算法的计算复杂度和效率，并且表示在特定的计算任务中执行的浮点运算次数。

4.4　实验
------

为了进一步验证改进算法在无人机航拍场景下目标检测的性能，在保证算法训练环境和训练参数相同的条件下，基于 VisDrone2019 数据集对 YOLOv5s、YOLOv7tiny、基准模型 YOLOv8n、YOLOv8s、YOLOv10n、YOLOv11n、DAMO-YOLO、Gold-YOLO 目标检测算法设置了两类实验：1）对 9 种算法检测精度、参数量、FLOPS 的对比实验，实验结果如表 1 所示；2） 5 种代表性算法对数据集中 10 类不同目标检测精度的实验，实验结果如表 2 所示。

# 表 1. 不同算法的对比实验结果

# Table 1. Comparative experiment results of different algorithms

<table><thead><tr><th>Algorithm</th><th><p>mAP<sub>50</sub> /</p><p>%</p></th><th><p>mAP<sub>50-95</sub> /</p><p>%</p></th><th><p>Parameters /</p><p>10<sup>6</sup></p></th><th>FLOPS /10<sup>9</sup></th></tr></thead><tbody><tr><td>YOLOv5s</td><td>26.3</td><td>13.5</td><td>7.04</td><td>15.8</td></tr><tr><td>YOLOv7-tiny</td><td>29.7</td><td>14.8</td><td>6.03</td><td>13.1</td></tr><tr><td>YOLOv8n</td><td>26.4</td><td>14.7</td><td>3.01</td><td>8.1</td></tr><tr><td>YOLOv8s</td><td>32.0</td><td>18.2</td><td>11.10</td><td>28.5</td></tr><tr><td>YOLOv10n</td><td>26.8</td><td>14.6</td><td>2.27</td><td>6.5</td></tr><tr><td>YOLOv11n</td><td>26.5</td><td>14.7</td><td>2.58</td><td>6.3</td></tr><tr><td>DAMO-YOLO</td><td>21.1</td><td>11.6</td><td>8.20</td><td>17.2</td></tr><tr><td>Gold-YOLO</td><td>24.4</td><td>13.6</td><td>5.61</td><td>12.1</td></tr><tr><td>Ours</td><td>30.2</td><td>16.5</td><td>1.38</td><td>9.0</td></tr></tbody></table>

[查看所有表](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable)

# 表 2. 10 种目标的 mAP50 对比

# Table 2. mAP50 comparison for ten targets

<table><thead><tr><th>Algorithm</th><th>Awn-tr</th><th>Bicycle</th><th>Bus</th><th>Car</th><th>Motor</th><th>Pedestrian</th><th>People</th><th>Tricycle</th><th>Truck</th><th>Van</th></tr></thead><tbody><tr><td>YOLOv5s</td><td>12.2</td><td>7.3</td><td>49.9</td><td>67.7</td><td>22.4</td><td>24.2</td><td>15.7</td><td>11.0</td><td>24.8</td><td>28.2</td></tr><tr><td>YOLOv7-tiny</td><td>15.6</td><td>8.8</td><td>51.0</td><td>70.5</td><td>27.7</td><td>25.8</td><td>19.4</td><td>14.7</td><td>30.9</td><td>32.7</td></tr><tr><td>YOLOv8n</td><td>13.4</td><td>6.1</td><td>48.9</td><td>65.9</td><td>23.1</td><td>22.8</td><td>11.5</td><td>11.4</td><td>30.9</td><td>30.4</td></tr><tr><td>YOLOv11n</td><td>13.8</td><td>5.7</td><td>50.1</td><td>66.2</td><td>23.0</td><td>21.8</td><td>11.8</td><td>12.8</td><td>30.8</td><td>29.4</td></tr><tr><td>Ours</td><td>15.8</td><td>9.2</td><td>51.0</td><td>72.0</td><td>28.2</td><td>28.9</td><td>17.8</td><td>15.0</td><td>29.4</td><td>34.9</td></tr></tbody></table>

[查看所有表](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable)

由表 1 可知，在检测精度方面，改进算法的 mAP50 和 mAP50-95 达到 30.2% 和 16.5%，表现较为突出。与 YOLOv5s、基准模型 YOLOv8n 以及最新的 YOLOv11n 相比，所提算法的 mAP50 分别提高了 3.9、3.8 和 3.7 百分点；与华为诺亚方舟实验室提出的 Gold-YOLO 和阿里达摩院提出的 DAMO-YOLO 相比，所提算法的 mAP50 分别提高了 5.8 和 9.1 百分点。与计算深度更高的 YOLOv8s 相比，所提算法的 mAP50 降低了 1.8 百分点。与基准模型 YOLOv8n、YOLOv11n 相比，所提算法的 mAP50-95 均提高了 1.8 百分点，与 DAMO-YOLO 相比，提高了 4.9 百分点。由此可见，改进算法在无人机小目标检测精度方面存在优势。

为了比较改进算法平衡计算复杂度和计算精度的能力，分别对上述算法的参数量和 FLOPS 进行对比。改进算法的参数量仅为 1.38×106，比 YOLOv11n 降低了 1.2×106，较基准模型 YOLOv8n 降低了 1.63×106，比精度表现最优的 YOLOv8s 降低了 9.72×106。改进算法的 FLOPS 为 9.0×109，与检测精度 mAP50 相近的 YOLOv7-tiny 模型相比，其 FLOPS 减少了 4.1×109；与 YOLOv10n 和 YOLOv11n 相比，其 FLOPS 分别提高了 2.5×109 和 2.7×109；与精度表现最优的 YOLOv8s 相比，其 FLOPS 下降了 19.5×109；与基准模型 YOLOv8n 相比，在检测精度 mAP50 提升 3.8 百分点的情况下，改进算法的 FLOPS 提升了 0.9×109。综合不同指标，改进算法在保持较高检测精度的同时，参数量和 FLOPS 都相对较小，说明该模型在性能和资源消耗之间取得了较好的平衡，这对于资源受限的无人机场景上的应用具有实际意义。

表 2 为改进算法与其他模型在数据集中的代表性类别对比。可以看到：改进算法在巴士（bus）、汽车（car）、面包车（van）尺度差异变化大的目标类别的 mAP50 达到 51.0%、72.0% 和 34.9%，与基准模型 YOLOv8n 相比，改进算法的 mAP50 均显著提高；对于自行车（bicycle）、摩托车（motor）、三轮车（tricycle）这类小尺寸目标，改进算法同样具有较高的检测精度，mAP50 分别为 9.2%、28.2%、15.0%，较基准模型 YOLOv8n 的 mAP50 均提高 3.1 百分点以上；从对行人（pedestrian）与人（people）的指标来看，改进算法在检测精度上存在优势，但对于行走状态的行人和驾驶工具或处于静止的人，改进算法的分辨能力仍有提升空间。从总体指标来看，对于航拍场景下不同种类目标和小尺寸目标的检测任务，改进算法具有更好的性能。

4.5　消融实验
--------

为充分验证改进算法各模块的有效性，基于 VisDrone2019 数据集进行消融实验，并对每个改进的结果进行分析。消融实验的具体设计和相应结果如表 3 所示，其中 “√” 为当前使用模块。

# 表 3. 消融实验结果

# Table 3. Ablation experiment results

<table><thead><tr><th>SSFF</th><th>TFE</th><th>MSFH</th><th>ConvNext v2</th><th>LAMP</th><th>mAP<sub>50</sub> /%</th><th>mAP<sub>50-95</sub> /%</th><th>Parameters /10<sup>6</sup></th><th>FLOPS /10<sup>9</sup></th><th>Time /ms</th></tr></thead><tbody><tr><td></td><td></td><td></td><td></td><td></td><td>26.4</td><td>14.7</td><td>3.01</td><td>8.1</td><td>10.5</td></tr><tr><td>√</td><td></td><td></td><td></td><td></td><td>27.0</td><td>15.0</td><td>3.04</td><td>8.3</td><td>11.5</td></tr><tr><td>√</td><td>√</td><td></td><td></td><td></td><td>27.7</td><td>15.6</td><td>3.05</td><td>8.5</td><td>12.1</td></tr><tr><td>√</td><td>√</td><td>√</td><td></td><td></td><td>29.4</td><td>16.3</td><td>2.49</td><td>12.0</td><td>14.8</td></tr><tr><td>√</td><td>√</td><td>√</td><td>√</td><td></td><td>32.2</td><td>17.6</td><td>5.16</td><td>18.2</td><td>15.9</td></tr><tr><td>√</td><td>√</td><td>√</td><td>√</td><td>√</td><td>30.2</td><td>16.5</td><td>1.38</td><td>9.0</td><td>15.5</td></tr></tbody></table>

[查看所有表](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable)

从表 3 可以清晰地看到，在颈部网络引入 SSFF、TFE 模块后，改进算法能够高效地整合不同层级的特征图，提高上下文信息的获取能力，从而显著提升模型的特征表达能力。实验结果表明，在添加两种模块后，改进算法的 mAP50 相对于基准模型提高了 1.3 百分点。模型的参数量与 FLOPS 几乎没有发生变化，仍然保持相对较小，而检测速度略微增加。这一增益归因于 SSFF 模块能够更好地将具有相同长宽比的深层特征图的抽象信息与浅层特征图的细节信息结合，而 TFE 模块将不同尺度的特征信息融合在一起，使得模型更为深刻地理解目标的上下文信息。

引入的 MSFH 模块有助于模型更好地适应小目标的尺寸、形状和特征，更好地收集小目标的细节信息和全局上下文信息，从而使模型的 mAP50、mAP50-95 提升了 1.7 和 0.7 百分点。同时，MSFH 模块结合通往_P_4、_P_5 检测层的特征信息，可加强小目标识别，同时减少 0.56×106 的参数量，有效提高模型对无人机图像的检测效率。但是添加 MSFH 模块后，模型需要对输入图像进行特征提取和处理，涉及更多的卷积、池化操作等，从而增加了 FLOPS。此外，小目标检测通常需要更精细的后处理步骤来提高检测的准确性和可靠性，使推理流程更加复杂，增加了检测时间。在具有大量小目标的场景下，仅依赖_P_3 层可能无法捕捉到足够多的小目标信息，因此综合利用多个检测层的信息来提升检测性能是一种常见且有效的方法。

将骨干网络替换为 ConvNeXt v2 后，改进算法的特征表达能力提高了，并且过拟合风险降低，检测精度达到最高值 32.2%，与基准模型 YOLOv8n 相比，改进算法的 mAP50、mAP50-95 分别提升了 5.8 和 2.9 百分点。相较于实验中检测精度最优的 YOLOv8s，改进算法的 mAP50 提升了 0.2 百分点，参数量减少了 5.94×106，FLOPS 减少了 10.3×109。这是因为 ConvNeXt v2 更好地结合深度卷积操作来增强通道之间的特征竞争，提高通道对比度与选择性，有利于提高复杂背景图像中提取特征的多样性，解决无人机航拍图像存在的动态模糊、背景复杂等问题。改进算法的检测时间为 15.9 ms，帧率达到 62.8 frame/s。对于大多数应用场景，30 frame/s 被认为是基本流畅的标准，而 60 frame/s 被认为是非常流畅的标准。不同指标证明了改进算法在无人机航拍场景下对于提升检测精度、降低计算复杂度、加快计算速度的有效性。

引入 LAMP 平衡的算法可以使用更少的参数量、FLOPS 达到检测精度和部署难度上的平衡。与基准模型 YOLOv8n 相比，改进算法的 mAP50、mAP50-95 分别提升了 3.8 和 1.8 百分点，参数量减少了 1.63×106，FLOPS 仅增加了 0.9×109。综合而言，改进算法在检测精度提升、计算复杂度降低、部署难度降低和适用性提升等方面具有显著优势，有利于在无人机航拍领域的实际应用。

4.6　可视化实验
---------

为了更加直观地观察改进算法在检测效果上的提升，使用 VisDrone2019 数据集设置两种可视化实验：1）不同场景下基准模型 YOLOv8n 与改进算法检测结果对比实验，结果如图 7 所示；2）使用梯度加权类激活映射［[32](#Ref_32)］（Grad-CAM）进行热力图分析，实验结果如图 8 所示。Grad-CAM 可以帮助理解模型在进行检测任务时所关注的区域，清晰展示模型的检测能力，进行针对性改进。

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840415.jpeg)

# 图 7. YOLOv8n 与改进算法在不同场景的检测结果可视化对比。（a）停车场与道路场景；（b）广场场景

# Fig. 7. Visual comparison of detection results of YOLOv8n and improved algorithm in different scenarios. (a) Parking and road scene; (b) square scene

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_07.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

![](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270840416.jpeg)

# 图 8. YOLOv8n 与改进算法的 Grad-CAM 可视化对比。（a）停车场与道路场景；（b）广场场景

# Fig. 8. Visual comparison of Grad-CAM for YOLOv8n and improved algorithm. (a) Parking and road scene; (b) square scene

[下载图片](https://opticsjournal.net/richHtml/lop/2025/62/10/1037009/img_08.jpg "下载此图片") [查看所有图片](https://opticsjournal.net/Articles/OJ4d48972414a6f31f/FigureTable "查看本文全图片")

图 7（a）为停车场与道路场景下基准模型 YOLOv8n 与改进算法的检测效果可视图，其中绿色框表示正确检测目标的类别和位置，蓝色框表示正确检测目标位置但错误检测目标类别，红色框表示错误检测目标位置。通过对比图 7（a）场景下道路尽头处小尺寸目标车辆和停车场处中尺寸目标轿车与大尺寸目标卡车可以看出：基准模型 YOLOv8n 对 3 种不同尺寸目标均存在漏检、错检，其中小目标错检更为严重；改进算法成功识别全部中尺寸目标和大部分小目标。由此可见，改进算法针对目标尺寸差异较大和小目标检测存在一定的优势。

图 7（b）所示为广场场景下基准模型 YOLOv8n 与改进算法的检测效果。从图 7（b）可以看出，相较于基准模型 YOLOv8n，改进算法对于行人的检测准确率更高，能更好地降低背景环境噪声对检测的影响，提高密集目标的关注度，表明改进算法更利于应对复杂的高精度应用场景。

图 8 所示为基准模型 YOLOv8n 与改进算法的热力图对比。从图 8（a）停车场与道路场景可以看出，基准模型 YOLOv8n 对于车辆尾部的关注度更高，而改进算法更关注车身、车顶处的特征，这种转变有利于解决航拍视角下对于远距离车辆仅能拍摄到顶部信息和车辆停放时目标相互遮挡造成特征减少的问题。从图 8（b）的广场场景可以发现，基准模型 YOLOv8n 对于广场中心密集人群和远处行人的关注度较低，而改进算法成功识别大部分远处小目标行人和广场中心的密集行人，表明改进算法对于密集目标的检测优势。综合可视化结果可以看出，改进算法针对密集多尺度目标和小目标有效提高了特征融合能力，捕捉到更多的上下文信息，从而能够在预测中得出更为准确的结果。

5　结论
----

针对无人机遥感图像中目标尺度差异大和目标尺寸小导致特征提取不理想、特征信息利用不足，从而影响目标检测算法对小目标检测效果的问题，提出一种基于改进 YOLOv8n 的针对小目标检测的无人机目标检测算法，旨在加强特征融合能力，收集更多的上下文信息来提升模型的检测精度。首先，设计了一种多尺度特征融合层，实现不同尺寸特征图的有效融合，确保模型具有更强的特征融合能力；其次，在颈部网络中引入 TFE 和 SSFF 模块，充分利用多尺度信息来弥补采样过程中细节信息的丢失，有效提高了算法对小目标的检测效果；然后，在骨干网络中引入 ConvNeXt v2，以多维度捕获成像特征，提高复杂背景下网络的特征提取能力；最后，采用剪枝算法 LAMP，以小幅降低检测精度的代价换取参数量和 FLOPS 的降低，便于模型在无人机平台中的部署。实验结果表明，相较于基准模型 YOLOv8n，改进算法的 mAP50 提升了 3.8 百分点，参数量降低了 1.63×106，检测速度达到 62 frame/s。相较于 YOLOv7-tiny 模型，改进算法在降低 4.65×106 参数量和 4.1×109 FLOPS 的情况下，检测精度仍保持优势。

朱立志, 韦慧. 基于 YOLOv8n 的无人机小目标检测算法 [J]. 激光与光电子学进展, 2025, 62(10): 1037009. Lizhi Zhu, Hui Wei. Unmanned Aerial Vehicle Small Target Detection Algorithm Based on YOLOv8n[J]. Laser & Optoelectronics Progress, 2025, 62(10): 1037009.