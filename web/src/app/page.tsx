'use client'

import React from 'react'
import Link from 'next/link'
import { Layout, Row, Col, Card, Statistic, Button, Typography, Space, Spin, Tag } from 'antd'
import {
  TeamOutlined,
  BankOutlined,
  SolutionOutlined,
  ArrowRightOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  HeartOutlined,
  StarOutlined,
  TrophyOutlined,
  FileTextOutlined,
  BulbOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { PortalHeader, PortalFooter } from '@/components/layout'
import { useHomepageConfig } from '@/hooks/useHomepageConfig'
import { usePolicies } from '@/hooks/usePolicies'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography

// 图标映射
const ICON_MAP: Record<string, React.ReactNode> = {
  RocketOutlined: <RocketOutlined className="text-4xl text-primary" />,
  BankOutlined: <BankOutlined className="text-4xl text-primary" />,
  HeartOutlined: <HeartOutlined className="text-4xl text-primary" />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined className="text-4xl text-primary" />,
  TeamOutlined: <TeamOutlined className="text-4xl text-primary" />,
  FileTextOutlined: <FileTextOutlined className="text-4xl text-primary" />,
  TrophyOutlined: <TrophyOutlined className="text-4xl text-primary" />,
  StarOutlined: <StarOutlined className="text-4xl text-primary" />,
  BulbOutlined: <BulbOutlined className="text-4xl text-primary" />,
  ThunderboltOutlined: <ThunderboltOutlined className="text-4xl text-primary" />,
}

// 政策类型名称
const TYPE_NAMES: Record<string, string> = {
  TALENT: '人才政策',
  HOUSING: '住房政策',
  ENTREPRENEURSHIP: '创业扶持',
  EMPLOYMENT: '就业政策',
  OTHER: '其他',
}

export default function HomePage() {
  const { config, loading } = useHomepageConfig()
  const { policies, loading: policiesLoading } = usePolicies({ pageSize: 5 })

  // 从配置中获取统计数据
  const stats = [
    { title: '入驻企业', value: config.stats.enterprises, suffix: '家' },
    { title: '合作高校', value: config.stats.universities, suffix: '所' },
    { title: '服务学生', value: config.stats.students, suffix: '人' },
    { title: '留汉率', value: config.stats.retentionRate, suffix: '%' },
  ]

  // 从配置中获取功能特性，过滤启用的并按排序排列
  const features = config.features
    .filter(f => f.enabled)
    .sort((a, b) => a.order - b.order)
    .map(feature => ({
      icon: ICON_MAP[feature.icon] || <StarOutlined className="text-4xl text-primary" />,
      title: feature.title,
      description: feature.description,
    }))

  return (
    <Layout className="min-h-screen">
      <PortalHeader />

      {/* Hero Section */}
      <Content>
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20">
          <div className="max-w-6xl mx-auto px-8">
            <Row gutter={48} align="middle">
              <Col xs={24} md={14}>
                <Title level={1} className="!text-white !mb-4">
                  才聚江城
                </Title>
                <Title level={2} className="!text-white/90 !font-normal !mt-0 !mb-6">
                  武汉人才留汉智能服务平台
                </Title>
                <Paragraph className="!text-white/80 text-lg mb-8">
                  连接武汉高校人才与本地企业，帮助武汉大学生留在武汉就业，
                  帮助武汉企业找到本地人才。
                </Paragraph>
                <Space size="large">
                  <Link href="/register">
                    <Button type="primary" size="large" icon={<ArrowRightOutlined />}>
                      立即注册
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button ghost size="large">
                      企业登录
                    </Button>
                  </Link>
                </Space>
              </Col>
              <Col xs={24} md={10} className="hidden md:block">
                <div className="bg-white/10 rounded-2xl p-8 backdrop-blur">
                  <Title level={4} className="!text-white !mb-4">平台数据</Title>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Spin />
                    </div>
                  ) : (
                    <Row gutter={[16, 16]}>
                      {stats.map((stat) => (
                        <Col span={12} key={stat.title}>
                          <Statistic
                            title={<span className="text-white/80">{stat.title}</span>}
                            value={stat.value}
                            suffix={stat.suffix}
                            valueStyle={{ color: '#fff' }}
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-8">
            <Title level={2} className="text-center mb-12">
              为什么选择才聚江城
            </Title>
            {loading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" />
              </div>
            ) : (
              <Row gutter={[24, 24]}>
                {features.map((feature) => (
                  <Col xs={24} sm={12} lg={6} key={feature.title}>
                    <Card className="h-full text-center hover:shadow-lg transition-shadow">
                      <div className="mb-4">{feature.icon}</div>
                      <Title level={4} className="!mb-2">{feature.title}</Title>
                      <Text type="secondary">{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </div>

        {/* Policy Section */}
        <div className="py-16">
          <div className="max-w-6xl mx-auto px-8">
            <Row gutter={48}>
              <Col xs={24} md={12}>
                <Title level={3} className="mb-6">最新人才政策</Title>
                {policiesLoading ? (
                  <div className="flex justify-center py-8">
                    <Spin />
                  </div>
                ) : policies.length > 0 ? (
                  <Space direction="vertical" className="w-full" size="middle">
                    {policies.map((policy) => (
                      <Link key={policy.id} href={`/policies/${policy.id}`}>
                        <Card
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          size="small"
                        >
                          <div className="flex justify-between items-center">
                            <span>{policy.title}</span>
                            <Tag color="blue">{TYPE_NAMES[policy.type] || '政策'}</Tag>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">暂无政策信息</Text>
                )}
                <Link href="/policies">
                  <Button type="link" className="mt-4 p-0">
                    查看全部政策 <ArrowRightOutlined />
                  </Button>
                </Link>
              </Col>
              <Col xs={24} md={12}>
                <Title level={3} className="mb-6">合作入口</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Card
                      className="text-center cursor-pointer hover:shadow-md transition-shadow h-full"
                      hoverable
                    >
                      <BankOutlined className="text-3xl text-primary mb-2" />
                      <Title level={5} className="!mb-1">企业入驻</Title>
                      <Text type="secondary" className="text-sm">发布岗位，获取人才</Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      className="text-center cursor-pointer hover:shadow-md transition-shadow h-full"
                      hoverable
                    >
                      <SolutionOutlined className="text-3xl text-primary mb-2" />
                      <Title level={5} className="!mb-1">学校合作</Title>
                      <Text type="secondary" className="text-sm">提高就业率</Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      className="text-center cursor-pointer hover:shadow-md transition-shadow h-full"
                      hoverable
                    >
                      <TeamOutlined className="text-3xl text-primary mb-2" />
                      <Title level={5} className="!mb-1">政府合作</Title>
                      <Text type="secondary" className="text-sm">人才留汉数据</Text>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      className="text-center cursor-pointer hover:shadow-md transition-shadow h-full"
                      hoverable
                    >
                      <RocketOutlined className="text-3xl text-primary mb-2" />
                      <Title level={5} className="!mb-1">C端入口</Title>
                      <Text type="secondary" className="text-sm">WeHan 学生端</Text>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </Content>

      <PortalFooter icpNumber={config.footerLinks.icpNumber} />
    </Layout>
  )
}
