/**
 * 聊天状态管理
 * 管理消息列表、输入状态、错误等
 */

import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { ChatMessage, MessageStatus, ChatError, ChatErrorCode } from '@/types/chat'

interface ChatState {
  // 消息列表
  messages: ChatMessage[]

  // 输入状态
  inputValue: string
  isTyping: boolean
  isLoading: boolean

  // 错误状态
  error: ChatError | null

  // 当前会话 ID
  conversationId: string | null

  // Actions
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void
  updateLastMessage: (updates: Partial<ChatMessage>) => void
  setMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void

  setInputValue: (value: string) => void
  setTyping: (isTyping: boolean) => void
  setLoading: (isLoading: boolean) => void

  setError: (error: ChatError | null) => void
  clearError: () => void

  setConversationId: (id: string | null) => void

  // 辅助方法
  getLastUserMessage: () => ChatMessage | undefined
  getLastAssistantMessage: () => ChatMessage | undefined
}

export const useChatStore = create<ChatState>((set, get) => ({
  // 初始状态
  messages: [],
  inputValue: '',
  isTyping: false,
  isLoading: false,
  error: null,
  conversationId: null,

  // 添加消息
  addMessage: (message) => {
    const id = uuidv4()
    const newMessage: ChatMessage = {
      ...message,
      id,
      timestamp: Date.now(),
      status: message.status || 'completed',
    }

    set((state) => ({
      messages: [...state.messages, newMessage],
    }))

    return id
  },

  // 更新指定消息
  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }))
  },

  // 更新最后一条消息
  updateLastMessage: (updates) => {
    set((state) => {
      const messages = [...state.messages]
      if (messages.length > 0) {
        messages[messages.length - 1] = {
          ...messages[messages.length - 1],
          ...updates,
        }
      }
      return { messages }
    })
  },

  // 设置消息列表
  setMessages: (messages) => {
    set({ messages })
  },

  // 清空消息
  clearMessages: () => {
    set({ messages: [], conversationId: null })
  },

  // 输入值
  setInputValue: (value) => {
    set({ inputValue: value })
  },

  // 设置输入状态
  setTyping: (isTyping) => {
    set({ isTyping })
  },

  // 设置加载状态
  setLoading: (isLoading) => {
    set({ isLoading })
  },

  // 设置错误
  setError: (error) => {
    set({ error, isLoading: false, isTyping: false })
  },

  // 清除错误
  clearError: () => {
    set({ error: null })
  },

  // 设置会话 ID
  setConversationId: (id) => {
    set({ conversationId: id })
  },

  // 获取最后一条用户消息
  getLastUserMessage: () => {
    const messages = get().messages
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'user') {
        return messages[i]
      }
    }
    return undefined
  },

  // 获取最后一条助手消息
  getLastAssistantMessage: () => {
    const messages = get().messages
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        return messages[i]
      }
    }
    return undefined
  },
}))

// ==================== 选择器 ====================

/** 获取消息列表 */
export const selectMessages = (state: ChatState) => state.messages

/** 获取输入状态 */
export const selectIsTyping = (state: ChatState) => state.isTyping

/** 获取加载状态 */
export const selectIsLoading = (state: ChatState) => state.isLoading

/** 获取错误状态 */
export const selectError = (state: ChatState) => state.error

/** 获取会话 ID */
export const selectConversationId = (state: ChatState) => state.conversationId

/** 是否有消息 */
export const selectHasMessages = (state: ChatState) => state.messages.length > 0

/** 消息数量 */
export const selectMessageCount = (state: ChatState) => state.messages.length
