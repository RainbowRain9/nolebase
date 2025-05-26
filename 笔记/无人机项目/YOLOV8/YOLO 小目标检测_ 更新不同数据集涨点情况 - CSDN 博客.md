> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/demm868/article/details/142800064?ops_request_misc=%257B%2522request%255Fid%2522%253A%25222a977ec65afdd46bcce61e8c7168c0cb%2522%252C%2522scm%2522%253A%252220140713.130102334..%2522%257D&request_id=2a977ec65afdd46bcce61e8c7168c0cb&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-1-142800064-null-null.142^v102^pc_search_result_base1&utm_term=yolo%E5%B0%8F%E7%9B%AE%E6%A0%87%E6%A3%80%E6%B5%8B&spm=1018.2226.3001.4187)

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/66736c352a1b2b41c5295ab112f589be_MD5.gif]]

向 AI 转型的程序员都关注公众号 机器学习 [AI 算法](https://so.csdn.net/so/search?q=AI%E7%AE%97%E6%B3%95&spm=1001.2101.3001.7020)工程

通过本文的阅读，后续你可以结合自己的小目标检测数据集，在网络不同位置（Backbone、head、detect、loss 等）进行魔改，实现小目标涨点和创新！！！

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/601e6f42b7a08d0f1bc0299f67df3ce9_MD5.png]]

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/47f325fa3727e3290223c8579d02151f_MD5.png]]

### 1. 小目标检测介绍

### 1.1 小目标定义

1）以物体检测领域的通用数据集 COCO 物体定义为例，小目标是指小于 32×32 个像素点（中物体是指 32*32-96*96，大物体是指大于 96*96）；  
2）在实际应用场景中，通常更倾向于使用相对于原图的比例来定义：物体标注框的长宽乘积，除以整个图像的长宽乘积，再开根号，如果结果小于 3%，就称之为小目标；

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/89239cd4ffb130c62c0b50d0d058ded7_MD5.jpg]]

### 1.2 难点

1）包含小目标的样本数量较少，这样潜在的让目标检测模型更关注中大目标的检测；

2）由小目标覆盖的区域更小，这样小目标的位置会缺少多样性。我们推测这使得小目标检测的在验证时的通用性变得很难；

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/bac793bdd4ddba01640c673836e4bdff_MD5.jpg]]

3）anchor 难匹配问题。这主要针对 anchor-based 方法，由于小目标的 gt box 和 anchor 都很小，anchor 和 gt box 稍微产生偏移，IoU 就变得很低，导致很容易被网络判断为 negative sample；

4）它们不仅仅是小，而且是难，存在不同程度的遮挡、模糊、不完整现象；

等等难点

### 2. 本专栏小目标数据集

数据集下载地址：GitHub - YimianDai/sirst: A dataset constructed for single-frame infrared small target detection

Single-frame InfraRed Small Target

数据集大小：427 张，进行 3 倍数据增强得到 1708 张，最终训练集验证集测试集随机分配为 8：1：1

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/2f577803331e6ffb1a6f4b1b2992bae5_MD5.jpg]]

### 3. 小目标专栏难点优化方向

### 3.1 合理的数据增强

*   将小目标在同一张图像中多拷贝几次；增加了匹配到小目标 GT 的 anchor 的数量；如涂鸦式增强  
    

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/a1b67be125f1aede203c86759411e1b7_MD5.jpg]]

### 3.2 网络多尺度

通过 _P_2 层特征引出了新的检测头._P_2 层检测头分辨率为 160×160 像素, 相当于在主干网络中只进行了 2 次下采样操作, 含有目标更为丰富的底层特征信息. 颈部网络中自上而下和自下而上得到的两个 _P_2 层特征与主干网络中的同尺度特征通过 concat 形式进行特征融合, 输出的特征为 3 个输入特征的融合结果, 这样使得 _P_2 层检测头应对微小目标时, 能够快速有效的检测.

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/28f543555141f7fd4428664d4359aaf1_MD5.png]]

#### 3.2.1 多头检测器

亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.878

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_smallob</td><td height="24">207</td><td height="24">2921172</td><td height="24">12.2</td><td height="24">6137</td><td height="24">0.878</td></tr></tbody></table>

#### 3.2.2 BiFPN 高效双向跨尺度连接和加权特征融合

BiFPN 的主要思想：高效双向跨尺度连接和加权特征融合

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/a78013b863e049fa13e6d11f8663070f_MD5.jpg]]

文中提出了 BiFPN 和联合缩放方法（Compound Scaling），BiFPN 考虑到不同特征融合对于输出特征的重要性；联合缩放方法（Compound Scaling） 综合考虑图像输入分辨率、网络宽度和深度这些因素，权衡了准确率和效率。如图所示为本文的整体结构图：

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/c19f46dc3d7533399f76936af83d50b3_MD5.jpg]]

BiFPN | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.766

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_BiFPN</td><td height="24">168</td><td height="24">3005849</td><td height="24">8.1</td><td height="24">6104</td><td height="24">0.766</td></tr></tbody></table>

