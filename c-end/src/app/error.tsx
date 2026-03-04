/**
 * 全局错误页面
 * 捕获未处理的错误，提供重试选项
 */

'use client'

import { useEffect } from 'react'
import { Result, Button, Typography } from 'antd'
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons'

const { Paragraph, Text } = Typography

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  // 记录错误到控制台（生产环境可上报到监控服务）
  useEffect(() => {
    console.error('[GlobalError]', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <html lang="zh-CN">
      <body className="bg-gray-50">
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <Result
            status="500"
            icon={<BugOutlined className="text-6xl text-red-400" />}
            title={
              <Typography.Title level={3} className="text-gray-800">
                出错了
              </Typography.Title>
            }
            subTitle={
              <div className="text-center">
                <Paragraph className="text-gray-600 mb-2">
                  应用遇到了问题，我们已经在处理了
                </Paragraph>
                {process.env.NODE_ENV === 'development' && (
                  <Paragraph
                    className="text-left bg-gray-100 p-3 rounded text-xs overflow-auto max-w-md"
                    style={{ maxHeight: '120px' }}
                  >
                    <Text type="danger">{error.message}</Text>
                    {error.digest && (
                      <Text type="secondary" className="block mt-1">
                        Error ID: {error.digest}
                      </Text>
                    )}
                  </Paragraph>
                )}
              </div>
            }
            extra={[
              <Button
                key="retry"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={reset}
              >
                重试
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={() => (window.location.href = '/')}
              >
                返回首页
              </Button>,
            ]}
          />
        </div>
      </body>
    </html>
  )
}
