/**
 * 会话状态管理
 * 管理会话列表、当前会话、持久化等
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Conversation } from '@/types/chat'

interface ConversationState {
  // 会话列表
  conversations: Conversation[]

  // 当前活跃会话 ID
  activeConversationId: string | null

  // 加载状态
  isLoading: boolean

  // Actions
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (
    id: string,
    updates: Partial<Conversation>
  ) => void
  removeConversation: (id: string) => void
  setActiveConversation: (id: string | null) => void
  clearConversations: () => void
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set) => ({
      conversations: [],
      activeConversationId: null,
      isLoading: false,

      // 设置会话列表
      setConversations: (conversations: Conversation[]) => {
        set({ conversations })
      },

      // 添加会话
      addConversation: (conversation: Conversation) => {
        set((state) => ({
          conversations: [conversation, ...state.conversations],
        }))
      },

      // 更新会话
      updateConversation: (id: string, updates: Partial<Conversation>) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, ...updates } : conv
          ),
        }))
      },

      // 删除会话
      removeConversation: (id: string) => {
        set((state) => ({
          conversations: state.conversations.filter(
            (conv) => conv.id !== id
          ),
          activeConversationId:
            state.activeConversationId === id
              ? null
              : state.activeConversationId,
        }))
      },

      // 设置活跃会话
      setActiveConversation: (id: string | null) => {
        set({ activeConversationId: id })
      },

      // 清空会话
      clearConversations: () => {
        set({
          conversations: [],
          activeConversationId: null,
        })
      },
    }),
    {
      name: 'wehan-conversations',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
)

// ==================== 选择器 ====================

/** 获取会话列表 */
export const selectConversations = (state: ConversationState) =>
  state.conversations

/** 获取活跃会话 */
export const selectActiveConversation = (state: ConversationState) => {
  if (!state.activeConversationId) return null
  return (
    state.conversations.find(
      (conv) => conv.id === state.activeConversationId
    ) || null
  )
}

/** 获取活跃会话 ID */
export const selectActiveConversationId = (state: ConversationState) =>
  state.activeConversationId

/** 获取加载状态 */
export const selectIsLoading = (state: ConversationState) => state.isLoading

/** 会话数量 */
export const selectConversationCount = (state: ConversationState) =>
  state.conversations.length

/** 创建新会话 */
export const createNewConversation = (
  id: string,
  title: string
): Conversation => ({
  id,
  userId: 'guest',
  title,
  status: 'active',
  messageCount: 0,
  lastMessageAt: Date.now(),
  createdAt: Date.now(),
})

/** 获取最近会话 (按最后消息时间排序) */
export function getRecentConversations(
  conversations: Conversation[],
  limit: number = 10
): Conversation[] {
  return [...conversations]
    .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
    .slice(0, limit)
}
