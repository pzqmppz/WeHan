/**
 * C 端落地页 - 简化版单会话模式
 * 采用 Flat Design 风格，简洁专业的配色
 */

'use client'

import { useCallback } from 'react'
import { Tooltip } from 'antd'
import {
  ClearOutlined,
  BulbOutlined,
  RocketOutlined,
  BookOutlined,
} from '@ant-design/icons'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { useChatStore } from '@/stores/chatStore'

// 快捷入口配置 - 更新为年轻活力配色
const quickActions = [
  {
    icon: <BulbOutlined />,
    title: '模拟面试',
    message: '我要面试',
    color: '#059669', // 翡翠绿
    variant: 'primary' as const,
    description: 'AI 模拟真实面试场景',
  },
  {
    icon: <BookOutlined />,
    title: '政策解读',
    message: '查政策',
    color: '#0284C7', // 天蓝
    variant: 'compact-left' as const,
  },
  {
    icon: <RocketOutlined />,
    title: '职位推荐',
    message: '查岗位',
    color: '#F97316', // 活力橙
    variant: 'compact-right' as const,
  },
]

export default function HomePage() {
  // Store 状态和方法
  const clearMessages = useChatStore((s) => s.clearMessages)
  const setConversationId = useChatStore((s) => s.setConversationId)
  const messages = useChatStore((s) => s.messages)

  // 清空对话记录
  const handleClearHistory = useCallback(() => {
    clearMessages()
    setConversationId(null)
  }, [clearMessages, setConversationId])

  return (
    <main className="h-screen flex" style={{ background: 'var(--background)' }}>
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 顶部导航栏 - 固定定位 */}
        <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-[var(--border)]">
          {/* Logo - 文字标设计 */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-[var(--primary)]">We</span><span className="text-[var(--text-primary)]">Han</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs font-medium text-white rounded-sm" style={{ background: 'var(--accent)' }}>
                求职助手
              </span>
            </h1>
          </div>

          {/* 右侧操作区 - 清空记录按钮 */}
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Tooltip title="清空记录">
                <button
                  onClick={handleClearHistory}
                  className="h-10 px-4 bg-[var(--background)] text-[var(--text-primary)] font-medium flex items-center gap-2 hover:bg-[var(--border)] transition-colors cursor-pointer"
                  style={{ borderRadius: 'var(--radius-sm)' }}
                >
                  <ClearOutlined />
                  <span className="hidden sm:inline">清空记录</span>
                </button>
              </Tooltip>
            )}
          </div>
        </header>

        {/* 内容区域 */}
        <div className="flex-1 flex relative pt-16">
          {/* 聊天主区域 - 带最大宽度限制 */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex flex-col max-w-full">
              {/* 大屏幕限制聊天区域宽度并居中 */}
              <div className="w-full max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto h-full flex flex-col">
                <ChatContainer className="flex-1" />
              </div>
            </div>
          </div>

          {/* 右侧快捷入口 - iPad 和桌面端 */}
          <aside className="hidden md:flex w-64 flex-shrink-0 flex-col gap-4 p-4 bg-white border-l border-[var(--border)]">
            <h3 className="text-sm font-semibold text-[var(--text-secondary)] px-1 uppercase tracking-wide">快捷入口</h3>

            {/* 主要入口 - 模拟面试 */}
            <button
              onClick={() => {
                const action = quickActions[0]
                const chatInput = document.querySelector('textarea[placeholder*="输入"]') as HTMLTextAreaElement
                if (chatInput) {
                  chatInput.value = action.message
                  chatInput.dispatchEvent(new Event('input', { bubbles: true }))
                  chatInput.focus()
                }
              }}
              className="p-5 text-left transition-all duration-200 cursor-pointer border-2 hover-lift"
              style={{
                background: `${quickActions[0].color}15`,
                borderColor: quickActions[0].color,
                borderRadius: 'var(--radius)',
                transition: 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: quickActions[0].color, borderRadius: 'var(--radius-sm)' }}>
                  <span className="text-white text-lg">{quickActions[0].icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[var(--text-primary)] text-base">{quickActions[0].title}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{quickActions[0].description}</p>
                </div>
              </div>
            </button>

            {/* 次要入口 - 政策解读 (紧凑型) */}
            <button
              onClick={() => {
                const action = quickActions[1]
                const chatInput = document.querySelector('textarea[placeholder*="输入"]') as HTMLTextAreaElement
                if (chatInput) {
                  chatInput.value = action.message
                  chatInput.dispatchEvent(new Event('input', { bubbles: true }))
                  chatInput.focus()
                }
              }}
              className="flex items-center gap-3 p-3 bg-[var(--background)] hover:bg-[var(--border)] text-left transition-all duration-200 cursor-pointer hover-lift"
              style={{
                borderRadius: 'var(--radius-sm)',
                transition: 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: `${quickActions[1].color}20`, borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: quickActions[1].color, fontSize: '14px' }}>{quickActions[1].icon}</span>
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">{quickActions[1].title}</span>
            </button>

            {/* 次要入口 - 职位推荐 (紧凑型 - 反向布局) */}
            <button
              onClick={() => {
                const action = quickActions[2]
                const chatInput = document.querySelector('textarea[placeholder*="输入"]') as HTMLTextAreaElement
                if (chatInput) {
                  chatInput.value = action.message
                  chatInput.dispatchEvent(new Event('input', { bubbles: true }))
                  chatInput.focus()
                }
              }}
              className="flex items-center justify-end gap-3 p-3 bg-[var(--background)] hover:bg-[var(--border)] text-left transition-all duration-200 cursor-pointer hover-lift"
              style={{
                borderRadius: 'var(--radius-sm)',
                transition: 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 200ms cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <span className="text-sm font-medium text-[var(--text-primary)]">{quickActions[2].title}</span>
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: `${quickActions[2].color}20`, borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: quickActions[2].color, fontSize: '14px' }}>{quickActions[2].icon}</span>
              </div>
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}
