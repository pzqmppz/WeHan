/**
 * 聊天状态管理
 * 管理消息列表、输入状态、错误等
 * 使用 Zustand persist 持久化消息
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  ChatMessage,
  ChatError,
  PersistedChatState,
  PersistedConversationMeta,
} from '@/types/chat'

interface ChatState {
  // 消息列表
  messages: ChatMessage[]

  // 按会话 ID 分组的消息 (用于持久化)
  messagesByConversation: Record<string, ChatMessage[]>

  // 输入状态
  inputValue: string
  isTyping: boolean
  isLoading: boolean

  // 错误状态
  error: ChatError | null

  // 当前会话 ID (Coze 返回的会话 ID)
  conversationId: string | null

  // 会话标题 (内存中)
  conversationTitles: Record<string, string>

  // Actions - 基础
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

  // Actions - 持久化相关
  createNewConversation: (title?: string) => string
  switchConversation: (conversationId: string) => void
  updateConversationTitle: (title: string) => void
  getPersistedState: () => PersistedChatState | null
  restoreFromPersisted: (state: PersistedChatState | null) => void
  saveCurrentMessages: (localConversationId: string) => void
  loadMessagesForConversation: (localConversationId: string) => void

  // 辅助方法
  getLastUserMessage: () => ChatMessage | undefined
  getLastAssistantMessage: () => ChatMessage | undefined
}

/** 标题截断长度 */
const TITLE_MAX_LENGTH = 30

/** 生成会话标题 */
function generateTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().slice(0, TITLE_MAX_LENGTH)
  return cleaned.length < firstMessage.length ? `${cleaned}...` : cleaned
}

export const useChatStore = create<ChatState>((set, get) => ({
  // 初始状态
  messages: [],
  messagesByConversation: {},
  inputValue: '',
  isTyping: false,
  isLoading: false,
  error: null,
  conversationId: null,
  conversationTitles: {},

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

  // 创建新会话
  createNewConversation: (title?: string) => {
    const id = uuidv4()
    set({
      conversationId: id,
      messages: [],
      conversationTitles: {
        ...get().conversationTitles,
        [id]: title || '新对话',
      },
    })
    return id
  },

  // 切换会话
  switchConversation: (conversationId) => {
    // 在实际使用中，消息会从持久化层加载
    // 这里只设置 ID，消息加载由外部处理
    set({
      conversationId,
      messages: [],
    })
  },

  // 更新会话标题
  updateConversationTitle: (title) => {
    const { conversationId, conversationTitles } = get()
    if (conversationId) {
      set({
        conversationTitles: {
          ...conversationTitles,
          [conversationId]: title,
        },
      })
    }
  },

  // 获取可持久化的状态
  getPersistedState: (): PersistedChatState | null => {
    const { messages, conversationId, conversationTitles } = get()

    if (!conversationId) return null

    // 生成会话元数据
    const title = conversationTitles[conversationId] ||
      (messages.length > 0 ? generateTitle(messages[0].content) : '新对话')

    const meta: PersistedConversationMeta = {
      id: conversationId,
      title,
      lastMessageAt: messages.length > 0 ? messages[messages.length - 1].timestamp : Date.now(),
      messageCount: messages.length,
      createdAt: messages.length > 0 ? messages[0].timestamp : Date.now(),
    }

    return {
      activeConversationId: conversationId,
      conversations: [meta],
      messagesByConversation: {
        [conversationId]: messages,
      },
      savedAt: Date.now(),
      version: 1,
    }
  },

  // 从持久化状态恢复
  restoreFromPersisted: (state) => {
    if (!state) {
      set({
        conversationId: null,
        messages: [],
      })
      return
    }

    const { activeConversationId, messagesByConversation, conversations } = state

    // 恢复会话标题
    const titles: Record<string, string> = {}
    for (const conv of conversations) {
      titles[conv.id] = conv.title
    }

    set({
      conversationId: activeConversationId,
      messages: activeConversationId ? (messagesByConversation[activeConversationId] || []) : [],
      conversationTitles: titles,
      messagesByConversation,
    })
  },

  // 保存当前消息到指定会话
  saveCurrentMessages: (localConversationId: string) => {
    const { messages } = get()
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [localConversationId]: messages,
      },
    }))
  },

  // 加载指定会话的消息
  loadMessagesForConversation: (localConversationId: string) => {
    const stored = get().messagesByConversation[localConversationId]
    set({
      messages: stored || [],
      conversationId: null, // Coze conversationId 在首次消息后设置
    })
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
