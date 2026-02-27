/**
 * Dashboard 头部
 */

'use client'

import React from 'react'
import { Layout, Avatar, Dropdown, Button } from 'antd'
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { roleNames, type UserRole } from './menuConfig'

const { Header } = Layout

interface DashboardHeaderProps {
  role: UserRole
  collapsed: boolean
  onToggle: () => void
}

export function DashboardHeader({ role, collapsed, onToggle }: DashboardHeaderProps) {
  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ]

  return (
    <Header className="flex items-center justify-between px-6 !bg-white shadow-sm">
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        className="text-lg"
      />

      <div className="flex items-center gap-4">
        <span className="text-gray-500 text-sm">{roleNames[role]}</span>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="text-gray-700">管理员</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}
