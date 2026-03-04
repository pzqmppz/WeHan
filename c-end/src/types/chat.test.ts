/**
 * chat.ts 类型定义测试
 * 验证持久化相关类型的类型安全
 */

import { describe, it, expect } from 'vitest'
import type {
  PersistedConversationMeta,
  PersistedMessagesData,
  PersistedChatState,
} from './chat'

describe('PersistedConversationMeta', () => {
  it('should accept valid conversation metadata', () => {
    const meta: PersistedConversationMeta = {
      id: 'conv-1',
      title: 'Test Conversation',
      lastMessageAt: Date.now(),
      messageCount: 5,
      createdAt: Date.now() - 1000,
    }

    expect(meta.id).toBe('conv-1')
    expect(meta.title).toBe('Test Conversation')
    expect(meta.messageCount).toBe(5)
  })

  it('should have required fields', () => {
    // This test verifies TypeScript compilation
    const meta: PersistedConversationMeta = {
      id: 'conv-1',
      title: 'Test',
      lastMessageAt: 0,
      messageCount: 0,
      createdAt: 0,
    }

    expect(meta).toBeDefined()
  })
})

describe('PersistedMessagesData', () => {
  it('should accept valid messages data', () => {
    const data: PersistedMessagesData = {
      conversationId: 'conv-1',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello',
          contentType: 'text',
          timestamp: Date.now(),
          status: 'completed',
        },
      ],
      updatedAt: Date.now(),
    }

    expect(data.conversationId).toBe('conv-1')
    expect(data.messages).toHaveLength(1)
  })
})

describe('PersistedChatState', () => {
  it('should accept valid full state', () => {
    const state: PersistedChatState = {
      activeConversationId: 'conv-1',
      conversations: [
        {
          id: 'conv-1',
          title: 'Test',
          lastMessageAt: Date.now(),
          messageCount: 1,
          createdAt: Date.now(),
        },
      ],
      messagesByConversation: {
        'conv-1': [
          {
            id: 'msg-1',
            role: 'user',
            content: 'Hello',
            contentType: 'text',
            timestamp: Date.now(),
          },
        ],
      },
      savedAt: Date.now(),
      version: 1,
    }

    expect(state.version).toBe(1)
    expect(state.conversations).toHaveLength(1)
    expect(state.activeConversationId).toBe('conv-1')
  })

  it('should support null activeConversationId', () => {
    const state: PersistedChatState = {
      activeConversationId: null,
      conversations: [],
      messagesByConversation: {},
      savedAt: Date.now(),
      version: 1,
    }

    expect(state.activeConversationId).toBeNull()
  })
})
