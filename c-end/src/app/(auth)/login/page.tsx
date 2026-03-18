/**
 * 登录页面
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Card, Typography, App } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '@/hooks/useAuth'

const { Title, Text } = Typography

interface LoginFormValues {
  email: string
  password: string
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading } = useAuth()
  const { message } = App.useApp()
  const [error, setError] = useState<string | null>(null)

  // 已登录则跳转首页
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/'
      router.push(redirect)
    }
  }, [isAuthenticated, router, searchParams])

  const handleSubmit = async (values: LoginFormValues) => {
    setError(null)
    const result = await login(values.email, values.password)

    if (result.success) {
      message.success('登录成功')
      const redirect = searchParams.get('redirect') || '/'
      router.push(redirect)
    } else {
      setError(result.error || '登录失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E6F4FF 0%, #F0FDF4 100%)' }}>
      <Card className="w-full max-w-md shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">
              <span style={{ color: 'var(--primary)' }}>We</span>
              <span style={{ color: 'var(--text-primary)' }}>Han</span>
            </h1>
          </Link>
          <Text type="secondary">登录您的求职助手账号</Text>
        </div>

        {/* 登录表单 */}
        <Form layout="vertical" onFinish={handleSubmit} size="large">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="邮箱地址"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="密码"
            />
          </Form.Item>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FFF2F0', color: '#CF1322', border: '1px solid #FFCCC7' }}>
              {error}
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              style={{ height: 44 }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>

        {/* 注册链接 */}
        <div className="text-center mt-4">
          <Text type="secondary">还没有账号？</Text>
          <Link href="/register" className="ml-2" style={{ color: 'var(--primary)' }}>
            立即注册
          </Link>
        </div>

        {/* 访客入口 */}
        <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }} className="text-sm hover:text-[var(--primary)] transition-colors">
            以访客身份继续使用
          </Link>
        </div>
      </Card>
    </div>
  )
}
