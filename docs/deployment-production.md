# 生产环境部署文档

> WeHan 才聚江城 - 生产服务器配置与运维指南

**更新时间**: 2026-03-02 | **版本**: 1.1

---

## 〇、连接指南

### 获取访问凭据

联系项目管理员获取以下信息：

| 凭据 | 用途 | 格式示例 |
|------|------|----------|
| 服务器 IP | SSH 连接地址 | `111.231.51.9` |
| SSH 用户名 | 登录用户 | `root` |
| SSH 密码/私钥 | 认证方式 | 密码或 `.pem` 文件 |
| 数据库密码 | PostgreSQL 连接 | 见服务器 `.env` 文件 |

### 配置 SSH 快捷连接（推荐-密钥在系统目录C:\Users\Admin\.ssh\config）

**本地配置文件**: `~/.ssh/config`（Windows: `C:\Users\你的用户名\.ssh\config`）

```ssh
Host wehan
    HostName <服务器IP>
    User root
    # 如使用密钥
    # IdentityFile ~/.ssh/wehan.pem
```

配置后可直接使用：

```bash
ssh wehan
```

### 首次连接

```bash
# 方式一：使用别名（需先配置）
ssh wehan

# 方式二：直接连接
ssh root@<服务器IP>

# 首次连接会提示确认指纹，输入 yes
```

---

## 一、服务器信息

| 信息项 | 值 |
|--------|-----|
| **服务器 IP** | `111.231.51.9` |
| **操作系统** | CentOS Linux |
| **SSH 别名** | `wehan` |
| **面板** | 宝塔面板 |
| **磁盘** | 50GB (已用 18%) |
| **内存** | 1.9GB |

---

## 二、域名配置

| 域名 | 用途 | 端口 | 状态 |
|------|------|------|------|
| `wehan.dolosy.cn` | C 端落地页 | 8080 | 待备案 |
| `rcjc.dolosy.cn` | B 端管理后台 | 9000 | 待备案 |

**临时访问地址**：
- C 端：http://111.231.51.9:8080
- B 端：http://111.231.51.9:9000

---

## 三、运行环境

### 3.1 Node.js

```
版本: v24.14.0
进程管理: PM2
```

### 3.2 PM2 进程

```
┌────┬──────────┬─────────┬────────┬──────────┐
│ id │ name     │ status  │ uptime │ memory   │
├────┼──────────┼─────────┼────────┼──────────┤
│ 0  │ wehan    │ online  │ 21h+   │ ~74MB    │
└────┴──────────┴─────────┴────────┴──────────┘
```

**常用命令**：
```bash
pm2 list              # 查看进程列表
pm2 restart wehan     # 重启应用
pm2 logs wehan        # 查看日志
pm2 monit             # 监控面板
```

### 3.3 PostgreSQL

| 信息项 | 值 |
|--------|-----|
| **安装路径** | `/www/server/pgsql/` |
| **数据目录** | `/www/server/pgsql/data` |
| **监听地址** | `127.0.0.1:5432` (仅本地) |
| **版本** | 宝塔面板安装版本 |

**数据库连接**：
```
主机: localhost
端口: 5432
用户: wehan
密码: <联系管理员获取>
数据库: wehan
```

**连接字符串**：
```
postgresql://wehan:<密码>@localhost:5432/wehan
```

**数据库工具**：
```bash
# 使用宝塔安装的 psql
/www/server/pgsql/bin/psql -U wehan -d wehan

# 查看所有表
/www/server/pgsql/bin/psql -U wehan -d wehan -c '\dt'
```

### 3.4 Nginx

通过宝塔面板管理，配置文件位于 `/www/server/panel/vhost/nginx/`

---

## 四、应用部署

### 4.1 目录结构

```
/www/wwwroot/
├── WeHan/                      # B 端 Next.js 应用
│   └── web/
│       ├── .env                # 环境配置
│       ├── package.json
│       └── ...
├── wehan.dolosy.cn/            # C 端落地页
│   └── index.html              # Chat SDK 页面
└── 111.231.51.9/               # 默认站点
```

