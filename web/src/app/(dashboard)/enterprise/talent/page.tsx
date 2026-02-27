'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, Modal,
  Form, Input, Select, message, Tooltip, Badge, Spin,
  Row, Col, Statistic, Avatar, Progress
} from 'antd'
import {
  SearchOutlined, ReloadOutlined, UserOutlined,
  MailOutlined, PhoneOutlined, TrophyOutlined,
  TeamOutlined, RiseOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select

interface Talent {
  id: string
  name: string
  email: string
  phone: string | null
  major: string | null
  graduationYear: number | null
  resume: {
    id: string
    education: any
    experiences: any
    projects: any
    skills: string[]
    certifications: any
    awards: any
    profile: any
  } | null
  applications: {
    id: string
    status: string
    matchScore: number | null
    createdAt: string
    job: {
      id: string
      title: string
    }
    interview: {
      id: string
      totalScore: number | null
      status: string
    } | null
  }[]
}

interface Statistics {
  totalTalents: number
  newThisWeek: number
  interviewed: number
  offered: number
}

const APPLICATION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待处理' },
  VIEWED: { color: 'default', label: '已查看' },
  INTERVIEWING: { color: 'warning', label: '面试中' },
  OFFERED: { color: 'success', label: '已录用' },
  REJECTED: { color: 'error', label: '已拒绝' },
  WITHDRAWN: { color: 'default', label: '已撤回' },
}

