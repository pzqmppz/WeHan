# C端开发协作文档

> **更新时间**: 2026-02-28
> **版本**: v1.0
> **用途**: B 端提供给 C 端开发的 API 接口文档

---

## 一、概述

### 1.1 项目说明

| 项目 | 说明 |
|-----|------|
| **B 端** | 才聚江城 - 企业/学校/政府/管理员后台 |
| **C 端** | WeHan - 扣子智能体，面向求职者 |
| **协作方式** | C 端通过 B 端提供的开放 API 获取数据 |

### 1.2 基础信息

| 项目 | 值 |
|-----|-----|
| **API 基础 URL** | `https://wehan.vercel.app` |
| **API Key** | `X-API-Key: wehan_open_api_key_2026` |
| **数据格式** | JSON |
| **字符编码** | UTF-8 |

---

## 二、开放 API 列表

### 2.1 岗位相关

#### 获取岗位详情
```
GET /api/open/jobs/{job_id}
```

**请求头**:
```http
X-API-Key: wehan_open_api_key_2026
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "cmm5o5b8q000ezguj2h8ofvyj",
    "title": "前端开发工程师",
    "industry": "互联网/IT",
    "category": "技术研发",
    "salaryMin": 12000,
    "salaryMax": 20000,
    "location": "武汉",
    "responsibilities": "岗位职责描述...",
    "requirements": "任职要求...",
    "benefits": "五险一金、带薪年假",
    "skills": ["React", "TypeScript", "CSS3"],
    "educationLevel": "本科",
    "experienceYears": 0,
    "freshGraduate": true,
    "enterprise": {
      "id": "xxx",
      "name": "武汉光谷科技有限公司",
      "industry": "互联网/IT"
    }
  }
}
```

---

### 2.2 面试相关

#### 创建面试记录
```
POST /api/open/interviews
```

**请求头**:
```http
Content-Type: application/json
X-API-Key: wehan_open_api_key_2026
```

**请求体**:
```json
{
  "userId": "test_user_c_001",
  "jobId": "cmm5o5b8q000ezguj2h8ofvyj",
  "status": "IN_PROGRESS",
  "outline": [
    {
      "id": "q1",
      "category": "专业",
      "question": "请介绍一下你自己",
      "difficulty": "easy",
      "evaluationPoints": ["表达能力", "逻辑思维"]
    }
  ],
  "currentIndex": 0,
  "answers": []
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "createdAt": "2026-02-28T10:00:00Z"
  }
}
```

---

#### 获取面试详情
```
GET /api/open/interviews/{interview_id}
```

**请求头**:
```http
X-API-Key: wehan_open_api_key_2026
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "job": {
      "id": "cmm5o5b8q000ezguj2h8ofvyj",
      "title": "前端开发工程师",
      "company": "武汉光谷科技有限公司"
    },
    "outline": [...],
    "currentIndex": 0,
    "answers": [...],
    "status": "IN_PROGRESS",
    "totalScore": 72,
    "suggestions": "整体建议..."
  }
}
```

---

#### 更新面试进度
```
PATCH /api/open/interviews/{interview_id}
```

**请求头**:
```http
Content-Type: application/json
X-API-Key: wehan_open_api_key_2026
```

**请求体**:
```json
{
  "currentIndex": 1,
  "status": "IN_PROGRESS",
  "answers": [
    {
      "questionIndex": 0,
      "question": "请介绍一下你自己",
      "answer": "用户回答内容",
      "timestamp": "2026-02-28T10:00:00Z"
    }
  ]
}
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "currentIndex": 1,
    "status": "IN_PROGRESS"
  }
}
```

---

#### 保存面试报告
```
PATCH /api/open/interviews/{interview_id}
```

**请求体（完成面试时）**:
```json
{
  "status": "COMPLETED",
  "totalScore": 72,
  "dimensions": [
    { "name": "专业知识", "score": 38, "maxScore": 50 },
    { "name": "表达能力", "score": 18, "maxScore": 25 },
    { "name": "逻辑思维", "score": 16, "maxScore": 25 }
  ],
  "highlights": [
    { "question": "题目1", "answer": "...", "score": 8, "comment": "回答很完整" }
  ],
  "improvements": [
    { "area": "技术深度", "suggestion": "建议加强..." }
  ],
  "suggestions": "整体建议：该候选人基础扎实，但需要加强..."
}
```

---

### 2.3 政策相关

#### 获取政策列表
```
GET /api/open/policies?page=1&pageSize=10
```

