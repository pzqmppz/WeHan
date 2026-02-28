# C 端开发 - B 端协作需求清单

> WeHan 求职助手（C 端）开发需要 B 端提供的 API、数据库表和环境配置支持

**创建时间**: 2026-02-28
**最后更新**: 2026-02-28（v1.8 - 面试断点恢复功能）
**对接人**: C 端开发团队 ↔ B 端开发团队
**目标**: 明确 B 端需要完成的前置任务，确保 C 端开发顺利进行

---

## 实现状态总览

### API 接口状态

| API 接口 | 状态 | 优先级 | 备注 |
|---------|------|-------|------|
| GET /api/open/jobs | ✅ 已完成 | P0 | 支持分页、搜索、筛选，使用 X-API-Key 认证 |
| GET /api/open/jobs/{id} | ✅ 已完成 | P0 | 岗位详情，responsibilities<-description |
| POST /api/open/applications | ✅ 已完成 | P0 | 投递提交，防重复投递 |
| GET /api/open/applications | ✅ 已完成 | P1 | 投递列表查询 |
| POST /api/open/interviews | ✅ 已完成 | P0 | 保存面试报告，支持 IN_PROGRESS 状态（断点恢复） |
| GET /api/open/interviews | ✅ 已完成 | P1 | 查询面试列表（支持按 status 筛选） |
| GET /api/open/interviews/{id} | ✅ 已完成 | P1 | 面试报告详情（包含 outline、currentIndex、answers） |
| PATCH /api/open/interviews/{id} | ✅ 已完成 | P1 | 更新面试进度（currentIndex、answers） |
| POST /api/open/resumes | ✅ 已完成 | P0 | 保存简历，structuredData拆分存储 |
| GET /api/open/resumes/{userId} | ✅ 已完成 | P0 | 获取简历，组装structuredData返回 |
| GET /api/open/policies | ✅ 已完成 | P2 | 政策列表，支持分类筛选 |
| POST /api/open/conversations | ✅ 已完成 | P1 | 创建/更新会话 |
| PUT /api/open/conversations/{id} | ✅ 已完成 | P1 | 更新会话 |
| GET /api/open/conversations/user/{userId} | ✅ 已完成 | P1 | 用户会话列表 |
| GET /api/open/conversations/{id} | ✅ 已完成 | P1 | 会话详情 |

### 数据库表状态

| 表名 | 状态 | Prisma 模型 | 备注 |
|-----|------|------------|------|
| conversations | ✅ 已创建 | Conversation | 新增：会话持久化 |
| emotion_records | ✅ 已存在 | EmotionRecord | 情绪记录 |
| interviews | ✅ 已更新 | Interview | 新增 externalUserId、currentIndex、answers 字段（断点恢复） |
| applications | ✅ 已更新 | Application | 新增 externalUserId 字段 |
| resumes | ✅ 已更新 | Resume | 新增 externalUserId, resumeText 字段 |
| policies | ✅ 已存在 | Policy | 政策信息 |
| jobs | ✅ 已存在 | Job | 岗位信息 |
| users | ✅ 已存在 | User | 用户信息 |

---

## 一、优先级说明

| 优先级 | 说明 | 阻塞影响 |
|-------|------|---------|
| **P0** | 必须完成，否则 C 端无法开发 | 完全阻塞 |
| **P1** | 重要，影响核心功能 | 部分阻塞 |
| **P2** | 可选，扩展功能 | 不阻塞 |

---

## 二、字段映射说明（重要）

> **确认时间**: 2026-02-28 v1.3
> **说明**: C 端请求体与 B 端数据库字段的映射关系，B 端 API 层负责转换

### 2.1 用户ID字段映射

| C 端请求字段 | B 端数据库字段 | 映射逻辑 |
|-------------|--------------|---------|
| `userId` | `externalUserId` | B 端 API 接收 `userId`，内部映射到 `externalUserId` 存储 |

**实现示例**（供 B 端参考）：
```typescript
// C 端发送
{ "userId": "7456948346762879000_xxx", ... }

// B 端 API 处理
const conversationData = {
  externalUserId: body.userId,  // 映射
  cozeConversationId: body.conversationId,
  // ...
};
```

### 2.2 简历字段映射

| C 端请求字段 | B 端数据库字段 | 映射逻辑 |
|-------------|--------------|---------|
| `userId` | `externalUserId` | 映射到 externalUserId |
| `resumeText` | `resumeText` | 直接存储 |
| `structuredData.name` | `name` | 拆分存储 |
| `structuredData.phone` | `phone` | 拆分存储 |
| `structuredData.email` | `email` | 拆分存储 |
| `structuredData.education` | `education` | 拆分存储 |
| `structuredData.experiences` | `experiences` | 拆分存储 |
| `structuredData.skills` | `skills` | 拆分存储 |
| `fileId` | - | **可选字段，可忽略** |

