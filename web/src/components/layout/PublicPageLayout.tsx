'use client'

import React from 'react'
import { PublicHeader, PortalFooter } from '@/components/layout'

interface PublicPageLayoutProps {
  children: React.ReactNode
  /** 是否显示页脚 */
  showFooter?: boolean
  /** 页面背景色 */
  bgClassName?: string
  /** 页脚 ICP 备案号（可选） */
  icpNumber?: string
}

/**
 * PublicPageLayout - 统一的公共页面布局容器
 *
 * 包含统一的顶部导航栏、内容区和可选的页脚
 * 用于所有未登录用户可访问的页面
 */
export default function PublicPageLayout({
  children,
  showFooter = true,
  bgClassName = 'bg-white',
  icpNumber,
}: PublicPageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${bgClassName}`}>
      {/* 统一顶部导航 */}
      <PublicHeader />

      {/* 主内容区 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 可选页脚 */}
      {showFooter && <PortalFooter icpNumber={icpNumber} />}
    </div>
  )
}
