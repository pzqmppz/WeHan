/**
 * Dashboard 布局
 * 包含侧边栏 + 头部 + 内容区
 */

'use client'

import React, { useState } from 'react'
import { Layout, theme } from 'antd'
import { DashboardSider } from './DashboardSider'
import { DashboardHeader } from './DashboardHeader'
import type { UserRole } from './menuConfig'

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
