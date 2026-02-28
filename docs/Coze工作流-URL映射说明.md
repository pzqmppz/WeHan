# Coze 工作流 - URL 映射说明

> **更新时间**: 2026-02-28
> **用途**: 说明 C 端 Coze 工作流使用的 API 代理地址

---

## 一、代理服务信息

| 项目 | 值 |
|-----|-----|
| **代理类型** | Cloudflare Workers |
| **代理地址** | `https://wehan-proxy.819264640.workers.dev` |
| **目标地址** | `https://wehan.vercel.app/api/open` |
| **状态** | ✅ 已部署并测试通过 |

---

## 二、API URL 映射关系

### 原 Vercel 地址 → 代理地址

| 原 Vercel 地址 | Cloudflare 代理地址 | 说明 |
|---------------|-------------------|------|
| `https://wehan.vercel.app/api/open/jobs/{id}` | `https://wehan-proxy.819264640.workers.dev/jobs/{id}` | 获取岗位详情 |
| `https://wehan.vercel.app/api/open/interviews` | `https://wehan-proxy.819264640.workers.dev/interviews` | 创建/查询面试记录 |
| `https://wehan.vercel.app/api/open/interviews/{id}` | `https://wehan-proxy.819264640.workers.dev/interviews/{id}` | 获取/更新面试记录 |

**注意**：代理地址**不需要**携带 `X-API-Key` 请求头，代理会自动添加。

---

## 三、工作流文件更新状态

| 工作流文件 | 状态 | 代理地址 |
|-----------|------|---------|
| `interview_workflow_v4_fixed.json` | ✅ 已更新 | `https://wehan-proxy.819264640.workers.dev` |
| `interview_answer_workflow.json` | ✅ 已更新 | `https://wehan-proxy.819264640.workers.dev` |
| `interview_report_workflow.json` | ✅ 已更新 | `https://wehan-proxy.819264640.workers.dev` |

---

## 四、使用方式

### 在 Coze 工作流中使用

**方式 1：直接使用代理地址（推荐）**

```json
{
  "url": "https://wehan-proxy.819264640.workers.dev/jobs/{job_id}",
  "method": "GET",
  "headers": {}
}
```

**方式 2：不添加 X-API-Key 请求头**

代理会自动添加 `X-API-Key: wehan_open_api_key_2026`，不需要在工作流中配置。

---

## 五、测试验证

### 测试命令

```bash
# 测试获取岗位详情
curl "https://wehan-proxy.819264640.workers.dev/jobs/cmm5o5b8q000ezguj2h8ofvyj"

# 测试创建面试记录
curl -X POST "https://wehan-proxy.819264640.workers.dev/interviews" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test_user_c_001",
    "jobId": "cmm5o5b8q000ezguj2h8ofvyj",
    "status": "IN_PROGRESS",
    "outline": [{"id":"q1","category":"专业","question":"请介绍一下你自己","difficulty":"easy"}],
    "currentIndex": 0,
    "answers": []
  }'
```

### 测试结果

| 测试项 | 结果 | 响应时间 |
|-------|------|---------|
| GET /jobs/{id} | ✅ 成功 | ~7s（首次） |
| POST /interviews | ✅ 成功 | ~17s（首次） |

> **注意**：首次请求较慢是正常现象（Cloudflare 冷启动），后续请求会更快。

---

## 六、代理优势

| 优势 | 说明 |
|-----|------|
| **免费** | Cloudflare Workers 免费计划：10万请求/天 |
| **全球加速** | Cloudflare 全球 CDN 节点 |
| **自动认证** | 自动添加 API Key，简化配置 |
| **CORS 支持** | 自动处理跨域问题 |

---

## 七、故障处理

### 如果代理失效

**备用方案**：直接使用 Vercel 地址

```
https://wehan.vercel.app/api/open/jobs/{id}
```

**需要添加请求头**：
```
X-API-Key: wehan_open_api_key_2026
```

---

## 八、联系支持

如有问题，请联系 B 端开发团队。

---

*文档版本: 1.0 | 更新时间: 2026-02-28*
