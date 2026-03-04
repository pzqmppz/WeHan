# Coze 工作流配置指南

> **用途**: Coze 工作流剪贴板格式标准规范
> **适用人员**: 所有需要配置 Coze 工作流的开发人员
> **更新时间**: 2026-03-03

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

## 二、节点 ID 命名规范

| 节点类型 | type | ID 格式 | 示例 |
|---------|------|--------|------|
| 开始节点 | 1 | `10000X` | 100001, 100002 |
| 结束节点 | 2 | `20000X` | 200001, 200002 |
| 大模型节点 | 3 | `30000X` | 300001, 300002 |
| 知识库节点 | 4 | `40000X` | 400001 |
| 代码节点 | 5 | `50000X` | 500001, 500002 |
| HTTP 请求节点 | 45 | `45000X` | 450001, 450002 |
| JSON 序列化 | 58 | `58000X` | 580001 |
| JSON 反序列化 | 59 | `59000X` | 590001 |

> **规则**：X 为序号，从 1 开始，同一工作流内 ID 不能重复

---

## 三、`_temp` 字段 ⚠️ 极其重要！

### 3.1 哪些节点需要？

**所有主要节点都必须有**：
- ✅ 开始 (type 1)
- ✅ 结束 (type 2)
- ✅ 大模型 (type 3)
- ✅ 代码 (type 5)
- ✅ HTTP 请求 (type 45)
- ✅ JSON 序列化/反序列化 (type 58/59)

### 3.2 各节点 `_temp` 参数

| 节点类型 | height | mainColor | width |
|---------|--------|-----------|-------|
| 开始/结束 | 130 | `#5C62FF` | **360（固定）** |
| HTTP 请求 | 200 | `#3071F2` | **360（固定）** |
| 大模型 | 200 | `#00D4AA` | **360（固定）** |
| 代码节点 | 150 | `#00B2B2` | **360（固定）** |
| JSON 处理 | 120 | `#F2B600` | **360（固定）** |

> **重要**：所有节点 `_temp.bounds.width` 固定为 **360**，无需修改

### 3.3 `_temp.externalData` 字段规则

| 字段 | 说明 |
|-----|------|
| `icon` | 不同节点有固定 URL（见各节点示例） |
| `description` | 需与 `nodeMeta.description` 一致 |
| `title` | 需与 `nodeMeta.title` 一致 |
| `mainColor` | 与节点类型对应值一致 |

### 3.4 完整示例

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

> **⚠️ 重要**：`_temp.bounds` 的位置（x, y）应与节点的 `meta.position` 一致！

---

## 四、HTTP 请求节点配置 (Type 45) ⚠️⚠️⚠️

> **极其重要**：HTTP 节点格式非常严格，缺少任何字段都会导致导入后点击节点报错！
> 错误信息：`TypeError: (t.doc || "").split is not a function`

### 4.1 inputs 结构 ⚠️⚠️⚠️ 最常见的错误！

**正确结构**（字段平铺在 inputs 下）：
```json
"inputs": {
  "apiInfo": {
    "method": "GET",
    "url": "http://..."
    // ✅ apiInfo 只包含 method 和 url
  },
  "body": {...},           // ✅ inputs 的直接子字段
  "headers": [...],        // ✅ inputs 的直接子字段
  "params": [],            // ✅ inputs 的直接子字段
  "auth": {...},           // ✅ inputs 的直接子字段
  "setting": {...},        // ✅ inputs 的直接子字段
  "settingOnError": {}     // ✅ inputs 的直接子字段
}
```

**错误结构**（字段嵌套在 apiInfo 内部）：
```json
"inputs": {
  "apiInfo": {
    "method": "GET",
    "url": "http://...",
    "headers": [...],    // ❌ 嵌套在 apiInfo 内部，导入后会丢失！
    "body": {...},
    ...
  }
}
```

### 4.2 inputs 子字段顺序 ⚠️

| 顺序 | 字段 | 说明 |
|-----|------|------|
| 1 | `apiInfo` | 只包含 method 和 url |
| 2 | `body` | **必须在 headers 之前** |
| 3 | `headers` | 请求头配置 |
| 4 | `params` | URL 参数 |
| 5 | `auth` | 认证配置 |
| 6 | `setting` | 超时重试配置 |
| 7 | `settingOnError` | 错误处理配置 |

