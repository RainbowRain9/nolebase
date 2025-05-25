> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_55944949/article/details/136048349)

#### 目录

*   [一. 设置遥控器](#__24)
*   [二. 仿真代码](#__37)
*   [三. 编译运行](#__165)
*   [参考](#_198)

**前言：** 本次教程是官方提供的 [MAVROS](https://so.csdn.net/so/search?q=MAVROS&spm=1001.2101.3001.7020) _Offboard_ (板外) 控制示例，但加上了**外部遥控器 (RC) 控制**（如果想要在真机上实现，还要[修改代码](https://so.csdn.net/so/search?q=%E4%BF%AE%E6%94%B9%E4%BB%A3%E7%A0%81&spm=1001.2101.3001.7020)）

**注：搭建仿真环境可以看下面教程** 👇

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (1) —— 概念介绍及环境建议](https://blog.csdn.net/weixin_55944949/article/details/130848009?spm=1001.2014.3001.5502)

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (2) —— MAVROS 安装](https://blog.csdn.net/weixin_55944949/article/details/130877689?spm=1001.2014.3001.5502)

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (3) —— ubuntu 安装 QGC 地面站](https://blog.csdn.net/weixin_55944949/article/details/130895363?spm=1001.2014.3001.5502)

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (4) —— 仿真环境搭建](https://blog.csdn.net/weixin_55944949/article/details/130895608?spm=1001.2014.3001.5501)

[ubuntu 安装 ROS melodic(最新、超详细图文教程)](https://blog.csdn.net/weixin_55944949/article/details/130468032?spm=1001.2014.3001.5502)

**前期回顾**：

[带你玩转 PX4 无人机仿真 (1) —— 运行官方案例（C++）](https://blog.csdn.net/weixin_55944949/article/details/132570487?spm=1001.2014.3001.5501)

[带你玩转 PX4 无人机仿真 (2) —— 定点飞行](https://blog.csdn.net/weixin_55944949/article/details/135326886?spm=1001.2014.3001.5501)

一. 设置[遥控器](https://so.csdn.net/so/search?q=%E9%81%A5%E6%8E%A7%E5%99%A8&spm=1001.2101.3001.7020)
-----------------------------------------------------------------------------------------------

![](https://i-blog.csdnimg.cn/blog_migrate/3192efc610d136f371af9f60af76168c.png#pic_center)  
**(富斯 i6s 航模遥控器)**

仿真电脑和遥控器通过 Micro USB 数据线 (也就是老版安卓手机的充电线) 连接  
![](https://i-blog.csdnimg.cn/blog_migrate/3ed3d5f4a739df9f8daa41d8ef6f9916.png#pic_center)  
**（仿真电脑与遥控器连接图）**

当在仿真时，打开 QGC，在设置中可以看到多了一个 **游戏手柄** 的界面，如下图所示  
![](https://i-blog.csdnimg.cn/blog_migrate/2e0d8a71f041d5d2edc60f25a1cd5fcd.png#pic_center)  
点击按钮分配并拨动遥控器上的拨杆，就可以看到所对应的通道，然后为拨杆配置功能。(我的配置如下，仅供参考)  
![](https://i-blog.csdnimg.cn/blog_migrate/632d24fe4a5ca954c41b91fbaa163968.png#pic_center)

二. 仿真代码
-------

我们继续使用 `带你玩转PX4无人机仿真(1)` 中的功能包，在 off_node 功能包下的 src 目录下新建一个 **offb_node_rc.cpp** 文件

```
cd ~/catkin_ws/src/off_node/src/
touch offb_node_rc.cpp   // 创建文件
gedit offb_node_rc.cpp   // 打开文件

```

打开文件，将代码粘贴上去

```
#include <ros/ros.h>
#include <geometry_msgs/PoseStamped.h>
#include <mavros_msgs/CommandBool.h>
#include <mavros_msgs/SetMode.h>
#include <mavros_msgs/State.h>
#define GREEN "\033[0;1;32m"

using namespace std;

mavros_msgs::State current_state;
void state_cb(const mavros_msgs::State::ConstPtr& msg){
    current_state = *msg;
    ROS_INFO("current mode: %s",current_state.mode.c_str());
    ROS_INFO("system_status: %d",current_state.system_status);
}

geometry_msgs::PoseStamped aim_pos;
geometry_msgs::PoseStamped curr_pos;
void arrive_pos(const geometry_msgs::PoseStamped::ConstPtr& msg){
    curr_pos = *msg;
    cout <<GREEN <<"distance: "<<fabs((*msg).pose.position.z - aim_pos.pose.position.z) <<endl;  // 打印与目标点的差距
}

int main(int argc, char **argv)
{
    ros::init(argc, argv, "off_node");
    ros::NodeHandle nh;

    ros::Subscriber state_sub = nh.subscribe<mavros_msgs::State>
            ("mavros/state", 10, state_cb);
    ros::Publisher local_pos_pub = nh.advertise<geometry_msgs::PoseStamped>
            ("mavros/setpoint_position/local", 10);
    ros::ServiceClient arming_client = nh.serviceClient<mavros_msgs::CommandBool>
            ("mavros/cmd/arming");
    ros::ServiceClient set_mode_client = nh.serviceClient<mavros_msgs::SetMode>
            ("mavros/set_mode");

    ros::Subscriber local_pos_sub = nh.subscribe<geometry_msgs::PoseStamped>
            ("mavros/local_position/pose",10,arrive_pos);

    //the setpoint publishing rate MUST be faster than 2Hz
    ros::Rate rate(10.0);  // 10Hz 100ms

    // wait for FCU connection
    while(ros::ok() && !current_state.connected){
        ros::spinOnce();
        rate.sleep();
    }

    ROS_INFO("vehicle connected!");

    //geometry_msgs::PoseStamped pose;
    aim_pos.pose.position.x = 0;
    aim_pos.pose.position.y = 0;
    aim_pos.pose.position.z = 2;

    //send a few setpoints before starting
    for(int i = 100; ros::ok() && i > 0; --i){
        local_pos_pub.publish(aim_pos);
        ros::spinOnce();
        rate.sleep();
    }

    mavros_msgs::CommandBool arm_cmd;
    arm_cmd.request.value = true;

    ros::Time last_request = ros::Time::now();

    int count = 0;  // 计时

    while(ros::ok()){
        if( current_state.mode == "OFFBOARD"){
            if( !current_state.armed){
                if( arming_client.call(arm_cmd) &&arm_cmd.response.success){
                    ROS_INFO("Vehicle armed");
                }
            }
        }
        if(current_state.mode == "OFFBOARD" && fabs(curr_pos.pose.position.z - aim_pos.pose.position.z) <= 0.3){
            count++;
            cout <<GREEN << "count: "<< count<< endl;
            if(count > 150) // 15s
            {
                mavros_msgs::SetMode land_set_mode;
                land_set_mode.request.custom_mode = "AUTO.LAND";  // 发送降落命令
                if(set_mode_client.call(land_set_mode) && land_set_mode.response.mode_sent){
                    ROS_INFO("land enabled");
                }
                //任务结束,关闭该节点
                ros::shutdown();
            }  
        }
        if(current_state.mode != "OFFBOARD"){
            ROS_INFO("switch to Offboard");
        }

        local_pos_pub.publish(aim_pos);

        ros::spinOnce();
        rate.sleep();
    }

    return 0;
}

```

将下面内容添加到 off_node 功能包下的 CMakeLists.txt 文件里

```
add_executable(offb_node src/offb_node_rc.cpp)
target_link_libraries(offb_node_rc ${catkin_LIBRARIES})

```

三. 编译运行
-------

运行下面命令，编译代码

```
cd ~/catkin_ws
catkin_make # 使用catkin build话，则为 catkin build

```

创建一个启动脚本 **offb_rc.sh**

```
#!/bin/bash
source ~/.bashrc
gnome-terminal --window -e 'bash -c "roscore; exec bash"' \
--tab -e 'bash -c "sleep 5; roslaunch px4 mavros_posix_sitl.launch; exec bash"' \
--tab -e 'bash -c "sleep 10; rosrun off_node offb_node_rc; exec bash"' \

```

运行

```
chmod +x offb_rc.sh   
./offb_rc.sh

```

运行效果如下：👇

PX4 无人机仿真——官方案例 (RC 版)

参考
--

[MAVROS Offboard 控制示例 (C++) | PX4 自动驾驶用户指南](https://docs.px4.io/main/zh/ros/mavros_offboard_cpp.html)

[Prometheus 仿真入门 — 仿真中的遥控器使用说明](https://wiki.amovlab.com/public/prometheus-wiki/Prometheus%E4%BB%BF%E7%9C%9F%E5%85%A5%E9%97%A8/%E4%BB%BF%E7%9C%9F%E4%B8%AD%E7%9A%84%E9%81%A5%E6%8E%A7%E5%99%A8%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E.html)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！