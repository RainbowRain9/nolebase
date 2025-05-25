---
created: 2025-05-21T14:56
updated: 2025-05-21T20:36
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 (https://blog.csdn.net/CV_20231007/article/details/134174448)

    🚀🚀🚀**本文改进：HIC-YOLOv8，1) 添加一个针对小物体的额外预测头，以提供更高分辨率的特征图 2）在 backbone 和 neck 之间采用 involution block 来增加特征图的通道信息；3）在主干网末端加入 CBAM 的注意力机制；**

🚀🚀🚀**HIC-YOLOv8  小目标检测 & 复杂场景首选，实现涨点，在交通摄像头下车辆检测项目中， mAP50 从原始的 0.745 提升至 0.775**

🚀🚀🚀**YOLOv8 改进专栏：**[http://t.csdnimg.cn/hGhVK](http://t.csdnimg.cn/hGhVK "http://t.csdnimg.cn/hGhVK")

学姐带你学习 YOLOv8，从入门到创新，轻轻松松搞定科研；

![](https://i-blog.csdnimg.cn/blog_migrate/1a1fef26de535350f57e802f01dda67c.png)

1. 交通摄像头车辆检测数据集介绍
-----------------

数据集来源：[极市开发者平台 - 计算机视觉算法开发落地平台 - 极市科技](https://www.cvmart.net/dataSets/detail/473 "极市开发者平台-计算机视觉算法开发落地平台-极市科技")

数据集类别 “car"，训练集验证集测试集分别 5248，582，291 张

**下图可以看出都是车辆数据集具有不同尺寸的目标物体，既有大目标又有小目标**

![](https://i-blog.csdnimg.cn/blog_migrate/1b0d57bc5c7579cfd45f8cb13553357f.png)

 ![](https://i-blog.csdnimg.cn/blog_migrate/81d25287e53e0c2262d5b3b64d4e0a8d.png)

# 1.1 小目标检测难点 

本文所指的小目标是指 COCO 中定义的像素面积小于 32*32 pixels 的物体。小目标检测的核心难点有三个：

*   由本身定义导致的 rgb 信息过少，因而包含的判别性特征特征过少。
*   数据集方面的不平衡。这主要针对 COCO 而言，COCO 中只有 51.82% 的图片包含小物体，存在严重的图像级不平衡。具体的统计结果见下图。

 2.HIC-YOLOv5 介绍
----------------

![](https://i-blog.csdnimg.cn/blog_migrate/0a6b35971de4418a7acc3800b4287e35.png)

摘要：小目标检测一直是目标检测领域的一个具有挑战性的问题。 已经有一些工作提出了对该任务的改进，例如添加几个注意力块或改变特征融合网络的整体结构。 然而，这些模型的计算成本很大，这使得部署实时目标检测系统不可行，同时还有改进的空间。 为此，提出了一种改进的 YOLOv5 模型：**HICYOLOv5** 来解决上述问题。 **首先，添加一个针对小物体的额外预测头，以提供更高分辨率的特征图，以实现更好的预测。 其次，在 backbone 和 neck 之间采用 involution block 来增加特征图的通道信息。 此外，在主干网末端应用了一种名为 CBAM 的注意力机制**，与之前的工作相比，不仅降低了计算成本，而且还强调了通道和空间域中的重要信息。 我们的结果表明，HIC-YOLOv5 在 VisDrone-2019-DET 数据集上将 mAP@[.5:.95] 提高了 6.42%，将 mAP@0.5 提高了 9.38%。 

![](https://i-blog.csdnimg.cn/blog_migrate/c9ac8f279f02e7353d8622407eabbe33.png)

# 2.1 Convolutional Block Attention Module(CBAM) 介绍

 ![](https://i-blog.csdnimg.cn/blog_migrate/80f67ba74690a64fd7a09a7f9baad963.png)​

 **论文地址：**************[https://arxiv.org/pdf/1807.06521.pdf](https://arxiv.org/pdf/1807.06521.pdf "https://arxiv.org/pdf/1807.06521.pdf")****************

 摘要：我们提出了卷积块注意力模块（CBAM），这是一种用于前馈卷积神经网络的简单而有效的注意力模块。 给定中间[特征图](https://so.csdn.net/so/search?q=%E7%89%B9%E5%BE%81%E5%9B%BE&spm=1001.2101.3001.7020)，我们的模块沿着两个独立的维度（通道和空间）顺序推断注意力图，然后将注意力图乘以输入特征图以进行自适应特征细化。 由于 CBAM 是一个轻量级通用模块，因此它可以无缝集成到任何 CNN 架构中，且开销可以忽略不计，并且可以与基础 CNN 一起进行端到端训练。 我们通过在 ImageNet-1K、MS COCO 检测和 VOC 2007 检测数据集上进行大量实验来验证我们的 CBAM。我们的实验显示各种模型在分类和检测性能方面的持续改进，证明了 CBAM 的广泛适用性。 代码和模型将公开。

 ![](https://i-blog.csdnimg.cn/blog_migrate/72294e4062f08c34813cfc0c195c829c.png)

上图可以看到，CBAM 包含 CAM（Channel Attention Module）和 SAM（Spartial Attention Module）两个子模块，分别进行通道和空间上的 Attention。这样不只能够节约参数和计算力，并且保证了其能够做为即插即用的模块集成到现有的网络架构中去。

![](https://i-blog.csdnimg.cn/blog_migrate/3832d6f085e921153b90d62df5a475ea.png)

# 2.2 Involution 原理介绍

![](https://i-blog.csdnimg.cn/blog_migrate/117f115a5994479ea1b767024a242231.png)

论文链接：https://arxiv.org/abs/2103.06255

作者认为卷积操作的两个特征虽然也有一定的优势，但同样也有缺点。所以提出了 Involution，Involution 所拥有的特征正好和卷积相对称，即 **spatial-specific and channel-agnostic**

那就是**通道无关和特定于空间**。和卷积一样，内卷也有内卷核（involution kernels）。内卷核在空间范围上是不同的，但在通道之间共享。看到这里就有一定的画面感了。

内卷的优点：

1. 可以在更大的空间范围中总结上下文信息，从而克服 long-range interaction（本来的卷积操作只能在特定的小空间如 3x3 中集合空间信息）

2. 内卷可以将权重自适应地分配到不同的位置，从而对空间域中信息量最大的视觉元素进行优先级排序。（本来的卷积在空间的每一个地方都是用到同一个卷积核，用的同一套权重）

![](https://i-blog.csdnimg.cn/blog_migrate/2f8490e653a8390f2a26e7517263d17f.png)

重新考虑了视觉任务标准卷积的固有原理，特别是与空间无关和特定于通道的方法。取而代之的是，我们通过反转前述的卷积设计原理（称为卷积）提出了一种用于深度神经网络的新颖 atomic 操作。![](https://i-blog.csdnimg.cn/blog_migrate/039e6dc7e6b39f28d758310326891d6a.png)

# 2.3 多头检测器

在进行[目标检测](https://so.csdn.net/so/search?q=%E7%9B%AE%E6%A0%87%E6%A3%80%E6%B5%8B&spm=1001.2101.3001.7020 "目标检测")时，小目标会出现漏检或检测效果不佳等问题。YOLOv8 有 3 个检测头，能够多尺度对目标进行检测，但对微小目标检测可能存在检测能力不佳的现象，因此添加一个微小物体的检测头，能够大量涨点，map 提升明显；

源码：[YOLOv8 改进：复现 HIC-YOLOv5，助力小目标检测 - CSDN 博客](https://blog.csdn.net/CV_20231007/article/details/134124974 "YOLOv8改进：复现HIC-YOLOv5，助力小目标检测-CSDN博客")

3. 训练可视化分析
----------

 **mAP50 从原始的 0.745 提升至 0.802**

```
YOLOv8_HIC-YOLOv8 summary (fused): 221 layers, 3004550 parameters, 0 gradients, 12.2 GFLOPs
                 Class     Images  Instances      Box(P          R      mAP50  mAP50-95): 100%|██████████| 19/19 [00:12<00:00,  1.49it/s]
                   all        582       6970      0.816      0.711      0.775      0.407
```

训练结果如下：

PR_curve.png

PR 曲线中的 **P 代表的是 precision（精准率）**，**R 代表的是 recall（召回率）**，其代表的是精准率与召回率的关系。

![](https://i-blog.csdnimg.cn/blog_migrate/1de9c65bfdc12a1945d51bf1f4524f54.png)