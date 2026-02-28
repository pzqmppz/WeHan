/**
 * 管理员端 - 系统概览
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Badge, Spin, App } from 'antd'
import {
  BankOutlined,
  AuditOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const { Title } = Typography

interface OverviewStats {
  totalUsers: number
  totalEnterprises: number
  totalSchools: number
  totalJobs: number
  activeJobs: number
  verifiedEnterprises: number
  verifiedSchools: number
}

interface PendingItem {
  id: string
  type: 'enterprise' | 'school'
  name: string
  contactName?: string
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])

  useEffect(() => {
    if (session) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 获取统计数据
      const statsRes = await fetch('/api/statistics/overview')
      const statsData = await statsRes.json()

      if (statsData.success) {
        setStats(statsData.data)
      }

      // 获取待审核企业
      const enterprisesRes = await fetch('/api/admin/enterprises?verified=false&pageSize=5')
      const enterprisesData = await enterprisesRes.json()

      // 获取待审核学校
      const schoolsRes = await fetch('/api/schools?verified=false&pageSize=5')
      const schoolsData = await schoolsRes.json()

      const pendingEnterprises: PendingItem[] = (enterprisesData.data || [])
        .filter((e: any) => !e.verified)
        .map((e: any) => ({
          id: e.id,
          type: 'enterprise' as const,
          name: e.name,
          contactName: e.contactName,
          createdAt: e.createdAt,
        }))

      const pendingSchools: PendingItem[] = (schoolsData.data || [])
        .filter((s: any) => !s.verified)
        .map((s: any) => ({
          id: s.id,
          type: 'school' as const,
          name: s.name,
          contactName: s.contactName,
          createdAt: s.createdAt,
        }))

      // 合并并按时间排序
      const allPending = [...pendingEnterprises, ...pendingSchools]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)

      setPendingItems(allPending)
    } catch (error) {
      console.error('Fetch admin dashboard error:', error)
      message.error('获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleReview = (item: PendingItem) => {
    if (item.type === 'enterprise') {
      router.push(`/admin/enterprises/${item.id}`)
    } else {
      router.push(`/admin/schools/${item.id}`)
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
    router.push('/login?callbackUrl=/admin')
    return null
  }

  const pendingCount = pendingItems.length

  return (
    <DashboardLayout role="admin">
      <Title level={4} className="mb-6">系统概览</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="注册企业"
              value={stats?.totalEnterprises || 0}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={<span className="text-sm text-gray-400">({stats?.verifiedEnterprises || 0} 已认证)</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="合作高校"
              value={stats?.totalSchools || 0}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={<span className="text-sm text-gray-400">({stats?.verifiedSchools || 0} 已认证)</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="在招岗位"
              value={stats?.activeJobs || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
              suffix={<span className="text-sm text-gray-400">(/ {stats?.totalJobs || 0} 总计)</span>}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待审核"
              value={pendingCount}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 待审核列表 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <span>待审核申请</span>
                {pendingCount > 0 && <Badge count={pendingCount} />}
              </Space>
            }
          >
            {pendingItems.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <CheckCircleOutlined className="text-4xl mb-2" />
                <p>暂无待审核申请</p>
              </div>
            ) : (
              <Table
                dataSource={pendingItems}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '类型',
                    dataIndex: 'type',
                    width: 80,
                    render: (type) => (
                      <Tag color={type === 'enterprise' ? 'blue' : 'green'}>
                        {type === 'enterprise' ? '企业' : '学校'}
                      </Tag>
                    ),
                  },
                  {
                    title: '名称',
                    dataIndex: 'name',
                  },
                  {
                    title: '联系人',
                    dataIndex: 'contactName',
                    render: (text) => text || '-',
                  },
                  {
                    title: '提交时间',
                    dataIndex: 'createdAt',
                    width: 140,
                    render: (date) => new Date(date).toLocaleDateString('zh-CN'),
                  },
                  {
                    title: '操作',
                    width: 80,
                    render: (_, record) => (
                      <a onClick={() => handleReview(record)}>审核</a>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* 快捷入口 */}
        <Col xs={24} lg={10}>
          <Card title="快捷入口">
            <Space direction="vertical" className="w-full">
              <div
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => router.push('/admin/users')}
              >
                <Space>
                  <AuditOutlined />
                  <span>用户管理</span>
                </Space>
              </div>
              <div
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => router.push('/admin/enterprises')}
              >
                <Space>
                  <BankOutlined />
                  <span>企业管理</span>
                </Space>
              </div>
              <div
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => router.push('/admin/schools')}
              >
                <Space>
                  <CheckCircleOutlined />
                  <span>学校管理</span>
                </Space>
              </div>
              <div
                className="p-3 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => router.push('/admin/jobs')}
              >
                <Space>
                  <FileTextOutlined />
                  <span>岗位管理</span>
                </Space>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
