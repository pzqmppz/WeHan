'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, Modal, Form, Select,
  message, Tooltip, Badge, Spin, Avatar, Tabs, Statistic, Row, Col
} from 'antd'
import {
  EyeOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined,
  CloseCircleOutlined, CalendarOutlined, UserOutlined, TeamOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

interface Application {
  id: string
  status: string
  matchScore: number | null
  notes: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    school?: { name: string }
    major?: string
  }
  job: {
    id: string
    title: string
    location: string | null
  }
  resume?: {
    id: string
    education?: any
    skills: string[]
  }
  interview?: {
    id: string
    totalScore: number | null
    status: string
  }
}

interface ApplicationListResponse {
  success: boolean
  data: Application[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const APPLICATION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待处理' },
  VIEWED: { color: 'default', label: '已查看' },
  INTERVIEWING: { color: 'warning', label: '面试中' },
  OFFERED: { color: 'success', label: '已录用' },
  REJECTED: { color: 'error', label: '已拒绝' },
  WITHDRAWN: { color: 'default', label: '已撤回' },
}

// 状态流转顺序
const STATUS_FLOW = ['PENDING', 'VIEWED', 'INTERVIEWING', 'OFFERED', 'REJECTED']

export default function ApplicationsPage() {
  const sessionData = useSession()
  const { data: session, status } = sessionData || { data: null, status: 'loading' }
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [activeTab, setActiveTab] = useState('all')
  const [searchForm] = Form.useForm()
  const [statistics, setStatistics] = useState({ pending: 0, today: 0 })

  // 获取企业ID
  const enterpriseId = (session?.user as any)?.enterpriseId

  // 处理 session 加载状态
  if (status === 'loading') {
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
    router.push('/login?callbackUrl=/enterprise/applications')
    return null
  }

  // 加载投递列表
  const fetchApplications = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    if (!enterpriseId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        enterpriseId,
        ...filters,
      })

      const res = await fetch(`/api/applications?${params}`)
      const data: ApplicationListResponse = await res.json()

