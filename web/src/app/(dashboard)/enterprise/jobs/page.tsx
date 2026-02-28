'use client'

import React from 'react'
import {
  Card, Button, Space, Typography, Form, Input, Select, Spin
} from 'antd'
import {
  PlusOutlined, SearchOutlined, ReloadOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useJobs } from '@/hooks/useJobs'
import { JobsTable } from '@/components/jobs'

const { Title, Text } = Typography
const { Option } = Select

export default function JobsPage() {
  const sessionData = useSession()
  const { data: session, status } = sessionData || { data: null, status: 'loading' }
  const router = useRouter()
  const [searchForm] = Form.useForm()

  const enterpriseId = (session?.user as any)?.enterpriseId

  const {
    jobs,
    loading,
    pagination,
    fetchJobs,
    publishJob,
    closeJob,
    deleteJob,
  } = useJobs(enterpriseId)

  if (status === 'loading') {
    return (
      <DashboardLayout role="enterprise">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/enterprise/jobs')
    return null
  }

  const handleSearch = (values: any) => {
    const filters: Record<string, string> = {}
    if (values.keyword) filters.keyword = values.keyword
    if (values.status) filters.status = values.status
    fetchJobs(1, pagination.pageSize, filters)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchJobs(1, pagination.pageSize)
  }

  const handlePageChange = (page: number, pageSize: number) => {
    const filters = searchForm.getFieldsValue()
    fetchJobs(page, pageSize, filters)
  }

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

        <JobsTable
          jobs={jobs}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPublish={publishJob}
          onClose={closeJob}
          onDelete={deleteJob}
        />
      </Card>
    </DashboardLayout>
  )
}
