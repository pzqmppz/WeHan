'use client'

import React from 'react'
import Link from 'next/link'
import { Layout, Menu, Button, Space } from 'antd'
import { LoginOutlined, UserAddOutlined } from '@ant-design/icons'

const { Header } = Layout

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
        <Link href="/" className="text-xl font-bold text-primary mr-8">
          才聚江城
        </Link>
        <Menu
          mode="horizontal"
          items={menuItems}
          className="border-0 flex-1"
          style={{ minWidth: 400 }}
        />
      </div>
      <Space>
        <Link href="/login">
          <Button icon={<LoginOutlined />}>登录</Button>
        </Link>
        <Link href="/register">
          <Button type="primary" icon={<UserAddOutlined />}>
            注册
          </Button>
        </Link>
      </Space>
    </Header>
  )
}
