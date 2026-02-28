/**
 * 门户页脚组件
 * 支持动态配置 ICP 备案号和链接
 */

import React from 'react'
import { Layout } from 'antd'
import Link from 'next/link'

const { Footer } = Layout

interface PortalFooterProps {
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  icpNumber?: string
}

export default function PortalFooter({
  privacyPolicyUrl = '/privacy',
  termsOfServiceUrl = '/terms',
  icpNumber,
}: PortalFooterProps = {}) {
  return (
    <Footer className="text-center !bg-gray-50 border-t border-gray-100">
      <div className="text-gray-500 text-sm">
        <p>© 2026 才聚江城 · 武汉人才留汉智能服务平台</p>
        <p className="mt-1">
          技术支持：WeHan Team |
          <Link href={privacyPolicyUrl} className="text-primary ml-2 hover:underline">
            隐私政策
          </Link> |
          <Link href={termsOfServiceUrl} className="text-primary ml-2 hover:underline">
            使用条款
          </Link>
        </p>
        {icpNumber && (
          <p className="mt-1">
            <a
              href="https://beian.miit.gov.cn/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500"
            >
              {icpNumber}
            </a>
          </p>
        )}
      </div>
    </Footer>
  )
}
