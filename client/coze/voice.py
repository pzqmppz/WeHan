"""
Coze 实时语音WebSocket封装：面试语音交互
"""
import asyncio
import websockets
from config.settings import (
    COZE_PAT, CONNECTOR_ID, VOICE_ID,
    AUDIO_FORMAT, AUDIO_SAMPLE_RATE, AUDIO_CHANNEL,
    VAD_SILENCE_THRESHOLD_MS
)
from core.logger import logger
from core.exceptions import AudioFormatError, TokenInvalidError

class CozeRealtimeVoice:
    def __init__(self, user_id: str, bot_id: str):
        self.user_id = user_id
        self.bot_id = bot_id
        self.ws_url = "wss://api.coze.cn/v1/realtime"
        self.headers = {"Authorization": f"Bearer {COZE_PAT}"}
        self.websocket = None
        # 音频配置（严格匹配，否则报错）
        self.audio_config = {
            "input_audio": {
                "format": AUDIO_FORMAT,
                "sample_rate": AUDIO_SAMPLE_RATE,
                "channel": AUDIO_CHANNEL
            },
            "output_audio": {
                "codec": AUDIO_FORMAT,
                "voice_id": VOICE_ID
            },
            "turn_detection": {
                "type": "semantic_vad",
                "semantic_vad_config": {
                    "silence_threshold_ms": VAD_SILENCE_THRESHOLD_MS
                }
            }
        }

    async def connect(self):
        """建立WebSocket连接"""
        try:
            self.websocket = await websockets.connect(
                self.ws_url,
                extra_headers=self.headers
            )
            # 发送初始化配置
            init_msg = {
                "type": "initialize",
                "data": {
                    "connector_id": CONNECTOR_ID,
                    "bot_id": self.bot_id,
                    "user_id": self.user_id,
                    "config": self.audio_config
                }
            }
            await self.websocket.send(str(init_msg).replace("'", '"'))
            logger.info("实时语音WebSocket连接成功")
            return True
        except websockets.exceptions.InvalidStatusCode as e:
            if e.status_code == 401:
                raise TokenInvalidError()
            logger.error(f"WebSocket连接失败：{e}")
            raise
        except Exception as e:
            logger.error(f"WebSocket连接异常：{e}")
            raise

    async def send_audio(self, audio_data: bytes):
        """
        发送音频数据（必须是PCM格式）
        :param audio_data: PCM音频字节数据
        """
        # 校验音频格式
        if not isinstance(audio_data, bytes):
            raise AudioFormatError("bytes", type(audio_data))

        try:
            await self.websocket.send({
                "type": "input_audio",
                "data": audio_data
            })
        except Exception as e:
            logger.error(f"发送音频失败：{e}")
            raise

    async def receive_audio(self):
        """接收语音响应（生成器）"""
        try:
            async for message in self.websocket:
                yield message
        except Exception as e:
            logger.error(f"接收音频失败：{e}")
            raise

    async def interrupt(self):
        """实现语音打断（用户中途说话）"""
        try:
            await self.websocket.send({
                "type": "interrupt"
            })
            logger.info("发送语音打断指令")
        except Exception as e:
            logger.error(f"语音打断失败：{e}")
            raise

    async def close(self):
        """关闭连接"""
        if self.websocket:
            await self.websocket.close()
            logger.info("实时语音WebSocket连接关闭")
