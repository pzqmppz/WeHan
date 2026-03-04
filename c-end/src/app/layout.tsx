import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import './globals.css'

export const metadata: Metadata = {
  title: 'WeHan - 武汉人才求职助手',
  description: '武汉高校人才留汉智能服务平台',
}

// 设计系统配色 (ui-ux-pro-max generated)
const designTokens = {
  // Primary: Sky Blue
  colorPrimary: '#0369A1',
  colorPrimaryHover: '#0284C7',
  colorPrimaryActive: '#0369A1',
  // Secondary
  colorInfo: '#0EA5E9',
  // Success/CTA: Green
  colorSuccess: '#22C55E',
  // Background
  colorBgContainer: '#FFFFFF',
  colorBgLayout: '#F0F9FF',
  // Text
  colorText: '#0C4A6E',
  colorTextSecondary: '#475569',
  colorTextTertiary: '#64748B',
  // Border
  colorBorder: '#E2E8F0',
  // Border Radius
  borderRadius: 12,
  borderRadiusLG: 16,
  borderRadiusSM: 8,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        {/* Google Fonts: Poppins + Open Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <AntdRegistry>
          <ConfigProvider
            theme={{
              token: designTokens,
              components: {
                Button: {
                  borderRadius: 8,
                  controlHeight: 40,
                  fontWeight: 500,
                },
                Input: {
                  borderRadius: 8,
                  controlHeight: 44,
                },
                Card: {
                  borderRadiusLG: 16,
                  boxShadowTertiary: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                },
                Drawer: {
                  borderRadiusLG: 16,
                },
              },
            }}
          >
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  )
}
