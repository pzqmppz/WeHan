'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Form, Input, Button, Card, Typography, Select, Steps, message, Alert } from 'antd'
import {
  UserOutlined,
  LockOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  ReadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'

const { Title, Text, Paragraph } = Typography

const registerTypes = [
  {
    value: 'STUDENT',
    label: '学生注册',
    icon: <ReadOutlined />,
    description: '我是学生，想找实习或工作'
  },
  {
    value: 'ENTERPRISE',
    label: '企业注册',
    icon: <BankOutlined />,
    description: '我是企业HR，想招聘人才'
  },
  {
    value: 'SCHOOL',
    label: '学校注册',
    icon: <BankOutlined />,
    description: '我是学校老师，想管理学生就业'
  },
]

export default function RegisterPage() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [registerType, setRegisterType] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          type: registerType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        message.success(data.message || '注册成功！')

        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        message.error(data.error || '注册失败，请稍后重试')
      }
    } catch (error) {
      console.error('Register error:', error)
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeSelect = (type: string) => {
    setRegisterType(type)
    setCurrentStep(1)
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
        <Card className="w-full max-w-md text-center shadow-lg">
          <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
          <Title level={3} className="!mb-2">
            注册成功！
          </Title>
          <Paragraph type="secondary" className="!mb-4">
            {registerType === 'STUDENT'
              ? '直接登录，即可浏览岗位并投递简历'
              : '需要管理员审核，审核通过后可发布岗位或管理学生'
            }
          </Paragraph>
          <Text type="secondary">正在跳转到登录页...</Text>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8 sm:py-12 px-4">
      <Card className="w-full max-w-2xl shadow-sm sm:shadow-lg">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/">
            <Title level={2} className="!mb-1 sm:!mb-2 !text-blue-600 cursor-pointer !text-2xl sm:!text-3xl">
              才聚江城
            </Title>
          </Link>
          <Text type="secondary" className="text-sm sm:text-base">创建您的账号</Text>
        </div>

        {/* 进度指示 */}
        <div className="mb-6 sm:mb-8">
          <Steps
            current={currentStep}
            size="small"
            items={[
              { title: '选择类型' },
              { title: '填写信息' },
              { title: '完成' },
            ]}
            className="hidden sm:block"
          />
          {/* 移动端简化进度 */}
          <div className="sm:hidden flex justify-center items-center gap-2 text-sm text-gray-500">
            <span className={currentStep >= 0 ? 'text-blue-600 font-medium' : ''}>选择类型</span>
            <span>{'>'}</span>
            <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : ''}>填写信息</span>
            <span>{'>'}</span>
            <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : ''}>完成</span>
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {currentStep === 0 && (
            <div className="space-y-4">
              <Title level={4} className="!mb-4 sm:!mb-6 !text-lg sm:!text-xl">请选择账号类型</Title>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {registerTypes.map((type) => (
                  <Card
                    key={type.value}
                    hoverable
                    className="text-center cursor-pointer transition-all hover:shadow-md hover:border-blue-400"
                    onClick={() => handleTypeSelect(type.value)}
                    styles={{ body: { padding: '16px sm:px-6 sm:py-6' } }}
                  >
                    <div className="text-3xl sm:text-4xl text-blue-600 mb-2 sm:mb-3">
                      {type.icon}
                    </div>
                    <div className="font-medium mb-1 sm:mb-2 text-sm sm:text-base">{type.label}</div>
                    <Text type="secondary" className="text-xs sm:text-xs">
                      {type.description}
                    </Text>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-6">
                <Text type="secondary">
                  已有账号？{' '}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    立即登录
                  </Link>
                </Text>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <>
              {/* 企业/学校注册 */}
              {(registerType === 'ENTERPRISE' || registerType === 'SCHOOL') && (
                <>
                  <Form.Item
                    name="organizationName"
                    label={registerType === 'ENTERPRISE' ? '企业名称' : '学校名称'}
                    rules={[{ required: true, message: `请输入${registerType === 'ENTERPRISE' ? '企业' : '学校'}名称` }]}
                  >
                    <Input
                      size="large"
                      prefix={<BankOutlined />}
                      placeholder={registerType === 'ENTERPRISE' ? '请输入企业全称' : '请输入学校全称'}
                    />
                  </Form.Item>

                  {registerType === 'ENTERPRISE' && (
                    <>
                      <Form.Item
                        name="industry"
                        label="所属行业"
                        rules={[{ required: true, message: '请选择所属行业' }]}
                      >
                        <Select
                          size="large"
                          placeholder="请选择所属行业"
                          options={[
                            { label: '互联网/IT', value: '互联网/IT' },
                            { label: '智能制造', value: '智能制造' },
                            { label: '金融', value: '金融' },
                            { label: '教育', value: '教育' },
                            { label: '医疗', value: '医疗' },
                            { label: '其他', value: '其他' },
                          ]}
                        />
                      </Form.Item>

                      <Form.Item
                        name="scale"
                        label="企业规模"
                        rules={[{ required: true, message: '请选择企业规模' }]}
                      >
                        <Select
                          size="large"
                          placeholder="请选择企业规模"
                          options={[
                            { label: '1-49人', value: '1-49' },
                            { label: '50-199人', value: '50-199' },
                            { label: '200-499人', value: '200-499' },
                            { label: '500-999人', value: '500-999' },
                            { label: '1000人以上', value: '1000+' },
                          ]}
                        />
                      </Form.Item>
                    </>
                  )}

                  <Form.Item
                    name="contactName"
                    label="联系人姓名"
                    rules={[{ required: true, message: '请输入联系人姓名' }]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined />}
                      placeholder="请输入联系人姓名"
                    />
                  </Form.Item>
                </>
              )}

              {/* 学生注册 */}
              {registerType === 'STUDENT' && (
                <>
                  <Alert
                    message="学生账号说明"
                    description="学生账号可以直接使用，无需审核。如需绑定学校信息，请联系学校管理员。"
                    type="info"
                    showIcon
                    className="mb-4"
                  />

                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true, message: '请输入您的姓名' }]}
                  >
                    <Input
                      size="large"
                      prefix={<UserOutlined />}
                      placeholder="请输入您的真实姓名"
                    />
                  </Form.Item>

                  <Form.Item
                    name="major"
                    label="专业"
                  >
                    <Input
                      size="large"
                      placeholder="请输入您的专业（选填）"
                    />
                  </Form.Item>

                  <Form.Item
                    name="graduationYear"
                    label="毕业年份"
                  >
                    <Select
                      size="large"
                      placeholder="请选择毕业年份（选填）"
                    >
                      {Array.from({ length: 7 }, (_, i) => {
                        const year = new Date().getFullYear() + i
                        return (
                          <Select.Option key={year} value={year}>
                            {year}年
                          </Select.Option>
                        )
                      })}
                    </Select>
                  </Form.Item>
                </>
              )}

              {/* 通用字段 */}
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input
                  size="large"
                  prefix={<PhoneOutlined />}
                  placeholder="请输入手机号"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' },
                ]}
              >
                <Input
                  size="large"
                  prefix={<MailOutlined />}
                  placeholder="请输入邮箱"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[
                  { required: true, message: '请输入密码' },
                  { min: 6, message: '密码至少6位' },
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="请输入密码（至少6位）"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
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
                  placeholder="请再次输入密码"
                />
              </Form.Item>

              <div className="flex gap-3 sm:gap-4">
                <Button
                  size="large"
                  onClick={() => {
                    setCurrentStep(0)
                    setRegisterType(null)
                  }}
                  className="min-h-[44px]"
                >
                  上一步
                </Button>
                <Button
                  type="primary"
                  size="large"
                  block
                  htmlType="submit"
                  loading={loading}
                  className="min-h-[44px]"
                >
                  {loading ? '创建中...' : '创建账号'}
                </Button>
              </div>

              <div className="text-center mt-3 sm:mt-4">
                <Text type="secondary">
                  已有账号？{' '}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    立即登录
                  </Link>
                </Text>
              </div>
            </>
          )}
        </Form>
      </Card>
    </div>
  )
}
