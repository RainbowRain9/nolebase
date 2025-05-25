> 本文由 [简悦 SimpRead](http://ksria.com/simpread/) 转码， 原文地址 [blog.csdn.net](https://blog.csdn.net/weixin_55944949/article/details/132570487)

#### 目录

*   [一. 创建功能包](#__14)
*   [二. 编译运行](#__139)
*   [三. 修改官方代码](#__168)
*   [参考](#_298)

**前言：** 本次教程是官方提供的 [MAVROS](https://so.csdn.net/so/search?q=MAVROS&spm=1001.2101.3001.7020) _Offboard_ (板外) 控制示例，使用之前请搭建好 [PX4](https://so.csdn.net/so/search?q=PX4&spm=1001.2101.3001.7020) 仿真环境  
**注：搭建仿真环境可以看下面教程**👇

[ubuntu 搭建 PX4 无人机仿真环境 (1) —— 概念介绍](https://blog.csdn.net/weixin_55944949/article/details/130848009?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (2) —— MAVROS 安装](https://blog.csdn.net/weixin_55944949/article/details/130877689?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (3) —— ubuntu 安装 QGC 地面站](https://blog.csdn.net/weixin_55944949/article/details/130895363?spm=1001.2014.3001.5502)

[ubuntu 搭建 PX4 无人机仿真环境 (4) —— 仿真环境搭建](https://blog.csdn.net/weixin_55944949/article/details/130895608?spm=1001.2014.3001.5501)

[ubuntu 安装 ROS melodic(最新、超详细图文教程)](https://blog.csdn.net/weixin_55944949/article/details/130468032?spm=1001.2014.3001.5502)

一. 创建功能包
--------

没有创建工作空间，可以执行下列代码，如果创建了可以跳过（如果是跟着我之前的教程，那就不用执行这一步）

**注：** catkin_make 与 catkin build 是编译功能包的两种方式，catkin_make 用的多一点，有兴趣的话可以看看它们的区别 👉 [Migrating from catkin_make — catkin_tools](https://catkin-tools.readthedocs.io/en/latest/migration.html)

```
mkdir -p ~/catkin_ws/src
cd catkin_ws/src && catkin_init_workspace
# 使用catkin build话，则为cd catkin_ws && catkin init
cd .. && catkin_make# 使用catkin build话，则为 catkin build
# 再将 source ~/catkin_ws/devel/setup.bash 提案加到 .bashrc 文件中 

```

在工作空间下新建一个 off_node 功能包

```
cd ~/catkin_ws/src
catkin_create_pkg off_node roscpp std_msgs geometry_msgs mavros_msgs

```

创建好后目录大致是下图所示：  
![](https://i-blog.csdnimg.cn/blog_migrate/44f5bc11ef68b88193bfb5aabe7457fb.png#pic_center)

在 off_node 功能包下的 src 目录下新建一个 offb_node.cpp 文件，将下列官方提供的代码复制进去（代码详解可以看官方的代码解释 [MAVROS Offboard 控制示例 (C++) | PX4 自动驾驶用户指南](https://docs.px4.io/main/zh/ros/mavros_offboard_cpp.html) ）

```
/**
 * @file offb_node.cpp
 * @brief Offboard control example node, written with MAVROS version 0.19.x, PX4 Pro Flight
 * Stack and tested in Gazebo Classic SITL
 */

#include <ros/ros.h>
#include <geometry_msgs/PoseStamped.h>
#include <mavros_msgs/CommandBool.h>
#include <mavros_msgs/SetMode.h>
#include <mavros_msgs/State.h>

mavros_msgs::State current_state;
void state_cb(const mavros_msgs::State::ConstPtr& msg){
    current_state = *msg;   // 无人机当前状态
}

int main(int argc, char **argv)
{
    ros::init(argc, argv, "offb_node");
    ros::NodeHandle nh;

    ros::Subscriber state_sub = nh.subscribe<mavros_msgs::State>
            ("mavros/state", 10, state_cb);
    ros::Publisher local_pos_pub = nh.advertise<geometry_msgs::PoseStamped>
            ("mavros/setpoint_position/local", 10);
    ros::ServiceClient arming_client = nh.serviceClient<mavros_msgs::CommandBool>
            ("mavros/cmd/arming");
    ros::ServiceClient set_mode_client = nh.serviceClient<mavros_msgs::SetMode>
            ("mavros/set_mode");

    //the setpoint publishing rate MUST be faster than 2Hz
    ros::Rate rate(20.0);

    // wait for FCU connection
    while(ros::ok() && !current_state.connected){
        ros::spinOnce();
        rate.sleep();
    }

    geometry_msgs::PoseStamped pose;
    pose.pose.position.x = 0;
    pose.pose.position.y = 0;
    pose.pose.position.z = 2;

    //send a few setpoints before starting
    for(int i = 100; ros::ok() && i > 0; --i){
        local_pos_pub.publish(pose);
        ros::spinOnce();
        rate.sleep();
    }

    mavros_msgs::SetMode offb_set_mode;
    offb_set_mode.request.custom_mode = "OFFBOARD";

    mavros_msgs::CommandBool arm_cmd;
    arm_cmd.request.value = true;

    ros::Time last_request = ros::Time::now();

    while(ros::ok()){
        if( current_state.mode != "OFFBOARD" &&
            (ros::Time::now() - last_request > ros::Duration(5.0))){
            // 切换 Offboard 模式
            if( set_mode_client.call(offb_set_mode) &&
                offb_set_mode.response.mode_sent){
                ROS_INFO("Offboard enabled");
            }
            last_request = ros::Time::now();
        } else {
            if( !current_state.armed &&
                (ros::Time::now() - last_request > ros::Duration(5.0))){
                //无人机解锁
                if( arming_client.call(arm_cmd) &&
                    arm_cmd.response.success){
                    ROS_INFO("Vehicle armed");
                }
                last_request = ros::Time::now();
            }
        }

        local_pos_pub.publish(pose); // 发送目标点位置

        ros::spinOnce();
        rate.sleep();
    }

    return 0;
}

```

将下面内容添加到 off_node 功能包下的 CMakeLists.txt 文件里

```
add_executable(offb_node src/offb_node.cpp)
target_link_libraries(offb_node ${catkin_LIBRARIES})

```

![](https://i-blog.csdnimg.cn/blog_migrate/ea689769526f949aaf3a653d141f13d0.png#pic_center)

二. 编译运行
-------

```
cd ~/catkin_ws
catkin_make # 使用catkin build话，则为 catkin build

```

编译成功后，为了使用方便可以写一个 offb.sh 脚本来启动仿真

```
touch offb.sh

```

将下面代码复制上去

```
#!/bin/bash
source ~/.bashrc
gnome-terminal --window -e 'bash -c "roscore; exec bash"' \
--tab -e 'bash -c "sleep 5; roslaunch px4 mavros_posix_sitl.launch; exec bash"' \
--tab -e 'bash -c "sleep 10; rosrun off_node offb_node; exec bash"' \

```

运行

```
chmod +x offb.sh
./offb.sh

```

![](https://i-blog.csdnimg.cn/blog_migrate/e539a728de1e9dfb23b23578e098e728.png#pic_center)  
（无人机会切换到 Offboard 模式起飞两米，然后一直悬停）  
**注：如果遇到仿真正常启动，但是运行程序无人机不动，可以参考这篇** [博客](https://blog.csdn.net/private_Jack/article/details/128466062?spm=1001.2014.3001.5506) ，修改参数即可。

三. 修改官方代码
---------

官方的示例代码会一直悬停不会降落，我们可以修改 offb_node.cpp 文件，加个降落的功能，代码如下：

```
/**
 * @file offb_node.cpp
 * @brief Offboard control example node, written with MAVROS version 0.19.x, PX4 Pro Flight
 * Stack and tested in Gazebo Classic SITL
 */

#include <ros/ros.h>
#include <geometry_msgs/PoseStamped.h>
#include <mavros_msgs/CommandBool.h>
#include <mavros_msgs/SetMode.h>
#include <mavros_msgs/State.h>

using namespace std;

mavros_msgs::State current_state;
geometry_msgs::PoseStamped curr_pos;   // 无人机当前位置

// 获取无人机当前状态
void state_cb(const mavros_msgs::State::ConstPtr& msg){
    current_state = *msg;
}
// 获取无人机当前位置
void arrive_pos(const geometry_msgs::PoseStamped::ConstPtr& msg){
    curr_pos = *msg;
}

int main(int argc, char **argv)
{
    ros::init(argc, argv, "offb_node");
    ros::NodeHandle nh;

    ros::Subscriber state_sub = nh.subscribe<mavros_msgs::State>
            ("mavros/state", 10, state_cb);
    ros::Publisher local_pos_pub = nh.advertise<geometry_msgs::PoseStamped>
            ("mavros/setpoint_position/local", 10);
    ros::ServiceClient arming_client = nh.serviceClient<mavros_msgs::CommandBool>
            ("mavros/cmd/arming");
    ros::ServiceClient set_mode_client = nh.serviceClient<mavros_msgs::SetMode>
            ("mavros/set_mode");
    // 订阅无人机的位置话题
    ros::Subscriber local_pos_sub = nh.subscribe<geometry_msgs::PoseStamped>
        ("mavros/local_position/pose",10,arrive_pos);

    //the setpoint publishing rate MUST be faster than 2Hz
    ros::Rate rate(20.0);

    // wait for FCU connection
    while(ros::ok() && !current_state.connected){
        ros::spinOnce();
        rate.sleep();
    }

    geometry_msgs::PoseStamped pose;  // 目标位置
    pose.pose.position.x = 0;
    pose.pose.position.y = 0;
    pose.pose.position.z = 2;

    //send a few setpoints before starting
    for(int i = 100; ros::ok() && i > 0; --i){
        local_pos_pub.publish(pose);
        ros::spinOnce();
        rate.sleep();
    }

    mavros_msgs::SetMode offb_set_mode;
    offb_set_mode.request.custom_mode = "OFFBOARD";

    mavros_msgs::CommandBool arm_cmd;
    arm_cmd.request.value = true;

    ros::Time last_request = ros::Time::now();

    int count = 0;  // 计时
    bool flag = true;
    while(ros::ok()){
    	if( flag ) { 
	        if( current_state.mode != "OFFBOARD" &&
	            (ros::Time::now() - last_request > ros::Duration(5.0))){
	            if( set_mode_client.call(offb_set_mode) &&
	                offb_set_mode.response.mode_sent){
	                ROS_INFO("Offboard enabled");
	            }
	            last_request = ros::Time::now();
	        } else {
	            if( !current_state.armed &&
	                (ros::Time::now() - last_request > ros::Duration(5.0))){
	                if( arming_client.call(arm_cmd) &&
	                    arm_cmd.response.success){
	                    ROS_INFO("Vehicle armed");
	                }   // arm
	                last_request = ros::Time::now();
	            }
	        } // else
		} // flag

		// 当检测到与目标高度相差 ± 0.3 就开始悬停 30s
        if(fabs(curr_pos.pose.position.z - pose.pose.position.z) <= 0.3){
            count++;
            if(count >= 600)  // 30s
            {
                mavros_msgs::SetMode land_set_mode;
                land_set_mode.request.custom_mode = "AUTO.LAND";  // 发送降落命令
                if(set_mode_client.call(land_set_mode) && land_set_mode.response.mode_sent){
                    flag = false;
                }
            }  
        }
	  //任务结束,无人机降落完成并关闭该节点
     if ( !flag && current_state.mode == "AUTO.LAND" && current_state.armed == false ) {
          ROS_INFO("Drone has landed");
          ros::shutdown();
      }
        local_pos_pub.publish(pose);

        ros::spinOnce();
        rate.sleep();
    }

    return 0;
}

```

修改完后，直接编译运行，下面👇视频是运行效果

PX4 无人机仿真示例

参考
--

[MAVROS Offboard 控制示例 (C++) | PX4 自动驾驶用户指南](https://docs.px4.io/main/zh/ros/mavros_offboard_cpp.html)

[PX4 与 MAVROS 实现 offboard_rtt too high for timesync_manbushuizhong 的博客 - CSDN 博客](https://blog.csdn.net/manbushuizhong/article/details/123744960)

> 如有其他问题，或者发现文章有错误，请在评论区留言  
> Keep learning！