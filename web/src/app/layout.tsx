import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider, App as AntApp } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  title: '才聚江城 - 武汉人才留汉智能服务平台',
  description: '连接武汉高校人才与本地企业的智能服务平台，帮助武汉大学生留在武汉就业，帮助武汉企业找到本地人才',
  keywords: ['武汉', '人才', '就业', '招聘', '大学生', '留汉'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <SessionProvider>
          <AntdRegistry>
            <ConfigProvider
              locale={zhCN}
              theme={{
                token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
              },
            }}
          >
            <AntApp>
              {children}
            </AntApp>
          </ConfigProvider>
        </AntdRegistry>
      </SessionProvider>
      </body>
    </html>
  )
}
