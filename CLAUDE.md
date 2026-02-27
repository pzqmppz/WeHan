# WeHan / 才聚江城 - 武汉人才留汉智能服务平台

## 项目概述

连接武汉高校人才与本地企业的智能服务平台，采用双品牌策略。

| 品牌 | 定位 | 技术方案 | 目标用户 |
|-----|------|---------|---------|
| **WeHan** | C 端 | 扣子智能体 → 豆包 App | 毕业生/求职者 |
| **才聚江城** | B 端 | Next.js + Ant Design | 企业/学校/政府/管理员 |

---

## 技术栈

### B 端 (web/)

| 技术 | 版本 | 说明 |
|------|------|------|
| Next.js | 16.x | React 全栈框架 (App Router) |
| TypeScript | 5.x | 类型安全 |
| Ant Design | 5.x | UI 组件库 |
| Tailwind CSS | 4.x | 原子化 CSS |
| Prisma | 5.x | ORM 数据库工具 |
| PostgreSQL | 15.x | 数据库 |
| NextAuth.js | 5.x | 身份认证 (4 角色RBAC) |

### C 端

| 技术 | 说明 |
|------|------|
| 扣子 (Coze) | 智能体开发平台 |
| 豆包 App | 用户入口 (iOS/Android/小程序) |
| @coze/realtime-api | WebSocket 实时语音 SDK |
| 火山引擎 | 端到端语音大模型 API |

---

## 项目结构

```
WeHan/
├── web/                          # B 端 Web 后台
│   ├── prisma/
│   │   └── schema.prisma         # 数据库模型 (12 个表)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # 认证页面
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (dashboard)/      # 仪表盘 (需登录)
│   │   │   │   ├── enterprise/   # 企业门户
│   │   │   │   ├── government/   # 政府门户
│   │   │   │   ├── school/       # 学校门户
│   │   │   │   └── admin/        # 管理员后台
│   │   │   ├── api/              # API 路由
│   │   │   │   ├── auth/         # NextAuth
│   │   │   │   ├── jobs/         # 岗位 API
│   │   │   │   ├── applications/ # 投递 API
│   │   │   │   ├── policies/     # 政策 API
│   │   │   │   └── open/         # 开放 API (C端调用)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── layout/           # 布局组件
│   │   │   ├── ui/               # 通用 UI
│   │   │   └── forms/            # 表单组件
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   └── types/
│   └── package.json
├── docs/                         # 技术文档
│   ├── coze/                     # 扣子平台文档
│   │   ├── 00-智能体创建与配置.md
│   │   ├── 01-智能体发布到豆包.md
│   │   ├── 02-工作流开发.md
│   │   ├── 03-知识库使用.md
│   │   ├── 04-插件开发.md
│   │   ├── 05-开放API.md
│   │   ├── 06-WebSocket实时语音SDK.md
│   │   └── README.md
│   └── volcengine/               # 火山引擎文档
│       ├── 01-端到端实时语音大模型API.md
│       └── README.md
├── codemaps/                     # 架构文档
│   ├── architecture.md           # 总体架构
│   ├── backend-portal.md         # B 端技术框架
│   ├── frontend-client.md        # C 端技术框架
│   └── data-models.md            # 数据模型设计
├── PRD-武汉人才留汉智能服务平台.md
└── CLAUDE.md
```

---

## 四端功能

### 企业端 `/dashboard/enterprise`

| 模块 | 功能 | 状态 |
|-----|------|-----|
| 首页概览 | 统计卡片、最新投递、热门岗位 | ✅ 框架完成 |
| 岗位管理 | CRUD、状态切换 | ❌ 待开发 |
| 人才库 | 简历筛选、标签管理 | ❌ 待开发 |
| 投递管理 | 简历查看、状态流转 | ❌ 待开发 |
| 面试安排 | 日程、评估报告查看 | ❌ 待开发 |
| 企业信息 | 资料编辑、认证 | ❌ 待开发 |

### 政府端 `/dashboard/government`

