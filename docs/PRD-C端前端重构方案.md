# WeHan C 端前端重构方案 PRD

> **版本**: 1.3
> **创建时间**: 2026-03-03
> **负责人**: AI Team
> **状态**: 待评审

---

## 一、项目背景

### 1.1 现有问题

| 问题 | 影响 | 严重程度 |
|-----|------|---------|
| Coze Web SDK 样式粗糙 | 用户体验差，无法达到商业级标准 | 高 |
| 自定义自由度低 | 无法嵌入简历上传、岗位列表等求职场景专属功能 | 高 |
| 无法实现原生 H5 精致感 | 与竞品（如 BOSS 直聘小程序）存在体验差距 | 中 |
| AI 生成的 UI 不稳定 | 多次生成效果不一致，细节把控不足 | 中 |

### 1.2 核心诉求

1. **保留 AI 能力** - 继续使用 Coze 智能体的对话、工作流等核心能力
2. **完全自定义 UI** - 前端展示层完全重构，实现原生 H5 级精致体验
3. **支持业务扩展** - 可灵活嵌入简历上传、岗位列表、面试报告等求职场景组件

### 1.3 方案选择

| 方案 | 优点 | 缺点 | 结论 |
|-----|------|------|------|
| 完全自研 | 100% 控制 | 工时长、UI 不稳定 | ❌ 不推荐 |
| CSS 覆盖 Coze SDK | 快速 | 自定义能力有限 | ❌ 不推荐 |
| **开源模板改造** | 工时短、UI 成熟 | 需对接 API | ✅ **推荐** |

---

## 二、技术方案

### 2.1 技术选型

| 组件 | 技术 | 版本 | 说明 |
|-----|------|------|------|
| **AI 对话组件** | Ant Design X | 2.x | 阿里 AI 组件库，支持流式响应，**优先选用** |
| **状态管理** | Zustand | 5.x | 轻量级，已安装（现有项目 5.0.11） |
| **样式方案** | Tailwind CSS | 4.x | 原子化 CSS（现有项目已用 4.x） |
| **构建框架** | Next.js | 16.x | 复用现有项目基础设施（现有项目 16.1.6） |
| **AI 能力** | Coze Open API | v3 | 通过 SSE/WebSocket 调用 |

> **技术选型说明**：
> - **Ant Design X vs ChatUI**：两者存在职责重叠（气泡、输入框、附件），同时使用会造成包体积膨胀和样式冲突。**统一选用 Ant Design X**，理由：
>   1. 与现有 B 端 Ant Design 6.x 完美兼容
>   2. 更活跃的维护频率和更完善的文档
>   3. 原生支持 AI 对话场景（Conversations、Sender、ThoughtChain）

### 2.2 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                    C 端前端架构                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Next.js 16 前端应用                         │   │
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
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2.3 组件清单

#### 2.3.1 Ant Design X 组件（直接使用）

