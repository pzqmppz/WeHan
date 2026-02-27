'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Typography, Progress, List, Button, Tag, Space } from 'antd'
import {
  TeamOutlined,
  FileTextOutlined,
  RiseOutlined,
  NotificationOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

const majorData = [
  { name: '计算机科学与技术', employment: 92, total: 180 },
  { name: '软件工程', employment: 95, total: 150 },
  { name: '电子信息工程', employment: 88, total: 120 },
  { name: '机械工程', employment: 82, total: 100 },
  { name: '工商管理', employment: 78, total: 90 },
]

const recentPushes = [
  { id: 1, job: '前端开发工程师', company: '小米武汉', target: '计算机学院', count: 45 },
  { id: 2, job: '产品经理', company: '斗鱼直播', target: '商学院', count: 32 },
  { id: 3, job: '算法工程师', company: '字节跳动', target: '人工智能学院', count: 28 },
]

export default function SchoolDashboard() {
  return (
    <DashboardLayout role="school">
      <Title level={4} className="mb-6">就业数据看板</Title>

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
        {/* 专业去向 */}
        <Col xs={24} lg={14}>
          <Card title="各专业就业率">
            <List
              dataSource={majorData}
              renderItem={(item) => (
                <List.Item>
                  <div className="w-full">
                    <div className="flex justify-between mb-1">
                      <Text>{item.name}</Text>
                      <Space>
                        <Text type="secondary">毕业生 {item.total} 人</Text>
                        <Text strong className={item.employment >= 90 ? 'text-green-500' : ''}>
                          {item.employment}%
                        </Text>
                      </Space>
                    </div>
                    <Progress
                      percent={item.employment}
                      showInfo={false}
                      strokeColor={item.employment >= 90 ? '#52c41a' : '#1890ff'}
                    />
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
            extra={<Button type="primary" size="small" icon={<NotificationOutlined />}>推送岗位</Button>}
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
    </DashboardLayout>
  )
}
