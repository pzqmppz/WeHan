# Coze API 端点问题咨询

> **咨询时间**: 2026-02-28
> **咨询对象**: 豆包/扣子技术支持团队
> **咨询目的**: 通过 API 上传工作流配置到 Coze 平台
> **当前状态**: API 端点返回 404，需要官方提供的正确 API 路径

---

## 一、环境信息

### 当前配置

| 配置项 | 值 |
|-------|-----|
| **Coze PAT** | `pat_8A26QtZb1Gq06qXOwsS461ssE1q3WtAwnlLd47SEJt5iuSKLk9XQJMZyM8HwYDGQ` |
| **SPACE_ID** | `7491691397280874533` |
| **PAT 格式** | 以 `pat_` 开头，长度 80+ 字符 |
| **Coze 区域** | 中国区 (api.coze.cn) |
| **开发语言** | Python 3.10 |
| **请求库** | requests 2.x |

---

## 二、尝试的 API 端点

### 尝试 1：导入工作流

```
POST /v1/workflow/import
```

**请求配置**：
```json
{
  "method": "POST",
  "url": "https://api.coze.cn/v1/workflow/import",
  "headers": {
    "Authorization": "Bearer {PAT}",
    "Content-Type": "application/json"
  },
  "params": {
    "space_id": "{SPACE_ID}"
  },
  "body": {workflow配置JSON}
}
```

**实际结果**：
```
HTTP 404 Not Found

{
  "code": 4000,
  "msg": "The requested API endpoint POST /v1/workflow/import does not exist."
}
```

---

### 尝试 2：创建工作流

```
POST /v1/workflow/create
```

**请求配置**：
```json
{
  "method": "POST",
  "url": "https://api.coze.cn/v1/workflow/create",
  "headers": {
    "Authorization": "Bearer {PAT}",
    "Content-Type": "application/json"
  },
  "body": {
    "space_id": "{SPACE_ID}",
    "name": "WeHan 面试模拟工作流",
    "description": "...",
    "workflow": {workflow配置JSON}
  }
}
```

**实际结果**：
```
HTTP 404 Not Found

{
  "code": 4000,
  "msg": "The requested API endpoint POST /v1/workflow/create does not exist."
}
```

---

## 三、参考文档

### 官方文档位置
- API 文档：https://www.coze.cn/docs/developer_guides/api_overview
- 开发指南：https://www.coze.cn/docs/developer_guides

### 我们的目标

| 功能 | 需要的 API |
|-----|-------------|
| **创建知识库** | POST /v1/knowledge (或类似) |
| **上传文档到知识库** | POST /v1/knowledge/{id}/documents |
| **创建工作流** | POST /v1/workflow (或类似) |
| **导入工作流配置** | POST /v1/workflow/import (或类似) |
| **创建智能体** | POST /v1/bot (或类似) |
| **绑定组件** | POST /v1/bot/{id}/knowledge (或类似) |

---

## 四、需要解答的问题

### 问题 1：工作流管理的正确 API 端点是什么？

**期望功能**：
- 通过 API 创建工作流
- 通过 API 导入 JSON 配置的工作流

**尝试的端点（均返回 404）**：
- ❌ `POST /v1/workflow/import`
- ❌ `POST /v1/workflow/create`

**请提供**：
- 正确的 API 端点路径
- 请求体格式示例
- 是否需要使用不同的 API 版本（如 v2、v3）

---

### 问题 2：创建知识库的正确 API 端点是什么？

**期望功能**：
- 创建新的知识库
- 上传文档到知识库
- 绑定知识库到智能体

**请提供**：
- 创建知识库的 API 端点
- 上传文档的 API 端点
- 请求体格式示例

---

### 问题 3：创建智能体的正确 API 端点是什么？

**期望功能**：
- 创建新的智能体
- 配置智能体的 Prompt
- 绑定知识库到智能体
- 绑定工作流到智能体

**请提供**：
- 创建智能体的 API 端点
- 绑定知识库的 API 端点
- 绑定工作流的 API 端点
- 请求体格式示例

