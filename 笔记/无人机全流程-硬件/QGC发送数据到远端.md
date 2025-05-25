---
created: 2025-05-24 T17:19
updated: 2025-05-24T18:04
---
# QGC 发送数据到远端

在 QGroundControl 中运行 Python 脚本向服务器发送数据，可以通过以下步骤实现：

## 1. 安装必要的软件和库
- **安装 Python**：确保已经在运行 QGroundControl 的设备上安装了 Python。
- **安装 pymavlink 库**：可以通过以下命令安装：
  ```bash
  pip install pymavlink
  ```

## 2. 编写 Python 脚本
- **创建脚本**：创建一个 Python 脚本，用于与 QGroundControl 通信并发送数据到服务器。以下是一个示例脚本：
  ```python
  from pymavlink import mavutil
  import requests
  import time
  
  # 连接到QGroundControl
  master = mavutil.mavlink_connection('udp:127.0.0.1:14550')
  
  # 等待心跳消息
  master.wait_heartbeat()
  print("Connected to QGroundControl")
  
  # 服务器的URL
  server_url = "http://your-server.com/data"
  
  while True:
      # 获取飞行数据
      msg = master.recv_match(type='GLOBAL_POSITION_INT', blocking=True)
      if msg:
          data = {
              "latitude": msg.lat / 1e7,
              "longitude": msg.lon / 1e7,
              "altitude": msg.alt / 1e3,
              "relative_altitude": msg.relative_alt / 1e3
          }
          # 发送数据到服务器
          response = requests.post(server_url, json=data)
          # 检查响应
          if response.status_code == 200:
              print("Data sent successfully")
          else:
              print("Error sending data:", response.status_code)
      time.sleep(1)
  ```

## 3. 配置 QGroundControl
- **UDP 端口配置**：确保 QGroundControl 配置为使用 UDP 端口 `14550` 进行通信。可以在 QGroundControl 的设置中找到网络选项，配置 UDP 输出到 `127.0.0.1:14550`。

## 4. 运行 Python 脚本
- **执行脚本**：在命令行中运行编写好的 Python 脚本：
  ```bash
  python your_script.py
  ```

## 5. 在服务器端接收数据
- **设置 HTTP 服务器**：确保服务器端有一个 HTTP 服务器正在监听相应的端口，并能够接收和处理来自 QGroundControl 的数据。可以使用 Flask 来创建一个简单的 HTTP 服务器，示例如下：
  ```python
  from flask import Flask, request
  
  app = Flask(__name__)
  
  @app.route('/data', methods=['POST'])
  def receive_data():
      data = request.json
      print("Received data:", data)
      # 在这里处理接收到的数据
      return 'Data received', 200
  
  if __name__ == '__main__':
      app.run(host='0.0.0.0', port=5000)
  ```

通过以上步骤，QGroundControl 可以运行