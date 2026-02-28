/**
 * 管理员端 - 岗位管理页面
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, Popconfirm, Tooltip, Spin, Select, Input
} from 'antd'
import {
  EyeOutlined, ReloadOutlined, DeleteOutlined,
  SearchOutlined, CheckCircleOutlined, StopOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select
const { Search } = Input

interface Job {
  id: string
  title: string
  industry: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  status: string
  freshGraduate: boolean
  headcount: number
  createdAt: string
  Enterprise: {
    id: string
    name: string
    industry: string | null
  }
}

const JOB_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  PUBLISHED: { label: '已发布', color: 'success' },
  CLOSED: { label: '已关闭', color: 'warning' },
  ARCHIVED: { label: '已归档', color: 'default' },
}

export default function AdminJobsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statusFilter, setStatusFilter] = useState<string>()
  const [keyword, setKeyword] = useState('')

  const fetchJobs = useCallback(async (page = 1, pageSize = 10, jobStatus?: string, searchKeyword?: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        all: 'true', // 获取所有企业的岗位
      })
      if (jobStatus) params.append('status', jobStatus)
      if (searchKeyword) params.append('keyword', searchKeyword)

      const res = await fetch(`/api/jobs?${params}`)
      const data = await res.json()

      if (data.success) {
        setJobs(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.pagination?.page || page,
          total: data.pagination?.total || 0,
        }))
      } else {
        // 使用 window.alert 因为 message 可能不可用
        window.alert(data.error || '获取岗位列表失败')
      }
    } catch (error) {
      console.error('Fetch jobs error:', error)
      window.alert('获取岗位列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchJobs()
    }
  }, [session, fetchJobs])

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
    router.push('/login?callbackUrl=/admin/jobs')
    return null
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (data.success) {
        window.alert(newStatus === 'PUBLISHED' ? '岗位已发布' : '岗位已下架')
        fetchJobs(pagination.current, pagination.pageSize, statusFilter, keyword)
      } else {
        window.alert(data.error || '操作失败')
      }
    } catch (error) {
      window.alert('操作失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        window.alert('岗位已删除')
        fetchJobs(pagination.current, pagination.pageSize, statusFilter, keyword)
      } else {
        window.alert(data.error || '删除失败')
      }
    } catch (error) {
      window.alert('删除失败')
    }
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return '面议'
    if (min && max) return `${(min / 1000).toFixed(0)}-${(max / 1000).toFixed(0)}K`
    if (min) return `${(min / 1000).toFixed(0)}K起`
    return `最高${(max! / 1000).toFixed(0)}K`
  }

  const columns: ColumnsType<Job> = [
    {
      title: '岗位名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record: Job) => (
        <a onClick={() => router.push(`/admin/jobs/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: '所属企业',
      dataIndex: ['Enterprise', 'name'],
      key: 'enterpriseName',
      width: 180,
      render: (name: string) => name || '-',
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      render: (industry: string) => industry || '-',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (location: string) => location || '-',
    },
    {
      title: '薪资',
      key: 'salary',
      width: 120,
      render: (_, record: Job) => formatSalary(record.salaryMin, record.salaryMax),
    },
    {
      title: '招聘人数',
      dataIndex: 'headcount',
      key: 'headcount',
      width: 100,
      render: (count: number) => `${count}人`,
    },
    {
      title: '应届',
      dataIndex: 'freshGraduate',
      key: 'freshGraduate',
      width: 80,
      render: (is: boolean) => is ? <Tag color="blue">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = JOB_STATUS_LABELS[status] || JOB_STATUS_LABELS.DRAFT
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
      width: 150,
      fixed: 'right',
      render: (_, record: Job) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/admin/jobs/${record.id}`)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <Tooltip title="发布">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleStatusChange(record.id, 'PUBLISHED')}
              />
            </Tooltip>
          )}
          {record.status === 'PUBLISHED' && (
            <Tooltip title="下架">
              <Button
                type="text"
                size="small"
                icon={<StopOutlined />}
                onClick={() => handleStatusChange(record.id, 'CLOSED')}
              />
            </Tooltip>
          )}
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
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Title level={4} className="!mb-2">岗位管理</Title>
        <Text type="secondary">管理平台所有岗位信息</Text>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center flex-wrap gap-4">
          <Space wrap>
            <Select
              placeholder="状态筛选"
              allowClear
              style={{ width: 120 }}
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value)
                fetchJobs(1, pagination.pageSize, value, keyword)
              }}
            >
              <Option value="DRAFT">草稿</Option>
              <Option value="PUBLISHED">已发布</Option>
              <Option value="CLOSED">已关闭</Option>
            </Select>
            <Search
              placeholder="搜索岗位名称"
              allowClear
              style={{ width: 200 }}
              onSearch={(value) => {
                setKeyword(value)
                fetchJobs(1, pagination.pageSize, statusFilter, value)
              }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchJobs(pagination.current, pagination.pageSize, statusFilter, keyword)}
            >
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={jobs}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              fetchJobs(page, pageSize, statusFilter, keyword)
            },
          }}
        />
      </Card>
    </DashboardLayout>
  )
}
