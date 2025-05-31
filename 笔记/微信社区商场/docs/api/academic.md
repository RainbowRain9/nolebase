# 教务相关API接口文档

## 概述

本文档描述了微信社区商场小程序中教务相关的API接口，包括课程管理、成绩查询、考试安排、教室管理等功能。

## 基础信息

- **API版本**: v1
- **基础URL**: `https://api.campus-mall.com/api/v1/academic`
- **认证方式**: JWT Token
- **请求格式**: JSON
- **响应格式**: JSON

## 课程相关接口

### 1. 获取课程表

**接口地址**: `GET /schedule`

**接口描述**: 获取学生或教师的课程表

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
semester=2024-1     // 学期，可选，默认当前学期
week=1              // 周次，可选，默认当前周
studentId=20210001  // 学号，可选（教师查询学生课表时使用）
teacherId=T001      // 教师工号，可选（查询教师课表时使用）
classId=CS2021-1    // 班级ID，可选（查询班级课表时使用）
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "semester": "2024-1",
    "week": 1,
    "schedule": [
      {
        "id": 1001,
        "courseId": "CS101",
        "courseName": "数据结构",
        "courseCode": "CS101001",
        "teacherId": "T001",
        "teacherName": "李教授",
        "classroom": "教学楼A101",
        "weekDay": 1,           // 星期几：1-7
        "startTime": "08:00",
        "endTime": "09:40",
        "startWeek": 1,
        "endWeek": 16,
        "weeks": "1-16",        // 上课周次
        "courseType": "必修",
        "credits": 3.0,
        "classNames": ["软工2021-1班", "软工2021-2班"]
      }
    ],
    "summary": {
      "totalCourses": 20,
      "totalCredits": 25.5,
      "weeklyHours": 28
    }
  },
  "timestamp": 1640995200000
}
```

### 2. 获取课程详情

**接口地址**: `GET /courses/{courseId}`

**接口描述**: 获取指定课程的详细信息

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `courseId`: 课程ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": "CS101",
    "courseName": "数据结构",
    "courseCode": "CS101001",
    "englishName": "Data Structure",
    "credits": 3.0,
    "hours": 48,
    "courseType": "必修",
    "department": "计算机学院",
    "description": "本课程主要介绍各种数据结构的概念、特点和应用...",
    "prerequisites": ["程序设计基础", "离散数学"],
    "textbook": "数据结构（C语言版）",
    "reference": ["算法导论", "数据结构与算法分析"],
    "assessment": {
      "attendance": 10,      // 考勤占比
      "homework": 20,        // 作业占比
      "midterm": 30,         // 期中考试占比
      "final": 40            // 期末考试占比
    },
    "teachers": [
      {
        "id": "T001",
        "name": "李教授",
        "title": "教授",
        "email": "li@university.edu.cn",
        "office": "计算机楼301",
        "officeHours": "周二、周四 14:00-16:00"
      }
    ],
    "schedule": [
      {
        "weekDay": 1,
        "startTime": "08:00",
        "endTime": "09:40",
        "classroom": "教学楼A101",
        "weeks": "1-16"
      }
    ]
  },
  "timestamp": 1640995200000
}
```

### 3. 搜索课程

**接口地址**: `GET /courses`

**接口描述**: 搜索和筛选课程

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
keyword=数据结构    // 搜索关键词，可选
semester=2024-1     // 学期，可选
department=计算机学院 // 开课学院，可选
courseType=必修     // 课程类型，可选
teacherId=T001      // 授课教师，可选
credits=3           // 学分，可选
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
```

**响应数据**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "list": [
      {
        "id": "CS101",
        "courseName": "数据结构",
        "courseCode": "CS101001",
        "credits": 3.0,
        "hours": 48,
        "courseType": "必修",
        "department": "计算机学院",
        "teacherName": "李教授",
        "semester": "2024-1"
      }
    ],
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8
  },
  "timestamp": 1640995200000
}
```

## 成绩相关接口

### 4. 获取学生成绩

**接口地址**: `GET /grades`

