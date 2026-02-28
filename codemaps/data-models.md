# 数据模型设计 - WeHan 平台

> PostgreSQL + Prisma ORM 数据模型设计

**更新时间**: 2026-02-28

---

## 一、ER 图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              WeHan 数据模型                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐              │
│  │    User     │       │ Enterprise  │       │   School    │              │
│  │─────────────│       │─────────────│       │─────────────│              │
│  │ id          │       │ id          │       │ id          │              │
│  │ email       │       │ name        │       │ name        │              │
│  │ role        │──────►│ industry    │       │ type        │              │
│  │ status      │       │ scale       │       │ level       │              │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘              │
│         │                     │                     │                      │
│         │                     │                     │                      │
│         ▼                     ▼                     │                      │
│  ┌─────────────┐       ┌─────────────┐             │                      │
│  │   Resume    │       │    Job      │◄────────────┘                      │
│  │─────────────│       │─────────────│       ┌─────────────┐              │
│  │ userId (FK) │       │ enterpriseId│       │JobPushRecord│              │
│  │ education   │       │ title       │       │─────────────│              │
│  │ experiences │       │ status      │       │ jobId (FK)  │              │
│  │ profile     │       │ skills[]    │       │ schoolId(FK)│              │
│  └─────────────┘       └──────┬──────┘       └─────────────┘              │
│                               │                                            │
│                               │                                            │
│         ┌─────────────────────┼─────────────────────┐                      │
│         │                     │                     │                      │
│         ▼                     ▼                     ▼                      │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐              │
│  │ Application │       │  Interview  │       │   Policy    │              │
│  │─────────────│       │─────────────│       │─────────────│              │
│  │ userId (FK) │       │ userId (FK) │       │ title       │              │
│  │ jobId (FK)  │       │ applicationId│      │ type        │              │
│  │ status      │       │ totalScore  │       │ content     │              │
│  │ matchScore  │       │ dimensions  │       │ isActive    │              │
│  └──────┬──────┘       │ audioUrl    │       └─────────────┘              │
│         │              └─────────────┘                                    │
│         │                     ▲                                           │
│         └─────────────────────┘                                           │
│                               │                                           │
│  ┌─────────────┐       ┌──────┴──────┐       ┌─────────────┐              │
│  │EmotionRecord│       │ Statistics  │       │PortalConfig │              │
│  │─────────────│       │─────────────│       │─────────────│              │
│  │ userId (FK) │       │ date        │       │ key         │              │
│  │ emotion     │       │ type        │       │ value (JSON)│              │
│  │ score       │       │ value       │       └─────────────┘              │
│  └─────────────┘       └─────────────┘                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、核心模型

### 2.1 User (用户)

```prisma
model User {
  id            String      @id @default(cuid())
  email         String      @unique
  phone         String?     @unique
  password      String      // bcrypt 加密
  name          String
  avatar        String?
  role          UserRole    // STUDENT | ENTERPRISE | SCHOOL | GOVERNMENT | ADMIN
  status        UserStatus  @default(PENDING) // ACTIVE | INACTIVE | PENDING | REJECTED

  // 学生特有
  schoolId      String?     // 所属学校 ID
  major         String?     // 专业
  graduationYear Int?       // 毕业年份

  // 企业特有
  enterpriseId  String?     // 所属企业 ID

  // 学校管理员特有
  schoolManagedId String?   // 管理的学校 ID

  // 时间戳
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  lastLoginAt   DateTime?

  // 关联
  resume        Resume?
  enterprise    Enterprise?  @relation(fields: [enterpriseId], references: [id])
  schoolManaged School?      @relation(fields: [schoolManagedId], references: [id])
  applications  Application[]
  interviews    Interview[]
  emotionRecords EmotionRecord[]

  @@index([role])
  @@index([status])
}
```

**字段说明**:

| 字段 | 类型 | 说明 | 必填 |
|-----|------|-----|-----|
| email | String | 登录邮箱，唯一 | ✅ |
| phone | String | 手机号，唯一 | ❌ |
| password | String | bcrypt 加密密码 | ✅ |
| role | Enum | 用户角色 | ✅ |
| status | Enum | 账号状态 | ✅ |

**角色权限**:

| 角色 | 说明 | 可访问门户 |
|-----|------|----------|
| STUDENT | 学生用户 | C 端 |
| ENTERPRISE | 企业用户 | 企业门户 |
| SCHOOL | 学校管理员 | 学校门户 |
| GOVERNMENT | 政府用户 | 政府门户 |
| ADMIN | 系统管理员 | 管理员后台 |

---

### 2.2 Enterprise (企业)

```prisma
model Enterprise {
  id              String      @id @default(cuid())
  name            String
  logo            String?
  industry        String      // 行业
  scale           String      // 规模: 0-50, 50-200, 200-500, 500-1000, 1000+
  description     String?
  address         String?
  contactName     String?
  contactPhone    String?
  contactEmail    String?
  businessLicense String?     // 营业执照 URL
  verified        Boolean     @default(false)  // 是否认证

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  users           User[]
  jobs            Job[]

  @@index([industry])
  @@index([verified])
}
```

