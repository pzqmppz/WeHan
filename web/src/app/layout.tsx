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
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        {/* Skip link for keyboard navigation - WCAG 2.1 AA 2.4.1 */}
        <a href="#main-content" className="skip-link">
          跳转到主内容
        </a>

        <SessionProvider>
          <AntdRegistry>
            <ConfigProvider
              locale={zhCN}
              theme={{
                token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
                // Ensure focus outline is visible
                controlOutlineWidth: 2,
              },
            }}
            >
              <AntApp>
                <main id="main-content" tabIndex={-1}>
                  {children}
                </main>
              </AntApp>
            </ConfigProvider>
          </AntdRegistry>
        </SessionProvider>
      </body>
    </html>
  )
}
