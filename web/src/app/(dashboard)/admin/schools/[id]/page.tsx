/**
 * 管理员端 - 学校详情页
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Button, Space, Tag, Typography, Spin, App } from 'antd'
import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

interface SchoolDetail {
  id: string
  name: string
  logo: string | null
  type: string
  level: string
  address: string | null
  contactName: string | null
  contactPhone: string | null
  verified: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    users: number
    students: number
  }
}

const SCHOOL_TYPE_LABELS: Record<string, string> = {
  '综合类': '综合类',
  '理工类': '理工类',
  '师范类': '师范类',
  '财经类': '财经类',
  '医药类': '医药类',
  '艺术类': '艺术类',
  '其他': '其他',
}

const SCHOOL_LEVEL_LABELS: Record<string, string> = {
  '本科': '本科',
  '专科': '专科',
  '高职': '高职',
  '研究生': '研究生',
}

export default function AdminSchoolDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { message } = App.useApp()
  const [school, setSchool] = useState<SchoolDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (session && params.id) {
      fetchSchool()
    }
  }, [session, params.id])

  const fetchSchool = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/schools/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setSchool(data.data)
      } else {
        message.error('获取学校详情失败')
        router.push('/admin/schools')
      }
    } catch (error) {
      console.error('Fetch school error:', error)
      message.error('获取学校详情失败')
      router.push('/admin/schools')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (verified: boolean) => {
    if (!school) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/schools/${school.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      })
      const data = await res.json()

      if (data.success) {
        message.success(verified ? '学校已通过审核' : '学校审核未通过')
        fetchSchool()
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
    router.push('/login?callbackUrl=/admin/schools')
    return null
  }

  if (!school) {
    return null
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin/schools')}>
            返回
          </Button>
        </Space>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">{school.name}</Title>
            <Space>
              {!school.verified ? (
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
            <Tag color={school.verified ? 'success' : 'warning'}>
              {school.verified ? '已认证' : '待审核'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="学校类型">
            {SCHOOL_TYPE_LABELS[school.type] || school.type || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="办学层次">
            {SCHOOL_LEVEL_LABELS[school.level] || school.level || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="学校地址">
            {school.address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系人">
            {school.contactName || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="联系电话">
            {school.contactPhone || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="关联管理员">
            {school._count?.users || 0} 人
          </Descriptions.Item>
          <Descriptions.Item label="在校学生">
            {school._count?.students || 0} 人
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(school.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(school.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </DashboardLayout>
  )
}