### 4.2 B 端环境变量

**文件**: `/www/wwwroot/WeHan/web/.env`

> ⚠️ 敏感信息已隐藏，实际值请查看服务器上的 `.env` 文件

```env
# 数据库连接
DATABASE_URL="postgresql://wehan:<密码>@localhost:5432/wehan"

# NextAuth
NEXTAUTH_URL="http://111.231.51.9:3000"
NEXTAUTH_SECRET="<随机生成的密钥>"

# 开放 API 密钥
OPEN_API_KEY="<API密钥>"

# 信任主机配置
AUTH_TRUST_HOST=true
```

**查看实际配置**：
```bash
ssh wehan
cat /www/wwwroot/WeHan/web/.env
```

### 4.3 部署流程

```bash
# 1. SSH 登录服务器
ssh wehan

# 2. 进入项目目录
cd /www/wwwroot/WeHan/web

# 3. 拉取最新代码
git pull origin master

# 4. 安装依赖
npm install

# 5. 数据库迁移（如有）
npx prisma generate
npx prisma db push

# 6. 构建应用
npm run build

# 7. 重启 PM2
pm2 restart wehan
```

---

## 五、数据库表结构

**当前已创建的表** (13 个)：

| 表名 | 说明 |
|------|------|
| `Application` | 求职申请 |
| `Conversation` | C 端会话 |
| `EmotionRecord` | 情绪记录 |
| `Enterprise` | 企业信息 |
| `Interview` | 面试记录 |
| `Job` | 岗位信息 |
| `JobPushRecord` | 岗位推送记录 |
| `Policy` | 政策信息 |
| `PortalConfig` | 门户配置 |
| `Resume` | 简历 |
| `School` | 学校信息 |
| `Statistics` | 统计数据 |
| `User` | 用户信息 |

**待迁移的表**：
- `CozeQuestionSession` - 多轮问询会话管理

---

## 六、运维命令速查

### 6.1 服务管理

```bash
# 重启 PostgreSQL
systemctl restart postgresql

# 重启 Nginx
systemctl restart nginx

# 查看 PM2 日志
pm2 logs wehan --lines 100
```

### 6.2 数据库操作

```bash
# 连接数据库
/www/server/pgsql/bin/psql -U wehan -d wehan

# 查看表结构
/www/server/pgsql/bin/psql -U wehan -d wehan -c '\d TableName'

# 执行 Prisma 迁移
cd /www/wwwroot/WeHan/web
npx prisma db push
npx prisma generate
```

### 6.3 日志查看

```bash
# PM2 日志
pm2 logs wehan

# PostgreSQL 日志
tail -f /www/server/pgsql/logs/*.log

# Nginx 日志
tail -f /www/wwwlogs/*.log
```

---

## 七、监控与告警

### 7.1 系统资源

| 指标 | 当前值 | 阈值 |
|------|--------|------|
| 磁盘使用率 | 18% | < 80% |
| 内存使用率 | ~45% | < 80% |
| PM2 重启次数 | 20 | 关注异常 |

### 7.2 健康检查

```bash
# 检查 B 端服务
curl http://localhost:9000/api/health

# 检查 C 端服务
curl http://localhost:8080

# 检查数据库连接
/www/server/pgsql/bin/psql -U wehan -d wehan -c 'SELECT 1;'
```

---

## 八、安全配置

### 8.1 防火墙

已开放的端口：
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 8080 (C 端临时)
- 9000 (B 端临时)

### 8.2 数据库安全

- PostgreSQL 仅监听 `127.0.0.1`
- 外部无法直接连接数据库
- 使用强密码

---

## 九、待办事项

- [ ] 域名备案完成后配置 HTTPS
- [ ] 迁移 `CozeQuestionSession` 表到生产环境
- [ ] 配置自动备份
- [ ] 配置日志轮转

---

*文档版本: 1.1 | 更新时间: 2026-03-02 | 维护者: WeHan 开发团队*
*变更: 新增连接指南章节、移除明文密码*
