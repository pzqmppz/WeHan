# WeHan C 端 Coze 开发任务清单

> 基于 WeHan 求职助手产品需求，整理 Coze 智能体开发的核心目标、技术栈、API 对接信息和易错点。

---

## 一、核心目标与场景说明

### 1.1 核心业务目标

| 目标 | 描述 | 优先级 |
|-----|------|-------|
| **求职 Agent 创建** | 在扣子平台创建求职助手智能体，支持 AI 面试模拟、简历解析、岗位匹配 | P0 |
| **面试工作流开发** | 创建面试模拟工作流：获取岗位 JD → 生成面试题 → 语音对话 → 评估报告 | P0 |
| **心理健康 Agent 创建** | 创建独立的心理健康智能体，提供求职焦虑咨询、情绪倾诉 | P1 |
| **知识库配置** | 配置岗位知识库（RAG），支持岗位数据检索匹配 | P1 |
| **B 端 API 插件** | 配置 HTTP 插件，实现 C 端与 B 端数据互通 | P0 |
| **发布到豆包** | 将智能体发布到豆包 App，供用户使用 | P0 |

### 1.2 使用场景

- **开发场景**：在扣子平台配置智能体、工作流、知识库、插件
- **测试场景**：在扣子预览面板测试对话、工作流执行
- **生产场景**：发布到豆包 App，供真实用户使用
- **数据同步**：C 端通过 HTTP 插件调用 B 端开放 API

---

## 二、现有代码基础

### 2.1 技术栈细节

| 层级 | 技术 | 说明 |
|-----|------|-----|
| **智能体平台** | 扣子 (Coze) | https://www.coze.cn |
| **用户入口** | 豆包 App | iOS/Android/小程序 |
| **实时语音** | @coze/realtime-api | WebSocket SDK |
| **B 端技术栈** | Next.js 16.x + Prisma + PostgreSQL | Web 管理后台 |

### 2.2 Coze 配置项

| 配置项 | 说明 | 示例值/占位符 |
|-------|------|--------------|
| **个人访问令牌 (PAT)** | 用于 API 调用的认证令牌 | `pat_xxxxxxxxxxxxxxxx` |
| **Bot ID** | 智能体唯一标识 | `73428668xxxxxx` |
| **Workflow ID** | 工作流唯一标识 | `73664689170551xxxxxx` |
| **Connector ID** | 实时语音连接器 ID | `1024` |
| **Voice ID** | 音色 ID | `7426720361733046281` |
| **Knowledge Base ID** | 知识库 ID | `74567891234567xxxxxx` |
| **API Key (B 端)** | B 端开放 API 认证密钥 | `OPEN_API_KEY` |

### 2.3 B 端 API 端点（待对接）

| 功能 | 接口 | 方法 | 说明 |
|-----|------|------|-----|
| 获取岗位列表 | `/api/open/jobs` | GET | C 端获取岗位数据 |
| 获取岗位详情 | `/api/open/jobs/{id}` | GET | 获取单个岗位详情 |
| 提交投递 | `/api/open/applications` | POST | C 端提交投递 |
| 保存面试报告 | `/api/open/interviews` | POST | 保存 AI 面试报告 |
| 保存简历 | `/api/open/resumes` | POST | 保存解析后的简历 |
| 获取政策列表 | `/api/open/policies` | GET | 获取人才政策 |

---

## 三、已知 API 对接信息

### 3.1 扣子开放 API

#### Chat API (v3) - 发起对话

```http
POST https://api.coze.cn/v3/chat
Authorization: Bearer {Access_Token}
Content-Type: application/json

{
  "bot_id": "73428668xxxxxx",
  "user_id": "user_xxx",
  "stream": true,
  "auto_save_history": true,
  "additional_messages": [
    {
      "role": "user",
      "content": "帮我进行AI面试模拟",
      "content_type": "text"
    }
  ]
}
```

#### Workflow API - 执行工作流

```http
POST https://api.coze.cn/v1/workflow/run
Authorization: Bearer {Access_Token}
Content-Type: application/json

{
  "workflow_id": "73664689170551xxxxxx",
  "parameters": {
    "job_id": "cmm52v1jc00003wuj5mlubj3u",
    "user_id": "user_xxx"
  },
  "is_async": false
}
```

#### Files API - 上传文件（简历）

```http
POST https://api.coze.cn/v1/files/upload
Authorization: Bearer {Access_Token}
Content-Type: multipart/form-data
```

### 3.2 实时语音 WebSocket 配置