#### 3.2.3 小目标到大目标一网打尽，轻骨干重 Neck 的轻量级目标检测器 GiraffeDet

本文是阿里巴巴在目标检测领域的工作 (已被 ICLR2022 接收)，提出了一种新颖的类“长颈鹿” 的 GiraffeDet 架构，它采用了轻骨干、重 Neck 的架构设计范式。所提 GiraffeDet 在 COCO 数据集上取得了比常规 CNN 骨干更优异的性能，取得了 54.1%mAP 指标，具有更优异的处理目标大尺度变化问题的能力。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/eb46a49feecacf7845dc7ca932a6c682_MD5.jpg]]

本文提出了 GiraffeDet 用于高效目标检测，giraffe 包含轻量 space-to-depth chain、Generalized-FPN 以及预测网络

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/76e78b85785e2debb00ae0f4b41b9d24_MD5.png]]

GFPN | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.766

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_GPFN</td><td height="24">216</td><td height="24">2986131</td><td height="24">8.1</td><td height="24">6079</td><td height="24">0.766</td></tr></tbody></table>

#### 3.2.4 多分支卷积模块 RFB

受启发于人类视觉的 Receptive Fields 结构，本文提出 RFB，将 RFs 的尺度、离心率纳入考虑范围，使用轻量级主干网也能提取到高判别性特征，使得检测器速度快、精度高；具体地，RFB 基于 RFs 的不同尺度，使用不同的卷积核，设计了多分支的 conv、pooling 操作（makes use of multi-branch pooling with varying kernels），并通过虫洞卷积（dilated conv）来控制感受野的离心率，最后一步 reshape 操作后，形成生成的特征

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/a126cc8c5b0885c7b96107efebd83233_MD5.jpg]]

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/4ceb99682e1a7a71302852b32c1f3497_MD5.jpg]]

map@0.5 从原始 0.755 提升至 0.762

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_BasicRFB</td><td height="24">303</td><td height="24">3440235</td><td height="24">8.9</td><td height="24">7040</td><td height="24">0.762</td></tr></tbody></table>

#### 3.2.5 GOLD-YOLO，遥遥领先

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/418e711c60218db74b616937567d41c6_MD5.jpg]]

1.pdf

传统 YOLO 的问题

在检测模型中，通常先经过 backbone 提取得到一系列不同层级的特征，FPN 利用了 backbone 的这一特点，构建了相应的融合结构：不层级的特征包含着不同大小物体的位置信息，虽然这些特征包含的信息不同，但这些特征在相互融合后能够互相弥补彼此缺失的信息，增强每一层级信息的丰富程度，提升网络性能。

原始的 FPN 结构由于其层层递进的信息融合模式，使得相邻层的信息能够充分融合，但也导致了跨层信息融合存在问题：当跨层的信息进行交互融合时，由于没有直连的交互通路，只能依靠中间层充当 “中介” 进行融合，导致了一定的信息损失。之前的许多工作中都关注到了这一问题，而解决方案通常是通过添加 shortcut 增加更多的路径，以增强信息流动。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/014ccceb30c41d2aca9fe8cdc675e17f_MD5.jpg]]

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/beb70eff653981c9bd017513572c066e_MD5.jpg]]

提出了一种全新的信息交互融合机制：信息聚集 - 分发机制 (Gather-and-Distribute Mechanism)。该机制通过在全局上融合不同层次的特征得到全局信息，并将全局信息注入到不同层级的特征中，实现了高效的信息交互和融合。在不显著增加延迟的情况下 GD 机制显著增强了 Neck 部分的信息融合能力，提高了模型对不同大小物体的检测能力。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/b159949cd670beff9daee404e1c541d7_MD5.jpg]]

在 Gold-YOLO 中，针对模型需要检测不同大小的物体的需要，并权衡精度和速度，我们构建了两个 GD 分支对信息进行融合：低层级信息聚集 - 分发分支 (Low-GD) 和高层级信息聚集 - 分发分支(High-GD)，分别基于卷积和 transformer 提取和融合特征信息。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/29e27520afc127d23bff7c9a17f53559_MD5.jpg]]

map@0.5 从原始 0.755 提升至 0.768

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/083ac8b9e1539e6fc3a90ab3a536ed77_MD5.jpg]]

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8-goldyolo</td><td height="24">359</td><td height="24">6015123</td><td height="24">11.9</td><td height="24">12123</td><td height="24">0.768</td></tr></tbody></table>

### 3.3 loss 优化

#### 3.3.1 Wasserstein Distance Loss

1）分析了 IoU 对微小物体位置偏差的敏感性，并提出 NWD 作为衡量两个边界框之间相似性的更好指标；

2）通过将 NWD 应用于基于锚的检测器中的标签分配、NMS 和损失函数来设计强大的微小物体检测器；

3）提出的 NWD 可以显着提高流行的基于锚的检测器的 TOD 性能，它在 AI-TOD 数据集上的 Faster R-CNN 上实现了从 11.1% 到 17.6% 的性能提升；  

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/82afa7c049d04eeef76bd15a64bde3c4_MD5.jpg]]

