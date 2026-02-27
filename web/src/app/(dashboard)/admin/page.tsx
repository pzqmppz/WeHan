'use client'

import React from 'react'
import { Card, Row, Col, Statistic, Typography, Table, Tag, Space, Badge } from 'antd'
import {
  TeamOutlined,
  BankOutlined,
  AuditOutlined,
  FileTextOutlined,
  NotificationOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

const pendingReviews = [
  { id: 1, type: 'enterprise', name: '武汉科技有限公司', submitTime: '2026-02-27 10:30' },
  { id: 2, type: 'enterprise', name: '江城创新科技', submitTime: '2026-02-27 09:15' },
  { id: 3, type: 'school', name: '武汉设计工程学院', submitTime: '2026-02-26 16:20' },
  { id: 4, type: 'enterprise', name: '光谷智能制造', submitTime: '2026-02-26 14:00' },
]

const recentActivities = [
  { id: 1, action: '企业入驻', target: '小米武汉', status: 'approved', time: '10分钟前' },
  { id: 2, action: '岗位发布', target: '前端开发工程师', status: 'approved', time: '30分钟前' },
  { id: 3, action: '学校注册', target: '湖北大学', status: 'pending', time: '1小时前' },
  { id: 4, action: '政策发布', target: '人才补贴新规', status: 'approved', time: '2小时前' },
]

export default function AdminDashboard() {
  return (
    <DashboardLayout role="admin">
      <Title level={4} className="mb-6">系统概览</Title>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="注册企业"
              value={120}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="合作高校"
              value={35}
              prefix={<AuditOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="在招岗位"
              value={580}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="待审核"
              value={12}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* 待审核列表 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <span>待审核申请</span>
                <Badge count={12} />
              </Space>
            }
          >
            <Table
              dataSource={pendingReviews}
              pagination={false}
              size="small"
              columns={[
                {
                  title: '类型',
                  dataIndex: 'type',
                  render: (type) => (
                    <Tag color={type === 'enterprise' ? 'blue' : 'green'}>
                      {type === 'enterprise' ? '企业' : '学校'}
                    </Tag>
                  ),
                },
                {
                  title: '名称',
                  dataIndex: 'name',
                },
                {
                  title: '提交时间',
                  dataIndex: 'submitTime',
                },
                {
                  title: '操作',
                  render: () => (
                    <Space>
                      <a>审核</a>
                    </Space>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col xs={24} lg={10}>
          <Card title="最近活动">
            <Table
              dataSource={recentActivities}
              pagination={false}
              size="small"
              columns={[
                {
                  title: '操作',
                  dataIndex: 'action',
                },
                {
                  title: '对象',
                  dataIndex: 'target',
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  render: (status) => (
                    <Tag color={status === 'approved' ? 'green' : 'orange'}>
                      {status === 'approved' ? '已通过' : '待处理'}
                    </Tag>
                  ),
                },
                {
                  title: '时间',
                  dataIndex: 'time',
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
