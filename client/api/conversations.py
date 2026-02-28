"""
B端会话管理API对接
"""
import requests
from config.settings import B_API_BASE_URL, B_API_KEY, B_API_TIMEOUT
from core.logger import logger
from core.exceptions import BApiCallError
from datetime import datetime

def save_conversation(user_id: str, conversation_id: str, title: str, status: str, session_data: dict):
    """
    存储会话数据到云端数据库（实时存储，用户每发一条消息就更新）
    """
    url = f"{B_API_BASE_URL}/conversations"
    headers = {
        "X-API-Key": B_API_KEY,
        "Content-Type": "application/json"
    }

    save_data = {
        "userId": user_id,
        "conversationId": conversation_id,
        "title": title,
        "status": status,  # active/finished/interrupted
        "sessionData": session_data
    }

    try:
        response = requests.post(url, json=save_data, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError("/conversations", response.status_code)

        logger.info(f"用户{user_id}会话{conversation_id}已存储")
        return response.json()
    except Exception as e:
        logger.error(f"保存会话失败：{e}")
        raise

def update_conversation(user_id: str, conversation_id: str, title: str = None, status: str = None, session_data: dict = None):
    """更新会话数据"""
    # 先获取数据库会话ID
    conv_list = get_user_conversations(user_id)
    db_conv_id = None

    for conv in conv_list:
        if conv.get("conversationId") == conversation_id:
            db_conv_id = conv.get("id")
            break

    if not db_conv_id:
        raise Exception(f"会话{conversation_id}不存在")

    url = f"{B_API_BASE_URL}/conversations/{db_conv_id}"
    headers = {
        "X-API-Key": B_API_KEY,
        "Content-Type": "application/json"
    }

    update_data = {}
    if title is not None:
        update_data["title"] = title
    if status is not None:
        update_data["status"] = status
    if session_data is not None:
        update_data["sessionData"] = session_data

    try:
        response = requests.put(url, json=update_data, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError(f"/conversations/{db_conv_id}", response.status_code)

        logger.info(f"会话{conversation_id}更新成功")
        return response.json()
    except Exception as e:
        logger.error(f"更新会话失败：{e}")
        raise

def get_user_conversations(user_id: str):
    """
    获取用户的所有历史会话（供用户选择恢复）
    """
    url = f"{B_API_BASE_URL}/conversations/user/{user_id}"
    headers = {"X-API-Key": B_API_KEY}

    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code != 200:
            raise BApiCallError(f"/conversations/user/{user_id}", response.status_code)

        return response.json().get("data", [])
    except Exception as e:
        logger.error(f"获取用户会话列表失败：{e}")
        raise

def get_conversation_detail(user_id: str, conversation_id: str):
    """
    获取单个会话的完整数据（恢复会话用）
    """
    conv_list = get_user_conversations(user_id)
    db_conv_id = None

    for conv in conv_list:
        if conv.get("conversationId") == conversation_id:
            db_conv_id = conv.get("id")
            break

    if not db_conv_id:
        return None

    url = f"{B_API_BASE_URL}/conversations/{db_conv_id}?userId={user_id}"
    headers = {"X-API-Key": B_API_KEY}

    try:
        response = requests.get(url, headers=headers, timeout=B_API_TIMEOUT)
        if response.status_code == 404:
            return None
        if response.status_code != 200:
            raise BApiCallError(f"/conversations/{db_conv_id}", response.status_code)

        return response.json().get("data", {}).get("sessionData")
    except Exception as e:
        logger.error(f"获取会话详情失败：{e}")
        raise