Wasserstein Distance Loss | 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.784

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">Wasserstein loss</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.784</td></tr></tbody></table>

### 3.4 注意力机制

#### 3.4.1SEAM 注意力机制

SEAM 注意力机制，提升遮挡小目标检测性能

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/5b526aa812287ae5bafe849e7b0f09a7_MD5.jpg]]

即不同小目标之间的遮挡，以及其他物体对小目标的遮挡。前者使得检测精度对 NMS 阈值非常敏感，从而导致漏检。作者使用排斥损失进行小目标检测，它惩罚预测框转移到其他真实目标，并要求每个预测框远离具有不同指定目标的其他预测框，以使检测结果对 NMS 不太敏感。后者导致特征消失导致定位不准确，设计了注意力模块 SEAM 来增强人脸特征的学习。

SEAM | 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.785

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_SEAM</td><td height="24">219</td><td height="24">3109331</td><td height="24">8.3</td><td height="24">6331</td><td height="24">0.785</td></tr></tbody></table>

#### 3.4.2 即插即用的多尺度融合模块 EVC

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/e4ee9f6092e166a613471d4a81740f13_MD5.jpg]]

如图 2 所示，CFP 主要由以下部分组成：输入图像、用于提取视觉特征金字塔的 CNN 主干、提出的显式视觉中心（EVC）、提出的全局集中规则（GCR）以及用于目标检测的去解耦 head 网络（由分类损失、回归损失和分割损失组成）。在图 2 中，EVC 和 GCR 在提取的特征金字塔上实现。

提出的 EVC 主要由两个并行连接的块组成，其中使用轻量级 MLP 来捕获顶级特征的全局长期依赖性（即全局信息）。

EVC| 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.779

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_EVC</td><td height="24">217</td><td height="24">7293523</td><td height="24">11.5</td><td height="24">14513</td><td height="24">0.779</td></tr></tbody></table>

#### 3.4.3 微小目标检测的上下文增强和特征细化网络 ContextAggregation

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/fc1ed0074f7898a9662afd9e9a5d2809_MD5.jpg]]

提供了一个统一视角表明：它们均是更广义方案下通过神经网络集成空间上下文信息的特例。我们提出了 CONTAINER(CONText AggregatIon NEtwoRK)，一种用于多头上下文集成（Context Aggregation）的广义构建模块 。

ContextAggregation | 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.759

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_ContextAggregation</td><td height="24">195</td><td height="24">3008092</td><td height="24">8.1</td><td height="24">6121</td><td height="24">0.759</td></tr></tbody></table>

#### 3.4.4 EMA 跨空间学习的高效多尺度注意力 | ICASSP2023

通过通道降维来建模跨通道关系可能会给提取深度视觉表示带来副作用。本文提出了一种新的高效的多尺度注意力 (EMA) 模块。以保留每个通道上的信息和降低计算开销为目标，将部分通道重塑为批量维度，并将通道维度分组为多个子特征，使空间语义特征在每个特征组中均匀分布。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/451b9dcf65eb4bd7f873c6ebc0edb5dd_MD5.jpg]]

EMA | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.766

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_EMA</td><td height="24">192</td><td height="24">3006739</td><td height="24">8.1</td><td height="24">6114</td><td height="24">0.766</td></tr></tbody></table>

#### 3.4.5 动态稀疏注意力 BiFormer | CVPR 2023

本文方法：本文提出一种动态稀疏注意力的双层路由方法。对于一个查询，首先在粗略的区域级别上过滤掉不相关的键值对，然后在剩余候选区域（即路由区域）的并集中应用细粒度的令牌对令牌关注力。所提出的双层路由注意力具有简单而有效的实现方式，利用稀疏性来节省计算和内存，只涉及 GPU 友好的密集矩阵乘法。在此基础上构建了一种新的通用 Vision Transformer，称为 BiFormer。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/0e7a3409dc42d78e08b0a64a59450cee_MD5.png]]

BiFormer | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.758

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_BiFormerBlock</td><td height="24">204</td><td height="24">3356179</td><td height="24">22.4</td><td height="24">6800</td><td height="24">0.758</td></tr></tbody></table>

Yolov8 小目标检测（12）：动态稀疏注意力 BiFormer | CVPR 2023_AI 小怪兽的博客 - CSDN 博客

#### 3.4.6 LSKblockAttention | ICCV 2023

提出的方法包括动态调整特征提取骨干的感受野，以便更有效地处理被检测物体的不同的广泛背景。这是通过一个空间选择机制来实现的，该机制对一连串的大 depth-wise 卷积核所处理的特征进行有效加权，然后在空间上将它们合并。这些核的权重是根据输入动态确定的，允许该模型自适应地使用不同的大核，并根据需要调整空间中每个目标的感受野。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/7c00ccec7bbaf23030963b49bb265959_MD5.jpg]]

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/a3cd9854baa40010a564cd90bec95eda_MD5.jpg]]