### 4.3 必须存在的字段清单

| 字段路径 | 说明 | 常见错误 |
|---------|------|---------|
| `inputs.apiInfo` | **只包含 method 和 url** | ❌ 将其他字段嵌套在 apiInfo 内部 |
| `inputs.body` | 请求体配置 | ❌ 嵌套在 apiInfo 内部 |
| `inputs.headers` | 请求头配置 | ❌ 嵌套在 apiInfo 内部（**会丢失**） |
| `inputs.params` | URL 参数 | ❌ 嵌套在 apiInfo 内部 |
| `inputs.auth` | 认证配置 | ❌ 嵌套在 apiInfo 内部 |
| `inputs.setting` | 超时重试配置 | ❌ 嵌套在 apiInfo 内部 |
| `inputs.settingOnError` | 错误处理配置 | ❌ 嵌套在 apiInfo 内部 |
| `url` | **直接字符串**，不是对象 | ❌ `{"type": "literal", "content": "..."}` |
| `bodyData.binary` | 文件上传占位 | ❌ 缺失 |
| `bodyData.content` | **必须存在** | ❌ 缺失（导致 split 报错）|
| `bodyData.json` | **必须存在** | ❌ 缺失 |
| `bodyData.rawMeta` | **必须存在** | ❌ 缺失 |
| `outputs[].type` | **body 是 string 不是 object** | ❌ `"type": "object"` |

### 4.4 bodyData 完整结构（GET 请求）

> ⚠️ **极其重要**：`binary`、`content`、`json`、`rawMeta` 四个字段**必须同时存在**！

```json
"body": {
  "bodyType": "EMPTY",
  "bodyData": {
    "binary": {
      "fileURL": {
        "type": "string",
        "value": {
          "type": "ref",
          "content": { "source": "block-output", "blockID": "", "name": "" },
          "rawMeta": { "type": 1 }
        }
      }
    },
    "content": { "source": "block-output", "blockID": "", "name": "" },
    "json": "",
    "rawMeta": { "type": 1 }
  }
}
```

### 4.5 bodyData 完整结构（POST 请求）

```json
"body": {
  "bodyType": "JSON",
  "bodyData": {
    "binary": {
      "fileURL": {
        "type": "string",
        "value": {
          "type": "ref",
          "content": { "source": "block-output", "blockID": "", "name": "" },
          "rawMeta": { "type": 1 }
        }
      }
    },
    "content": { "source": "block-output", "blockID": "500001", "name": "requestBody" },
    "json": "",
    "rawMeta": { "type": 1 }
  }
}
```

### 4.6 Headers 格式

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

### 4.7 outputs 格式

```json
"outputs": [
  { "type": "string", "name": "body" },
  { "type": "integer", "name": "statusCode" },
  { "type": "string", "name": "headers" }
]
```

> **注意**：`body` 的类型是 `string`，不是 `object`！
> 后续代码节点需要 `JSON.parse(body)` 来解析

### 4.8 完整 HTTP 节点示例（GET 请求）

```json
{
  "id": "450001",
  "type": "45",
  "meta": { "position": { "x": -2400, "y": -200 } },
  "data": {
    "nodeMeta": {
      "description": "发送 HTTP 请求获取数据",
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-HTTP.png",
      "mainColor": "#3071F2",
      "subTitle": "HTTP 请求",
      "title": "HTTP_查询岗位列表"
    },
    "inputParameters": [],
    "inputs": {
      "apiInfo": {
        "method": "GET",
        "url": "http://111.231.51.9/api/open/jobs"
      },
      "body": {
        "bodyType": "EMPTY",
        "bodyData": {
          "binary": {
            "fileURL": {
              "type": "string",
              "value": {
                "type": "ref",
                "content": { "source": "block-output", "blockID": "", "name": "" },
                "rawMeta": { "type": 1 }
              }
            }
          },
          "content": { "source": "block-output", "blockID": "", "name": "" },
          "json": "",
          "rawMeta": { "type": 1 }
        }
      },
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
      ],
      "params": [],
      "auth": {
        "authType": "BEARER_AUTH",
        "authData": { "customData": { "addTo": "header" } },
        "authOpen": false
      },
      "setting": { "timeout": 60, "retryTimes": 2 },
      "settingOnError": {}
    },
    "outputs": [
      { "type": "string", "name": "body" },
      { "type": "integer", "name": "statusCode" },
      { "type": "string", "name": "headers" }
    ]
  },
  "_temp": {
    "bounds": { "x": -2600, "y": -200, "width": 360, "height": 200 },
    "externalData": {
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-HTTP.png",
      "description": "发送 HTTP 请求获取数据",
      "title": "HTTP_查询岗位列表",
      "mainColor": "#3071F2"
    }
  }
}
```