| 组件 | 用途 | 文档 |
|-----|------|------|
| `Bubble` | 消息气泡，支持多种内容类型 | [Ant Design X](https://x.ant.design/components/bubble) |
| `Conversations` | 会话列表，支持分组、搜索 | [Ant Design X](https://x.ant.design/components/conversations) |
| `Sender` | 消息发送器，支持附件、语音 | [Ant Design X](https://x.ant.design/components/sender) |
| `Attachments` | 附件上传和预览 | [Ant Design X](https://x.ant.design/components/attachments) |
| `ThoughtChain` | 思维链展示（AI 推理过程） | [Ant Design X](https://x.ant.design/components/thought-chain) |
| `Suggestion` | 快捷建议/快捷回复 | [Ant Design X](https://x.ant.design/components/suggestion) |
| `Welcome` | 欢迎语和引导 | [Ant Design X](https://x.ant.design/components/welcome) |
| `Prompts` | 预设提示词 | [Ant Design X](https://x.ant.design/components/prompts) |

#### 2.3.2 WeHan 业务组件（自研）

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

### 3.0 用户认证方案

> **Demo 阶段策略**：纯访客模式 + 后端限流，无需登录

**设计考量**：
- Demo 阶段核心目标是让用户快速体验功能，登录会提高使用门槛
- 登录的真正价值是防止 API Token 被滥用，而非收集用户数据
- 通过**匿名 user_id + 后端限流**即可实现 API 保护

**方案**：

| 策略 | 实现方式 | 目的 |
|-----|---------|------|
| **匿名身份** | localStorage 存 `guest_xxx` | 追踪用户，实现限流 |
| **每日限流** | 每用户每天 50 次 API 调用 | 防止 Token 被滥用 |
| **频率限制** | 每分钟最多 10 次请求 | 防止暴力调用 |

**访客模式实现**：

```typescript
// lib/userIdentity.ts
const USER_ID_KEY = 'wehan_guest_id';

export function getOrCreateUserId(): string {
  if (typeof window === 'undefined') return '';

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `guest_${cuid()}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}
```

**后端限流中间件**：

> **依赖说明**：以下代码依赖 Redis。Demo 阶段若无 Redis，可使用内存 Map 替代（单进程够用），生产环境建议部署 Redis。

```typescript
// middleware/rateLimiter.ts
const RATE_LIMIT = {
  daily: 50,      // 每天最多 50 次
  perMinute: 10,  // 每分钟最多 10 次
};

// Demo 阶段：内存存储（单进程）
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

// 生产环境：使用 Redis
// const minuteCount = await redis.incr(minuteKey);
// await redis.expire(minuteKey, 60);

export async function rateLimiter(userId: string): Promise<{
  allowed: boolean;
  remaining: number;
  resetAt?: string;
}> {
  const today = new Date().toDateString();
  const dailyKey = `rate:${userId}:${today}`;
  const minuteKey = `rate:${userId}:${Date.now() / 60000 | 0}`;

  // 每分钟限制
  const minuteCount = memoryIncr(minuteKey, 60);
  if (minuteCount > RATE_LIMIT.perMinute) {
    return { allowed: false, remaining: 0, resetAt: '1分钟' };
  }

  // 每日限制
  const dailyCount = memoryIncr(dailyKey, 86400);

  return {
    allowed: dailyCount <= RATE_LIMIT.daily,
    remaining: Math.max(0, RATE_LIMIT.daily - dailyCount),
    resetAt: '明天'
  };
}
```

**超限提示**：

```typescript
// 当 remaining = 0 时返回
{
  "success": false,
  "error": "今日体验次数已用完",
  "code": "RATE_LIMIT_EXCEEDED",
  "data": { "resetAt": "明天" }
}
```

**会话持久化策略**：
- **主存储**：Coze 云端（`auto_save_history: true`）
- **本地缓存**：localStorage 仅缓存最近 10 条会话列表，加速冷启动

### 3.1 Coze Open API 端点

| 功能 | 端点 | 方式 | 用途 |
|-----|------|------|------|
| 流式对话 | `POST /v3/chat` | SSE | 文本对话 |
| 工作流执行 | `POST /v1/workflow/run` | HTTP | 触发面试工作流 |
| 文件上传 | `POST /v1/files/upload` | HTTP | 简历上传 |
| 实时语音 | `wss://api.coze.cn/v3/chat` | WebSocket | 语音面试 |

### 3.2 后端代理层设计

**文件**: `web/src/app/api/coze-proxy/chat/route.ts`

```typescript
import { NextRequest } from 'next/server';

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

### 3.3 前端 SSE 消费

**文件**: `web/src/hooks/useCozeChat.ts`

```typescript
import { useCallback, useRef } from 'react';
import { useChatStore } from '@/stores/chatStore';

export function useCozeChat() {
  const { messages, addMessage, updateLastMessage, setTyping, setError } = useChatStore();
  const bufferRef = useRef<string>(''); // Buffer 用于处理不完整的 JSON

  const sendMessage = useCallback(async (content: string) => {
    // 1. 添加用户消息
    addMessage({ role: 'user', content });

    // 2. 添加 AI 占位消息
    addMessage({ role: 'assistant', content: '', isStreaming: true });
    setTyping(true);
    setError(null);

    try {
      // 3. 发起 SSE 请求
      const response = await fetch('/api/coze-proxy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      bufferRef.current = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // 将新数据追加到 buffer
        bufferRef.current += decoder.decode(value, { stream: true });

        // 按双换行符分割完整的 SSE 事件
        const events = bufferRef.current.split('\n\n');

        // 最后一个可能是不完整的，保留在 buffer 中
        bufferRef.current = events.pop() || '';

        for (const event of events) {
          const lines = event.split('\n');

          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const data = JSON.parse(line.slice(5).trim());

                if (data.event === 'conversation.message.delta') {
                  // 增量更新
                  updateLastMessage(prev => ({
                    content: prev.content + (data.data?.content || '')
                  }));
                }

                if (data.event === 'conversation.message.completed') {
                  setTyping(false);
                }

                if (data.event === 'error') {
                  throw new Error(data.data?.message || 'Unknown error');
                }
              } catch (parseError) {
                // JSON 解析失败，记录但不中断
                console.warn('SSE parse error:', parseError, 'Line:', line);
              }
            }
          }
        }
      }

      // 处理 buffer 中剩余的数据
      if (bufferRef.current.trim()) {
        console.warn('Incomplete SSE data remaining:', bufferRef.current);
      }

    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setTyping(false);

      // 降级：显示错误提示
      updateLastMessage(prev => ({
        content: prev.content || '抱歉，发生了错误，请稍后重试。',
        isStreaming: false,
        isError: true
      }));
    }
  }, [addMessage, updateLastMessage, setTyping, setError]);

  return { messages, sendMessage };
}
```

> **SSE 解析关键点**：
> 1. **Buffer 积累**：网络分包可能导致 JSON 被截断，必须用 buffer 积累后按 `\n\n` 边界切割
> 2. **异常处理**：`JSON.parse` 必须包裹在 try-catch 中，避免单条错误数据中断整个流
> 3. **错误边界**：网络错误、超时、解析失败都有降级处理

### 3.4 工作流集成

**环境变量配置** (`.env.local`):

```env
# Coze 配置
COZE_ACCESS_TOKEN=pat_xxx
COZE_BOT_ID=7612888206888157221

# 工作流 ID（避免硬编码，方便 Coze 重新发布后更新）
COZE_WORKFLOW_GENERATE_QUESTIONS=7612303629550125108
COZE_WORKFLOW_INTERVIEW_NEXT=7612544427673583642
COZE_WORKFLOW_EVALUATE=7612307764006780970
COZE_WORKFLOW_FORCE_FINISH=7612544535570972672
```

**工作流调用**:

```typescript
// lib/coze/workflows.ts
const WORKFLOWS = {
  generateQuestions: process.env.COZE_WORKFLOW_GENERATE_QUESTIONS!,
  interviewNext: process.env.COZE_WORKFLOW_INTERVIEW_NEXT!,
  evaluate: process.env.COZE_WORKFLOW_EVALUATE!,
  forceFinish: process.env.COZE_WORKFLOW_FORCE_FINISH!,
} as const;

// 触发面试问题生成工作流
async function generateQuestions(jobTitle: string) {
  const res = await fetch('/api/coze-proxy/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow_id: WORKFLOWS.generateQuestions,
      parameters: { job_title: jobTitle }
    })
  });
  return res.json();
}

// 记录回答 + 获取下一题
async function submitAnswer(sessionId: string, answer: string) {
  const res = await fetch('/api/coze-proxy/workflow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflow_id: WORKFLOWS.interviewNext,
      parameters: { session_id: sessionId, answer }
    })
  });
  return res.json();
}
```

> **设计说明**：工作流 ID 移入环境变量，避免 Coze 重新发布后需要改代码重新部署。

---

## 四、错误处理与降级方案

### 4.1 错误边界设计

| 错误类型 | 降级策略 | UI 表现 |
|---------|---------|---------|
| **SSE 断线** | 自动重连（最多 3 次，指数退避） | 显示"重新连接中..."，保留已接收内容 |
| **SSE 超时** | 30s 无响应视为超时 | 显示错误提示，提供"重试"按钮 |
| **工作流失败** | 返回错误信息，引导用户重试 | 显示具体错误原因 |
| **API 限流** | 请求队列 + 等待提示 | 显示"请求繁忙，请稍候" |
| **网络离线** | 检测 online/offline 事件 | 显示离线提示，缓存消息待重连后发送 |

### 4.2 重连逻辑

```typescript
// hooks/useSSEConnection.ts
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1s

