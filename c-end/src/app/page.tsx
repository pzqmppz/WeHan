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

// 快捷入口配置
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
        {/* 顶部导航栏 */}
        <header className="flex-shrink-0 h-16 flex items-center justify-between px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-[var(--text-primary)]">WeHan 求职助手</h1>
            </div>
          </div>

          {/* 右侧操作区 - 清空记录按钮 */}
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <Tooltip title="清空记录">
                <button
                  onClick={handleClearHistory}
                  className="h-10 px-4 rounded-xl bg-[var(--background)] text-[var(--text-primary)] font-medium flex items-center gap-2 hover:bg-[var(--border)] transition-colors cursor-pointer"
                >
                  <ClearOutlined />
                  <span className="hidden sm:inline">清空记录</span>
                </button>
              </Tooltip>
            )}
          </div>
        </header>

        {/* 内容区域 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 聊天主区域 */}
          <div className="flex-1 flex flex-col">
            <ChatContainer className="flex-1" />
          </div>

          {/* 右侧快捷入口 (桌面端) */}
          <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col gap-4 p-4 bg-white/50 border-l border-[var(--border)]">
            <h3 className="text-sm font-medium text-[var(--text-secondary)] px-1">快捷入口</h3>
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 bg-white rounded-2xl border border-[var(--border)] text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${action.color}15` }}
                >
                  <span style={{ color: action.color }}>{action.icon}</span>
                </div>
                <h4 className="font-medium text-[var(--text-primary)]">
                  {action.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1">点击下方按钮开始</p>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </main>
  )
}
