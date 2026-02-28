'use client'

import React from 'react'
import {
  Card, Button, Space, Typography, Form, Input, Select, Spin, Row, Col, Statistic
} from 'antd'
import {
  SearchOutlined, ReloadOutlined, UserOutlined,
  TrophyOutlined, TeamOutlined, RiseOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTalentPool } from '@/hooks/useTalentPool'
import { TalentTable } from '@/components/talent'

const { Title, Text } = Typography
const { Option } = Select

export default function TalentPoolPage() {
  const sessionData = useSession()
  const { data: session, status } = sessionData || { data: null, status: 'loading' }
  const router = useRouter()
  const [searchForm] = Form.useForm()

  const { talents, loading, pagination, statistics, fetchTalents, fetchStatistics } = useTalentPool()

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
    router.push('/login?callbackUrl=/enterprise/talent')
    return null
  }

  const handleSearch = (values: any) => {
    const filters: Record<string, string> = {}
    if (values.keyword) filters.keyword = values.keyword
    if (values.status) filters.status = values.status
    fetchTalents(1, pagination.pageSize, filters)
  }

  const handleReset = () => {
    searchForm.resetFields()
    fetchTalents(1, pagination.pageSize)
  }

  const handlePageChange = (page: number, pageSize: number) => {
    const filters = searchForm.getFieldsValue()
    fetchTalents(page, pageSize, filters)
  }

  return (
    <DashboardLayout role="enterprise">
      <div className="mb-6">
        <Title level={4} className="!mb-2">人才库</Title>
        <Text type="secondary">查看投递过贵公司岗位的候选人</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={16} className="mb-4">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="人才总数"
              value={statistics?.totalTalents || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="本周新增"
              value={statistics?.newThisWeek || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="面试中"
              value={statistics?.interviewed || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已录用"
              value={statistics?.offered || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选 */}
      <Card className="mb-4">
        <Form form={searchForm} layout="inline" onFinish={handleSearch}>
          <Form.Item name="keyword">
            <Input
              placeholder="搜索姓名、邮箱、技能"
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 220 }}
            />
          </Form.Item>
          <Form.Item name="status">
            <Select placeholder="投递状态" allowClear style={{ width: 120 }}>
              <Option value="PENDING">待处理</Option>
              <Option value="VIEWED">已查看</Option>
              <Option value="INTERVIEWING">面试中</Option>
              <Option value="OFFERED">已录用</Option>
              <Option value="REJECTED">已拒绝</Option>
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

      {/* 人才列表 */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Text strong>候选人列表</Text>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              fetchStatistics()
              fetchTalents(pagination.current, pagination.pageSize)
            }}
          >
            刷新
          </Button>
        </div>

        <TalentTable
          talents={talents}
          loading={loading}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </Card>
    </DashboardLayout>
  )
}
