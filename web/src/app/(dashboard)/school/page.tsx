'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Statistic, Typography, Progress, List, Button, Tag, Space, Spin } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  NotificationOutlined,
  UserOutlined,
  SendOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { EmploymentChart } from '@/components/charts'

const { Title, Text } = Typography

export default function SchoolDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const schoolId = (session?.user as any)?.schoolManagedId

  const fetchStats = useCallback(async () => {
    if (!schoolId) return

    setLoading(true)
    try {
      const res = await fetch(`/api/statistics/school?schoolId=${schoolId}`)
      const data = await res.json()

      if (data.success) {
        setStats(data.data.employmentStats)
      }
    } catch (error) {
      console.error('Fetch stats error:', error)
    } finally {
      setLoading(false)
    }
  }, [schoolId])

  useEffect(() => {
    if (schoolId) {
      fetchStats()
    }
  }, [schoolId, fetchStats])

  if (status === 'loading') {
    return (
      <DashboardLayout role="school">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  // 模拟数据用于展示
  const majorData = stats?.topIndustries || [
    { industry: '互联网/IT', count: 180 },
    { industry: '智能制造', count: 150 },
    { industry: '金融', count: 120 },
  ]

  const recentPushes = [
    { id: 1, job: '前端开发工程师', company: '小米武汉', target: '计算机学院', count: 45 },
    { id: 2, job: '产品经理', company: '斗鱼直播', target: '商学院', count: 32 },
    { id: 3, job: '算法工程师', company: '字节跳动', target: '人工智能学院', count: 28 },
  ]

  return (
    <DashboardLayout role="school">
      <div className="mb-6">
        <Title level={4} className="!mb-2">就业数据看板</Title>
        <Text type="secondary">学校就业数据概览</Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="毕业生总数"
              value={2400}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已就业"
              value={1980}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="就业率"
              value={82.5}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="留汉率"
              value={68}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 行业去向 */}
        <Col xs={24} lg={14}>
          <Card title="学生去向行业分布">
            <List
              dataSource={majorData}
              renderItem={(item: any) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <Text>{item.industry}</Text>
                      <Text strong>{item.count} 人</Text>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近推送 */}
        <Col xs={24} lg={10}>
          <Card
            title="最近岗位推送"
            extra={
              <Button
                type="primary"
                size="small"
                icon={<NotificationOutlined />}
                onClick={() => router.push('/school/push')}
              >
                推送岗位
              </Button>
            }
          >
            <List
              dataSource={recentPushes}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Text strong>{item.job}</Text>
                        <Tag color="blue">{item.company}</Tag>
                      </Space>
                    }
                    description={
                      <Space split={<Text type="secondary">|</Text>}>
                        <Text type="secondary">{item.target}</Text>
                        <Text type="secondary">推送 {item.count} 人</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 */}
      <Card className="mt-4" title="快捷入口">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              className="text-center"
              onClick={() => router.push('/school/students')}
            >
              <UserOutlined style={{ fontSize: 32, color: '#1677FF' }} />
              <div className="mt-2">学生管理</div>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              className="text-center"
              onClick={() => router.push('/school/push')}
            >
              <SendOutlined style={{ fontSize: 32, color: '#52C41A' }} />
              <div className="mt-2">岗位推送</div>
            </Card>
          </Col>
        </Row>
      </Card>
    </DashboardLayout>
  )
}
