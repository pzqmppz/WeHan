'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, App, Tooltip, Spin
} from 'antd'
import { ReloadOutlined, CheckCircleOutlined, EyeOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'
import VerifyModal from '@/components/admin/VerifyModal'

const { Title, Text } = Typography

interface Enterprise {
  id: string
  name: string
  industry: string
  scale: string
  verified: boolean
  contactName: string | null
  contactPhone: string | null
  createdAt: string
  _count?: { Job: number; User: number }
}

export default function AdminEnterprisesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [enterprises, setEnterprises] = useState<Enterprise[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [selectedEnterprise, setSelectedEnterprise] = useState<Enterprise | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const fetchEnterprises = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })

      const res = await fetch(`/api/admin/enterprises?${params}`)
      const data = await res.json()

      if (data.success) {
        setEnterprises(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.pagination?.page || page,
          total: data.pagination?.total || 0,
        }))
      } else {
        message.error('获取企业列表失败')
      }
    } catch (error) {
      console.error('Fetch enterprises error:', error)
      message.error('获取企业列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchEnterprises()
    }
  }, [session, fetchEnterprises])

  const handleVerify = async (verified: boolean, reason?: string) => {
    if (!selectedEnterprise) return

    setVerifyLoading(true)
    try {
      const res = await fetch(`/api/admin/enterprises/${selectedEnterprise.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      })
      const data = await res.json()

      if (data.success) {
        message.success(verified ? '企业已通过认证' : '企业认证已拒绝')
        setVerifyModalOpen(false)
        setSelectedEnterprise(null)
        fetchEnterprises(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    } finally {
      setVerifyLoading(false)
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
    router.push('/login?callbackUrl=/admin/enterprises')
    return null
  }

  const columns: ColumnsType<Enterprise> = [
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '规模',
      dataIndex: 'scale',
      key: 'scale',
      width: 100,
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 130,
      render: (text: string) => text || '-',
    },
    {
      title: '岗位数',
      key: 'jobCount',
      width: 80,
      render: (_, record: Enterprise) => record._count?.Job || 0,
    },
    {
      title: '认证状态',
      dataIndex: 'verified',
      key: 'verified',
      width: 100,
      render: (verified: boolean) => (
        <Tag color={verified ? 'success' : 'warning'}>
          {verified ? '已认证' : '待认证'}
        </Tag>
      ),
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
      render: (_, record: Enterprise) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/admin/enterprises/${record.id}`)}
            />
          </Tooltip>
          {!record.verified && (
            <Tooltip title="审核">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedEnterprise(record)
                  setVerifyModalOpen(true)
                }}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ]

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Title level={4} className="!mb-2">企业管理</Title>
        <Text type="secondary">管理入驻企业，审核企业资质</Text>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text strong>企业列表</Text>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchEnterprises(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={enterprises}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1100 }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              fetchEnterprises(page, pageSize)
            },
          }}
        />
      </Card>

      <VerifyModal
        open={verifyModalOpen}
        title={`审核企业: ${selectedEnterprise?.name || ''}`}
        onConfirm={handleVerify}
        onCancel={() => {
          setVerifyModalOpen(false)
          setSelectedEnterprise(null)
        }}
        loading={verifyLoading}
      />
    </DashboardLayout>
  )
}
