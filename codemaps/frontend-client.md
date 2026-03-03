# C 端技术框架 - WeHan 求职助手

> **自研前端 + Coze Open API**：完全自定义 UI，保留 Coze AI 能力

**更新时间**: 2026-03-04 (v4.1 - 项目目录调整)

> **项目位置**: `c-end/` (独立 Next.js 项目)

---

## 一、架构概览

### 1.1 架构变更说明

| 版本 | 架构 | 用户入口 | 说明 |
|-----|------|---------|------|
| v3.x | Coze 智能体 + 豆包 App | 豆包 App | 样式受限，自定义能力有限 |
| **v4.0** | **自研前端 + Coze Open API** | **H5 页面** | 完全自定义 UI，原生 H5 体验 |

**变更原因**：
- Coze Web SDK 样式粗糙，无法达到商业级标准
- 自定义自由度低，无法嵌入简历上传、岗位卡片等业务组件
- 需要实现原生 H5 级精致体验

### 1.2 技术架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    C 端前端架构 (c-end/)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js 15 前端应用 (端口 3001)              │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  Ant Design X 组件层                             │    │   │
│  │  │  ├── Bubble (消息气泡)                           │    │   │
│  │  │  ├── Conversations (会话列表)                    │    │   │
│  │  │  ├── Sender (发送器)                             │    │   │
│  │  │  ├── Attachments (附件)                          │    │   │
│  │  │  ├── ThoughtChain (思维链)                       │    │   │
│  │  │  ├── Suggestion (建议)                           │    │   │
│  │  │  └── Welcome (欢迎语)                            │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────┴──────────────────────────┐    │   │
│  │  │  WeHan 业务组件层                                │    │   │
│  │  │  ├── ChatContainer (聊天容器)                    │    │   │
│  │  │  ├── JobCard (岗位卡片)                          │    │   │
│  │  │  ├── InterviewPanel (面试面板)                   │    │   │
│  │  │  ├── ReportViewer (报告展示)                     │    │   │
│  │  │  └── ResumeUploader (简历上传)                   │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                         │                               │   │
│  │  ┌──────────────────────┴──────────────────────────┐    │   │
│  │  │  API 代理层 (/api/coze-proxy/*)                  │    │   │
│  │  │  ├── /chat → SSE 流式对话                        │    │   │
│  │  │  ├── /workflow → 工作流执行                      │    │   │
│  │  │  └── /upload → 文件上传                          │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                   │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │              Coze Open API                              │   │
│  │  ├── POST /v3/chat (SSE 流式对话)                       │   │
│  │  ├── POST /v1/workflow/run (工作流)                     │   │
│  │  ├── POST /v1/files/upload (文件)                       │   │
│  │  └── WebSocket (实时语音)                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                   │
│  ┌─────────────────────────▼───────────────────────────────┐   │
│  │              B 端 API (rcjc.dolosy.cn:3000)             │   │
│  │  ├── /api/open/jobs (岗位查询)                          │   │
│  │  ├── /api/open/conversations (会话管理)                 │   │
│  │  ├── /api/open/interviews (面试报告)                    │   │
│  │  └── /api/coze/question/* (多轮问询)                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 二、技术选型

### 2.1 核心技术栈

| 组件 | 技术 | 版本 | 说明 |
|-----|------|------|------|
| **构建框架** | Next.js | 16.x | App Router，复用现有 B 端基础设施 |
| **AI 对话组件** | Ant Design X | 2.x | 阿里 AI 组件库，支持流式响应 |
| **状态管理** | Zustand | 5.x | 轻量级，已安装 |
| **样式方案** | Tailwind CSS | 4.x | 原子化 CSS |
| **AI 能力** | Coze Open API | v3 | SSE + WebSocket |
| **实时语音** | @coze/realtime-api | 1.x | WebSocket 语音 SDK |

### 2.2 Ant Design X 核心组件

| 组件 | 用途 |
|-----|------|
| `Bubble` | 消息气泡，支持多种内容类型 |
| `Conversations` | 会话列表，支持分组、搜索 |
| `Sender` | 消息发送器，支持附件、语音 |
| `Attachments` | 附件上传和预览 |
| `ThoughtChain` | 思维链展示（AI 推理过程） |
| `Suggestion` | 快捷建议/快捷回复 |
| `Welcome` | 欢迎语和引导 |
| `Prompts` | 预设提示词 |

### 2.3 WeHan 业务组件

| 组件 | 用途 | 优先级 |
|-----|------|-------|
| `ChatContainer` | 聊天容器，整合 Ant Design X 组件 | P0 |
| `JobCard` | 岗位信息卡片，嵌入聊天消息 | P0 |
| `InterviewPanel` | 面试进度面板（当前第 N 题） | P0 |
| `ReportViewer` | 评估报告 Markdown 展示 | P0 |
| `ResumeUploader` | 简历上传组件 | P1 |
| `PolicyCard` | 政策信息卡片 | P2 |

---

## 三、API 集成方案

### 3.1 用户认证（访客模式）

> **Demo 阶段策略**：纯访客模式 + 后端限流，无需登录

| 策略 | 实现方式 | 目的 |
|-----|---------|------|
| **匿名身份** | localStorage 存 `guest_xxx` | 追踪用户，实现限流 |
| **每日限流** | 每用户每天 50 次 API 调用 | 防止 Token 被滥用 |
| **频率限制** | 每分钟最多 10 次请求 | 防止暴力调用 |

**限流实现**（Demo 阶段用内存 Map，生产环境用 Redis）：

```typescript
// middleware/rateLimiter.ts
const memoryStore = new Map<string, { count: number; expiresAt: number }>();

function memoryIncr(key: string, ttl: number): number {
  const now = Date.now();
  const record = memoryStore.get(key);
  if (record && record.expiresAt > now) {
    record.count++;
    return record.count;
  }
  memoryStore.set(key, { count: 1, expiresAt: now + ttl * 1000 });
  return 1;
}
```

### 3.2 SSE 流式对话

**后端代理层** (`app/api/coze-proxy/chat/route.ts`)：

```typescript
export async function POST(request: NextRequest) {
  const { message, conversation_id, user_id } = await request.json();

  const response = await fetch('https://api.coze.cn/v3/chat', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.COZE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      bot_id: process.env.COZE_BOT_ID,
      user_id,
      stream: true,
      conversation_id,
      auto_save_history: true,
      additional_messages: [{
        role: 'user',
        content: message,
        content_type: 'text'
      }]
    })
  });

  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  });
}
```

**前端消费** (`hooks/useCozeChat.ts`)：

```typescript
// 关键：Buffer 积累处理 SSE 分包
bufferRef.current += decoder.decode(value, { stream: true });
const events = bufferRef.current.split('\n\n');
bufferRef.current = events.pop() || '';

for (const event of events) {
  // 解析 SSE 事件
  if (data.event === 'conversation.message.delta') {
    updateLastMessage(prev => ({
      content: prev.content + (data.data?.content || '')
    }));
  }
}
```

### 3.3 工作流集成

**环境变量配置**：

```env
COZE_ACCESS_TOKEN=pat_xxx
COZE_BOT_ID=7612888206888157221
COZE_WORKFLOW_GENERATE_QUESTIONS=7612303629550125108
COZE_WORKFLOW_INTERVIEW_NEXT=7612544427673583642
COZE_WORKFLOW_EVALUATE=7612307764006780970
COZE_WORKFLOW_FORCE_FINISH=7612544535570972672
```

**工作流调用**：

```typescript
async function generateQuestions(jobTitle: string) {
  const res = await fetch('/api/coze-proxy/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow_id: process.env.COZE_WORKFLOW_GENERATE_QUESTIONS,
      parameters: { job_title: jobTitle }
    })
  });
  return res.json();
}
```

---

## 四、状态管理

### 4.1 Store 结构

| Store | 文件 | 功能 |
|-------|------|------|
| `useChatStore` | `stores/chatStore.ts` | 消息列表、当前会话、输入状态 |
| `useConversationStore` | `stores/conversationStore.ts` | 会话列表、历史记录 |

### 4.2 消息类型定义

```typescript
type Message =
  | TextMessage           // 文本消息
  | JobCardMessage        // 岗位卡片
  | InterviewProgressMessage  // 面试进度
  | ReportMessage;        // 评估报告
```

### 4.3 会话持久化策略

| 存储位置 | 内容 | 说明 |
|---------|------|------|
| **Coze 云端** | 完整对话历史 | `auto_save_history: true` |
| **localStorage** | 最近 10 条会话列表 | 加速冷启动 |

---

## 五、错误处理与降级

### 5.1 错误边界

| 错误类型 | 降级策略 |
|---------|---------|
| **SSE 断线** | 自动重连（最多 3 次，指数退避） |
| **SSE 超时** | 30s 无响应视为超时，提供重试按钮 |
| **工作流失败** | 返回错误信息，引导用户重试 |
| **API 限流** | 请求队列 + 等待提示 |
| **网络离线** | 缓存消息待重连后发送 |

### 5.2 微信浏览器兼容

```typescript
// 检测微信环境，降级为短轮询
if (/MicroMessenger/i.test(navigator.userAgent)) {
  return usePollingChat();  // 每 500ms 轮询
} else {
  return useSSEChat();      // 正常 SSE
}
```

### 5.3 简历上传安全

| 检查项 | 限制 |
|-------|------|
| 文件类型 | PDF, DOC, DOCX, 图片 |
| 文件大小 | 最大 10MB |
| 上传频率 | 每分钟最多 5 次 |

---

## 六、UI 设计规范

### 6.1 色彩系统

| 名称 | 色值 | 用途 |
|-----|------|------|
| 主色 | `#1677FF` | 品牌色、AI 消息背景 |
| 用户消息 | `#1677FF` | 用户消息气泡 |
| 成功 | `#52C41A` | 评估等级 A |
| 警告 | `#FAAD14` | 评估等级 B |
| 错误 | `#FF4D4F` | 评估等级 C |

### 6.2 间距规范

| 元素 | 间距 |
|-----|------|
| 消息间距 | 16px |
| 消息内边距 | 12px 16px |
| 气泡圆角 | 12px |
| 卡片圆角 | 8px |
| 输入框高度 | 44px |

### 6.3 动效规范

| 场景 | 时长 |
|-----|------|
| 消息出现 | 200ms |
| 打字效果 | 30ms/字 |
| 卡片展开 | 300ms |

---

## 七、实现计划

| Phase | 内容 | 工时 |
|-------|------|------|
| Phase 1 | 基础设施（API 代理层、Store） | 2-3 天 |
| Phase 2 | 聊天 UI（Ant Design X 集成） | 3-4 天 |
| Phase 3 | 会话管理（列表、持久化） | 2 天 |
| Phase 4 | 求职场景（岗位卡片、面试面板） | 3-4 天 |
| Phase 5 | 落地页（移动端适配） | 1-2 天 |
| **总计** | | **11-15 天** |

---

## 八、验收标准

### 8.1 功能验收

- [ ] 发送消息 → 收到流式响应
- [ ] 多轮对话上下文连贯
- [ ] 会话列表正确展示
- [ ] 岗位卡片正确渲染
- [ ] 面试流程完整（问题生成 → 回答 → 评估）
- [ ] 评估报告正确展示

### 8.2 性能验收

| 指标 | 目标值 |
|-----|-------|
| 首屏加载 | < 2s |
| 消息发送响应 | < 500ms |
| 流式首字 | < 1s |
| 移动端流畅度 | 60fps |

### 8.3 兼容性验收

| 平台 | 要求 |
|-----|------|
| iOS Safari | ✅ |
| Android Chrome | ✅ |
| 微信内置浏览器 | ✅ |
| 桌面 Chrome/Safari | ✅ |

---

## 九、成本控制

### 9.1 API 费用

| API 类型 | 计费方式 |
|---------|---------|
| Chat API | 按 Token 计费 |
| Workflow | 按执行次数 |
| 文件上传 | 按存储量 |

### 9.2 成本控制策略

| 策略 | 实现方式 |
|-----|---------|
| **请求去重** | 相同内容 5s 内只发送一次 |
| **响应缓存** | 岗位/政策查询结果缓存 5 分钟 |
| **流式截断** | 单次响应超过 4096 Token 时提示用户精简问题 |
| **配额监控** | 后端记录每日调用量，超过阈值告警 |

---

## 十、文件结构

```
web/src/
├── app/
│   ├── api/coze-proxy/
│   │   ├── chat/route.ts          # SSE 代理
│   │   ├── workflow/route.ts      # 工作流代理
│   │   └── upload/route.ts        # 文件上传代理
│   └── c/
│       └── page.tsx               # C 端落地页
├── components/chat/
│   ├── ChatContainer.tsx          # 聊天容器
│   ├── JobCard.tsx                # 岗位卡片
│   ├── InterviewPanel.tsx         # 面试面板
│   ├── ReportViewer.tsx           # 报告展示
│   └── ResumeUploader.tsx         # 简历上传
├── hooks/
│   ├── useCozeChat.ts             # SSE 对话 Hook
│   └── useInterviewWorkflow.ts    # 面试工作流 Hook
├── stores/
│   ├── chatStore.ts               # 聊天状态
│   └── conversationStore.ts       # 会话状态
└── lib/
    ├── userIdentity.ts            # 访客身份
    ├── rateLimiter.ts             # 限流中间件
    └── browserDetect.ts           # 浏览器检测
```

---

## 十一、相关文档

| 文档 | 路径 |
|-----|------|
| **PRD** | [docs/PRD-C端前端重构方案.md](../docs/PRD-C端前端重构方案.md) |
| **开发计划** | [plans/c-end-frontend-dev-plan.md](../plans/c-end-frontend-dev-plan.md) |
| 工作流 JSON | `client/workflows/*.json` |
| 智能体配置 | `client/config/local/wehan_bot.json` |
| **C 端代码** | `c-end/src/*` |
| B 端 API | `web/src/app/api/coze/question/*` |
| 数据模型 | `web/prisma/schema.prisma` |

---

*文档版本: 4.1 | 更新时间: 2026-03-04*
*更新内容: 项目目录调整为 c-end/, 补充相关文档链接*
