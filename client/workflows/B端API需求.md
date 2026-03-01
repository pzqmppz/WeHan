# C端工作流 - B端 API 需求文档

> **更新时间**: 2026-03-01
> **用途**: 说明 C端 Coze 工作流需要调用的 B 端 API 接口
> **生产环境**: `http://111.231.51.9`
> **API Key**: `wehan_open_api_key_2026`

---

## 一、面试启动工作流 (interview_workflow)

### 输入参数
| 参数名 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| job_id | string | 是 | 岗位 ID |
| user_id | string | 是 | 用户 ID |
| resume_id | string | 否 | 简历 ID（可选) |

### API 调用

#### 1. 获取岗位详情
- **方法**: `GET`
- **URL**: `/api/open/jobs/{job_id}`
- **请求头**:
  - `X-API-Key`: `wehan_open_api_key_2026`
- **返回格式**:
```json
{
  "success": true,
  "data": {
    "id": "cmm5o5b8q000ezguj2h8ofvyj",
    "title": "前端开发工程师",
    "description": "岗位职责描述...",
    "requirements": "任职要求...",
    "skills": ["JavaScript", "React", "TypeScript"],
    "salaryMin": 10000,
    "salaryMax": 20000,
    "location": "武汉",
    "enterprise": {
      "id": "ent_xxx",
      "name": "武汉光谷科技有限公司"
    }
  }
}
```

#### 2. 创建面试记录
- **方法**: `POST`
- **URL**: `/api/open/interviews`
- **请求头**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `wehan_dev_test_2026`
- **请求体**:
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
      "difficulty": "easy"
    }
  ],
  "currentIndex": 0,
  "answers": []
}
```
- **返回格式**:
```json
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "userId": "test_user_c_001",
    "jobId": "cmm5o5b8q000ezguj2h8ofvyj",
    "status": "IN_PROGRESS",
    "outline": [...],
    "currentIndex": 0,
    "createdAt": "2026-02-28T10:00:00.000Z"
  }
}
```

### 输出参数
| 参数名 | 类型 | 说明 |
|-----|------|------|
| interview_id | string | 创建的面试记录 ID |
| opening_message | string | 开场白 |
| first_question | string | 第一道面试题 |
| total_questions | integer | 总题数 |
| job_title | string | 岗位名称 |
| company_name | string | 公司名称 |

---

## 二、面试答题工作流 (interview_answer_workflow)

### 输入参数
| 参数名 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| interview_id | string | 是 | 面试记录 ID |
| question_index | string | 是 | 当前题目索引 (从 0 开始) |
| user_answer | string | 是 | 用户回答内容 |

### API 调用

#### 1. 获取面试详情
- **方法**: `GET`
- **URL**: `/api/open/interviews/{interview_id}`
- **请求头**:
  - `X-API-Key`: `wehan_open_api_key_2026`
- **返回格式**:
```json
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "userId": "test_user_c_001",
    "jobId": "cmm5o5b8q000ezguj2h8ofvyj",
    "status": "IN_PROGRESS",
    "outline": [
      {
        "id": "q1",
        "category": "专业",
        "question": "请介绍一下你自己",
        "difficulty": "easy"
      },
      {
        "id": "q2",
        "category": "专业",
        "question": "请说说你对 React 的理解",
        "difficulty": "medium"
      }
    ],
    "currentIndex": 0,
    "answers": [
      {
        "questionIndex": 0,
        "question": "请介绍一下你自己",
        "answer": "我是...",
        "timestamp": "2026-02-28T10:05:00.000Z"
      }
    ],
    "job": {
      "id": "cmm5o5b8q000ezguj2h8ofvyj",
      "title": "前端开发工程师",
      "enterprise": {
        "name": "武汉光谷科技有限公司"
      }
    }
  }
}
```

#### 2. 更新面试进度
- **方法**: `PATCH`
- **URL**: `/api/open/interviews/{interview_id}`
- **请求头**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `wehan_dev_test_2026`
- **请求体**:
```json
{
  "currentIndex": 1,
  "status": "IN_PROGRESS",
  "answers": [
    {
      "questionIndex": 0,
      "question": "请介绍一下你自己",
      "answer": "用户回答内容",
      "timestamp": "2026-02-28T10:05:00.000Z"
    }
  ]
}
```
- **返回格式**:
```json
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "userId": "test_user_c_001",
    "jobId": "cmm5o5b8q000ezguj2h8ofvyj",
    "status": "IN_PROGRESS",
    "currentIndex": 1,
    "answers": [...],
    "updatedAt": "2026-02-28T10:06:00.000Z"
  }
}
```

### 输出参数
| 参数名 | 类型 | 说明 |
|-----|------|------|
| response_message | string | 给用户的响应（包含评分和下一题）|
| score | integer | 当前题目得分 (1-10) |
| next_question | string | 下一道题目 |
| next_index | integer | 下一题索引 |
| is_completed | boolean | 是否已完成所有题目 |
| progress | string | 进度（如 "2/5"）|

> **注意**: PATCH API 只负责更新数据，评分和反馈由工作流中的大模型节点生成。

---

## 三、面试报告工作流 (interview_report_workflow)

### 输入参数
| 参数名 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| interview_id | string | 是 | 面试记录 ID |

### API 调用

#### 1. 获取面试数据
- **方法**: `GET`
- **URL**: `/api/open/interviews/{interview_id}`
- **请求头**:
  - `X-API-Key`: `wehan_open_api_key_2026`
- **返回格式**: 同面试答题工作流（包含完整 answers 数组）

#### 2. 保存报告
- **方法**: `PATCH`
- **URL**: `/api/open/interviews/{interview_id}`
- **请求头**:
  - `Content-Type`: `application/json`
  - `X-API-Key`: `wehan_dev_test_2026`
- **请求体**:
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
  "suggestions": "整体建议：该候选人基础扎实，但需要加强...",
  "grade": "B",
  "recommendation": "待定"
}
```
- **返回格式**:
```json
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "status": "COMPLETED",
    "totalScore": 72,
    "grade": "B",
    "recommendation": "待定",
    "updatedAt": "2026-02-28T10:30:00.000Z"
  }
}
```