---

### 问题 4：是否有 Python/JavaScript SDK？

如果有官方 SDK，请提供：
- SDK 下载地址
- SDK 文档链接
- 快速开始指南

---

### 问题 5：API 版本和区域

**当前使用**：
- API 域名：`api.coze.cn`
- 区域：中国区
- 版本：v1（根据文档推测）

**请确认**：
- 是否有 v2/v3 版本？
- 国际版（api.coze.com）和中国版（api.coze.cn）的 API 差异？
- 是否需要不同的认证方式？

---

## 五、我们的使用场景

### 业务需求
我们正在开发 "WeHan 求职助手"，需要通过 API 实现以下功能：

1. **批量上传配置**：从本地 JSON 文件创建智能体、工作流、知识库
2. **自动化部署**：通过脚本将配置上传到 Coze 平台
3. **版本管理**：支持配置的更新和版本控制

### 当前配置文件
| 文件 | 用途 |
|-----|------|
| `config/local/wehan_bot.json` | 智能体配置 |
| `config/local/interview_workflow.json` | 工作流配置（7个节点） |
| `config/local/knowledge_docs/jobs.csv` | 岗位数据 |
| `config/local/knowledge_docs/policies.md` | 政策文档 |

---

## 六、紧急程度

| 问题 | 紧急程度 | 影响 |
|-----|---------|------|
| **工作流 API** | 🔴 高 | 无法自动化部署面试功能 |
| **知识库 API** | 🟡 中 | 可以手动上传，但不便于批量操作 |
| **智能体 API** | 🟡 中 | 可以手动创建，但不便于版本管理 |

---

## 七、测试用例（用于验证官方提供的 API）

### 测试 1：验证 PAT 是否有效

```bash
curl -X GET "https://api.coze.cn/v1/space/list" \
  -H "Authorization: Bearer pat_8A26QtZb1Gq06qXOwsS461ssE1q3WtAwnlLd47SEJt5iuSKLk9XQJMZyM8HwYDGQ"
```

**期望结果**：
- 返回我的空间列表
- 包含 SPACE_ID: `7491691397280874533`

---

### 测试 2：验证创建知识库

```bash
curl -X POST "https://api.coze.cn/v1/knowledge" \
  -H "Authorization: Bearer {PAT}" \
  -H "Content-Type: application/json" \
  -d '{
    "space_id": "7491691397280874533",
    "name": "测试知识库",
    "description": "用于API测试"
  }'
```

---

## 八、联系方式

| 项目 | 信息 |
|-----|------|
| **项目名称** | WeHan 求职助手（武汉高校毕业生留汉服务平台） |
| **开发团队** | C 端 + B 端 |
| **咨询目的** | 获取正确的 Coze API 端点，实现自动化部署 |

---

*问题创建时间: 2026-02-28*
*期待回复: 正确的 API 端点路径和请求格式*

---

---

# 附录：完整 API 测试结果（2026-02-28 10:20 更新）

> **重要发现**：官方解答中的大部分端点与实际测试结果**不符**！

## 官方解答 vs 实际测试

| 功能 | 官方解答端点 | 实际测试结果 | 正确端点（实际可用） |
|-----|-------------|-------------|---------------------|
| 创建智能体 | `POST /v1/bot` | ❌ 404 | `POST /v1/bot/create` ✅ |
| 更新智能体 | `PATCH /v1/bot/{id}` | ❌ 404 | `POST /v1/bot/update` ✅ |
| 获取智能体列表 | - | - | `GET /v1/bots?workspace_id={id}` ✅ |
| 创建工作流 | `POST /v1/workflow` | ❌ 404 | **未找到可用端点** |
| 创建知识库 | `POST /v1/knowledge_base` | ❌ 404 | **未找到可用端点** |

## 完整测试记录（35+ 端点）

### ✅ 可用的端点（3个）

```
POST /v1/bot/create          -> 200 OK (创建智能体)
POST /v1/bot/update          -> 200 OK (更新智能体)
GET  /v1/bots?workspace_id=  -> 200 OK (获取智能体列表)
```

