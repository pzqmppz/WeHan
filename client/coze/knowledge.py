"""
Coze 知识库管理API封装
"""
import requests
from config.settings import COZE_PAT, COZE_API_TIMEOUT
from core.retry import retry
from core.logger import logger
from core.exceptions import TokenInvalidError

class CozeKnowledge:
    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {COZE_PAT}",
            "Content-Type": "application/json"
        }
        self.base_url = "https://api.coze.cn/v1/knowledge"

    @retry(max_retries=3)
    def search(self, knowledge_id: str, query: str, top_k: int = 5):
        """
        在知识库中搜索
        :param knowledge_id: 知识库ID
        :param query: 搜索查询
        :param top_k: 返回结果数量
        :return: 搜索结果
        """
        url = f"{self.base_url}/search"

        payload = {
            "knowledge_id": knowledge_id,
            "query": query,
            "top_k": top_k
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
            return result.get("data", [])

        raise Exception(f"知识库搜索失败：{result.get('msg')}")