**查询参数**:
| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| page | integer | 否 | 页码，默认 1 |
| pageSize | integer | 否 | 每页数量，默认 10 |
| type | string | 否 | 政策类型筛选 |

**响应示例**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 4,
    "totalPages": 1
  }
}
```

---

### 2.4 简历相关

#### 创建/更新简历
```
POST /api/open/resumes
```

**请求体**:
```json
{
  "userId": "user_xxx",
  "name": "张三",
  "email": "zhangsan@example.com",
  "phone": "13800138000",
  "education": "...",
  "experience": "...",
  "skills": ["React", "Node.js"],
  "projects": "..."
}
```

---

### 2.5 投递相关

#### 创建投递记录
```
POST /api/open/applications
```

**请求体**:
```json
{
  "userId": "user_xxx",
  "jobId": "cmm5o5b8q000ezguj2h8ofvyj",
  "resumeId": "resume_xxx",
  "coverLetter": "求职信内容..."
}
```

---

## 三、数据模型说明

### 3.1 InterviewStatus（面试状态）
| 值 | 说明 |
|-----|------|
| `PREPARING` | 准备中 |
| `IN_PROGRESS` | 进行中 |
| `COMPLETED` | 已完成 |

### 3.2 PolicyType（政策类型）
| 值 | 说明 |
|-----|------|
| `TALENT` | 人才政策 |
| `HOUSING` | 住房政策 |
| `ENTREPRENEUR` | 创业扶持 |
| `EMPLOYMENT` | 就业政策 |
| `OTHER` | 其他 |

---

## 四、错误处理

### 4.1 错误响应格式
```json
{
  "success": false,
  "error": "错误信息描述",
  "code": "ERROR_CODE"
}
```

### 4.2 常见错误码
| 错误码 | 说明 |
|-------|------|
| `INVALID_API_KEY` | API Key 无效 |
| `NOT_FOUND` | 资源不存在 |
| `VALIDATION_ERROR` | 参数验证失败 |
| `UNAUTHORIZED` | 未授权访问 |

---

## 五、测试数据

### 5.1 测试岗位 ID
```
cmm5o5b8q000ezguj2h8ofvyj  # 前端开发工程师
cmm5o5b8q000fzguje6mp40ro  # 后端开发工程师
cmm5o5b8r000gzguj0kl94ol3  # AI算法工程师
```

### 5.2 测试用户 ID
```
test_user_c_001  # C端虚拟用户ID（推荐使用）
```

### 5.3 测试命令
```bash
# 测试获取岗位详情
curl -X GET "https://wehan.vercel.app/api/open/jobs/cmm5o5b8q000ezguj2h8ofvyj" \
  -H "X-API-Key: wehan_open_api_key_2026"

# 测试创建面试记录
curl -X POST "https://wehan.vercel.app/api/open/interviews" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wehan_open_api_key_2026" \
  -d '{
    "userId": "test_user_c_001",
    "jobId": "cmm5o5b8q000ezguj2h8ofvyj",
    "status": "IN_PROGRESS",
    "outline": [{"id":"q1","question":"请介绍一下你自己"}],
    "currentIndex": 0,
    "answers": []
  }'
```

---

## 六、工作流对接

### 6.1 面试启动工作流

**输入参数**:
- `job_id`: 岗位 ID
- `user_id`: 用户 ID
- `resume_id`: 简历 ID（可选）

**输出参数**:
- `interview_id`: 面试记录 ID
- `opening_message`: 开场白
- `first_question`: 第一道题目
- `total_questions`: 总题数
- `job_title`: 岗位名称
- `company_name`: 公司名称

### 6.2 面试答题工作流

**输入参数**:
- `interview_id`: 面试记录 ID
- `question_index`: 当前题目索引
- `user_answer`: 用户回答内容

**输出参数**:
- `response_message`: 响应消息（包含评分和下一题）
- `score`: 当前题目得分
- `next_question`: 下一道题目
- `next_index`: 下一题索引
- `is_completed`: 是否完成
- `progress`: 进度（如 "2/5"）

### 6.3 面试报告工作流

**输入参数**:
- `interview_id`: 面试记录 ID

**输出参数**:
- `report_markdown`: Markdown 格式报告
- `report_json`: JSON 格式数据
- `grade`: 综合等级（A/B/C）
- `recommendation`: 最终建议（通过/待定/不通过）

---

## 七、联系方式

如有问题，请联系 B 端开发团队。