### 2.3 岗位详情字段映射

| C 端期望字段 | B 端数据库字段 | 映射逻辑 |
|-------------|--------------|---------|
| `responsibilities` | `description` | 返回 `description` 作为 `responsibilities` |
| `requirements` | `requirements` | 直接返回 |

### 2.4 面试报告字段映射

| C 端请求字段 | B 端数据库字段 | 映射逻辑 |
|-------------|--------------|---------|
| - | `status` | **自动设置为 `COMPLETED`** |
| `userId` | `externalUserId` | 映射到 externalUserId |

---

## 三、开放 API 需求（P0）

### 3.1 岗位相关 API

#### 获取岗位列表 ✅ 已完成
```
GET /api/open/jobs

Query Parameters:
  - keyword: string (可选，搜索关键词)
  - industry: string (可选，行业筛选)
  - location: string (可选，地区筛选，默认"武汉")
  - limit: number (可选，返回数量，默认10)
  - offset: number (可选，分页偏移，默认0)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "cmm4tbqbr000ps306me2e3hvo",
      "title": "电气工程师",
      "industry": "智能制造",
      "category": "电气设计",
      "salaryMin": 12000,
      "salaryMax": 20000,
      "location": "武汉",
      "description": "负责自动化生产线的电气系统设计和调试",
      "requirements": "本科及以上学历，电气自动化相关专业，熟悉 PLC 编程",
      "benefits": "五险一金、包吃住、技术培训",
      "skills": ["PLC", "电气设计", "AutoCAD"],
      "educationLevel": "本科",
      "experienceYears": 1,
      "freshGraduate": true,
      "headcount": 3,
      "publishedAt": "2026-02-27T11:32:22.405Z",
      "enterprise": {
        "id": "cmm4tbph70003s306c9n01f3v",
        "name": "长江智能制造有限公司",
        "industry": "智能制造"
      }
    }
  ],
  "meta": {
    "total": 8,
    "page": 1,
    "pageSize": 20
  }
}
```

**⚠️ 字段修正说明**（v1.6）：
- ~~`company`~~ → 使用 `enterprise.name`（企业对象）
- 新增 `enterprise` 对象：`{ id, name, industry }`
- 新增 `category` 字段（岗位分类）
- 新增 `benefits` 字段（福利待遇）
- 新增 `headcount` 字段（招聘人数）
- 新增 `freshGraduate` 字段（是否接收应届生）
- `educationLevel` 代替 `education`
- `experienceYears` 代替 `experience`

#### 获取岗位详情 ✅ 已完成
```
GET /api/open/jobs/{id}

Path Parameters:
  - id: string (岗位ID)

Response (200):
{
  "success": true,
  "data": {
    "id": "cmm4tbqbr000ps306me2e3hvo",
    "title": "电气工程师",
    "industry": "智能制造",
    "category": "电气设计",
    "salaryMin": 12000,
    "salaryMax": 20000,
    "location": "武汉",
    "description": "负责自动化生产线的电气系统设计和调试",
    "requirements": "本科及以上学历，电气自动化相关专业，熟悉 PLC 编程",
    "responsibilities": "负责自动化生产线的电气系统设计和调试",  // 注意：此字段来自 description
    "benefits": "五险一金、包吃住、技术培训",
    "skills": ["PLC", "电气设计", "AutoCAD"],
    "educationLevel": "本科",
    "experienceYears": 1,
    "freshGraduate": true,
    "headcount": 3,
    "enterprise": {
      "id": "cmm4tbph70003s306c9n01f3v",
      "name": "长江智能制造有限公司",
      "industry": "智能制造"
    },
    "publishedAt": "2026-02-27T11:32:22.405Z"
  }
}
```

**字段映射说明**：
- `responsibilities` 字段从数据库的 `description` 字段获取
- `requirements` 字段从数据库的 `requirements` 字段获取
- `enterprise.name` 可作为公司名称使用

---

### 3.2 投递相关 API

#### 提交投递 ✅ 已完成
```
POST /api/open/applications

Request Body:
{
  "userId": "user_xxx",           // C端用户ID（豆包user_id）
  "jobId": "job_xxx",             // 岗位ID
  "resumeId": "resume_xxx",        // 简历ID（可选，如果用户已上传简历）
  "interviewReportId": "report_xxx" // 面试报告ID（可选，如果有面试记录）
}

Response (200):
{
  "success": true,
  "data": {
    "id": "app_xxx",
    "status": "PENDING",           // PENDING | VIEWED | INTERVIEWING | OFFERED | REJECTED
    "createdAt": "2026-02-28T10:00:00Z"
  }
}
```

