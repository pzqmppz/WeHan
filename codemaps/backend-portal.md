# B 端技术框架 - 才聚江城

> 按模块垂直开发原则设计，采用分层架构

**更新时间**: 2026-02-27 | **版本**: 1.1

---

## 一、技术栈

| 层级 | 技术 | 版本 |
|-----|------|-----|
| 框架 | Next.js | 16.x (App Router) |
| 语言 | TypeScript | 5.x |
| UI 组件 | Ant Design | 5.x |
| 样式 | Tailwind CSS | 4.x |
| 数据库 ORM | Prisma | 5.x |
| 数据库 | PostgreSQL | 15.x |
| 认证 | NextAuth.js | 5.x |
| 验证 | Zod | 3.x |
| 图表 | @ant-design/charts | - |

---

## 二、分层架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        请求流向                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                                │
│  │   Client    │  用户请求                                      │
│  │   (React)   │                                                │
│  └──────┬──────┘                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐     ┌─────────────┐                           │
│  │  API Route  │────►│   Zod       │  输入验证                  │
│  │  /api/*     │     │   Validator │                           │
│  └──────┬──────┘     └─────────────┘                           │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │   Service   │  业务逻辑层                                     │
│  │   Layer     │  - 数据处理                                    │
│  │             │  - 业务规则                                    │
│  └──────┬──────┘                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │ Repository  │  数据访问层                                     │
│  │   Layer     │  - SQL 查询                                    │
│  │             │  - 数据映射                                    │
│  └──────┬──────┘                                                │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────┐                                                │
│  │  PostgreSQL │  数据存储                                       │
│  └─────────────┘                                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、目录结构（已更新）

```
web/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # 认证相关页面
│   │   ├── login/page.tsx        # 登录页
│   │   └── register/page.tsx     # 注册页
│   ├── (dashboard)/              # Dashboard 页面
│   │   ├── enterprise/           # 企业门户
│   │   │   ├── page.tsx          # 首页概览
│   │   │   ├── jobs/             # 岗位管理
│   │   │   ├── talent/           # 人才库
│   │   │   ├── applications/     # 投递管理
│   │   │   └── interviews/       # 面试管理
│   │   ├── government/           # 政府门户
│   │   ├── school/               # 学校门户
│   │   └── admin/                # 管理员后台
│   ├── api/                      # API 路由
│   │   ├── auth/[...nextauth]/   # NextAuth 认证
│   │   ├── jobs/route.ts         # 岗位 API
│   │   ├── applications/route.ts # 投递 API
│   │   ├── interviews/route.ts   # 面试 API
│   │   ├── policies/route.ts     # 政策 API
│   │   └── open/                 # 开放 API（C端调用）
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                   # React 组件
│   ├── layout/                   # 布局组件
│   │   ├── DashboardLayout.tsx   # 主布局（精简版）
│   │   ├── DashboardSider.tsx    # 侧边栏（独立）
│   │   ├── DashboardHeader.tsx   # 头部（独立）
│   │   ├── menuConfig.ts         # 菜单配置
│   │   ├── PortalHeader.tsx
│   │   └── PortalFooter.tsx
│   ├── ui/                       # 通用 UI 组件
│   │   ├── DataTable/
│   │   ├── PageHeader/
│   │   └── StatusTag/
│   └── forms/                    # 表单组件
│
├── services/                     # 🆕 业务逻辑层
│   ├── index.ts                  # 统一导出
│   ├── job.service.ts            # 岗位业务逻辑
│   └── application.service.ts    # 投递业务逻辑
│
├── repositories/                 # 🆕 数据访问层
│   ├── index.ts                  # 统一导出
│   ├── base.repository.ts        # Repository 基类
│   ├── job.repository.ts         # 岗位数据访问
│   └── application.repository.ts # 投递数据访问
│
├── lib/                          # 工具库
│   ├── prisma.ts                 # Prisma 客户端
│   ├── auth.ts                   # 认证配置
│   ├── theme.ts                  # 🆕 Ant Design 主题配置
│   ├── utils.ts                  # 工具函数
│   ├── validators/               # 🆕 Zod 验证 Schemas
│   │   └── index.ts              # 统一验证规则
│   └── mocks/                    # 🆕 Mock 数据
│       └── dashboard.mock.ts     # Dashboard Mock
│
├── hooks/                        # 自定义 Hooks
│   ├── index.ts                  # 统一导出
│   └── useDashboardData.ts       # Dashboard 数据 Hook
│
└── types/                        # TypeScript 类型
    └── index.ts                  # 类型定义
```

---

## 四、核心层详解

### 4.1 API 路由层

**职责**: 接收请求、调用 Service、返回响应

```typescript
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { jobService } from '@/services'
import { JobQuerySchema, CreateJobSchema } from '@/lib/validators'
import { ZodError } from 'zod'

export async function GET(request: NextRequest) {
  try {
    // 1. 验证参数
    const query = JobQuerySchema.parse(/* ... */)
    // 2. 调用 Service
    const result = await jobService.getJobs(query)
    // 3. 返回响应
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}
```

### 4.2 Service 层

**职责**: 业务逻辑处理、数据校验、调用 Repository

```typescript
// services/job.service.ts
export const jobService = {
  async getJobs(query: JobQueryInput) {
    const { page, pageSize, industry, keyword } = query

    const filter: JobFilter = {}
    if (industry) filter.industry = industry
    if (keyword) filter.keyword = keyword

    const { jobs, total } = await jobRepository.findMany(filter, { page, pageSize })

    return {
      data: jobs,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    }
  },

  async createJob(input: CreateJobInput) {
    const validated = CreateJobSchema.parse(input)
    const job = await jobRepository.create(validated)
    return { data: job }
  },
}
```

### 4.3 Repository 层

**职责**: 数据库操作、SQL 查询

```typescript
// repositories/job.repository.ts
export const jobRepository = {
  async findMany(filter: JobFilter, pagination: JobPagination) {
    const where: Prisma.JobWhereInput = { status: filter.status }

    if (filter.keyword) {
      where.OR = [
        { title: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({ where, skip: ..., take: ... }),
      prisma.job.count({ where }),
    ])

    return { jobs, total }
  },

  async create(data: Prisma.JobCreateInput) {
    return prisma.job.create({ data })
  },
}
```

### 4.4 验证层

**职责**: 运行时类型验证、输入校验

```typescript
// lib/validators/index.ts
import { z } from 'zod'

export const JobQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  industry: z.string().optional(),
  keyword: z.string().optional(),
})

