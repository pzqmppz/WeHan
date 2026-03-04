/**
 * 会话列表组件 - 现代化设计
 * 显示历史会话，支持切换、新建、删除
 */

'use client'

import { useCallback, useMemo } from 'react'
import { Button, Empty, Tooltip, Popconfirm } from 'antd'
import {
  PlusOutlined,
  DeleteOutlined,
  MessageOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { Conversations, ConversationsProps } from '@ant-design/x'
import {
  useConversationStore,
  selectConversations,
  selectActiveConversationId,
  getRecentConversations,
} from '@/stores/conversationStore'
import { useChatStore } from '@/stores/chatStore'

interface ConversationListProps {
  className?: string
  collapsed?: boolean
  onConversationSelect?: (id: string) => void
  onNewConversation?: () => void
}

export function ConversationList({
  className,
  collapsed = false,
  onConversationSelect,
  onNewConversation,
}: ConversationListProps) {
  // Store 状态
  const conversations = useConversationStore(selectConversations)
  const activeId = useConversationStore(selectActiveConversationId)
  const setActiveConversation = useConversationStore((s) => s.setActiveConversation)
  const removeConversation = useConversationStore((s) => s.removeConversation)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const setConversationId = useChatStore((s) => s.setConversationId)

  // 按最近消息时间排序
  const sortedConversations = useMemo(
    () => getRecentConversations(conversations, 20),
    [conversations]
  )

  // 切换会话
  const handleSelect = useCallback(
    (id: string) => {
      setActiveConversation(id)
      // 加载对应会话的消息（从 chatStore 的持久化数据中）
      const persistedMessages = useChatStore.getState().messagesByConversation?.[id]
      if (persistedMessages) {
        useChatStore.setState({ messages: persistedMessages, conversationId: null })
      } else {
        clearMessages()
        setConversationId(null)
      }
      onConversationSelect?.(id)
    },
    [setActiveConversation, clearMessages, setConversationId, onConversationSelect]
  )

  // 新建会话
  const handleNew = useCallback(() => {
    setActiveConversation(null)
    clearMessages()
    setConversationId(null)
    onNewConversation?.()
  }, [setActiveConversation, clearMessages, setConversationId, onNewConversation])

  // 删除会话
  const handleDelete = useCallback(
    (id: string) => {
      removeConversation(id)
      // 如果删除的是当前会话，清空消息
      if (id === activeId) {
        clearMessages()
        setConversationId(null)
      }
    },
    [removeConversation, activeId, clearMessages, setConversationId]
  )

  // 转换为 Ant Design X Conversations 组件格式
  const items: ConversationsProps['items'] = sortedConversations.map((conv) => ({
    key: conv.id,
    label: conv.title || '新对话',
    timestamp: conv.lastMessageAt,
  }))

  // 时间格式化
  const formatTime = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`

    const date = new Date(timestamp)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // 折叠模式
  if (collapsed) {
    return (
      <div className={`flex flex-col items-center py-4 gap-3 ${className || ''}`}>
        <Tooltip title="新建对话" placement="right">
          <button
            onClick={handleNew}
            className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            <PlusOutlined />
          </button>
        </Tooltip>
        <div className="w-8 h-px bg-[var(--border)] my-2" />
        {sortedConversations.slice(0, 5).map((conv) => (
          <Tooltip key={conv.id} title={conv.title} placement="right">
            <button
              onClick={() => handleSelect(conv.id)}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                conv.id === activeId
                  ? 'gradient-primary text-white'
                  : 'bg-[var(--background)] text-[var(--text-secondary)] hover:bg-[var(--border)]'
              }`}
            >
              <MessageOutlined />
            </button>
          </Tooltip>
        ))}
      </div>
    )
  }

  // 完整模式
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* 新建按钮 */}
      <div className="p-4">
        <button
          onClick={handleNew}
          className="w-full h-12 rounded-xl gradient-primary text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
        >
          <PlusOutlined />
          <span>新建对话</span>
        </button>
      </div>

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto px-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12">
            <div className="w-16 h-16 rounded-full bg-[var(--background)] flex items-center justify-center mb-4">
              <MessageOutlined className="text-2xl text-[var(--text-muted)]" />
            </div>
            <p className="text-sm text-[var(--text-muted)]">暂无对话记录</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">开始你的第一次对话吧</p>
          </div>
        ) : (
          <div className="space-y-1">
            {sortedConversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelect(conv.id)}
                className={`group p-3 rounded-xl cursor-pointer transition-all ${
                  conv.id === activeId
                    ? 'bg-[var(--primary)] bg-opacity-10'
                    : 'hover:bg-[var(--background)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      conv.id === activeId ? 'text-[var(--primary)]' : 'text-[var(--text-primary)]'
                    }`}>
                      {conv.title || '新对话'}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <ClockCircleOutlined className="text-xs text-[var(--text-muted)]" />
                      <span className="text-xs text-[var(--text-muted)]">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                  </div>
                  <Popconfirm
                    title="确定删除此对话？"
                    onConfirm={() => handleDelete(conv.id)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <DeleteOutlined />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div className="p-3 border-t border-[var(--border)]">
        <p className="text-xs text-center text-[var(--text-muted)]">
          共 {conversations.length} 个对话
        </p>
      </div>
    </div>
  )
}

export default ConversationList
