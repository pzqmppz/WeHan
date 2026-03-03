# C 端前端开发计划

> **版本**: 1.2
> **生成时间**: 2026-03-04
> **预计工时**: 11-15 天
> **状态**: Phase 1 完成，**项目位置**: `c-end/`

---

## 概览

基于 Next.js 16 + Ant Design X + Zustand 构建自研 C 端前端，集成 Coze Open API。

**核心架构**：
- 前端: Next.js 16 + Ant Design X + Zustand + Tailwind CSS
- 后端代理: `/api/coze-proxy/*`
- AI 能力: Coze Open API (SSE + Workflow)

---

## Phase 1: 基础设施层 (2-3 天)

| 任务 | 文件 | 代码行数 | 风险 |
|-----|------|---------|------|
| 类型定义 | `types/chat.ts` | ~180 | Low |
| 访客身份管理 | `lib/userIdentity.ts` | ~80 | Low |
| 浏览器检测 | `lib/browserDetect.ts` | ~60 | Low |
| 限流工具函数 | `lib/rateLimiter.ts` | ~100 | Low |
| 工作流封装 | `lib/coze/workflows.ts` | ~120 | Low |
| SSE 对话代理 | `app/api/coze-proxy/chat/route.ts` | ~120 | Medium |
| 工作流代理 | `app/api/coze-proxy/workflow/route.ts` | ~100 | Low |
| 聊天状态管理 | `stores/chatStore.ts` | ~150 | Low |
| 会话状态管理 | `stores/conversationStore.ts` | ~120 | Low |
| **错误边界组件** | `components/chat/ErrorBoundary.tsx` | ~80 | Low |

> **说明**：`rateLimiter.ts` 是工具函数，由 API route handler 手动调用（非 Next.js middleware）。Demo 阶段使用内存 Map 实现，无需 Redis。

---

## Phase 2: 聊天 UI 层 (3-4 天)

| 任务 | 文件 | 代码行数 | 风险 |
|-----|------|---------|------|
| **SSE 对话 Hook** | `hooks/useCozeChat.ts` | ~250 | **High** |
| 聊天容器组件 | `components/chat/ChatContainer.tsx` | ~300 | Medium |
| C 端落地页 | `app/c/page.tsx` | ~200 | Low |

---

## Phase 3: 会话管理 (2 天)

| 任务 | 文件 | 代码行数 | 风险 |
|-----|------|---------|------|
| 会话列表组件 | `components/chat/ConversationList.tsx` | ~150 | Low |
| 会话持久化 | `hooks/useConversationPersistence.ts` | ~120 | Low |
| 会话恢复 | `hooks/useSessionRecovery.ts` | ~100 | Medium |

---

## Phase 4: 求职场景组件 (3-4 天)

| 任务 | 文件 | 代码行数 | 风险 |
|-----|------|---------|------|
| 岗位卡片 | `components/chat/JobCard.tsx` | ~150 | Low |
| **面试工作流 Hook** | `hooks/useInterviewWorkflow.ts` | ~200 | Medium |
| 面试进度面板 | `components/chat/InterviewPanel.tsx` | ~200 | Low |
| 评估报告展示 | `components/chat/ReportViewer.tsx` | ~180 | Low |
| 简历上传 | `components/chat/ResumeUploader.tsx` | ~150 | Low |

---

## Phase 5: 优化与测试 (1-2 天)

| 任务 | 文件 | 代码行数 | 风险 |
|-----|------|---------|------|
| 离线缓存 | `hooks/useOfflineCache.ts` | ~100 | Medium |
| 性能优化 | 虚拟列表、懒加载 | - | Medium |
| 兼容性测试 | iOS/Android/微信 | - | Medium |

---

## 文件总览 (18 个新文件)

