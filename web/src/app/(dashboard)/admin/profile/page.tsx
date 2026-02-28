/**
 * 管理员端 - 个人信息页面
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Form, Input, Button, Spin, Typography, Row, Col, Avatar, Divider, Tag
} from 'antd'
import {
  SaveOutlined, ReloadOutlined, UserOutlined,
  MailOutlined, PhoneOutlined, SettingOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
}

export default function AdminProfilePage() {
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
        if (session?.user) {
          form.setFieldsValue({
            name: session.user.name,
            phone: (session.user as any).phone || '',
          })
        }
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
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

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin/profile')
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

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Title level={4} className="!mb-2">个人信息</Title>
        <Text type="secondary">管理您的账户信息</Text>
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
                <Text type="secondary" className="text-xs">管理员邮箱不可修改</Text>
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

        {/* 账户信息概览 */}
        <Col xs={24} lg={12}>
          <Card title="账户概览" className="mb-4">
            <div className="text-center mb-6">
              <Avatar
                size={80}
                icon={<SettingOutlined />}
                className="bg-red-500 mb-4"
              />
              <Title level={4} className="!mb-2">{profile?.name || session?.user?.name || '管理员'}</Title>
              <Tag color="red">系统管理员</Tag>
            </div>

            <Divider />

            <div className="space-y-4">
              <div className="flex justify-between">
                <Text type="secondary">账户角色</Text>
                <Text>系统管理员</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">账户状态</Text>
                <Text type="success">正常</Text>
              </div>
              <div className="flex justify-between">
                <Text type="secondary">注册邮箱</Text>
                <Text>{session?.user?.email || '-'}</Text>
              </div>
            </div>

            <Divider />

            <div className="bg-yellow-50 p-4 rounded">
              <Text type="warning" className="text-sm">
                管理员账户拥有系统最高权限，请妥善保管账户信息
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
