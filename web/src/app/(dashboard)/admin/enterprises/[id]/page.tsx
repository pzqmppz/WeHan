/**
 * 管理员端 - 企业详情页
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Button, Space, Tag, Typography, Spin, App, Divider } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

interface EnterpriseDetail {
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
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
    jobs: number
  }
}

const SCALE_LABELS: Record<string, string> = {
  '0-50': '50人以下',
  '50-200': '50-200人',
  '200-500': '200-500人',
  '500-1000': '500-1000人',
  '1000+': '1000人以上',
}

export default function AdminEnterpriseDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { message } = App.useApp()
  const [enterprise, setEnterprise] = useState<EnterpriseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (session && params.id) {
      fetchEnterprise()
    }
  }, [session, params.id])

  const fetchEnterprise = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/enterprises/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setEnterprise(data.data)
      } else {
        message.error('获取企业详情失败')
        router.push('/admin/enterprises')
      }
    } catch (error) {
      console.error('Fetch enterprise error:', error)
      message.error('获取企业详情失败')
      router.push('/admin/enterprises')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (verified: boolean) => {
    if (!enterprise) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/admin/enterprises/${enterprise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      })
      const data = await res.json()

      if (data.success) {
        message.success(verified ? '企业已通过审核' : '企业审核未通过')
        fetchEnterprise()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

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
    router.push('/login?callbackUrl=/admin/enterprises')
    return null
  }

  if (!enterprise) {
    return null
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin/enterprises')}>
            返回
          </Button>
        </Space>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">{enterprise.name}</Title>
            <Space>
              {!enterprise.verified ? (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleVerify(true)}
                  loading={actionLoading}
                >
                  通过审核
                </Button>
              ) : (
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleVerify(false)}
                  loading={actionLoading}
                >
                  取消认证
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="认证状态">
            <Tag color={enterprise.verified ? 'success' : 'warning'}>
              {enterprise.verified ? '已认证' : '待审核'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="所属行业">
            {enterprise.industry || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="企业规模">
            {SCALE_LABELS[enterprise.scale] || enterprise.scale || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="企业地址">
            {enterprise.address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系人">
            {enterprise.contactName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系电话">
            {enterprise.contactPhone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系邮箱">
            {enterprise.contactEmail || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="关联用户数">
            {enterprise._count?.users || 0} 人
          </Descriptions.Item>
          <Descriptions.Item label="发布岗位数">
            {enterprise._count?.jobs || 0} 个
          </Descriptions.Item>
          <Descriptions.Item label="企业简介" span={2}>
            <div className="whitespace-pre-wrap">{enterprise.description || '-'}</div>
          </Descriptions.Item>
          <Descriptions.Item label="营业执照" span={2}>
            {enterprise.businessLicense ? (
              <a href={enterprise.businessLicense} target="_blank" rel="noopener noreferrer">
                查看营业执照
              </a>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(enterprise.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(enterprise.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </DashboardLayout>
  )
}