```
c-end/src/
├── app/
│   ├── api/coze-proxy/
│   │   ├── chat/route.ts          (~120 行)
│   │   └── workflow/route.ts      (~100 行)
│   └── page.tsx                   (~200 行)
├── components/chat/
│   ├── ChatContainer.tsx          (~300 行)
│   ├── ConversationList.tsx       (~150 行)
│   ├── JobCard.tsx                (~150 行)
│   ├── InterviewPanel.tsx         (~200 行)
│   ├── ReportViewer.tsx           (~180 行)
│   ├── ResumeUploader.tsx         (~150 行)
│   └── ErrorBoundary.tsx          (~80 行) ← Phase 1
├── hooks/
│   ├── useCozeChat.ts             (~250 行) ⚠️
│   ├── useInterviewWorkflow.ts    (~200 行)
│   ├── useConversationPersistence.ts (~120 行)
│   ├── useSessionRecovery.ts      (~100 行)
│   └── useOfflineCache.ts         (~100 行)
├── stores/
│   ├── chatStore.ts               (~150 行)
│   └── conversationStore.ts       (~120 行)
├── lib/
│   ├── userIdentity.ts            (~80 行)
│   ├── rateLimiter.ts             (~100 行) ← 工具函数
│   ├── browserDetect.ts           (~60 行)
│   └── coze/
│       └── workflows.ts           (~120 行) ← 新增
└── types/
    └── chat.ts                    (~180 行) ← 调整
```

**总代码量**: ~2,800 行

---

## 风险与缓解

| 风险 | 级别 | 缓解措施 |
|-----|------|---------|
| **SSE Buffer 处理** | High | 参考框架文档 Buffer 积累模式 |
| **微信浏览器兼容** | High | 降级为轮询方案 |
| Coze API 限流 | Medium | 请求队列 + 等待提示 |
| 网络断线 | Medium | 自动重连 + 离线缓存 |

---

## 审查意见修复记录

| 问题 | 修复内容 | 版本 |
|-----|---------|------|
| `lib/coze/workflows.ts` 遗漏 | 添加到 Phase 1 + 文件总览 | v1.1 |
| `rateLimiter` 定位不清 | 明确为工具函数（非 middleware），Demo 阶段用内存 Map | v1.1 |
| `ErrorBoundary` 时机过晚 | 移至 Phase 1 末尾 | v1.1 |
| Redis 依赖未说明 | 明确 Demo 阶段使用内存 Map，无需 Redis | v1.1 |
| `types/chat.ts` 行数低估 | 从 ~100 调整为 ~180 行 | v1.1 |

---

## 验收标准

- [ ] SSE 流式对话：1s 内收到首字
- [ ] 多轮对话：5 轮上下文正确
- [ ] 会话列表：显示最近 10 条
- [ ] 岗位卡片：正确渲染
- [ ] 面试流程：问题→回答→报告完整
- [ ] 评估报告：评分/维度/建议展示
- [ ] 移动端适配：375-768px
- [ ] 微信兼容：降级轮询正常
- [ ] 首屏加载：< 2s

---

## 依赖安装

```bash
cd c-end
npm install
```

> **Redis 说明**：Demo 阶段使用内存 Map 实现限流，无需安装 Redis。生产环境可考虑迁移到 Redis。

---

## 环境变量

```env
# Coze API
COZE_ACCESS_TOKEN=pat_xxx
COZE_BOT_ID=7612888206888157221
COZE_WORKFLOW_GENERATE_QUESTIONS=7612303629550125108
COZE_WORKFLOW_INTERVIEW_NEXT=7612544427673583642
COZE_WORKFLOW_EVALUATE=7612307764006780970
COZE_WORKFLOW_FORCE_FINISH=7612544535570972672
```

---

## 附录：审查意见修复记录

| 问题 | 修复内容 | 版本 |
|-----|---------|------|
| `lib/coze/workflows.ts` 未列入 | 补充到文件总览 | v1.1 |
| `rateLimiter` 职责不清 | 明确为 lib 工具函数（非 middleware） | v1.1 |
| `ErrorBoundary` 时机过晚 | 移至 Phase 1 末尾 | v1.1 |
| Redis 依赖未说明 | 明确 Demo 阶段使用内存 Map，无需 Redis | v1.1 |
| `types/chat.ts` 行数低估 | 从 ~100 调整为 ~180 行 | v1.1 |

---

*等待用户确认后开始实施*
