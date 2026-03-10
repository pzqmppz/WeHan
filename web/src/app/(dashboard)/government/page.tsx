'use client'

import React from 'react'
import { Card, Row, Col, Typography, Progress, List, Space } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  BankOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGovernmentDashboard } from '@/hooks'
import { PageHeader, LoadingState, NoData } from '@/components/ui'

const { Title, Text } = Typography

export default function GovernmentDashboard() {
  const { data, loading, error, refetch } = useGovernmentDashboard()

  if (loading) {
    return (
      <DashboardLayout role="government">
        <PageHeader title="留汉指数大屏" onReload={refetch} />
        <LoadingState message="加载统计数据中..." />
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout role="government">
        <PageHeader title="留汉指数大屏" />
        <NoData description="无法加载统计数据" onReload={refetch} />
      </DashboardLayout>
    )
  }

  const { statistics, industryDistribution, schoolRetention } = data as any

  return (
    <DashboardLayout role="government">
      <PageHeader title="留汉指数大屏" onReload={refetch} />

      {/* 政府端 - 突出留汉率的核心指标卡片，带入场动画 */}
      <Row gutter={[16, 16]} className="mb-6">
        {/* 留汉率 - 核心指标，大号展示 */}
        <Col xs={24} sm={12} md={8}>
          <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200 card-hover animate-fade-in animate-delay-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                <RiseOutlined className="text-white text-lg" />
              </div>
              <Text type="secondary" className="text-sm">核心指标</Text>
            </div>
            <div className="flex items-end gap-3">
              <div className="text-5xl font-bold text-green-600 stat-number">
                {statistics?.retentionRate || 0}
                <span className="text-2xl text-green-500 ml-1">%</span>
              </div>
              <div className="pb-2">
                <Progress
                  type="circle"
                  percent={Math.round(statistics?.retentionRate || 0)}
                  size={60}
                  strokeColor="#52C41A"
                  format={(percent) => <span className="text-xs text-green-600">{percent}</span>}
                />
              </div>
            </div>
            <Text type="secondary" className="text-xs block mt-2">留汉率</Text>
          </Card>
        </Col>

        {/* 签约数 */}
        <Col xs={12} sm={6} md={4}>
          <Card className="card-hover animate-fade-in animate-delay-200">
            <TeamOutlined className="text-green-500 text-xl mb-2" />
            <div className="text-2xl font-bold text-gray-800 stat-number">{statistics?.totalContracts || 0}</div>
            <Text type="secondary" className="text-xs">签约数</Text>
          </Card>
        </Col>

        {/* 投递简历数 */}
        <Col xs={12} sm={6} md={4}>
          <Card className="card-hover animate-fade-in animate-delay-300">
            <FileTextOutlined className="text-blue-500 text-xl mb-2" />
            <div className="text-2xl font-bold text-gray-800 stat-number">{statistics?.totalApplications || 0}</div>
            <Text type="secondary" className="text-xs">投递简历</Text>
          </Card>
        </Col>

        {/* 参与企业 */}
        <Col xs={12} sm={6} md={4}>
          <Card className="card-hover animate-fade-in animate-delay-400">
            <BankOutlined className="text-purple-500 text-xl mb-2" />
            <div className="text-2xl font-bold text-gray-800 stat-number">{statistics?.totalEnterprises || 0}</div>
            <Text type="secondary" className="text-xs">参与企业</Text>
          </Card>
        </Col>

        {/* 目标达成 - 视觉化进度 */}
        <Col xs={12} sm={6} md={4}>
          <Card className="card-hover animate-fade-in animate-delay-500">
            <TrophyOutlined className="text-yellow-500 text-xl mb-2" />
            <div className="flex items-center gap-2">
              <Progress
                percent={Math.min(100, Math.round((statistics?.totalContracts || 0) / 100 * 85))}
                size="small"
                strokeColor="#FAAD14"
                showInfo={false}
                className="flex-1 progress-animate"
              />
              <Text className="text-xs text-gray-500">85%</Text>
            </div>
            <Text type="secondary" className="text-xs">目标达成</Text>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 行业分布 - 可视化进度条 */}
        <Col xs={24} lg={12}>
          <Card title="热门行业分布" extra={<Text type="secondary">按岗位数量</Text>}>
            {!industryDistribution || industryDistribution.length === 0 ? (
              <NoData description="暂无行业数据" />
            ) : (
              <List
                dataSource={industryDistribution}
                renderItem={(item: any, index: number) => (
                  <List.Item className="!px-0">
                    <div className="w-full">
                      <div className="flex justify-between mb-2 items-center">
                        <Space>
                          <span className={`w-5 h-5 rounded-full text-white text-xs flex items-center justify-center ${
                            index < 3 ? 'bg-blue-500' : 'bg-gray-400'
                          }`}>
                            {index + 1}
                          </span>
                          <Text strong className="text-sm">{item.name}</Text>
                        </Space>
                        <Space>
                          <Text strong className="text-blue-600">{item.count} 个</Text>
                          <Text type="secondary" className="text-xs">{item.percent}%</Text>
                        </Space>
                      </div>
                      <Progress
                        percent={item.percent}
                        showInfo={false}
                        strokeColor={{
                          '0%': '#1677FF',
                          '100%': '#52C41A',
                        }}
                        trailColor="#F0F2F5"
                        className="!mb-0"
                      />
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* 高校留汉率排名 - 奖牌式排名 */}
        <Col xs={24} lg={12}>
          <Card title="高校留汉率排名" extra={<Text type="secondary">前 10 名</Text>}>
            {!schoolRetention || schoolRetention.length === 0 ? (
              <NoData description="暂无高校数据" />
            ) : (
              <List
                dataSource={schoolRetention}
                renderItem={(item: any, index: number) => (
                  <List.Item className="!px-0">
                    <div className="w-full flex items-center gap-3">
                      {/* 奖牌排名 */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-500' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <Text strong className="text-sm">{item.name}</Text>
                          <Space>
                            <Text className="text-lg font-bold text-green-600">{item.retention}%</Text>
                          </Space>
                        </div>
                        <div className="flex items-center justify-between">
                          <Text type="secondary" className="text-xs">投递 {item.total} 人</Text>
                          <Progress
                            percent={item.retention}
                            size="small"
                            showInfo={false}
                            strokeColor="#52C41A"
                            className="w-20"
                          />
                        </div>
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
