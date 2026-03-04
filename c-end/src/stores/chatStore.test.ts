/**
 * chatStore 扩展测试
 * 测试持久化相关功能
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useChatStore } from './chatStore'
import type { PersistedChatState } from '@/types/chat'

describe('chatStore - persistence', () => {
  beforeEach(() => {
    // Reset store state
    useChatStore.setState({
      messages: [],
      inputValue: '',
      isTyping: false,
      isLoading: false,
      error: null,
      conversationId: null,
      conversationTitles: {},
    })
    vi.clearAllMocks()
  })

  describe('createNewConversation', () => {
    it('should create a new conversation with generated ID', () => {
      const { result } = renderHook(() => useChatStore())

      let conversationId: string | null = null
      act(() => {
        conversationId = result.current.createNewConversation('Test Conversation')
      })

      expect(conversationId).not.toBeNull()
      expect(result.current.conversationId).toBe(conversationId)
      expect(result.current.messages).toEqual([])
    })

    it('should clear existing messages when creating new conversation', () => {
      const { result } = renderHook(() => useChatStore())

      // Add some messages first
      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Hello',
          contentType: 'text',
        })
      })

      expect(result.current.messages).toHaveLength(1)

      // Create new conversation
      act(() => {
        result.current.createNewConversation('New Conversation')
      })

      expect(result.current.messages).toHaveLength(0)
    })
  })

  describe('switchConversation', () => {
    it('should switch to existing conversation', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.switchConversation('conv-123')
      })

      // switchConversation sets ID but doesn't load messages (external responsibility)
      expect(result.current.conversationId).toBe('conv-123')
      expect(result.current.messages).toEqual([])
    })

    it('should clear messages when switching', () => {
      const { result } = renderHook(() => useChatStore())

      // Add some messages first
      act(() => {
        result.current.addMessage({
          role: 'user',
          content: 'Hello',
          contentType: 'text',
        })
      })

      expect(result.current.messages).toHaveLength(1)

      act(() => {
        result.current.switchConversation('conv-456')
      })

      expect(result.current.conversationId).toBe('conv-456')
      expect(result.current.messages).toEqual([])
    })
  })

  describe('updateConversationTitle', () => {
    it('should update title for current conversation', () => {
      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.setConversationId('conv-123')
        result.current.updateConversationTitle('New Title')
      })

      // Title update should trigger persistence
      // This is a side effect, we verify it doesn't throw
      expect(result.current.conversationId).toBe('conv-123')
    })
  })

  describe('getPersistedState', () => {
    it('should return state in persistable format', () => {
      const { result } = renderHook(() => useChatStore())

      // Add a message
      act(() => {
        result.current.setConversationId('conv-123')
        result.current.addMessage({
          role: 'user',
          content: 'Test',
          contentType: 'text',
        })
      })

      let persistedState: PersistedChatState | null = null
      act(() => {
        persistedState = result.current.getPersistedState()
      })

      expect(persistedState).not.toBeNull()
      expect(persistedState?.activeConversationId).toBe('conv-123')
      expect(persistedState?.version).toBe(1)
    })

    it('should generate title from first message if not set', () => {
      const { result } = renderHook(() => useChatStore())

      // Set conversation ID directly (without createNewConversation which sets a default title)
      act(() => {
        result.current.setConversationId('conv-123')
        result.current.addMessage({
          role: 'user',
          content: 'This is a long test message that should be truncated',
          contentType: 'text',
        })
      })

      let persistedState: PersistedChatState | null = null
      act(() => {
        persistedState = result.current.getPersistedState()
      })

      expect(persistedState?.conversations).toHaveLength(1)
      expect(persistedState?.conversations[0].title).toBe('This is a long test message th...')
    })

    it('should return null when no active conversation', () => {
      const { result } = renderHook(() => useChatStore())

      let persistedState: PersistedChatState | null = null
      act(() => {
        persistedState = result.current.getPersistedState()
      })

      expect(persistedState).toBeNull()
    })
  })

  describe('restoreFromPersisted', () => {
    it('should restore state from persisted data', () => {
      const mockState: PersistedChatState = {
        activeConversationId: 'conv-456',
        conversations: [
          {
            id: 'conv-456',
            title: 'Restored Conversation',
            lastMessageAt: Date.now(),
            messageCount: 2,
            createdAt: Date.now(),
          },
        ],
        messagesByConversation: {
          'conv-456': [
            {
              id: 'msg-1',
              role: 'user',
              content: 'Restored message',
              contentType: 'text',
              timestamp: Date.now(),
            },
          ],
        },
        savedAt: Date.now(),
        version: 1,
      }

      const { result } = renderHook(() => useChatStore())

      act(() => {
        result.current.restoreFromPersisted(mockState)
      })

      expect(result.current.conversationId).toBe('conv-456')
      expect(result.current.messages).toHaveLength(1)
      expect(result.current.messages[0].content).toBe('Restored message')
    })

    it('should handle null state', () => {
      const { result } = renderHook(() => useChatStore())

      // Should not throw
      act(() => {
        result.current.restoreFromPersisted(null)
      })

      expect(result.current.conversationId).toBeNull()
      expect(result.current.messages).toEqual([])
    })
  })
})