**实现功能**（v1.7）：
- ✅ userId → externalUserId 字段映射
- ✅ 岗位存在性校验（检查岗位是否已发布）
- ✅ 重复投递检查（同一用户对同一岗位）
- ✅ 返回投递 ID 和状态

#### 获取投递状态 ✅ 已完成
```
GET /api/open/applications?userId={userId}

Query Parameters:
  - userId: string (C端用户ID，必填)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "app_xxx",
      "job": {
        "id": "job_xxx",
        "title": "Java开发工程师",
        "company": "武汉某科技公司"
      },
      "status": "VIEWED",
      "createdAt": "2026-02-27T10:00:00Z",
      "updatedAt": "2026-02-28T09:00:00Z"
    }
  ]
}
```

---

### 3.3 面试报告相关 API

> **数据库状态**: ✅ `Interview` 表已存在，字段完整（dimensions, highlights, improvements, suggestions, audioUrl, conversation, outline, currentIndex, answers）

#### Interview 表新增字段（v1.8）

```prisma
model Interview {
  // ... 现有字段 ...

  // ===== 面试内容 =====
  outline         Json?           // 题目列表（用于断点恢复）
  currentIndex    Int?            @default(0)   // 当前面试进度（第几题）
  answers         Json?                       // 回答记录数组 InterviewAnswer[]

  // ... 其他字段 ...
}
```

**InterviewAnswer 结构**:
```typescript
interface InterviewAnswer {
  questionIndex: number   // 题目索引
  question: string        // 题目内容
  answer: string          // 回答内容
  audioUrl?: string       // 回答音频URL（可选）
  timestamp: string       // 回答时间
}
```

#### 保存面试报告 ✅ 已完成（v1.8 更新）
```
POST /api/open/interviews

Request Body (完成面试):
{
  "userId": "user_xxx",
  "jobId": "job_xxx",
  "totalScore": 78,
  "dimensions": [
    {"name": "专业知识", "score": 85, "maxScore": 100},
    {"name": "表达能力", "score": 72, "maxScore": 100}
  ],
  "highlights": [...],
  "improvements": [...],
  "suggestions": "整体表现良好",
  "audioUrl": "https://xxx.com/audio/interview_xxx.mp3",
  "conversation": [...]
}

Request Body (创建进行中的面试 - 断点恢复):
{
  "userId": "user_xxx",
  "jobId": "job_xxx",
  "status": "IN_PROGRESS",           // 新增：支持创建进行中的面试
  "outline": [                       // 新增：题目列表
    {"id": "q1", "category": "专业", "question": "请介绍一下你自己", "difficulty": "easy"},
    {"id": "q2", "category": "专业", "question": "什么是Java多态", "difficulty": "medium"}
  ],
  "currentIndex": 0,                 // 新增：当前进度（默认0）
  "answers": []                      // 新增：回答记录（初始为空数组）
}

Response (200):
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "createdAt": "2026-02-28T11:00:00Z"
  }
}
```

**B 端处理逻辑**：
- `userId` 映射到 `externalUserId`
- `status` 默认为 `COMPLETED`，可指定为 `IN_PROGRESS`（进行中面试）
- `outline`、`currentIndex`、`answers` 用于断点恢复

#### 查询面试列表 ✅ 已完成（v1.8 新增）
```
GET /api/open/interviews?userId={userId}&status={status}

Query Parameters:
  - userId: string (C端用户ID，必填)
  - status: string (可选，PREPARING/IN_PROGRESS/COMPLETED)

用途: 断点恢复 - 查询用户未完成的面试

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "interview_xxx",
      "status": "IN_PROGRESS",
      "outline": [...],
      "currentIndex": 2,
      "answers": [...],
      "createdAt": "2026-02-28T11:00:00Z"
    }
  ]
}
```

#### 更新面试进度 ✅ 已完成（v1.8 新增）
```
PATCH /api/open/interviews/{id}

Request Body:
{
  "currentIndex": 1,                 // 更新当前进度（第几题）
  "answers": [                       // 更新回答记录数组
    {
      "questionIndex": 0,
      "question": "请介绍一下你自己",
      "answer": "我是一名Java开发工程师...",
      "audioUrl": "https://xxx.com/audio/q1.mp3",
      "timestamp": "2026-02-28T11:05:00Z"
    }
  ]
}

Request Body (完成面试):
{
  "status": "COMPLETED",             // 更新状态为完成
  "totalScore": 78,                  // 保存评估结果
  "dimensions": [...],
  "highlights": [...],
  "improvements": [...],
  "suggestions": "整体表现良好"
}

Response (200):
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "currentIndex": 1,
    "answers": [...],
    "status": "IN_PROGRESS",
    "updatedAt": "2026-02-28T11:05:00Z"
  }
}
```

