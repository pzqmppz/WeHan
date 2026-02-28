/**
 * 学校端 - 个人信息页面
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Form, Input, Button, Spin, Typography, Row, Col, Avatar, Divider, Tag
} from 'antd'
import {
  SaveOutlined, ReloadOutlined, UserOutlined,
  MailOutlined, PhoneOutlined, BankOutlined,
  EnvironmentOutlined, CheckCircleOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography

interface SchoolInfo {
  id: string
  name: string
  type: string
  level: string
  address: string | null
  contactName: string | null
  contactPhone: string | null
  verified: boolean
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  schoolManagedId: string | null
  School: SchoolInfo | null
}

export default function SchoolProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // 获取用户信息
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/me')
      const data = await res.json()

      if (data.success) {
        setProfile(data.data)
        form.setFieldsValue({
          name: data.data.name,
          phone: data.data.phone,
        })
      } else {
        // 如果 API 不存在，使用 session 数据
        if (session?.user) {
          form.setFieldsValue({
            name: session.user.name,
            phone: (session.user as any).phone || '',
          })
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
      // 使用 session 数据作为后备
      if (session?.user) {
        form.setFieldsValue({
          name: session.user.name,
          phone: (session.user as any).phone || '',
        })
      }
    } finally {
      setLoading(false)
    }
  }, [form, session])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, fetchProfile])

  // 处理 session 加载状态
  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="school">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  // 未登录
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/school/profile')
    return null
  }

  // 保存用户信息
  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      const res = await fetch('/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (data.success) {
        setProfile(data.data)
        form.setFieldsValue({
          name: data.data.name,
          phone: data.data.phone,
        })
        // 使用 window.alert 因为 App.useApp() 需要父级 App 组件
        window.alert('保存成功')
      } else {
        window.alert(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Save profile error:', error)
      window.alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 重置表单
  const handleReset = () => {
    if (profile) {
      form.setFieldsValue({
        name: profile.name,
        phone: profile.phone,
      })
    } else if (session?.user) {
      form.setFieldsValue({
        name: session.user.name,
        phone: (session.user as any).phone || '',
      })
    }
  }

  // 从 session 获取学校名称
  const schoolName = profile?.School?.name || session?.user?.name?.replace('就业办', '') || '学校'

  return (
    <DashboardLayout role="school">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="!mb-2">个人信息</Title>
          <Text type="secondary">管理您的账户信息</Text>
        </div>
        {profile?.School?.verified && (
          <Tag icon={<CheckCircleOutlined />} color="success">
            学校已认证
          </Tag>
        )}
      </div>

      <Row gutter={24}>
        {/* 可编辑的个人信息 */}
        <Col xs={24} lg={12}>
          <Card title="账户信息" className="mb-4">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入姓名" />
              </Form.Item>

              <Form.Item label="邮箱">
                <Input
                  prefix={<MailOutlined />}
                  value={session?.user?.email || ''}
                  disabled
                  className="bg-gray-50"
                />
                <Text type="secondary" className="text-xs">邮箱不可修改</Text>
              </Form.Item>

              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="请输入联系电话" />
              </Form.Item>

              <Divider />

              <div className="flex justify-end gap-3">
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={saving}>
                  保存更改
                </Button>
              </div>
            </Form>
          </Card>
        </Col>

        {/* 只读的学校信息 */}
        <Col xs={24} lg={12}>
          <Card title="关联学校" className="mb-4">
            <div className="text-center mb-6">
              <Avatar
                size={80}
                icon={<BankOutlined />}
                className="bg-blue-500 mb-4"
              />
              <Title level={4} className="!mb-2">{schoolName}</Title>
              {profile?.School?.verified ? (
                <Tag color="success">已认证</Tag>
              ) : (
                <Tag color="warning">待认证</Tag>
              )}
            </div>

            <Divider />

            <div className="space-y-4">
              <div className="flex justify-between">
                <Text type="secondary">学校类型</Text>
                <Text>{profile?.School?.type || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">学校级别</Text>
                <Text>{profile?.School?.level || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">学校地址</Text>
                <Text>{profile?.School?.address || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">联系人</Text>
                <Text>{profile?.School?.contactName || '-'}</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">联系电话</Text>
                <Text>{profile?.School?.contactPhone || '-'}</Text>
              </div>
            </div>

            <Divider />

            <Text type="secondary" className="text-xs">
              学校信息由管理员审核，如需修改请联系平台管理员
            </Text>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
