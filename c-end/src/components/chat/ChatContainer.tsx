/**
 * 聊天容器组件
 * 整合 Ant Design X 组件，提供完整的聊天界面
 */

'use client'

import { useRef, useEffect, useCallback } from 'react'
import { Bubble, Sender, Welcome } from '@ant-design/x'
import { Spin, Button, Tooltip } from 'antd'
import { ReloadOutlined, StopOutlined, ClearOutlined } from '@ant-design/icons'
import { useCozeChat } from '@/hooks/useCozeChat'
import { useChatStore, selectMessages } from '@/stores/chatStore'
import { ChatErrorBoundary } from './ErrorBoundary'

// 欢迎语配置
const welcomePrompts = [
  '帮我找一份前端工程师的工作',
  '我想练习面试，岗位是产品经理',
  '武汉有哪些人才补贴政策？',
]

interface ChatContainerProps {
  className?: string
  showWelcome?: boolean
}

export function ChatContainer({ className, showWelcome = true }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Store 状态
  const storeMessages = useChatStore(selectMessages)
  const isTyping = useChatStore((s) => s.isTyping)

  // Hook
  const { isLoading, error, sendMessage, stopGeneration, retry, clearConversation } =
    useCozeChat({
      onError: (err) => {
        console.error('Chat error:', err)
      },
    })

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // 消息变化时滚动
  useEffect(() => {
    scrollToBottom()
  }, [storeMessages, scrollToBottom])

  // 处理发送消息
  const handleSend = useCallback(
    async (content: string) => {
      if (content.trim()) {
        await sendMessage(content.trim())
      }
    },
    [sendMessage]
  )

  // 处理快捷提示点击
  const handlePromptClick = useCallback(
    (prompt: string) => {
      handleSend(prompt)
    },
    [handleSend]
  )

  // 转换消息格式为 Ant Design X 格式
  const bubbleItems = storeMessages.map((msg) => ({
    key: msg.id,
    loading: msg.status === 'pending',
    role: msg.role,
    content: msg.content,
    typing: msg.status === 'streaming' || msg.status === 'pending',
  }))

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {showWelcome && storeMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Welcome
              icon="👋"
              title="你好，我是 WeHan 求职助手"
              description="我可以帮你找工作、模拟面试、解答政策问题"
            />
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {welcomePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-blue-300 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <Bubble.List items={bubbleItems} />
            {/* 滚动锚点 */}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="flex items-center justify-between px-4 py-2 bg-red-50 border-t border-red-100">
          <span className="text-sm text-red-600">{error.message}</span>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={retry}
            className="text-red-600 hover:text-red-700"
          >
            重试
          </Button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex-shrink-0 border-t bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          {/* 清空按钮 */}
          {storeMessages.length > 0 && (
            <Tooltip title="清空对话">
              <Button
                type="text"
                icon={<ClearOutlined />}
                onClick={clearConversation}
                className="text-gray-400 hover:text-gray-600"
              />
            </Tooltip>
          )}

          {/* 输入框 */}
          <div className="flex-1">
            <Sender
              placeholder="输入消息..."
              loading={isLoading}
              disabled={isLoading}
              onSubmit={(content) => handleSend(content as string)}
              onCancel={stopGeneration}
            />
          </div>

          {/* 停止按钮 */}
          {isLoading && (
            <Tooltip title="停止生成">
              <Button
                type="text"
                danger
                icon={<StopOutlined />}
                onClick={stopGeneration}
              />
            </Tooltip>
          )}
        </div>

        {/* 加载提示 */}
        {(isLoading || isTyping) && (
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
            <Spin size="small" />
            <span>正在思考...</span>
          </div>
        )}
      </div>
    </div>
  )
}

// 带错误边界的导出
export function ChatContainerWithErrorBoundary(props: ChatContainerProps) {
  return (
    <ChatErrorBoundary>
      <ChatContainer {...props} />
    </ChatErrorBoundary>
  )
}

export default ChatContainer
