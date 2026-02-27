'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, message, Popconfirm, Tooltip, Spin
} from 'antd'
import { ReloadOutlined, StopOutlined, CheckCircleOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface User {
  id: string
  email: string
  name: string
  role: string
  status: string
  schoolId: string | null
  enterpriseId: string | null
  createdAt: string
  School?: { id: string; name: string } | null
  Enterprise?: { id: string; name: string; industry: string | null } | null
}

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  STUDENT: { label: '学生', color: 'blue' },
  ENTERPRISE: { label: '企业', color: 'green' },
  SCHOOL: { label: '学校', color: 'orange' },
  GOVERNMENT: { label: '政府', color: 'purple' },
  ADMIN: { label: '管理员', color: 'red' },
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: '正常', color: 'success' },
  INACTIVE: { label: '禁用', color: 'default' },
  PENDING: { label: '待审核', color: 'warning' },
  REJECTED: { label: '已拒绝', color: 'error' },
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchUsers = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })

      const res = await fetch(`/api/users?${params}`)
      const data = await res.json()

      if (data.success) {
        setUsers(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.pagination?.page || page,
          total: data.pagination?.total || 0,
        }))
      } else {
        message.error('获取用户列表失败')
      }
    } catch (error) {
      console.error('Fetch users error:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchUsers()
    }
  }, [session, fetchUsers])

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('状态已更新')
        fetchUsers(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '更新失败')
      }
    } catch (error) {
      message.error('更新失败')
    }
  }

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
    router.push('/login?callbackUrl=/admin/users')
    return null
  }

  const columns: ColumnsType<User> = [
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => {
        const config = ROLE_LABELS[role] || { label: role, color: 'default' }
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '关联机构',
      key: 'organization',
      width: 200,
      render: (_, record: User) => {
        if (record.School) return record.School.name
        if (record.Enterprise) return record.Enterprise.name
        return '-'
      },
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
      width: 120,
      fixed: 'right',
      render: (_, record: User) => (
        <Space size="small">
          {record.status !== 'ACTIVE' && (
            <Tooltip title="启用">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleUpdateStatus(record.id, 'ACTIVE')}
              />
            </Tooltip>
          )}
          {record.status === 'ACTIVE' && (
            <Popconfirm
              title="确定要禁用该用户吗？"
              onConfirm={() => handleUpdateStatus(record.id, 'INACTIVE')}
              okText="确定"
              cancelText="取消"
            >
              <Tooltip title="禁用">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<StopOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Title level={4} className="!mb-2">用户管理</Title>
        <Text type="secondary">管理平台所有用户</Text>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text strong>用户列表</Text>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchUsers(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
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
              fetchUsers(page, pageSize)
            },
          }}
        />
      </Card>
    </DashboardLayout>
  )
}