LSKblockAttention | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.775

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_LSKblockAttention</td><td height="24">201</td><td height="24">3343333</td><td height="24">8.7</td><td height="24">6784</td><td height="24">0.775</td></tr></tbody></table>

#### 3.4.7 TripletAttention 注意力

所提出的 Triplet Attention 如下图所示，Triplet Attention 由 3 个平行的 Branch 组成，其中两个负责捕获通道 C 和空间 H 或 W 之间的跨维交互。最后一个 Branch 类似于 CBAM，用于构建 Spatial Attention，最终 3 个 Branch 的输出使用平均求和。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/93ea65ae325d0b6ee3dcba2c66fdea95_MD5.jpg]]

TripletAttention | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.79

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_TripletAttention</td><td height="24">201</td><td height="24">3006443</td><td height="24">8.2</td><td height="24">6120</td><td height="24">0.79</td></tr></tbody></table>

#### 3.4.8 通道优先卷积注意力（CPCA）| 中科院 2023.6

通道先验卷积注意力（CPCA）的整体结构包括通道注意力和空间注意力的顺序放置。特征图的空间信息是由通道注意力通过平均池化和最大池化等操作来聚合的。随后，空间信息通过共享 MLP（多层感知器）进行处理并添加以生成通道注意力图。通道先验是通过输入特征和通道注意力图的元素相乘获得的。随后，通道先验被输入到深度卷积模块中以生成空间注意力图。卷积模块接收空间注意力图以进行通道混合。最终，通过通道混合结果与通道先验的逐元素相乘，获得细化的特征作为输出。通道混合过程有助于增强特征的表示

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/375c8f5f3d7298b07cc024de11025686_MD5.jpg]]

CPCA | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.815

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_ChannelAttention</td><td height="24">171</td><td height="24">3137427</td><td height="24">7.8</td><td height="24">6428</td><td height="24">0.815</td></tr></tbody></table>

#### 3.4.8 多尺度 MultiSEAM

解决多尺度问题的主要方法是构建金字塔来融合人脸的多尺度特征。例如，在 `YOLOv5` 中，`FPN` 融合了 `P3`、`P4` 和 `P5` 层的特征。但是对于小尺度的目标，经过多层卷积后信息很容易丢失，保留的像素信息很少，即使在较浅的`P3`层也是如此。因此，提高特征图的分辨率无疑有利于小目标的检测。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/4fb13c201a18eafd0fccb4fe16d1d864_MD5.jpg]]

MultiSEAM| 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.87

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_MultiSEAM</td><td height="24">325</td><td height="24">5742291</td><td height="24"><br></td><td height="24">11711</td><td height="24">0.87</td></tr></tbody></table>

Yolov8 小目标检测（20）：多尺度 MultiSEAM，提高特征图的分辨率增强小目标检测能力_AI 小怪兽的博客 - CSDN 博客

#### 3.4.9 轻量级注意力 MobileViTAttention | ECCV2022

MobileViT 主要是为了解决 ViT 网络的缺陷而设计提出的，将 CNN 的优点融入到 Transformer 的结构中以解决 Transformer 网络存在的训练困难、迁移困难、调整困难的缺点，加快网络的推理和收敛速度，使得网络更加稳定高效。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/d2e32be32e5a5e2a7b5fa50edff262fa_MD5.jpg]]

MobileViTAttention | 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.799

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_MobileViTAttention</td><td height="24">241</td><td height="24">3957659</td><td height="24">11.1</td><td height="24">7992</td><td height="24">0.799</td></tr></tbody></table>

#### 3.4.10 感受野注意力卷积运算

关于感受野空间特征，我们提出感受野注意（RFA）。这种方法不仅强调感受野滑块内不同特征的重要性，而且优先考虑感受野空间特征。通过这种方法，彻底解决了卷积核参数共享的问题。感受野空间特征是根据卷积核的大小动态生成的，因此，RFA 是卷积的固定组合，离不开卷积运算的帮助，同时依靠 RFA 来提高性能，所以我们 提出感受野注意卷积（RFAConv）。具有 3×3 尺寸卷积核的 RFAConv 的整体结构如图 2 所示。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/503431cce8a7eb8c363f3eb69ee6f6a3_MD5.jpg]]

RFAConv | 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.765

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8-RFA</td><td height="24">258</td><td height="24">3019439</td><td height="24">8.2</td><td height="24">6166</td><td height="24">0.765</td></tr></tbody></table>

3.4.11 移动端网络架构 RepViT | RepViTBlock | 清华 ICCV 2023

RepViT 通过逐层微观设计来调整轻量级 CNN，这包括选择合适的卷积核大小和优化挤压 - 激励（Squeeze-and-excitation，简称 SE）层的位置。这两种方法都能显著改善模型性能。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/ae2a63f4474dbcc55832d0f56c9f26b5_MD5.jpg]]

RepViTBlock| 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.791

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_RepViTBlock</td><td height="24">186</td><td height="24">3338387</td><td height="24">7.9</td><td height="24">6771</td><td height="24">0.791</td></tr></tbody></table>

