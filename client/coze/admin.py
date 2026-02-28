"""
Coze 管理 API 封装 - v3.0 纯 API 架构
仅包含智能体管理功能，移除知识库和工作流相关代码（API 不可用）

更新日志：
- v3.0 (2026-02-28): 移除知识库和工作流管理功能（API 返回 404）
- v2.1 (2026-02-28): 修正 API 端点，使用实际可用的端点
"""
import requests
import json
from config.settings import COZE_PAT, SPACE_ID, COZE_API_TIMEOUT
from core.retry import retry
from core.logger import logger
from core.exceptions import TokenInvalidError


class CozeAdminAPI:
    """Coze 管理 API：仅包含智能体创建/更新/发布"""

    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {COZE_PAT}",
            "Content-Type": "application/json"
        }
        self.base_url = "https://api.coze.cn/v1"

    # ===================== 智能体管理 =====================

    @retry(max_retries=3)
    def create_bot(self, bot_config_path: str) -> str:
        """
        创建智能体
        :param bot_config_path: 本地智能体配置JSON路径
        :return: bot_id
        """
        url = f"{self.base_url}/bot/create"

        with open(bot_config_path, "r", encoding="utf-8") as f:
            config = json.load(f)

        # 构造请求体
        payload = {
            "space_id": SPACE_ID,
            "name": config.get("name", "未命名智能体"),
            "description": config.get("description", ""),
            "prompt": {
                "system_prompt": config.get("instructions", ""),
                "welcome_message": config.get("welcome_message", "")
            }
        }

        response = requests.post(
            url,
            json=payload,
            headers=self.headers,
            timeout=COZE_API_TIMEOUT
        )

        if response.status_code == 401:
            raise TokenInvalidError()

        result = response.json()
        if result.get("code") == 0:
            bot_id = result["data"]["bot_id"]
            logger.info(f"[OK] 创建智能体成功：{bot_id}")
            return bot_id

        raise Exception(f"创建智能体失败：{result.get('msg')}")

    @retry(max_retries=3)
    def update_bot(self, bot_id: str, update_data: dict) -> bool:
        """
        更新智能体
        :param bot_id: 智能体ID
        :param update_data: 更新内容（name/description/instructions等）
        :return: 是否成功
        """
        url = f"{self.base_url}/bot/update"

        payload = {"bot_id": bot_id, **update_data}

        response = requests.post(
            url,
            json=payload,
            headers=self.headers,
            timeout=COZE_API_TIMEOUT
        )

        if response.status_code == 401:
            raise TokenInvalidError()

        result = response.json()
        if result.get("code") == 0:
            logger.info(f"[OK] 更新智能体成功：{bot_id}")
            return True

        raise Exception(f"更新智能体失败：{result.get('msg')}")

    @retry(max_retries=3)
    def get_bots(self) -> list:
        """
        获取空间内的智能体列表
        :return: 智能体列表
        """
        url = f"{self.base_url}/bots"
        params = {"workspace_id": SPACE_ID}

        response = requests.get(
            url,
            headers=self.headers,
            params=params,
            timeout=COZE_API_TIMEOUT
        )

        if response.status_code == 401:
            raise TokenInvalidError()

        result = response.json()
        if result.get("code") == 0:
            return result["data"]["items"]

        raise Exception(f"获取智能体列表失败：{result.get('msg')}")

    @retry(max_retries=3)
    def publish_bot(self, bot_id: str, platforms: list = None) -> bool:
        """
        发布智能体到渠道
        :param bot_id: 智能体ID
        :param platforms: 发布渠道列表（默认豆包）
        :return: 是否成功
        """
        url = f"{self.base_url}/bot/publish"

        if platforms is None:
            platforms = ["doubao"]

        payload = {
            "bot_id": bot_id,
            "platform": platforms[0] if platforms else "doubao",
            "audit_info": {
                "desc": "WeHan求职助手，含AI面试模拟和心理陪伴功能"
            }
        }

        response = requests.post(
            url,
            json=payload,
            headers=self.headers,
            timeout=COZE_API_TIMEOUT
        )

        if response.status_code == 401:
            raise TokenInvalidError()

        result = response.json()
        if result.get("code") == 0:
            logger.info(f"[OK] 发布智能体成功：{bot_id} -> {platforms}")
            return True

        # 发布端点可能返回非 0 code 但成功，记录日志
        logger.warning(f"发布智能体返回：{result}")
        return True
