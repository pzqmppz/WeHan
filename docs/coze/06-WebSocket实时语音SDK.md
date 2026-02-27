# 扣子 WebSocket 实时语音 SDK

## 概述

扣子提供 WebSocket 实时语音 SDK，支持在 Web 应用中实现低延迟的实时语音对话功能。

## SDK 安装

```bash
npm install @coze/api
```

## 初始化客户端

### TypeScript 示例

```typescript
import { RealtimeClient, RealtimeUtils } from '@coze/realtime-api';

async function initClient() {
  // 1. 检查设备权限
  const permission = await RealtimeUtils.checkDevicePermission(true);
  if (!permission.audio) {
    throw new Error('需要麦克风访问权限');
  }

  // 2. 获取音色列表
  const voices = await getVoices();

  // 3. 初始化客户端
  const client = new RealtimeClient({
    accessToken: getToken,           // 访问令牌
    botId: 'your-bot-id',            // 智能体 ID
    connectorId: '1024',             // 连接器 ID
    voiceId: voices[0]?.voice_id,    // 音色 ID
    allowPersonalAccessTokenInBrowser: true,
    debug: true,
  });

  return client;
}
```

## WebSocket 语音配置

### chat.update 事件配置

```json
{
  "id": "event_id",
  "event_type": "chat.update",
  "data": {
    "chat_config": {
      "auto_save_history": true,
      "conversation_id": "",
      "user_id": "user_xxx",
      "meta_data": {},
      "custom_variables": {},
      "extra_params": {},
      "parameters": {"custom_var_1": "测试"}
    },
    "input_audio": {
      "format": "pcm",
      "codec": "pcm",
      "sample_rate": 24000,
      "channel": 1,
      "bit_depth": 16
    },
    "output_audio": {
      "codec": "pcm",
      "pcm_config": {
        "sample_rate": 16000,
        "frame_size_ms": 50,
        "limit_config": {
          "period": 1,
          "max_frame_num": 22
        }
      },
      "speech_rate": 0,
      "voice_id": "7426720361733046281"
    },
    "turn_detection": {
      "type": "semantic_vad",
      "semantic_vad_config": {
        "silence_threshold_ms": 300,
        "semantic_unfinished_wait_time_ms": 500
      }
    },
    "event_subscriptions": [
      "error",
      "input_audio_buffer.speech_started",
      "input_audio_buffer.speech_stopped",
      "conversation.audio.delta",
      "conversation.chat.failed"
    ]
  }
}
```

## 核心功能实现

### 连接/断开

```typescript
// 连接
const handleConnect = async () => {
  try {
    await client.connect();
    setIsConnected(true);
  } catch (error) {
    console.error('连接失败：', error);
  }
};

// 断开连接
const handleDisconnect = () => {
  try {
    client.disconnect();
    client.clearEventHandlers();
    setIsConnected(false);
  } catch (error) {
    console.error('断开失败：', error);
  }
};
```

### 麦克风控制

```typescript
// 切换麦克风
const toggleMicrophone = async () => {
  try {
    await client.setAudioEnable(!audioEnabled);
    setAudioEnabled(!audioEnabled);
  } catch (error) {
    console.error('切换麦克风失败：', error);
  }
};
```

### 打断当前语音

```typescript
const handleInterrupt = () => {
  try {
    client.interrupt();
  } catch (error) {
    console.error('打断失败：', error);
  }
};
```

## 消息事件处理

```typescript
const handleMessageEvent = async () => {
  let lastEvent: any;

  client.on(EventNames.ALL_SERVER, (eventName, event: any) => {
    // 只处理消息增量更新和完成事件
    if (
      event.event_type !== ChatEventType.CONVERSATION_MESSAGE_DELTA &&
      event.event_type !== ChatEventType.CONVERSATION_MESSAGE_COMPLETED
    ) {
      return;
    }

    const content = event.data.content;

    // 处理增量更新
    if (lastEvent?.event_type === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
      // 追加内容
      updateMessage(prev => prev + content);
    }

    // 处理新消息
    if (event.event_type === ChatEventType.CONVERSATION_MESSAGE_DELTA) {
      addMessage(content);
    }

    lastEvent = event;
  });
};
```

## 事件类型

### 客户端发送事件

| 事件 | 描述 |
|-----|------|
| chat.update | 更新对话配置 |
| input_audio_buffer.append | 发送音频数据 |
| input_audio_buffer.commit | 提交音频缓冲区 |
| input_audio_buffer.clear | 清空音频缓冲区 |

### 服务端返回事件

| 事件 | 描述 |
|-----|------|
| conversation.chat.created | 对话创建 |
| conversation.audio.delta | 音频增量数据 |
| conversation.message.delta | 文本增量数据 |
| conversation.message.completed | 消息完成 |
| conversation.chat.completed | 对话完成 |
| conversation.chat.failed | 对话失败 |
| input_audio_buffer.speech_started | 检测到语音开始 |
| input_audio_buffer.speech_stopped | 检测到语音结束 |

## 音色配置

### 获取音色列表

```typescript
import { CozeAPI, COZE_CN_BASE_URL } from '@coze/api';

const api = new CozeAPI({
  token: 'your-access-token',
  baseURL: COZE_CN_BASE_URL,
});

// 获取可用音色
const voices = await api.audio.voices.list();
```

### 指定音色

```typescript
const client = new RealtimeClient({
  accessToken: 'your-access-token',
  botId: 'your-bot-id',
  connectorId: '1024',
  voiceId: '7426725529589661723', // 指定音色 ID
});
```

## WsSpeech SDK

### 文本转语音

**整句播放**：
```typescript
client.appendAndComplete('你好，这是一个文本转语音测试。');
```

**流式播放（逐字符）**：
```typescript
const text = '你好，这是一个流式文本转语音测试。';
await client.connect();

for (let i = 0; i < text.length; i++) {
  client.append(text[i]);
  await new Promise(resolve => setTimeout(resolve, 100));
}

client.complete();
```

## 完整示例

```typescript
import { RealtimeClient, RealtimeUtils, EventNames, ChatEventType } from '@coze/realtime-api';

class VoiceChat {
  private client: RealtimeClient | null = null;

  async init(botId: string, token: string) {
    // 检查权限
    const permission = await RealtimeUtils.checkDevicePermission(true);
    if (!permission.audio) {
      throw new Error('需要麦克风权限');
    }

    // 创建客户端
    this.client = new RealtimeClient({
      accessToken: token,
      botId,
      connectorId: '1024',
      debug: true,
    });

    // 监听事件
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.client?.on(EventNames.ALL_SERVER, (eventName, event) => {
      console.log(`Event: ${eventName}`, event);
    });
  }

  async connect() {
    await this.client?.connect();
  }

  async disconnect() {
    this.client?.disconnect();
    this.client?.clearEventHandlers();
  }

  async toggleMic() {
    // 切换麦克风状态
  }

  interrupt() {
    this.client?.interrupt();
  }
}
```

## Demo 与示例代码

- [实时语音 Demo](https://www.coze.cn/open-platform/realtime/websocket)
- [TypeScript 示例源码](https://github.com/coze-dev/coze-js/tree/main/examples/realtime-websocket)

## 相关链接

- WebSocket 语音最佳实践: https://www.coze.cn/api/open/docs/tutorial/websocket_voice_best_practices
- RealtimeClient 文档: https://www.coze.cn/api/open/docs/dev_how_to_guides/Realtime_web