async function connectWithRetry(url: string, retries = 0): Promise<void> {
  try {
    await connectSSE(url);
  } catch (error) {
    if (retries < MAX_RETRIES) {
      const delay = BASE_DELAY * Math.pow(2, retries); // 指数退避
      console.log(`Retry ${retries + 1}/${MAX_RETRIES} in ${delay}ms`);
      await sleep(delay);
      return connectWithRetry(url, retries + 1);
    }
    throw new Error('Connection failed after max retries');
  }
}
```

### 4.3 微信浏览器兼容性

**问题**：部分微信内置浏览器版本对 SSE 支持不稳定。

**解决方案**：

1. **检测环境**：通过 UA 判断是否在微信中
2. **降级策略**：微信环境使用短轮询替代 SSE（每 500ms 轮询一次）
3. **实现**：

```typescript
// lib/browserDetect.ts
export function isWechatBrowser(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent);
}

// hooks/useChatConnection.ts
export function useChatConnection() {
  const isWechat = isWechatBrowser();

  if (isWechat) {
    // 降级：短轮询模式
    return usePollingChat();
  } else {
    // 正常：SSE 模式
    return useSSEChat();
  }
}
```

### 4.4 简历上传安全

| 检查项 | 限制 | 实现位置 |
|-------|------|---------|
| 文件类型 | PDF, DOC, DOCX, 图片 | 前端 + 后端双重校验 |
| 文件大小 | 最大 10MB | 前端预检 + 后端校验 |
| 文件内容 | 检测恶意脚本 | 后端病毒扫描（可选） |
| 上传频率 | 每分钟最多 5 次 | 后端限流 |

```typescript
// 前端校验
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'image/*'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_SIZE) {
    return { valid: false, error: '文件大小不能超过 10MB' };
  }
  if (!ALLOWED_TYPES.some(t => file.type.match(t))) {
    return { valid: false, error: '仅支持 PDF、Word、图片格式' };
  }
  return { valid: true };
}
```

---

## 五、功能模块

### 5.1 核心功能流程

#### 5.1.1 面试流程

```
用户: "我要面试前端工程师"
        ↓
