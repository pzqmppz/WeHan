'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import {
  Card, Button, Space, Typography, Form, Select, Spin, Tabs, Statistic, Row, Col
} from 'antd'
import { SearchOutlined, ReloadOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useApplications } from '@/hooks/useApplications'
import { ApplicationsTable } from '@/components/applications'

const { Title, Text } = Typography
const { Option } = Select
const { TabPane } = Tabs

export default function ApplicationsPage() {
  const sessionData = useSession()
  const { data: session, status } = sessionData || { data: null, status: 'loading' }
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const [searchForm] = Form.useForm()

  const enterpriseId = (session?.user as any)?.enterpriseId

  const {
    applications,
    loading,
    pagination,
    statistics,
    fetchApplications,
    updateStatus,
  } = useApplications(enterpriseId)

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
    router.push('/login?callbackUrl=/enterprise/applications')
    return null
  }

  const handleTabChange = (key: string) => {
    setActiveTab(key)
    const filters: Record<string, string> = {}
    if (key !== 'all') {
      filters.status = key
    }
    fetchApplications(1, pagination.pageSize, filters)
  }

  const handleSearch = (values: any) => {
    const filters: Record<string, string> = {}
    if (activeTab !== 'all') filters.status = activeTab
    if (values.jobId) filters.jobId = values.jobId
    fetchApplications(1, pagination.pageSize, filters)
  }

  const handleReset = () => {
    searchForm.resetFields()
    const filters: Record<string, string> = activeTab !== 'all' ? { status: activeTab } : {}
    fetchApplications(1, pagination.pageSize, filters)
  }

  const handleRefresh = () => {
    const filters: Record<string, string> = activeTab !== 'all' ? { status: activeTab } : {}
    fetchApplications(pagination.current, pagination.pageSize, filters)
  }

  const handlePageChange = (page: number, pageSize: number) => {
    const filters: Record<string, string> = activeTab !== 'all' ? { status: activeTab } : {}
    fetchApplications(page, pageSize, filters)
  }

  return (
    <DashboardLayout role="enterprise">
      <div className="mb-6">
        <Title level={4} className="!mb-2">投递管理</Title>
        <Text type="secondary">管理求职者的投递申请</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日投递"
              value={statistics.today}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1677FF' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待处理"
              value={statistics.pending}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tab 筛选 */}
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="全部" key="all" />
          <TabPane tab={`待处理 (${statistics.pending})`} key="PENDING" />
          <TabPane tab="已查看" key="VIEWED" />
          <TabPane tab="面试中" key="INTERVIEWING" />
          <TabPane tab="已录用" key="OFFERED" />
          <TabPane tab="已拒绝" key="REJECTED" />
        </Tabs>

        <div className="mb-4 flex justify-between items-center">
          <Form form={searchForm} layout="inline" onFinish={handleSearch}>
            <Form.Item name="jobId">
              <Select
                placeholder="筛选岗位"
                allowClear
                style={{ width: 200 }}
              >
                <Option value="all">全部岗位</Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  搜索
                </Button>
                <Button onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Form.Item>
          </Form>

          <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
            刷新
          </Button>
        </div>

        <ApplicationsTable
          applications={applications}
          loading={loading}
          pagination={pagination}
          onUpdateStatus={updateStatus}
          onPageChange={handlePageChange}
        />
      </Card>
    </DashboardLayout>
  )
}