#### 3.4.11 Dual-ViT：一种多尺度双视觉 Transformer

摘要：以前的工作已经提出了几种降低自注意力机制计算成本的策略。其中许多工作考虑将自注意力过程分解为区域和局部特征提取过程，每个过程产生的计算复杂度要小得多。然而，区域信息通常仅以由于下采样而丢失的不希望的信息为代价。在本文中，作者提出了一种旨在缓解成本问题的新型 Transformer 架构，称为双视觉 Transformer（Dual ViT）。新架构结合了一个关键的语义路径，可以更有效地将 token 向量压缩为全局语义，并降低复杂性。这种压缩的全局语义通过另一个构建的像素路径，作为学习内部像素级细节的有用先验信息。然后将语义路径和像素路径整合在一起，并进行联合训练，通过这两条路径并行传播增强的自注意力信息。因此，双 ViT 能够在不影响精度的情况下降低计算复杂度。实证证明，双 ViT 比 SOTA Transformer 架构提供了更高的精度，同时降低了训练复杂度。

如图 1（a）所示。Twins（上图（b））在 SRA 之前添加了额外的局部分组自注意力层，以通过区域内相互作用进一步增强表示。RegionViT（上图（c））通过区域和局部自注意力分解原始注意力。然而，由于上述方法严重依赖于特征映射到区域的下采样，在有效节省总计算成本的同时，观察到了明显的性能下降。

如上图（d）所示，双 ViT 由两个特殊路径组成，分别称为 “语义路径” 和“像素路径”。通过构造的 “像素路径” 进行局部像素级特征提取是强烈依赖于 “语义路径” 之外的压缩全局先验。由于梯度同时通过语义路径和像素路径，因此双 ViT 训练过程可以有效地补偿全局特征压缩的信息损失，同时减少局部特征提取的困难。前者和后者都可以并行显著降低计算成本，因为注意力大小较小，并且两条路径之间存在强制依赖关系。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/00733dd1b5416d8e107957d7540b9a70_MD5.jpg]]

在本文中，我们提出了一种新颖的 Transformer 架构，它优雅地利用全局语义进行自注意力学习，即双视觉 Transformer (Dual-ViT)。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/939075ed1f7f5834d93cab4fb9a8781b_MD5.jpg]]

map@0.5 从原始 0.755 提升至 0.768

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/d2bf4d3fadd05fe3901f35fec381135a_MD5.png]]

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_DualAttention</td><td height="24">186</td><td height="24">4604819</td><td height="24">8.3</td><td height="24">9236</td><td height="24">0.766</td></tr></tbody></table>

### 3.5 卷积变体

#### 3.5.1 SPD-Conv

SPD-Conv 由一个空间到深度 (SPD) 层和一个无卷积步长 (Conv) 层组成，可以应用于大多数 CNN 体系结构。我们从两个最具代表性的计算即使觉任务: 目标检测和图像分类来解释这个新设计。然后，我们将 SPD-Conv 应用于 YOLOv5 和 ResNet，创建了新的 CNN 架构，并通过经验证明，我们的方法明显优于最先进的深度学习模型，特别是在处理低分辨率图像和小物体等更困难的任务时。  

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/d638adb16c8eea04a0c4fdcce1664553_MD5.jpg]]

SPD-Conv | 亲测在红外弱小目标检测涨点明显，map@0.5 从 0.755 提升至 0.875

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_SPD</td><td height="24">174</td><td height="24">3598739</td><td height="24">49.2</td><td height="24">7394</td><td height="24">0.875</td></tr></tbody></table>

#### 3.5.2 DCNv3 可形变卷积 | CVPR2023

InternImage 通过重新设计算子和模型结构提升了卷积模型的可扩展性并且缓解了归纳偏置，包括（1）DCNv3 算子，基于 DCNv2 算子引入共享投射权重、多组机制和采样点调制。

（2）基础模块，融合先进模块作为模型构建的基本模块单元

（3）模块堆叠规则，扩展模型时规范化模型的宽度、深度、组数等超参数。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/82dbb55cf04a3a4523b2af94ed0d18f1_MD5.jpg]]

DCNv3 | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.765

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_DCNV3</td><td height="24">264</td><td height="24">2892317</td><td height="24">7.9</td><td height="24">5892</td><td height="24">0.765</td></tr></tbody></table>

#### 3.5.3 新的 Partial 卷积 (PConv) | CVPR2023 FasterNet

为了设计快速神经网络，许多工作都集中在减少浮点运算（FLOPs）的数量上。然而，作者观察到 FLOPs 的这种减少不一定会带来延迟的类似程度的减少。这主要源于每秒低浮点运算（FLOPS）效率低下。为了实现更快的网络，作者重新回顾了 FLOPs 的运算符，并证明了如此低的 FLOPS 主要是由于运算符的频繁内存访问，尤其是深度卷积。因此，本文提出了一种新的 partial convolution（PConv），通过同时减少冗余计算和内存访问可以更有效地提取空间特征。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/e297f2cb595b042acb70b7f5aa33c46d_MD5.jpg]]

