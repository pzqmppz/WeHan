'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Tag, Typography, Space, Button, List, Spin } from 'antd'
import {
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useEnterpriseDashboard } from '@/hooks'

const { Title, Text } = Typography

export default function EnterpriseDashboard() {
  const { data, loading, error, refetch } = useEnterpriseDashboard()

  if (loading) {
    return (
      <DashboardLayout role="enterprise">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout role="enterprise">
        <div className="text-center py-12">
          <Text type="danger">加载失败: {error.message}</Text>
          <Button icon={<ReloadOutlined />} onClick={refetch} className="mt-4">
            重试
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const { statistics, recentApplications, hotJobs } = data!

  return (
    <DashboardLayout role="enterprise">
      <div className="flex items-center justify-between mb-6">
        <Title level={4} className="!mb-0">首页概览</Title>
        <Button icon={<ReloadOutlined />} onClick={refetch}>
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日新增投递"
              value={statistics.todayApplications}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1677FF' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待处理简历"
              value={statistics.pendingResumes}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#FAAD14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日面试"
              value={statistics.todayInterviews}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已录用"
              value={statistics.hired}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ED1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最新投递 */}
        <Col xs={24} lg={14}>
          <Card
            title="最新投递"
            extra={<a href="/dashboard/enterprise/applications">查看全部</a>}
          >
            <List
              dataSource={recentApplications}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Text type="secondary" key="time">{item.time}</Text>,
                    <Button type="link" size="small" key="view">查看</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-medium">
                        {item.name[0]}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{item.name}</Text>
                        <Tag color="blue">{item.position}</Tag>
                      </Space>
                    }
                    description={
                      <Space split={<Text type="secondary">|</Text>}>
                        <Text type="secondary">{item.school}</Text>
                        <Text type="success">面试评分: {item.score}分</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 热门岗位 */}
        <Col xs={24} lg={10}>
          <Card
            title="热门岗位"
            extra={
              <Button type="primary" icon={<PlusOutlined />} size="small">
                发布岗位
              </Button>
            }
          >
            <List
              dataSource={hotJobs}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                          index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-gray-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                    }
                    title={item.title}
                    description={
                      <Space split={<Text type="secondary">|</Text>}>
                        <Text type="secondary">{item.applications} 人投递</Text>
                        <Text type="secondary">{item.views} 次浏览</Text>
                      </Space>
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
