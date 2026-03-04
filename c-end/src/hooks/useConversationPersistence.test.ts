/**
 * useConversationPersistence Hook 测试
 * 测试 localStorage 持久化逻辑
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useConversationPersistence } from './useConversationPersistence'
import type { ChatMessage, PersistedChatState } from '@/types/chat'

// Mock 数据
const createMockMessage = (id: string, content: string): ChatMessage => ({
  id,
  role: 'user',
  content,
  contentType: 'text',
  timestamp: Date.now(),
  status: 'completed',
})

const createMockState = (overrides?: Partial<PersistedChatState>): PersistedChatState => ({
  activeConversationId: 'conv-1',
  conversations: [
    {
      id: 'conv-1',
      title: 'Test Conversation',
      lastMessageAt: Date.now(),
      messageCount: 2,
      createdAt: Date.now(),
    },
  ],
  messagesByConversation: {
    'conv-1': [createMockMessage('msg-1', 'Hello')],
  },
  savedAt: Date.now(),
  version: 1,
  ...overrides,
})

describe('useConversationPersistence', () => {
  const STORAGE_KEY = 'wehan_chat_state'

  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('saveState', () => {
    it('should save state to localStorage after debounce', () => {
      const { result } = renderHook(() => useConversationPersistence())
      const state = createMockState()

      act(() => {
        result.current.saveState(state)
      })

      // Should not have saved yet (debounced)
      expect(localStorage.setItem).not.toHaveBeenCalled()

      // Fast forward debounce time
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Now should have saved
      expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String))
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(saved.version).toBe(1)
      expect(saved.conversations).toHaveLength(1)
    })

    it('should debounce saves', () => {
      const { result } = renderHook(() => useConversationPersistence())
      const state1 = createMockState()
      const state2 = createMockState({ activeConversationId: 'conv-2' })

      act(() => {
        result.current.saveState(state1)
        result.current.saveState(state2)
      })

      // Should not have saved yet (debounced)
      expect(localStorage.setItem).not.toHaveBeenCalled()

      // Fast forward debounce time
      act(() => {
        vi.advanceTimersByTime(500)
      })

      // Now should have saved (only once, with latest state)
      expect(localStorage.setItem).toHaveBeenCalledTimes(1)
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(saved.activeConversationId).toBe('conv-2')
    })

    it('should handle QuotaExceededError', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Create a mock that throws QuotaExceededError
      const mockSetItem = vi.fn(() => {
        const error = new Error('Quota exceeded')
        error.name = 'QuotaExceededError'
        throw error
      })

      // Override window.localStorage completely for this test
      const originalLocalStorage = window.localStorage
      Object.defineProperty(window, 'localStorage', {
        value: {
          ...originalLocalStorage,
          setItem: mockSetItem,
        },
        writable: true,
        configurable: true,
      })

      const { result } = renderHook(() => useConversationPersistence())
      const state = createMockState()

      act(() => {
        result.current.saveState(state)
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      expect(mockSetItem).toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalled()

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
        configurable: true,
      })
      consoleError.mockRestore()
    })

    it('should limit messages per conversation', () => {
      const { result } = renderHook(() =>
        useConversationPersistence({ maxMessagesPerConversation: 10 })
      )

      // Create state with more than 10 messages
      const messages = Array.from({ length: 20 }, (_, i) =>
        createMockMessage(`msg-${i}`, `Message ${i}`)
      )

      const state = createMockState({
        messagesByConversation: {
          'conv-1': messages,
        },
      })

      act(() => {
        result.current.saveState(state)
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(saved.messagesByConversation['conv-1']).toHaveLength(10)
      // Should keep the most recent messages (last 10)
      expect(saved.messagesByConversation['conv-1'][9].id).toBe('msg-19')
    })

    it('should limit number of conversations', () => {
      const { result } = renderHook(() =>
        useConversationPersistence({ maxConversations: 5 })
      )

      // Create state with more than 5 conversations
      const conversations = Array.from({ length: 10 }, (_, i) => ({
        id: `conv-${i}`,
        title: `Conversation ${i}`,
        lastMessageAt: Date.now() - i * 1000,
        messageCount: 1,
        createdAt: Date.now() - i * 10000,
      }))

      const state = createMockState({ conversations })

      act(() => {
        result.current.saveState(state)
      })

      act(() => {
        vi.advanceTimersByTime(500)
      })

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      expect(saved.conversations).toHaveLength(5)
      // Should keep most recent conversations (sorted by lastMessageAt desc)
      expect(saved.conversations[0].id).toBe('conv-0')
    })
  })

  describe('loadState', () => {
    it('should load state from localStorage', () => {
      const state = createMockState()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

      const { result } = renderHook(() => useConversationPersistence())

      let loaded: PersistedChatState | null = null
      act(() => {
        loaded = result.current.loadState()
      })

      expect(loaded).not.toBeNull()
      expect(loaded?.version).toBe(1)
      expect(loaded?.conversations).toHaveLength(1)
    })

    it('should return null when no saved state', () => {
      const { result } = renderHook(() => useConversationPersistence())

      let loaded: PersistedChatState | null = null
      act(() => {
        loaded = result.current.loadState()
      })

      expect(loaded).toBeNull()
    })

    it('should handle corrupted JSON', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      localStorage.setItem(STORAGE_KEY, 'invalid json {{{')

      const { result } = renderHook(() => useConversationPersistence())

      let loaded: PersistedChatState | null = null
      act(() => {
        loaded = result.current.loadState()
      })

      expect(loaded).toBeNull()
      expect(consoleError).toHaveBeenCalled()

      consoleError.mockRestore()
    })

    it('should handle version mismatch', () => {
      const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {})

      // Save state with old version
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...createMockState(),
          version: 0,
        })
      )

      const { result } = renderHook(() =>
        useConversationPersistence({ version: 1 })
      )

      let loaded: PersistedChatState | null = null
      act(() => {
        loaded = result.current.loadState()
      })

      // Should return null for version mismatch
      expect(loaded).toBeNull()
      expect(consoleWarn).toHaveBeenCalled()

      consoleWarn.mockRestore()
    })
  })

  describe('clearState', () => {
    it('should clear state from localStorage', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(createMockState()))

      const { result } = renderHook(() => useConversationPersistence())

      act(() => {
        result.current.clearState()
      })

      expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    })
  })

  describe('getConversationTitles', () => {
    it('should return conversation titles sorted by lastMessageAt', () => {
      const state = createMockState({
        conversations: [
          {
            id: 'conv-1',
            title: 'Old Conversation',
            lastMessageAt: 1000,
            messageCount: 1,
            createdAt: 0,
          },
          {
            id: 'conv-2',
            title: 'New Conversation',
            lastMessageAt: 2000,
            messageCount: 2,
            createdAt: 1000,
          },
        ],
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

      const { result } = renderHook(() => useConversationPersistence())

      let titles: Array<{ id: string; title: string }> = []
      act(() => {
        titles = result.current.getConversationTitles()
      })

      expect(titles).toHaveLength(2)
      // Should be sorted by lastMessageAt descending
      expect(titles[0].id).toBe('conv-2')
      expect(titles[1].id).toBe('conv-1')
    })

    it('should return empty array when no state', () => {
      const { result } = renderHook(() => useConversationPersistence())

      let titles: Array<{ id: string; title: string }> = []
      act(() => {
        titles = result.current.getConversationTitles()
      })

      expect(titles).toEqual([])
    })
  })

  describe('getMessages', () => {
    it('should return messages for a conversation', () => {
      const messages = [createMockMessage('msg-1', 'Hello')]
      const state = createMockState({
        messagesByConversation: {
          'conv-1': messages,
        },
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))

      const { result } = renderHook(() => useConversationPersistence())

      let loadedMessages: ChatMessage[] = []
      act(() => {
        loadedMessages = result.current.getMessages('conv-1')
      })

      expect(loadedMessages).toHaveLength(1)
      expect(loadedMessages[0].content).toBe('Hello')
    })

    it('should return empty array for non-existent conversation', () => {
      const { result } = renderHook(() => useConversationPersistence())

      let loadedMessages: ChatMessage[] = []
      act(() => {
        loadedMessages = result.current.getMessages('non-existent')
      })

      expect(loadedMessages).toEqual([])
    })
  })
})