#### 获取面试详情 ✅ 已完成（v1.8 更新）
```
GET /api/open/interviews/{id}

Path Parameters:
  - id: string (面试记录ID)

Response (200):
{
  "success": true,
  "data": {
    "id": "interview_xxx",
    "job": {
      "id": "job_xxx",
      "title": "Java开发工程师",
      "company": "武汉某科技公司"
    },
    // 面试内容（用于断点恢复）
    "outline": [...],
    "currentIndex": 2,
    "answers": [...],
    // 评估结果
    "totalScore": 78,
    "dimensions": [...],
    "highlights": [...],
    "improvements": [...],
    "suggestions": "...",
    "audioUrl": "https://xxx.com/audio/interview_xxx.mp3",
    "duration": 1800,
    "status": "COMPLETED",
    "createdAt": "2026-02-28T11:00:00Z",
    "completedAt": "2026-02-28T11:30:00Z"
  }
}
```

**断点恢复流程**：
1. **创建面试**: 调用 `POST /api/open/interviews`，设置 `status: IN_PROGRESS`，传入 `outline`
2. **保存进度**: 每回答一题，调用 `PATCH /api/open/interviews/{id}` 更新 `currentIndex` 和 `answers`
3. **恢复面试**: 调用 `GET /api/open/interviews?userId=xxx&status=IN_PROGRESS` 查询未完成的面试
4. **完成面试**: 调用 `PATCH /api/open/interviews/{id}` 更新 `status: COMPLETED` 并保存评估结果

---

### 3.4 简历相关 API

> **数据库状态**: ✅ `Resume` 表已存在，需要扩展字段（见下方）

#### Resume 表扩展需求

```prisma
model Resume {
  id             String    @id @default(cuid())
  // ... 现有字段 ...
  name           String?
  phone          String?
  email          String?
  education      Json?     // JSON数组
  experiences    Json?
  projects       Json?
  skills         String[]

  // 新增字段（C端需求）
  resumeText     String?   // 新增：原始简历文本，用于AI分析
  externalUserId String?   // 新增：关联C端用户（豆包user_id）

  @@index([externalUserId])  // 新增索引，方便查询用户历史简历
  @@map("resumes")
}
```

#### 字段说明

| 字段 | 类型 | 说明 | 用途 |
|-----|------|------|------|
| `resumeText` | String? | 原始简历文本（PDF解析后） | AI面试分析、简历评估、全文搜索 |
| `externalUserId` | String? | C端用户ID（豆包user_id） | 关联C端用户，查询历史简历 |

#### 为什么需要 resumeText？

- C端需要原始文本进行AI分析（面试评估、改进建议）
- 企业端需要结构化字段进行筛选（"本科以上"、"3年经验"）
- 两者互补，不冲突

#### 保存/更新简历 ✅ 已完成
```
POST /api/open/resumes

Request Body:
{
  "userId": "user_xxx",
  "resumeText": "姓名：张三\n电话：13800138000\n教育背景：武汉大学...", // 解析后的简历文本
  "structuredData": {  // 结构化简历数据（可选）
    "name": "张三",
    "phone": "13800138000",
    "email": "zhangsan@example.com",
    "education": [...],
    "experiences": [...],
    "skills": ["Java", "Spring", "MySQL"]
  },
  "fileId": "coze_file_xxx" // Coze文件ID（可选，B端可忽略）
}

Response (200):
{
  "success": true,
  "data": {
    "id": "resume_xxx",
    "userId": "user_xxx",
    "createdAt": "2026-02-28T12:00:00Z"
  }
}
```

**B 端处理逻辑**：
- `userId` 映射到 `externalUserId`
- `resumeText` 直接存储到 `resumeText` 字段
- `structuredData` 拆分存储到各个字段：
  - `structuredData.name` → `name`
  - `structuredData.phone` → `phone`
  - `structuredData.email` → `email`
  - `structuredData.education` → `education` (JSON)
  - `structuredData.experiences` → `experiences` (JSON)
  - `structuredData.skills` → `skills` (String[])
- `fileId` 可选，B 端可忽略此字段