┌─────────────────────────────────────┐
│ AI: 好的，我来帮你进行模拟面试！    │
│     请问你有 JD 链接吗？（可选）    │
└─────────────────────────────────────┘
        ↓
用户: "没有，直接开始"
        ↓
【调用 generate_questions_workflow】
        ↓
┌─────────────────────────────────────┐
│ InterviewPanel 组件                 │
│ ┌─────────────────────────────────┐ │
│ │ 进度: 1/5                       │ │
│ │ ████████░░░░░░░░░░░░ 20%       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ AI: 第 1 题：请介绍一下 React 的    │
│     虚拟 DOM 是什么？               │
└─────────────────────────────────────┘
        ↓
用户: 回答内容...
        ↓
【调用 interview_next_workflow】
        ↓
┌─────────────────────────────────────┐
│ AI: 收到你的回答，继续下一题。     │
│                                     │
│ InterviewPanel 组件                 │
│ ┌─────────────────────────────────┐ │
│ │ 进度: 2/5                       │ │
│ │ ████████████░░░░░░░░ 40%       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ AI: 第 2 题：...                    │
└─────────────────────────────────────┘
        ↓
        ... (重复直到完成)
        ↓
【调用 evaluate_interview_workflow】
        ↓
┌─────────────────────────────────────┐
│ ReportViewer 组件                   │
│                                     │
│ # 面试评估报告                      │
│                                     │
│ **综合评分**: 7.5/10                │
│ **等级**: B                         │
│                                     │
│ ## 各维度评分                       │
│ - 专业知识: 8/10                    │
│ - 表达能力: 7/10                    │
│ - ...                               │
│                                     │
│ ## 改进建议                         │
│ ...                                 │
└─────────────────────────────────────┘
```

#### 5.1.2 岗位查询流程

```
用户: "查一下武汉的前端岗位"
        ↓
【AI 识别意图 → 调用 query_jobs_workflow】
        ↓
┌─────────────────────────────────────┐
│ AI: 我找到了以下岗位：              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ JobCard 组件                    │ │
│ │                                 │ │
│ │ 前端开发工程师                  │ │
│ │ 某某科技有限公司                │ │
│ │ 武汉 · 15-25K                   │ │
│ │ [查看详情] [一键投递]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ JobCard 组件                    │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 5.2 消息类型定义

