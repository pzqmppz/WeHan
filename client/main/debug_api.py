"""
API 调试脚本 - 打印原始响应内容
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from config.settings import COZE_PAT, SPACE_ID

def test_endpoint_debug():
    """调试 API 端点，打印原始响应"""

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    print("=" * 60)
    print("Coze API 调试测试")
    print("=" * 60)
    print(f"PAT: {COZE_PAT[:20]}...")
    print(f"SPACE_ID: {SPACE_ID}")
    print("=" * 60)

    # ===== 测试 1: 验证连接 =====
    print("\n[测试 1] 验证空间列表 (GET /v1/space/list)")
    try:
        response = requests.get("https://api.coze.cn/v1/space/list", headers=headers, timeout=30)
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应内容: {response.text[:500]}")
    except Exception as e:
        print(f"[FAIL] {e}")

    # ===== 测试 2: 创建智能体 =====
    print("\n[测试 2] 创建智能体 (POST /v1/bot)")
    bot_payload = {
        "space_id": SPACE_ID,
        "name": "测试智能体",
        "description": "API 调试测试",
        "prompt": {
            "system_prompt": "你是测试助手"
        }
    }

    try:
        response = requests.post(
            "https://api.coze.cn/v1/bot",
            headers=headers,
            json=bot_payload,
            timeout=30
        )
        print(f"状态码: {response.status_code}")
        print(f"响应头: {dict(response.headers)}")
        print(f"响应内容: {response.text}")
    except Exception as e:
        print(f"[FAIL] {e}")

    # ===== 测试 3: 尝试旧端点 =====
    print("\n[测试 3] 尝试旧端点 (POST /v1/bot/create)")
    try:
        response = requests.post(
            "https://api.coze.cn/v1/bot/create",
            headers=headers,
            json=bot_payload,
            timeout=30
        )
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.text[:500]}")
    except Exception as e:
        print(f"[FAIL] {e}")

    # ===== 测试 4: 创建工作流 =====
    print("\n[测试 4] 创建工作流 (POST /v1/workflow)")
    workflow_payload = {
        "space_id": SPACE_ID,
        "name": "测试工作流",
        "description": "API 调试测试",
        "nodes": [],
        "edges": []
    }

    try:
        response = requests.post(
            "https://api.coze.cn/v1/workflow",
            headers=headers,
            json=workflow_payload,
            timeout=30
        )
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.text[:500]}")
    except Exception as e:
        print(f"[FAIL] {e}")

    # ===== 测试 5: 知识库 =====
    print("\n[测试 5] 创建知识库 (POST /v1/knowledge_base)")
    kb_payload = {
        "space_id": SPACE_ID,
        "name": "测试知识库",
        "type": "document"
    }

    try:
        response = requests.post(
            "https://api.coze.cn/v1/knowledge_base",
            headers=headers,
            json=kb_payload,
            timeout=30
        )
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.text[:500]}")
    except Exception as e:
        print(f"[FAIL] {e}")

    # ===== 测试 6: 尝试国际版 =====
    print("\n[测试 6] 尝试国际版 API (api.coze.com)")
    try:
        response = requests.get(
            "https://api.coze.com/v1/space/list",
            headers=headers,
            timeout=30
        )
        print(f"状态码: {response.status_code}")
        print(f"响应内容: {response.text[:300]}")
    except Exception as e:
        print(f"[FAIL] {e}")

if __name__ == "__main__":
    test_endpoint_debug()
