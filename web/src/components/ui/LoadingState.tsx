/**
 * 通用加载状态组件
 * 统一全站的加载展示
 */

'use client'

import React from 'react'
import { Spin, Typography } from 'antd'

const { Text } = Typography

interface LoadingStateProps {
  /** 加载提示文字 */
  message?: string
  /** 容器高度 */
  height?: string | number
  /** 是否显示为卡片内的加载 */
  inline?: boolean
}

export function LoadingState({
  message = '加载中...',
  height = '300px',
  inline = false,
}: LoadingStateProps) {
  if (inline) {
    return (
      <div className="flex items-center justify-center gap-3 py-8 fade-in">
        <Spin size="small" />
        <Text type="secondary">{message}</Text>
      </div>
    )
  }

  return (
    <div
      className="flex flex-col items-center justify-center fade-in"
      style={{ minHeight: height }}
    >
      <Spin size="large" />
      {message && <Text type="secondary" className="mt-3">{message}</Text>}
    </div>
  )
}

/**
 * 简洁版加载 - 用于卡片内
 */
export function LoadingInline() {
  return <LoadingState inline message="" />
}