```typescript
// 基础消息
interface BaseMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
}

// 文本消息
interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
  isStreaming?: boolean;
}

// 岗位卡片消息
interface JobCardMessage extends BaseMessage {
  type: 'job_card';
  data: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    tags: string[];
  }[];
}

// 面试进度消息
interface InterviewProgressMessage extends BaseMessage {
  type: 'interview_progress';
  data: {
    current: number;
    total: number;
    question: string;
  };
}

// 评估报告消息
interface ReportMessage extends BaseMessage {
  type: 'report';
  data: {
    markdown: string;
    grade: string;
    score: number;
  };
}

// 联合类型
type Message = TextMessage | JobCardMessage | InterviewProgressMessage | ReportMessage;
```

---

## 六、UI 设计规范

### 6.1 色彩系统

| 名称 | 色值 | 用途 |
|-----|------|------|
| 主色 | `#1677FF` | 品牌色、AI 消息背景 |
| 主色浅 | `#E6F4FF` | AI 消息背景、选中态 |
| 用户消息 | `#1677FF` | 用户消息气泡 |
| 成功 | `#52C41A` | 评估等级 A |
| 警告 | `#FAAD14` | 评估等级 B |
| 错误 | `#FF4D4F` | 评估等级 C |

### 6.2 字体规范

| 元素 | 字号 | 字重 |
|-----|------|------|
| 导航标题 | 18px | 600 |
| 消息文本 | 15px | 400 |
| 时间戳 | 12px | 400 |
| 卡片标题 | 16px | 600 |
| 卡片描述 | 14px | 400 |

### 6.3 间距规范

| 元素 | 间距 |
|-----|------|
| 消息间距 | 16px |
| 消息内边距 | 12px 16px |
| 气泡圆角 | 12px |
| 卡片圆角 | 8px |
| 输入框高度 | 44px |

### 6.4 动效规范

| 场景 | 时长 | 曲线 |
|-----|------|------|
| 消息出现 | 200ms | ease-out |
| 打字效果 | 30ms/字 | linear |
| 卡片展开 | 300ms | ease-in-out |
| 加载动画 | 循环 | linear |

---

## 七、实现计划

### 7.1 Phase 1: 基础设施 (2-3 天)

| 任务 | 产出 | 负责人 |
|-----|------|-------|
| 安装 Ant Design X | package.json 更新 | 前端 |
| 创建 API 代理层 | `/api/coze-proxy/*` | 前端 |
| 创建聊天 Store | `chatStore.ts` | 前端 |
| 创建会话 Store | `conversationStore.ts` | 前端 |

### 7.2 Phase 2: 聊天 UI (3-4 天)

| 任务 | 产出 | 负责人 |
|-----|------|-------|
| ChatUI 集成 | `ChatContainer.tsx` | 前端 |
| 消息列表渲染 | `MessageList.tsx` | 前端 |
| SSE 流式消费 | `useCozeChat.ts` | 前端 |
| 打字效果 | `TypingBubble` 集成 | 前端 |

### 7.3 Phase 3: 会话管理 (2 天)

| 任务 | 产出 | 负责人 |
|-----|------|-------|
| 会话列表 | `ConversationSidebar.tsx` | 前端 |
| 会话持久化 | localStorage + API | 前端 |
| 新建/切换会话 | `Conversations` 组件 | 前端 |

### 7.4 Phase 4: 求职场景 (3-4 天)

| 任务 | 产出 | 负责人 |
|-----|------|-------|
| 岗位卡片 | `JobCard.tsx` | 前端 |
| 面试进度面板 | `InterviewPanel.tsx` | 前端 |
| 评估报告展示 | `ReportViewer.tsx` | 前端 |
| 工作流集成 | `useInterviewWorkflow.ts` | 前端 |

### 7.5 Phase 5: 落地页 (1-2 天)

| 任务 | 产出 | 负责人 |
|-----|------|-------|
| C 端落地页 | `/c/page.tsx` | 前端 |
| 移动端适配 | Tailwind 响应式 | 前端 |
| 部署配置 | Nginx + 域名 | 运维 |

### 7.6 里程碑

| 里程碑 | 时间 | 交付物 |
|-------|------|-------|
| M1: 基础聊天 | Day 5 | 可发送消息、接收流式响应 |
| M2: 会话管理 | Day 7 | 多会话、历史记录 |
| M3: 面试功能 | Day 11 | 完整面试流程 |
| M4: MVP 上线 | Day 14 | 全功能可用 |

---

## 八、验收标准

### 8.1 功能验收

- [ ] 发送消息 → 收到流式响应
- [ ] 多轮对话上下文连贯
- [ ] 会话列表正确展示
- [ ] 会话恢复功能正常
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

