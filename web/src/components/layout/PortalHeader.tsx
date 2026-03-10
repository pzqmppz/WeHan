'use client'

import React from 'react'
import Link from 'next/link'
import { Layout, Menu, Button, Space, Typography } from 'antd'
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons'

const { Header } = Layout
const { Text } = Typography

export default function PortalHeader() {
  const menuItems = [
    { key: '/', label: <Link href="/">首页</Link> },
    { key: '/jobs', label: <Link href="/jobs">岗位</Link> },
    { key: '/policies', label: <Link href="/policies">政策</Link> },
    { key: '/about', label: <Link href="/about">关于我们</Link> },
  ]

  return (
    <Header className="flex items-center justify-between !bg-white shadow-sm px-8">
      <div className="flex items-center">
        <Link href="/" className="text-xl font-bold text-blue-600 mr-8 hover:text-blue-700 transition-all duration-200">
          才聚江城
        </Link>
        <Menu
          mode="horizontal"
          items={menuItems}
          className="border-0 flex-1"
          style={{ minWidth: 400 }}
        />
      </div>
      <Space size={12}>
        {/* 次要操作 - 文字链接 */}
        <Link href="/login">
          <Button type="text" icon={<LoginOutlined />} className="text-gray-600 hover:text-blue-600 transition-all duration-200">
            登录
          </Button>
        </Link>
        {/* 主要操作 - 实心按钮 */}
        <Link href="/register">
          <Button type="primary" icon={<UserAddOutlined />} className="h-9 px-5 font-medium">
            注册
          </Button>
        </Link>
      </Space>
    </Header>
  )
}
