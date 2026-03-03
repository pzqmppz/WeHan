/**
 * 聊天错误边界组件
 * 捕获子组件错误，显示友好错误提示
 */

'use client'

import { Component, ReactNode } from 'react'
import { Result } from 'antd'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 聊天错误边界
 * 用于捕获聊天组件中的错误， */
export class ChatErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
    }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // 调用错误回调
    this.props.onError?.(error, errorInfo)

    // 开发环境下输出错误信息
    if (process.env.NODE_ENV === 'development') {
      console.error('ChatErrorBoundary caught:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleRetry = () => {
    // 重置错误状态，    this.handleReset()
    // 刷新页面
    window.location.reload()
  }

  render() {
    const { hasError, error } = this.state
    const { fallback } = this.props

    if (hasError) {
      // 如果提供了自定义 fallback，使用它
      if (fallback) {
        return fallback
      }

      // 默认错误 UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6">
          <Result
            status="error"
            title="聊天出错了"
            subTitle={error?.message || '发生了未知错误，请稍后重试'}
            extra={[
              <div className="flex gap-3">
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  重新加载
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                >
                  重试
                </button>
              </div>,
            ]}
          />
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * 函数式错误边界包装器
 */
export function withChatErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P> {
  return class WithErrorBoundary extends Component<P> {
    constructor(props: P) {
      super(props)
    }

    render() {
      return (
        <ChatErrorBoundary>
          <WrappedComponent {...this.props} />
        </ChatErrorBoundary>
      )
    }
  }
}

export default ChatErrorBoundary