#### 获取用户简历 ✅ 已完成
```
GET /api/open/resumes/{userId}

Path Parameters:
  - userId: string (C端用户ID)

Response (200):
{
  "success": true,
  "data": {
    "id": "resume_xxx",
    "resumeText": "完整简历内容...",
    "structuredData": {
      "name": "张三",
      "phone": "13800138000",
      ...
    },
    "updatedAt": "2026-02-28T12:00:00Z"
  }
}
```

**B 端处理逻辑**：
- 从数据库读取分散字段
- 组装成 `structuredData` 格式返回
- `structuredData` 从各字段组装：
  - `name` ← `resume.name`
  - `phone` ← `resume.phone`
  - `email` ← `resume.email`
  - `education` ← `resume.education`
  - `experiences` ← `resume.experiences`
  - `skills` ← `resume.skills`

**Response (404)**: 用户未上传简历
```json
{
  "success": false,
  "error": "简历不存在"
}
```

---

### 3.5 政策相关 API

> **数据库状态**: ✅ `Policy` 表已存在，字段：title, type, content, summary, conditions, benefits, effectiveDate

#### 获取政策列表 ✅ 已完成
```
GET /api/open/policies

Query Parameters:
  - category: string (可选，政策分类：人才引进/创业扶持/住房保障/就业补贴）
  - limit: number (可选，默认10)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "policy_xxx",
      "title": "武汉高校毕业生住房补贴政策",
      "category": "住房保障",
      "summary": "对符合条件的毕业生提供租房补贴...",
      "content": "完整政策内容...",
      "effectiveDate": "2026-01-01",
      "source": "武汉市人社局"
    }
  ]
}
```

---

### 3.6 会话管理 API（P1，用户数据持久化）

> **数据库状态**: ✅ `Conversation` 表已创建

#### 保存会话数据 ✅ 已完成
```
POST /api/open/conversations

Request Body:
{
  "userId": "user_xxx",
  "conversationId": "conv_xxx", // Coze会话ID
  "title": "面试Java开发岗",  // 会话标题（自动生成）
  "status": "active",  // active | finished | interrupted
  "sessionData": {
    "type": "interview",  // interview | counseling | general
    "jobId": "job_xxx",   // 关联岗位ID（面试类型）
    "messages": [         // 对话记录
      {"role": "user", "content": "我想面试Java岗位"},
      {"role": "assistant", "content": "好的，请问你想面试哪个公司？"}
    ],
    "workflowStatus": {   // 工作流状态（面试类型）
      "currentStep": "voice_interview",
      "completedQuestions": [1, 2, 3],
      "currentQuestion": 4
    }
  }
}

Response (200):
{
  "success": true,
  "data": {
    "id": "db_conv_xxx",
    "createdAt": "2026-02-28T13:00:00Z"
  }
}
```

#### 更新会话数据 ✅ 已完成
```
PUT /api/open/conversations/{id}

Request Body: 同 POST /api/open/conversations

Response (200):
{
  "success": true,
  "data": {
    "id": "db_conv_xxx",
    "updatedAt": "2026-02-28T13:30:00Z"
  }
}
```

#### 获取用户会话列表 ✅ 已完成
```
GET /api/open/conversations/user/{userId}

Path Parameters:
  - userId: string (C端用户ID)

Response (200):
{
  "success": true,
  "data": [
    {
      "id": "db_conv_xxx",
      "conversationId": "conv_xxx",
      "title": "面试Java开发岗",
      "status": "interrupted",
      "type": "interview",
      "createdAt": "2026-02-28T13:00:00Z",
      "updatedAt": "2026-02-28T13:30:00Z"
    }
  ]
}
```

#### 获取会话详情 ✅ 已完成
```
GET /api/open/conversations/{id}?userId={userId}

Path Parameters:
  - id: string (数据库会话ID)
  - userId: string (C端用户ID，用于权限校验)

Response (200):
{
  "success": true,
  "data": {
    "id": "db_conv_xxx",
    "conversationId": "conv_xxx",
    "title": "面试Java开发岗",
    "status": "interrupted",
    "sessionData": {
      "type": "interview",
      "jobId": "job_xxx",
      "messages": [...],
      "workflowStatus": {...}
    },
    "createdAt": "2026-02-28T13:00:00Z",
    "updatedAt": "2026-02-28T13:30:00Z"
  }
}
```

---

## 四、数据库表需求（P0）

### 4.1 conversations 表（会话管理）✅ 已创建

> **设计确认** ✅ 2026-02-28 与 B 端团队确认

#### Prisma 模型定义

