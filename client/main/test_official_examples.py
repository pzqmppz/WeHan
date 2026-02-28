"""
测试豆包官方给出的标准 API 示例
基于官方文档中的端点进行验证
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from config.settings import COZE_PAT, SPACE_ID

COZE_BASE_URL = "https://api.coze.cn/v1"

def test_official_bot_endpoint():
    """测试官方给出的智能体创建端点"""
    print("=" * 60)
    print("Test 1: Official Endpoint POST /v1/bot")
    print("=" * 60)

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    # 官方给出的请求体格式
    payload = {
        "space_id": SPACE_ID,
        "name": "Official Test Bot",
        "prompt": {
            "system_prompt": "You are a test assistant"
        }
    }

    response = requests.post(
        f"{COZE_BASE_URL}/bot",
        headers=headers,
        json=payload,
        timeout=30
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

    return response.status_code == 200


def test_actual_working_endpoint():
    """测试实际可用的端点"""
    print("\n" + "=" * 60)
    print("Test 2: Actually Working Endpoint POST /v1/bot/create")
    print("=" * 60)

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    payload = {
        "space_id": SPACE_ID,
        "name": "Comparison Test Bot",
        "prompt": {
            "system_prompt": "You are a test assistant"
        }
    }

    response = requests.post(
        f"{COZE_BASE_URL}/bot/create",
        headers=headers,
        json=payload,
        timeout=30
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

    return response.status_code == 200


def test_official_workflow_endpoint():
    """测试官方给出的工作流端点"""
    print("\n" + "=" * 60)
    print("Test 3: Official Endpoint POST /v1/workflow")
    print("=" * 60)

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    # 官方给出的请求体格式
    payload = {
        "space_id": SPACE_ID,
        "name": "Test Workflow",
        "description": "API Test Workflow",
        "nodes": [],
        "edges": []
    }

    response = requests.post(
        f"{COZE_BASE_URL}/workflow",
        headers=headers,
        json=payload,
        timeout=30
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

    return response.status_code == 200


def test_official_knowledge_base_endpoint():
    """测试官方给出的知识库端点"""
    print("\n" + "=" * 60)
    print("Test 4: Official Endpoint POST /v1/knowledge_base")
    print("=" * 60)

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    # 官方给出的请求体格式
    payload = {
        "space_id": SPACE_ID,
        "name": "Test Knowledge Base",
        "type": "document"
    }

    response = requests.post(
        f"{COZE_BASE_URL}/knowledge_base",
        headers=headers,
        json=payload,
        timeout=30
    )

    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

    return response.status_code == 200


def test_pat_validity():
    """验证 PAT 有效性 - 尝试多种方式"""
    print("\n" + "=" * 60)
    print("Test 0: Verify PAT Validity")
    print("=" * 60)

    headers = {
        "Authorization": f"Bearer {COZE_PAT}"
    }

    # 尝试多种端点
    endpoints_to_test = [
        ("/space/list", "GET"),
        ("/spaces", "GET"),
        ("/users/me", "GET"),
        ("/bots", "GET"),  # 使用实际可用的端点
    ]

    working_endpoint = None

    for endpoint, method in endpoints_to_test:
        url = f"{COZE_BASE_URL}{endpoint}"
        print(f"\nTrying: {method} {url}")

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            else:
                response = requests.post(url, headers=headers, timeout=30)

            print(f"  Status: {response.status_code}")

            if response.status_code == 200:
                print(f"  Response (first 200 chars): {response.text[:200]}")
                working_endpoint = endpoint
                break
            else:
                print(f"  Response: {response.text[:100]}")
        except Exception as e:
            print(f"  Error: {e}")

    return working_endpoint is not None


if __name__ == "__main__":
    print("Testing Official Coze API Examples\n")

    results = {
        "Official POST /v1/bot": test_official_bot_endpoint(),
        "Actual POST /v1/bot/create": test_actual_working_endpoint(),
        "Official POST /v1/workflow": test_official_workflow_endpoint(),
        "Official POST /v1/knowledge_base": test_official_knowledge_base_endpoint(),
    }

    print("\n" + "=" * 60)
    print("Test Results Summary")
    print("=" * 60)

    for name, success in results.items():
        status = "[OK] Success" if success else "[FAIL] Failed"
        print(f"{name}: {status}")

    # Statistics
    success_count = sum(results.values())
    total_count = len(results)
    print(f"\nAccuracy: {success_count}/{total_count} ({success_count/total_count*100:.0f}%)")

    # Conclusion
    print("\n" + "=" * 60)
    print("Conclusion")
    print("=" * 60)

    if results["Actual POST /v1/bot/create"]:
        print("The actually working endpoint is: POST /v1/bot/create")
        print("Official endpoint POST /v1/bot returns 404")

    if not results["Official POST /v1/workflow"]:
        print("Official workflow endpoint POST /v1/workflow returns 404")

    if not results["Official POST /v1/knowledge_base"]:
        print("Official knowledge base endpoint POST /v1/knowledge_base returns 404")