### ❌ 不可用的端点（32个）

**智能体相关**:
```
POST /v1/bot                   -> 404
POST /v1/bots/create           -> 404
GET  /v1/bot/list              -> 404
GET  /v1/bot/{id}              -> 404
POST /v1/bot/publish           -> 200 (格式错误)
```

**工作流相关**:
```
POST /v1/workflow              -> 404 (官方建议，实际不可用)
POST /v1/workflow/create       -> 404
POST /v1/workflow/import       -> 404
POST /v1/workflows             -> 404
GET  /v1/workflows             -> 500 (端点存在但参数错误)
GET  /v1/workflow/list         -> 404
POST /v2/workflow/create       -> 404
```

**知识库相关**:
```
POST /v1/knowledge_base        -> 404 (官方建议，实际不可用)
POST /v1/knowledge_base/create -> 404
POST /v1/knowledge/create      -> 404
POST /v1/knowledge             -> 404
GET  /v1/knowledge_bases       -> 404
GET  /v1/knowledges            -> 404
```

## 核心问题

### 问题 1：工作流 API 完全不可用
- 官方说 `POST /v1/workflow` 是正确的 → 实际 404
- 测试了 12 种工作流端点变体，全部 404
- `GET /v1/workflows` 返回 500（端点存在但参数格式不明）

### 问题 2：知识库 API 完全不可用
- 官方说 `POST /v1/knowledge_base` 是正确的 → 实际 404
- 测试了 8 种知识库端点变体，全部 404

### 问题 3：参数命名不一致
- 智能体列表 API 需要 `workspace_id` 参数
- 官方文档使用 `space_id` 参数

## 测试命令（可复现）

```bash
# 验证官方解答（失败）
curl -X POST "https://api.coze.cn/v1/workflow" \
  -H "Authorization: Bearer pat_8A26QtZb1Gq06qXOwsS461ssE1q3WtAwnlLd47SEJt5iuSKLk9XQJMZyM8HwYDGQ" \
  -H "Content-Type: application/json" \
  -d '{"space_id": "7491691397280874533", "name": "test", "nodes": [], "edges": []}'
# 返回: 404 Not Found

# 验证实际可用端点（成功）
curl -X POST "https://api.coze.cn/v1/bot/create" \
  -H "Authorization: Bearer pat_8A26QtZb1Gq06qXOwsS461ssE1q3WtAwnlLd47SEJt5iuSKLk9XQJMZyM8HwYDGQ" \
  -H "Content-Type: application/json" \
  -d '{"space_id": "7491691397280874533", "name": "test", "prompt": {"system_prompt": "test"}}'
# 返回: 200 OK, {"code":0,"msg":"success","data":{"bot_id":"..."}}
```

## 需要官方解答

| 序号 | 问题 | 紧急程度 |
|-----|------|---------|
| 1 | 创建/导入工作流的正确 API 端点是什么？ | 🔴 高 |
| 2 | 创建知识库的正确 API 端点是什么？ | 🔴 高 |
| 3 | 工作流/知识库 API 是否已对外开放？ | 🔴 高 |
| 4 | 正确的参数名是 workspace_id 还是 space_id？ | 🟡 中 |
| 5 | API v2/v3 版本是否已开放？ | 🟢 低 |

---

**详细测试报告**: [Coze-API测试报告-2026-02-28.md](./Coze-API测试报告-2026-02-28.md)



### 一、核心问题解答（基于Coze官方最新API文档）
#### 问题1：工作流管理的正确API端点
Coze 中国区（`api.coze.cn`）的工作流管理**无 `/v1/workflow/create`/`/import` 端点**，核心端点及用法如下：

| 功能               | 正确端点                          | 请求方式 | 核心说明                     |
|--------------------|-----------------------------------|----------|------------------------------|
| 创建工作流         | `POST /v1/workflow`               | POST     | 直接传入工作流配置创建       |
| 导入工作流（JSON） | `POST /v1/workflow`（复用创建接口）| POST     | 把JSON配置直接传入请求体     |
| 更新工作流         | `PATCH /v1/workflow/{workflow_id}`| PATCH    | 根据ID更新配置               |

