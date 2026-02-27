# WeHan 求职助手 C 端 Coze 智能体 技术设计文档
**文档版本**：v1.0
**更新时间**：2026-02-28
**适用人员**：后端开发、前端开发、测试、联调人员
**核心场景**：武汉高校毕业生求职 AI 助手（面试模拟/简历解析/岗位匹配/心理疏导）

---

## 1 文档概述
### 1.1 设计目的
- 规范 WeHan 求职助手在 **Coze 智能体 + 豆包入口** 的整体技术方案
- 明确 C 端与 B 端数据互通、AI 工作流、实时语音的实现逻辑
- 统一异常处理、接口规范、易错点与验收标准
- 降低团队联调成本，避免线上故障

### 1.2 系统范围
- 平台：Coze 扣子智能体平台
- 入口：豆包 App（iOS/Android/小程序）
- 端侧：C 端用户交互
- 服务端：B 端（Next.js + Prisma + PostgreSQL）
- 能力：AI 面试、语音对话、工作流、RAG 知识库、HTTP 插件

### 1.3 术语说明
- **PAT**：Coze 个人访问令牌，用于开放 API 鉴权
- **Bot ID**：Coze 智能体唯一标识
- **Workflow ID**：Coze 工作流唯一标识
- **RAG**：检索增强生成（岗位知识库匹配）
- **SSE**：Server-Sent Events，流式对话输出
- **VAD**：语音端点检测（语义断句）

---

## 2 整体技术架构
### 2.1 分层架构
```
┌─────────────────────────────────────────────────────┐
│                    豆包 App 用户端                    │
└───────────────────────────┬─────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────┐
│                 Coze 智能体平台层                   │
│  ┌───────────┬───────────┬───────────┬───────────┐  │
│  │  智能体对话 │  工作流引擎  │  实时语音  │  知识库RAG │  │
│  └───────────┴───────────┴───────────┴───────────┘  │
└───────────────────────────┬─────────────────────────┘
                            │ HTTP 插件 / Open API
┌───────────────────────────▼─────────────────────────┐
│                    B 端服务接口层                   │
│  岗位/简历/面试报告/投递/政策 数据读写与业务逻辑     │
└─────────────────────────────────────────────────────┘
```

### 2.2 系统交互关系
1. 用户在**豆包**发起对话/面试/上传简历
2. 请求转发至 **Coze 智能体**
3. Coze 通过 **HTTP 插件** 调用 B 端接口获取/提交数据
4. Coze 工作流完成：面试出题 → 语音交互 → 评分评估 → 报告生成
5. 结果返回豆包展示，并持久化至 B 端

---

## 3 核心模块设计
### 3.1 Coze 智能体模块
#### 3.1.1 双智能体设计
1. **求职助手 Agent（P0）**
   - 职责：AI 面试、岗位匹配、简历解析、一键投递
   - 绑定：面试工作流、岗位知识库、B 端 HTTP 插件
2. **心理健康 Agent（P1）**
   - 职责：情绪倾听、求职焦虑疏导
   - 定位：轻量陪伴型，不做医疗诊断

#### 3.1.2 鉴权体系
- Coze API 调用：`Authorization: Bearer {PAT}`
- B 端接口调用：`Authorization: Bearer {OPEN_API_KEY}`
- 禁止 Token 硬编码，统一配置管理

### 3.2 面试工作流模块（核心 P0）
#### 3.2.1 流程节点
```
开始 → 输入参数（job_id + user_id）
    → HTTP 调用 B 端获取岗位 JD
    → LLM 生成面试题（10～20 题）
    → 变量存储题目列表
    → 实时语音交互对话
    → LLM 单题评分
    → LLM 生成综合评估报告
    → HTTP 提交报告至 B 端
结束
```

#### 3.2.2 关键约束
- 工作流**必须发布**才能通过 API 调用
- 参数严格校验：`job_id`/`user_id` 为字符串类型
- 报告输出为**固定 JSON 结构**，供 B 端入库 & 前端渲染

### 3.3 实时语音模块（P0）
#### 3.3.1 技术依赖
- SDK：`@coze/realtime-api`
- 协议：WebSocket
- 音频格式：**PCM / 24000Hz / 单声道**

#### 3.3.2 关键配置
```json
{
  "input_audio":  { "format": "pcm", "sample_rate": 24000, "channel": 1 },
  "output_audio": { "codec": "pcm", "voice_id": "xxx" },
  "turn_detection": {
    "type": "semantic_vad",
    "semantic_vad_config": { "silence_threshold_ms": 300 }
  }
}
```

#### 3.3.3 必实现能力
- 语音打断（Interrupt）
- 麦克风权限异常降级（文字面试）
- WebSocket 自动重连
- 端到端延迟 < 500ms