**接口描述**: 获取学生成绩信息

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
semester=2024-1     // 学期，可选，默认所有学期
studentId=20210001  // 学号，可选（教师查询时使用）
courseId=CS101      // 课程ID，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "studentInfo": {
      "studentId": "20210001",
      "name": "张三",
      "college": "计算机学院",
      "major": "软件工程",
      "className": "软工2021-1班"
    },
    "grades": [
      {
        "id": 1001,
        "courseId": "CS101",
        "courseName": "数据结构",
        "courseCode": "CS101001",
        "credits": 3.0,
        "semester": "2024-1",
        "teacherName": "李教授",
        "scores": {
          "attendance": 95,      // 考勤成绩
          "homework": 88,        // 作业成绩
          "midterm": 85,         // 期中成绩
          "final": 90,           // 期末成绩
          "total": 89.5,         // 总成绩
          "gpa": 3.7             // 绩点
        },
        "rank": {
          "classRank": 5,        // 班级排名
          "classTotal": 30,      // 班级总人数
          "majorRank": 15,       // 专业排名
          "majorTotal": 120      // 专业总人数
        },
        "status": "passed",      // 成绩状态：passed-通过，failed-不及格，retake-重修
        "examDate": "2024-01-15",
        "publishDate": "2024-01-20"
      }
    ],
    "summary": {
      "totalCredits": 25.5,     // 总学分
      "earnedCredits": 22.5,    // 已获得学分
      "averageGPA": 3.5,        // 平均绩点
      "totalCourses": 10,       // 总课程数
      "passedCourses": 9,       // 通过课程数
      "failedCourses": 1        // 不及格课程数
    }
  },
  "timestamp": 1640995200000
}
```

### 5. 获取成绩统计

**接口地址**: `GET /grades/statistics`

**接口描述**: 获取成绩统计信息

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
semester=2024-1     // 学期，可选
courseId=CS101      // 课程ID，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "distribution": {
      "excellent": 15,        // 优秀人数（90-100）
      "good": 25,            // 良好人数（80-89）
      "medium": 30,          // 中等人数（70-79）
      "pass": 20,            // 及格人数（60-69）
      "fail": 10             // 不及格人数（<60）
    },
    "statistics": {
      "totalStudents": 100,
      "averageScore": 78.5,
      "highestScore": 98,
      "lowestScore": 45,
      "passRate": 90.0,      // 及格率
      "excellentRate": 15.0  // 优秀率
    },
    "trends": [
      {
        "semester": "2023-1",
        "averageScore": 76.2,
        "passRate": 88.0
      },
      {
        "semester": "2023-2",
        "averageScore": 77.8,
        "passRate": 89.5
      },
      {
        "semester": "2024-1",
        "averageScore": 78.5,
        "passRate": 90.0
      }
    ]
  },
  "timestamp": 1640995200000
}
```

## 考试相关接口

### 6. 获取考试安排

**接口地址**: `GET /exams`

**接口描述**: 获取考试安排信息

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
semester=2024-1     // 学期，可选，默认当前学期
studentId=20210001  // 学号，可选（教师查询时使用）
examType=final      // 考试类型：midterm-期中，final-期末，makeup-补考
status=upcoming     // 考试状态：upcoming-即将开始，ongoing-进行中，finished-已结束
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "exams": [
      {
        "id": 1001,
        "courseId": "CS101",
        "courseName": "数据结构",
        "courseCode": "CS101001",
        "examType": "final",
        "examDate": "2024-01-15",
        "startTime": "09:00",
        "endTime": "11:00",
        "duration": 120,        // 考试时长（分钟）
        "classroom": "教学楼A101",
        "seatNumber": "A15",    // 座位号
        "teacherName": "李教授",
        "examForm": "闭卷",     // 考试形式：开卷、闭卷、机考
        "allowedItems": ["计算器", "直尺"],  // 允许携带物品
        "notes": "请提前30分钟到达考场",
        "status": "upcoming"
      }
    ],
    "summary": {
      "totalExams": 8,
      "upcomingExams": 3,
      "finishedExams": 5
    }
  },
  "timestamp": 1640995200000
}
```

### 7. 获取考试详情

**接口地址**: `GET /exams/{examId}`

**接口描述**: 获取指定考试的详细信息

**请求头**:
```
Authorization: Bearer {token}
```

**路径参数**:
- `examId`: 考试ID

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "id": 1001,
    "courseId": "CS101",
    "courseName": "数据结构",
    "courseCode": "CS101001",
    "examType": "final",
    "examDate": "2024-01-15",
    "startTime": "09:00",
    "endTime": "11:00",
    "duration": 120,
    "classroom": "教学楼A101",
    "seatNumber": "A15",
    "teacherName": "李教授",
    "proctors": ["张老师", "王老师"],  // 监考老师
    "examForm": "闭卷",
    "allowedItems": ["计算器", "直尺"],
    "prohibitedItems": ["手机", "智能手表", "电子设备"],
    "examRules": [
      "考生须提前30分钟到达考场",
      "迟到15分钟不得入场",
      "考试开始30分钟后方可交卷离场"
    ],
    "notes": "请携带学生证和身份证",
    "status": "upcoming",
    "registrationDeadline": "2024-01-10",
    "isRegistered": true
  },
  "timestamp": 1640995200000
}
```

