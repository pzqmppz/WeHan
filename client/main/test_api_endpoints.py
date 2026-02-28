"""
API 端点测试脚本 - 逐一测试每个修正后的端点
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from coze.admin import CozeAdminAPI
from core.logger import logger

def test_all_endpoints():
    """测试所有 API 端点"""

    admin = CozeAdminAPI()

    print("=" * 60)
    print("Coze API 端点完整测试")
    print("=" * 60)

    results = []

    # ===== 测试 1: 创建智能体 =====
    print("\n[测试 1/5] 创建智能体 (POST /v1/bot)")
    try:
        bot_id = admin.create_bot("config/local/wehan_bot.json")
        print(f"[OK] 智能体创建成功，ID: {bot_id}")
        results.append({"功能": "创建智能体", "端点": "POST /v1/bot", "状态": "成功", "ID": bot_id})
    except Exception as e:
        print(f"[FAIL] 创建智能体失败: {e}")
        results.append({"功能": "创建智能体", "端点": "POST /v1/bot", "状态": "失败", "错误": str(e)})
        # 无法继续后续测试，直接返回
        print("\n智能体创建失败，跳过后续测试")
        return results

    # ===== 测试 2: 更新智能体 =====
    print("\n[测试 2/5] 更新智能体 (PATCH /v1/bot/{id})")
    try:
        update_result = admin.update_bot(bot_id, {
            "description": "WeHan 求职助手 - 更新测试"
        })
        print(f"[OK] 智能体更新成功")
        results.append({"功能": "更新智能体", "端点": "PATCH /v1/bot/{id}", "状态": "成功"})
    except Exception as e:
        print(f"[FAIL] 更新智能体失败: {e}")
        results.append({"功能": "更新智能体", "端点": "PATCH /v1/bot/{id}", "状态": "失败", "错误": str(e)})

    # ===== 测试 3: 创建工作流 =====
    print("\n[测试 3/5] 创建工作流 (POST /v1/workflow)")
    try:
        workflow_id = admin.import_workflow("config/local/interview_workflow.json")
        print(f"[OK] 工作流创建成功，ID: {workflow_id}")
        results.append({"功能": "创建工作流", "端点": "POST /v1/workflow", "状态": "成功", "ID": workflow_id})
    except Exception as e:
        print(f"[FAIL] 创建工作流失败: {e}")
        results.append({"功能": "创建工作流", "端点": "POST /v1/workflow", "状态": "失败", "错误": str(e)})
        workflow_id = None

    # ===== 测试 4: 绑定工作流到智能体 =====
    print("\n[测试 4/5] 绑定工作流到智能体 (POST /v1/bot/{id}/workflow/bind)")
    try:
        bind_result = admin.bind_workflow_to_bot(bot_id, workflow_id)
        print(f"[OK] 工作流绑定成功")
        results.append({"功能": "绑定工作流", "端点": "POST /v1/bot/{id}/workflow/bind", "状态": "成功"})
    except Exception as e:
        print(f"[FAIL] 绑定工作流失败: {e}")
        results.append({"功能": "绑定工作流", "端点": "POST /v1/bot/{id}/workflow/bind", "状态": "失败", "错误": str(e)})

    # ===== 测试 5: 创建知识库 =====
    print("\n[测试 5/5] 创建知识库 (POST /v1/knowledge_base)")
    try:
        knowledge_id = admin.create_knowledge("测试知识库", "API 测试用")
        print(f"[OK] 知识库创建成功，ID: {knowledge_id}")
        results.append({"功能": "创建知识库", "端点": "POST /v1/knowledge_base", "状态": "成功", "ID": knowledge_id})
    except Exception as e:
        print(f"[FAIL] 创建知识库失败: {e}")
        results.append({"功能": "创建知识库", "端点": "POST /v1/knowledge_base", "状态": "失败", "错误": str(e)})

    # ===== 打印测试结果汇总 =====
    print("\n" + "=" * 60)
    print("测试结果汇总")
    print("=" * 60)

    success_count = 0
    fail_count = 0

    for r in results:
        status_symbol = "[OK]" if r["状态"] == "成功" else "[FAIL]"
        print(f"{status_symbol} {r['功能']:<15} | {r['端点']:<35} | {r['状态']}")
        if r["状态"] == "成功":
            success_count += 1
        else:
            fail_count += 1

    print("\n" + "-" * 60)
    print(f"总计: {len(results)} 项测试 | 成功: {success_count} | 失败: {fail_count}")
    print("=" * 60)

    if success_count == len(results):
        print("\n所有测试通过!")
    else:
        print("\n存在失败的测试，请查看上方错误信息")

    return results

if __name__ == "__main__":
    try:
        results = test_all_endpoints()
    except Exception as e:
        logger.error(f"测试异常: {e}")
