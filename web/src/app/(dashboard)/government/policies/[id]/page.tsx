/**
 * 政府端 - 政策详情页
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Button, Space, Tag, Typography, Spin, App } from 'antd'
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { PolicyType } from '@prisma/client'

const { Title, Text } = Typography

interface PolicyDetail {
  id: string
  title: string
  type: PolicyType
  content: string
  summary: string | null
  conditions: string | null
  benefits: string | null
  effectiveDate: string | null
  expiryDate: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const POLICY_TYPE_LABELS: Record<PolicyType, { label: string; color: string }> = {
  SUBSIDY: { label: '补贴政策', color: 'blue' },
  HOUSING: { label: '住房政策', color: 'green' },
  TALENT: { label: '人才政策', color: 'orange' },
  ENTREPRENEUR: { label: '创业政策', color: 'purple' },
  OTHER: { label: '其他政策', color: 'default' },
}

export default function PolicyDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { message } = App.useApp()
  const [policy, setPolicy] = useState<PolicyDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session && params.id) {
      fetchPolicy()
    }
  }, [session, params.id])

  const fetchPolicy = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/policies/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setPolicy(data.data)
      } else {
        message.error('获取政策详情失败')
        router.push('/government/policies')
      }
    } catch (error) {
      console.error('Fetch policy error:', error)
      message.error('获取政策详情失败')
      router.push('/government/policies')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="government">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/government/policies')
    return null
  }

  if (!policy) {
    return null
  }

  const typeConfig = POLICY_TYPE_LABELS[policy.type] || POLICY_TYPE_LABELS.OTHER

  return (
    <DashboardLayout role="government">
      <div className="mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/government/policies')}>
            返回
          </Button>
        </Space>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">{policy.title}</Title>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => router.push(`/government/policies/${policy.id}/edit`)}
            >
              编辑
            </Button>
          </div>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="政策类型">
            <Tag color={typeConfig.color}>{typeConfig.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={policy.isActive ? 'success' : 'default'}>
              {policy.isActive ? '已发布' : '已下架'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="生效日期">
            {policy.effectiveDate
              ? new Date(policy.effectiveDate).toLocaleDateString('zh-CN')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="失效日期">
            {policy.expiryDate
              ? new Date(policy.expiryDate).toLocaleDateString('zh-CN')
              : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="政策摘要" span={2}>
            {policy.summary || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="政策内容" span={2}>
            <div className="whitespace-pre-wrap">{policy.content}</div>
          </Descriptions.Item>
          <Descriptions.Item label="申请条件" span={2}>
            <div className="whitespace-pre-wrap">{policy.conditions || '-'}</div>
          </Descriptions.Item>
          <Descriptions.Item label="政策福利" span={2}>
            <div className="whitespace-pre-wrap">{policy.benefits || '-'}</div>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(policy.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(policy.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </DashboardLayout>
  )
}
