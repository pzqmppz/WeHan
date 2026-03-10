'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card, Row, Col, Typography, Progress, List, Button, Tag, Space } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  NotificationOutlined,
  UserOutlined,
  SendOutlined,
  HeartOutlined,
  FundOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PageHeader, LoadingState } from '@/components/ui'

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
        <LoadingState message="加载就业数据中..." />
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
      <PageHeader
        title="就业数据看板"
        subtitle="帮助每一位学生找到理想的职业方向"
      />

      {/* 学校端 - 柔和温暖的统计卡片，带入场动画 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* 毕业生总数 */}
        <Col xs={12} sm={6}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-blue-50 to-white card-hover animate-fade-in animate-delay-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <TeamOutlined className="text-blue-500 text-sm" />
              </div>
              <Text type="secondary" className="text-xs">在校学生</Text>
            </div>
            <div className="text-3xl font-semibold text-gray-800 stat-number">{2400}</div>
            <Text type="secondary" className="text-xs">名毕业生</Text>
          </Card>
        </Col>

        {/* 已就业 - 温暖绿色 */}
        <Col xs={12} sm={6}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-green-50 to-white card-hover animate-fade-in animate-delay-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <FileTextOutlined className="text-green-500 text-sm" />
              </div>
              <Text type="secondary" className="text-xs">已就业</Text>
            </div>
            <div className="text-3xl font-semibold text-green-600 stat-number">{1980}</div>
            <Text type="secondary" className="text-xs">名学生</Text>
          </Card>
        </Col>

        {/* 就业率 - 圆形进度 */}
        <Col xs={12} sm={6}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-teal-50 to-white card-hover animate-fade-in animate-delay-300">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RiseOutlined className="text-teal-500" />
                  <Text type="secondary" className="text-xs">就业率</Text>
                </div>
                <div className="text-3xl font-semibold text-teal-600 stat-number">82.5<span className="text-lg">%</span></div>
              </div>
              <Progress
                type="circle"
                percent={82.5}
                size={56}
                strokeColor="#14B8A6"
                format={(percent) => <span className="text-xs text-teal-600">{percent}</span>}
              />
            </div>
          </Card>
        </Col>

        {/* 留汉率 - 暖橙色 */}
        <Col xs={12} sm={6}>
          <Card className="rounded-2xl border-0 shadow-sm bg-gradient-to-br from-orange-50 to-white card-hover animate-fade-in animate-delay-400">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <HeartOutlined className="text-orange-500 text-sm" />
              </div>
              <Text type="secondary" className="text-xs">留汉率</Text>
            </div>
            <div className="text-3xl font-semibold text-orange-500 stat-number">68<span className="text-lg">%</span></div>
            <Text type="secondary" className="text-xs">选择留汉</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 学生去向 - 柔和展示 */}
        <Col xs={24} lg={14}>
          <Card
            title={<span className="flex items-center gap-2"><FundOutlined className="text-blue-400" /> 学生去向行业分布</span>}
            className="rounded-2xl"
          >
            <List
              dataSource={majorData}
              renderItem={(item: any) => (
                <List.Item className="!px-2">
                  <div className="w-full">
                    <div className="flex justify-between mb-2 items-center">
                      <Text className="text-sm">{item.industry}</Text>
                      <Space>
                        <Tag color="blue" className="mb-0 rounded-full px-3">{item.count} 人</Tag>
                      </Space>
                    </div>
                    <Progress
                      percent={Math.round(item.count / 180 * 100)}
                      showInfo={false}
                      strokeColor="#1677FF"
                      className="!h-2"
                    />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近推送 - 温暖提示 */}
        <Col xs={24} lg={10}>
          <Card
            title={<span className="flex items-center gap-2"><NotificationOutlined className="text-orange-400" /> 最近岗位推送</span>}
            extra={
              <Button
                type="primary"
                size="small"
                icon={<SendOutlined />}
                onClick={() => router.push('/school/push')}
                className="rounded-full"
              >
                推送岗位
              </Button>
            }
            className="rounded-2xl"
          >
            <List
              dataSource={recentPushes}
              renderItem={(item) => (
                <List.Item className="!px-2">
                  <List.Item.Meta
                    avatar={
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                        <SendOutlined className="text-orange-500 text-sm" />
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong className="text-sm">{item.job}</Text>
                        <Tag color="orange" className="mb-0 rounded-full px-2 text-xs">{item.company}</Tag>
                      </Space>
                    }
                    description={
                      <Space split={<span className="text-gray-200">|</span>}>
                        <Text type="secondary" className="text-xs">{item.target}</Text>
                        <Text type="secondary" className="text-xs">推送 {item.count} 人</Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 快捷入口 - 更友好的卡片 */}
      <Card className="mt-4 rounded-2xl" title={<span className="flex items-center gap-2"><UserOutlined className="text-purple-400" /> 快捷入口</span>}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              className="text-center rounded-xl border-2 hover:border-blue-300 transition-colors h-full bg-gradient-to-br from-blue-50 to-white"
              onClick={() => router.push('/school/students')}
            >
              <UserOutlined className="text-4xl text-blue-400 mb-3" />
              <div className="font-medium text-gray-700">学生管理</div>
              <Text type="secondary" className="text-xs">查看学生就业状态</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              className="text-center rounded-xl border-2 hover:border-green-300 transition-colors h-full bg-gradient-to-br from-green-50 to-white"
              onClick={() => router.push('/school/push')}
            >
              <SendOutlined className="text-4xl text-green-400 mb-3" />
              <div className="font-medium text-gray-700">岗位推送</div>
              <Text type="secondary" className="text-xs">精准推送岗位机会</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              hoverable
              className="text-center rounded-xl border-2 hover:border-purple-300 transition-colors h-full bg-gradient-to-br from-purple-50 to-white"
              onClick={() => router.push('/school/analytics')}
            >
              <FundOutlined className="text-4xl text-purple-400 mb-3" />
              <div className="font-medium text-gray-700">数据分析</div>
              <Text type="secondary" className="text-xs">就业数据可视化</Text>
            </Card>
          </Col>
        </Row>
      </Card>
    </DashboardLayout>
  )
}
