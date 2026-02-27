'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Typography, Select, Space, Divider } from 'antd'
import { UserOutlined, LockOutlined, BankOutlined, AuditOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

const roles = [
  { value: 'enterprise', label: '企业用户' },
  { value: 'school', label: '学校用户' },
  { value: 'government', label: '政府用户' },
  { value: 'admin', label: '管理员' },
]

export default function LoginPage() {
  const router = useRouter()
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    console.log('Login values:', values)
    // TODO: 实现登录逻辑
    const dashboardPath = `/dashboard/${values.role}`
    router.push(dashboardPath)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <Title level={2} className="!mb-2 !text-primary cursor-pointer">
              才聚江城
            </Title>
          </Link>
          <Text type="secondary">武汉人才留汉智能服务平台</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: 'enterprise' }}
        >
          <Form.Item
            name="role"
            rules={[{ required: true, message: '请选择登录身份' }]}
          >
            <Select
              size="large"
              options={roles}
              placeholder="选择登录身份"
            />
          </Form.Item>

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
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block>
              登录
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Space split={<Divider type="vertical" />}>
            <Link href="/register">
              <Text className="text-primary cursor-pointer">注册账号</Text>
            </Link>
            <Link href="#">
              <Text type="secondary">忘记密码</Text>
            </Link>
          </Space>
        </div>
      </Card>
    </div>
  )
}
