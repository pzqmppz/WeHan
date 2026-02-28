# Coze 工作流 - 面试系统

## 文件说明

| 文件 | 说明 |
|-----|------|
| `interview_workflow_v4_fixed.json` | 面试启动工作流 |
| `interview_answer_workflow.json` | 面试答题工作流 |
| `interview_report_workflow.json` | 面试报告工作流 |
| `B端API需求.md` | C端工作流调用的 B 端 API 接口文档 |

---

## 一、面试启动工作流

### 流程图
```
┌─────────────────────────────────────────────────────────────────────┐
│                      面试启动工作流 v4.0                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [开始] 100001                                                       │
│      │ 输入: job_id, user_id, resume_id                             │
│      ▼                                                              │
│  [HTTP] 450001 - 获取岗位详情                                        │
│      │ GET /api/open/jobs/{job_id}                                  │
│      ▼                                                              │
│  [JSON反序列化] 590001                                               │
│      ▼                                                              │
│  [代码] 500001 - 提取岗位信息                                        │
│      ▼                                                              │
│  [大模型] 300001 - 生成面试题                                        │
│      ▼                                                              │
│  [代码] 500002 - 解析题目                                           │
│      ▼                                                              │
│  [代码] 500004 - 构建请求体                                          │
│      ▼                                                              │
│  [HTTP] 450002 - 创建面试记录                                        │
│      │ POST /api/open/interviews                                    │
│      ▼                                                              │
│  [代码] 500003 - 生成开场白和第一题                                  │
│      ▼                                                              │
│  [结束] 900001                                                       │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 输入参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `job_id` | string | ✅ | 岗位 ID |
| `user_id` | string | ✅ | 用户 ID |
| `resume_id` | string | ❌ | 简历 ID |

### 输出参数
| 参数名 | 类型 | 说明 |
|-------|------|------|
| `interview_id` | string | 面试记录 ID |
| `opening_message` | string | 开场白 |
| `first_question` | string | 第一道面试题 |
| `total_questions` | integer | 题目总数 |
| `job_title` | string | 岗位名称 |
| `company_name` | string | 公司名称 |

---

## 二、面试答题工作流 (interview_answer_workflow)

用户回答问题后，评估答案并更新面试进度。

### 流程
```
开始 → 获取面试详情 → JSON解析 → 大模型评估 → 解析结果 → 构建请求 → 更新进度 → 生成响应 → 结束
```

### 输入参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `interview_id` | string | ✅ | 面试记录 ID |
| `question_index` | string | ✅ | 当前题目索引 (从 0 开始) |
| `user_answer` | string | ✅ | 用户回答内容 |

### 输出参数
| 参数名 | 类型 | 说明 |
|-------|------|------|
| `response_message` | string | 给用户的响应（含评分、反馈、下一题）|
| `score` | integer | 当前题目得分 (1-10) |
| `next_question` | string | 下一道题目 |
| `next_index` | integer | 下一题索引 |
| `is_completed` | boolean | 是否已完成所有题目 |
| `progress` | string | 进度（如 "2/5"）|

---

## 三、面试报告工作流 (interview_report_workflow)

所有题目完成后，生成综合评估报告。

### 流程
```
开始 → 获取面试数据 → JSON解析 → 大模型生成报告 → 解析结果 → 构建请求 → 保存报告 → 格式化输出 → 结束
```

### 输入参数
| 参数名 | 类型 | 必填 | 说明 |
|-------|------|-----|------|
| `interview_id` | string | ✅ | 面试记录 ID |

### 输出参数
| 参数名 | 类型 | 说明 |
|-------|------|------|
| `report_markdown` | string | Markdown 格式报告 |
| `report_json` | string | JSON 格式数据 |
| `grade` | string | 综合等级 (A/B/C) |
| `recommendation` | string | 最终建议 (通过/待定/不通过) |

---

## 四、环境配置

### API 地址
| 环境 | API URL |
|-----|---------|
| 本地开发 | `http://localhost:3000` |
| 生产环境 | `https://wehan.vercel.app` |

### API Key
| 环境 | API Key |
|-----|---------|
| 本地开发 | `wehan_dev_test_2026` |
| 生产环境 | `wehan_open_api_key_2026` |

---

## 五、导入步骤

1. **复制 JSON**：打开对应的工作流 JSON 文件，复制全部内容
2. **粘贴到 Coze**：在 Coze 工作流编辑器中按 `Ctrl+V`
3. **验证配置**：检查 HTTP 节点的 API 地址和 API Key
4. **测试运行**：使用测试数据验证

---

## 六、测试数据

```json
{
  "job_id": "cmm5o5b8q000ezguj2h8ofvyj",
  "user_id": "test_user_c_001"
}
```

更多测试数据请参考 `B端API需求.md`。

---

## 七、常见问题

### Q: 导入后节点配置丢失？
A: 检查 `docs/coze/coze工作流配置指南.md` 中的格式要求

### Q: HTTP 请求返回 403？
A: API Key 不匹配，检查工作流中的 `X-API-Key` 与后端 `OPEN_API_KEY` 是否一致

### Q: 请求体显示为空？
A: bodyData 必须同时包含 `binary` 和 `json` 字段

---

*文档版本: 4.1 | 更新时间: 2026-02-28*