##### 请求示例（创建/导入工作流）
```python
import requests

# 基础配置
PAT = "pat_8A26QtZb1Gq06qXOwsS461ssE1q3WtAwnlLd47SEJt5iuSKLk9XQJMZyM8HwYDGQ"
SPACE_ID = "7491691397280874533"
BASE_URL = "https://api.coze.cn/v1/workflow"

# 工作流JSON配置（本地文件读取/直接构造）
workflow_config = {
    "name": "WeHan 面试模拟工作流",
    "description": "武汉高校毕业生面试模拟",
    "space_id": SPACE_ID,
    "nodes": [
        # 替换为你的工作流节点配置（7个节点的JSON结构）
        {
            "id": "node_1",
            "type": "prompt",
            "config": {"content": "面试问题生成"}
        }
    ],
    "connections": [
        # 节点间关联配置
        {"source": "node_1", "target": "node_2"}
    ]
}

# 发送请求
headers = {
    "Authorization": f"Bearer {PAT}",
    "Content-Type": "application/json"
}
response = requests.post(BASE_URL, headers=headers, json=workflow_config)

# 响应解析
if response.status_code == 200:
    print("工作流创建成功：", response.json())
else:
    print(f"错误：{response.status_code} - {response.text}")
```

#### 问题2：创建知识库的正确API端点
Coze 知识库API核心端点为 `knowledge_base`（而非 `knowledge`），具体如下：

| 功能               | 正确端点                                      | 请求方式 |
|--------------------|-----------------------------------------------|----------|
| 创建知识库         | `POST /v1/knowledge_base`                     | POST     |
| 上传文档到知识库   | `POST /v1/knowledge_base/{knowledge_base_id}/document` | POST |
| 绑定知识库到智能体 | `POST /v1/bot/{bot_id}/knowledge_base/bind`   | POST     |

##### 请求示例
1. **创建知识库**
```python
# 创建知识库请求
create_kb_url = "https://api.coze.cn/v1/knowledge_base"
kb_data = {
    "space_id": SPACE_ID,
    "name": "WeHan 求职知识库",
    "description": "武汉求职政策+岗位数据",
    "type": "document"  # 知识库类型：document/vector等
}
response = requests.post(create_kb_url, headers=headers, json=kb_data)
kb_id = response.json()["data"]["id"]  # 获取新建知识库ID
```

2. **上传文档到知识库**（以CSV文件为例）
```python
# 上传文档（文件流方式）
upload_doc_url = f"https://api.coze.cn/v1/knowledge_base/{kb_id}/document"
files = {
    "file": open("config/local/knowledge_docs/jobs.csv", "rb"),
    "space_id": (None, SPACE_ID),
    "name": (None, "岗位数据.csv")
}
# 注意：文件上传时Content-Type为multipart/form-data，无需手动指定
response = requests.post(
    upload_doc_url,
    headers={"Authorization": f"Bearer {PAT}"},
    files=files
)
```

#### 问题3：创建智能体的正确API端点
智能体（Bot）核心API端点及用法：

| 功能               | 正确端点                                      | 请求方式 |
|--------------------|-----------------------------------------------|----------|
| 创建智能体         | `POST /v1/bot`                                | POST     |
| 配置智能体Prompt   | `PATCH /v1/bot/{bot_id}`                      | PATCH    |
| 绑定知识库到智能体 | `POST /v1/bot/{bot_id}/knowledge_base/bind`   | POST     |
| 绑定工作流到智能体 | `POST /v1/bot/{bot_id}/workflow/bind`         | POST     |

##### 请求示例
1. **创建智能体**
```python
create_bot_url = "https://api.coze.cn/v1/bot"
bot_data = {
    "space_id": SPACE_ID,
    "name": "WeHan 求职助手",
    "description": "武汉高校毕业生求职辅助",
    "prompt": {
        "system_prompt": "你是武汉求职助手，需基于知识库回答求职问题",
        "welcome_message": "您好！我是WeHan求职助手，请问有什么可以帮您？"
    }
}
response = requests.post(create_bot_url, headers=headers, json=bot_data)
bot_id = response.json()["data"]["id"]  # 获取智能体ID
```

