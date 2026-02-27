/**
 * Dashboard 侧边栏
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Layout, Menu } from 'antd'
import { menuItems, UserRole } from './menuConfig'

const { Sider } = Layout

interface DashboardSiderProps {
  role: UserRole
  collapsed: boolean
}

export function DashboardSider({ role, collapsed }: DashboardSiderProps) {
  const pathname = usePathname()

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      className="!bg-white shadow-sm"
      width={240}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-gray-100">
        <Link href="/" className="text-xl font-bold text-primary-500">
          {collapsed ? '才' : '才聚江城'}
        </Link>
      </div>

      {/* 菜单 */}
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems[role]}
        className="border-r-0"
      />
    </Sider>
  )
}