```json
{
  "data": {
    "input_audio": {
      "format": "pcm",
      "sample_rate": 24000,
      "channel": 1
    },
    "output_audio": {
      "codec": "pcm",
      "voice_id": "7426720361733046281"
    },
    "turn_detection": {
      "type": "semantic_vad",
      "semantic_vad_config": {
        "silence_threshold_ms": 300
      }
    }
  }
}
```

---

## 四、关注的易错点方向

### 4.1 高频易错环节

| 易错点 | 说明 | 避坑建议 |
|-------|------|---------|
| **Token 过期** | PAT 有有效期，过期后 API 调用失败 | 实现自动刷新机制，捕获 401 错误 |
| **工作流 JSON 格式** | Coze 工作流 Schema 严格，格式错误导致上传失败 | 使用官方 Schema 校验工具 |
| **知识库分段** | 分段过大/过小影响检索效果 | 按段落分段，调整分段大小 500-1000 字 |
| **实时语音权限** | 需要麦克风权限，用户拒绝后无法使用 | 前置检测权限，友好提示用户授权 |
| **语音延迟** | 网络波动导致语音对话延迟过高 | 设置合理超时时间（<500ms 为佳） |
| **API 限流** | 频繁调用触发限流 | 实现指数退避重试机制 |
| **流式响应处理** | Chat API 返回 SSE 流，处理不当导致丢包 | 正确解析 `event:` 和 `data:` 行 |

### 4.2 健壮性要求

| 要求 | 实现方式 |
|-----|---------|
| **重试机制** | HTTP 请求失败时指数退避重试（最多 3 次） |
| **异常捕获** | 捕获网络异常、API 错误、数据格式异常 |
| **日志输出** | 记录关键步骤：API 请求、响应、错误信息 |
| **超时控制** | API 请求超时 30s，工作流执行超时 120s |
| **状态校验** | 上传/绑定后校验状态，确认操作成功 |

### 4.3 常见异常处理

| 错误码 | 说明 | 处理方案 |
|-------|------|---------|
| 0 | 成功 | 正常处理 |
| 4000 | 参数错误 | 校验参数格式，返回友好提示 |
| 4001 | 认证失败 | 检查 Token，尝试刷新 |
| 4200 | 工作流未发布 | 提示先发布工作流 |
| 6003 | 高级功能需付费 | 降级到基础功能 |

---

## 五、求职 Agent Prompt 模板

### 5.1 人设与回复逻辑

```markdown
# 角色
你是 WeHan 求职助手，专门帮助武汉高校毕业生进行求职准备和岗位匹配。

## 技能

### 技能1：AI 模拟面试
1. 根据岗位 JD 生成面试题目（10-20 道）
2. 通过实时语音进行面试对话
3. 面试结束后生成评估报告
4. 支持追问、拓展、调整难度

### 技能2：简历解析
1. 解析上传的简历文件（PDF/Word/图片）
2. 提取关键信息：教育、经历、技能
3. 生成人才画像

### 技能3：岗位匹配
1. 基于简历和偏好搜索岗位
2. 计算匹配度评分
3. 推荐最合适的岗位

### 技能4：一键投递
1. 随时可投递，无门槛限制
2. 携带面试报告和匹配度
3. 追踪投递状态

## 限制
- 只推荐武汉地区岗位
- 面试评分客观公正
- 不提供虚假承诺
- 保护用户隐私数据
- 评分是建议不是拦截

## 开场白
你好！我是 WeHan 求职助手 👋

我可以帮你：
- 🎤 AI 模拟面试 - 实战练习，提升面试能力
- 📄 简历解析 - 智能分析，生成人才画像
- 🔍 岗位匹配 - 精准推荐，找到心仪工作
- 💚 心理支持 - 缓解焦虑，陪伴求职路

你想做什么？
```

### 5.2 面试工作流节点设计

```
开始
  │
  ▼
[输入节点] 接收参数：job_id, user_id
  │
  ▼
[HTTP 节点] GET /api/open/jobs/{job_id} → 获取岗位 JD
  │
  ▼
[大模型节点] 生成面试题目（10-20 道）
  │ 输入：JD + 岗位类别 + 用户简历
  │ 输出：面试题目列表
  ▼
[变量节点] 存储题目列表
  │
  ▼
[交互节点] 启动语音面试（实时语音 SDK）
  │ 逐题提问，收集回答
  │ 支持追问、拓展、调整难度
  ▼
[大模型节点] 评估每个回答
  │ 输入：题目 + 回答
  │ 输出：评分 + 点评
  ▼
[大模型节点] 生成综合评估报告
  │ 输入：所有评分 + 点评
  │ 输出：结构化报告（JSON）
  ▼
[HTTP 节点] POST /api/open/interviews → 保存报告到 B 端
  │
  ▼
[输出节点] 返回报告给用户
  │
  ▼
结束
```