### 3.4 B 端 API 对接模块（P0）
Coze HTTP 插件统一调用以下接口：
- 获取岗位列表 `/api/open/jobs` GET
- 获取岗位详情 `/api/open/jobs/{id}` GET
- 提交投递 `/api/open/applications` POST
- 保存面试报告 `/api/open/interviews` POST
- 保存解析简历 `/api/open/resumes` POST
- 获取政策 `/api/open/policies` GET

### 3.5 知识库 RAG 模块（P1）
- 用途：武汉地区岗位信息、政策、求职指南检索
- 分段建议：**500～1000 字/段**
- 关联方式：绑定 Bot，开启智能检索
- 检索策略：优先匹配岗位 + 专业 + 城市

---

## 4 核心接口设计
### 4.1 Coze Chat v3 API（对话）
```http
POST https://api.coze.cn/v3/chat
Authorization: Bearer {Access_Token}
```
- 流式输出：`stream: true`
- 必须按 `event:` / `data:` 逐行解析

### 4.2 Coze Workflow Run API（执行面试）
```http
POST https://api.coze.cn/v1/workflow/run
Authorization: Bearer {PAT}
```
- 参数：`workflow_id`, `parameters.job_id`, `parameters.user_id`
- 同步执行：`is_async: false`

### 4.3 面试报告结构（统一标准）
```json
{
  "totalScore": 78,
  "dimensions": [
    { "name": "专业知识", "score": 85 },
    { "name": "表达能力", "score": 72 },
    { "name": "逻辑思维", "score": 80 },
    { "name": "应变能力", "score": 75 }
  ],
  "highlights": [...],
  "improvements": [...],
  "suggestions": "...",
  "matchScore": 75,
  "recommendApply": true
}
```

---

## 5 异常与容错设计
### 5.1 全局错误码处理
| 错误码 | 含义 | 处理策略 |
|-------|------|----------|
| 4001 | Token 无效/过期 | 检查 PAT，重新获取 |
| 4200 | 工作流未发布 | 必须先发布再调用 |
| 4000 | 参数非法 | 校验字段类型/非空 |
| 6003 | 付费功能限制 | 自动降级基础能力 |

### 5.2 容错机制
- **HTTP 重试**：指数退避，最多 3 次
- **超时控制**
  - API 请求：30s
  - 工作流执行：120s
- **降级方案**
  - 语音不可用 → 文字面试
  - B 端超时 → 本地缓存/提示重试
- **日志要求**
  - 记录请求入参、响应、错误信息
  - 不打印敏感 Token

### 5.3 高频易错点（技术必看）
1. **Token 混用**：Chat API 与 Open API Token 不能互换
2. **工作流未发布**：直接导致调用失败 4200
3. **音频格式不匹配**：无声/杂音/断连
4. **SSE 流式解析错误**：丢包、展示异常
5. **JSON 结构不严格**：报告入库失败
6. **知识库分段不合理**：检索失效
7. **无权限兜底**：麦克风拒绝导致功能不可用

---

## 6 性能与体验指标
| 项 | 目标 |
|----|------|
| 对话首帧响应 | < 1s |
| 语音交互延迟 | < 500ms |
| 工作流执行完成 | < 60s |
| 接口可用性 | ≥ 99% |
| 语音识别准确率 | ≥ 95% |

---

## 7 开发、测试、发布清单
### 7.1 Coze 平台配置
- [ ] 创建求职 & 心理智能体
- [ ] 配置 Prompt、开场白、引导语
- [ ] 开发并发布面试工作流
- [ ] 配置知识库 & 绑定 Bot
- [ ] 配置 HTTP 插件（B 端接口）
- [ ] 配置实时语音连接器、音色

### 7.2 联调测试
- [ ] 对话逻辑正常
- [ ] 工作流完整执行
- [ ] 语音通话、打断、重连
- [ ] B 端 ↔ C 端数据互通
- [ ] 异常重试、降级、超时
- [ ] 报告结构与展示一致

### 7.3 发布上线
- [ ] 提交豆包发布审核
- [ ] 生产环境 Token 替换
- [ ] 接口权限与白名单
- [ ] 监控与日志接入

---

## 8 附录：参考链接
- Coze 官网：https://www.coze.cn
- Coze 文档中心：https://docs.coze.cn
- Chat v3 API：https://docs.coze.cn/api/open/docs/developer_guides/chat_v3
- 工作流 Run API：https://docs.coze.cn/api/open/docs/developer_guides/workflow_run
- 实时语音：https://www.coze.cn/open-platform/realtime/websocket
- 发布到豆包：https://docs.coze.cn/guides/publish_to_doubao

---
