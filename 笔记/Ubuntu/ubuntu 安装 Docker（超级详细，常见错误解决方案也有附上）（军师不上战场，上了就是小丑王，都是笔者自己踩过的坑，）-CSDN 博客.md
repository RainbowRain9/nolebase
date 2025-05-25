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

 ![](https://i-blog.csdnimg.cn/blog_migrate/05c7acb3a0a8c1ef8c86d552a2ac50f8.png)

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

![](https://i-blog.csdnimg.cn/blog_migrate/a1ef9c6b2a24c868ffec144df4ca7054.png)

如果出现下面信息或后面出现类似信息，请自行搜索一下解决方案，一般是源有问题，换个时间有时候又可以了，就比较玄幻，笔者也没搞清楚原因

![](https://i-blog.csdnimg.cn/blog_migrate/ceea2b29e25596339071e427026fab14.png)

5. 安装 docker 依赖
---------------

```
apt-get install ca-certificates curl gnupg lsb-release

```

![](https://i-blog.csdnimg.cn/blog_migrate/0c53b0d7153b8c6b5bff31277e958bc5.png)

6. 添加 docker 秘钥
---------------

```
curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add -

```

看到 ok 就添加成功了，过时警告同上 

![](https://i-blog.csdnimg.cn/blog_migrate/466c9acfaf5888c70ef0df877ccb92ed.png)

7. 添加 Docker 软件源
----------------

```
sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable"

```

 这些必须全部命中![](https://i-blog.csdnimg.cn/blog_migrate/8812335fc9bfc795dec66a2eb7d77652.png)

 可能会显示下面这条信息，同上不理会

![](https://i-blog.csdnimg.cn/blog_migrate/ce8e87a2e40d84c936462384bd0b408f.png)

8. 安装 Docker
------------

```
apt-get install docker-ce docker-ce-cli containerd.io

```

![](https://i-blog.csdnimg.cn/blog_migrate/bb9bf699dae3dfc0d4853ad987f8389e.png)

 7. 查看是否安装成功

```
docker --version

```

 能显示版本信息说明，软件是安装成功的

 ![](https://i-blog.csdnimg.cn/blog_migrate/99a4eaa057997e45b49c0c33a361ce95.png)

9. 配置用户组，这样就可以不用每次使用 docker 都要 sudo 了
-------------------------------------

```
sudo usermod -aG docker $USER

```

 ![](https://i-blog.csdnimg.cn/blog_migrate/70d6133c830305e62116274ad82eda25.png)

10. 重启计算机
---------

11. [启动 Docker](https://so.csdn.net/so/search?q=%E5%90%AF%E5%8A%A8Docker&spm=1001.2101.3001.7020)
-------------------------------------------------------------------------------------------------

```
systemctl start docker

```

11.1. 启动成功不显示任何信息

11.2 出现下面的情况就是启动失败

![](https://i-blog.csdnimg.cn/blog_migrate/a17415fa5653baaa737bce5daf687f24.png)

11.2.1 查看错误信息：

```
systemctl status docker

```

![](https://i-blog.csdnimg.cn/blog_migrate/1942bcf39f388666fee9b83e98c542a5.png)

11.2.2 如果是这个错误，按如下步骤操作

用[管理员权限](https://so.csdn.net/so/search?q=%E7%AE%A1%E7%90%86%E5%91%98%E6%9D%83%E9%99%90&spm=1001.2101.3001.7020)启动 vim，修改 daemon.json 文件

```
sudo vim /etc/docker/daemon.json 

```

 显示这个界面输入 E

![](https://i-blog.csdnimg.cn/blog_migrate/ad63a0857db2c35ca248a142d6f6ee6a.png)

 输入 e 后会跳转到这个界面，里面的内容不一定这样，如果没用的就直接删掉，有用的就留着。按 delete 键可以删除，然后把这个代码粘贴进去

![](https://i-blog.csdnimg.cn/blog_migrate/de42349155c090de4ee5f22b1f7c2ff7.png) 将代码粘贴进去同上图

```
{
    "registry-mirrors": ["https://registry.docker-cn.com"]
}
 
```

然后按 esc 键，直接敲  **:wq!**  左下角会显示，没有空格，不能粘贴，要直接敲

![](https://i-blog.csdnimg.cn/blog_migrate/74a1380b9accf46244ce435500d5b99b.png)

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

![](https://i-blog.csdnimg.cn/blog_migrate/0e7bdb3fd4b72a76cc04e014fd4e8019.png)

14.2 如果出现下面这种情况，就是启动失败，需要启动 docker

```
service start docker

```

![](https://i-blog.csdnimg.cn/blog_migrate/94ac502b500f74c8093b4f17f54362d9.png)

15. 用 Docker 运行一下 helloWord，显示下面消息就安装成功了
----------------------------------------

```
sudo docker run hello-world

```

![](https://i-blog.csdnimg.cn/blog_migrate/119822e7713c0d6f104f950907bc542b.png)