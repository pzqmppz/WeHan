/**
 * 聊天容器组件 - 现代化设计
 * 整合 Ant Design X 组件，提供完整的聊天界面
 */

'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import { Bubble, Sender, Welcome } from '@ant-design/x'
import { Spin, Button, Tooltip, message } from 'antd'
import {
  ReloadOutlined,
  StopOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  BulbOutlined,
  BookOutlined,
  RocketOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useCozeChat } from '@/hooks/useCozeChat'
import { useChatStore, selectMessages } from '@/stores/chatStore'
import { ChatErrorBoundary } from './ErrorBoundary'

// 快捷入口 - 点击后发送预设消息
const quickActions = [
  {
    icon: <BulbOutlined />,
    title: '模拟面试',
    message: '我要面试',
    color: '#22C55E',
  },
  {
    icon: <BookOutlined />,
    title: '政策解读',
    message: '查政策',
    color: '#8B5CF6',
  },
  {
    icon: <RocketOutlined />,
    title: '职位推荐',
    message: '查岗位',
    color: '#0369A1',
  },
]

interface ChatContainerProps {
  className?: string
  showWelcome?: boolean
}

export function ChatContainer({ className, showWelcome = true }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

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

  // 文件上传处理
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // TODO: 实现文件上传逻辑
      message.info(`已选择文件: ${file.name}`)
      // 清空 input 以便重复选择同一文件
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [])

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

  // 处理快捷入口点击
  const handleQuickActionClick = useCallback(
    (actionMessage: string) => {
      handleSend(actionMessage)
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
    avatar: msg.role === 'user'
      ? <div className="w-8 h-8 rounded-lg bg-[var(--text-secondary)] flex items-center justify-center flex-shrink-0">
          <UserOutlined className="text-white text-sm" />
        </div>
      : <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
          <RobotOutlined className="text-white text-sm" />
        </div>,
  }))

  // 渲染欢迎页
  const renderWelcome = () => (
    <div className="flex flex-col items-center justify-center h-full animate-fade-in">
      {/* 主欢迎区域 */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 shadow-lg">
          <RobotOutlined className="text-white text-3xl" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          你好，我是 WeHan 求职助手
        </h2>
        <p className="text-[var(--text-secondary)] max-w-md">
          我可以帮你找工作、模拟面试、解答政策问题
        </p>
      </div>
    </div>
  )

  // 渲染打字指示器
  const renderTypingIndicator = () => (
    <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
        <RobotOutlined className="text-white text-sm" />
      </div>
      <div className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-2xl border border-[var(--border)]">
        <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing" style={{ animationDelay: '200ms' }} />
        <span className="w-2 h-2 bg-[var(--primary)] rounded-full animate-typing" style={{ animationDelay: '400ms' }} />
      </div>
    </div>
  )

  // 是否显示欢迎状态（无消息）
  const isWelcome = showWelcome && storeMessages.length === 0

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isWelcome ? (
          renderWelcome()
        ) : (
          <div className="flex flex-col justify-start space-y-4">
            <Bubble.List items={bubbleItems} />
            {/* 打字指示器 */}
            {(isLoading || isTyping) && !storeMessages.some(m => m.status === 'streaming') && renderTypingIndicator()}
            {/* 滚动锚点 */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 mb-2 flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
          <span className="text-sm text-red-600">{error.message}</span>
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={retry}
            className="text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            重试
          </Button>
        </div>
      )}

      {/* 输入区域 */}
      <div className="flex-shrink-0 bg-white border-t border-[var(--border)] px-4 py-3">
        {/* 手机端快捷入口 (仅欢迎页显示) */}
        {isWelcome && (
          <div className="lg:hidden flex items-center justify-center gap-2 mb-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickActionClick(action.message)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[var(--border)] hover:border-[var(--primary-light)] hover:shadow-sm transition-all text-sm group cursor-pointer"
              >
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: `${action.color}15` }}
                >
                  <span style={{ color: action.color, fontSize: '12px' }}>{action.icon}</span>
                </div>
                <span className="text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors font-medium">
                  {action.title}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 max-w-3xl mx-auto h-10">
          {/* 文件上传按钮 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Tooltip title="上传简历">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
            >
              <PlusOutlined className="text-white" />
            </button>
          </Tooltip>

          {/* 输入框容器 */}
          <div className="flex-1 min-w-0 sender-wrapper h-10">
            <Sender
              placeholder="输入消息..."
              loading={isLoading}
              disabled={isLoading}
              onSubmit={(content) => {
                handleSend(content as string)
                setInputValue('')
              }}
              onCancel={stopGeneration}
              onChange={(value) => setInputValue(value as string)}
            />
          </div>

          {/* 发送/停止按钮 */}
          {isLoading ? (
            <Tooltip title="停止生成">
              <button
                onClick={stopGeneration}
                className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer flex-shrink-0"
              >
                <StopOutlined className="text-white" />
              </button>
            </Tooltip>
          ) : (
            <button
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
              onClick={() => {
                if (inputValue.trim()) {
                  handleSend(inputValue)
                  setInputValue('')
                }
              }}
            >
              <SendOutlined className="text-white" />
            </button>
          )}
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-2">
          WeHan 可能会出错，请核实重要信息
        </p>
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
