"""
深入探索工作流和知识库 API
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from config.settings import COZE_PAT, SPACE_ID

def explore_workflows_and_knowledge():
    """探索工作流和知识库 API"""

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    print("=" * 60)
    print("工作流和知识库 API 深度探索")
    print("=" * 60)

    # ===== 先获取现有工作流列表 =====
    print("\n[测试 1] 获取工作流列表 (不同参数)")
    for param_name in ["workspace_id", "space_id"]:
        params = {param_name: SPACE_ID}
        response = requests.get(
            "https://api.coze.cn/v1/workflows",
            headers=headers,
            params=params,
            timeout=10
        )
        print(f"  GET /v1/workflows?{param_name}=... -> [{response.status_code}]")
        if response.status_code == 200:
            print(f"    响应: {response.text[:300]}")
        elif response.status_code == 500:
            # 500 可能是内部错误，但端点存在
            print(f"    响应: {response.text[:200]}")

    # ===== 尝试不同的工作流端点 =====
    print("\n[测试 2] 工作流端点变体")
    workflow_variants = [
        ("POST", "/v1/workflow", {"space_id": SPACE_ID, "name": "test"}),
        ("POST", "/v1/workflow", {"workspace_id": SPACE_ID, "name": "test"}),
        ("POST", "/v1/workflow/create", {"space_id": SPACE_ID, "name": "test"}),
        ("POST", "/v1/workflow/create", {"workspace_id": SPACE_ID, "name": "test"}),
        ("POST", "/v1/workflow/create", {"WorkspaceId": SPACE_ID, "name": "test"}),
        ("PUT", "/v1/workflow", {"workspace_id": SPACE_ID, "name": "test"}),
        ("POST", "/v1/api/workflow/create", {"workspace_id": SPACE_ID, "name": "test"}),
    ]

    for method, path, body in workflow_variants:
        url = f"https://api.coze.cn{path}"
        if method == "POST":
            resp = requests.post(url, headers=headers, json=body, timeout=10)
        else:
            resp = requests.put(url, headers=headers, json=body, timeout=10)

        if resp.status_code == 200:
            print(f"  [OK] {method} {path}")
            print(f"      响应: {resp.text[:200]}")
        elif resp.status_code not in [404, 500]:
            print(f"  [{resp.status_code}] {method} {path}")
            print(f"      响应: {resp.text[:150]}")

    # ===== 知识库探索 =====
    print("\n[测试 3] 知识库端点变体")
    kb_variants = [
        ("GET", "/v1/knowledge_bases", None),
        ("GET", "/v1/knowledge_bases?workspace_id=" + SPACE_ID, None),
        ("GET", "/v1/knowledge", None),
        ("POST", "/v1/knowledge_base/create", {"workspace_id": SPACE_ID, "name": "test", "type": "document"}),
        ("POST", "/v1/knowledge_base/create", {"space_id": SPACE_ID, "name": "test", "type": "document"}),
        ("POST", "/v1/knowledge/create", {"workspace_id": SPACE_ID, "name": "test", "type": "document"}),
        ("POST", "/v1/knowledge", {"workspace_id": SPACE_ID, "name": "test"}),
    ]

    for method, path, body in kb_variants:
        if "?" in path:
            url = f"https://api.coze.cn{path}"
            resp = requests.get(url, headers=headers, timeout=10)
        elif method == "GET":
            url = f"https://api.coze.cn{path}"
            resp = requests.get(url, headers=headers, timeout=10)
        else:
            url = f"https://api.coze.cn{path}"
            resp = requests.post(url, headers=headers, json=body, timeout=10)

        if resp.status_code == 200:
            try:
                resp_json = resp.json()
                if resp_json.get("code") == 0:
                    print(f"  [OK] {method} {path}")
                else:
                    print(f"  [200 ERR] {method} {path} - {resp_json.get('msg', '?')[:50]}")
            except:
                print(f"  [OK RAW] {method} {path}")
        elif resp.status_code not in [404, 500]:
            print(f"  [{resp.status_code}] {method} {path}")
            if resp.text:
                print(f"      响应: {resp.text[:150]}")

    # ===== 检查 bot 列表中的可用功能 =====
    print("\n[测试 4] 检查现有 bot 的详细信息")
    # 获取 bot 列表
    resp = requests.get(
        "https://api.coze.cn/v1/bots",
        headers=headers,
        params={"workspace_id": SPACE_ID},
        timeout=10
    )
    if resp.status_code == 200:
        try:
            data = resp.json()
            if "data" in data and "items" in data["data"]:
                bots = data["data"]["items"]
                print(f"  找到 {len(bots)} 个 bot:")
                for bot in bots:
                    bot_id = bot.get("id", "")
                    name = bot.get("name", "")
                    print(f"    - {name} (ID: {bot_id})")
        except Exception as e:
            print(f"  解析失败: {e}")

if __name__ == "__main__":
    explore_workflows_and_knowledge()
