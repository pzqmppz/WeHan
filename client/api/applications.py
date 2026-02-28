"""
B端投递API对接
"""
import requests
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.logger import logger
from core.exceptions import BApiCallError

def submit_application(user_id: str, job_id: str, resume_id: str = None, interview_report_id: str = None):
    """提交投递"""
    url = f"{B_API_BASE_URL}/applications"
    headers = {
        "X-API-Key": B_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "userId": user_id,
        "jobId": job_id
    }
    if resume_id:
        payload["resumeId"] = resume_id
    if interview_report_id:
        payload["interviewReportId"] = interview_report_id

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError("/applications", response.status_code)
        return response.json()
    except Exception as e:
        logger.error(f"提交投递失败：{e}")
        raise

def get_applications(user_id: str):
    """获取用户投递列表"""
    url = f"{B_API_BASE_URL}/applications"
    headers = {"X-API-Key": B_API_KEY}

    try:
        response = requests.get(url, headers=headers, params={"userId": user_id}, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError("/applications", response.status_code)
        return response.json()
    except Exception as e:
        logger.error(f"获取投递列表失败：{e}")
        raise
