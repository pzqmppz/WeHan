'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BarChartOutlined,
  BankOutlined,
  SolutionOutlined,
  NotificationOutlined,
  AuditOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'

const { Header, Sider, Content } = Layout

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'enterprise' | 'government' | 'school' | 'admin'
}

const menuItems: Record<string, MenuProps['items']> = {
  enterprise: [
    {
      key: '/dashboard/enterprise',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard/enterprise">首页概览</Link>,
    },
    {
      key: '/dashboard/enterprise/jobs',
      icon: <FileTextOutlined />,
      label: <Link href="/dashboard/enterprise/jobs">岗位管理</Link>,
    },
    {
      key: '/dashboard/enterprise/talent',
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/enterprise/talent">人才库</Link>,
    },
    {
      key: '/dashboard/enterprise/profile',
      icon: <BankOutlined />,
      label: <Link href="/dashboard/enterprise/profile">企业信息</Link>,
    },
  ],
  government: [
    {
      key: '/dashboard/government',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard/government">留汉指数</Link>,
    },
    {
      key: '/dashboard/government/policies',
      icon: <NotificationOutlined />,
      label: <Link href="/dashboard/government/policies">政策管理</Link>,
    },
    {
      key: '/dashboard/government/statistics',
      icon: <BarChartOutlined />,
      label: <Link href="/dashboard/government/statistics">数据统计</Link>,
    },
  ],
  school: [
    {
      key: '/dashboard/school',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard/school">就业看板</Link>,
    },
    {
      key: '/dashboard/school/push',
      icon: <NotificationOutlined />,
      label: <Link href="/dashboard/school/push">岗位推送</Link>,
    },
    {
      key: '/dashboard/school/students',
      icon: <SolutionOutlined />,
      label: <Link href="/dashboard/school/students">学生管理</Link>,
    },
  ],
  admin: [
    {
      key: '/dashboard/admin',
      icon: <DashboardOutlined />,
      label: <Link href="/dashboard/admin">系统概览</Link>,
    },
    {
      key: '/dashboard/admin/jobs',
      icon: <FileTextOutlined />,
      label: <Link href="/dashboard/admin/jobs">岗位管理</Link>,
    },
    {
      key: '/dashboard/admin/policies',
      icon: <NotificationOutlined />,
      label: <Link href="/dashboard/admin/policies">政策管理</Link>,
    },
    {
      key: '/dashboard/admin/enterprises',
      icon: <BankOutlined />,
      label: <Link href="/dashboard/admin/enterprises">企业管理</Link>,
    },
    {
      key: '/dashboard/admin/schools',
      icon: <AuditOutlined />,
      label: <Link href="/dashboard/admin/schools">学校管理</Link>,
    },
    {
      key: '/dashboard/admin/users',
      icon: <TeamOutlined />,
      label: <Link href="/dashboard/admin/users">用户管理</Link>,
    },
    {
      key: '/dashboard/admin/settings',
      icon: <SettingOutlined />,
      label: <Link href="/dashboard/admin/settings">系统设置</Link>,
    },
  ],
}

const roleNames: Record<string, string> = {
  enterprise: '企业端',
  government: '政府端',
  school: '学校端',
  admin: '管理员',
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()

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
    <Layout className="min-h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="!bg-white shadow-sm"
        width={240}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-100">
          <Link href="/" className="text-xl font-bold text-primary">
            {collapsed ? '才' : '才聚江城'}
          </Link>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems[role]}
          className="border-r-0"
        />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between px-6 !bg-white shadow-sm">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
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
