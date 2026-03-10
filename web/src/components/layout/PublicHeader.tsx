'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button, Space } from 'antd'
import { LoginOutlined, UserAddOutlined, MenuOutlined } from '@ant-design/icons'
import { useSession } from 'next-auth/react'

/**
 * PublicHeader - 统一的公共页面导航栏
 * 用于所有未登录用户可访问的页面
 */
export default function PublicHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 主导航菜单项
  const navItems = [
    { key: '/', label: '首页', href: '/' },
    { key: '/jobs', label: '岗位', href: '/jobs' },
    { key: '/policies', label: '政策', href: '/policies' },
    { key: '/about', label: '关于我们', href: '/about' },
  ]

  // 判断当前激活的导航项
  const activeKey = navItems.find(item => {
    if (item.key === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(item.key)
  })?.key || '/'

  // 移动端导航菜单
  const MobileMenu = () => (
    <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
      <div className="px-4 pt-2 pb-4 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.key}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeKey === item.key
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {item.label}
          </Link>
        ))}
        <div className="pt-4 pb-2 border-t border-gray-100">
          {session ? (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              进入工作台
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                登录
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 mt-1 rounded-lg text-sm font-medium bg-blue-600 text-white text-center hover:bg-blue-700"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 flex-shrink-0"
          >
            才聚江城
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(item => (
              <Link
                key={item.key}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  activeKey === item.key
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 右侧操作区 */}
          <div className="flex items-center gap-3">
            {/* 桌面端登录/注册按钮 */}
            <div className="hidden md:flex items-center gap-2">
              {session ? (
                <Link href="/dashboard">
                  <Button type="primary" className="h-9 px-5 font-medium">
                    进入工作台
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      type="text"
                      icon={<LoginOutlined />}
                      className="text-gray-600 hover:text-blue-600 h-9"
                    >
                      登录
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button
                      type="primary"
                      icon={<UserAddOutlined />}
                      className="h-9 px-4 font-medium"
                    >
                      注册
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
              aria-label="Toggle menu"
            >
              <MenuOutlined className="text-xl" />
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        <MobileMenu />
      </div>
    </header>
  )
}