      if (data.success) {
        setApplications(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.meta?.page || page,
          total: data.meta?.total || 0,
        }))
      } else {
        message.error('获取投递列表失败')
      }
    } catch (error) {
      console.error('Fetch applications error:', error)
      message.error('获取投递列表失败')
    } finally {
      setLoading(false)
    }
  }, [enterpriseId])

  // 加载统计数据
  const fetchStatistics = useCallback(async () => {
    if (!enterpriseId) return

    try {
      const res = await fetch(`/api/applications/statistics?enterpriseId=${enterpriseId}`)
      const data = await res.json()

      if (data.success) {
        setStatistics({
          pending: data.data.pendingApplications || 0,
          today: data.data.todayApplications || 0,
        })
      }
    } catch (error) {
      console.error('Fetch statistics error:', error)
    }
  }, [enterpriseId])

  useEffect(() => {
    if (enterpriseId) {
      fetchApplications()
      fetchStatistics()
    }
  }, [enterpriseId, fetchApplications, fetchStatistics])

  // Tab 切换
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    const filters: Record<string, string> = {}
    if (key !== 'all') {
      filters.status = key
    }
    fetchApplications(1, pagination.pageSize, filters)
  }

  // 搜索
  const handleSearch = (values: any) => {
    const filters: Record<string, string> = {}
    if (activeTab !== 'all') filters.status = activeTab
    if (values.jobId) filters.jobId = values.jobId
    fetchApplications(1, pagination.pageSize, filters)
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields()
    const filters = activeTab !== 'all' ? { status: activeTab } : {}
    fetchApplications(1, pagination.pageSize, filters)
  }

  // 更新状态
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('状态已更新')
        fetchApplications(pagination.current, pagination.pageSize)
        fetchStatistics()
      } else {
        message.error(data.error || '更新失败')
      }
    } catch (error) {
      message.error('更新失败')
    }
  }

  // 批量操作
  const handleBatchAction = async (ids: string[], action: string) => {
    try {
      const res = await fetch('/api/applications/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })
      const data = await res.json()

      if (data.success) {
        message.success(`已处理 ${data.data.updated} 条记录`)
        fetchApplications(pagination.current, pagination.pageSize)
        fetchStatistics()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    }
  }

  // 格式化匹配分数
  const formatMatchScore = (score: number | null) => {
    if (score === null) return '-'
    if (score >= 80) return <Tag color="success">{score}分</Tag>
    if (score >= 60) return <Tag color="warning">{score}分</Tag>
    return <Tag color="error">{score}分</Tag>
  }

  // 表格列定义
  const columns: ColumnsType<Application> = [
    {
      title: '候选人',
      key: 'candidate',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Text strong>{record.user.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {record.user.school?.name || record.user.major || '未知学校'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '投递岗位',
      dataIndex: ['job', 'title'],
      key: 'job',
      width: 180,
      render: (title: string, record) => (
        <div>
          <Text>{title}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.job.location || '地点未知'}
          </Text>
        </div>
      ),
    },
    {
      title: '匹配度',
      dataIndex: 'matchScore',
      key: 'matchScore',
      width: 80,
      align: 'center',
      render: formatMatchScore,
    },
    {
      title: '面试评分',
      dataIndex: ['interview', 'totalScore'],
      key: 'interviewScore',
      width: 80,
      align: 'center',
      render: (score: number | null, record) => {
        if (!record.interview) return <Text type="secondary">未面试</Text>
        if (score === null) return <Text type="secondary">进行中</Text>
        return <Badge count={score} showZero color={score >= 60 ? 'green' : 'red'} />
      },
    },
    {
      title: '投递时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = APPLICATION_STATUS_CONFIG[status] || APPLICATION_STATUS_CONFIG.PENDING
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const currentIndex = STATUS_FLOW.indexOf(record.status)
        const canAdvance = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 2 // 不能从 REJECTED 继续

        return (
          <Space size="small">
            <Tooltip title="查看详情">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => router.push(`/enterprise/applications/${record.id}`)}
              />
            </Tooltip>

            {record.status === 'PENDING' && (
              <>
                <Tooltip title="标记已查看">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleUpdateStatus(record.id, 'VIEWED')}
                  />
                </Tooltip>
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                  />
                </Tooltip>
              </>
            )}

            {record.status === 'VIEWED' && (
              <>
                <Tooltip title="安排面试">
                  <Button
                    type="text"
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={() => handleUpdateStatus(record.id, 'INTERVIEWING')}
                  />
                </Tooltip>
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                  />
                </Tooltip>
              </>
            )}

            {record.status === 'INTERVIEWING' && (
              <>
                <Tooltip title="录用">
                  <Button
                    type="text"
                    size="small"
                    style={{ color: '#52c41a' }}
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleUpdateStatus(record.id, 'OFFERED')}
                  />
                </Tooltip>
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <DashboardLayout role="enterprise">
      <div className="mb-6">
        <Title level={4} className="!mb-2">投递管理</Title>
        <Text type="secondary">管理求职者的投递申请</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日投递"
              value={statistics.today}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1677FF' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待处理"
              value={statistics.pending}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tab 筛选 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部" key="all" />
          <TabPane tab={`待处理 (${statistics.pending})`} key="PENDING" />
          <TabPane tab="已查看" key="VIEWED" />
          <TabPane tab="面试中" key="INTERVIEWING" />
          <TabPane tab="已录用" key="OFFERED" />
          <TabPane tab="已拒绝" key="REJECTED" />
        </Tabs>

        <div className="mb-4 flex justify-between items-center">
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item name="jobId">
              <Select
                placeholder="筛选岗位"
                allowClear
                style={{ width: 200 }}
              >
                <Option value="all">全部岗位</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              const filters = activeTab !== 'all' ? { status: activeTab } : {}
              fetchApplications(pagination.current, pagination.pageSize, filters)
            }}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              const filters = activeTab !== 'all' ? { status: activeTab } : {}
              fetchApplications(page, pageSize, filters)
            },
          }}
        />
      </Card>
    </DashboardLayout>
  )
}