**规模枚举值**:
- `0-50`: 50人以下
- `50-200`: 50-200人
- `200-500`: 200-500人
- `500-1000`: 500-1000人
- `1000+`: 1000人以上

---

### 2.3 Job (岗位)

```prisma
model Job {
  id              String      @id @default(cuid())
  title           String
  enterpriseId    String
  industry        String?
  category        String?     // 岗位类别
  salaryMin       Int?        // 最低薪资(元/月)
  salaryMax       Int?        // 最高薪资(元/月)
  location        String?     // 工作地点
  address         String?     // 详细地址
  description     String      @db.Text  // 岗位描述
  requirements    String?     @db.Text  // 任职要求
  benefits        String?     @db.Text  // 福利待遇
  skills          String[]    // 技能要求
  educationLevel  String?     // 学历要求
  experienceYears Int?        // 经验要求(年)
  freshGraduate   Boolean     @default(true)  // 接受应届生
  headcount       Int         @default(1)     // 招聘人数
  status          JobStatus   @default(DRAFT) // DRAFT | PUBLISHED | CLOSED | ARCHIVED

  // 自定义面试问题 (JSON)
  interviewQuestions String?  @db.Text

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  publishedAt     DateTime?

  enterprise      Enterprise  @relation(fields: [enterpriseId], references: [id], onDelete: Cascade)
  applications    Application[]
  jobPushRecords  JobPushRecord[]

  @@index([enterpriseId])
  @@index([status])
  @@index([industry])
  @@index([location])
}
```

**状态流转**:

```
DRAFT ──发布──► PUBLISHED ──下架──► CLOSED
  │                │                  │
  └────────────────┴──────────────────┴──► ARCHIVED
```

---

### 2.4 Resume (简历)

```prisma
model Resume {
  id              String      @id @default(cuid())
  userId          String      @unique
  originalUrl     String?     // 原始简历文件 URL

  // AI 解析后的结构化数据
  name            String?
  phone           String?
  email           String?
  education       Json?       // Education[]
  experiences     Json?       // Experience[]
  projects        Json?       // Project[]
  skills          String[]
  certifications  Json?       // Certification[]
  awards          Json?       // Award[]

  // AI 生成的人才画像
  profile         Json?       // UserProfile

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Education 结构**:
```typescript
interface Education {
  school: string
  major: string
  degree: string      // 本科/硕士/博士
  startDate: string
  endDate?: string
  gpa?: string
}
```

**Experience 结构**:
```typescript
interface Experience {
  company: string
  position: string
  startDate: string
  endDate?: string
  description?: string
}
```

**UserProfile 结构**:
```typescript
interface UserProfile {
  summary: string       // 个人总结
  strengths: string[]   // 优势
  interests: string[]   // 兴趣
  careerGoals?: string  // 职业目标
}
```

---

### 2.5 Application (投递)

```prisma
model Application {
  id              String          @id @default(cuid())
  userId          String
  jobId           String
  resumeId        String?
  interviewId     String?         @unique

  matchScore      Float?          // 匹配度评分 0-100
  status          ApplicationStatus @default(PENDING)
  notes           String?         @db.Text  // 企业备注

  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  viewedAt        DateTime?       // 企业查看时间

  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  job             Job             @relation(fields: [jobId], references: [id], onDelete: Cascade)
  interview       Interview?

  @@unique([userId, jobId])  // 每个用户对每个岗位只能投递一次
  @@index([status])
  @@index([createdAt])
}
```

**状态流转**:

```
PENDING ──查看──► VIEWED ──安排面试──► INTERVIEWING ──录用──► OFFERED
                     │                                        │
                     └────────────拒绝────────────────────────┘ REJECTED
                                          │
                                          ▼
