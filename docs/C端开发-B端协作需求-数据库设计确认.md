# C 端开发 - B 端协作需求：数据库设计确认

> 本文档是对《C端开发-B端协作需求.md》的补充，详细记录了 2026-02-28 与 B 端团队确认的数据库设计决策

**确认时间**: 2026-02-28
**确认方**: C 端开发团队 ↔ B 端开发团队
**状态**: ✅ 已确认，可开始实施

---

## 一、核心决策确认

### 1. 用户身份映射策略

| 决策点 | 确认方案 | 理由 |
|-------|---------|------|
| **C 端用户是否需要注册 B 端账号** | ❌ 不需要 | C 端（豆包）与 B 端（企业/学校）用户群体完全不同 |
| **用户 ID 字段命名** | `externalUserId` | 明确表示这是外部 ID，区别于 B 端 User.id |
| **是否关联 User 表** | ❌ 不强制关联 | 通过 `externalUserId` 进行数据关联即可 |

### 2. Resume 表字段设计

| 决策点 | 确认方案 | 理由 |
|-------|---------|------|
| **是否需要原始文本** | ✅ 需要 `resumeText` 字段 | C 端 AI 分析需要原始文本 |
| **是否需要结构化字段** | ✅ 保留现有字段 | B 端企业筛选需要结构化数据 |
| **两者是否冲突** | ❌ 不冲突，互补使用 | 不同场景使用不同字段 |

---

## 二、最终数据库模型（Prisma）

### 2.1 Conversation 模型（新增）

```prisma
model Conversation {
  id                   String    @id @default(cuid())
  externalUserId       String    // 豆包用户ID（conversation.user_id）
  cozeConversationId   String    @unique
  title                String?
  status               String    @default("active")
  type                 String?   // interview | counseling | general | resume_parsing | job_matching
  sessionData          Json?     // 见下方结构
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  @@index([externalUserId])
  @@index([cozeConversationId])
  @@map("conversations")
}
```

### 2.2 Resume 模型（扩展）

```prisma
model Resume {
  id             String    @id @default(cuid())
  userId         String?   // B端用户ID（企业账号），可选

  // 现有字段
  name           String?
  phone          String?
  email          String?
  education      Json?
  experiences    Json?
  projects       Json?
  skills         String[]

  // 新增字段（C端需求）
  resumeText     String?   // 新增：原始简历文本
  externalUserId String?   // 新增：C端用户ID（豆包user_id）

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([userId])
  @@index([externalUserId])  // 新增索引
  @@map("resumes")
}
```

---

## 三、sessionData JSON 结构（已确认）

```json
{
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ],
  "workflowStatus": {
    "currentStep": "voice_interview",
    "completedQuestions": [1, 2, 3],
    "currentQuestion": 4
  },
  "jobId": "job_xxx",
  "type": "interview"
}
```

---

## 四、type 枚举值（已确认）

| 枚举值 | 说明 | 优先级 | 使用场景 |
|-------|------|-------|---------|
| `interview` | AI 面试 | P0 核心值 | 面试工作流 |
| `counseling` | 心理咨询/职业辅导 | P0 核心值 | 心理疏导技能 |
| `general` | 通用对话 | P0 核心值 | 默认对话类型 |
| `resume_parsing` | 简历解析 | P1 扩展值 | 简历解析功能 |
| `job_matching` | 岗位匹配 | P1 扩展值 | 岗位推荐功能 |

---

## 五、实施清单

### 5.1 Prisma Schema 更新

```bash
# 文件位置: web/prisma/schema.prisma

# 1. 添加 Conversation 模型
# 2. 扩展 Resume 模型（添加 resumeText、externalUserId、索引）

# 执行迁移
npx prisma db push
npx prisma generate
```

### 5.2 SQL 创建语句（PostgreSQL）

```sql
-- 创建 conversations 表
CREATE TABLE conversations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_user_id     VARCHAR(255) NOT NULL,
  coze_conversation_id VARCHAR(255) NOT NULL UNIQUE,
  title                VARCHAR(500),
  status               VARCHAR(50) DEFAULT 'active',
  type                 VARCHAR(50),
  session_data         JSONB,
  created_at           TIMESTAMP DEFAULT NOW(),
  updated_at           TIMESTAMP DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_conversations_external_user_id ON conversations(external_user_id);
CREATE INDEX idx_conversations_coze_conversation_id ON conversations(coze_conversation_id);

-- 扩展 resumes 表
ALTER TABLE resumes ADD COLUMN resume_text TEXT;
ALTER TABLE resumes ADD COLUMN external_user_id VARCHAR(255);
CREATE INDEX idx_resumes_external_user_id ON resumes(external_user_id);
```

### 5.3 API 实现优先级

| API 路由 | 优先级 | 依赖表 | 状态 |
|---------|-------|-------|------|
| POST /api/open/conversations | P1 | conversations | ❌ 待实现 |
| PUT /api/open/conversations/{id} | P1 | conversations | ❌ 待实现 |
| GET /api/open/conversations/user/{userId} | P1 | conversations | ❌ 待实现 |
| GET /api/open/conversations/{id} | P1 | conversations | ❌ 待实现 |
| POST /api/open/resumes | P0 | resumes | ❌ 待实现（需扩展字段） |
| GET /api/open/resumes/{userId} | P0 | resumes | ❌ 待实现（需扩展字段） |

---

## 六、测试用例

### 6.1 Conversation 表测试

```bash
# 测试1：创建会话
curl -X POST http://localhost:3000/api/open/conversations \
  -H "X-API-Key: test_key" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "7456948346762879000_7456948346762879000",
    "conversationId": "coze_conv_xxx",
    "title": "面试Java开发岗",
    "status": "active",
    "sessionData": {
      "type": "interview",
      "messages": [],
      "workflowStatus": {"currentStep": "voice_interview"}
    }
  }'

# 预期结果：返回 201，包含数据库会话ID
```

### 6.2 Resume 表测试

```bash
# 测试2：保存简历（包含原始文本）
curl -X POST http://localhost:3000/api/open/resumes \
  -H "X-API-Key: test_key" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "7456948346762879000_7456948346762879000",
    "resumeText": "姓名：张三\n电话：13800138000\n教育背景：武汉大学...",
    "structuredData": {
      "name": "张三",
      "phone": "13800138000",
      "education": [...]
    }
  }'

# 预期结果：返回 201，resumeText 和 externalUserId 已存储
```

---

## 七、常见问题解答

### Q1：为什么 externalUserId 不加外键约束？
**A**：C 端用户 ID 是动态生成的字符串，与 B 端 User 表无关，不需要外键约束。

### Q2：如果后续需要用户关联怎么办？
**A**：可以通过 `externalUserId` 进行匹配查询，不需要强制创建 B 端用户。

### Q3：resumeText 字段会不会太大？
**A**：简历文本通常在 2-5KB，PostgreSQL TEXT 类型无存储上限，不会造成问题。

### Q4：sessionData 中的 messages 会无限增长吗？
**A**：建议限制最大条数（如 100 条），超出后只保留最近的消息。

---

## 八、联系方式

| 角色 | 负责内容 | 联系方式 |
|-----|---------|---------|
| C 端开发 | 扣子智能体、API 调用 | - |
| B 端开发 | 数据库实现、API 开发 | - |

---

*确认时间: 2026-02-28 | 版本: 1.0*
