"""
C 端配置文件：所有敏感信息/固定参数都在这里配置
你只需替换占位符为真实值，其他无需修改
"""

import os
from dotenv import load_dotenv

# 获取项目根目录 (client/)
PROJECT_ROOT = os.path.dirname(os.path.dirname(__file__))

# 加载环境变量
load_dotenv(os.path.join(PROJECT_ROOT, '.env'))

# ===================== Coze 基础配置 =====================
# 个人访问令牌（PAT）- 从扣子平台获取
COZE_PAT = os.getenv("COZE_PAT", "pat_xxxxxxxxxxxxxxxx")

# 空间 ID - 从扣子空间 URL 中获取（w=xxx）
SPACE_ID = os.getenv("SPACE_ID", "your_space_id_here")

# 智能体ID（创建后自动生成，首次可留空）
BOT_ID = os.getenv("BOT_ID", "")  # WeHan 求职助手（单Bot）

# 工作流ID（创建后自动生成，首次可留空）
WORKFLOW_ID_INTERVIEW = os.getenv("WORKFLOW_ID_INTERVIEW", "")  # 面试模拟工作流

# 知识库ID（创建后自动生成，首次可留空）
KNOWLEDGE_ID = os.getenv("KNOWLEDGE_ID", "")  # 岗位知识库

# 实时语音配置
CONNECTOR_ID = os.getenv("CONNECTOR_ID", "1024")
VOICE_ID = os.getenv("VOICE_ID", "7426720361733046281")  # 精品音色
AUDIO_FORMAT = os.getenv("AUDIO_FORMAT", "pcm")
AUDIO_SAMPLE_RATE = int(os.getenv("AUDIO_SAMPLE_RATE", "24000"))
AUDIO_CHANNEL = int(os.getenv("AUDIO_CHANNEL", "1"))
VAD_SILENCE_THRESHOLD_MS = int(os.getenv("VAD_SILENCE_THRESHOLD_MS", "300"))

# ===================== B端API配置 =====================
B_API_BASE_URL = os.getenv("B_API_BASE_URL", "http://localhost:3000/api/open")
B_API_KEY = os.getenv("OPEN_API_KEY", "your_api_key_here")
B_API_TIMEOUT = int(os.getenv("B_API_TIMEOUT", "30"))

# ===================== 通用配置 =====================
MAX_RETRY_TIMES = int(os.getenv("MAX_RETRY_TIMES", "3"))
RETRY_DELAY = int(os.getenv("RETRY_DELAY", "1"))
COZE_API_TIMEOUT = int(os.getenv("COZE_API_TIMEOUT", "30"))
COZE_WORKFLOW_TIMEOUT = int(os.getenv("COZE_WORKFLOW_TIMEOUT", "120"))
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = os.getenv("LOG_FILE", "wehan_coze.log")
