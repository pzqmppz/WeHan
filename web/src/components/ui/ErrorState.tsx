/**
 * 通用错误状态组件
 * 统一全站的错误展示
 */

'use client'

import React from 'react'
import { Alert, Button, Space, Typography } from 'antd'
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'

const { Text, Paragraph } = Typography

interface ErrorStateProps {
  /** 错误信息 */
  error: Error | string | null | undefined
  /** 重试回调 */
  onRetry?: () => void
  /** 是否显示返回首页按钮 */
  showHome?: boolean
  /** 自定义错误标题 */
  title?: string
  /** 简洁模式（仅显示错误文字） */
  simple?: boolean
}

export function ErrorState({
  error,
  onRetry,
  showHome = false,
  title = '加载失败',
  simple = false,
}: ErrorStateProps) {
  const router = useRouter()

  // 获取错误信息
  const getErrorMessage = (): string => {
    if (!error) return '未知错误'
    if (typeof error === 'string') return error
    return error.message || '操作失败，请稍后重试'
  }

  const errorMessage = getErrorMessage()

  // 简洁模式 - 用于卡片内
  if (simple) {
    return (
      <Alert
        message={title}
        description={errorMessage}
        type="error"
        showIcon
      />
    )
  }

  // 完整模式
  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <Alert
          message={title}
          description={
            <div className="mt-2">
              <Text type="secondary">{errorMessage}</Text>
            </div>
          }
          type="error"
          showIcon
          className="text-left mb-6"
        />
        <Space size="middle">
          {onRetry && (
            <Button icon={<ReloadOutlined />} onClick={onRetry}>
              重试
            </Button>
          )}
          {showHome && (
            <Button icon={<HomeOutlined />} onClick={() => router.push('/')}>
              返回首页
            </Button>
          )}
        </Space>
      </div>
    </div>
  )
}

/**
 * 快速错误提示 - 用于表单提交等场景
 */
export function InlineError({ message }: { message: string }) {
  return <ErrorState error={message} simple />
}

/**
 * 网络错误专用
 */
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      error="网络连接失败，请检查网络后重试"
      onRetry={onRetry}
      title="网络错误"
    />
  )
}

/**
 * 权限错误专用
 */
export function PermissionError() {
  return (
    <ErrorState
      error="您没有权限访问此页面，如需帮助请联系管理员"
      showHome
      title="权限不足"
    />
  )
}

/**
 * 404 错误专用
 */
export function NotFoundError() {
  return (
    <ErrorState
      error="您访问的页面不存在或已被删除"
      showHome
      title="页面未找到"
    />
  )
}