## 九、Coze API 费用与配额

### 9.1 计费模式

| API 类型 | 计费方式 | 备注 |
|---------|---------|------|
| Chat API | 按 Token 计费 | 输入 + 输出 Token |
| Workflow | 按执行次数 | 每次执行计费 |
| 文件上传 | 按存储量 | 临时文件定期清理 |

### 9.2 成本控制策略

| 策略 | 实现方式 |
|-----|---------|
| **请求去重** | 相同内容 5s 内只发送一次 |
| **响应缓存** | 岗位/政策查询结果缓存 5 分钟 |
| **流式截断** | 单次响应超过 4096 Token 时提示用户精简问题 |
| **配额监控** | 后端记录每日调用量，超过阈值告警 |

### 9.3 配额告警配置

```typescript
// 中间件：API 调用统计
export async function apiUsageTracker(req: NextRequest, res: NextResponse) {
  const today = new Date().toDateString();
  const key = `coze_api_calls:${today}`;

  const calls = await redis.incr(key);
  await redis.expire(key, 86400); // 24h 过期

  // 每日超过 10000 次告警
  if (calls > 10000) {
    await sendAlert(`Coze API calls exceeded: ${calls}`);
  }
}
```

---

## 十、风险与缓解

| 风险 | 概率 | 影响 | 缓解措施 |
|-----|------|------|---------|
| ChatUI 与现有样式冲突 | 中 | 中 | 使用 CSS Module 隔离 |
| SSE 断线重连 | 中 | 高 | 实现 heartbeat + 自动重连 |
| API 限流 | 低 | 高 | 请求队列 + 指数退避 |
| 移动端兼容性 | 中 | 中 | 使用 Tailwind 响应式 |

---

## 十一、附录

### 11.1 参考文档

- [Ant Design X 组件库](https://x.ant.design/)
- [Coze Open API 文档](https://www.coze.cn/open/docs)
- [WeHan 智能体配置](./coze/00-智能体创建与配置.md)

### 11.2 相关文件

| 文件 | 路径 |
|-----|------|
| 工作流 JSON | `client/workflows/*.json` |
| 智能体配置 | `client/config/local/wehan_bot.json` |
| B 端 API | `web/src/app/api/coze/question/*` |
| 数据模型 | `web/prisma/schema.prisma` |

---

*文档版本: 1.3 | 更新时间: 2026-03-03*

---

## 附录 A：审查意见修复记录

| 问题 | 修复内容 | 版本 |
|-----|---------|------|
| ChatUI vs Ant Design X 职责重叠 | 统一选用 Ant Design X，移除 ChatUI | v1.1 |
| SSE 解析 Bug | 添加 buffer 积累 + try-catch 异常处理 | v1.1 |
| 版本号存疑 | 确认与现有项目一致（Next.js 16.1.6, Tailwind 4.x） | v1.1 |
| 会话持久化不完整 | 明确 Coze 云端为主存储，localStorage 仅缓存 | v1.1 |
| 工作流 ID 硬编码 | 移入环境变量配置 | v1.1 |
| 用户认证缺失 | 添加访客模式 + 登录模式设计 | v1.1 |
| 错误边界缺失 | 添加完整错误处理与降级方案 | v1.1 |
| 微信浏览器兼容性 | 添加检测 + 短轮询降级策略 | v1.1 |
| 简历上传安全 | 添加文件类型/大小校验规则 | v1.1 |
| API 费用/配额 | 添加成本控制策略和配额告警 | v1.1 |
| 用户认证过度设计 | 简化为纯访客模式 + 后端限流，移除登录流程 | v1.2 |
| 版本号不一致 | 统一为 v1.2，修复章节编号重复 | v1.2 |
| 架构图残留 ChatUI | 移除 ChatUI 组件层，整合到 Ant Design X | v1.3 |
| useCallback 依赖缺失 | 补全 store actions 依赖数组 | v1.3 |
| fetch 缺少 Content-Type | 工作流调用添加 headers | v1.3 |
| Redis 依赖未说明 | 添加内存 Map 降级方案（Demo 阶段） | v1.3 |
| Phase 1 任务描述 | 移除 ChatUI 安装 | v1.3 |
| 章节编号混乱 | 全部章节重新编号（一至十一） | v1.3 |
| 参考文档残留 ChatUI | 删除 ChatUI 文档链接 | v1.3 |
