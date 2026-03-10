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
import { MarkdownContent } from '@/components/ui/MarkdownContent'

// 快捷入口 - 点击后发送预设消息
const quickActions = [
  {
    icon: <BulbOutlined />,
    title: '模拟面试',
    message: '我要面试',
    color: '#059669', // 翡翠绿
  },
  {
    icon: <BookOutlined />,
    title: '政策解读',
    message: '查政策',
    color: '#0284C7', // 天蓝
  },
  {
    icon: <RocketOutlined />,
    title: '职位推荐',
    message: '查岗位',
    color: '#F97316', // 活力橙
  },
]

interface ChatContainerProps {
  className?: string
  showWelcome?: boolean
}

// 动态加载消息轮换
const loadingMessages = [
  '正在分析...',
  '思考中...',
  '准备回答...',
  '马上就好...',
]

export function ChatContainer({ className, showWelcome = true }: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0)

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

  // 加载消息轮换
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length)
      }, 2000)
      return () => clearInterval(interval)
    } else {
      setLoadingMessageIndex(0)
    }
  }, [isLoading])

  // 处理发送消息
  const handleSend = useCallback(
    async (content: string) => {
      if (content.trim() && !isSending) {
        setIsSending(true)
        try {
          await sendMessage(content.trim())

          // 首次发送消息后显示庆祝动画
          if (storeMessages.length === 0) {
            setShowCelebration(true)
            setTimeout(() => setShowCelebration(false), 1000)
          }
        } finally {
          setIsSending(false)
        }
      }
    },
    [sendMessage, isSending, storeMessages.length]
  )

  // 处理快捷入口点击
  const handleQuickActionClick = useCallback(
    (actionMessage: string) => {
      handleSend(actionMessage)
    },
    [handleSend]
  )

  // 渲染思考状态动效（在气泡内部）
  const renderThinkingState = () => (
    <div className="flex items-center gap-3 py-2">
      {/* 波形动画 */}
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-wave" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-wave" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] animate-wave" style={{ animationDelay: '300ms' }} />
      {/* 动态加载消息 */}
      <span className="text-sm text-[var(--text-muted)] animate-fade-in" key={loadingMessageIndex}>
        {loadingMessages[loadingMessageIndex]}
      </span>
    </div>
  )

  // 转换消息格式为 Ant Design X 格式
  const bubbleItems = storeMessages.map((msg) => {
    const isAssistant = msg.role === 'assistant'
    // 思考状态：只要内容为空就显示思考动效（不依赖 status）
    const hasContent = msg.content && msg.content.trim().length > 0
    const isThinking = isAssistant && !hasContent

    return {
      key: msg.id,
      role: msg.role,
      // assistant 消息：思考状态显示动效，有内容时显示 Markdown
      content: isAssistant
        ? isThinking
          ? renderThinkingState()
          : <MarkdownContent content={msg.content} />
        : msg.content,
      typing: msg.status === 'streaming' && !isThinking,
      avatar: msg.role === 'user'
        ? <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--text-secondary)', borderRadius: 'var(--radius-sm)' }}>
            <UserOutlined className="text-white text-sm" />
          </div>
        : <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}>
            <RobotOutlined className="text-white text-sm" />
          </div>,
    }
  })

  // 渲染欢迎页 - 大胆非对称布局
  const renderWelcome = () => (
    <div className="flex flex-col h-full animate-fade-in px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
      {/* 非对称欢迎区域 */}
      <div className="max-w-2xl md:max-w-3xl">
        {/* 大标题 - 响应式字号 */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--text-primary)] leading-tight mb-4">
          找工作，<br />
          <span style={{ color: 'var(--primary)' }}>没那么难</span>
        </h1>

        {/* 副标题 */}
        <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-8 md:mb-12 max-w-lg">
          AI 模拟面试 · 岗位推荐 · 政策解读
        </p>

        {/* 功能网格 - 响应式布局 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleQuickActionClick(action.message)}
              className={`p-4 md:p-5 text-left transition-all duration-200 cursor-pointer hover-lift ${
                index === 0 ? 'sm:col-span-2 border-2' : 'border'
              }`}
              style={{
                background: index === 0 ? 'var(--primary-bg)' : 'var(--surface)',
                borderColor: index === 0 ? 'var(--primary)' : 'var(--border)',
                borderRadius: index === 0 ? 'var(--radius)' : 'var(--radius-sm)',
                transition: 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <div className="flex items-center gap-2 md:gap-3 mb-2">
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                  style={{
                    background: action.color,
                    borderRadius: index === 0 ? 'var(--radius-sm)' : 'var(--radius)',
                  }}
                >
                  <span className="text-white">{action.icon}</span>
                </div>
                <span className="font-semibold text-[var(--text-primary)] text-sm md:text-base">{action.title}</span>
              </div>
              <p className="text-xs md:text-sm text-[var(--text-muted)]">
                {index === 0 ? 'AI 模拟真实面试场景，助你备战' : '点击开始'}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  // 是否显示欢迎状态（无消息）
  const isWelcome = showWelcome && storeMessages.length === 0

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* 消息区域 - 响应式 padding */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
        {isWelcome ? (
          renderWelcome()
        ) : (
          <div className="flex flex-col justify-start space-y-4 max-w-4xl mx-auto w-full">
            <Bubble.List items={bubbleItems} />
            {/* 滚动锚点 */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mx-4 md:mx-6 lg:mx-8 mb-2 flex items-center justify-between px-4 py-3 bg-red-50 border border-red-200 rounded-xl animate-fade-in" style={{ borderRadius: 'var(--radius)' }}>
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
      <div className="flex-shrink-0 bg-white border-t border-[var(--border)] px-4 md:px-6 lg:px-8 py-3">
        {/* 手机端快捷入口 (仅欢迎页显示) */}
        {isWelcome && (
          <div className="md:hidden flex items-center justify-center gap-2 mb-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickActionClick(action.message)}
                className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-md transition-all text-sm group cursor-pointer hover-lift"
                style={{
                  borderRadius: 'var(--radius-full)',
                  transition: 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1)',
                }}
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

        <div className="flex items-center gap-3 max-w-full md:max-w-3xl lg:max-w-4xl mx-auto h-10">
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
              className="w-10 h-10 flex items-center justify-center bg-[var(--background)] hover:bg-[var(--border)] transition-colors cursor-pointer flex-shrink-0"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <PlusOutlined style={{ color: 'var(--primary)' }} />
            </button>
          </Tooltip>

          {/* 输入框容器 */}
          <div className="flex-1 min-w-0 sender-wrapper h-10">
            <Sender
              placeholder="输入消息..."
              value={inputValue}
              loading={isLoading}
              disabled={isLoading}
              onSubmit={(content) => {
                handleSend(content as string)
                setInputValue('')  // 受控模式下，清空状态会自动更新输入框
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
                className="w-10 h-10 flex items-center justify-center hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
                style={{ background: 'var(--error)', borderRadius: 'var(--radius-sm)' }}
              >
                <StopOutlined className="text-white" />
              </button>
            </Tooltip>
          ) : (
            <button
              className={`w-10 h-10 flex items-center justify-center hover:opacity-90 transition-all cursor-pointer flex-shrink-0 relative overflow-hidden ${
                isSending ? 'animate-pulse-glow' : ''
              }`}
              style={{ background: 'var(--primary)', borderRadius: 'var(--radius-sm)' }}
              onClick={() => {
                if (inputValue.trim()) {
                  handleSend(inputValue)
                  setInputValue('')
                }
              }}
            >
              <SendOutlined className={`text-white ${isSending ? 'animate-fly-out' : ''}`} />
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
