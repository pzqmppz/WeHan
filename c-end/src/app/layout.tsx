import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import { ConfigProvider } from 'antd'
import './globals.css'

export const metadata: Metadata = {
  title: 'WeHan - 武汉人才求职助手',
  description: '武汉高校人才留汉智能服务平台',
}

// 设计系统配色 - 年轻活力版
const designTokens = {
  // Primary: 翡翠绿
  colorPrimary: '#059669',
  colorPrimaryHover: '#10B981',
  colorPrimaryActive: '#047857',
  // Secondary: 深蓝
  colorInfo: '#1E3A5F',
  // Success: 绿色
  colorSuccess: '#059669',
  // Warning: 橙色
  colorWarning: '#F97316',
  // Error: 红色
  colorError: '#DC2626',
  // Background
  colorBgContainer: '#FFFFFF',
  colorBgLayout: '#FAFAFA',
  colorBgElevated: '#FFFFFF',
  // Text
  colorText: '#0A0A0A',
  colorTextSecondary: '#525252',
  colorTextTertiary: '#A3A3A3',
  colorTextQuaternary: '#D4D4D4',
  // Border
  colorBorder: '#E5E5E5',
  colorBorderSecondary: '#F5F5F5',
  // Border Radius - 减少圆角
  borderRadius: 8,
  borderRadiusLG: 12,
  borderRadiusSM: 4,
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
