/**
 * 管理员端 - 系统设置页面
 * 包含基础设置和首页配置两个标签页
 */

'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, Form, Input, Button, Spin, Typography, Divider, Space, App, Tabs, InputNumber, Switch, List
} from 'antd'
import {
  SaveOutlined, ReloadOutlined, SettingOutlined, HomeOutlined,
  PlusOutlined, DeleteOutlined, DragOutlined, EditOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useHomepageConfig, type HomepageConfig } from '@/hooks/useHomepageConfig'

const { Title, Text } = Typography

interface SiteConfig {
  siteName: string
  siteDescription: string
  contactEmail: string
  contactPhone: string
  icpNumber?: string
}

// 图标选项列表
const ICON_OPTIONS = [
  { value: 'RocketOutlined', label: '火箭' },
  { value: 'BankOutlined', label: '银行' },
  { value: 'HeartOutlined', label: '心形' },
  { value: 'SafetyCertificateOutlined', label: '安全认证' },
  { value: 'TeamOutlined', label: '团队' },
  { value: 'FileTextOutlined', label: '文件' },
  { value: 'TrophyOutlined', label: '奖杯' },
  { value: 'StarOutlined', label: '星形' },
  { value: 'BulbOutlined', label: '灯泡' },
  { value: 'ThunderboltOutlined', label: '闪电' },
]

export default function AdminSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [form] = Form.useForm()

  // 首页配置相关
  const {
    config: homepageConfig,
    loading: homepageLoading,
    saveConfig: saveHomepageConfig,
    refetch: refetchHomepage,
    defaultConfig,
  } = useHomepageConfig({ messageApi: message })

  const [homepageForm] = Form.useForm()
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    if (session) {
      fetchConfig()
    }
  }, [session])

  // 基础配置加载
  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/config')
      const data = await res.json()

      if (data.success) {
        form.setFieldsValue(data.data)
      } else {
        message.error('获取配置失败')
      }
    } catch (error) {
      console.error('Fetch config error:', error)
      message.error('获取配置失败')
    } finally {
      setLoading(false)
    }
  }

  // 基础配置保存
  const handleSave = async (values: SiteConfig) => {
    setSaveLoading(true)
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (data.success) {
        message.success('配置已保存')
        router.refresh()
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Save config error:', error)
      message.error('保存失败')
    } finally {
      setSaveLoading(false)
    }
  }

  const handleReset = () => {
    fetchConfig()
    message.info('已重置为当前保存的配置')
  }

  // 首页配置保存
  const handleSaveHomepage = async () => {
    try {
      const values = await homepageForm.validateFields()
      const success = await saveHomepageConfig(values)
      if (success) {
        refetchHomepage()
      }
    } catch (error) {
      console.error('Validate error:', error)
    }
  }

  const handleResetHomepage = () => {
    homepageForm.setFieldsValue(defaultConfig)
    message.info('已重置为默认配置')
  }

  // 当首页配置加载完成时，更新表单
  useEffect(() => {
    if (homepageConfig) {
      homepageForm.setFieldsValue(homepageConfig)
    }
  }, [homepageConfig, homepageForm])

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

  // 基础设置 Tab 内容
  const BasicSettingsTab = (
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
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )

  // 首页配置 Tab 内容
  const HomepageConfigTab = (
    <Card loading={homepageLoading}>
      <Form
        form={homepageForm}
        layout="vertical"
        className="max-w-3xl"
      >
        <Title level={5}>统计数据</Title>
        <Text type="secondary" className="block mb-4">
          首页展示的核心数据指标
        </Text>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Form.Item name={['stats', 'enterprises']} label="入驻企业">
            <InputNumber min={0} className="w-full" placeholder="120" />
          </Form.Item>
          <Form.Item name={['stats', 'universities']} label="合作高校">
            <InputNumber min={0} className="w-full" placeholder="35" />
          </Form.Item>
          <Form.Item name={['stats', 'students']} label="服务学生">
            <InputNumber min={0} className="w-full" placeholder="15000" />
          </Form.Item>
          <Form.Item name={['stats', 'retentionRate']} label="留汉率 (%)">
            <InputNumber min={0} max={100} className="w-full" placeholder="68" />
          </Form.Item>
        </div>

        <Divider />

        <Title level={5}>功能特性</Title>
        <Text type="secondary" className="block mb-4">
          首页展示的功能卡片，可拖拽排序
        </Text>

        <Form.List name="features">
          {(fields, { add, remove, move }) => (
            <div className="space-y-4">
              {fields.map(({ key, name, ...restField }, index) => (
                <Card
                  key={key}
                  size="small"
                  className="bg-gray-50"
                  title={
                    <div className="flex items-center gap-2">
                      <DragOutlined className="text-gray-400 cursor-move" />
                      <span>功能 {index + 1}</span>
                    </div>
                  }
                  extra={
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => remove(name)}
                    >
                      删除
                    </Button>
                  }
                >
                  <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                      {...restField}
                      name={[name, 'title']}
                      label="标题"
                      rules={[{ required: true, message: '请输入标题' }]}
                    >
                      <Input placeholder="功能标题" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'icon']}
                      label="图标"
                      rules={[{ required: true, message: '请选择图标' }]}
                    >
                      <select className="w-full h-8 px-2 border border-gray-300 rounded">
                        {ICON_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      label="描述"
                      rules={[{ required: true, message: '请输入描述' }]}
                      className="col-span-2"
                    >
                      <Input.TextArea
                        placeholder="功能描述"
                        rows={2}
                        maxLength={100}
                        showCount
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'enabled']}
                      label="启用"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'order']}
                      label="排序"
                      hidden
                    >
                      <InputNumber />
                    </Form.Item>
                  </div>
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() => add({
                  id: `feature-${Date.now()}`,
                  icon: 'StarOutlined',
                  title: '',
                  description: '',
                  order: fields.length + 1,
                  enabled: true,
                })}
                block
                icon={<PlusOutlined />}
              >
                添加功能
              </Button>
            </div>
          )}
        </Form.List>

        <Divider />

        <Title level={5}>页脚链接</Title>
        <Text type="secondary" className="block mb-4">
          页脚显示的法律相关链接
        </Text>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Form.Item
            name={['footerLinks', 'privacyPolicyUrl']}
            label="隐私政策链接"
          >
            <Input placeholder="/privacy" />
          </Form.Item>
          <Form.Item
            name={['footerLinks', 'termsOfServiceUrl']}
            label="使用条款链接"
          >
            <Input placeholder="/terms" />
          </Form.Item>
          <Form.Item
            name={['footerLinks', 'icpNumber']}
            label="ICP 备案号"
          >
            <Input placeholder="鄂ICP备XXXXXXX号" />
          </Form.Item>
        </div>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSaveHomepage}
              loading={homepageLoading}
            >
              保存首页配置
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleResetHomepage}>
              重置为默认
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  )

  const tabItems = [
    {
      key: 'basic',
      label: (
        <span>
          <SettingOutlined />
          基础设置
        </span>
      ),
      children: BasicSettingsTab,
    },
    {
      key: 'homepage',
      label: (
        <span>
          <HomeOutlined />
          首页配置
        </span>
      ),
      children: HomepageConfigTab,
    },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Title level={4} className="!mb-2">系统设置</Title>
        <Text type="secondary">管理平台基础配置和首页展示内容</Text>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
      />
    </DashboardLayout>
  )
}
