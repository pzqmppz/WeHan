/**
 * Coze 聊天 Hook
 * 封装 SSE 流式对话逻辑，与 Zustand Store 集成
 */

import { useCallback, useRef, useState } from 'react'
import { useChatStore } from '@/stores/chatStore'
import { getVisitorId } from '@/lib/userIdentity'
import { shouldUsePolling } from '@/lib/browserDetect'
import { SSEParser, parseSSEData, CozeEventType } from '@/lib/sseParser'
import type { ChatError, MessageDeltaData } from '@/types/chat'
import { ChatErrorCode } from '@/types/chat'

// API 端点
const CHAT_API_URL = '/api/coze-proxy/chat'

export interface UseCozeChatOptions {
  onError?: (error: ChatError) => void
  onMessageComplete?: (messageId: string) => void
  enablePollingFallback?: boolean
}

export interface UseCozeChatReturn {
  isLoading: boolean
  error: ChatError | null
  sendMessage: (content: string) => Promise<void>
  stopGeneration: () => void
  retry: () => Promise<void>
  clearConversation: () => void
}

export function useCozeChat(options: UseCozeChatOptions = {}): UseCozeChatReturn {
  const { onError, onMessageComplete, enablePollingFallback = true } = options

  // 状态
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<ChatError | null>(null)

  // Store
  const addMessage = useChatStore((s) => s.addMessage)
  const updateLastMessage = useChatStore((s) => s.updateLastMessage)
  const setTyping = useChatStore((s) => s.setTyping)
  const setConversationId = useChatStore((s) => s.setConversationId)
  const clearMessages = useChatStore((s) => s.clearMessages)
  const getConversationId = useCallback(() => useChatStore.getState().conversationId, [])

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const sseParserRef = useRef(new SSEParser())
  const lastMessageRef = useRef<string>('')
  const currentAssistantMessageIdRef = useRef<string | null>(null)

  /**
   * 创建错误对象
   */
  const createError = useCallback(
    (code: ChatErrorCode, message: string, retryable: boolean = false): ChatError => {
      const err: ChatError = {
        code,
        message,
        retryable,
      }
      setError(err)
      onError?.(err)
      return err
    },
    [onError]
  )

  /**
   * 处理 SSE 事件
   */
  const handleSSEEvent = useCallback(
    (event: string, data: string) => {
      switch (event) {
        case CozeEventType.CONVERSATION_CREATED: {
          const parsed = parseSSEData<{ id: string }>(data)
          if (parsed?.id) {
            setConversationId(parsed.id)
          }
          break
        }

        case CozeEventType.MESSAGE_DELTA: {
          const parsed = parseSSEData<MessageDeltaData>(data)
          if (parsed?.content) {
            // 增量追加内容
            lastMessageRef.current += parsed.content
            updateLastMessage({
              content: lastMessageRef.current,
              status: 'streaming',
            })
          }
          break
        }

        case CozeEventType.MESSAGE_COMPLETED: {
          const parsed = parseSSEData<{ id: string; content: string }>(data)
          if (parsed) {
            updateLastMessage({
              status: 'completed',
            })
            if (currentAssistantMessageIdRef.current) {
              onMessageComplete?.(currentAssistantMessageIdRef.current)
            }
          }
          break
        }

        case CozeEventType.ERROR: {
          const parsed = parseSSEData<{ message: string; code?: number }>(data)
          createError(
            ChatErrorCode.API_ERROR,
            parsed?.message || 'Unknown error',
            false
          )
          break
        }

        case CozeEventType.PING: {
          // 心跳，忽略
          break
        }
      }
    },
    [updateLastMessage, setConversationId, createError, onMessageComplete]
  )

  /**
   * 发送消息
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) {
        return
      }

      // 清除之前的错误
      setError(null)
      setIsLoading(true)
      setTyping(true)

      // 重置 SSE parser
      sseParserRef.current.reset()
      lastMessageRef.current = ''

      // 添加用户消息
      addMessage({
        role: 'user',
        content: content.trim(),
        contentType: 'text',
        status: 'completed',
      })

      // 添加占位的助手消息
      const assistantMessageId = addMessage({
        role: 'assistant',
        content: '',
        contentType: 'text',
        status: 'pending',
      })
      currentAssistantMessageIdRef.current = assistantMessageId

      // 检查是否需要降级为轮询
      const usePolling = enablePollingFallback && shouldUsePolling()

      if (usePolling) {
        console.warn('WeChat browser detected, polling fallback not implemented yet')
        // TODO: 实现轮询降级方案
        createError(
          ChatErrorCode.API_ERROR,
          '当前浏览器暂不支持流式对话，请使用其他浏览器',
          false
        )
        setIsLoading(false)
        setTyping(false)
        return
      }

      // 创建 AbortController
      abortControllerRef.current = new AbortController()

      try {
        const response = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content.trim(),
            conversationId: getConversationId(),
            userId: getVisitorId(),
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          if (response.status === 429) {
            throw createError(
              ChatErrorCode.RATE_LIMITED,
              '请求过于频繁，请稍后再试',
              true
            )
          }
          throw createError(
            ChatErrorCode.API_ERROR,
            errorData.error || `HTTP ${response.status}`,
            response.status >= 500
          )
        }

        if (!response.body) {
          throw createError(ChatErrorCode.INVALID_RESPONSE, 'No response body', false)
        }

        // 读取 SSE 流
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const events = sseParserRef.current.parse(chunk)

          for (const { event, data } of events) {
            handleSSEEvent(event, data)
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          if (err.name === 'AbortError') {
            createError(ChatErrorCode.UNKNOWN, '已停止生成', false)
          } else {
            createError(ChatErrorCode.NETWORK_ERROR, err.message, true)
          }
        }
      } finally {
        setIsLoading(false)
        setTyping(false)
        abortControllerRef.current = null
      }
    },
    [
      isLoading,
      getConversationId,
      addMessage,
      updateLastMessage,
      setTyping,
      handleSSEEvent,
      createError,
      enablePollingFallback,
    ]
  )

  /**
   * 停止生成
   */
  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  /**
   * 重试上一次请求
   */
  const retry = useCallback(async () => {
    // 获取最后一条用户消息
    const messages = useChatStore.getState().messages
    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === 'user')

    if (lastUserMessage) {
      await sendMessage(lastUserMessage.content)
    }
  }, [sendMessage])

  /**
   * 清空会话
   */
  const clearConversation = useCallback(() => {
    clearMessages()
    sseParserRef.current.reset()
    lastMessageRef.current = ''
    currentAssistantMessageIdRef.current = null
    setError(null)
  }, [clearMessages])

  return {
    isLoading,
    error,
    sendMessage,
    stopGeneration,
    retry,
    clearConversation,
  }
}

export default useCozeChat