学生撤回 ────────────────────────────► WITHDRAWN
```

---

### 2.6 Interview (面试)

```prisma
model Interview {
  id              String          @id @default(cuid())
  userId          String?
  externalUserId  String?         // C端用户ID（豆包user_id）
  jobId           String?
  applicationId   String?         @unique

  // ===== 面试内容 =====
  outline         Json?           // 题目列表 InterviewQuestion[]
  currentIndex    Int?            @default(0)   // 当前面试进度（第几题，用于断点恢复）
  answers         Json?                       // 回答记录数组 InterviewAnswer[]

  // ===== 面试过程 =====
  conversation    Json?           // ConversationMessage[]
  duration        Int?            // 面试时长(秒)

  // ===== 评估报告 =====
  status          InterviewStatus @default(PREPARING)
  totalScore      Float?          // 综合评分 0-100
  dimensions      Json?           // ScoreDimension[]
  highlights      Json?           // Highlight[]
  improvements    Json?           // Improvement[]
  suggestions     String?         @db.Text

  // ===== 语音文件 =====
  audioUrl        String?

  // ===== 时间戳 =====
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  completedAt     DateTime?

  // ===== 关联 =====
  user            User?           @relation(fields: [userId], references: [id], onDelete: Cascade)
  application     Application?    @relation(fields: [applicationId], references: [id])

  @@index([status])
  @@index([userId])
  @@index([externalUserId])
}
```

**InterviewQuestion 结构**:
```typescript
interface InterviewQuestion {
  id: string
  category: string      // 专业/行为/情景
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
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

**ScoreDimension 结构**:
```typescript
interface ScoreDimension {
  name: string          // 专业知识/表达能力/逻辑思维
  score: number
  maxScore: number
  comment?: string
}
```

**断点恢复流程**:

1. **创建面试**: `POST /api/open/interviews` 设置 `status: IN_PROGRESS`，初始化 `outline`、`currentIndex: 0`、`answers: []`
2. **保存进度**: 每回答一题，调用 `PATCH /api/open/interviews/{id}` 更新 `currentIndex` 和 `answers`
3. **恢复面试**: 调用 `GET /api/open/interviews?userId=xxx&status=IN_PROGRESS` 查询未完成的面试
4. **完成面试**: 调用 `PATCH /api/open/interviews/{id}` 更新 `status: COMPLETED` 并保存评估结果

---

### 2.7 Policy (政策)

```prisma
model Policy {
  id              String      @id @default(cuid())
  title           String
  type            PolicyType  // SUBSIDY | HOUSING | TALENT | ENTREPRENEUR | OTHER
  content         String      @db.Text
  summary         String?     @db.Text
  conditions      String?     @db.Text  // 适用条件
  benefits        String?     @db.Text  // 政策福利
  effectiveDate   DateTime?
  expiryDate      DateTime?
  isActive        Boolean     @default(true)

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([type])
  @@index([isActive])
}
```

---

### 2.8 EmotionRecord (情绪记录)

```prisma
model EmotionRecord {
  id              String      @id @default(cuid())
  userId          String
  emotion         String      // happy | sad | anxious | angry | neutral
  score           Int         // 1-10
  content         String?     @db.Text
  tags            String[]

  createdAt       DateTime    @default(now())

  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([createdAt])
}
```

---

## 三、索引策略

### 3.1 主键索引
- 所有表使用 `cuid()` 作为主键
- 格式: `clxxxxxxx` (25 字符)

### 3.2 业务索引

| 表 | 索引字段 | 用途 |
|---|---------|-----|
| User | role, status | 角色筛选、状态查询 |
| Job | enterpriseId, status, industry, location | 岗位列表、筛选 |
| Application | status, createdAt | 投递列表、状态筛选 |
| Interview | userId, status | 面试列表 |
| Policy | type, isActive | 政策列表 |
| EmotionRecord | userId, createdAt | 情绪历史 |

### 3.3 唯一约束

| 表 | 约束字段 | 说明 |
|---|---------|-----|
| User | email, phone | 邮箱/手机唯一 |
| Resume | userId | 每用户一份简历 |
| Application | [userId, jobId] | 每岗位投递一次 |

---

## 四、数据迁移

### 4.1 初始化脚本

```bash
# 生成 Prisma 客户端
npx prisma generate

# 同步数据库
npx prisma db push

# 运行种子数据
npx prisma db seed
```

### 4.2 种子数据

```typescript
// prisma/seed.ts
const seedData = {
  users: [
    {
      email: 'admin@wehan.com',
      name: '系统管理员',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  ],
  enterprises: [
    {
      name: '武汉某某科技有限公司',
      industry: '互联网/IT',
      scale: '50-200',
      verified: true,
    },
  ],
  schools: [
    {
      name: '武汉大学',
      type: '综合性',
      level: '本科',
      verified: true,
    },
  ],
}
```

---

## 五、查询优化

### 5.1 分页查询

```typescript
// 岗位列表分页
const jobs = await prisma.job.findMany({
  where: { status: 'PUBLISHED' },
  include: { enterprise: { select: { name: true, logo: true } } },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * pageSize,
  take: pageSize,
})
```

### 5.2 聚合查询

```typescript
// 统计数据
const stats = await prisma.$transaction([
  prisma.job.count({ where: { status: 'PUBLISHED' } }),
  prisma.application.count(),
  prisma.user.count({ where: { role: 'STUDENT' } }),
])
```

### 5.3 关联查询

```typescript
// 投递详情（含简历和岗位）
const application = await prisma.application.findUnique({
  where: { id },
  include: {
    user: { include: { resume: true } },
    job: { include: { enterprise: true } },
    interview: true,
  },
})
```

---

## 六、数据备份

### 6.1 备份策略

| 类型 | 频率 | 保留时间 |
|-----|------|---------|
| 全量备份 | 每日 | 30 天 |
| 增量备份 | 每小时 | 7 天 |
| 日志备份 | 每 15 分钟 | 3 天 |

### 6.2 恢复流程

```bash
# 从备份恢复
pg_restore -d wehan_db backup_file.dump

# 验证数据完整性
npx prisma validate
```

---

*文档版本: 1.1 | 生成时间: 2026-02-28*
