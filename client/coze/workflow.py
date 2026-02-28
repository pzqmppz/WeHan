"""
Coze 工作流API封装：面试模拟核心流程
"""
import requests
from config.settings import COZE_PAT, COZE_WORKFLOW_TIMEOUT
from core.retry import retry
from core.logger import logger
from core.exceptions import (
    TokenInvalidError, WorkflowNotPublishedError,
    ParameterError, RateLimitError
)

class CozeWorkflow:
    def __init__(self):
        self.headers = {
            "Authorization": f"Bearer {COZE_PAT}",
            "Content-Type": "application/json"
        }
        self.run_url = "https://api.coze.cn/v1/workflow/run"
        self.status_url = "https://api.coze.cn/v1/workflow/run/status"

    @retry(max_retries=3, delay=1, exceptions=(requests.exceptions.RequestException,))
    def run_interview_workflow(self, job_id: str, user_id: str, workflow_id: str, resume_text: str = None):
        """
        执行面试模拟工作流
        :param job_id: 岗位ID
        :param user_id: 用户ID
        :param workflow_id: 工作流ID
        :param resume_text: 用户简历（可选）
        :return: 工作流执行结果
        """
        # 参数校验（必填+类型）
        if not isinstance(job_id, str) or not isinstance(user_id, str):
            raise ParameterError("job_id/user_id（必须为字符串）")
        if not job_id or not user_id:
            raise ParameterError("job_id/user_id（不能为空）")

        payload = {
            "workflow_id": workflow_id,
            "parameters": {
                "job_id": job_id,
                "user_id": user_id,
                "resume_text": resume_text or ""  # 注入用户简历
            },
            "is_async": False  # 同步执行
        }

        try:
            response = requests.post(
                self.run_url,
                json=payload,
                headers=self.headers,
                timeout=COZE_WORKFLOW_TIMEOUT
            )

            # 状态码&错误码校验
            if response.status_code == 401:
                raise TokenInvalidError()
            if response.status_code == 429:
                raise RateLimitError()

            result = response.json()
            # Coze自定义错误码校验
            if result.get("code") == 4200:
                raise WorkflowNotPublishedError(workflow_id)
            if result.get("code") != 0:
                raise Exception(f"工作流执行失败：{result.get('msg')}")

            logger.info(f"工作流{workflow_id}执行成功，用户{user_id}，岗位{job_id}")
            return result

        except requests.exceptions.RequestException as e:
            logger.error(f"执行工作流失败：{str(e)}")
            raise

    @retry(max_retries=3, delay=1)
    def get_workflow_status(self, run_id: str):
        """
        查询工作流执行状态（异步执行时用）
        :param run_id: 工作流运行ID
        :return: 状态结果
        """
        if not run_id:
            raise ParameterError("run_id")

        params = {"run_id": run_id}
        response = requests.get(
            self.status_url,
            params=params,
            headers=self.headers,
            timeout=COZE_API_TIMEOUT
        )

        if response.status_code == 401:
            raise TokenInvalidError()
        return response.json()
