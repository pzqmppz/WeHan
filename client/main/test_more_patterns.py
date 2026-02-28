"""
测试更多可能的 API 端点模式
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from config.settings import COZE_PAT, SPACE_ID

def test_more_patterns():
    """测试更多 API 路径模式"""

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    print("=" * 60)
    print("Coze API 更多端点测试")
    print("=" * 60)

    # 更多可能的端点
    more_endpoints = [
        # 不同的 API 版本
        ("POST", "/v1/bot/create", {"space_id": SPACE_ID, "name": "test", "prompt": {"system_prompt": "test"}}),
        ("POST", "/v2/bot/create", {"space_id": SPACE_ID, "name": "test", "prompt": {"system_prompt": "test"}}),
        ("POST", "/v3/bot/create", {"space_id": SPACE_ID, "name": "test", "prompt": {"system_prompt": "test"}}),

        # API 前缀变体
        ("POST", "/api/v1/bot/create", {"space_id": SPACE_ID, "name": "test", "prompt": {"system_prompt": "test"}}),
        ("POST", "/open_api/v1/bot/create", {"space_id": SPACE_ID, "name": "test", "prompt": {"system_prompt": "test"}}),

        # Bot 列表
        ("GET", "/v1/bot/list", None),
        ("GET", "/v1/bots", None),
        ("GET", "/v1/api/bot/list", None),

        # 工作流 - 不同变体
        ("POST", "/v1/workflow/create", {"space_id": SPACE_ID, "name": "test"}),
        ("POST", "/v2/workflow/create", {"space_id": SPACE_ID, "name": "test"}),
        ("POST", "/api/v1/workflow/create", {"space_id": SPACE_ID, "name": "test"}),

        # 知识库 - 不同变体
        ("POST", "/v1/knowledge_base/create", {"space_id": SPACE_ID, "name": "test", "type": "document"}),
        ("POST", "/v1/knowledge/create", {"space_id": SPACE_ID, "name": "test", "type": "document"}),
        ("POST", "/v2/knowledge/create", {"space_id": SPACE_ID, "name": "test", "type": "document"}),

        # 尝试更新 bot
        ("POST", "/v1/bot/update", {"bot_id": "test", "name": "updated"}),
        ("PATCH", "/v1/bot/test", {"name": "updated"}),

        # 尝试发布 bot
        ("POST", "/v1/bot/publish", {"bot_id": "test", "platforms": ["doubao"]}),
    ]

    for method, path, body in more_endpoints:
        url = f"https://api.coze.cn{path}"
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            elif method == "PATCH":
                response = requests.patch(url, headers=headers, json=body, timeout=10)
            else:
                response = requests.post(url, headers=headers, json=body, timeout=10)

            if response.status_code == 200:
                try:
                    resp_json = response.json()
                    if resp_json.get("code") == 0:
                        print(f"[OK] {method:6} {path}")
                    else:
                        print(f"[200 BUT ERR] {method:6} {path} - {resp_json.get('msg', '未知')[:50]}")
                except:
                    print(f"[OK RAW] {method:6} {path}")
            elif response.status_code == 500:
                print(f"[500] {method:6} {path} - 服务器错误")
            elif response.status_code == 404:
                # 404 太多了，用简单符号
                print(f"[404] {method:6} {path}")
            else:
                print(f"[{response.status_code}] {method:6} {path} - {response.text[:50]}")

        except Exception as e:
            print(f"[ERR] {method:6} {path} - {str(e)[:30]}")

if __name__ == "__main__":
    test_more_patterns()
