"""
B端面试报告API对接：你需填充具体的请求逻辑
"""
import requests
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.logger import logger
from core.exceptions import BApiCallError

def save_interview_report(report_data: dict):
    """保存面试报告"""
    url = f"{B_API_BASE_URL}/interviews"
    headers = {
        "X-API-Key": B_API_KEY,
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            url,
            json=report_data,
            headers=headers,
            timeout=B_API_TIMEOUT
        )
        if response.status_code != 200:
            raise BApiCallError("/interviews", response.status_code)
        logger.info("面试报告保存成功")
        return response.json()
    except Exception as e:
        logger.error(f"保存面试报告失败：{e}")
        raise

def get_interview_report(report_id: str):
    """获取面试报告"""
    url = f"{B_API_BASE_URL}/interviews/{report_id}"
    headers = {"X-API-Key": B_API_KEY}

    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError(f"/interviews/{report_id}", response.status_code)
        return response.json()
    except Exception as e:
        logger.error(f"获取面试报告{report_id}失败：{e}")
        raise