```prisma
model Conversation {
  id                   String    @id @default(cuid())
  externalUserId       String    // 豆包用户ID（conversation.user_id），不关联User表
  cozeConversationId   String    @unique  // Coze会话ID，唯一索引
  title                String?
  status               String    @default("active")  // active | finished | interrupted
  type                 String?   // interview | counseling | general | resume_parsing | job_matching
  sessionData          Json?     // 完整会话数据（见下方结构）
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([externalUserId])
  @@index([cozeConversationId])
  @@map("conversations")
}
```

#### sessionData JSON 结构（已确认）

```json
{
  "messages": [
    {"role": "user", "content": "我想面试Java岗位"},
    {"role": "assistant", "content": "好的，请问你想面试哪个公司？"}
  ],
  "workflowStatus": {
    "currentStep": "voice_interview",
    "completedQuestions": [1, 2, 3],
    "currentQuestion": 4
  },
  "jobId": "job_xxx",  // 面试类型时关联的岗位ID
  "type": "interview"  // 与顶层 type 字段保持一致
}
```

#### type 枚举值（已确认）

| 值 | 说明 | 优先级 |
|----|------|-------|
| `interview` | AI 面试 | P0 核心值 |
| `counseling` | 心理咨询/职业辅导 | P0 核心值 |
| `general` | 通用对话 | P0 核心值 |
| `resume_parsing` | 简历解析 | P1 扩展值 |
| `job_matching` | 岗位匹配 | P1 扩展值 |

#### SQL 创建语句（PostgreSQL）

```sql
CREATE TABLE conversations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id    VARCHAR(255) NOT NULL,
  coze_conversation_id VARCHAR(255) NOT NULL UNIQUE,
  title               VARCHAR(500),
  status              VARCHAR(50) DEFAULT 'active',
  type                VARCHAR(50),
  session_data        JSONB,
  created_at          TIMESTAMP DEFAULT NOW(),
  updated_at          TIMESTAMP DEFAULT NOW(),

  INDEX idx_external_user_id (external_user_id),
  INDEX idx_coze_conversation_id (coze_conversation_id)
);
```

#### 关键设计决策

| 决策点 | 方案 | 理由 |
|-------|------|------|
| 用户ID命名 | `externalUserId` | 明确表示这是外部用户ID，区别于 B 端 User.id |
| 是否关联 User 表 | **不关联** | C 端（豆包）用户不应强制注册 B 端账号 |
| 会话ID命名 | `cozeConversationId` | 明确来源是 Coze 平台 |

### 4.2 emotion_records 表（情绪记录，P2）✅ 已存在

> **Prisma 模型**: `EmotionRecord`
> **字段**: id, userId, emotion, score, content, tags[], createdAt
> **注意**: 当前字段为 `content` 而非 `summary`，C 端调用时需适配