---

## 五、其他节点完整示例

### 5.1 开始节点 (Type 1)

```json
{
  "id": "100001",
  "type": "1",
  "meta": { "position": { "x": -3400, "y": -200 } },
  "data": {
    "nodeMeta": {
      "title": "开始",
      "description": "工作流的起始节点，用于设定启动工作流需要的信息",
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start-v2.jpg",
      "mainColor": "#5C62FF"
    },
    "outputs": [
      { "type": "string", "name": "job_id", "required": true }
    ],
    "trigger_parameters": []
  },
  "_temp": {
    "bounds": { "x": -3400, "y": -200, "width": 360, "height": 130 },
    "externalData": {
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Start-v2.jpg",
      "description": "工作流的起始节点，用于设定启动工作流需要的信息",
      "title": "开始",
      "mainColor": "#5C62FF"
    }
  }
}
```

### 5.2 结束节点 (Type 2)

```json
{
  "id": "200001",
  "type": "2",
  "meta": { "position": { "x": 0, "y": -200 } },
  "data": {
    "nodeMeta": {
      "title": "结束",
      "description": "工作流的最终节点，用于返回工作流运行后的结果信息",
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End-v2.jpg",
      "mainColor": "#5C62FF"
    },
    "inputs": {
      "terminatePlan": "returnVariables",
      "inputParameters": [
        {
          "name": "finalResult",
          "input": {
            "type": "string",
            "value": {
              "type": "ref",
              "content": { "source": "block-output", "blockID": "300001", "name": "answer" },
              "rawMeta": { "type": 1 }
            }
          }
        }
      ]
    }
  },
  "_temp": {
    "bounds": { "x": 0, "y": -200, "width": 360, "height": 130 },
    "externalData": {
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-End-v2.jpg",
      "description": "工作流的最终节点，用于返回工作流运行后的结果信息",
      "title": "结束",
      "mainColor": "#5C62FF"
    }
  }
}
```

### 5.3 大模型节点 (Type 3)

```json
{
  "id": "300001",
  "type": "3",
  "meta": { "position": { "x": -1800, "y": -200 } },
  "data": {
    "nodeMeta": {
      "title": "大模型_生成回复",
      "description": "调用大语言模型处理文本",
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LLM-v2.jpg",
      "mainColor": "#00D4AA",
      "subTitle": "大模型"
    },
    "inputs": {
      "inputParameters": [
        {
          "name": "prompt",
          "input": {
            "type": "string",
            "value": {
              "type": "ref",
              "content": { "source": "block-output", "blockID": "450001", "name": "body" },
              "rawMeta": { "type": 1 }
            }
          }
        }
      ],
      "llmParam": [
        {
          "name": "prompt",
          "input": {
            "type": "string",
            "value": {
              "type": "literal",
              "content": "根据以下内容生成回复：{{prompt}}",
              "rawMeta": { "type": 1 }
            }
          }
        },
        {
          "name": "modleName",
          "input": {
            "type": "string",
            "value": { "type": "literal", "content": "doubao-pro-32k", "rawMeta": { "type": 1 } }
          }
        }
      ]
    },
    "outputs": [
      { "type": "string", "name": "text" },
      { "type": "string", "name": "text_str" }
    ]
  },
  "_temp": {
    "bounds": { "x": -1800, "y": -200, "width": 360, "height": 200 },
    "externalData": {
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-LLM-v2.jpg",
      "description": "调用大语言模型处理文本",
      "title": "大模型_生成回复",
      "mainColor": "#00D4AA"
    }
  }
}
```

### 5.4 代码节点 (Type 5)

