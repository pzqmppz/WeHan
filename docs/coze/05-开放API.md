# 扣子开放 API

## 概述

扣子提供完整的开放 API，支持通过代码调用智能体、工作流等功能，实现与 B 端系统的数据互通。

## 认证

所有 API 请求需要在 Header 中携带 Access Token：

```http
Authorization: Bearer {Access_Token}
Content-Type: application/json
```

## Chat API (v3)

### 发起对话

```http
POST https://api.coze.cn/v3/chat
Authorization: Bearer {Access_Token}
Content-Type: application/json
```

```json
{
  "bot_id": "73428668****",
  "user_id": "123456789",
  "stream": true,
  "auto_save_history": true,
  "additional_messages": [
    {
      "role": "user",
      "content": "2024年10月1日是星期几",
      "content_type": "text"
    }
  ]
}
```

### 参数说明

| 参数 | 类型 | 必填 | 说明 |
|-----|------|-----|------|
| bot_id | String | 是 | 智能体 ID |
| user_id | String | 是 | 用户 ID |
| stream | Boolean | 否 | 是否流式响应，默认 false |
| auto_save_history | Boolean | 否 | 是否自动保存历史，默认 true |
| additional_messages | Array | 否 | 消息列表 |
| conversation_id | String | 否 | 会话 ID（用于多轮对话） |

### 流式响应事件

```
event:conversation.chat.created
data:{"id":"xxx","status":"created",...}

event:conversation.message.delta
data:{"content":"部分内容",...}

event:conversation.message.completed
data:{"content":"完整内容",...}

event:conversation.chat.completed
data:{"status":"completed",...}

event:done
data:[DONE]
```

### 响应字段

| 字段 | 说明 |
|-----|------|
| id | 消息 ID |
| conversation_id | 会话 ID |
| bot_id | 智能体 ID |
| role | 角色（user/assistant） |
| type | 类型（answer/question/function_call） |
| content | 内容 |
| content_type | 内容类型（text/object_string） |
| status | 状态（created/in_progress/completed） |

## 文件上传 API

### 上传文件

```http
POST https://api.coze.cn/v1/files/upload
Authorization: Bearer {Access_Token}
Content-Type: multipart/form-data
```

返回 `file_id`，用于后续对话中引用文件。

### 多模态对话

```python
# 上传图片和音频
audio_file = coze.files.upload(file=audio_path)
image_file = coze.files.upload(file=image_path)

# 多模态对话
stream = coze.chat.stream(
    bot_id=bot_id,
    user_id=user_id,
    additional_messages=[
        Message.build_user_question_objects([
            MessageObjectString.build_image(file_id=image_file.id),
            MessageObjectString.build_audio(file_id=audio_file.id),
        ])
    ],
)
```

## 工作流 API

### 执行工作流

```http
POST https://api.coze.cn/v1/workflow/run
Authorization: Bearer {Access_Token}
Content-Type: application/json
```

```json
{
  "workflow_id": "73664689170551******",
  "parameters": {
    "user_name": "John Doe",
    "input": "Hello"
  },
  "is_async": false
}
```

### 响应

```json
{
  "code": 0,
  "msg": "success",
  "data": {
    "debug_url": "https://www.coze.cn/work_flow?execute_id=xxx",
    "execute_id": "exec_xxx"
  }
}
```

## SDK

### Node.js SDK

```typescript
import { CozeAPI, COZE_CN_BASE_URL } from '@coze/api';

const client = new CozeAPI({
  token: 'pat_xxx',
  baseURL: COZE_CN_BASE_URL,
});

// 发起对话
const chat = await client.chat({
  bot_id: 'bot_xxx',
  user_id: 'user_xxx',
  additional_messages: [
    { role: 'user', content: 'Hello', content_type: 'text' }
  ]
});
```

### Python SDK

```python
from coze import Coze

client = Coze(token='pat_xxx')

# 流式对话
stream = client.chat.stream(
    bot_id='bot_xxx',
    user_id='user_xxx',
    additional_messages=[
        {'role': 'user', 'content': 'Hello', 'content_type': 'text'}
    ]
)

for chunk in stream:
    print(chunk)
```

## WeHan 与 B 端数据互通

### C 端获取 B 端岗位数据

```typescript
// 在扣子工作流中添加 HTTP 节点
// 调用 B 端 API
GET https://api.wehan.com/api/jobs
Authorization: Bearer {B端Token}
```

### C 端提交投递到 B 端

```typescript
// 在扣子工作流中添加 HTTP 节点
POST https://api.wehan.com/api/applications
Authorization: Bearer {B端Token}
Content-Type: application/json

{
  "userId": "{{user_id}}",
  "jobId": "{{job_id}}",
  "interviewId": "{{interview_id}}",
  "matchScore": {{match_score}}
}
```

## 错误处理

| 错误码 | 说明 |
|-------|------|
| 0 | 成功 |
| 4000 | 参数错误 |
| 4001 | 认证失败 |
| 4200 | 工作流未发布 |
| 6003 | 高级功能，需要付费 |

## 相关链接

- API 概览: https://docs.coze.cn/api/open/docs/developer_guides/coze_api_overview
- Chat API: https://docs.coze.cn/api/open/docs/developer_guides/chat_v3
- 工作流 API: https://docs.coze.cn/api/open/docs/developer_guides/workflow_run
- 文件上传: https://docs.coze.cn/api/open/docs/developer_guides/upload_files