PConv | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.758，同时参数量 param 及计算量 FLOPs 都有降低

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_C2f_Pconv</td><td height="24">177</td><td height="24">2716883</td><td height="24">7.6</td><td height="24">5537</td><td height="24">0.758</td></tr></tbody></table>

#### 3.5.4 ODConv | ICLR 2022

ODConv 通过并行策略引入一种多维注意力机制以对卷积核空间的四个维度学习更灵活的注意力。ODConv 可以描述成如下形式：

表示新引入的三个注意力，分别沿空域维度、输入通道维度以及输出通道维度。这四个注意力采用多头注意力模块 计算得到

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/a1ed0d1c4ca85a6492dc343e4aab4811_MD5.jpg]]

ODConv | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.76

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_ODConv</td><td height="24">179</td><td height="24">3012110</td><td height="24">7.9</td><td height="24">6121</td><td height="24">0.76</td></tr></tbody></table>

#### 3.5.5 动态蛇形卷积（Dynamic Snake Convolution） | ICCV2023

主要的挑战源于细长微弱的局部结构特征与复杂多变的全局形态特征。本文关注到管状结构细长连续的特点，并利用这一信息在神经网络以下三个阶段同时增强感知：特征提取、特征融合和损失约束。分别设计了动态蛇形卷积（Dynamic Snake Convolution），多视角特征融合策略与连续性拓扑约束损失。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/f1d7f4e9c307b59107804960ba613fa4_MD5.jpg]]

Dynamic Snake Convolution | 亲测在红外弱小目标检测涨点，map@0.5 从 0.755 提升至 0.77

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">kb</td><td height="24">mAP50</td></tr><tr><td height="24">yolov8</td><td height="24">168</td><td height="24">3005843</td><td height="24">8.1</td><td height="24">6103</td><td height="24">0.755</td></tr><tr><td height="24">yolov8_DySnakeConv</td><td height="24">229</td><td height="24">3356287</td><td height="24">8.5</td><td height="24">6822</td><td height="24">0.77</td></tr></tbody></table>

<table width="690"><tbody><tr><td height="24"><br></td><td height="24">layers</td><td height="24">parameters</td><td height="24">GFLOPs</td><td height="24">mAP50</td><td height="24">mAP50-95</td></tr><tr><td height="24">YOLOv8n</td><td height="24">168</td><td height="24">3006038</td><td height="24">8.1</td><td height="24">0.679</td><td height="24">0.322</td></tr><tr><td height="24">YOLOv8n_smallobject</td><td height="24">207</td><td height="24">2977720</td><td height="24">12.5</td><td height="24">0.702</td><td height="24">0.359</td></tr><tr><td height="24">Wasserstein loss</td><td height="24">168</td><td height="24">3006038</td><td height="24">8.1</td><td height="24">0.714</td><td height="24">0.342</td></tr><tr><td height="24">YOLOv8n_CSPStage</td><td height="24">232</td><td height="24">2982742</td><td height="24">8.1</td><td height="24">0.727</td><td height="24">0.339</td></tr><tr><td height="24">YOLOv8n_smallobject _CSPStage</td><td height="24">303</td><td height="24">2953528</td><td height="24">12.5</td><td height="24">0.734</td><td height="24">0.376</td></tr><tr><td height="24">YOLOv8n_smallobject _CSPStage+Wasserstein loss</td><td height="24">303</td><td height="24">2953528</td><td height="24">12.5</td><td height="24">0.814</td><td height="24">0.416</td></tr></tbody></table>

工业油污数据集介绍  
三星油污缺陷类别：头发丝和小黑点，["TFS","XZW"]

数据集大小：660 张，包括部分良品图像，提升背景检测能力。oad/m0_63774211/87741209

缺陷特点：小目标缺陷，检测难度大，如下图所示；

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/2fa65e2118b0e325bc848cf6d6e24eb1_MD5.jpg]]

#### 1.1 动态蛇形卷积（Dynamic Snake Convolution），实现暴力涨点 | ICCV2023

Dynamic Snake Convolution | 亲测在工业小目标缺陷涨点明显，原始 mAP@0.5 0.679 提升至 0.743

主要的挑战源于细长微弱的局部结构特征与复杂多变的全局形态特征。本文关注到管状结构细长连续的特点，并利用这一信息在神经网络以下三个阶段同时增强感知：特征提取、特征融合和损失约束。分别设计了动态蛇形卷积（Dynamic Snake Convolution），多视角特征融合策略与连续性拓扑约束损失。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/f1d7f4e9c307b59107804960ba613fa4_MD5.jpg]]

我们希望卷积核一方面能够自由地贴合结构学习特征，另一方面能够在约束条件下不偏离目标结构太远。在观察管状结构的细长连续的特征后，脑海里想到了一个动物——蛇。我们希望卷积核能够像蛇一样动态地扭动，来贴合目标的结构。

原始 mAP@0.5 0.679 提升至 0.743

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/42dc57e15bce82caf603087f24a4c162_MD5.jpg]]

