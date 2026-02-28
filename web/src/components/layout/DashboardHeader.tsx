/**
 * Dashboard 头部
 */

'use client'

import React from 'react'
import { Layout, Avatar, Dropdown, Button } from 'antd'
import { UserOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { roleNames, type UserRole } from './menuConfig'
import { signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const { Header } = Layout

interface DashboardHeaderProps {
  role: UserRole
  collapsed: boolean
  onToggle: () => void
  userName?: string
}

export function DashboardHeader({ role, collapsed, onToggle, userName }: DashboardHeaderProps) {
  const router = useRouter()
  const { data: session } = useSession()

  const handleMenuClick: MenuProps['onClick'] = async ({ key }) => {
    if (key === 'logout') {
      if (window.confirm('确定要退出登录吗？')) {
        // 先清除 NextAuth session
        await signOut({ redirect: false })
        // 强制刷新页面，清除所有缓存
        window.location.href = '/login'
      }
    } else if (key === 'profile') {
      // 根据角色跳转到对应的设置页面
      const profilePath = `/${role.toLowerCase()}/profile`
      router.push(profilePath)
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
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

  const displayName = userName || session?.user?.name || roleNames[role] || '用户'

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
        <Dropdown
          menu={{ items: userMenuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
            <Avatar icon={<UserOutlined />} className="bg-blue-500" />
            <span className="text-gray-700">{displayName}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}