```json
{
  "id": "500001",
  "type": "5",
  "meta": { "position": { "x": -1200, "y": -200 } },
  "data": {
    "nodeMeta": {
      "title": "代码_解析HTTP响应",
      "description": "执行 JavaScript/Python 代码处理数据",
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Code-v2.jpg",
      "mainColor": "#00B2B2"
    },
    "inputs": {
      "inputParameters": [
        {
          "name": "responseBody",
          "input": {
            "type": "string",
            "value": {
              "type": "ref",
              "content": { "source": "block-output", "blockID": "450001", "name": "body" },
              "rawMeta": { "type": 1 }
            }
          }
        }
      ],
      "code": "async function main({ params }: Args): Promise<Output> {\n  const response = JSON.parse(params.responseBody);\n  return {\n    jobs: response.data.jobs,\n    total: response.data.total\n  };\n}",
      "language": 5,
      "settingOnError": { "processType": 1, "timeoutMs": 60000, "retryTimes": 0 }
    },
    "outputs": [
      { "type": "array", "name": "jobs", "schema": { "type": "object", "schema": [] } },
      { "type": "integer", "name": "total" }
    ],
    "version": "v2"
  },
  "_temp": {
    "bounds": { "x": -1200, "y": -200, "width": 360, "height": 150 },
    "externalData": {
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-Code-v2.jpg",
      "description": "执行 JavaScript/Python 代码处理数据",
      "title": "代码_解析HTTP响应",
      "mainColor": "#00B2B2"
    }
  }
}
```

### 5.5 JSON 反序列化节点 (Type 59)

```json
{
  "id": "590001",
  "type": "59",
  "meta": { "position": { "x": -600, "y": -200 } },
  "data": {
    "nodeMeta": {
      "title": "JSON反序列化",
      "description": "将字符串转为JSON对象",
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-JSON.png",
      "mainColor": "#F2B600"
    },
    "inputs": {
      "inputParameters": [
        {
          "name": "jsonString",
          "input": {
            "type": "string",
            "value": {
              "type": "ref",
              "content": { "source": "block-output", "blockID": "450001", "name": "body" },
              "rawMeta": { "type": 1 }
            }
          }
        }
      ]
    },
    "outputs": [
      { "type": "object", "name": "jsonObject", "schema": [] }
    ]
  },
  "_temp": {
    "bounds": { "x": -600, "y": -200, "width": 360, "height": 120 },
    "externalData": {
      "icon": "https://lf3-static.bytednsdoc.com/obj/eden-cn/dvsmryvd_avi_dvsm/ljhwZthlaukjlkulzlp/icon/icon-JSON.png",
      "description": "将字符串转为JSON对象",
      "title": "JSON反序列化",
      "mainColor": "#F2B600"
    }
  }
}
```

---

## 六、变量引用格式

### 6.1 引用节点输出

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

### 6.2 字面量

```json
{
  "type": "literal",
  "content": "固定值",
  "rawMeta": { "type": 1 }
}
```

### 6.3 rawMeta 类型值

| rawMeta.type | 数据类型 |
|-------------|---------|
| 1 | string |
| 2 | integer |
| 3 | float |
| 4 | boolean |

---

## 七、边 (Edges) 结构

```json
{
  "edges": [
    {
      "id": "edge_100001_450001",
      "sourceNodeID": "100001",
      "targetNodeID": "450001",
      "sourceAnchorKey": "output",
      "targetAnchorKey": "input"
    },
    {
      "id": "edge_450001_590001",
      "sourceNodeID": "450001",
      "targetNodeID": "590001",
      "sourceAnchorKey": "output",
      "targetAnchorKey": "input"
    }
  ]
}
```

| 字段 | 说明 |
|-----|------|
| `id` | 边的唯一标识，命名规则：`edge_源节点ID_目标节点ID` |
| `sourceNodeID` | 源节点 ID |
| `targetNodeID` | 目标节点 ID |
| `sourceAnchorKey` | 固定值 `output` |
| `targetAnchorKey` | 固定值 `input` |

---

## 八、常见问题排查

### 8.1 导入后节点丢失

| 问题 | 原因 | 解决方案 |
|-----|------|---------|
| 只有部分节点显示 | 缺少 `_temp` | 为所有节点添加 `_temp` 字段 |

### 8.2 HTTP 节点问题 ⚠️⚠️⚠️

