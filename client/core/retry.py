"""
重试装饰器：处理网络波动、限流等临时错误
"""
import time
import functools
from core.logger import logger

def retry(max_retries=3, delay=1, exceptions=(Exception,)):
    """
    重试装饰器
    :param max_retries: 最大重试次数
    :param delay: 初始延迟（秒）
    :param exceptions: 需要重试的异常类型
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            retries = 0
            current_delay = delay
            while retries < max_retries:
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    retries += 1
                    if retries >= max_retries:
                        logger.error(f"重试{max_retries}次后仍失败：{str(e)}")
                        raise
                    logger.warning(f"执行失败，{current_delay}秒后重试（第{retries}次）：{str(e)}")
                    time.sleep(current_delay)
                    current_delay *= 2  # 指数退避
            return None
        return wrapper
    return decorator