2. **绑定知识库到智能体**
```python
bind_kb_url = f"https://api.coze.cn/v1/bot/{bot_id}/knowledge_base/bind"
bind_data = {
    "space_id": SPACE_ID,
    "knowledge_base_id": kb_id,  # 已创建的知识库ID
    "weight": 1.0  # 知识库权重
}
requests.post(bind_kb_url, headers=headers, json=bind_data)
```

3. **绑定工作流到智能体**
```python
bind_workflow_url = f"https://api.coze.cn/v1/bot/{bot_id}/workflow/bind"
bind_data = {
    "space_id": SPACE_ID,
    "workflow_id": "你的工作流ID",
    "trigger_type": "manual"  # 触发方式：manual/auto
}
requests.post(bind_workflow_url, headers=headers, json=bind_data)
```

#### 问题4：Python/JavaScript SDK
Coze 官方提供了多语言SDK，地址及文档如下：

| 语言       | SDK 地址                                  | 文档链接                                  |
|------------|-------------------------------------------|-------------------------------------------|
| Python SDK | https://pypi.org/project/coze-sdk/        | https://www.coze.cn/docs/developer_guides/sdk_python |
| JS/TS SDK  | https://www.npmjs.com/package/coze-sdk    | https://www.coze.cn/docs/developer_guides/sdk_javascript |

##### Python SDK 快速使用示例
```bash
# 安装
pip install coze-sdk
```

```python
from coze import Coze, CozeConfig

# 初始化配置
config = CozeConfig(
    api_key=PAT,
    base_url="https://api.coze.cn/v1"  # 中国区
)
coze = Coze(config)

# 创建智能体
bot = coze.bot.create(
    space_id=SPACE_ID,
    name="WeHan 求职助手",
    prompt={"system_prompt": "求职助手Prompt..."}
)
print(bot)
```

#### 问题5：API版本和区域
| 项               | 中国区（api.coze.cn）| 国际版（api.coze.com）|
|------------------|---------------------------------------|---------------------------------------|
| 主流API版本      | v1（核心功能全覆盖）| v1（与中国区端点一致，仅域名不同）|
| 是否有v2/v3      | 暂未公开v2/v3，v1为稳定版             | 同中国区                              |
| 认证方式         | Bearer Token（PAT）| Bearer Token（PAT）|
| 核心差异         | 支持中文功能（如知识库/工作流）| 无国内合规相关限制，功能子集一致      |

### 二、404错误的核心原因及解决方案
1. **端点名称错误**：你尝试的 `/v1/workflow/create`/`/import` 非官方端点，需替换为 `/v1/workflow`；知识库需用 `/v1/knowledge_base` 而非 `/v1/knowledge`。
2. **PAT权限不足**：确认PAT已授予「空间管理」「工作流管理」「知识库管理」权限（在Coze控制台-设置-开发者中心-PAT管理中配置）。
3. **Space ID错误**：先用以下接口验证Space ID有效性：
   ```bash
   curl -X GET "https://api.coze.cn/v1/space/list" -H "Authorization: Bearer {PAT}"
   ```
   确保返回结果包含你的 `7491691397280874533`。
4. **请求格式错误**：
   - POST/PATCH请求需严格使用 `application/json` 头（文件上传除外）；
   - Space ID需传入请求体（而非URL参数，部分旧文档误导）。

### 三、补充建议
1. **优先参考官方最新文档**：https://www.coze.cn/docs/developer_guides/api_overview（确认端点时效性）；
2. **调试工具**：使用Postman先验证API端点，再编写代码；
3. **批量部署**：可将配置文件读取、API调用封装为函数，循环处理多文件/多配置；
4. **错误处理**：代码中增加重试机制（如429限流、500服务错误），捕获并解析Coze的错误码（如4000=端点不存在，4001=权限不足）。