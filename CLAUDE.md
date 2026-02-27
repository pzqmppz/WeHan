# 才聚江城 - 武汉人才留汉智能服务平台

## 项目概述

连接武汉高校人才与本地企业的智能服务平台。

- **C端品牌：WeHan** - 面向学生的AI求职助手（扣子智能体 → 豆包App）
- **B端品牌：才聚江城** - 面向企业/学校/政府的管理后台（本项目）

## 技术栈

### B端 (web/)

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.x | React 全栈框架 (App Router) |
| TypeScript | 5.x | 类型安全 |
| Ant Design | 5.x | UI 组件库 |
| Tailwind CSS | 4.x | 原子化 CSS |
| Prisma | 5.x | ORM 数据库工具 |
| PostgreSQL | - | 数据库 |
| NextAuth.js | 5.x | 身份认证 |

### C端

- 扣子智能体平台
- 发布到豆包 App

## 项目结构

```
WeHan/
├── web/                      # B端 Web 后台
│   ├── prisma/               # 数据库模型
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   │   ├── (auth)/       # 认证页面
│   │   │   ├── (dashboard)/  # Dashboard 页面
│   │   │   │   ├── admin/    # 管理员端
│   │   │   │   ├── enterprise/ # 企业端
│   │   │   │   ├── government/ # 政府端
│   │   │   │   └── school/   # 学校端
│   │   │   ├── api/          # API 路由
│   │   │   ├── layout.tsx    # 根布局
│   │   │   └── page.tsx      # 门户首页
│   │   ├── components/       # 组件
│   │   ├── lib/              # 工具库
│   │   ├── hooks/            # 自定义 Hooks
│   │   └── types/            # TypeScript 类型
│   └── package.json
├── PRD-武汉人才留汉智能服务平台.md  # 产品需求文档
└── CLAUDE.md                 # 本文件
```

## 四端功能

### 企业端 `/dashboard/enterprise`
- 首页概览、岗位管理、人才库、企业信息

### 政府端 `/dashboard/government`
- 留汉指数大屏、政策管理、数据统计

### 学校端 `/dashboard/school`
- 就业看板、岗位推送、学生管理

### 管理员 `/dashboard/admin`
- 系统概览、岗位/政策/企业/学校/用户管理、系统设置

## 开发规范

### 代码风格
- 使用 TypeScript，避免 `any` 类型
- 组件使用 `'use client'` 指令（客户端组件）
- 使用 Ant Design 组件，遵循其设计规范
- 样式优先使用 Tailwind CSS 原子类

### 命名规范
- 组件文件：PascalCase（如 `DashboardLayout.tsx`）
- 工具函数：camelCase（如 `formatDate`）
- 常量：UPPER_SNAKE_CASE（如 `USER_ROLES`）
- 数据库模型：PascalCase（如 `Enterprise`）

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式（不影响功能）
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 常用命令

```bash
cd web

# 开发
npm run dev

# 构建
npm run build

# 代码检查
npm run lint

# 数据库操作
npx prisma studio      # 打开 Prisma Studio
npx prisma db push     # 推送 Schema 到数据库
npx prisma generate    # 生成 Prisma Client
```

## 环境变量

```env
# 数据库
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wehan?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# 应用配置
APP_NAME="才聚江城"
APP_URL="http://localhost:3000"
```

## 相关文档

- [产品需求文档 (PRD)](./PRD-武汉人才留汉智能服务平台.md)
- [扣子官方文档](https://docs.coze.cn/)

## MVP 时间线

- **截止日期**: 2026年3月1日
- **当前状态**: 项目初始化完成，功能开发中
