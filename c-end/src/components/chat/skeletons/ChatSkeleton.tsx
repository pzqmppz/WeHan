/**
 * 聊天骨架屏
 * 聊天加载时显示的骨架占位
 */

'use client'

import { Skeleton } from 'antd'

interface ChatSkeletonProps {
  /** 消息数量 */
  messageCount?: number
  /** 是否显示输入框 */
  showInput?: boolean
  /** 是否显示欢迎区域 */
  showWelcome?: boolean
  /** 类名 */
  className?: string
}

export function ChatSkeleton({
  messageCount = 3,
  showInput = true,
  showWelcome = false,
  className,
}: ChatSkeletonProps) {
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {showWelcome ? (
          // 欢迎区域骨架
          <div className="flex flex-col items-center justify-center h-full">
            <Skeleton.Avatar active size={64} className="mb-4" />
            <Skeleton.Input active size="default" className="w-48 mb-2" />
            <Skeleton.Input active size="small" className="w-64 mb-6" />
            <div className="flex gap-2">
              <Skeleton.Button active size="small" className="w-32" />
              <Skeleton.Button active size="small" className="w-32" />
              <Skeleton.Button active size="small" className="w-32" />
            </div>
          </div>
        ) : (
          // 消息列表骨架
          <>
            {Array.from({ length: messageCount }).map((_, index) => (
              <div
                key={index}
                className={`flex ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${index % 2 === 0 ? 'items-end' : 'items-start'}`}
                >
                  <Skeleton
                    active
                    paragraph={{
                      rows: Math.floor(Math.random() * 2) + 1,
                      width: ['100%', '80%'],
                    }}
                    className={
                      index % 2 === 0
                        ? '[&_.ant-skeleton-content]:text-right'
                        : ''
                    }
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 输入区域骨架 */}
      {showInput && (
        <div className="flex-shrink-0 border-t bg-white px-4 py-3">
          <div className="flex items-end gap-2">
            <Skeleton.Button active size="small" className="w-9 h-9" />
            <Skeleton.Input active className="flex-1" />
            <Skeleton.Button active size="default" className="w-16" />
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatSkeleton
