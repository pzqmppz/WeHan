/**
 * 会话持久化 Hook
 * 提供会话数据的 localStorage 持久化能力
 *
 * 特性:
 * - 防抖保存 (默认 500ms)
 * - 数据版本控制 (支持迁移)
 * - 消息数量限制
 * - 错误处理 (QuotaExceededError)
 */

import { useCallback, useRef } from 'react'
import type {
  ChatMessage,
  PersistedChatState,
  PersistedConversationMeta,
  PersistenceError,
} from '@/types/chat'

/** 默认配置 */
const DEFAULT_CONFIG = {
  storageKey: 'wehan_chat_state',
  version: 1,
  maxConversations: 20,
  maxMessagesPerConversation: 100,
  debounceMs: 500,
}

export interface UseConversationPersistenceOptions {
  storageKey?: string
  version?: number
  maxConversations?: number
  maxMessagesPerConversation?: number
  debounceMs?: number
  onError?: (error: PersistenceError) => void
}

export interface UseConversationPersistenceReturn {
  saveState: (state: PersistedChatState) => void
  loadState: () => PersistedChatState | null
  clearState: () => void
  getConversationTitles: () => Array<{ id: string; title: string }>
  getMessages: (conversationId: string) => ChatMessage[]
}

export function useConversationPersistence(
  options: UseConversationPersistenceOptions = {}
): UseConversationPersistenceReturn {
  const config = {
    ...DEFAULT_CONFIG,
    ...options,
  }

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingStateRef = useRef<PersistedChatState | null>(null)

  /**
   * 处理错误
   */
  const handleError = useCallback(
    (type: PersistenceError['type'], message: string, originalError?: unknown) => {
      const error: PersistenceError = {
        type,
        message,
        originalError,
      }
      console.error(`[Persistence] ${message}`, originalError)
      options.onError?.(error)
    },
    [options]
  )

  /**
   * 限制消息数量
   */
  const trimMessages = useCallback(
    (messages: ChatMessage[]): ChatMessage[] => {
      if (messages.length <= config.maxMessagesPerConversation) {
        return messages
      }
      // 保留最新的消息
      return messages.slice(-config.maxMessagesPerConversation)
    },
    [config.maxMessagesPerConversation]
  )

  /**
   * 限制会话数量
   */
  const trimConversations = useCallback(
    (conversations: PersistedConversationMeta[]): PersistedConversationMeta[] => {
      if (conversations.length <= config.maxConversations) {
        return conversations
      }
      // 按最后消息时间排序，保留最新的
      const sorted = [...conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      return sorted.slice(0, config.maxConversations)
    },
    [config.maxConversations]
  )

  /**
   * 实际保存到 localStorage
   */
  const performSave = useCallback(() => {
    if (!pendingStateRef.current) return

    try {
      // 限制数据大小
      const trimmedState: PersistedChatState = {
        ...pendingStateRef.current,
        conversations: trimConversations(pendingStateRef.current.conversations),
        messagesByConversation: Object.fromEntries(
          Object.entries(pendingStateRef.current.messagesByConversation).map(([id, msgs]) => [
            id,
            trimMessages(msgs),
          ])
        ),
        savedAt: Date.now(),
        version: config.version,
      }

      localStorage.setItem(config.storageKey, JSON.stringify(trimmedState))
    } catch (err) {
      if (err instanceof Error && err.name === 'QuotaExceededError') {
        handleError('quota_exceeded', 'Storage quota exceeded', err)
      } else {
        handleError('unknown', 'Failed to save state', err)
      }
    }
  }, [config.storageKey, config.version, trimConversations, trimMessages, handleError])

  /**
   * 保存状态 (带防抖)
   */
  const saveState = useCallback(
    (state: PersistedChatState) => {
      pendingStateRef.current = state

      // 清除之前的定时器
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      // 设置新的防抖定时器
      saveTimeoutRef.current = setTimeout(() => {
        performSave()
        saveTimeoutRef.current = null
      }, config.debounceMs)
    },
    [config.debounceMs, performSave]
  )

  /**
   * 加载状态
   */
  const loadState = useCallback((): PersistedChatState | null => {
    try {
      const stored = localStorage.getItem(config.storageKey)
      if (!stored) return null

      const state = JSON.parse(stored) as PersistedChatState

      // 版本检查
      if (state.version !== config.version) {
        console.warn(
          `[Persistence] Version mismatch: stored=${state.version}, current=${config.version}. Clearing state.`
        )
        localStorage.removeItem(config.storageKey)
        return null
      }

      return state
    } catch (err) {
      handleError('parse_error', 'Failed to parse stored state', err)
      return null
    }
  }, [config.storageKey, config.version, handleError])

  /**
   * 清除状态
   */
  const clearState = useCallback(() => {
    localStorage.removeItem(config.storageKey)
  }, [config.storageKey])

  /**
   * 获取会话标题列表 (按最后消息时间排序)
   */
  const getConversationTitles = useCallback((): Array<{ id: string; title: string }> => {
    const state = loadState()
    if (!state) return []

    return [...state.conversations]
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
      .map((conv) => ({ id: conv.id, title: conv.title }))
  }, [loadState])

  /**
   * 获取指定会话的消息
   */
  const getMessages = useCallback(
    (conversationId: string): ChatMessage[] => {
      const state = loadState()
      if (!state) return []

      return state.messagesByConversation[conversationId] || []
    },
    [loadState]
  )

  return {
    saveState,
    loadState,
    clearState,
    getConversationTitles,
    getMessages,
  }
}

export default useConversationPersistence
