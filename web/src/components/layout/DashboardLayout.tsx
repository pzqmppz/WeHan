/**
 * Dashboard 布局
 * 包含侧边栏 + 头部 + 内容区
 */

'use client'

import React, { useState } from 'react'
import { Layout, theme, Spin } from 'antd'
import { DashboardSider } from './DashboardSider'
import { DashboardHeader } from './DashboardHeader'
import type { UserRole } from './menuConfig'
import { useRoleGuard } from '@/hooks/useRoleGuard'

const { Content } = Layout

interface DashboardLayoutProps {
  children: React.ReactNode
  role: UserRole
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

  const { isLoading, userName } = useRoleGuard(role)

  // 角色验证中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" description="加载中..." />
      </div>
    )
  }

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <DashboardSider
        role={role}
        collapsed={collapsed}
      />

      {/* 主内容区 */}
      <Layout>
        {/* 头部 */}
        <DashboardHeader
          role={role}
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          userName={userName}
        />

        {/* 内容 */}
        <Content
          className="m-6 p-6"
          style={{
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
