"""
B端岗位API对接：你需填充具体的请求逻辑
"""
import requests
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.logger import logger
from core.exceptions import BApiCallError

def get_job_list(keyword: str = None, industry: str = None, location: str = "武汉", limit: int = 10):
    """获取岗位列表"""
    url = f"{B_API_BASE_URL}/jobs"
    headers = {"X-API-Key": B_API_KEY}  # 使用 X-API-Key 认证

    params = {"limit": limit}
    if keyword:
        params["keyword"] = keyword
    if industry:
        params["industry"] = industry
    if location:
        params["location"] = location

    try:
        response = requests.get(url, headers=headers, params=params, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError("/jobs", response.status_code)
        return response.json()
    except Exception as e:
        logger.error(f"获取岗位列表失败：{e}")
        raise

def get_job_detail(job_id: str):
    """获取岗位详情"""
    url = f"{B_API_BASE_URL}/jobs/{job_id}"
    headers = {"X-API-Key": B_API_KEY}

    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError(f"/jobs/{job_id}", response.status_code)
        return response.json()
    except Exception as e:
        logger.error(f"获取岗位{job_id}详情失败：{e}")
        raise