## 教室相关接口

### 8. 查询空闲教室

**接口地址**: `GET /classrooms/available`

**接口描述**: 查询指定时间段的空闲教室

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
date=2024-01-15     // 日期，必填
startTime=09:00     // 开始时间，必填
endTime=11:00       // 结束时间，必填
building=教学楼A    // 教学楼，可选
capacity=50         // 最小容量，可选
equipment=投影仪    // 设备要求，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "查询成功",
  "data": {
    "availableRooms": [
      {
        "id": "A101",
        "name": "教学楼A101",
        "building": "教学楼A",
        "floor": 1,
        "capacity": 60,
        "type": "普通教室",
        "equipment": ["投影仪", "音响", "空调", "黑板"],
        "features": ["多媒体", "网络"],
        "status": "available"
      }
    ],
    "total": 15,
    "searchCriteria": {
      "date": "2024-01-15",
      "startTime": "09:00",
      "endTime": "11:00",
      "building": "教学楼A"
    }
  },
  "timestamp": 1640995200000
}
```

### 9. 申请教室借用

**接口地址**: `POST /classrooms/booking`

**接口描述**: 申请借用教室

**请求头**:
```
Authorization: Bearer {token}
```

**请求参数**:
```json
{
  "classroomId": "A101",          // 教室ID，必填
  "date": "2024-01-15",           // 使用日期，必填
  "startTime": "09:00",           // 开始时间，必填
  "endTime": "11:00",             // 结束时间，必填
  "purpose": "学术讲座",          // 使用目的，必填
  "description": "人工智能前沿技术讲座", // 活动描述，必填
  "expectedAttendees": 50,        // 预计参与人数，必填
  "contactPerson": "张三",        // 联系人，必填
  "contactPhone": "13800138000",  // 联系电话，必填
  "equipmentNeeds": ["投影仪", "音响"], // 设备需求，可选
  "specialRequirements": "需要网络支持" // 特殊要求，可选
}
```

**响应数据**:
```json
{
  "code": 200,
  "message": "申请提交成功",
  "data": {
    "bookingId": "B20240115001",
    "status": "pending",           // 申请状态：pending-待审核，approved-已通过，rejected-已拒绝
    "submittedAt": "2024-01-10T10:00:00Z",
    "expectedReviewTime": "2024-01-12T18:00:00Z"
  },
  "timestamp": 1640995200000
}
```

### 10. 获取教室借用记录

**接口地址**: `GET /classrooms/bookings`

**接口描述**: 获取教室借用申请记录

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
status=pending      // 申请状态，可选
startDate=2024-01-01 // 开始日期，可选
endDate=2024-01-31   // 结束日期，可选
page=1              // 页码，默认1
pageSize=20         // 每页数量，默认20
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "list": [
      {
        "id": "B20240115001",
        "classroomId": "A101",
        "classroomName": "教学楼A101",
        "date": "2024-01-15",
        "startTime": "09:00",
        "endTime": "11:00",
        "purpose": "学术讲座",
        "description": "人工智能前沿技术讲座",
        "status": "approved",
        "submittedAt": "2024-01-10T10:00:00Z",
        "reviewedAt": "2024-01-11T15:30:00Z",
        "reviewedBy": "教务处",
        "reviewComment": "申请通过，请按时使用"
      }
    ],
    "total": 25,
    "page": 1,
    "pageSize": 20,
    "totalPages": 2
  },
  "timestamp": 1640995200000
}
```

## 校历相关接口

### 11. 获取校历信息

**接口地址**: `GET /calendar`

