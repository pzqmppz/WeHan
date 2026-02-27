'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Typography, Progress, Tag, List, Space } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  BankOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

const industryData = [
  { name: '互联网/IT', count: 1250, percent: 35 },
  { name: '金融', count: 680, percent: 19 },
  { name: '制造业', count: 520, percent: 15 },
  { name: '教育', count: 380, percent: 11 },
  { name: '医疗健康', count: 320, percent: 9 },
]

const schoolData = [
  { name: '武汉大学', retention: 72, total: 1200 },
  { name: '华中科技大学', retention: 75, total: 1100 },
  { name: '武汉理工大学', retention: 68, total: 980 },
  { name: '华中师范大学', retention: 65, total: 850 },
  { name: '中国地质大学', retention: 62, total: 720 },
]

export default function GovernmentDashboard() {
  return (
    <DashboardLayout role="government">
      <Title level={4} className="mb-6">留汉指数大屏</Title>

      {/* 核心指标 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600">
            <Statistic
              title={<span className="text-white/80">投递简历数</span>}
              value={8650}
              prefix={<FileTextOutlined className="text-white" />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="bg-gradient-to-br from-green-500 to-green-600">
            <Statistic
              title={<span className="text-white/80">签约数</span>}
              value={2150}
              prefix={<TeamOutlined className="text-white" />}
              valueStyle={{ color: '#fff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="留汉率"
              value={68.5}
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
              value={120}
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
            <List
              dataSource={industryData}
              renderItem={(item) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <Text>{item.name}</Text>
                      <Text strong>{item.count} 人</Text>
                    </div>
                    <Progress percent={item.percent} showInfo={false} strokeColor="#1890ff" />
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 高校留汉率 */}
        <Col xs={24} lg={12}>
          <Card title="高校留汉率排名">
            <List
              dataSource={schoolData}
              renderItem={(item, index) => (
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
                    description={<Text type="secondary">毕业生 {item.total} 人</Text>}
                  />
                  <div className="text-right">
                    <Text strong className="text-lg">{item.retention}%</Text>
                    <br />
                    <Text type="secondary" className="text-xs">留汉率</Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