| 问题 | 错误信息 | 原因 | 解决方案 |
|-----|---------|------|---------|
| **请求头丢失** ⚠️ | `"headers": []` | **inputs 结构错误**：headers 嵌套在 apiInfo 内部 | **headers 必须是 inputs 直接子字段** |
| **点击节点报错** | `TypeError: (t.doc \|\| "").split is not a function` | bodyData 缺少 `content`/`json`/`rawMeta`/`binary` 任一字段 | 添加完整 bodyData 结构（4个字段） |
| 请求头格式错误 | - | 旧格式 `{"key": ..., "value": ...}` | 改用 `{"name": ..., "input": ...}` |
| 请求体显示为空 | - | bodyData 字段不完整 | 必须同时包含 binary/content/json/rawMeta |
| 403 Forbidden | - | API Key 不匹配 | 检查 `X-API-Key` 是否正确 |
| url 解析失败 | - | url 使用了对象格式 | 改为直接字符串 `"url": "http://..."` |
| outputs 类型错误 | - | body 使用了 object 类型 | 改为 string，代码中 JSON.parse |
| 字段顺序问题 | - | body 在 headers 之后 | **body 必须在 headers 之前** |

---

## 九、常见修复案例

### 案例 1：导入后只有部分节点显示

**问题**：只有代码节点显示，其他节点全部丢失

**原因**：缺少 `_temp` 字段

**解决方案**：为所有节点添加 `_temp` 字段

### 案例 2：HTTP 请求头丢失（inputs 结构错误）⚠️⚠️⚠️ 最常见！

**问题**：导入后 HTTP 节点的 headers 变成空数组 `[]`

**原因**：`inputs` 结构错误，将 `headers`、`body`、`auth` 等字段嵌套在 `apiInfo` 内部

**❌ 错误示例**：
```json
"inputs": {
  "apiInfo": {
    "method": "GET",
    "url": "http://...",
    "headers": [...],    // ❌ 嵌套在 apiInfo 内部
    "body": {...},
    ...
  }
}
```

**✅ 正确示例**：
```json
"inputs": {
  "apiInfo": {
    "method": "GET",
    "url": "http://..."
  },
  "body": {...},         // ✅ inputs 的直接子字段
  "headers": [...],      // ✅ inputs 的直接子字段
  "params": [],
  "auth": {...},
  "setting": {...},
  "settingOnError": {}
}
```

### 案例 3：点击 HTTP 节点报错 ⚠️ 最常见！

**问题**：导入成功，但点击 HTTP 节点时报错
```
TypeError: (t.doc || "").split is not a function
```

**原因**：bodyData 结构不完整，缺少以下字段之一：
- `binary`
- `content`
- `json`
- `rawMeta`

**❌ 错误示例**：
```json
"bodyData": {
  "binary": {...},
  "json": ""
  // ❌ 缺少 content 和 rawMeta
}
```

**✅ 正确示例**：
```json
"bodyData": {
  "binary": {
    "fileURL": {
      "type": "string",
      "value": {
        "type": "ref",
        "content": { "source": "block-output", "blockID": "", "name": "" },
        "rawMeta": { "type": 1 }
      }
    }
  },
  "content": { "source": "block-output", "blockID": "", "name": "" },
  "json": "",
  "rawMeta": { "type": 1 }
}
```

### 案例 4：HTTP 请求体使用模板变量导致导入失败

**问题**：在 HTTP 请求体的 `bodyData.json` 字段中使用 `{{开始.session_id}}` 模板语法，导致工作流无法正确导入

**❌ 错误示例**：
```json
"bodyData": {
  "type": "object",
  "json": "{\"session_id\": \"{{开始.session_id}}\"}"
}
```

**解决方案**：使用代码节点构建请求体，然后通过变量引用传递给 HTTP 节点

**✅ 正确做法**：

1. 代码节点构建请求体：
```json
{
  "id": "500001",
  "type": "5",
  "data": {
    "nodeMeta": { "title": "代码_构建请求体" },
    "inputs": {
      "inputParameters": [
        {
          "name": "session_id",
          "input": {
            "type": "string",
            "value": {
              "type": "ref",
              "content": { "source": "block-output", "blockID": "100001", "name": "session_id" },
              "rawMeta": { "type": 1 }
            }
          }
        }
      ],
      "code": "return { requestBody: JSON.stringify({ session_id: params.session_id }) };"
    }
  },
  "outputs": [{ "type": "string", "name": "requestBody" }]
}
```