基于 Yolov8 的工业小目标缺陷检测（2）：动态蛇形卷积（Dynamic Snake Convolution），实现暴力涨点 | ICCV2023_AI 小怪兽的博客 - CSDN 博客

#### 1.2 微小目标检测可能存在检测能力不佳的现象，添加一个微小物体的检测头

多头检测器 | 亲测在工业小目标缺陷涨点明显，原始 mAP@0.5 0.679 提升至 0.702

原始 mAP@0.5 0.679 提升至 0.702

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/7cc48b0f4256054fe4f3883b227022d1_MD5.jpg]]

#### 1.3 SPD-Conv，低分辨率图像和小物体涨点明显

SPD-Conv | 亲测在工业小目标缺陷涨点明显，原始 mAP@0.5 0.679 提升至 0.775

SPD- conv 由一个空间到深度 (SPD) 层和一个非跨步卷积层组成。SPD 组件推广了一种 (原始) 图像转换技术 [29] 来对 CNN 内部和整个 CNN 的特征映射进行下采样：

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/d638adb16c8eea04a0c4fdcce1664553_MD5.jpg]]

原始 mAP@0.5 0.679 提升至 0.775

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/d250f6499c534f870632c1b44220e32e_MD5.png]]

YOLOv8n_SPD summary (fused): 174 layers, 3598934 parameters, 0 gradients, 49.2 GFLOPs Class

#### 1.4 大缺陷小缺陷一网打尽的轻量级目标检测器 GiraffeDet

GiraffeDet | 亲测在工业小目标缺陷涨点明显，原始 mAP@0.5 0.679 提升至 0.727

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/eb46a49feecacf7845dc7ca932a6c682_MD5.jpg]]

本文提出了 GiraffeDet 用于高效目标检测，giraffe 包含轻量 space-to-depth chain、Generalized-FPN 以及预测网络

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/a285190d78ed308bf6a0216e1eb5c480_MD5.png]]

FPN 旨在对 CNN 骨干网络提取的不同分辨率的多尺度特征进行融合。上图给出了 FPN 的进化，从最初的 FPN 到 PANet 再到 BiFPN。我们注意到：这些 FPN 架构仅聚焦于特征融合，缺少了块内连接。因此，我们设计了一种新的路径融合 GFPN：包含跳层与跨尺度连接，见上图 d。

原始 mAP@0.5 0.679 提升至 0.734

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/6b43aac68cf6565bd4f3f19cc89fe635_MD5.jpg]]

#### 1.5 多检测头结合小缺陷到大缺陷一网打尽的轻量级目标检测器 GiraffeDet

多头检测器 + GiraffeDet | 亲测在工业小目标缺陷涨点明显，原始 mAP@0.5 0.679 提升至 0.734

原始 mAP@0.5 0.679 提升至 0.734

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/6b43aac68cf6565bd4f3f19cc89fe635_MD5.jpg]]

#### 1.6 Wasserstein Distance Loss，助力工业缺陷检测

Wasserstein Distance Loss | 亲测在工业小目标缺陷涨点明显，原始 mAP@0.5 0.679 提升至 0.727

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/82afa7c049d04eeef76bd15a64bde3c4_MD5.jpg]]

Wasserstein distance 的主要优点是：

1.  无论小目标之间有没有重叠都可以度量分布相似性;
    
2.  NWD 对不同尺度的目标不敏感，更适合测量小目标之间的相似性。
    

NWD 可应用于 One-Stage 和 Multi-Stage Anchor-Based 检测器。此外，NWD 不仅可以替代标签分配中的 IoU，还可以替代非最大抑制中的 IoU(NMS) 和回归损失函数。在一个新的 TOD 数据集 AI-TOD 上的大量实验表明，本文提出的 NWD 可以持续地提高所有检测器的检测性能。

原始 mAP@0.5 0.679 提升至 0.727

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/f5260ba725707a8cb64cc42f317fa779_MD5.jpg]]

#### 1.7 工业部署级解决方案：多头检测器 + 小缺陷到大缺陷一网打尽的 + Wasserstein Distance Loss

原始 mAP@0.5 0.679 提升至 0.814

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/fcde65ef6b761c2056f5215f91e0c970_MD5.jpg]]

### 番外篇：工业 端面小目标计数

端面小目标计数数据集介绍

工业端面小目标计数类别：一类，类别名 object

数据集大小：训练集 864 张，验证集 98 张

缺陷特点：小目标计数，检测难度大，如下图所示；

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/3a833a71601209408fd8f72ecd9fbccf_MD5.jpg]]

原始性能

预测结果：

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/80fbd1213c715785546f2eaeb25f1deb_MD5.jpg]]

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/da93db6e4d60a181575c8e3f18743a0e_MD5.jpg]]

#### 1.1 Gold-YOLO，遥遥领先，超越所有 YOLO | 华为诺亚 NeurIPS23

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/beb70eff653981c9bd017513572c066e_MD5.jpg]]

