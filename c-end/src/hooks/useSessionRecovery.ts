/**
 * 会话恢复 Hook
 * 处理页面刷新后的会话恢复、网络重连后的状态恢复
 */

'use client'

import { useEffect, useCallback, useState } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { useConversationStore, selectActiveConversationId } from '@/stores/conversationStore'

export type RecoveryState = 'idle' | 'recovering' | 'success' | 'failed'

export interface UseSessionRecoveryOptions {
  autoRecover?: boolean // 页面加载时自动恢复
  maxAge?: number // 会话最大有效期 (毫秒)
  onRecoverySuccess?: () => void
  onRecoveryFailed?: (error: Error) => void
}

export interface UseSessionRecoveryReturn {
  recoveryState: RecoveryState
  recoverSession: () => Promise<boolean>
  lastRecoveryTime: number | null
}

const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 天

export function useSessionRecovery(
  options: UseSessionRecoveryOptions = {}
): UseSessionRecoveryReturn {
  const {
    autoRecover = true,
    maxAge = DEFAULT_MAX_AGE,
    onRecoverySuccess,
    onRecoveryFailed,
  } = options

  const [recoveryState, setRecoveryState] = useState<RecoveryState>('idle')
  const [lastRecoveryTime, setLastRecoveryTime] = useState<number | null>(null)

  const activeId = useConversationStore(selectActiveConversationId)
  const conversations = useConversationStore((s) => s.conversations)
  const setActiveConversation = useConversationStore((s) => s.setActiveConversation)
  const setConversationId = useChatStore((s) => s.setConversationId)

  // 恢复会话
  const recoverSession = useCallback(async (): Promise<boolean> => {
    setRecoveryState('recovering')

    try {
      // 1. 检查是否有保存的活跃会话
      if (!activeId) {
        setRecoveryState('success')
        return true
      }

      // 2. 检查会话是否存在
      const conversation = conversations.find((c) => c.id === activeId)

      if (!conversation) {
        // 会话不存在，清空状态
        setActiveConversation(null)
        setRecoveryState('success')
        return true
      }

      // 3. 检查会话是否过期
      const age = Date.now() - conversation.lastMessageAt
      if (age > maxAge) {
        console.log('[SessionRecovery] Session expired, age:', age)
        setActiveConversation(null)
        setRecoveryState('success')
        return true
      }

      // 4. 恢复消息 - 从 chatStore 的持久化数据中加载
      const messagesByConversation = useChatStore.getState().messagesByConversation
      if (messagesByConversation && messagesByConversation[activeId]) {
        useChatStore.setState({
          messages: messagesByConversation[activeId],
        })
      }

      setRecoveryState('success')
      setLastRecoveryTime(Date.now())
      onRecoverySuccess?.()
      return true
    } catch (error) {
      console.error('[SessionRecovery] Recovery failed:', error)
      setRecoveryState('failed')
      onRecoveryFailed?.(error instanceof Error ? error : new Error('Unknown error'))
      return false
    }
  }, [activeId, maxAge, conversations, setActiveConversation, onRecoverySuccess, onRecoveryFailed])

  // 自动恢复
  useEffect(() => {
    if (autoRecover && recoveryState === 'idle') {
      recoverSession()
    }
  }, [autoRecover, recoveryState, recoverSession])

  // 网络重连监听
  useEffect(() => {
    const handleOnline = () => {
      console.log('[SessionRecovery] Network reconnected, checking session...')
      // 网络恢复后，如果当前有活跃会话，验证其有效性
      if (activeId && recoveryState === 'success') {
        recoverSession()
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [activeId, recoveryState, recoverSession])

  return {
    recoveryState,
    recoverSession,
    lastRecoveryTime,
  }
}

export default useSessionRecovery
