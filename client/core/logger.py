"""
日志配置：统一日志格式和输出
"""
import logging
import sys
from pathlib import Path

# 确保日志目录存在
log_file = Path("wehan_coze.log")

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler(log_file, encoding="utf-8"),
        logging.StreamHandler(sys.stdout)  # 同时输出到控制台
    ]
)

# 全局logger实例
logger = logging.getLogger("wehan_coze")
