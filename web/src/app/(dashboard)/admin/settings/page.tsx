'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, Form, Input, Button, message, Spin, Typography, Divider, Space
} from 'antd'
import { SaveOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography

interface SiteConfig {
  name: string
  description: string
  contactEmail: string
  contactPhone: string
}

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (session) {
      fetchConfig()
    }
  }, [session])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/enterprise')
      // 暂时使用模拟数据
      form.setFieldsValue({
        siteName: '才聚江城',
        siteDescription: '武汉人才留汉智能服务平台',
        contactEmail: 'contact@wehan.com',
        contactPhone: '027-12345678',
        icpNumber: '鄂ICP备XXXXXXXX号',
      })
    } catch (error) {
      console.error('Fetch config error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (values: any) => {
    setSaveLoading(true)
    try {
      // TODO: 实现保存配置 API
      await new Promise((resolve) => setTimeout(resolve, 1000))
      message.success('配置已保存')
    } catch (error) {
      message.error('保存失败')
    } finally {
      setSaveLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin/settings')
    return null
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Title level={4} className="!mb-2">系统设置</Title>
        <Text type="secondary">管理平台基础配置</Text>
      </div>

      <Card loading={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          className="max-w-2xl"
        >
          <Title level={5}>网站信息</Title>

          <Form.Item
            name="siteName"
            label="网站名称"
            rules={[{ required: true, message: '请输入网站名称' }]}
          >
            <Input placeholder="请输入网站名称" maxLength={50} />
          </Form.Item>

          <Form.Item
            name="siteDescription"
            label="网站描述"
            rules={[{ required: true, message: '请输入网站描述' }]}
          >
            <Input.TextArea
              placeholder="请输入网站描述"
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>

          <Divider />

          <Title level={5}>联系方式</Title>

          <Form.Item
            name="contactEmail"
            label="联系邮箱"
            rules={[
              { required: true, message: '请输入联系邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入联系邮箱" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>

          <Divider />

          <Title level={5}>备案信息</Title>

          <Form.Item name="icpNumber" label="ICP 备案号">
            <Input placeholder="请输入 ICP 备案号" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={saveLoading}
              >
                保存配置
              </Button>
              <Button onClick={() => form.resetFields()}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </DashboardLayout>
  )
}
