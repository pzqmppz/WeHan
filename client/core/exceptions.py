"""
自定义异常类：统一异常类型，便于捕获和处理
"""

class BaseCozeError(Exception):
    """所有Coze相关异常的基类"""
    pass

class TokenInvalidError(BaseCozeError):
    """Token无效/过期"""
    def __init__(self, msg="PAT/Access Token无效或已过期"):
        super().__init__(msg)

class WorkflowNotPublishedError(BaseCozeError):
    """工作流未发布"""
    def __init__(self, workflow_id):
        super().__init__(f"工作流{workflow_id}未发布，无法调用")

class ParameterError(BaseCozeError):
    """参数错误"""
    def __init__(self, param_name):
        super().__init__(f"参数{param_name}格式/类型错误或缺失")

class RateLimitError(BaseCozeError):
    """API限流"""
    def __init__(self):
        super().__init__("API调用频率超限，请稍后重试")

class AudioFormatError(BaseCozeError):
    """音频格式错误"""
    def __init__(self, expected, actual):
        super().__init__(f"音频格式错误，期望{expected}，实际{actual}")

class BApiCallError(BaseCozeError):
    """B端API调用失败"""
    def __init__(self, api_path, status_code):
        super().__init__(f"B端API调用失败：{api_path}，状态码{status_code}")

class KnowledgeBaseSegmentError(BaseCozeError):
    """知识库分段错误"""
    def __init__(self, msg="知识库分段大小不合理（建议500-1000字/段）"):
        super().__init__(msg)
