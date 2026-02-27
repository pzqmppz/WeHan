# 火山引擎技术文档

> 本目录整理了火山引擎平台的核心技术文档，供 WeHan C 端实时语音功能开发参考。

## 文档索引

| 序号 | 文档 | 说明 | 优先级 |
|-----|------|------|-------|
| 01 | [端到端实时语音大模型 API](./01-端到端实时语音大模型API.md) | 低延迟语音到语音对话 | P0 |

## 与 Coze 的关系

火山引擎是字节跳动旗下的云服务平台，与扣子/豆包同属字节生态：

```
扣子 (Coze) ──────┬──> 豆包 App (用户交互)
    │            │
    │            └──> 实时语音 SDK (@coze/realtime-api)
    │
火山引擎 ──────────┴──> 端到端实时语音大模型 API (底层)
```

## 核心能力对比

| 能力 | 扣子 SDK | 火山引擎 API |
|-----|---------|-------------|
| 使用方式 | npm 包封装 | 原生 WebSocket |
| 音色类型 | 精品音色 | 精品音色 + 克隆音色 |
| System Prompt | 支持 | 支持 |
| 集成难度 | 低（SDK 封装） | 中（需自行处理协议） |
| 推荐场景 | 快速集成 | 深度定制 |

## WeHan C 端语音功能技术选型

### 推荐方案：扣子 WebSocket 实时语音 SDK

**理由：**
1. SDK 封装完善，开发效率高
2. 与扣子智能体无缝集成
3. 支持语义 VAD 检测
4. 提供完整的事件监听机制

**关键配置：**
```typescript
import { RealtimeClient, RealtimeUtils } from '@coze/realtime-api';

const client = new RealtimeClient({
  accessToken: getToken,
  botId: 'your-bot-id',
  connectorId: '1024',
  voiceId: '7426720361733046281',
  allowPersonalAccessTokenInBrowser: true,
  debug: true,
});
```

### 备选方案：火山引擎原生 API

**适用场景：**
- 需要自定义音色克隆（SC2.0 版本）
- 需要更精细的音频控制
- 需要独立于扣子平台部署

## 快速链接

- 火山引擎控制台: https://console.volcengine.com/speech/app
- 火山引擎语音文档: https://www.volcengine.com/docs/6561/1594356
- 扣子实时语音 Demo: https://www.coze.cn/open-platform/realtime/websocket

## 更新日志

| 日期 | 更新内容 |
|-----|---------|
| 2026-02-27 | 初始版本，整理端到端实时语音 API 文档 |