| 模块 | 功能 | 状态 |
|-----|------|-----|
| 留汉指数 | 核心指标、趋势图 | ✅ 框架完成 |
| 政策管理 | 发布、编辑、上下架 | ❌ 待开发 |
| 数据统计 | 详细报表、导出 | ❌ 待开发 |

### 学校端 `/dashboard/school`

| 模块 | 功能 | 状态 |
|-----|------|-----|
| 就业看板 | 就业率、去向分布 | ❌ 待开发 |
| 学生管理 | 学生列表、批量导入 | ❌ 待开发 |
| 岗位推送 | 定向推送、记录查看 | ❌ 待开发 |

### 管理员 `/dashboard/admin`

| 模块 | 功能 | 状态 |
|-----|------|-----|
| 系统概览 | 平台数据汇总 | ❌ 待开发 |
| 用户管理 | 用户列表、状态管理 | ❌ 待开发 |
| 企业管理 | 企业审核、资质查看 | ❌ 待开发 |
| 学校管理 | 学校审核 | ❌ 待开发 |
| 系统设置 | 配置项管理 | ❌ 待开发 |

---

## 开发阶段规划

### 阶段 1: 基础设施 (1 周)

| 任务 | 优先级 | 状态 |
|-----|-------|-----|
| 数据库 Schema 完善 | P0 | ✅ |
| NextAuth.js 认证 + RBAC | P0 | ❌ |
| 路由守卫中间件 | P0 | ❌ |
| C 端求职 Agent 创建 | P0 | ❌ |

### 阶段 2: 核心功能 (2 周)

| 任务 | 优先级 | 状态 |
|-----|-------|-----|
| B 端: 岗位管理 CRUD | P0 | ❌ |
| B 端: 开放 API | P0 | ❌ |
| C 端: 实时语音集成 | P0 | ❌ |
| C 端: 面试模拟工作流 | P0 | ❌ |
| C+B: 报告保存联调 | P0 | ❌ |

### 阶段 3: 业务闭环 (2 周)

| 任务 | 优先级 | 状态 |
|-----|-------|-----|
| B 端: 简历管理 | P1 | ❌ |
| B 端: 投递管理 | P1 | ❌ |
| C 端: 简历解析 | P1 | ❌ |
| C 端: 岗位匹配 (RAG) | P1 | ❌ |
| C 端: 一键投递 | P1 | ❌ |

### 阶段 4: 扩展功能 (2 周)

| 任务 | 优先级 | 状态 |
|-----|-------|-----|
| B 端: 政策管理 | P2 | ❌ |
| B 端: 数据统计 | P2 | ❌ |
| B 端: 学校门户 | P2 | ❌ |
| C 端: 心理健康 Agent | P2 | ❌ |

---

## 开发规范

### 代码风格

- 使用 TypeScript，避免 `any` 类型
- 组件使用 `'use client'` 指令
- 使用 Ant Design 组件，遵循其设计规范
- 样式优先使用 Tailwind CSS 原子类
- API 响应使用统一格式

### 命名规范

| 类型 | 规范 | 示例 |
|-----|------|-----|
| 组件文件 | PascalCase | `DashboardLayout.tsx` |
| 工具函数 | camelCase | `formatDate.ts` |
| 常量 | UPPER_SNAKE_CASE | `USER_ROLES` |
| 数据库模型 | PascalCase | `Enterprise` |
| API 路由 | RESTful | `/api/jobs/:id` |

### API 响应格式

```typescript
// 成功
{ success: true, data: {...}, meta: { page: 1, total: 100 } }

// 错误
{ success: false, error: "错误信息", code: "ERROR_CODE" }
```

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式
refactor: 重构
test: 测试相关
chore: 构建/工具
```

---

## 常用命令

```bash
cd web

# 开发
npm run dev

# 构建
npm run build

# 代码检查
npm run lint

# 数据库
npx prisma studio      # 可视化管理
npx prisma db push     # 推送 Schema
npx prisma generate    # 生成 Client
npx prisma db seed     # 填充种子数据
```

---

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

# 开放 API (C端调用)
OPEN_API_KEY="your-api-key-for-coze"
```

