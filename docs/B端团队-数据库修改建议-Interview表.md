# B端数据库修改建议 - Interview 表

> **发起方**: C端开发
> **日期**: 2026-02-28
> **优先级**: P1（阻塞面试工作流开发）
> **状态**: 待确认

---

## 一、修改目的

为支持**面试工作流的断点恢复**功能，需要在 `Interview` 表中添加上下文存储字段。

### 业务场景

```
用户开始面试 → 回答了3道题 → 网络中断/关闭对话
    ↓
用户再次进入 → 从第4题继续（不重新开始）
```

---

## 二、当前表结构

```prisma
model Interview {
  id              String          @id
  userId          String?
  externalUserId  String?
  jobId           String?
  applicationId   String?         @unique
  outline         Json?           // 面试题目
  conversation    Json?           // 对话记录
  duration        Int?
  status          InterviewStatus @default(PREPARING)
  totalScore      Float?
  dimensions      Json?
  highlights      Json?
  improvements    Json?
  suggestions     String?
  audioUrl        String?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime
  completedAt     DateTime?
}
```

---

## 三、建议修改内容

### 3.1 新增字段

| 字段名 | 类型 | 默认值 | 说明 |
|-------|------|-------|------|
| `currentIndex` | Int? | 0 | 当前面试进度（第几题） |
| `answers` | Json? | null | 每道题的回答记录 |

### 3.2 修改后的 Schema

```prisma
model Interview {
  id              String          @id
  userId          String?
  externalUserId  String?         // C端用户ID（豆包user_id）
  jobId           String?
  applicationId   String?         @unique

  // ===== 面试内容 =====
  outline         Json?           // 题目列表
  currentIndex    Int?            @default(0)   // 【新增】当前面试进度
  answers         Json?           // 【新增】回答记录

  // ===== 原始记录 =====
  conversation    Json?           // 原始对话记录
  duration        Int?
  audioUrl        String?

  // ===== 评估结果 =====
  status          InterviewStatus @default(PREPARING)
  totalScore      Float?
  dimensions      Json?           // 维度评分
  highlights      Json?           // 亮点
  improvements    Json?           // 改进建议
  suggestions     String?         // 综合建议

  // ===== 时间戳 =====
  createdAt       DateTime        @default(now())
  updatedAt       DateTime
  completedAt     DateTime?

  // ===== 关联 =====
  Application     Application?    @relation(fields: [applicationId], references: [id])
  User            User?           @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([status])
  @@index([userId])
  @@index([externalUserId])
}
```

---

## 四、JSON 字段结构规范

### 4.1 outline（题目列表）

```json
[
  {
    "id": 1,
    "question": "请简单介绍一下你自己",
    "category": "通用",
    "weight": 10
  },
  {
    "id": 2,
    "question": "描述一个你参与过的项目，你在其中负责什么？",
    "category": "技术",
    "weight": 15
  },
  {
    "id": 3,
    "question": "你如何处理团队中的冲突？",
    "category": "软技能",
    "weight": 10
  }
]
```

### 4.2 answers（回答记录）【新增】

```json
[
  {
    "questionId": 1,
    "question": "请简单介绍一下你自己",
    "answer": "我是张三，毕业于武汉大学计算机专业...",
    "score": 85,
    "feedback": "表达清晰，逻辑性强，建议增加具体项目经验的描述",
    "answeredAt": "2026-02-28T10:30:00Z"
  },
  {
    "questionId": 2,
    "question": "描述一个你参与过的项目...",
    "answer": "我曾参与开发一个电商平台...",
    "score": 78,
    "feedback": "项目描述详细，但技术深度可以加强",
    "answeredAt": "2026-02-28T10:35:00Z"
  }
]
```

### 4.3 currentIndex 使用说明

| 值 | 含义 |
|---|------|
| `0` | 面试刚开始，尚未回答任何题目 |
| `1` | 已回答第1题，正在进行第2题 |
| `n` | 已回答n题，正在进行第n+1题 |
| `null` | 面试已完成或状态异常 |

---

## 五、API 影响

### 5.1 需要修改的 API

| API | 修改内容 |
|-----|---------|
| `POST /api/open/interviews` | 创建时初始化 `currentIndex: 0`, `answers: []` |
| `PATCH /api/open/interviews/{id}` | 支持更新 `currentIndex` 和 `answers` |
| `GET /api/open/interviews?status=IN_PROGRESS` | 查询进行中的面试（断点恢复用） |

### 5.2 断点恢复 API 调用流程

```
1. 用户进入面试
   GET /api/open/interviews?externalUserId=xxx&status=IN_PROGRESS

2. 如果返回有数据（存在未完成面试）
   - 返回 { interview_id, currentIndex: 2, outline: [...], answers: [...] }
   - C端从第3题继续

3. 如果返回空（无进行中面试）
   - 创建新面试
   POST /api/open/interviews
   { externalUserId, jobId, status: "IN_PROGRESS", currentIndex: 0 }

4. 每回答一题后保存
   PATCH /api/open/interviews/{id}
   {
     "currentIndex": 3,
     "answers": [...updatedAnswers]
   }

5. 面试完成
   PATCH /api/open/interviews/{id}
   {
     "status": "COMPLETED",
     "totalScore": 78,
     "dimensions": {...},
     "completedAt": "2026-02-28T11:00:00Z"
   }
```

---

## 六、迁移脚本建议

```sql
-- 添加新字段
ALTER TABLE "Interview" ADD COLUMN "currentIndex" INTEGER DEFAULT 0;
ALTER TABLE "Interview" ADD COLUMN "answers" JSONB;

-- 为已有记录初始化默认值
UPDATE "Interview" SET "currentIndex" = 0 WHERE "currentIndex" IS NULL;
UPDATE "Interview" SET "answers" = '[]'::jsonb WHERE "answers" IS NULL;
```

---

## 七、确认事项

请 B端 确认以下内容：

| 序号 | 确认项 | 状态 |
|-----|-------|------|
| 1 | 是否同意添加 `currentIndex` 字段？ | ⏳ 待确认 |
| 2 | 是否同意添加 `answers` 字段？ | ⏳ 待确认 |
| 3 | JSON 字段结构是否满足需求？ | ⏳ 待确认 |
| 4 | 预计何时完成数据库迁移？ | ⏳ 待确认 |

---

## 八、联系信息

- **C端负责人**: Claude Code
- **文档位置**: `docs/B端团队-数据库修改建议-Interview表.md`
- **相关文档**: `codemaps/data-models.md`

---

*文档版本: 1.0 | 创建时间: 2026-02-28*