export const CreateJobSchema = z.object({
  title: z.string().min(1).max(200),
  enterpriseId: z.string().cuid(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  description: z.string().min(1),
  // ...
})
```

---

## 五、设计系统

### 5.1 主题配置

```typescript
// lib/theme.ts
export const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677FF',
    colorSuccess: '#52C41A',
    colorWarning: '#FAAD14',
    colorError: '#FF4D4F',
    borderRadius: 6,
  },
}
```

### 5.2 颜色规范

| 用途 | 变量 | 值 |
|-----|------|---|
| 主色 | --primary-500 | #1677FF |
| 成功 | --success-main | #52C41A |
| 警告 | --warning-main | #FAAD14 |
| 错误 | --error-main | #FF4D4F |

### 5.3 组件规范

| 规范 | 值 |
|-----|---|
| 页面标题 | `text-2xl font-semibold mb-6` |
| 卡片样式 | `bg-white rounded-lg shadow-sm` |
| 按钮高度 | 默认 32px，大按钮 40px |
| 表格操作列 | 120-180px |

---

## 六、Mock 数据

### 6.1 Mock 文件结构

```typescript
// lib/mocks/dashboard.mock.ts
export const mockEnterpriseDashboard = {
  statistics: { todayApplications: 12, pendingResumes: 28, ... },
  recentApplications: [...],
  hotJobs: [...],
}