提出了一种全新的信息交互融合机制：信息聚集 - 分发机制 (Gather-and-Distribute Mechanism)。该机制通过在全局上融合不同层次的特征得到全局信息，并将全局信息注入到不同层级的特征中，实现了高效的信息交互和融合。在不显著增加延迟的情况下 GD 机制显著增强了 Neck 部分的信息融合能力，提高了模型对不同大小物体的检测能力。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/b159949cd670beff9daee404e1c541d7_MD5.jpg]]

在 Gold-YOLO 中，针对模型需要检测不同大小的物体的需要，并权衡精度和速度，我们构建了两个 GD 分支对信息进行融合：低层级信息聚集 - 分发分支 (Low-GD) 和高层级信息聚集 - 分发分支(High-GD)，分别基于卷积和 transformer 提取和融合特征信息。

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/29e27520afc127d23bff7c9a17f53559_MD5.jpg]]

原始 mAP@0.5 0.936 提升至 0.945

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/a2c4019575477f564eae1add33d2c1ff_MD5.jpg]]

#### 1.2 小目标计数解决方案: 多头检测器 + 小缺陷到大缺陷一网打尽的 GiraffeDet+Wasserstein Distance Loss

原始 mAP@0.5 0.936 提升至 0.955

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/fcc411a53d40ff2e2be429815bc43fce_MD5.jpg]]

**机器学习算法 AI 大数据技术**

 ****搜索公众号添加：** **datanlp****

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/235ae1ea0761abc69bb2264166936d72_MD5.jpg]]

**长按图片，识别二维码**

**阅读过本文的人还看了以下文章：**

**实时语义分割 ENet 算法，提取书本 / 票据边缘  
**

**整理开源的中文大语言模型，以规模较小、可私有化部署、训练成本较低的模型为主  
**

**《大语言模型》PDF 下载**

**动手学深度学习 -（李沐）PyTorch 版本  
**

YOLOv9 电动车头盔佩戴检测，详细讲解模型训练

**TensorFlow 2.0 深度学习案例实战**

**基于 40 万表格数据集 TableBank，用 MaskRCNN 做表格检测**

**《基于深度学习的自然语言处理》中 / 英 PDF**

**Deep Learning 中文版初版 - 周志华团队**

**【全套视频课】最全的目标检测算法系列讲解，通俗易懂！**

**《美团机器学习实践》_美团算法团队. pdf**

**《深度学习入门：基于 Python 的理论与实现》高清中文 PDF + 源码**

《深度学习：基于 Keras 的 Python 实践》PDF 和代码

特征提取与图像处理 (第二版).pdf

python 就业班学习视频，从入门到实战项目

2019 最新《PyTorch 自然语言处理》英、中文版 PDF + 源码

《21 个项目玩转深度学习：基于 TensorFlow 的实践详解》完整版 PDF + 附书代码

《深度学习之 pytorch》pdf + 附书源码

PyTorch 深度学习快速实战入门《pytorch-handbook》

【下载】豆瓣评分 8.1,《机器学习实战: 基于 Scikit-Learn 和 TensorFlow》

《Python 数据分析与挖掘实战》PDF + 完整源码

汽车行业完整知识图谱项目实战视频 (全 23 课)

李沐大神开源《动手学深度学习》，加州伯克利深度学习（2019 春）教材

笔记、代码清晰易懂！李航《统计学习方法》最新资源全套！

《神经网络与深度学习》最新 2018 版中英 PDF + 源码

将机器学习模型部署为 REST API

FashionAI 服装属性标签图像识别 Top1-5 方案分享

重要开源！CNN-RNN-CTC 实现手写汉字识别

yolo3 检测出图像中的不规则汉字

同样是机器学习算法工程师，你的面试为什么过不了？

前海征信大数据算法：风险概率预测

【Keras】完整实现‘交通标志’分类、‘票据’分类两个项目，让你掌握深度学习图像分类

VGG16 迁移学习，实现医学图像识别分类工程项目

特征工程 (一)

特征工程 (二) : 文本数据的展开、过滤和分块

特征工程 (三): 特征缩放, 从词袋到 TF-IDF

特征工程 (四): 类别特征

特征工程 (五): PCA 降维

特征工程 (六): 非线性特征提取和模型堆叠

特征工程 (七)：图像特征提取和深度学习

如何利用全新的决策树集成级联结构 gcForest 做特征工程并打分？

Machine Learning Yearning 中文翻译稿

蚂蚁金服 2018 秋招 - 算法工程师（共四面）通过

全球 AI 挑战 - 场景分类的比赛源码 (多模型融合)

斯坦福 CS230 官方指南：CNN、RNN 及使用技巧速查（打印收藏）

python+flask 搭建 CNN 在线识别手写中文网站

中科院 Kaggle 全球文本匹配竞赛华人第 1 名团队 - 深度学习与特征工程

**不断更新资源**

**深度学习、机器学习、数据分析、python**

 ****搜索公众号添加：** **datayx**** 

![[_resources/YOLO 小目标检测_ 更新不同数据集涨点情况 - CSDN 博客/186d607f2b361c308a710f1ad0d979d6_MD5.jpg]]