### 输出参数
| 参数名 | 类型 | 说明 |
|-----|------|------|
| report_markdown | string | Markdown 格式的报告文本 |
| report_json | string | JSON 格式的报告数据 |
| grade | string | 综合等级 (A/B/C) |
| recommendation | string | 最终建议 (通过/待定/不通过) |

---

## 四、通用说明

### API Key
- **请求头名称**: `X-API-Key`
- **生产环境值**: `wehan_open_api_key_2026`
- **说明**: 所有开放 API 请求都需要携带此请求头进行认证

### 基础 URL
| 环境 | URL |
|-----|-----|
| 本地开发 | `http://localhost:3000` |
| 生产环境 | `http://111.231.51.9` |

### 错误响应格式
```json
{
  "success": false,
  "error": "错误信息描述",
  "code": "ERROR_CODE"
}
```

### HTTP 状态码
| 状态码 | 说明 |
|-------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | API Key 无效或缺失 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 五、测试数据（已确认可用）

### 测试岗位 ID
```bash
# 前端开发工程师 - 武汉光谷科技有限公司
job_id: cmm6neue0000e2i9w94na7tp4

# 后端开发工程师 - 武汉光谷科技有限公司
job_id: cmm6neue0000f2i9w9bhkc4bk

# AI算法工程师 - 武汉光谷科技有限公司
job_id: cmm6neue0000g2i9w61n1eb61
```

### 用户 ID 说明

**扣子平台自动提供 `sys_uuid`**，无需用户手动输入：
- 在工作流中直接使用 `{{sys_uuid}}` 系统变量
- B 端 API 会自动将 sys_uuid 作为 externalUserId 存储

**测试用 ID**（手动测试时使用）:
```bash
# 扣子系统变量（推荐）
user_id: {{sys_uuid}}  # 工作流中直接使用

# 手动测试用 ID
user_id: test_user_c_001  # C端虚拟用户
```

### 测试面试记录 ID (已创建，可直接使用)
```bash
# 前端开发工程师面试 - test_user_c_001
interview_id: cmm6oc5j00002cb9w0nck68lr

# 包含 3 道题目:
# q1: 请介绍一下你自己 (easy)
# q2: 请说说你对 React 的理解 (medium)
# q3: 描述一个你解决过的技术难题 (medium)
```

### 工作流2 测试数据 (面试答题)
| 参数名 | 示例值 | 说明 |
|-------|--------|------|
| interview_id | `cmm6oc5j00002cb9w0nck68lr` | 面试记录 ID (已创建) |
| question_index | `"0"` | 当前题目索引 (字符串类型，从 0 开始) |
| user_answer | `"我叫张三，是一名前端开发工程师，有3年的 React 开发经验..."` | 用户回答内容 |