**接口描述**: 获取学校日历信息

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
year=2024           // 年份，可选，默认当前年份
semester=1          // 学期：1-春季学期，2-秋季学期，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "year": 2024,
    "semesters": [
      {
        "semester": "2024-1",
        "name": "2024年春季学期",
        "startDate": "2024-02-26",
        "endDate": "2024-07-14",
        "totalWeeks": 20,
        "teachingWeeks": 16,
        "examWeeks": 2,
        "events": [
          {
            "id": 1,
            "title": "开学典礼",
            "date": "2024-02-26",
            "type": "ceremony",
            "description": "2024年春季学期开学典礼"
          },
          {
            "id": 2,
            "title": "期中考试周",
            "startDate": "2024-04-15",
            "endDate": "2024-04-21",
            "type": "exam",
            "description": "春季学期期中考试"
          },
          {
            "id": 3,
            "title": "劳动节假期",
            "startDate": "2024-05-01",
            "endDate": "2024-05-05",
            "type": "holiday",
            "description": "劳动节放假"
          }
        ]
      }
    ],
    "holidays": [
      {
        "name": "春节",
        "startDate": "2024-02-10",
        "endDate": "2024-02-17",
        "type": "national"
      }
    ]
  },
  "timestamp": 1640995200000
}
```

## 通讯录相关接口

### 12. 获取校园通讯录

**接口地址**: `GET /contacts`

**接口描述**: 获取校园通讯录信息

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
category=administrative // 分类：administrative-行政单位，academic-教学单位，service-服务部门
keyword=教务处          // 搜索关键词，可选
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "categories": [
      {
        "id": "administrative",
        "name": "行政单位",
        "departments": [
          {
            "id": "academic_affairs",
            "name": "教务处",
            "description": "负责教学管理、学籍管理等工作",
            "location": "行政楼201",
            "workingHours": "周一至周五 8:30-17:30",
            "contacts": [
              {
                "name": "教务科",
                "phone": "0571-88888001",
                "email": "jwk@university.edu.cn",
                "responsibilities": ["课程安排", "考试管理", "成绩管理"]
              },
              {
                "name": "学籍科",
                "phone": "0571-88888002",
                "email": "xjk@university.edu.cn",
                "responsibilities": ["学籍管理", "转专业", "休学复学"]
              }
            ]
          }
        ]
      }
    ]
  },
  "timestamp": 1640995200000
}
```

## 综合测评接口

### 13. 获取综合测评成绩

**接口地址**: `GET /evaluation`

**接口描述**: 获取学生综合测评成绩

**请求头**:
```
Authorization: Bearer {token}
```

**查询参数**:
```
semester=2024-1     // 学期，可选，默认当前学期
studentId=20210001  // 学号，可选（教师查询时使用）
```

**响应数据**:
```json
{
  "code": 200,
  "message": "获取成功",
  "data": {
    "studentInfo": {
      "studentId": "20210001",
      "name": "张三",
      "college": "计算机学院",
      "major": "软件工程",
      "className": "软工2021-1班"
    },
    "evaluation": {
      "semester": "2024-1",
      "scores": {
        "academic": {
          "score": 85.5,
          "weight": 70,
          "weightedScore": 59.85,
          "details": {
            "gpa": 3.7,
            "rank": 5,
            "totalStudents": 30
          }
        },
        "moral": {
          "score": 90.0,
          "weight": 15,
          "weightedScore": 13.5,
          "details": {
            "basicScore": 80,
            "bonusPoints": 10,
            "deductions": 0
          }
        },
        "physical": {
          "score": 88.0,
          "weight": 10,
          "weightedScore": 8.8,
          "details": {
            "physicalTest": 85,
            "sportsActivities": 3
          }
        },
        "innovation": {
          "score": 92.0,
          "weight": 5,
          "weightedScore": 4.6,
          "details": {
            "competitions": 2,
            "projects": 1,
            "papers": 0
          }
        }
      },
      "totalScore": 86.75,
      "rank": {
        "classRank": 3,
        "classTotal": 30,
        "majorRank": 12,
        "majorTotal": 120
      },
      "level": "优秀",           // 等级：优秀、良好、合格、不合格
      "publishDate": "2024-01-20"
    }
  },
  "timestamp": 1640995200000
}
```

## 错误码说明

| 错误码 | 错误信息 | 说明 |
|--------|----------|------|
| 50001 | 课程不存在 | 指定的课程不存在 |
| 50002 | 成绩未发布 | 该课程成绩尚未发布 |
| 50003 | 考试未安排 | 该课程考试尚未安排 |
| 50004 | 教室不存在 | 指定的教室不存在 |
| 50005 | 教室已被占用 | 该时间段教室已被占用 |
| 50006 | 申请时间冲突 | 申请时间与已有安排冲突 |
| 50007 | 权限不足 | 没有查询该信息的权限 |
| 50008 | 学期参数错误 | 学期格式不正确 |
| 50009 | 时间参数错误 | 时间格式不正确 |
| 50010 | 申请已存在 | 该时间段已有申请记录 |

## 注意事项

1. 学生只能查询自己的成绩和课程信息
2. 教师可以查询所授课程的相关信息
3. 管理员可以查询所有信息
4. 成绩查询需要在成绩发布后才能获取
5. 教室借用申请需要提前至少1天提交
6. 考试安排信息在考试前2周发布
7. 综合测评成绩每学期末统一发布

---

*文档版本: v1.0*  
*最后更新: 2025年5月*
