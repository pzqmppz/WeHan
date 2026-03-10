'use client'

import React from 'react'
import { Card, Row, Col, Tag, Typography, Space, List, Badge } from 'antd'
import {
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useEnterpriseDashboard } from '@/hooks'
import { useRouter } from 'next/navigation'
import { PageHeader, LoadingState } from '@/components/ui'

const { Title, Text } = Typography

export default function EnterpriseDashboard() {
  const router = useRouter()
  const { data, loading, error, refetch } = useEnterpriseDashboard()

  if (loading) {
    return (
      <DashboardLayout role="enterprise">
        <PageHeader title="首页概览" onReload={refetch} />
        <LoadingState message="加载投递数据中..." />
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="enterprise">
        <PageHeader title="首页概览" />
        <div className="text-center py-12">
          <Text type="danger">加载失败: {error.message}</Text>
          <Space className="mt-4">
            <button onClick={refetch} className="text-blue-600 hover:underline">重试</button>
          </Space>
        </div>
      </DashboardLayout>
    )
  }

  const { statistics, recentApplications, hotJobs } = data!

  return (
    <DashboardLayout role="enterprise">
      <PageHeader title="首页概览" onReload={refetch} showReload={false} />

      {/* 企业端统计卡片 - 紧凑、行动导向，带入场动画 */}
      <Row gutter={[12, 12]} className="mb-6">
        {/* 今日新增投递 - 可点击 */}
        <Col xs={12} sm={6}>
          <Card
            className="cursor-pointer hover:border-blue-400 transition-colors card-hover animate-fade-in animate-delay-100"
            onClick={() => router.push('/enterprise/applications')}
            hoverable
          >
            <div className="flex items-start justify-between">
              <div>
                <Text type="secondary" className="text-xs">今日新增</Text>
                <div className="text-2xl font-bold text-blue-600 mt-1">{statistics.todayApplications}</div>
                <Text type="secondary" className="text-xs">投递简历</Text>
              </div>
              <FileTextOutlined className="text-blue-400 text-lg" />
            </div>
          </Card>
        </Col>

        {/* 待处理简历 - 警告色、可点击 */}
        <Col xs={12} sm={6}>
          <Card
            className="cursor-pointer hover:border-orange-400 transition-colors relative card-hover animate-fade-in animate-delay-200"
            onClick={() => router.push('/enterprise/applications?status=PENDING')}
            hoverable
          >
            {statistics.pendingResumes > 0 && (
              <div className="absolute -top-1 -right-1">
                <Badge count={statistics.pendingResumes} size="small" className="badge-animate" />
              </div>
            )}
            <div className="flex items-start justify-between">
              <div>
                <Text type="secondary" className="text-xs">待处理</Text>
                <div className="text-2xl font-bold text-orange-500 mt-1 stat-number">{statistics.pendingResumes}</div>
                <Text type="secondary" className="text-xs">需要查看</Text>
              </div>
              <ClockCircleOutlined className="text-orange-400 text-lg" />
            </div>
          </Card>
        </Col>

        {/* 今日面试 - 可点击 */}
        <Col xs={12} sm={6}>
          <Card
            className="cursor-pointer hover:border-green-400 transition-colors card-hover animate-fade-in animate-delay-300"
            onClick={() => router.push('/enterprise/interviews')}
            hoverable
          >
            <div className="flex items-start justify-between">
              <div>
                <Text type="secondary" className="text-xs">今日面试</Text>
                <div className="text-2xl font-bold text-green-600 mt-1 stat-number">{statistics.todayInterviews}</div>
                <Text type="secondary" className="text-xs">场安排</Text>
              </div>
              <TeamOutlined className="text-green-400 text-lg" />
            </div>
          </Card>
        </Col>

        {/* 已录用 - 可点击 */}
        <Col xs={12} sm={6}>
          <Card
            className="cursor-pointer hover:border-purple-400 transition-colors card-hover animate-fade-in animate-delay-400"
            onClick={() => router.push('/enterprise/applications?status=OFFERED')}
            hoverable
          >
            <div className="flex items-start justify-between">
              <div>
                <Text type="secondary" className="text-xs">已录用</Text>
                <div className="text-2xl font-bold text-purple-600 mt-1 stat-number">{statistics.hired}</div>
                <Text type="secondary" className="text-xs">位人才</Text>
              </div>
              <EyeOutlined className="text-purple-400 text-lg" />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最新投递 - 紧凑列表 */}
        <Col xs={24} lg={14}>
          <Card
            title="最新投递"
            extra={<a href="/enterprise/applications">全部 <ArrowRightOutlined /></a>}
          >
            <List
              dataSource={recentApplications}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <button type="button" className="text-blue-600 hover:underline text-sm">查看简历</button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium text-sm">
                        {item.name[0]}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color="blue" className="mb-0">{item.position}</Tag>
                      </Space>
                    }
                    description={
                      <Space split={<span className="text-gray-300">|</span>}>
                        <Text type="secondary" className="text-xs">{item.school}</Text>
                        <Text type="secondary" className="text-xs">{item.time}</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 热门岗位 - 排名式 */}
        <Col xs={24} lg={10}>
          <Card
            title="热门岗位"
            extra={
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                onClick={() => router.push('/enterprise/jobs/create')}
              >
                <PlusOutlined className="mr-1" />发布
              </button>
            }
          >
            <List
              dataSource={hotJobs}
              renderItem={(item, index) => (
                <List.Item
                  className="cursor-pointer hover:bg-gray-50 px-2 -mx-2 rounded"
                  onClick={() => router.push(`/enterprise/jobs/${item.id}`)}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                          index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <Text strong className="text-sm">{item.title}</Text>
                        <Text type="secondary" className="text-xs">{item.applications} 投递</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