### 工作流3 测试数据 (面试报告)
| 参数名 | 示例值 | 说明 |
|-------|--------|------|
| interview_id | `cmm6oc5j00002cb9w0nck68lr` | 面试记录 ID (已创建) |

### API 路由状态
- [x] `GET /api/open/jobs/:id` - ✅ 已实现
- [x] `POST /api/open/interviews` - ✅ 已实现
- [x] `GET /api/open/interviews/:id` - ✅ 已实现
- [x] `PATCH /api/open/interviews/:id` - ✅ 已实现

### API 测试命令
```bash
# 1. 测试获取岗位详情
curl -X GET "http://111.231.51.9/api/open/jobs/cmm6neue0000e2i9w94na7tp4" \
  -H "X-API-Key: wehan_open_api_key_2026"

# 2. 测试创建面试记录
curl -X POST "http://111.231.51.9/api/open/interviews" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wehan_open_api_key_2026" \
  -d '{
    "userId": "test_user_c_001",
    "jobId": "cmm6neue0000e2i9w94na7tp4",
    "status": "IN_PROGRESS",
    "outline": [{"id":"q1","category":"专业","question":"请介绍一下你自己","difficulty":"easy"}],
    "currentIndex": 0,
    "answers": []
  }'

# 3. 测试获取面试详情
curl -X GET "http://111.231.51.9/api/open/interviews/{interview_id}" \
  -H "X-API-Key: wehan_open_api_key_2026"

# 4. 测试更新面试进度
curl -X PATCH "http://111.231.51.9/api/open/interviews/{interview_id}" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: wehan_open_api_key_2026" \
  -d '{
    "currentIndex": 1,
    "status": "IN_PROGRESS",
    "answers": [{
      "questionIndex": 0,
      "question": "请介绍一下你自己",
      "answer": "我是...",
      "timestamp": "2026-03-01T10:05:00.000Z"
    }]
  }'
```

---

## 六、数据模型说明

### Interview 面试记录模型
```typescript
interface Interview {
  id: string;                    // 面试记录 ID
  userId: string;                // 用户 ID
  jobId: string;                 // 岗位 ID
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  outline: QuestionOutline[];    // 面试题目大纲
  currentIndex: number;          // 当前题目索引
  answers: Answer[];             // 用户回答记录
  totalScore?: number;           // 总分（报告生成后）
  dimensions?: Dimension[];      // 评分维度（报告生成后）
  highlights?: Highlight[];      // 亮点（报告生成后）
  improvements?: Improvement[];  // 改进建议（报告生成后）
  suggestions?: string;          // 综合建议（报告生成后）
  grade?: string;                // 等级 A/B/C（报告生成后）
  recommendation?: string;       // 最终建议（报告生成后）
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionOutline {
  id: string;           // 题目 ID
  category: string;     // 题目分类（专业/行为/综合）
  question: string;     // 题目内容
  difficulty: string;   // 难度（easy/medium/hard）
}

interface Answer {
  questionIndex: number;  // 题目索引
  question: string;       // 题目内容
  answer: string;         // 用户回答
  timestamp: string;      // 回答时间 (ISO 8601)
}

interface Dimension {
  name: string;      // 维度名称
  score: number;     // 得分
  maxScore: number;  // 满分
}

interface Highlight {
  question: string;  // 题目
  answer: string;    // 回答
  score: number;     // 得分
  comment: string;   // 评价
}

interface Improvement {
  area: string;      // 需改进领域
  suggestion: string;  // 建议
}
```

### Job 岗位模型（简化版）
```typescript
interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  skills: string[];
  salaryMin: number;
  salaryMax: number;
  location: string;
  enterprise: {
    id: string;
    name: string;
  };
}
```

---

## 七、接口实现优先级

| 优先级 | 接口 | 说明 |
|-------|------|------|
| P0 | GET /api/open/jobs/:id | 面试启动必需 |
| P0 | POST /api/open/interviews | 面试启动必需 |
| P0 | GET /api/open/interviews/:id | 答题/报告必需 |
| P0 | PATCH /api/open/interviews/:id | 答题/报告必需 |

---

*文档版本: 2.1 | 更新时间: 2026-03-01*
