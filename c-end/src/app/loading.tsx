/**
 * 全局加载页面
 * 页面路由切换时显示
 */

'use client'

import { Spin } from 'antd'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <Spin size="large" />
      <p className="mt-4 text-gray-400 text-sm">加载中...</p>
    </div>
  )
}
