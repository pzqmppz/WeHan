/**
 * 统一加载指示器
 * 提供多种加载状态展示方式
 */

'use client'

import { Spin, Skeleton, Space, Typography } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

export type LoadingType = 'spinner' | 'skeleton' | 'dots' | 'progress'
export type LoadingSize = 'small' | 'default' | 'large'

interface LoadingIndicatorProps {
  /** 加载类型 */
  type?: LoadingType
  /** 大小 */
  size?: LoadingSize
  /** 提示文字 */
  text?: string
  /** 全屏模式 */
  fullScreen?: boolean
  /** 进度 (0-100) */
  progress?: number
  /** 类名 */
  className?: string
}

/** 尺寸映射 */
const SIZE_MAP = {
  spinner: {
    small: 16,
    default: 24,
    large: 32,
  },
  skeleton: {
    small: { avatar: 24, paragraph: { rows: 1 } },
    default: { avatar: 32, paragraph: { rows: 2 } },
    large: { avatar: 40, paragraph: { rows: 3 } },
  },
}

/** 旋转加载图标 */
const loadingIcon = <LoadingOutlined style={{ fontSize: 16 }} spin />

export function LoadingIndicator({
  type = 'spinner',
  size = 'default',
  text,
  fullScreen = false,
  progress,
  className,
}: LoadingIndicatorProps) {
  // 全屏容器
  const containerClass = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-white/80 z-50'
    : 'flex items-center justify-center'

  // 旋转加载器
  if (type === 'spinner') {
    return (
      <div className={`${containerClass} ${className || ''}`}>
        <Space direction="vertical" align="center" size="small">
          <Spin
            indicator={loadingIcon}
            size={size}
          />
          {text && <Text type="secondary">{text}</Text>}
        </Space>
      </div>
    )
  }

  // 骨架屏
  if (type === 'skeleton') {
    return (
      <div className={className}>
        <Skeleton
          active
          avatar={{ size: SIZE_MAP.skeleton[size].avatar }}
          paragraph={SIZE_MAP.skeleton[size].paragraph}
        />
      </div>
    )
  }

  // 点动画
  if (type === 'dots') {
    return (
      <div className={`${containerClass} ${className || ''}`}>
        <Space direction="vertical" align="center" size="small">
          <div className="flex items-center gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: '0.6s',
                }}
              />
            ))}
          </div>
          {text && <Text type="secondary">{text}</Text>}
        </Space>
      </div>
    )
  }

  // 进度条
  if (type === 'progress') {
    return (
      <div className={`${containerClass} ${className || ''}`}>
        <Space direction="vertical" align="center" size="small" className="w-48">
          <progress
            className="w-full h-2 rounded overflow-hidden"
            value={progress || 0}
            max={100}
          />
          {text && <Text type="secondary">{text}</Text>}
        </Space>
      </div>
    )
  }

  return null
}

export default LoadingIndicator
