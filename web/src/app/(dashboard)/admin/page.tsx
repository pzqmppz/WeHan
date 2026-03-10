/**
 * 管理员端 - 系统概览
 * 强调控制、管理、批量操作
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Typography, Table, Tag, Space, Badge, App } from 'antd'
import {
  BankOutlined,
  AuditOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PageHeader, LoadingState, NoData } from '@/components/ui'

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
      // 并行获取所有数据
      const [statsRes, enterprisesRes, schoolsRes] = await Promise.all([
        fetch('/api/statistics/overview'),
        fetch('/api/admin/enterprises?verified=false&pageSize=5'),
        fetch('/api/schools?verified=false&pageSize=5'),
      ])

      const [statsData, enterprisesData, schoolsData] = await Promise.all([
        statsRes.json(),
        enterprisesRes.json(),
        schoolsRes.json(),
      ])

      if (statsData.success) {
        setStats(statsData.data)
      }

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
        <PageHeader title="系统概览" />
        <LoadingState message="加载系统数据中..." />
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
      <PageHeader title="系统概览" onReload={fetchData} />

      {/* 管理员端 - 控制导向的统计卡片，带入场动画 */}
      <Row gutter={[12, 12]} className="mb-6">
        {/* 待审核 - 醒目警告 */}
        <Col xs={12} sm={6}>
          <Card
            className={pendingCount > 0 ? 'bg-orange-50 border-orange-300 card-hover animate-fade-in animate-delay-100' : 'card-hover animate-fade-in animate-delay-100'}
            hoverable
            onClick={() => router.push('/admin/reviews')}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <ExclamationCircleOutlined className={pendingCount > 0 ? 'text-orange-500' : ''} />
                  待审核
                </span>
                <div className={`text-2xl font-bold mt-1 stat-number ${pendingCount > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
                  {pendingCount}
                </div>
                <span className="text-xs text-gray-400">项申请</span>
              </div>
              {pendingCount > 0 && (
                <Badge count={pendingCount} size="small" className="badge-animate" />
              )}
            </div>
          </Card>
        </Col>

        {/* 注册企业 */}
        <Col xs={12} sm={6}>
          <Card className="card-hover animate-fade-in animate-delay-200" hoverable onClick={() => router.push('/admin/enterprises')}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-gray-500">注册企业</span>
                <div className="text-2xl font-bold text-gray-800 mt-1 stat-number">{stats?.totalEnterprises || 0}</div>
                <span className="text-xs text-gray-400">总计</span>
              </div>
              <BankOutlined className="text-blue-400 text-lg" />
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {stats?.verifiedEnterprises || 0} 已认证
              </span>
            </div>
          </Card>
        </Col>

        {/* 合作高校 */}
        <Col xs={12} sm={6}>
          <Card className="card-hover animate-fade-in animate-delay-300" hoverable onClick={() => router.push('/admin/schools')}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-gray-500">合作高校</span>
                <div className="text-2xl font-bold text-gray-800 mt-1 stat-number">{stats?.totalSchools || 0}</div>
                <span className="text-xs text-gray-400">总计</span>
              </div>
              <AuditOutlined className="text-green-400 text-lg" />
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {stats?.verifiedSchools || 0} 已认证
              </span>
            </div>
          </Card>
        </Col>

        {/* 在招岗位 */}
        <Col xs={12} sm={6}>
          <Card className="card-hover animate-fade-in animate-delay-400" hoverable onClick={() => router.push('/admin/jobs')}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs text-gray-500">在招岗位</span>
                <div className="text-2xl font-bold text-gray-800 mt-1 stat-number">{stats?.activeJobs || 0}</div>
                <span className="text-xs text-gray-400">活跃中</span>
              </div>
              <FileTextOutlined className="text-purple-400 text-lg" />
            </div>
            <div className="mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                / {stats?.totalJobs || 0} 总计
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 待审核列表 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <ExclamationCircleOutlined className={pendingCount > 0 ? 'text-orange-500' : 'text-gray-400'} />
                <span>待审核申请</span>
                {pendingCount > 0 && <Badge count={pendingCount} />}
              </Space>
            }
            className={pendingCount > 0 ? 'border-orange-200' : ''}
          >
            {pendingItems.length === 0 ? (
              <NoData description="暂无待审核申请" />
            ) : (
              <Table
                dataSource={pendingItems}
                rowKey="id"
                pagination={false}
                size="small"
                className="!mt-2"
                columns={[
                  {
                    title: '类型',
                    dataIndex: 'type',
                    width: 70,
                    render: (type) => (
                      <Tag color={type === 'enterprise' ? 'blue' : 'green'}>
                        {type === 'enterprise' ? '企业' : '学校'}
                      </Tag>
                    ),
                  },
                  {
                    title: '名称',
                    dataIndex: 'name',
                    ellipsis: true,
                  },
                  {
                    title: '联系人',
                    dataIndex: 'contactName',
                    width: 80,
                    render: (text) => text || '-',
                  },
                  {
                    title: '提交时间',
                    dataIndex: 'createdAt',
                    width: 110,
                    render: (date) => new Date(date).toLocaleDateString('zh-CN'),
                  },
                  {
                    title: '操作',
                    width: 70,
                    render: (_, record) => (
                      <a onClick={() => handleReview(record)} className="text-blue-600">
                        审核
                      </a>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>

        {/* 快捷入口 - 管理控制 */}
        <Col xs={24} lg={10}>
          <Card title="管理入口" className="h-full">
            <Space direction="vertical" className="w-full" size="middle">
              <div
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 border border-transparent transition-all flex items-center justify-between"
                onClick={() => router.push('/admin/users')}
              >
                <Space>
                  <AuditOutlined className="text-blue-500" />
                  <span>用户管理</span>
                </Space>
                <span className="text-gray-400">→</span>
              </div>
              <div
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 border border-transparent transition-all flex items-center justify-between"
                onClick={() => router.push('/admin/enterprises')}
              >
                <Space>
                  <BankOutlined className="text-blue-500" />
                  <span>企业管理</span>
                </Space>
                <span className="text-gray-400">→</span>
              </div>
              <div
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 border border-transparent transition-all flex items-center justify-between"
                onClick={() => router.push('/admin/schools')}
              >
                <Space>
                  <CheckCircleOutlined className="text-green-500" />
                  <span>学校管理</span>
                </Space>
                <span className="text-gray-400">→</span>
              </div>
              <div
                className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 border border-transparent transition-all flex items-center justify-between"
                onClick={() => router.push('/admin/jobs')}
              >
                <Space>
                  <FileTextOutlined className="text-purple-500" />
                  <span>岗位管理</span>
                </Space>
                <span className="text-gray-400">→</span>
              </div>
              <div
                className="p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 hover:border-orange-300 border border-transparent transition-all flex items-center justify-between"
                onClick={() => router.push('/admin/reviews')}
              >
                <Space>
                  <ExclamationCircleOutlined className="text-orange-500" />
                  <span className="font-medium text-orange-700">审核中心</span>
                </Space>
                {pendingCount > 0 && (
                  <Badge count={pendingCount} size="small" />
                )}
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
