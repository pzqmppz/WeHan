"""
找出真正可用的 Coze API 端点
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import requests
from config.settings import COZE_PAT, SPACE_ID

def find_working_endpoints():
    """测试各种可能的端点组合"""

    headers = {
        "Authorization": f"Bearer {COZE_PAT}",
        "Content-Type": "application/json"
    }

    print("=" * 60)
    print("Coze API 端点可用性测试")
    print("=" * 60)

    # 测试端点列表
    endpoints_to_test = [
        # 空间相关
        ("GET", "/v1/space/list", None),
        ("GET", "/v1/spaces", None),
        ("GET", "/v1/space", None),

        # 智能体相关
        ("POST", "/v1/bot/create", {"space_id": SPACE_ID, "name": "测试bot", "prompt": {"system_prompt": "测试"}}),
        ("POST", "/v1/bot", {"space_id": SPACE_ID, "name": "测试bot", "prompt": {"system_prompt": "测试"}}),
        ("POST", "/v1/bots/create", {"space_id": SPACE_ID, "name": "测试bot"}),
        ("GET", "/v1/bot/list", None),

        # 工作流相关
        ("POST", "/v1/workflow/create", {"space_id": SPACE_ID, "name": "测试workflow"}),
        ("POST", "/v1/workflow/import", {"space_id": SPACE_ID, "name": "测试workflow"}),
        ("POST", "/v1/workflow", {"space_id": SPACE_ID, "name": "测试workflow"}),
        ("POST", "/v1/workflows/create", {"space_id": SPACE_ID, "name": "测试workflow"}),

        # 知识库相关
        ("POST", "/v1/knowledge/create", {"space_id": SPACE_ID, "name": "测试知识库", "type": "document"}),
        ("POST", "/v1/knowledge_base", {"space_id": SPACE_ID, "name": "测试知识库", "type": "document"}),
        ("POST", "/v1/knowledge_base/create", {"space_id": SPACE_ID, "name": "测试知识库"}),
        ("POST", "/v1/knowledge", {"space_id": SPACE_ID, "name": "测试知识库", "type": "document"}),
        ("POST", "/v1/knowledges/create", {"space_id": SPACE_ID, "name": "测试知识库"}),
    ]

    working = []
    not_working = []

    for method, path, body in endpoints_to_test:
        url = f"https://api.coze.cn{path}"
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, timeout=10)
            else:
                response = requests.post(url, headers=headers, json=body, timeout=10)

            # 判断是否可用
            is_working = response.status_code == 200
            if is_working:
                # 进一步检查响应内容
                try:
                    resp_json = response.json()
                    if resp_json.get("code") == 0:
                        working.append((method, path, response.status_code))
                        print(f"[OK] {method:6} {path}")
                    else:
                        not_working.append((method, path, response.status_code, resp_json.get("msg", "未知错误")))
                        print(f"[FAIL] {method:6} {path} - {resp_json.get('msg', '未知错误')}")
                except:
                    working.append((method, path, response.status_code))
                    print(f"[OK] {method:6} {path}")
            else:
                error_msg = response.text[:100] if response.text else "无响应"
                not_working.append((method, path, response.status_code, error_msg))
                print(f"[{response.status_code}] {method:6} {path}")

        except Exception as e:
            not_working.append((method, path, "ERR", str(e)[:50]))
            print(f"[ERR] {method:6} {path} - {str(e)[:50]}")

    # 打印汇总
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)
    print(f"\n可用的端点 ({len(working)}):")
    for m, p, code in working:
        print(f"  [OK] {m:6} {p}")

    print(f"\n不可用的端点 ({len(not_working)}):")
    for m, p, code, msg in not_working[:10]:  # 只显示前10个
        print(f"  [{code}] {m:6} {p}")
    if len(not_working) > 10:
        print(f"  ... 还有 {len(not_working) - 10} 个")

if __name__ == "__main__":
    find_working_endpoints()