### 5.3 评估报告结构

```json
{
  "totalScore": 78,
  "dimensions": [
    { "name": "专业知识", "score": 85, "maxScore": 100 },
    { "name": "表达能力", "score": 72, "maxScore": 100 },
    { "name": "逻辑思维", "score": 80, "maxScore": 100 },
    { "name": "应变能力", "score": 75, "maxScore": 100 }
  ],
  "highlights": [
    { "question": "...", "answer": "...", "score": 90, "comment": "回答准确，逻辑清晰" }
  ],
  "improvements": [
    { "area": "表达能力", "suggestion": "建议多练习结构化表达，使用 STAR 法则" }
  ],
  "suggestions": "整体表现良好，建议加强表达能力和应变能力的训练",
  "matchScore": 75,
  "recommendApply": true
}
```

---

## 六、心理健康 Agent Prompt 模板

```markdown
# 角色
你是 WeHan 心理健康助手，专门为武汉高校毕业生提供情绪支持和心理疏导。

## 技能

### 技能1：情绪倾听
1. 耐心倾听用户的烦恼
2. 给予共情和理解
3. 引导用户表达真实感受

### 技能2：心理疏导
1. 识别情绪类型（焦虑、迷茫、挫败等）
2. 提供应对建议
3. 推荐专业资源（必要时）

### 技能3：情绪记录
1. 记录每次咨询的情绪状态
2. 追踪情绪变化趋势
3. 定期提醒用户关注心理健康

## 限制
- 不提供医疗诊断
- 发现自伤倾向立即建议就医
- 保守用户隐私
- 保持温暖、专业的态度
- 不替代专业心理咨询

## 开场白
你好呀！今天感觉怎么样？💚

有什么想聊的吗？我来听听~
```

---

## 七、开发检查清单

### 7.1 扣子平台配置

- [ ] 创建求职 Agent 智能体
- [ ] 创建心理健康 Agent 智能体
- [ ] 编写并优化人设与回复逻辑
- [ ] 配置开场白和引导问题
- [ ] 创建面试模拟工作流
- [ ] 配置知识库（岗位数据）
- [ ] 配置 HTTP 插件（B 端 API）
- [ ] 测试对话功能
- [ ] 测试工作流执行
- [ ] 发布到豆包 App

### 7.2 实时语音集成

- [ ] 配置实时语音连接器（Connector ID: 1024）
- [ ] 选择音色（Voice ID）
- [ ] 配置语音参数（采样率、格式、VAD）
- [ ] 测试语音对话
- [ ] 测试打断功能
- [ ] 测试延迟（目标 <500ms）

### 7.3 B 端 API 对接

- [ ] 实现 `/api/open/jobs` 接口
- [ ] 实现 `/api/open/jobs/{id}` 接口
- [ ] 实现 `/api/open/applications` 接口
- [ ] 实现 `/api/open/interviews` 接口
- [ ] 实现 `/api/open/resumes` 接口
- [ ] 实现 `/api/open/policies` 接口
- [ ] 配置 API 认证（Bearer Token）
- [ ] 测试 C-B 端数据互通

### 7.4 测试与发布

- [ ] 单元测试（对话、工作流、API）
- [ ] 集成测试（C-B 端联调）
- [ ] 用户体验测试（真实用户）
- [ ] 性能测试（响应时间、并发）
- [ ] 发布到豆包（提交审核）
- [ ] 生成分享链接

---

## 八、参考链接

| 资源 | 链接 |
|-----|------|
| 扣子官网 | https://www.coze.cn |
| 扣子文档中心 | https://docs.coze.cn |
| 豆包官网 | https://www.doubao.com |
| 智能体发布到豆包 | https://docs.coze.cn/guides/publish_to_doubao |
| 工作流开发 | https://docs.coze.cn/guides/workflow |
| 知识库使用 | https://docs.coze.cn/guides/knowledge_base |
| Chat API | https://docs.coze.cn/api/open/docs/developer_guides/chat_v3 |
| Workflow API | https://docs.coze.cn/api/open/docs/developer_guides/workflow_run |
| 实时语音 Demo | https://www.coze.cn/open-platform/realtime/websocket |

---

*文档版本: 1.0 | 更新时间: 2026-02-28*