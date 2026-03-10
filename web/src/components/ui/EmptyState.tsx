/**
 * 通用空状态组件
 * 统一全站的空状态展示
 */

'use client'

import React from 'react'
import { Empty, Button, Typography } from 'antd'
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'

const { Text } = Typography

interface EmptyStateProps {
  /** 空状态描述 */
  description?: string
  /** 操作按钮文字 */
  actionText?: string
  /** 点击操作回调 */
  onAction?: () => void
  /** 是否显示刷新按钮 */
  showReload?: boolean
  /** onReload 回调 */
  onReload?: () => void
  /** 自定义图标 */
  customIcon?: React.ReactNode
  /** 简洁模式（无图标） */
  simple?: boolean
}

export function EmptyState({
  description = '暂无数据',
  actionText,
  onAction,
  showReload = false,
  onReload,
  customIcon,
  simple = false,
}: EmptyStateProps) {
  // 简洁模式 - 用于列表内
  if (simple) {
    return (
      <div className="text-center py-8">
        <Text type="secondary">{description}</Text>
      </div>
    )
  }

  // 完整模式
  return (
    <div className="text-center py-12">
      {customIcon || <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />}
      <Text type="secondary" className="mt-2 block">{description}</Text>
      <div className="mt-4 flex items-center justify-center gap-3">
        {actionText && onAction && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
            {actionText}
          </Button>
        )}
        {showReload && onReload && (
          <Button icon={<ReloadOutlined />} onClick={onReload}>
            刷新
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * 预设空状态 - 常用场景
 */

export function NoData({ description = '暂无数据', onReload }: { description?: string; onReload?: () => void }) {
  return <EmptyState description={description} showReload={!!onReload} onReload={onReload} />
}

export function NoItems({ itemName, onCreate }: { itemName: string; onCreate?: () => void }) {
  return (
    <EmptyState
      description={`还没有任何${itemName}`}
      actionText={onCreate ? `创建${itemName}` : undefined}
      onAction={onCreate}
    />
  )
}

export function NoSearchResults({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      description="没有找到匹配的内容"
      actionText="清除筛选"
      onAction={onReset}
    />
  )
}

export function NoPolicies({ onReload }: { onReload?: () => void }) {
  return <EmptyState description="还没有发布任何政策" showReload={!!onReload} onReload={onReload} />
}

export function NoJobs({ onCreate }: { onCreate?: () => void }) {
  return <EmptyState description="还没有发布任何岗位" actionText="发布岗位" onAction={onCreate} />
}

export function NoApplications({ onReload }: { onReload?: () => void }) {
  return <EmptyState description="还没有收到任何投递" showReload={!!onReload} onReload={onReload} />
}
