/**
 * 管理员端 - 政策管理页面
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, Popconfirm, Tooltip, Spin, App
} from 'antd'
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  ReloadOutlined, CheckCircleOutlined, StopOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography

interface Policy {
  id: string
  title: string
  type: string
  summary: string | null
  isActive: boolean
  effectiveDate: string | null
  expiryDate: string | null
  createdAt: string
}

const POLICY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  SUBSIDY: { label: '补贴政策', color: 'blue' },
  HOUSING: { label: '住房政策', color: 'green' },
  TALENT: { label: '人才政策', color: 'orange' },
  ENTREPRENEUR: { label: '创业政策', color: 'purple' },
  OTHER: { label: '其他政策', color: 'default' },
}

export default function AdminPoliciesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchPolicies = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        includeInactive: 'true',
      })

      const res = await fetch(`/api/policies?${params}`)
      const data = await res.json()

      if (data.success) {
        setPolicies(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.pagination?.page || page,
          total: data.pagination?.total || 0,
        }))
      } else {
        message.error('获取政策列表失败')
      }
    } catch (error) {
      console.error('Fetch policies error:', error)
      message.error('获取政策列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchPolicies()
    }
  }, [session, fetchPolicies])

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
    router.push('/login?callbackUrl=/admin/policies')
    return null
  }

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/policies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('政策已发布')
        fetchPolicies(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '发布失败')
      }
    } catch (error) {
      message.error('发布失败')
    }
  }

  const handleUnpublish = async (id: string) => {
    try {
      const res = await fetch(`/api/policies/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unpublish' }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('政策已下架')
        fetchPolicies(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '下架失败')
      }
    } catch (error) {
      message.error('下架失败')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/policies/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        message.success('政策已删除')
        fetchPolicies(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '删除失败')
      }
    } catch (error) {
      message.error('删除失败')
    }
  }

  const columns: ColumnsType<Policy> = [
    {
      title: '政策标题',
      dataIndex: 'title',
      key: 'title',
      width: 250,
    },
    {
      title: '政策类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const config = POLICY_TYPE_LABELS[type] || POLICY_TYPE_LABELS.OTHER
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '摘要',
      dataIndex: 'summary',
      key: 'summary',
      width: 300,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? '已发布' : '已下架'}
        </Tag>
      ),
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 120,
      render: (date: string) => date ? new Date(date).toLocaleDateString('zh-CN') : '-',
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
      render: (_, record: Policy) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/admin/policies/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => router.push(`/admin/policies/${record.id}/edit`)}
            />
          </Tooltip>
          {record.isActive ? (
            <Tooltip title="下架">
              <Button
                type="text"
                size="small"
                icon={<StopOutlined />}
                onClick={() => handleUnpublish(record.id)}
              />
            </Tooltip>
          ) : (
            <Tooltip title="发布">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handlePublish(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个政策吗？"
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
        <Title level={4} className="!mb-2">政策管理</Title>
        <Text type="secondary">管理平台所有政策信息</Text>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchPolicies(pagination.current, pagination.pageSize)}
            >
              刷新
            </Button>
          </Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/policies/create')}
          >
            发布政策
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={policies}
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
              fetchPolicies(page, pageSize)
            },
          }}
        />
      </Card>
    </DashboardLayout>
  )
}
