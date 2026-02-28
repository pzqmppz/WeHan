"""
B端简历API对接
"""
import requests
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.logger import logger
from core.exceptions import BApiCallError

def save_resume_to_cloud(user_id: str, resume_text: str, structured_data: dict = None, file_id: str = None):
    """将解析后的简历同步到云端数据库（B端）"""
    url = f"{B_API_BASE_URL}/resumes"
    headers = {
        "X-API-Key": B_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "userId": user_id,
        "resumeText": resume_text
    }
    if structured_data:
        payload["structuredData"] = structured_data
    if file_id:
        payload["fileId"] = file_id

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError("/resumes", response.status_code)

        logger.info(f"用户{user_id}简历已同步到云端数据库")
        return response.json()
    except Exception as e:
        logger.error(f"保存简历失败：{e}")
        raise

def get_resume_from_cloud(user_id: str):
    """从云端数据库获取用户的简历信息"""
    url = f"{B_API_BASE_URL}/resumes/{user_id}"
    headers = {"X-API-Key": B_API_KEY}

    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code == 404:
            return None
        if response.status_code != 200:
            raise BApiCallError(f"/resumes/{user_id}", response.status_code)

        return response.json().get("data")
    except Exception as e:
        logger.error(f"获取简历失败：{e}")
        raise
