/**
 * 会话列表骨架屏
 * 会话列表加载时显示
 */

'use client'

import { Skeleton } from 'antd'

interface ConversationListSkeletonProps {
  /** 会话数量 */
  count?: number
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示底部 */
  showFooter?: boolean
  /** 类名 */
  className?: string
}

export function ConversationListSkeleton({
  count = 5,
  showHeader = true,
  showFooter = true,
  className,
}: ConversationListSkeletonProps) {
  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* 新建按钮区域 */}
      {showHeader && (
        <div className="p-3 border-b">
          <Skeleton.Button active block className="h-9" />
        </div>
      )}

      {/* 会话列表 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-2">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="p-3 rounded-lg hover:bg-[var(--background)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <Skeleton.Input
                  active
                  size="small"
                  className={`w-${index % 2 === 0 ? '32' : '40'}`}
                />
                <Skeleton.Input active size="small" className="w-12" />
              </div>
              <div className="mt-2">
                <Skeleton
                  active
                  paragraph={false}
                  title={{ width: '60%' }}
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 底部统计 */}
      {showFooter && (
        <div className="p-2 border-t text-center">
          <Skeleton.Input active size="small" className="w-20 mx-auto" />
        </div>
      )}
    </div>
  )
}

export default ConversationListSkeleton
