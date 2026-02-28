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

interface School {
  id: string
  name: string
  type: string
  level: string
  verified: boolean
  contactName: string | null
  contactPhone: string | null
  createdAt: string
  _count?: { User: number; JobPushRecord: number }
}

export default function AdminSchoolsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [verifyLoading, setVerifyLoading] = useState(false)

  const fetchSchools = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })

      const res = await fetch(`/api/schools?${params}`)
      const data = await res.json()

      if (data.success) {
        setSchools(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.pagination?.page || page,
          total: data.pagination?.total || 0,
        }))
      } else {
        message.error('获取学校列表失败')
      }
    } catch (error) {
      console.error('Fetch schools error:', error)
      message.error('获取学校列表失败')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session) {
      fetchSchools()
    }
  }, [session, fetchSchools])

  const handleVerify = async (verified: boolean, reason?: string) => {
    if (!selectedSchool) return

    setVerifyLoading(true)
    try {
      const res = await fetch(`/api/schools/${selectedSchool.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified }),
      })
      const data = await res.json()

      if (data.success) {
        message.success(verified ? '学校已通过认证' : '学校认证已拒绝')
        setVerifyModalOpen(false)
        setSelectedSchool(null)
        fetchSchools(pagination.current, pagination.pageSize)
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
    router.push('/login?callbackUrl=/admin/schools')
    return null
  }

  const columns: ColumnsType<School> = [
    {
      title: '学校名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
    },
    {
      title: '层次',
      dataIndex: 'level',
      key: 'level',
      width: 80,
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
      title: '学生数',
      key: 'studentCount',
      width: 80,
      render: (_, record: School) => record._count?.User || 0,
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
      render: (_, record: School) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/admin/schools/${record.id}`)}
            />
          </Tooltip>
          {!record.verified && (
            <Tooltip title="审核">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  setSelectedSchool(record)
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
        <Title level={4} className="!mb-2">学校管理</Title>
        <Text type="secondary">管理合作学校，审核学校资质</Text>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text strong>学校列表</Text>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchSchools(pagination.current, pagination.pageSize)}
          >
            刷新
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={schools}
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
              fetchSchools(page, pageSize)
            },
          }}
        />
      </Card>

      <VerifyModal
        open={verifyModalOpen}
        title={`审核学校: ${selectedSchool?.name || ''}`}
        onConfirm={handleVerify}
        onCancel={() => {
          setVerifyModalOpen(false)
          setSelectedSchool(null)
        }}
        loading={verifyLoading}
      />
    </DashboardLayout>
  )
}
