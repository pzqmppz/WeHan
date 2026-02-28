'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Card, Table, Button, Space, Tag, Typography, App, Tooltip, Spin, Modal, Form, Select
} from 'antd'
import { ReloadOutlined, PlusOutlined, CheckCircleOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'

const { Title, Text } = Typography
const { Option } = Select

interface Job {
  id: string
  title: string
  Enterprise: {
    id: string
    name: string
    industry: string | null
  }
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
}

interface PushRecord {
  id: string
  jobId: string
  schoolId: string
  targetMajors: string[]
  pushCount: number
  createdAt: string
  Job: {
    id: string
    title: string
    Enterprise: {
      id: string
      name: string
      industry: string | null
    }
  }
}

export default function SchoolPushPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { message } = App.useApp()
  const [records, setRecords] = useState<PushRecord[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [pushLoading, setPushLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [pushModalOpen, setPushModalOpen] = useState(false)
  const [form] = Form.useForm()

  const schoolId = (session?.user as any)?.schoolManagedId

  const fetchRecords = useCallback(async (page = 1, pageSize = 10) => {
    if (!schoolId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        schoolId,
      })

      const res = await fetch(`/api/job-push/records?${params}`)
      const data = await res.json()

      if (data.success) {
        setRecords(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.pagination?.page || page,
          total: data.pagination?.total || 0,
        }))
      } else {
        message.error('获取推送记录失败')
      }
    } catch (error) {
      console.error('Fetch records error:', error)
      message.error('获取推送记录失败')
    } finally {
      setLoading(false)
    }
  }, [schoolId])

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/open/jobs?pageSize=100')
      const data = await res.json()

      if (data.success) {
        setJobs(data.data)
      }
    } catch (error) {
      console.error('Fetch jobs error:', error)
    }
  }, [])

  useEffect(() => {
    if (schoolId) {
      fetchRecords()
      fetchJobs()
    }
  }, [schoolId, fetchRecords, fetchJobs])

  const handlePush = async (values: { jobId: string; targetMajors: string[] }) => {
    if (!schoolId) return

    setPushLoading(true)
    try {
      const res = await fetch('/api/job-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: values.jobId,
          schoolId,
          targetMajors: values.targetMajors || [],
        }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('岗位推送成功')
        setPushModalOpen(false)
        form.resetFields()
        fetchRecords(pagination.current, pagination.pageSize)
      } else {
        message.error(data.error || '推送失败')
      }
    } catch (error) {
      message.error('推送失败')
    } finally {
      setPushLoading(false)
    }
  }

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
    router.push('/login?callbackUrl=/school/push')
    return null
  }

  const columns: ColumnsType<PushRecord> = [
    {
      title: '岗位名称',
      key: 'title',
      width: 200,
      render: (_, record) => record.Job?.title || '-',
    },
    {
      title: '所属企业',
      key: 'enterprise',
      width: 200,
      render: (_, record) => record.Job?.Enterprise?.name || '-',
    },
    {
      title: '目标专业',
      dataIndex: 'targetMajors',
      key: 'targetMajors',
      width: 200,
      render: (majors: string[]) =>
        majors.length > 0 ? majors.join(', ') : '全部专业',
    },
    {
      title: '推送次数',
      dataIndex: 'pushCount',
      key: 'pushCount',
      width: 100,
      align: 'center',
    },
    {
      title: '推送时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
  ]

  return (
    <DashboardLayout role="school">
      <div className="mb-6">
        <Title level={4} className="!mb-2">岗位推送</Title>
        <Text type="secondary">向本学校学生推送优质岗位</Text>
      </div>

      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text strong>推送记录</Text>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchRecords(pagination.current, pagination.pageSize)}
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setPushModalOpen(true)}
            >
              推送岗位
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={records}
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
              fetchRecords(page, pageSize)
            },
          }}
        />
      </Card>

      <Modal
        title="推送岗位"
        open={pushModalOpen}
        onOk={() => form.submit()}
        onCancel={() => {
          setPushModalOpen(false)
          form.resetFields()
        }}
        confirmLoading={pushLoading}
        okText="确认推送"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" onFinish={handlePush}>
          <Form.Item
            name="jobId"
            label="选择岗位"
            rules={[{ required: true, message: '请选择要推送的岗位' }]}
          >
            <Select
              placeholder="请选择岗位"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {jobs.map((job) => (
                <Option key={job.id} value={job.id}>
                  {job.title} - {job.Enterprise?.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="targetMajors"
            label="目标专业"
            help="不选择则推送给所有专业学生"
          >
            <Select
              mode="tags"
              placeholder="输入专业名称，回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  )
}