2. HTTP 节点引用代码节点输出：
```json
"body": {
  "bodyType": "JSON",
  "bodyData": {
    "binary": {
      "fileURL": {
        "type": "string",
        "value": {
          "type": "ref",
          "content": { "source": "block-output", "blockID": "", "name": "" },
          "rawMeta": { "type": 1 }
        }
      }
    },
    "content": { "source": "block-output", "blockID": "500001", "name": "requestBody" },
    "json": "",
    "rawMeta": { "type": 1 }
  }
}
```

---

## 十、新手实操流程

### 10.1 分步验证流程

1. **第一步**：配置开始 + HTTP 节点，导入验证无报错
2. **第二步**：添加代码节点，验证数据解析
3. **第三步**：添加大模型 + 结束节点，完成工作流

### 10.2 调试排查顺序

导入后报错时，按以下顺序排查：

1. ✅ 检查 `_temp` 字段是否存在
2. ✅ 检查 HTTP 节点 `inputs` 结构（apiInfo 只含 method/url）
3. ✅ 检查 HTTP 节点 `bodyData` 是否包含 4 个字段
4. ✅ 检查变量引用是否包含 `rawMeta`

---

## 十一、配置自查清单

完成配置后，逐项核对：

| 序号 | 检查项 | 状态 |
|-----|-------|------|
| 1 | 所有节点均包含 `_temp` 字段 | ☐ |
| 2 | `_temp.bounds` 位置与 `meta.position` 一致 | ☐ |
| 3 | `_temp.bounds.width` 固定为 360 | ☐ |
| 4 | HTTP 节点 `inputs` 结构正确（apiInfo 仅含 method/url） | ☐ |
| 5 | HTTP 节点 `body` 在 `headers` 之前 | ☐ |
| 6 | HTTP 节点 `bodyData` 包含 binary/content/json/rawMeta 四个字段 | ☐ |
| 7 | HTTP 节点 `outputs` 中 body 类型为 string | ☐ |
| 8 | 变量引用均包含 `rawMeta` 字段 | ☐ |
| 9 | edges 包含 id/sourceNodeID/targetNodeID/sourceAnchorKey/targetAnchorKey | ☐ |
| 10 | 节点 ID 符合命名规范，无重复 | ☐ |
| 11 | `_temp.externalData.mainColor` 与节点类型对应值一致 | ☐ |

---

## 十二、测试数据

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

| 环境 | API Key | 使用场景 |
|-----|---------|---------|
| 本地开发 | `wehan_dev_test_2026` | HTTP 节点 headers 中配置 |
| 生产环境 | `wehan_open_api_key_2026` | HTTP 节点 headers 中配置 |

### 使用方式

- **测试岗位 ID**：在 HTTP 节点的 `url` 中拼接使用
  - 示例：`http://111.231.51.9/api/open/jobs/${job_id}`（需通过代码节点传递）
- **测试用户 ID**：在 POST 请求的 `bodyData.json` 中作为参数传递
- **API Key**：在 HTTP 节点的 `headers` 中配置

---

## 十三、术语表

| 术语 | 说明 |
|-----|------|
| `_temp` | 节点临时数据，包含显示所需的 bounds 和 externalData |
| `block-output` | 引用来源类型，表示来自节点输出 |
| `ref` | 变量引用类型，用于引用其他节点的输出 |
| `literal` | 字面量类型，用于固定值 |
| `rawMeta` | 元数据，包含数据类型信息 |
| `inputParameters` | 节点的输入参数，用于接收上游节点的输出 |
| `trigger_parameters` | 开始节点专属字段，配置工作流触发参数 |
| `setting.timeout` | HTTP 请求超时时间（单位：秒），建议 10-60 |
| `setting.retryTimes` | HTTP 请求失败重试次数，建议 1-3 次 |
| `auth.authOpen` | 是否开启认证，默认 false |

---

## 十四、版本更新记录

| 版本 | 日期 | 更新内容 |
|-----|------|---------|
| v10.0 | 2026-03-03 | 根据审查报告全面优化：修正 HTTP 节点示例、补充节点 ID 命名规范、添加完整节点示例、新增自查清单和术语表 |
| v9.0 | 2026-03-02 | 新经验：HTTP 请求体使用模板变量会导致导入问题，推荐使用代码节点构建 |
| v8.0 | 2026-03-02 | 极其重要：发现 inputs 结构问题！body/headers/params/auth/setting 必须是 inputs 直接子字段 |

---

*文档版本: 10.0 | 更新时间: 2026-03-03*
