'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Typography, Progress, List, Space, Spin, Button } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  BankOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useGovernmentDashboard } from '@/hooks'

const { Title, Text } = Typography

export default function GovernmentDashboard() {
  const { data, loading, error, refetch } = useGovernmentDashboard()

  if (loading) {
    return (
      <DashboardLayout role="government">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !data) {
    return (
      <DashboardLayout role="government">
        <div className="text-center py-12">
          <Text type="danger">加载失败: {error?.message || '未知错误'}</Text>
          <br />
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} className="mt-4">
            重试
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const { statistics, industryDistribution, schoolRetention } = data as any

  return (
    <DashboardLayout role="government">
      <div className="flex items-center justify-between mb-6">
        <Title level={4} className="!mb-0">留汉指数大屏</Title>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
          刷新
        </Button>
      </div>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
            <Statistic
              title={<span className="text-white/80">投递简历数</span>}
              value={statistics?.totalApplications || 0}
              prefix={<FileTextOutlined className="text-white" />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600">
            <Statistic
              title={<span className="text-white/80">签约数</span>}
              value={statistics?.totalContracts || 0}
              prefix={<TeamOutlined className="text-white" />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="留汉率"
              value={statistics?.retentionRate || 0}
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
              title="参与企业"
              value={statistics?.totalEnterprises || 0}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 行业分布 */}
        <Col xs={24} lg={12}>
          <Card title="热门行业分布">
            {!industryDistribution || industryDistribution.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                暂无数据
              </div>
            ) : (
              <List
                dataSource={industryDistribution}
                renderItem={(item: any) => (
                  <List.Item>
                    <div className="w-full">
                      <div className="flex justify-between mb-1">
                        <Text>{item.name}</Text>
                        <Text strong>{item.count} 个岗位</Text>
                      </div>
                      <Progress percent={item.percent} showInfo={false} strokeColor="#1890ff" />
                    </div>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* 高校留汉率 */}
        <Col xs={24} lg={12}>
          <Card title="高校留汉率排名">
            {!schoolRetention || schoolRetention.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                暂无数据
              </div>
            ) : (
              <List
                dataSource={schoolRetention}
                renderItem={(item: any, index: number) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index < 3 ? 'bg-yellow-500' : 'bg-gray-300'
                        }`}>
                          {index + 1}
                        </div>
                      }
                      title={item.name}
                      description={<Text type="secondary">投递 {item.total} 人</Text>}
                    />
                    <div className="text-right">
                      <Text strong className="text-lg">{item.retention}%</Text>
                      <br />
                      <Text type="secondary" className="text-xs">留汉率</Text>
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
