"""
Coze Chat v3 API封装：智能体对话能力
"""
import requests
from config.settings import COZE_PAT, COZE_API_TIMEOUT
from core.retry import retry
from core.logger import logger
from core.exceptions import TokenInvalidError, ParameterError, RateLimitError

class CozeAgent:
    def __init__(self, bot_id: str = None):
        self.bot_id = bot_id
        self.headers = {
            "Authorization": f"Bearer {COZE_PAT}",
            "Content-Type": "application/json"
        }
        self.base_url = "https://api.coze.cn/v3/chat"

    @retry(max_retries=3, delay=1, exceptions=(requests.exceptions.RequestException,))
    def send_message(self, user_id: str, content: str, stream: bool = True):
        """
        发送消息给智能体
        :param user_id: 用户唯一标识
        :param content: 消息内容
        :param stream: 是否流式返回
        :return: 响应结果（流式返回生成器，非流式返回字典）
        """
        # 参数校验（必填）
        if not user_id or not content:
            raise ParameterError("user_id/content")

        if not self.bot_id:
            raise ParameterError("bot_id")

        payload = {
            "bot_id": self.bot_id,
            "user_id": user_id,
            "stream": stream,
            "auto_save_history": True,
            "additional_messages": [
                {
                    "role": "user",
                    "content": content,
                    "content_type": "text"
                }
            ]
        }

        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers=self.headers,
                timeout=COZE_API_TIMEOUT,
                stream=stream
            )

            # 状态码校验
            if response.status_code == 401:
                raise TokenInvalidError()
            if response.status_code == 429:
                raise RateLimitError()
            if response.status_code != 200:
                raise Exception(f"API调用失败：{response.status_code} - {response.text}")

            # 处理流式/非流式响应
            if stream:
                return self._parse_stream_response(response)
            else:
                return response.json()

        except requests.exceptions.RequestException as e:
            logger.error(f"请求Coze Chat API失败：{str(e)}")
            raise

    def _parse_stream_response(self, response):
        """
        解析流式响应（关键：避免丢包）
        :param response: 流式响应对象
        :return: 生成器，逐行返回解析后的数据
        """
        for line in response.iter_lines():
            if line:
                line = line.decode("utf-8")
                # 按Coze SSE格式解析：event: xxx\ndata: xxx
                if line.startswith("event:"):
                    event = line.split(":", 1)[1].strip()
                elif line.startswith("data:"):
                    data = line.split(":", 1)[1].strip()
                    if data != "[DONE]":
                        yield {"event": event, "data": data}
        logger.info("流式响应解析完成")

    @retry(max_retries=3, delay=1)
    def resume_conversation(self, user_id: str, conversation_id: str):
        """
        恢复历史会话：调取历史数据，注入新会话生成上下文
        """
        from api.conversations import get_conversation_detail
        import json

        # 1. 从数据库调取会话详情
        session_data = get_conversation_detail(user_id, conversation_id)
        if not session_data:
            raise Exception(f"会话{conversation_id}不存在")

        # 2. 提取历史消息和工作流状态
        history_messages = session_data.get("messages", [])
        workflow_status = session_data.get("workflow_status", {})

        # 3. 构造"恢复会话"的Prompt（注入历史上下文）
        resume_prompt = f"""
请恢复用户的历史会话，继续之前未完成的操作：
1. 历史对话记录：{json.dumps(history_messages, ensure_ascii=False)}
2. 面试工作流状态：{json.dumps(workflow_status, ensure_ascii=False)}
3. 要求：
   - 衔接历史上下文，不要重复提问/重复回答
   - 如果面试流程中断，从断连的节点继续（如：继续提问未回答的题目）
   - 告知用户："已为你恢复之前的面试会话，我们继续～"
        """

        # 4. 发送恢复指令（生成新的conversation_id，但上下文是历史的）
        new_conversation_response = self.send_message(user_id, resume_prompt, stream=False)

        return new_conversation_response
