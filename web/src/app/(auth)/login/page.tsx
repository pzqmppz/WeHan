'use client'

import React, { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Form, Input, Button, Card, Typography, App, Spin, Alert } from 'antd'
import { UserOutlined, LockOutlined, LoadingOutlined } from '@ant-design/icons'
import { signIn, useSession } from 'next-auth/react'
import { useState } from 'react'

const { Title, Text } = Typography

// 角色到默认路径的映射
const roleToPath: Record<string, string> = {
  ENTERPRISE: '/enterprise',
  GOVERNMENT: '/government',
  SCHOOL: '/school',
  ADMIN: '/admin',
  STUDENT: '/',
}

// 错误消息映射
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  ACCOUNT_DISABLED: {
    title: '账号已被禁用',
    description: '您的账号已被服务管理员关闭，请联系管理员',
  },
  ACCOUNT_PENDING: {
    title: '账号待审核',
    description: '您的账号正在审核中，请耐心等待管理员审核',
  },
  ACCOUNT_REJECTED: {
    title: '账号审核未通过',
    description: '您的账号审核未通过，请联系管理员了解详情',
  },
  DEFAULT: {
    title: '登录失败',
    description: '邮箱或密码错误，请检查后重试',
  },
}

interface LoginFormData {
  email: string
  password: string
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')
  const errorParam = searchParams.get('error')
  const [form] = Form.useForm<LoginFormData>()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()
  const { data: session, update } = useSession()

  // 获取错误信息
  const errorInfo = errorParam ? (ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.DEFAULT) : null

  // 根据用户角色跳转到对应页面
  const redirectByRole = (role: string) => {
    const targetPath = callbackUrl || roleToPath[role] || '/enterprise'
    router.push(targetPath)
    router.refresh()
  }

  const handleSubmit = async (values: LoginFormData) => {
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (result?.error) {
        // 检查是否是账号状态错误
        const errorCode = result.error
        if (ERROR_MESSAGES[errorCode]) {
          // 重定向到登录页面并显示错误
          router.push(`/login?error=${errorCode}`)
          setLoading(false)
          return
        }
        message.error('登录失败：邮箱或密码错误')
        setLoading(false)
        return
      }

      if (result?.ok) {
        message.success('登录成功，正在跳转...')
        // 强制刷新 session
        await update()
        // 重新获取 session 来确定角色（禁用缓存）
        const res = await fetch('/api/auth/session', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        const sessionData = await res.json()
        const role = sessionData?.user?.role || 'ENTERPRISE'
        // 使用 window.location.href 强制刷新页面，避免缓存问题
        const targetPath = callbackUrl || roleToPath[role] || '/enterprise'
        window.location.href = targetPath
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

      {errorInfo && (
        <Alert
          message={errorInfo.title}
          description={errorInfo.description}
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
