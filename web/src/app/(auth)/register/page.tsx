'use client'

import React from 'react'
import Link from 'next/link'
import { Form, Input, Button, Card, Typography, Select, Steps } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons'

const { Title, Text } = Typography

const registerTypes = [
  { value: 'enterprise', label: '企业注册', icon: <BankOutlined /> },
  { value: 'school', label: '学校注册', icon: <BankOutlined /> },
]

export default function RegisterPage() {
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = React.useState(0)

  const handleSubmit = async (values: any) => {
    console.log('Register values:', values)
    // TODO: 实现注册逻辑
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <Card className="w-full max-w-lg shadow-lg">
        <div className="text-center mb-8">
          <Link href="/">
            <Title level={2} className="!mb-2 !text-primary cursor-pointer">
              才聚江城
            </Title>
          </Link>
          <Text type="secondary">创建您的账号</Text>
        </div>

        <Steps
          current={currentStep}
          size="small"
          className="mb-8"
          items={[
            { title: '选择类型' },
            { title: '填写信息' },
            { title: '完成' },
          ]}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {currentStep === 0 && (
            <>
              <Form.Item
                name="type"
                rules={[{ required: true, message: '请选择注册类型' }]}
              >
                <Select
                  size="large"
                  placeholder="选择注册类型"
                  options={registerTypes}
                />
              </Form.Item>
              <Button
                type="primary"
                size="large"
                block
                onClick={() => setCurrentStep(1)}
              >
                下一步
              </Button>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Form.Item
                name="name"
                rules={[{ required: true, message: '请输入企业/学校名称' }]}
              >
                <Input
                  size="large"
                  prefix={<BankOutlined />}
                  placeholder="企业/学校名称"
                />
              </Form.Item>

              <Form.Item
                name="contactName"
                rules={[{ required: true, message: '请输入联系人姓名' }]}
              >
                <Input
                  size="large"
                  prefix={<UserOutlined />}
                  placeholder="联系人姓名"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined />}
                  placeholder="联系电话"
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
                  prefix={<MailOutlined />}
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

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次密码不一致'))
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="确认密码"
                />
              </Form.Item>

              <div className="flex gap-4">
                <Button size="large" onClick={() => setCurrentStep(0)}>
                  上一步
                </Button>
                <Button type="primary" size="large" block htmlType="submit">
                  提交注册
                </Button>
              </div>
            </>
          )}
        </Form>

        <div className="text-center mt-6">
          <Text type="secondary">
            已有账号？{' '}
            <Link href="/login">
              <Text className="text-primary cursor-pointer">立即登录</Text>
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  )
}
