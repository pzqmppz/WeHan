"""
WeHan C 端简化部署流程 - v3.0 纯 API 架构

移除知识库和工作流依赖，仅部署智能体
工作流需要在 Coze 网页平台手动配置
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from coze.admin import CozeAdminAPI
from core.schema_validate import validate_config
from core.logger import logger
from core.exceptions import BaseCozeError


def deploy_bot_only():
    """简化的部署流程：仅创建智能体"""

    admin = CozeAdminAPI()

    print("=" * 60)
    print("WeHan C 端 → Coze 智能体部署 (v3.0 纯 API 架构)")
    print("=" * 60)

    # ===== 步骤1：校验配置 =====
    print("\n[步骤 1/2] 校验智能体配置...")
    bot_valid = validate_config(
        "config/local/wehan_bot.json",
        "config/schema/bot_schema.json"
    )

    if not bot_valid:
        raise Exception("配置校验失败，终止部署")
    print("[OK] 配置校验通过")

    # ===== 步骤2：创建智能体 =====
    print("\n[步骤 2/2] 创建智能体...")
    bot_id = admin.create_bot("config/local/wehan_bot.json")
    print(f"[OK] 智能体创建成功")
    print(f"      智能体 ID: {bot_id}")

    # ===== 部署完成 =====
    print("\n" + "=" * 60)
    print("部署完成！")
    print("=" * 60)

    print("\n后续操作：")
    print("1. 登录扣子平台：https://www.coze.cn")
    print("2. 找到创建的智能体，验证配置")
    print("3. 在预览面板测试对话功能")
    print("4. 工作流需要手动在网页平台配置（API 不可用）")
    print("5. 确认无误后，发布到豆包")

    print("\n智能体配置说明：")
    print("- 岗位查询：通过 HTTP 节点调用 B 端 /api/open/jobs")
    print("- 政策查询：通过 HTTP 节点调用 B 端 /api/open/policies")
    print("- 面试功能：需要手动配置工作流")

    return {
        "bot_id": bot_id,
        "deploy_time": "2026-02-28"
    }


if __name__ == "__main__":
    try:
        result = deploy_bot_only()
        print(f"\n部署成功！Bot ID: {result['bot_id']}")
        print("\n请将 Bot ID 保存到 .env 文件：")
        print(f"BOT_ID={result['bot_id']}")
    except BaseCozeError as e:
        logger.error(f"部署失败（Coze错误）：{e}")
    except Exception as e:
        logger.error(f"部署失败（系统错误）：{e}")
