'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Typography, Space, Button, List } from 'antd'
import {
  FileTextOutlined,
  TeamOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

const recentApplications = [
  { id: 1, name: '张三', position: '前端开发工程师', school: '武汉大学', score: 85, time: '10分钟前' },
  { id: 2, name: '李四', position: '产品经理', school: '华中科技大学', score: 92, time: '30分钟前' },
  { id: 3, name: '王五', position: 'Java开发工程师', school: '武汉理工大学', score: 78, time: '1小时前' },
]

const hotJobs = [
  { id: 1, title: '前端开发工程师', applications: 45, views: 230 },
  { id: 2, title: '产品经理', applications: 38, views: 180 },
  { id: 3, title: 'Java开发工程师', applications: 32, views: 156 },
]

export default function EnterpriseDashboard() {
  return (
    <DashboardLayout role="enterprise">
      <Title level={4} className="mb-6">首页概览</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日新增投递"
              value={12}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待处理简历"
              value={28}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="今日面试"
              value={5}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="已录用"
              value={8}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 最新投递 */}
        <Col xs={24} lg={14}>
          <Card
            title="最新投递"
            extra={<a href="#">查看全部</a>}
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
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                        index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-gray-400'
                      }`}>
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
