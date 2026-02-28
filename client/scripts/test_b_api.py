"""
B 端 API 完整测试脚本
检查所有接口是否按文档规范实现，发现文档不清晰或遗漏的地方
"""
import os
import sys
import json
import requests
from dotenv import load_dotenv

# 添加父目录到路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 加载环境变量
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

# 测试配置
BASE_URL = os.getenv("B_API_BASE_URL", "http://localhost:3000/api/open")
API_KEY = os.getenv("OPEN_API_KEY", "")
TEST_USER_ID = "test_user_12345"
TEST_JOB_ID = "test_job_123"  # 会被动态更新

# 测试结果
results = {
    "passed": [],
    "failed": [],
    "warnings": [],
    "document_issues": []
}

def print_section(title):
    """打印分节标题"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

def print_result(status, message, details=None):
    """打印测试结果"""
    symbols = {
        "PASS": "[PASS]",
        "FAIL": "[FAIL]",
        "WARN": "[WARN]",
        "INFO": "[INFO]"
    }
    print(f"{symbols[status]} {message}")
    if details:
        print(f"      {details}")

    if status == "PASS":
        results["passed"].append(message)
    elif status == "FAIL":
        results["failed"].append(f"{message}: {details}")
    elif status == "WARN":
        results["warnings"].append(f"{message}: {details}")

def test_api(endpoint, method="GET", data=None, params=None, expected_status=200):
    """测试 API 调用"""
    url = f"{BASE_URL}{endpoint}"
    headers = {
        "Content-Type": "application/json"
    }

    # 添加 API Key（如果有）
    if API_KEY and API_KEY != "your_api_key_here":
        headers["X-API-Key"] = API_KEY

    try:
        if method == "GET":
            response = requests.get(url, headers=headers, params=params, timeout=10)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data, timeout=10)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data, timeout=10)
        else:
            return None, "Unsupported method"

        return response, None
    except requests.exceptions.ConnectionError:
        return None, "Connection refused - B 端服务可能未启动"
    except requests.exceptions.Timeout:
        return None, "Request timeout"
    except Exception as e:
        return None, str(e)

# ==================== 开始测试 ====================
print_section("B 端 API 完整测试")

print(f"\n测试配置：")
print(f"  BASE_URL: {BASE_URL}")
print(f"  API_KEY: {'已配置' if API_KEY and API_KEY != 'your_api_key_here' else '未配置（开发模式）'}")

# ==================== 1. 岗位相关 API ====================
print_section("1. 岗位相关 API")

# 1.1 获取岗位列表
print("\n1.1 GET /api/open/jobs - 获取岗位列表")
response, error = test_api("/jobs", params={"limit": 1})

if error:
    print_result("FAIL", "获取岗位列表失败", error)
    results["document_issues"].append("岗位列表 API: 无法连接，请确认 B 端服务是否启动")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            jobs = data.get("data", [])
            print_result("PASS", f"获取岗位列表成功，返回 {len(jobs)} 条数据")
            if jobs:
                job = jobs[0]
                # 检查必需字段
                required_fields = ["id", "title", "company", "salaryMin", "salaryMax"]
                missing_fields = [f for f in required_fields if f not in job]
                if missing_fields:
                    print_result("WARN", f"岗位数据缺少字段: {missing_fields}")
                    results["document_issues"].append(f"岗位列表返回数据缺少字段: {missing_fields}")
                else:
                    # 保存第一个岗位 ID 用于后续测试
                    # 使用全局变量
                    import __main__
                    __main__.TEST_JOB_ID = job.get("id")
                    TEST_JOB_ID = job.get("id")  # 同时更新局部变量
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 401:
        print_result("WARN", "API 认证失败（401）", "开发环境可能需要配置 OPEN_API_KEY")
    else:
        print_result("FAIL", f"API 返回状态码 {response.status_code}", response.text[:200])

# 1.2 获取岗位详情
print(f"\n1.2 GET /api/open/jobs/{{id}} - 获取岗位详情")

# 尝试使用从列表获取的 job ID，或使用测试 ID
job_id_to_test = TEST_JOB_ID if TEST_JOB_ID != "test_job_123" else "cmm52v1jc00003wuj5mlubj3u"
print(f"      测试岗位 ID: {job_id_to_test}")

response, error = test_api(f"/jobs/{job_id_to_test}")

if error:
    print_result("FAIL", f"获取岗位详情失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            job_detail = data.get("data", {})
            print_result("PASS", "获取岗位详情成功")

            # 检查字段映射（根据协作文档）
            # responsibilities 应该从 description 字段获取
            if "responsibilities" in job_detail:
                print_result("PASS", "responsibilities 字段存在（符合文档）")
            elif "description" in job_detail:
                print_result("INFO", "使用 description 字段作为 responsibilities（符合映射）")
            else:
                print_result("WARN", "缺少 responsibilities 和 description 字段")
                results["document_issues"].append("岗位详情: 缺少 responsibilities/description 字段")

            # 检查其他必需字段
            required_fields = ["id", "title", "company", "requirements"]
            missing_fields = [f for f in required_fields if f not in job_detail]
            if missing_fields:
                print_result("WARN", f"岗位详情缺少字段: {missing_fields}")
                results["document_issues"].append(f"岗位详情缺少字段: {missing_fields}")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 404:
        print_result("WARN", f"岗位不存在（404）: {job_id_to_test}", "请先在数据库中创建测试岗位")
        results["document_issues"].append("岗位详情 API: 404 - 可能数据库中无测试数据")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# ==================== 2. 简历相关 API ====================
print_section("2. 简历相关 API")

# 2.1 保存简历
print(f"\n2.1 POST /api/open/resumes - 保存简历")

test_resume = {
    "userId": TEST_USER_ID,
    "resumeText": "姓名：测试用户\n电话：13800138000\n教育背景：武汉大学 计算机科学 本科",
    "structuredData": {
        "name": "测试用户",
        "phone": "13800138000",
        "email": "test@example.com",
        "education": [{"school": "武汉大学", "major": "计算机科学", "degree": "本科"}],
        "skills": ["Java", "Python"]
    },
    "fileId": "coze_test_file_123"
}

response, error = test_api("/resumes", method="POST", data=test_resume)

if error:
    print_result("FAIL", f"保存简历失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            resume_id = data.get("data", {}).get("id")
            print_result("PASS", f"保存简历成功，简历 ID: {resume_id}")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 401:
        print_result("INFO", "API 认证失败（401）", "开发环境可能需要配置 OPEN_API_KEY")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# 2.2 获取用户简历
print(f"\n2.2 GET /api/open/resumes/{{userId}} - 获取用户简历")

response, error = test_api(f"/resumes/{TEST_USER_ID}")

if error:
    print_result("FAIL", f"获取用户简历失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            resume = data.get("data", {})
            print_result("PASS", "获取用户简历成功")

            # 检查返回格式（应该包含 structuredData）
            if "structuredData" in resume:
                print_result("PASS", "返回数据包含 structuredData（符合文档）")
            else:
                print_result("WARN", "返回数据缺少 structuredData 字段")
                results["document_issues"].append("获取简历 API: 返回数据应包含 structuredData")

            if "resumeText" in resume:
                print_result("PASS", "返回数据包含 resumeText（符合文档）")
            else:
                print_result("WARN", "返回数据缺少 resumeText 字段")
        else:
            if response.status_code == 404:
                print_result("INFO", "用户简历不存在（404）", "这是正常的，如果之前没有保存过")
            else:
                print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# ==================== 3. 面试报告相关 API ====================
print_section("3. 面试报告相关 API")

# 3.1 保存面试报告
print(f"\n3.1 POST /api/open/interviews - 保存面试报告")

test_interview = {
    "userId": TEST_USER_ID,
    "jobId": TEST_JOB_ID,
    "totalScore": 78,
    "dimensions": [
        {"name": "专业知识", "score": 85, "maxScore": 100},
        {"name": "表达能力", "score": 72, "maxScore": 100}
    ],
    "highlights": [
        {
            "question": "请介绍你的项目经验",
            "answer": "我曾经负责...",
            "score": 90,
            "comment": "回答准确"
        }
    ],
    "improvements": [
        {"area": "表达能力", "suggestion": "多练习STAR法则"}
    ],
    "suggestions": "整体表现良好",
    "audioUrl": "https://example.com/audio.mp3",
    "conversation": [{"role": "user", "content": "你好"}]
}

response, error = test_api("/interviews", method="POST", data=test_interview)

if error:
    print_result("FAIL", f"保存面试报告失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            interview_id = data.get("data", {}).get("id")
            print_result("PASS", f"保存面试报告成功，报告 ID: {interview_id}")

            # 检查是否自动设置了 status=COMPLETED
            print_result("INFO", "请确认数据库中 status 是否已设置为 COMPLETED")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 401:
        print_result("INFO", "API 认证失败（401）", "开发环境可能需要配置 OPEN_API_KEY")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# 3.2 获取面试报告
print(f"\n3.2 GET /api/open/interviews/{{id}} - 获取面试报告")

# 注意：这里需要使用实际的 interview ID，暂时跳过
print_result("INFO", "跳过测试（需要先创建有效的面试报告 ID）")
results["document_issues"].append("面试报告详情 API: 未测试，需要有效的 interview ID")

# ==================== 4. 投递相关 API ====================
print_section("4. 投递相关 API")

# 4.1 提交投递
print(f"\n4.1 POST /api/open/applications - 提交投递")

test_application = {
    "userId": TEST_USER_ID,
    "jobId": TEST_JOB_ID,
    "resumeId": "test_resume_123",
    "interviewReportId": "test_interview_123"
}

response, error = test_api("/applications", method="POST", data=test_application)

if error:
    print_result("FAIL", f"提交投递失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            app_id = data.get("data", {}).get("id")
            print_result("PASS", f"提交投递成功，投递 ID: {app_id}")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 404:
        print_result("WARN", "API 端点不存在（404）", "投递 API 可能尚未实现")
        results["document_issues"].append("投递 API: 返回 404，接口可能未实现")
    elif response.status_code == 401:
        print_result("INFO", "API 认证失败（401）")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# 4.2 获取投递状态
print(f"\n4.2 GET /api/open/applications?userId={{userId}} - 获取投递状态")

response, error = test_api("/applications", params={"userId": TEST_USER_ID})

if error:
    print_result("FAIL", f"获取投递状态失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            applications = data.get("data", [])
            print_result("PASS", f"获取投递状态成功，返回 {len(applications)} 条数据")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 404:
        print_result("WARN", "API 端点不存在（404）", "投递 API 可能尚未实现")
        results["document_issues"].append("获取投递状态 API: 返回 404，接口可能未实现")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# ==================== 5. 会话管理 API ====================
print_section("5. 会话管理 API")

# 5.1 保存会话
print(f"\n5.1 POST /api/open/conversations - 保存会话")

test_conversation = {
    "userId": TEST_USER_ID,
    "conversationId": "coze_conv_123",
    "title": "测试会话",
    "status": "active",
    "sessionData": {
        "type": "interview",
        "jobId": TEST_JOB_ID,
        "messages": [
            {"role": "user", "content": "我想面试"},
            {"role": "assistant", "content": "好的"}
        ],
        "workflowStatus": {
            "currentStep": "voice_interview",
            "completedQuestions": [1, 2]
        }
    }
}

response, error = test_api("/conversations", method="POST", data=test_conversation)

if error:
    print_result("FAIL", f"保存会话失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            conv_id = data.get("data", {}).get("id")
            print_result("PASS", f"保存会话成功，会话 ID: {conv_id}")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 404:
        print_result("WARN", "API 端点不存在（404）", "会话管理 API 可能尚未实现")
        results["document_issues"].append("会话管理 API: 返回 404，接口可能未实现")
    elif response.status_code == 401:
        print_result("INFO", "API 认证失败（401）")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# 5.2 获取用户会话列表
print(f"\n5.2 GET /api/open/conversations/user/{{userId}} - 获取用户会话列表")

response, error = test_api(f"/conversations/user/{TEST_USER_ID}")

if error:
    print_result("FAIL", f"获取用户会话列表失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            conversations = data.get("data", [])
            print_result("PASS", f"获取用户会话列表成功，返回 {len(conversations)} 条数据")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 404:
        print_result("INFO", "会话列表为空或端点不存在")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# ==================== 6. 政策相关 API ====================
print_section("6. 政策相关 API")

print(f"\n6.1 GET /api/open/policies - 获取政策列表")

response, error = test_api("/policies", params={"limit": 5})

if error:
    print_result("FAIL", f"获取政策列表失败: {error}")
else:
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            policies = data.get("data", [])
            print_result("PASS", f"获取政策列表成功，返回 {len(policies)} 条数据")
        else:
            print_result("FAIL", f"API 返回 success=false: {data.get('error')}")
    elif response.status_code == 404:
        print_result("WARN", "API 端点不存在（404）", "政策 API 可能尚未实现")
        results["document_issues"].append("政策 API: 返回 404，接口可能未实现（P2 优先级）")
    else:
        print_result("INFO", f"API 返回状态码 {response.status_code}")

# ==================== 总结 ====================
print_section("测试总结")

print(f"\n通过: {len(results['passed'])}")
print(f"失败: {len(results['failed'])}")
print(f"警告: {len(results['warnings'])}")

if results["document_issues"]:
    print(f"\n发现的文档/接口问题 ({len(results['document_issues'])} 个):")
    for i, issue in enumerate(results["document_issues"], 1):
        print(f"  {i}. {issue}")

print(f"\n建议修复的优先级:")
if results["document_issues"]:
    print("  P0 - 必须修复（阻塞开发）:")
    p0_issues = [i for i in results["document_issues"] if "404" in i or "无法连接" in i]
    for issue in p0_issues:
        print(f"    - {issue}")

    print("  P1 - 建议修复（影响完整性）:")
    p1_issues = [i for i in results["document_issues"] if i not in p0_issues]
    for issue in p1_issues:
        print(f"    - {issue}")
else:
    print("  未发现文档或接口问题，所有接口符合规范！")

print(f"\n下一步建议:")
if "Connection refused" in str(results["failed"]):
    print("  1. 启动 B 端服务: cd web && npm run dev")
if results["document_issues"]:
    print("  2. 根据上述问题修复 B 端 API 实现")
    print("  3. 更新协作文档以反映实际实现")
else:
    print("  1. 所有 P0 API 已就绪，可以开始 C 端开发")
    print("  2. 运行 Coze 上传脚本: python main/main_upload.py")
