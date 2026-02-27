# 才聚江城 - 武汉人才留汉智能服务平台

> 连接武汉高校人才与本地企业的智能服务平台

## 项目简介

**才聚江城**是武汉人才留汉智能服务平台的B端管理系统，面向企业、学校、政府和管理员，提供岗位管理、人才库、政策发布、数据统计等功能。

### 双品牌策略

- **C端品牌：WeHan** - 面向学生的AI求职助手（扣子智能体 → 豆包App）
- **B端品牌：才聚江城** - 面向企业/学校/政府的管理后台（本项目）

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 14.x | React 全栈框架 (App Router) |
| TypeScript | 5.x | 类型安全 |
| Ant Design | 5.x | UI 组件库 |
| Tailwind CSS | 4.x | 原子化 CSS |
| Prisma | 6.x | ORM 数据库工具 |
| PostgreSQL | 16.x | 数据库 |
| NextAuth.js | 5.x | 身份认证 |

## 项目结构

```
web/
├── prisma/                 # 数据库模型
│   └── schema.prisma       # Prisma Schema
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (auth)/         # 认证相关页面
│   │   │   ├── login/      # 登录页
│   │   │   └── register/   # 注册页
│   │   ├── (dashboard)/    # Dashboard 页面
│   │   │   ├── admin/      # 管理员端
│   │   │   ├── enterprise/ # 企业端
│   │   │   ├── government/ # 政府端
│   │   │   └── school/     # 学校端
│   │   ├── api/            # API 路由
│   │   │   ├── auth/       # 认证 API
│   │   │   ├── jobs/       # 岗位 API
│   │   │   ├── applications/ # 投递 API
│   │   │   └── policies/   # 政策 API
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/         # 组件
│   │   ├── layout/         # 布局组件
│   │   ├── ui/             # UI 组件
│   │   └── features/       # 业务组件
│   ├── lib/                # 工具库
│   │   ├── prisma.ts       # Prisma 客户端
│   │   ├── utils.ts        # 工具函数
│   │   └── constants.ts    # 常量定义
│   ├── hooks/              # 自定义 Hooks
│   ├── types/              # TypeScript 类型
│   └── styles/             # 样式文件
├── .env                    # 环境变量
├── .env.example            # 环境变量示例
├── package.json
└── tsconfig.json
```

## 快速开始

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env`，并修改数据库连接信息：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wehan?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 3. 初始化数据库

```bash
# 创建数据库
npx prisma db push

# (可选) 填充测试数据
npx prisma db seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看项目。

## 四端功能

### 企业端 `/dashboard/enterprise`

- 首页概览（投递统计、热门岗位）
- 岗位管理（发布、编辑、上下架）
- 人才库（查看投递、评估报告）

### 政府端 `/dashboard/government`

- 留汉指数大屏（核心指标、趋势图表）
- 政策管理（发布、编辑政策）

### 学校端 `/dashboard/school`

- 就业看板（就业率、留汉率统计）
- 岗位推送（向学生推送岗位）

### 管理员 `/dashboard/admin`

- 系统概览
- 岗位管理
- 政策管理
- 企业管理
- 学校管理
- 用户管理
- 系统设置

## API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/*` | - | NextAuth 认证 |
| `/api/jobs` | GET/POST | 岗位列表/创建 |
| `/api/jobs/:id` | GET/PUT/DELETE | 岗位详情/更新/删除 |
| `/api/applications` | GET/POST | 投递列表/创建 |
| `/api/policies` | GET/POST | 政策列表/创建 |

## 开发命令

```bash
# 开发
npm run dev

# 构建
npm run build

# 生产运行
npm run start

# 代码检查
npm run lint

# 数据库操作
npx prisma studio      # 打开 Prisma Studio
npx prisma db push     # 推送 Schema 到数据库
npx prisma db pull     # 从数据库拉取 Schema
npx prisma migrate dev # 创建迁移
```

## 相关文档

- [产品需求文档 (PRD)](../PRD-武汉人才留汉智能服务平台.md)
- [Next.js 文档](https://nextjs.org/docs)
- [Ant Design 文档](https://ant.design/docs/react/introduce-cn)
- [Prisma 文档](https://www.prisma.io/docs)

## License

MIT
