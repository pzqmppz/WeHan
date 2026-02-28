"""
B端政策API对接
"""
import requests
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.logger import logger
from core.exceptions import BApiCallError

def get_policies(category: str = None, limit: int = 10):
    """获取政策列表"""
    url = f"{B_API_BASE_URL}/policies"
    headers = {"X-API-Key": B_API_KEY}

    params = {"limit": limit}
    if category:
        params["category"] = category

    try:
        response = requests.get(url, headers=headers, params=params, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError("/policies", response.status_code)
        return response.json()
    except Exception as e:
        logger.error(f"获取政策列表失败：{e}")
        raise
