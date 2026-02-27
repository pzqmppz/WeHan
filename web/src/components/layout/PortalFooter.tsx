import React from 'react'
import { Layout } from 'antd'

const { Footer } = Layout

export default function PortalFooter() {
  return (
    <Footer className="text-center !bg-gray-50 border-t border-gray-100">
      <div className="text-gray-500 text-sm">
        <p>© 2026 才聚江城 · 武汉人才留汉智能服务平台</p>
        <p className="mt-1">
          技术支持：WeHan Team |
          <a href="#" className="text-primary ml-2">隐私政策</a> |
          <a href="#" className="text-primary ml-2">使用条款</a>
        </p>
      </div>
    </Footer>
  )
}
