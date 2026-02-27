'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, Modal,
  Form, Input, Select, message, Popconfirm, Tooltip, Badge, Spin
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  SearchOutlined, ReloadOutlined, CheckCircleOutlined, StopOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select

interface Job {
  id: string
  title: string
  industry: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  status: string
  headcount: number
  applicationsCount: number
  createdAt: string
  publishedAt: string | null
}

interface JobListResponse {
  success: boolean
  data: Job[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const JOB_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  PUBLISHED: { color: 'success', label: '已发布' },
  CLOSED: { color: 'warning', label: '已关闭' },
  ARCHIVED: { color: 'default', label: '已归档' },
}

export default function JobsPage() {
  const sessionData = useSession()
  const { data: session, status } = sessionData || { data: null, status: 'loading' }
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchForm] = Form.useForm()

  // 获取企业ID（从session中获取）
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
    router.push('/login?callbackUrl=/enterprise/jobs')
    return null
  }

  // 加载岗位列表
  const fetchJobs = useCallback(async (page = 1, pageSize = 10, filters = {}) => {
    if (!enterpriseId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        enterpriseId,
        ...filters,
      })

      const res = await fetch(`/api/jobs?${params}`)
      const data: JobListResponse = await res.json()

      if (data.success) {
        setJobs(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.meta?.page || page,
          total: data.meta?.total || 0,
        }))
      } else {
        message.error('获取岗位列表失败')
      }
    } catch (error) {
      console.error('Fetch jobs error:', error)
      message.error('获取岗位列表失败')
    } finally {
      setLoading(false)
    }
  }, [enterpriseId])

  useEffect(() => {
    if (enterpriseId) {
      fetchJobs()
    }
  }, [enterpriseId, fetchJobs])

  // 搜索
  const handleSearch = (values: any) => {
    const filters: Record<string, string> = {}
    if (values.keyword) filters.keyword = values.keyword
    if (values.status) filters.status = values.status
    fetchJobs(1, pagination.pageSize, filters)
  }

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields()
    fetchJobs(1, pagination.pageSize)
  }

  // 发布岗位
  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('岗位已发布')
        fetchJobs(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '发布失败')
      }
    } catch (error) {
      message.error('发布失败')
    }
  }

  // 下架岗位
  const handleClose = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('岗位已下架')
        fetchJobs(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '下架失败')
      }
    } catch (error) {
      message.error('下架失败')
    }
  }

  // 删除岗位
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        message.success('岗位已删除')
        fetchJobs(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  // 表格列定义
  const columns: ColumnsType<Job> = [
    {
      title: '岗位名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: Job) => (
        <a onClick={() => router.push(`/enterprise/jobs/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '薪资范围',
      key: 'salary',
      width: 150,
      render: (_, record: Job) => {
        if (!record.salaryMin && !record.salaryMax) return '面议'
        const min = record.salaryMin ? `${(record.salaryMin / 1000).toFixed(0)}K` : ''
        const max = record.salaryMax ? `${(record.salaryMax / 1000).toFixed(0)}K` : ''
        return min && max ? `${min}-${max}` : min || max
      },
    },
    {
      title: '招聘人数',
      dataIndex: 'headcount',
      key: 'headcount',
      width: 100,
      align: 'center',
    },
    {
      title: '投递数',
      dataIndex: 'applicationsCount',
      key: 'applicationsCount',
      width: 80,
      align: 'center',
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = JOB_STATUS_CONFIG[status] || JOB_STATUS_CONFIG.DRAFT
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record: Job) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/enterprise/jobs/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => router.push(`/enterprise/jobs/${record.id}/edit`)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <Tooltip title="发布">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handlePublish(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'PUBLISHED' && (
            <Tooltip title="下架">
              <Button
                type="text"
                size="small"
                icon={<StopOutlined />}
                onClick={() => handleClose(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'DRAFT' && (
            <Popconfirm
              title="确定要删除这个岗位吗？"
              onConfirm={() => handleDelete(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="删除">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout role="enterprise">
      <div className="mb-6">
        <Title level={4} className="!mb-2">岗位管理</Title>
        <Text type="secondary">管理企业发布的所有岗位</Text>
      </div>

      {/* 搜索筛选 */}
      <Card className="mb-4">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              placeholder="搜索岗位名称"
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 200 }}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="岗位状态" allowClear style={{ width: 120 }}>
              <Option value="DRAFT">草稿</Option>
              <Option value="PUBLISHED">已发布</Option>
              <Option value="CLOSED">已关闭</Option>
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

      {/* 岗位列表 */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text strong>岗位列表</Text>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchJobs(pagination.current, pagination.pageSize)}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => router.push('/enterprise/jobs/create')}
            >
              发布岗位
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              const filters = searchForm.getFieldsValue()
              fetchJobs(page, pageSize, filters)
            },
          }}
        />
      </Card>
    </DashboardLayout>
  )
}
