"""
Coze 文件上传API封装：简历上传解析
"""
import requests
from config.settings import COZE_PAT, COZE_API_TIMEOUT
from core.retry import retry
from core.logger import logger
from core.exceptions import TokenInvalidError, RateLimitError

class CozeFile:
    def __init__(self):
        self.headers = {"Authorization": f"Bearer {COZE_PAT}"}
        self.upload_url = "https://api.coze.cn/v1/files/upload"

    @retry(max_retries=3, delay=1)
    def upload_resume(self, file_path: str, file_type: str = "pdf"):
        """
        上传简历文件
        :param file_path: 本地文件路径
        :param file_type: 文件类型（pdf/word/image）
        :return: 文件ID（用于后续解析）
        """
        allowed_types = ["pdf", "docx", "jpg", "png"]
        if file_type not in allowed_types:
            raise ValueError(f"不支持的文件类型：{file_type}，仅支持{allowed_types}")

        try:
            with open(file_path, "rb") as f:
                files = {"file": (f"resume.{file_type}", f)}
                response = requests.post(
                    self.upload_url,
                    headers=self.headers,
                    files=files,
                    timeout=COZE_API_TIMEOUT
                )

            if response.status_code == 401:
                raise TokenInvalidError()
            if response.status_code == 429:
                raise RateLimitError()
            if response.status_code != 200:
                raise Exception(f"文件上传失败：{response.text}")

            result = response.json()
            logger.info(f"简历上传成功，文件ID：{result.get('file_id')}")
            return result.get("file_id")

        except FileNotFoundError:
            logger.error(f"文件不存在：{file_path}")
            raise
        except requests.exceptions.RequestException as e:
            logger.error(f"上传简历失败：{e}")
            raise
