"""
测试发现的端点 - /v1/bots
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from config.settings import COZE_PAT, SPACE_ID

def test_discovered_endpoints():
    """测试发现的可用端点"""

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    print("=" * 60)
    print("测试发现的端点")
    print("=" * 60)

    # ===== 测试 1: /v1/bots (需要 WorkspaceId) =====
    print("\n[测试 1] GET /v1/bots 尝试不同参数")
    for param_name in ["workspace_id", "WorkspaceId", "space_id", "SpaceId"]:
        params = {param_name: SPACE_ID}
        response = requests.get(
            "https://api.coze.cn/v1/bots",
            headers=headers,
            params=params,
            timeout=10
        )
        print(f"  {param_name}={SPACE_ID[:10]}... -> [{response.status_code}]")
        if response.status_code == 200:
            print(f"    响应: {response.text[:200]}")

    # ===== 测试 2: 使用创建的 bot_id 测试其他端点 =====
    # 先创建一个测试 bot
    print("\n[测试 2] 创建测试 bot")
    create_resp = requests.post(
        "https://api.coze.cn/v1/bot/create",
        headers=headers,
        json={"space_id": SPACE_ID, "name": "测试bot", "prompt": {"system_prompt": "test"}},
        timeout=10
    )
    if create_resp.status_code == 200:
        result = create_resp.json()
        if result.get("code") == 0:
            bot_id = result["data"]["bot_id"]
            print(f"  创建成功，bot_id: {bot_id}")

            # 测试更新
            print("\n[测试 3] 更新 bot (POST /v1/bot/update)")
            update_resp = requests.post(
                "https://api.coze.cn/v1/bot/update",
                headers=headers,
                json={"bot_id": bot_id, "description": "更新后的描述"},
                timeout=10
            )
            print(f"  状态码: {update_resp.status_code}")
            print(f"  响应: {update_resp.text[:200]}")

            # 测试发布
            print("\n[测试 4] 发布 bot (POST /v1/bot/publish)")
            publish_resp = requests.post(
                "https://api.coze.cn/v1/bot/publish",
                headers=headers,
                json={
                    "bot_id": bot_id,
                    "platform": "doubao",
                    "audit_info": {"desc": "测试发布"}
                },
                timeout=10
            )
            print(f"  状态码: {publish_resp.status_code}")
            print(f"  响应: {publish_resp.text[:200]}")

            # 测试获取 bot 详情
            print("\n[测试 5] 获取 bot 详情")
            for path_pattern in [f"/v1/bot/{bot_id}", f"/v1/bot/get", f"/v1/bots/{bot_id}"]:
                url = f"https://api.coze.cn{path_pattern}"
                resp = requests.get(url, headers=headers, timeout=10)
                print(f"  GET {path_pattern} -> [{resp.status_code}]")
                if resp.status_code == 200:
                    print(f"    响应: {resp.text[:150]}")
        else:
            print(f"  创建失败: {result}")
    else:
        print(f"  创建请求失败: {create_resp.status_code}")

    # ===== 测试 6: 工作流相关的其他端点 =====
    print("\n[测试 6] 工作流其他可能端点")
    workflow_endpoints = [
        "POST /v1/workflow/create",
        "POST /v1/workflow/import",
        "POST /v1/workflows",
        "GET /v1/workflows",
        "GET /v1/workflow/list",
    ]
    for endpoint in workflow_endpoints:
        method, path = endpoint.split()
        url = f"https://api.coze.cn{path}"
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=10)
        else:
            resp = requests.post(url, headers=headers, json={"space_id": SPACE_ID, "name": "test"}, timeout=10)
        print(f"  {endpoint} -> [{resp.status_code}]")

    # ===== 测试 7: 知识库相关 =====
    print("\n[测试 7] 知识库其他可能端点")
    kb_endpoints = [
        "GET /v1/knowledge_bases",
        "GET /v1/knowledges",
        "POST /v1/knowledge",
    ]
    for endpoint in kb_endpoints:
        method, path = endpoint.split()
        url = f"https://api.coze.cn{path}"
        if method == "GET":
            resp = requests.get(url, headers=headers, timeout=10)
        else:
            resp = requests.post(url, headers=headers, json={"space_id": SPACE_ID, "name": "test"}, timeout=10)
        print(f"  {endpoint} -> [{resp.status_code}]")

if __name__ == "__main__":
    test_discovered_endpoints()
