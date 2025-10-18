> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_55944949/article/details/135326886)

#### 目录

*   [一. 仿真代码](#__22)
*   [二. 编译运行](#__199)
*   [参考](#_231)

**前言：** 本教程是在仿真中实现[无人机](https://so.csdn.net/so/search?q=%E6%97%A0%E4%BA%BA%E6%9C%BA&spm=1001.2101.3001.7020)定点飞行（如果想要在真机上实现，还要修改代码）

**注：搭建仿真环境可以看下面教程** 👇

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (1) —— 概念介绍及环境建议](https://blog.csdn.net/weixin_55944949/article/details/130848009?spm=1001.2014.3001.5502)

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (2) —— MAVROS 安装](https://blog.csdn.net/weixin_55944949/article/details/130877689?spm=1001.2014.3001.5502)

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (3) —— ubuntu 安装 QGC 地面站](https://blog.csdn.net/weixin_55944949/article/details/130895363?spm=1001.2014.3001.5502)

[(最新)ubuntu 搭建 PX4 无人机仿真环境 (4) —— 仿真环境搭建](https://blog.csdn.net/weixin_55944949/article/details/130895608?spm=1001.2014.3001.5501)

[ubuntu 安装 ROS melodic(最新、超详细图文教程)](https://blog.csdn.net/weixin_55944949/article/details/130468032?spm=1001.2014.3001.5502)

**前期回顾：**

[带你玩转 PX4 无人机仿真 (1) —— 运行官方案例（C++）](https://blog.csdn.net/weixin_55944949/article/details/132570487?spm=1001.2014.3001.5501)

一. 仿真代码
-------

我们继续使用 `带你玩转PX4无人机仿真(1)` 中的功能包，在 off_node 功能包下的 src 目录下新建一个 **rect_no_rc.cpp** 文件

```
cd ~/catkin_ws/src/off_node/src/
touch rect_no_rc.cpp   // 创建文件
gedit rect_no_rc.cpp   // 打开文件

```

打开文件，将代码粘贴上去  
目标点：**(0,0,2)** **(5,0,2)** **(5,5,2)** **(0,5,2)**

```
/**
 * @file rect_no_rc.cpp
 * @brief Offboard control example node, written with MAVROS version 0.19.x, PX4 Pro Flight
 * Stack and tested in Gazebo Classic SITL
 */

#include <ros/ros.h>
#include <geometry_msgs/PoseStamped.h>
#include <mavros_msgs/CommandBool.h>
#include <mavros_msgs/SetMode.h>
#include <mavros_msgs/State.h>
#define GREEN "\033[0;1;32m"

using namespace std;

mavros_msgs::State current_state;      // 无人机当前状态
geometry_msgs::PoseStamped curr_pos;   // 无人机当前位置
geometry_msgs::PoseStamped aim_pos;    // 无人机目标位置

bool is_arrive(geometry_msgs::PoseStamped pos1, geometry_msgs::PoseStamped pos2);  // 判断是否到达目的地

void state_cb(const mavros_msgs::State::ConstPtr& msg){
    current_state = *msg;
    ROS_INFO("current mode: %s",current_state.mode.c_str());
    ROS_INFO("system_status: %d",current_state.system_status);
}

void arrive_pos(const geometry_msgs::PoseStamped::ConstPtr& msg){
    curr_pos = *msg;
    cout <<GREEN <<fabs((*msg).pose.position.z - aim_pos.pose.position.z) <<endl; 
}
int main(int argc, char **argv)
{
    ros::init(argc, argv, "rect_no_rc");
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
    ros::Rate rate(20.0); // 20Hz

    // wait for FCU connection
    while(ros::ok() && !current_state.connected){
        ros::spinOnce();
        rate.sleep();
    }

    //geometry_msgs::PoseStamped aim_pos;
    aim_pos.pose.position.x = 0;
    aim_pos.pose.position.y = 0;
    aim_pos.pose.position.z = 2;

    //send a few setpoints before starting
    for(int i = 100; ros::ok() && i > 0; --i){
        local_pos_pub.publish(aim_pos);
        ros::spinOnce();
        rate.sleep();
    }

    mavros_msgs::SetMode offb_set_mode;
    offb_set_mode.request.custom_mode = "OFFBOARD";

    mavros_msgs::CommandBool arm_cmd;
    arm_cmd.request.value = true;

    ros::Time last_request = ros::Time::now();

    int count = 0;   // 计时
	bool flag = false;  // 标志任务是否完成 

    while(ros::ok()){
		if( !flag ){
		    if( current_state.mode != "OFFBOARD" &&
		        (ros::Time::now() - last_request > ros::Duration(5.0))){
		        if( set_mode_client.call(offb_set_mode) &&
		            offb_set_mode.response.mode_sent){
		            ROS_INFO("Offboard enabled");
		        }  // 代码切换 Offboard 模式
		        last_request = ros::Time::now();
		    } else {
		        if( !current_state.armed &&
		            (ros::Time::now() - last_request > ros::Duration(5.0))){
		            if( arming_client.call(arm_cmd) &&
		                arm_cmd.response.success){
		                ROS_INFO("Vehicle armed");
		            } // 解锁
		            last_request = ros::Time::now();
		        }
		    }  // else
		} // flag
        if( is_arrive(curr_pos, aim_pos) ){
            count++;
            // 时间只是参考，运行后会有误差
            if(count == 300)  // 15s 
            {
                aim_pos.pose.position.x = 5;
            }
            if(count == 600)  // 30s
            {
                aim_pos.pose.position.y = 5;
            }
            if(count == 900)  // 45s
            {
                aim_pos.pose.position.x = 0;
            }
            if(count == 1200)  // 60s
            {
                aim_pos.pose.position.x = 0;
                aim_pos.pose.position.y = 0;
            }
            if(count >= 1500)  // 75s
            {
                mavros_msgs::SetMode land_set_mode;
                land_set_mode.request.custom_mode = "AUTO.LAND";  // 切换降落模式
                if(set_mode_client.call(land_set_mode) && land_set_mode.response.mode_sent){
                    flag = true;
                }
            }  
        }
		//任务结束,无人机降落完成并关闭该节点
        if ( flag && current_state.mode == "AUTO.LAND" && current_state.armed == false ) {
            ROS_INFO("Drone has landed");
            ros::shutdown();
        }

        local_pos_pub.publish(aim_pos); 

        ros::spinOnce();
        rate.sleep();
    }

    return 0;
}

bool is_arrive(geometry_msgs::PoseStamped pos1, geometry_msgs::PoseStamped pos2){
    if(fabs(pos1.pose.position.x - pos2.pose.position.x) <= 0.3 &&
        fabs(pos1.pose.position.y - pos2.pose.position.y) <= 0.3 && 
        fabs(pos1.pose.position.z - pos2.pose.position.z) <= 0.3){
            return true;
        }
    return false;
}

```

将下面内容添加到 off_node 功能包下的 CMakeLists.txt 文件里

```
add_executable(rect_no_rc src/rect_no_rc.cpp)
target_link_libraries(rect_no_rc ${catkin_LIBRARIES})

```

二. 编译运行
-------

运行下面命令，编译代码

```
cd ~/catkin_ws
catkin_make # 使用catkin build话，则为 catkin build

```

创建一个启动脚本 **rect.sh**

```
touch rect.sh

```

将下面代码复制上去

```
#!/bin/bash
source ~/.bashrc
gnome-terminal --window -e 'bash -c "roscore; exec bash"' \
--tab -e 'bash -c "sleep 5; roslaunch px4 mavros_posix_sitl.launch; exec bash"' \
--tab -e 'bash -c "sleep 10; rosrun off_node rect_no_rc; exec bash"' \

```

运行

```
chmod +x rect.sh
./rect.sh

```

运行效果如下：👇  

PX4 无人机仿真——定点飞行

参考
--

[MAVROS Offboard 控制示例 (C++) | PX4 自动驾驶用户指南](https://docs.px4.io/main/zh/ros/mavros_offboard_cpp.html)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！