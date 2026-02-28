# Coze 工作流配置指南

> **用途**: Coze 工作流剪贴板格式标准规范
> **适用人员**: 所有需要配置Coze 工作流的开发人员
> **更新时间**: 2026-02-28

---

## 一、剪贴板格式结构

```json
{
  "type": "coze-workflow-clipboard-data",
  "source": {
    "workflowId": "",
    "flowMode": 0,
    "spaceId": "7491691397280874533",
    "isDouyin": false,
    "host": "www.coze.cn"
  },
  "bounds": { "x": -4100, "y": -400, "width": 5000, "height": 600 },
  "json": {
    "nodes": [...],
    "edges": [...]
  }
}
```

---

## 二、`_temp` 字段 ⚠️ 极其重要！

### 2.1 哪些节点需要？

**所有主要节点都必须有**：
- ✅ 开始 (type 1)
- ✅ 结束 (type 2)
- ✅ 大模型 (type 3)
- ✅ 代码 (type 5)
- ✅ HTTP 请求 (type 45)
- ✅ JSON 序列化/反序列化 (type 58/59)

### 2.2 各节点 `_temp` 参数

| 节点类型 | height | mainColor |
|---------|--------|-----------|
| 开始/结束 | 130 | `#5C62FF` |
| HTTP 请求 | 200 | `#3071F2` |
| 大模型 | 200 | `#00D4AA` |
| 代码节点 | 150 | `#00B2B2` |
| JSON 处理 | 120 | `#F2B600` |

### 2.3 完整示例

```json
{
  "id": "100001",
  "type": "1",
  "meta": { "position": { "x": -3400, "y": -200 } },
  "data": {
    "nodeMeta": {
      "title": "开始",
      "description": "工作流的起始节点",
      "icon": "...",
      "mainColor": "#5C62FF"
    },
    "outputs": [
      { "type": "string", "name": "input1", "required": true }
    ],
    "trigger_parameters": []
  },
  "_temp": {
    "bounds": { "x": -3400, "y": -200, "width": 360, "height": 130 },
    "externalData": {
      "icon": "...",
      "description": "工作流的起始节点",
      "title": "开始",
      "mainColor": "#5C62FF"
    }
  }
}
```

> **⚠️ 重要**：`_temp` 中的 `bounds` 位置应与节点的 `meta.position` 一致！

---

## 三、HTTP 请求节点配置 (Type 45)

### 3.1 Headers 格式 ⚠️

```json
"headers": [
  {
    "name": "X-API-Key",
    "input": {
      "type": "string",
      "value": {
        "type": "literal",
        "content": "wehan_open_api_key_2026",
        "rawMeta": { "type": 1 }
      }
    }
  }
]
```

### 3.2 请求体配置

#### GET 请求

```json
"body": {
  "bodyType": "EMPTY",
  "bodyData": {
    "binary": {
      "fileURL": {
        "type": "string",
        "value": {
          "type": "ref",
          "content": { "source": "block-output", "blockID": "", "name": "" }
        }
      }
    }
  }
}
```

#### POST 请求

```json
"body": {
  "bodyType": "JSON",
  "bodyData": {
    "type": "ref",
    "content": { "source": "block-output", "blockID": "500002", "name": "requestBodyJson" },
    "rawMeta": { "type": 1 },
    "binary": {
      "fileURL": {
        "type": "string",
        "value": {
          "type": "ref",
          "content": { "source": "block-output", "blockID": "", "name": "" }
        }
      }
    },
    "json": "{\n  \"userId\": \"...\"\n}"
  }
}
```

> ⚠️ **重要**：`binary` 和 `json` 字段必须同时存在！

### 3.3 inputParameters

HTTP 节点必须包含 `inputParameters: []`：

```json
"data": {
  "nodeMeta": {...},
  "inputParameters": [],
  "inputs": {
    "apiInfo": {...},
    ...
  }
}
```

---

## 四、变量引用格式

### 4.1 引用节点输出

```json
{
  "type": "ref",
  "content": {
    "source": "block-output",
    "blockID": "节点ID",
    "name": "字段名"
  },
  "rawMeta": { "type": 1 }
}
```

### 4.2 字面量

```json
{
  "type": "literal",
  "content": "固定值",
  "rawMeta": { "type": 1 }
}
```

### 4.3 rawMeta 类型值

| rawMeta.type | 数据类型 |
|-------------|---------|
| 1 | string |
| 2 | integer |
| 3 | float |
| 4 | boolean |

---

## 五、边 (Edges) 结构

```json
{
  "edges": [
    { "sourceNodeID": "100001", "targetNodeID": "450001" },
    { "sourceNodeID": "450001", "targetNodeID": "590001" }
  ]
}
```

---

## 六、常见问题排查 ⭐

### 6.1 导入后节点丢失

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| 只有部分节点显示 | 缺少 `_temp` | 为所有节点添加 `_temp` 字段 |

### 6.2 HTTP 节点问题

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| 请求头丢失 | 旧格式 `{"key": ..., "value": ...}` | 改用 `{"name": ..., "input": ...}` |
| 请求体显示为空 | bodyData 缺少 `binary` 或 `json` | 必须同时包含两个字段 |
| 403 Forbidden | API Key 不匹配 | 检查 `X-API-Key` 是否正确 |

---

## 七、测试数据

### 测试岗位 ID

```bash
# 前端开发工程师
job_id: cmm5o5b8q000ezguj2h8ofvyj

# 后端开发工程师
job_id: cmm5o5b8q000fzguje6mp40ro

# AI算法工程师
job_id: cmm5o5b8r000gzguj0kl94ol3
```

### 测试用户 ID

```bash
# C端虚拟用户
user_id: test_user_c_001
```

### API Key 配置

| 环境 | API Key |
|-----|---------|
| 本地开发 | `wehan_dev_test_2026` |
| 生产环境 | `wehan_open_api_key_2026` |

---

## 八、版本更新记录

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| v5.0 | 2026-02-28 | **极其重要**：添加 `_temp` 字段完整说明、修复导入后节点丢失问题 |
| v4.0 | 2026-02-28 | **重大更新**：修复 HTTP 节点 headers 格式、bodyData 结构 |
| v3.2 | 2026-02-28 | 添加选择器说明、扩展常见错误分类 |
| v3.1 | 2026-02-28 | 修正插件/循环/批处理节点配置 |
| v3.0 | 2026-02-28 | 添加完整节点 ID 命名规范 |
| v2.0 | 2026-02-28 | 添加会话管理、消息管理节点 |
| v1.0 | 2026-02-28 | 初始版本 |

---

## 九、常见修复案例

### 案例 1：导入后只有部分节点显示

**问题**：只有代码节点显示，其他节点全部丢失

**原因**：缺少 `_temp` 字段

**解决方案**：为所有节点添加 `_temp` 字段

### 案例 2：HTTP 请求头丢失

**问题**：导入后请求头配置丢失

**原因**：使用旧格式 `{"key": ..., "value": ...}`

**解决方案**：改用 `{"name": ..., "input": {...}}`

### 案例 3：HTTP 请求体显示为空

**问题**：bodyData 在 Coze UI 中显示为空

**原因**：缺少 `binary` 或 `json` 字段

**解决方案**：同时添加 `binary` 和 `json` 字段

---

*文档版本: 5.1 | 更新时间: 2026-02-28*
