'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Form, Input, Select, Button, Space, App, Spin,
  Typography, Row, Col, Upload, Avatar, Tag, Divider
} from 'antd'
import {
  SaveOutlined, ReloadOutlined, BuildOutlined,
  MailOutlined, PhoneOutlined, EnvironmentOutlined,
  UploadOutlined, CheckCircleOutlined, ClockCircleOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input

interface EnterpriseProfile {
  id: string
  name: string
  logo: string | null
  industry: string
  scale: string
  description: string | null
  address: string | null
  contactName: string | null
  contactPhone: string | null
  contactEmail: string | null
  businessLicense: string | null
  verified: boolean
}

// 行业选项
const INDUSTRY_OPTIONS = [
  { value: '互联网/IT', label: '互联网/IT' },
  { value: '金融', label: '金融' },
  { value: '制造业', label: '制造业' },
  { value: '教育', label: '教育' },
  { value: '医疗健康', label: '医疗健康' },
  { value: '房地产', label: '房地产' },
  { value: '零售/电商', label: '零售/电商' },
  { value: '物流/供应链', label: '物流/供应链' },
  { value: '能源/环保', label: '能源/环保' },
  { value: '文化/传媒', label: '文化/传媒' },
  { value: '政府/非营利', label: '政府/非营利' },
  { value: '其他', label: '其他' },
]

// 企业规模选项
const SCALE_OPTIONS = [
  { value: '0-20人', label: '0-20人' },
  { value: '20-99人', label: '20-99人' },
  { value: '100-499人', label: '100-499人' },
  { value: '500-999人', label: '500-999人' },
  { value: '1000-9999人', label: '1000-9999人' },
  { value: '10000人以上', label: '10000人以上' },
]

export default function EnterpriseProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<EnterpriseProfile | null>(null)

  // 获取企业信息
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/enterprise')
      const data = await res.json()

      if (data.success) {
        setProfile(data.data)
        form.setFieldsValue(data.data)
      } else {
        message.error(data.error || '获取企业信息失败')
      }
    } catch (error) {
      console.error('Fetch profile error:', error)
      message.error('获取企业信息失败')
    } finally {
      setLoading(false)
    }
  }, [form])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, fetchProfile])

  // 处理 session 加载状态
  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="enterprise">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  // 未登录
  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/enterprise/profile')
    return null
  }

  // 保存企业信息
  const handleSave = async (values: any) => {
    setSaving(true)
    try {
      const res = await fetch('/api/enterprise', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (data.success) {
        message.success('保存成功')
        setProfile(data.data)
        form.setFieldsValue(data.data)
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Save profile error:', error)
      message.error('保存失败')
    } finally {
      setSaving(false)
    }
  }

  // 重置表单
  const handleReset = () => {
    if (profile) {
      form.setFieldsValue(profile)
    }
  }

  return (
    <DashboardLayout role="enterprise">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="!mb-2">企业信息</Title>
          <Text type="secondary">完善企业基本信息，提升企业可信度</Text>
        </div>
        {profile?.verified ? (
          <Tag icon={<CheckCircleOutlined />} color="success">
            已认证
          </Tag>
        ) : (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            待认证
          </Tag>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={profile || {}}
      >
        <Row gutter={24}>
          {/* 基本信息 */}
          <Col xs={24} lg={16}>
            <Card title="基本信息" className="mb-4">
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="name"
                    label="企业名称"
                    rules={[{ required: true, message: '请输入企业名称' }]}
                  >
                    <Input prefix={<BuildOutlined />} placeholder="请输入企业名称" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="industry"
                    label="所属行业"
                    rules={[{ required: true, message: '请选择所属行业' }]}
                  >
                    <Select placeholder="请选择所属行业">
                      {INDUSTRY_OPTIONS.map(opt => (
                        <Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="scale"
                    label="企业规模"
                    rules={[{ required: true, message: '请选择企业规模' }]}
                  >
                    <Select placeholder="请选择企业规模">
                      {SCALE_OPTIONS.map(opt => (
                        <Option key={opt.value} value={opt.value}>
                          {opt.label}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="address" label="企业地址">
                    <Input prefix={<EnvironmentOutlined />} placeholder="请输入企业地址" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="description" label="企业简介">
                    <TextArea
                      rows={4}
                      placeholder="请输入企业简介，展示企业文化和优势"
                      showCount
                      maxLength={500}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* 联系信息 */}
          <Col xs={24} lg={8}>
            <Card title="联系信息" className="mb-4">
              <Form.Item name="contactName" label="联系人">
                <Input placeholder="请输入联系人姓名" />
              </Form.Item>
              <Form.Item name="contactPhone" label="联系电话">
                <Input prefix={<PhoneOutlined />} placeholder="请输入联系电话" />
              </Form.Item>
              <Form.Item name="contactEmail" label="联系邮箱">
                <Input prefix={<MailOutlined />} placeholder="请输入联系邮箱" />
              </Form.Item>
            </Card>

            {/* Logo 上传（预留） */}
            <Card title="企业Logo">
              <div className="text-center">
                <Avatar
                  size={80}
                  src={profile?.logo}
                  icon={<BuildOutlined />}
                  className="bg-blue-500 mb-4"
                />
                <div>
                  <Upload
                    showUploadList={false}
                    accept="image/*"
                    beforeUpload={() => {
                      message.info('Logo 上传功能即将开放')
                      return false
                    }}
                  >
                    <Button icon={<UploadOutlined />}>上传Logo</Button>
                  </Upload>
                </div>
                <Text type="secondary" className="text-xs mt-2 block">
                  支持 JPG、PNG 格式，建议 200x200 像素
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

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
    </DashboardLayout>
  )
}