---

## 文档索引

| 文档 | 路径 | 说明 |
|-----|------|------|
| **设计系统** | [docs/design-system.md](./docs/design-system.md) | **UI/样式统一规范 (必读)** |
| PRD | [PRD-武汉人才留汉智能服务平台.md](./PRD-武汉人才留汉智能服务平台.md) | 产品需求 |
| 总体架构 | [codemaps/architecture.md](./codemaps/architecture.md) | B+C 端整合架构 |
| B 端框架 | [codemaps/backend-portal.md](./codemaps/backend-portal.md) | Next.js 开发指南 |
| C 端框架 | [codemaps/frontend-client.md](./codemaps/frontend-client.md) | 扣子开发指南 |
| 数据模型 | [codemaps/data-models.md](./codemaps/data-models.md) | Prisma Schema 详解 |
| 扣子文档 | [docs/coze/README.md](./docs/coze/README.md) | 平台使用指南 |
| 火山引擎 | [docs/volcengine/README.md](./docs/volcengine/README.md) | 语音 API |

---

## MVP 时间线

- **截止日期**: 2026年3月1日
- **当前状态**: 项目初始化完成，框架搭建完成，进入阶段1开发

---

## Skill 技能文档

开发时必须参考以下 Skill 规范，确保代码质量和样式统一：

| Skill | 用途 | 核心规则 |
|-------|------|---------|
| **frontend-patterns** | 前端组件模式 | 组件组合优于继承、Custom Hooks、useMemo/useCallback |
| **backend-patterns** | 后端 API 模式 | Repository/Service 层、中间件、统一错误处理 |
| **postgres-patterns** | 数据库优化 | B-tree/GIN 索引、N+1 预防、timestamptz |
| **coding-standards** | 代码规范 | 不可变模式、TypeScript 类型安全、统一响应格式 |
| **ui-ux-pro-max** | UI/UX 设计 | 无障碍 4.5:1 对比度、44px 触控区域、禁止 emoji 图标 |

---

## 设计系统（重要）

**所有 UI 开发必须遵循 [设计系统文档](./docs/design-system.md)**，确保全平台样式统一。

### 核心规范速查

| 类别 | 规范 |
|-----|------|
| **主色** | `#1677FF` (Primary Blue) |
| **页面标题** | `text-2xl font-semibold mb-6` |
| **卡片样式** | `bg-white rounded-lg shadow-sm` |
| **表单间距** | `mb-3` |
| **图标来源** | 仅使用 `@ant-design/icons`，**禁止 emoji** |
| **按钮高度** | 默认 32px，大按钮 40px |
| **表格操作列** | 120-180px |
| **动效时长** | 150-300ms |

### 颜色速查

```css
--primary-500: #1677FF;   /* 主色 */
--success-main: #52C41A;  /* 成功 */
--warning-main: #FAAD14;  /* 警告 */
--error-main: #FF4D4F;    /* 错误 */
--text-primary: #262626;  /* 主文字 */
--text-secondary: #595959;/* 辅助文字 */
--bg-page: #F0F2F5;       /* 页面背景 */
```

### 禁止事项

- ❌ 使用 emoji 作为 UI 图标
- ❌ 使用行内样式 `style={{}}`
- ❌ 使用未定义的颜色值
- ❌ 混用多种圆角/字号
- ❌ 在循环中使用 `index` 作为 key

---

## 注意事项

1. **按模块垂直开发**: 每个模块前端+后端+联调一起完成，不做全前端再做全后端
2. **C 端依赖 B 端**: 岗位数据、投递保存都需要 B 端 API 先完成
3. **实时语音是核心**: 面试体验的关键，需提前验证 SDK 稳定性
4. **双品牌运营**: C 端叫 WeHan，B 端叫才聚江城，代码中注意区分
5. **样式统一**: 所有页面必须遵循设计系统，避免 AI 多次生成导致风格不一致
