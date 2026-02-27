'use client'

import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Card, Typography, App, Spin, Alert } from 'antd'
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

const { Title, Text } = Typography

interface LoginFormData {
  email: string
  password: string
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/enterprise'
  const errorParam = searchParams.get('error')
  const [form] = Form.useForm<LoginFormData>()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()

  // 显示 URL 中的错误
  useEffect(() => {
    if (errorParam) {
      message.error('登录失败：邮箱或密码错误')
    }
  }, [errorParam, message])

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        message.error('登录失败：邮箱或密码错误')
        setLoading(false)
        return
      }

      if (result?.ok) {
        message.success('登录成功，正在跳转...')
        // 使用 router.push 进行客户端导航
        router.push(callbackUrl)
        router.refresh()
        return
      }

      message.warning('登录状态未知')
      setLoading(false)

    } catch (error) {
      console.error('Login error:', error)
      message.error('登录过程发生错误')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <div className="text-center mb-6">
        <Link href="/">
          <Title level={2} className="!mb-2 cursor-pointer hover:opacity-80 transition-opacity !text-blue-600">
            才聚江城
          </Title>
        </Link>
        <Text type="secondary">武汉人才留汉智能服务平台</Text>
      </div>

      {errorParam && (
        <Alert
          message="登录失败"
          description="邮箱或密码错误，请检查后重试"
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Form<LoginFormData>
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ email: 'admin@wehan.com', password: 'admin123' }}
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        >
          <Input
            size="large"
            prefix={<UserOutlined />}
            placeholder="邮箱"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码至少6位' },
          ]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="密码"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            icon={loading ? <LoadingOutlined /> : undefined}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center text-gray-400 text-sm mt-4">
        <Text type="secondary">
          测试账号: admin@wehan.com / admin123
        </Text>
      </div>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <App>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
        <Suspense fallback={
          <div className="text-center">
            <Spin size="large" />
          </div>
        }>
          <LoginForm />
        </Suspense>
      </div>
    </App>
  )
}