export default function TalentPoolPage() {
  const sessionData = useSession()
  const { data: session, status } = sessionData || { data: null, status: 'loading' }
  const router = useRouter()
  const [talents, setTalents] = useState<Talent[]>([])
  const [loading, setLoading] = useState(false)
  const [statistics, setStatistics] = useState<Statistics | null>(null)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()

  const enterpriseId = (session?.user as any)?.enterpriseId

  // 获取统计数据 - hooks 必须在早期返回之前调用
  const fetchStatistics = useCallback(async () => {
    if (!enterpriseId) return

    try {
      const res = await fetch('/api/talent/statistics')
      const data = await res.json()

      if (data.success) {
        setStatistics(data.data)
      }
    } catch (error) {
      console.error('Fetch statistics error:', error)
    }
  }, [enterpriseId])

  // 获取人才列表
  const fetchTalents = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    if (!enterpriseId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...filters,
      })

      const res = await fetch(`/api/talent?${params}`)
      const data = await res.json()

      if (data.success) {
        setTalents(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.meta?.page || page,
          total: data.meta?.total || 0,
        }))
      } else {
        message.error('获取人才列表失败')
      }
    } catch (error) {
      console.error('Fetch talents error:', error)
      message.error('获取人才列表失败')
    } finally {
      setLoading(false)
    }
  }, [enterpriseId])

  useEffect(() => {
    if (enterpriseId) {
      fetchStatistics()
      fetchTalents()
    }
  }, [enterpriseId, fetchTalents, fetchStatistics])

  // 处理 session 加载状态 - 早期返回必须在所有 hooks 之后
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
    router.push('/login?callbackUrl=/enterprise/talent')
    return null
  }

  // 搜索
  const handleSearch = (values: any) => {
    const filters: Record<string, string> = {}
    if (values.keyword) filters.keyword = values.keyword
    if (values.status) filters.status = values.status
    fetchTalents(1, pagination.pageSize, filters)
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields()
    fetchTalents(1, pagination.pageSize)
  }

  // 获取最高面试分数
  const getHighestInterviewScore = (applications: Talent['applications']) => {
    const scores = applications
      .filter(a => a.interview?.totalScore)
      .map(a => a.interview!.totalScore as number)
    return scores.length > 0 ? Math.max(...scores) : null
  }

  // 获取最高匹配分数
  const getHighestMatchScore = (applications: Talent['applications']) => {
    const scores = applications
      .filter(a => a.matchScore)
      .map(a => a.matchScore as number)
    return scores.length > 0 ? Math.max(...scores) : null
  }

  // 获取最新投递状态
  const getLatestStatus = (applications: Talent['applications']) => {
    if (applications.length === 0) return null
    return applications[0].status
  }

  // 表格列定义
  const columns: ColumnsType<Talent> = [
    {
      title: '候选人',
      key: 'candidate',
      width: 200,
      render: (_, record: Talent) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium">{record.name}</div>
            <Text type="secondary" className="text-xs">
              {record.major || '未知专业'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record: Talent) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs">
            <MailOutlined className="text-gray-400" />
            <Text type="secondary" className="text-xs truncate max-w-[140px]">
              {record.email}
            </Text>
          </div>
          {record.phone && (
            <div className="flex items-center gap-1 text-xs">
              <PhoneOutlined className="text-gray-400" />
              <Text type="secondary">{record.phone}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '技能标签',
      key: 'skills',
      width: 200,
      render: (_, record: Talent) => {
        const skills = record.resume?.skills || []
        if (skills.length === 0) {
          return <Text type="secondary">暂无</Text>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill, index) => (
              <Tag key={index} className="text-xs">
                {skill}
              </Tag>
            ))}
            {skills.length > 3 && (
              <Tag className="text-xs">+{skills.length - 3}</Tag>
            )}
          </div>
        )
      },
    },
    {
      title: '投递岗位',
      key: 'applications',
      width: 150,
      render: (_, record: Talent) => (
        <div>
          <Badge count={record.applications.length} showZero color="blue" />
          <Text className="ml-2">个岗位</Text>
        </div>
      ),
    },
    {
      title: '匹配度',
      key: 'matchScore',
      width: 120,
      render: (_, record: Talent) => {
        const score = getHighestMatchScore(record.applications)
        if (score === null) {
          return <Text type="secondary">-</Text>
        }
        const percent = Math.round(score)
        return (
          <Progress
            percent={percent}
            size="small"
            format={p => `${p}%`}
            strokeColor={percent >= 80 ? '#52c41a' : percent >= 60 ? '#1890ff' : '#faad14'}
          />
        )
      },
    },
    {
      title: '面试分数',
      key: 'interviewScore',
      width: 100,
      render: (_, record: Talent) => {
        const score = getHighestInterviewScore(record.applications)
        if (score === null) {
          return <Text type="secondary">-</Text>
        }
        const roundedScore = Math.round(score)
        return (
          <Tag color={roundedScore >= 80 ? 'success' : roundedScore >= 60 ? 'processing' : 'warning'}>
            {roundedScore}分
          </Tag>
        )
      },
    },
    {
      title: '最新状态',
      key: 'status',
      width: 100,
      render: (_, record: Talent) => {
        const status = getLatestStatus(record.applications)
        if (!status) return <Text type="secondary">-</Text>
        const config = APPLICATION_STATUS_CONFIG[status] || APPLICATION_STATUS_CONFIG.PENDING
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record: Talent) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/enterprise/talent/${record.id}`)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout role="enterprise">
      <div className="mb-6">
        <Title level={4} className="!mb-2">人才库</Title>
        <Text type="secondary">查看投递过贵公司岗位的候选人</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="人才总数"
              value={statistics?.totalTalents || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="本周新增"
              value={statistics?.newThisWeek || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="面试中"
              value={statistics?.interviewed || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已录用"
              value={statistics?.offered || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选 */}
      <Card className="mb-4">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              placeholder="搜索姓名、邮箱、技能"
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 220 }}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="投递状态" allowClear style={{ width: 120 }}>
              <Option value="PENDING">待处理</Option>
              <Option value="VIEWED">已查看</Option>
              <Option value="INTERVIEWING">面试中</Option>
              <Option value="OFFERED">已录用</Option>
              <Option value="REJECTED">已拒绝</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                搜索
              </Button>
              <Button onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* 人才列表 */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text strong>候选人列表</Text>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchStatistics()
              fetchTalents(pagination.current, pagination.pageSize)
            }}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={talents}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 人`,
            onChange: (page, pageSize) => {
              const filters = searchForm.getFieldsValue()
              fetchTalents(page, pageSize, filters)
            },
          }}
        />
      </Card>
    </DashboardLayout>
  )
}
