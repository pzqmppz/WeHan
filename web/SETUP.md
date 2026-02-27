# 快速开始指南

## 环境要求

- Node.js 18+
- PostgreSQL 15+
- pnpm / npm / yarn

## 初始化步骤

### 1. 安装依赖

```bash
cd web
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改数据库连接：

```bash
cp .env.example .env
```

编辑 `.env` 文件，确保 PostgreSQL 已启动且数据库已创建：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wehan?schema=public"
```

> 注意：需要先在 PostgreSQL 中创建 `wehan` 数据库

### 3. 创建数据库（如果未创建）

```bash
# 方式一：使用 psql
psql -U postgres -c "CREATE DATABASE wehan;"

# 方式二：使用 createdb 命令
createdb -U postgres wehan
```

### 4. 同步数据库 Schema

```bash
npm run db:push
```

这将根据 `prisma/schema.prisma` 创建所有表结构。

### 5. 生成 Prisma 客户端

```bash
npm run db:generate
```

### 6. 填充种子数据

```bash
npm run db:seed
```

这将创建：
- 管理员账号
- 3 家测试企业
- 3 所测试学校
- 7 个测试岗位
- 4 条政策信息

### 7. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 测试账号

| 角色 | 邮箱 | 密码 |
|-----|------|------|
| 管理员 | admin@wehan.com | admin123 |
| 企业HR | hr1@enterprise.com | enterprise123 |
| 学校 | 武大@school.com | school123 |
| 政府 | gov@wuhan.gov.cn | government123 |

## 常用命令

```bash
# 启动开发服务器
npm run dev

# 数据库相关
npm run db:push      # 同步 Schema 到数据库
npm run db:seed      # 填充种子数据
npm run db:reset     # 重置数据库（清空所有数据）
npm run db:studio    # 打开 Prisma Studio 可视化管理

# 构建和部署
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
```

## 目录结构

```
web/src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 认证页面
│   ├── (dashboard)/       # Dashboard 页面
│   │   ├── enterprise/    # 企业门户
│   │   ├── government/    # 政府门户
│   │   ├── school/        # 学校门户
│   │   └── admin/         # 管理员后台
│   └── api/               # API 路由
├── components/            # React 组件
├── services/              # 业务逻辑层
├── repositories/          # 数据访问层
├── lib/                   # 工具库
│   ├── validators/       # Zod 验证
│   └── mocks/            # Mock 数据
├── hooks/                 # 自定义 Hooks
└── types/                 # TypeScript 类型
```

## 故障排除

### 数据库连接失败

1. 确认 PostgreSQL 服务已启动
2. 检查 `.env` 中的 `DATABASE_URL` 配置
3. 确认数据库 `wehan` 已创建

### Prisma 客户端错误

```bash
# 重新生成客户端
npm run db:generate
```

### 种子数据执行失败

```bash
# 确保 ts-node 已安装
npm install -D ts-node

# 重新执行
npm run db:seed
```
