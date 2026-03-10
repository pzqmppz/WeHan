/**
 * 通用页面头部组件
 * 统一页面标题和操作按钮
 */

'use client'

import React from 'react'
import { Typography, Space, Button, Divider } from 'antd'
import { ReloadOutlined, PlusOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

interface PageHeaderProps {
  /** 页面标题 */
  title: React.ReactNode
  /** 副标题/描述 */
  subtitle?: string
  /** 操作按钮区域 */
  extra?: React.ReactNode
  /** 是否显示刷新按钮 */
  showReload?: boolean
  /** 刷新回调 */
  onReload?: () => void
  /** 是否显示底部分割线 */
  showDivider?: boolean
  /** 自定义类名 */
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  extra,
  showReload = false,
  onReload,
  showDivider = true,
  className,
}: PageHeaderProps) {
  return (
    <>
      <div className={`flex items-center justify-between mb-6 ${className || ''}`}>
        <div className="animate-fade-in">
          <Title level={4} className="!mb-0 !text-2xl">
            {title}
          </Title>
          {subtitle && (
            <Text type="secondary" className="mt-1 block">
              {subtitle}
            </Text>
          )}
        </div>
        <Space size="small">
          {showReload && onReload && (
            <Button
              icon={<ReloadOutlined />}
              onClick={onReload}
              type="text"
              className="button-press"
            >
              刷新
            </Button>
          )}
          {extra}
        </Space>
      </div>
      {showDivider && <Divider className="!mb-6" />}
    </>
  )
}

/**
 * 带创建按钮的页面头部
 */
export function PageHeaderWithCreate({
  title,
  subtitle,
  createText = '新建',
  onCreate,
  showReload = false,
  onReload,
}: {
  title: React.ReactNode
  subtitle?: string
  createText?: string
  onCreate: () => void
  showReload?: boolean
  onReload?: () => void
}) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      showReload={showReload}
      onReload={onReload}
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreate}
          className="button-press"
        >
          {createText}
        </Button>
      }
    />
  )
}
