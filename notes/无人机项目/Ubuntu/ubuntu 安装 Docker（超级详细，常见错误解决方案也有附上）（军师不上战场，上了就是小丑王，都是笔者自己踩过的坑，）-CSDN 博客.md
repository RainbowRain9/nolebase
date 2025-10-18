---
created: 2025-05-24T21:06
updated: 2025-05-24T22:16
---
> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/Apricity_L/article/details/137064982)

1. 进入管理员模式
----------

```
sudo su

```

2. 输入密码
-------

3. 卸载原有可能存在的 Docker 软件
----------------------

```
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done

```

 ![823f74fed5347e586a78c0f4df88ff2c_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807999.png)

4. 更新软件源
--------

```
sudo apt-get update
sudo apt-get upgrade
```

如果显示下面信息，不必理会，只是一个警告，在 Ubuntu22 + 版本都会有这个警告，可以忽略，不用理会，如果你不想看的话可以输入下面这个代码，让警告不显示：

```
sudo cp /etc/apt/trusted.gpg /etc/apt/trusted.gpg.d

```

![7531a78a7df7d5b29de24607551b4f12_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807000.png)

如果出现下面信息或后面出现类似信息，请自行搜索一下解决方案，一般是源有问题，换个时间有时候又可以了，就比较玄幻，笔者也没搞清楚原因

![46be2af0f4b379b0412242ee4f35b1be_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807001.png)

5. 安装 docker 依赖
---------------

```
apt-get install ca-certificates curl gnupg lsb-release

```

![2d4cf1e792044d29f2e6a3e33e037140_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807002.png)

6. 添加 docker 秘钥
---------------

```
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -

```

看到 ok 就添加成功了，过时警告同上 

![cde870e6989fc90cdb78dc2bb89d70e3_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807003.png)

7. 添加 Docker 软件源
----------------

```
sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"

```

 这些必须全部命中![4ef4a545e3cbdd1e97da8c59513b3d6a_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807004.png)

 可能会显示下面这条信息，同上不理会

![bb2fe7a7f8076c598a7d570ef3608003_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807005.png)

8. 安装 Docker
------------

```
apt-get install docker-ce docker-ce-cli containerd.io

```

![abf0c6a0ff79bde2a72ec2f5b6050559_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807006.png)

 7. 查看是否安装成功

```
docker --version

```

 能显示版本信息说明，软件是安装成功的

 ![98debbe12adf0c29c1e751254dc211a0_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807007.png)

9. 配置用户组，这样就可以不用每次使用 docker 都要 sudo 了
-------------------------------------

```
sudo usermod -aG docker $USER

```

 ![5c42584e7f619ce8de7c8acf3a1fa944_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807008.png)

10. 重启计算机
---------

11. [启动 Docker](https://so.csdn.net/so/search?q=%E5%90%AF%E5%8A%A8Docker&spm=1001.2101.3001.7020)
-------------------------------------------------------------------------------------------------

```
systemctl start docker

```

11.1. 启动成功不显示任何信息

11.2 出现下面的情况就是启动失败

![d7cae38da1c88e26098f5de46a372298_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807009.png)

11.2.1 查看错误信息：

```
systemctl status docker

```

![6b279f231e0884a4973d9f6135710224_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807010.png)

11.2.2 如果是这个错误，按如下步骤操作

用[管理员权限](https://so.csdn.net/so/search?q=%E7%AE%A1%E7%90%86%E5%91%98%E6%9D%83%E9%99%90&spm=1001.2101.3001.7020)启动 vim，修改 daemon.json 文件

```
sudo vim /etc/docker/daemon.json 

```

 显示这个界面输入 E

![1c11b4cb7aff76938216d2f20647d98c_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807011.png)

 输入 e 后会跳转到这个界面，里面的内容不一定这样，如果没用的就直接删掉，有用的就留着。按 delete 键可以删除，然后把这个代码粘贴进去

![9b97a3374817d9d39ebc293e5562a350_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807012.png) 将代码粘贴进去同上图

```
{
    "registry-mirrors": ["https://registry.docker-cn.com"]
}
 
```

然后按 esc 键，直接敲  **:wq!**  左下角会显示，没有空格，不能粘贴，要直接敲

![37ddea505bedb986027be4f2fcf290f4_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807013.png)

12. 安装工具
--------

```
apt-get -y install apt-transport-https ca-certificates curl software-properties-common

```

13. 重启 Docker
-------------

```
service docker restart

```

14. 显示一下镜像列表
------------

```
docker images

```

 14.1 如果出现下面的情况，就是启动成功的（不一定有方框外的文件）

![74f9aa822b2b6520533be68a2010081f_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807014.png)

14.2 如果出现下面这种情况，就是启动失败，需要启动 docker

```
service start docker

```

![63377ae1f0d6b0a999e0ecb3ba397b9b_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807015.png)

15. 用 Docker 运行一下 helloWord，显示下面消息就安装成功了
----------------------------------------

```
sudo docker run hello-world

```

![e9391a3cab0d59e6cd372ee89bb77cad_MD5](https://raw.githubusercontent.com/RainbowRain9/PicGo/master/202505270807016.png)