export function mockApiResponse<T>(data: T, delay = 300) {
  return new Promise(resolve => setTimeout(() => resolve({ data, success: true }), delay))
}
```

### 6.2 Hook 使用 Mock

```typescript
// hooks/useDashboardData.ts
export function useEnterpriseDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      // 开发阶段使用 Mock
      const result = mockEnterpriseDashboard
      await mockDelay(300)
      setData(result)
    }
    fetchData()
  }, [])

  return { data, loading, refetch: () => setLoading(true) }
}
```

---

## 七、组件拆分

### 7.1 Layout 组件结构

```
components/layout/
├── DashboardLayout.tsx    # 主布局（~50 行）
├── DashboardSider.tsx     # 侧边栏（~80 行）
├── DashboardHeader.tsx    # 头部（~50 行）
├── menuConfig.ts          # 菜单配置（~100 行）
├── PortalHeader.tsx
├── PortalFooter.tsx
└── index.ts               # 统一导出
```

### 7.2 菜单配置

```typescript
// components/layout/menuConfig.ts
export const menuItems: Record<UserRole, MenuProps['items']> = {
  enterprise: [
    { key: '/dashboard/enterprise', icon: <DashboardOutlined />, label: <Link href="...">首页概览</Link> },
    { key: '/dashboard/enterprise/jobs', icon: <FileTextOutlined />, label: <Link href="...">岗位管理</Link> },
    // ...
  ],
  // ...
}
```

---

## 八、API 响应规范

### 成功响应

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": "错误信息",
  "code": "VALIDATION_ERROR",
  "details": [...]
}
```

---

## 九、开发优先级

```
P0 - 已完成 ✅
├── ✅ Zod 验证 Schemas
├── ✅ Service 层架构
├── ✅ Repository 层架构
├── ✅ Mock 数据抽取
├── ✅ 组件拆分
└── ✅ 设计系统配置

P1 - 已完成 ✅
├── ✅ 认证授权模块 (NextAuth v5)
├── ✅ 岗位管理 CRUD (发布/编辑/上下架/删除)
├── ✅ 投递管理 (列表/状态流转/评估报告)
└── ✅ 人才库 (列表/筛选/简历详情)

P2 - 待开发
├── ⏳ 面试问题上传 (企业自定义面试题)
├── ⏳ 面试管理 (AI面试记录/报告查看)
├── ⏳ 政策管理 (发布/列表)
├── ⏳ 数据统计 (完整版)
├── ⏳ 候选人对比
└── ⏳ 管理员后台
```

---

## 十、代码规范

### 10.1 禁止事项

| 禁止 | 原因 | 替代方案 |
|-----|------|---------|
| `any` 类型 | 类型不安全 | 使用 Zod 类型推断 |
| 行内样式 `style={{}}` | 样式不一致 | Tailwind 类名 |
| 硬编码颜色 | 主题不统一 | 使用设计系统变量 |
| Emoji 图标 | 不专业 | @ant-design/icons |
| Mock 数据在组件中 | 难以维护 | 抽取到 mocks/ |

### 10.2 命名规范

| 类型 | 规范 | 示例 |
|-----|------|------|
| 组件 | PascalCase | `JobList.tsx` |
| Service | camelCase + .service | `job.service.ts` |
| Repository | camelCase + .repository | `job.repository.ts` |
| Hook | use 前缀 | `useDashboardData.ts` |
| Schema | Schema 后缀 | `CreateJobSchema` |

---

## 十一、文档索引

| 文档 | 路径 |
|-----|------|
| 设计系统 | [docs/design-system.md](../docs/design-system.md) |
| 数据模型 | [codemaps/data-models.md](./data-models.md) |
| 总体架构 | [codemaps/architecture.md](./architecture.md) |

---

*文档版本: 1.2 | 更新时间: 2026-02-27 | 变更: P1阶段完成，更新开发优先级*
