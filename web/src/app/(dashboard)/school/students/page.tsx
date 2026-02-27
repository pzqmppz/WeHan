'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, message, Tooltip, Spin, Input, Select
} from 'antd'
import { ReloadOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select

interface Student {
  id: string
  email: string
  name: string
  major: string | null
  graduationYear: number | null
  status: string
  createdAt: string
  Resume?: {
    id: string
    education: any
  } | null
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '正常', color: 'success' },
  INACTIVE: { label: '禁用', color: 'default' },
  PENDING: { label: '待审核', color: 'warning' },
  REJECTED: { label: '已拒绝', color: 'error' },
}

export default function SchoolStudentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [keyword, setKeyword] = useState('')

  const schoolId = (session?.user as any)?.schoolManagedId

  const fetchStudents = useCallback(async (page = 1, pageSize = 10, searchKeyword?: string) => {
    if (!schoolId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        schoolId,
        role: 'STUDENT',
      })
      if (searchKeyword) params.append('keyword', searchKeyword)

      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()

      if (data.success) {
        setStudents(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.pagination?.page || page,
          total: data.pagination?.total || 0,
        }))
      } else {
        message.error('获取学生列表失败')
      }
    } catch (error) {
      console.error('Fetch students error:', error)
      message.error('获取学生列表失败')
    } finally {
      setLoading(false)
    }
  }, [schoolId])

  useEffect(() => {
    if (schoolId) {
      fetchStudents()
    }
  }, [schoolId, fetchStudents])

  if (status === 'loading') {
    return (
      <DashboardLayout role="school">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/school/students')
    return null
  }

  const handleSearch = () => {
    fetchStudents(1, pagination.pageSize, keyword)
  }

  const columns: ColumnsType<Student> = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '专业',
      dataIndex: 'major',
      key: 'major',
      width: 150,
      render: (text: string) => text || '-',
    },
    {
      title: '毕业年份',
      dataIndex: 'graduationYear',
      key: 'graduationYear',
      width: 100,
      render: (year: number) => year || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = STATUS_LABELS[status] || STATUS_LABELS.PENDING
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record: Student) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/school/students/${record.id}`)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout role="school">
      <div className="mb-6">
        <Title level={4} className="!mb-2">学生管理</Title>
        <Text type="secondary">管理本学校学生信息</Text>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Input
              placeholder="搜索姓名或邮箱"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 200 }}
            />
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
          </Space>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchStudents(pagination.current, pagination.pageSize, keyword)}
            >
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={students}
          rowKey="id"
          loading={loading}
          scroll={{ x: 900 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              fetchStudents(page, pageSize, keyword)
            },
          }}
        />
      </Card>
    </DashboardLayout>
  )
}