```sql
CREATE TABLE emotion_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  emotion VARCHAR(50),                     -- anxious/stressed/hopeful/frustrated
  score INTEGER,                           -- 情绪评分 1-10
  summary TEXT,                            -- 情绪摘要
  conversation_id VARCHAR(255),            -- 关联会话ID
  created_at TIMESTAMP DEFAULT NOW(),

  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

---

## 五、认证与安全需求（P0）

### 5.1 API 认证方式 ✅ 已实现

> **当前实现**: 使用 `X-API-Key` Header 认证
> **代码位置**: `web/src/app/api/open/jobs/route.ts`

```
所有 /api/open/* 接口使用 API Key 认证：

Headers:
  X-API-Key: {OPEN_API_KEY}

环境变量：
  OPEN_API_KEY=your_api_key_here

注意：当前使用 X-API-Key 而非 Authorization Bearer，C 端需适配
```

### 5.2 CORS 配置

```
允许跨域请求来源：
- https://www.coze.cn
- https://www.doubao.com

允许的方法：
- GET, POST, PUT, DELETE
```

---

## 六、环境配置需求（P0）

### 6.1 环境变量

B 端需要配置以下环境变量供 C 端调用：

| 变量名 | 说明 | 示例值 | 必填 |
|-------|------|-------|-----|
| `OPEN_API_KEY` | C 端 API 调用密钥 | `wehan_open_2026xxx` | ✅ |
| `DATABASE_URL` | 数据库连接字符串 | `postgresql://...` | ✅ |
| `NEXTAUTH_URL` | 应用 URL | `https://wehan.com` | ✅ |
| `NEXTAUTH_SECRET` | NextAuth 密钥 | `random_secret_key` | ✅ |

### 6.2 测试环境

| 环境 | 基础 URL | 说明 |
|-----|---------|-----|
| 开发环境 | `http://localhost:3000/api/open` | 本地开发 |
| 测试环境 | `https://test.wehan.com/api/open` | 联调测试 |
| 生产环境 | `https://api.wehan.com/api/open` | 正式上线 |

---

## 七、交付时间节点

### 阶段 1：最小可用版本（MVP）

| 任务 | 优先级 | 状态 | 备注 |
|-----|-------|------|------|
| 数据库表创建（conversations） | P0 | ✅ 已完成 | |
| 岗位 API（/api/open/jobs） | P0 | ✅ 已完成 | GET 列表已实现 |
| 岗位详情 API（/api/open/jobs/{id}） | P0 | ✅ 已完成 | responsibilities<-description |
| 面试报告 API（/api/open/interviews） | P0 | ✅ 已完成 | POST/GET 均已实现 |
| 简历 API（/api/open/resumes） | P0 | ✅ 已完成 | POST/GET 均已实现 |
| 投递 API（/api/open/applications） | P1 | ✅ 已完成 | POST/GET 均已实现 |
| 环境变量配置（OPEN_API_KEY） | P0 | ✅ 已配置 | 开发环境可跳过验证 |

### 阶段 2：完整功能

| 任务 | 优先级 | 状态 | 备注 |
|-----|-------|------|------|
| 会话管理 API（/api/open/conversations） | P1 | ✅ 已完成 | CRUD 全部实现 |
| 政策 API（/api/open/policies） | P2 | ✅ 已完成 | 支持分类筛选 |
| 情绪记录表（emotion_records） | P2 | ✅ 已存在 | Prisma: EmotionRecord |

---

## 八、联调测试清单

### 8.1 C-B 端联调测试用例

| 测试项 | 测试内容 | 预期结果 |
|-------|---------|---------|
| 岗位搜索 | C 端调用 GET /api/open/jobs | 返回武汉地区岗位列表 |
| 岗位详情 | C 端调用 GET /api/open/jobs/{id} | 返回完整JD |
| 保存面试报告 | C 端提交面试数据 | 数据成功写入 interviews 表 |
| 简历存储 | C 端上传简历解析结果 | 数据成功写入 resumes 表 |
| 投递功能 | C 端提交投递 | 数据成功写入 applications 表 |
| 会话恢复 | C 端保存/获取会话 | conversations 表读写正常 |

### 8.2 性能要求

| 指标 | 目标值 | 测试方法 |
|-----|-------|---------|
| API 响应时间 | < 200ms | Postman 测试 |
| 并发支持 | 100 QPS | 压力测试 |
| 数据库查询 | < 50ms | EXPLAIN ANALYZE |

---

## 九、常见问题 FAQ

### Q1：C 端的 user_id 从哪里来？
**A**：C 端使用豆包/扣子的用户 ID（`conversation.user_id`），B 端需要接受这个外部 ID 作为用户标识。

**格式示例**：`7456948346762879000_7456948346762879000`（豆包生成的字符串ID）

### Q2：C 端用户是否需要在 B 端注册账号？
**A**：**不需要**

| 体系 | 用户群体 | 账号系统 | 关联方式 |
|-----|---------|---------|---------|
| C 端 | 毕业生/求职者 | 豆包账号 | 通过 `externalUserId` 标识 |
| B 端 | 企业/学校/政府 | NextAuth | 通过 `User.id` 标识 |

**关键决策**：C 端用户不应强制注册 B 端账号，通过 `externalUserId` 字段进行数据关联即可。

### Q3：C 端会话 ID 和 Coze 会话 ID 的关系？
**A**：
- Coze 会话 ID（`cozeConversationId`）：扣子平台生成的会话标识
- 数据库会话 ID（`id`）：B 端数据库中的 UUID/cuid 主键
- 需要同时存储两者，通过 `cozeConversationId` 字段关联

### Q4：面试报告的 audioUrl 怎么处理？
**A**：
- 音频文件由扣子平台/火山引擎存储
- B 端只存储 URL 字符串
- 如果 C 端没有录音功能，此字段可为空

### Q5：API 返回格式统一要求？
**A**：所有接口统一使用以下格式：
```json
// 成功
{ "success": true, "data": {...} }

// 失败
{ "success": false, "error": "错误信息", "code": "ERROR_CODE" }
```

### Q6：Resume 表为什么同时需要 resumeText 和结构化字段？
**A**：两者用途不同，互补使用

| 字段类型 | 用途 | 使用场景 |
|---------|------|---------|
| `resumeText` | 存储原始简历文本 | AI分析、全文搜索、展示给用户 |
| 结构化字段 | 存储解析后的数据 | 企业筛选、导出报表、数据统计 |

**示例**：
- C 端面试：需要 `resumeText` 进行 AI 分析
- B 端筛选：需要 `education` 字段筛选"本科以上"

### Q7：C 端发送的 userId 和数据库的 externalUserId 是什么关系？
**A**：字段映射关系

| C 端请求字段 | B 端数据库字段 | 处理方式 |
|-------------|--------------|---------|
| `userId` | `externalUserId` | B 端 API 接收 `userId`，映射到 `externalUserId` 存储 |

**实现位置**：B 端 API 层
**C 端无需改动**：始终发送 `userId` 即可

### Q8：岗位详情的 responsibilities 字段从哪里获取？
**A**：从数据库的 `description` 字段获取

| C 端期望 | B 端数据库 |
|---------|-----------|
| `responsibilities` | `description` |
| `requirements` | `requirements` |

### Q9：保存面试报告时，status 字段如何设置？
**A**：B 端自动设置为 `COMPLETED`

- C 端请求体不包含 `status` 字段
- B 端保存时自动设置 `status = 'COMPLETED'`
- 表示面试已完成，报告已生成

---

## 十一、API 测试结果（v1.7）

> **测试时间**: 2026-02-28
> **测试环境**: 本地开发环境（localhost:3000）
> **测试脚本**: `client/scripts/test_b_api.py`

### 测试总览

| 结果 | 数量 | 占比 |
|-----|------|------|
| ✅ 通过 | 13 | 100% |
| ⚠️ 警告 | 0 | 0% |
| ❌ 失败 | 0 | 0% |

### ✅ 全部 API 已验证通过

| API | 状态 | 验证结果 |
|-----|------|---------|
| GET /api/open/jobs | ✅ | 返回 8 条岗位数据 |
| GET /api/open/jobs/{id} | ✅ | 岗位详情正常 |
| **POST /api/open/applications** | ✅ | **投递提交正常**（v1.7 修复） |
| GET /api/open/applications | ✅ | 投递列表查询正常 |
| POST /api/open/resumes | ✅ | 简历保存成功 |
| GET /api/open/resumes/{userId} | ✅ | 返回 structuredData 和 resumeText |
| POST /api/open/interviews | ✅ | 面试报告保存成功 |
| GET /api/open/interviews/{id} | ✅ | 面试报告详情正常 |
| POST /api/open/conversations | ✅ | 会话创建成功 |
| PUT /api/open/conversations/{id} | ✅ | 会话更新正常 |
| GET /api/open/conversations/user/{userId} | ✅ | 用户会话列表正常 |
| GET /api/open/conversations/{id} | ✅ | 会话详情正常 |
| GET /api/open/policies | ✅ | 返回 4 条政策数据 |

### 🟡 文档说明（非问题）

| 说明 | API | 备注 |
|-----|-----|------|
| **返回字段差异** | GET /api/open/jobs | ~~`company`~~ → 使用 `enterprise.name`（文档已更新） |
| **字段名称变更** | 岗位相关 | `educationLevel`/`experienceYears` 代替 `education`/`experience`（文档已更新） |
| **新增字段** | 岗位相关 | 新增 `category`, `benefits`, `headcount`, `freshGraduate`（文档已更新） |

---

## 十、联系人信息

| 角色 | 姓名 | 负责内容 | 联系方式 |
|-----|------|---------|---------|
| C 端开发 | - | 扣子智能体开发、API 调用 | - |
| B 端开发 | - | API 实现、数据库表创建 | - |
| 产品经理 | - | 需求澄清、验收 | - |

---

## 更新记录

| 版本 | 日期 | 更新内容 | 作者 |
|-----|------|---------|------|
| 1.0 | 2026-02-28 | 初始版本，列出所有 API 和数据库需求 | C 端团队 |
| 1.1 | 2026-02-28 | 数据库设计确认（Conversation、Resume 扩展） | C 端 ↔ B 端 |
| 1.3 | 2026-02-28 | 字段映射确认（userId→externalUserId、responsibilities、structuredData、status） | C 端 ↔ B 端 |
| 1.6 | 2026-02-28 | API 测试与文档修正（岗位字段更新） | C 端 |
| 1.7 | 2026-02-28 | **全部 API 验证通过** - 投递接口已修复 | C 端 ↔ B 端 |
| 1.8 | 2026-02-28 | 面试断点恢复功能 - 新增 currentIndex、answers 字段及 PATCH 接口 | B 端 |

---

*文档版本: 1.8 | 创建时间: 2026-02-28 | 最后更新: 2026-02-28*
