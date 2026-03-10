'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Row, Col, Card, Statistic, Button, Typography, Space, Spin, Tag } from 'antd'
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
  CheckCircleOutlined,
} from '@ant-design/icons'
import { PublicPageLayout } from '@/components/layout'
import { useHomepageConfig } from '@/hooks/useHomepageConfig'
import { usePolicies } from '@/hooks/usePolicies'

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
    <PublicPageLayout showFooter={true} icpNumber={config.footerLinks.icpNumber}>
      {/* Hero Section - 设计增强版 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-28 min-h-[520px]">
          {/* 装饰性网格背景 */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />

          {/* 装饰性光晕 - 多层叠加 */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400/15 to-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

          {/* 装饰性圆形 */}
          <div className="absolute top-20 right-20 w-4 h-4 rounded-full bg-white/20" />
          <div className="absolute top-40 right-40 w-2 h-2 rounded-full bg-white/30" />
          <div className="absolute bottom-32 left-32 w-3 h-3 rounded-full bg-white/15" />
          <div className="absolute top-1/3 left-16 w-2 h-2 rounded-full bg-cyan-300/30" />
          <div className="absolute bottom-1/3 right-24 w-5 h-5 rounded-full bg-indigo-300/20" />

          {/* 装饰性线条 */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* 品牌标签 */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6 sm:mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs sm:text-sm text-white/90">武汉人才服务平台</span>
            </div>

            <Title
              level={1}
              className="!text-white !mb-3 sm:!mb-4 !text-4xl sm:!text-6xl lg:!text-7xl font-bold tracking-tight"
              style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
            >
              才聚江城
            </Title>
            <Title
              level={2}
              className="!text-white/90 !font-normal !mt-0 !mb-6 sm:!mb-8 !text-lg sm:!text-2xl"
              style={{ textShadow: '0 2px 15px rgba(0,0,0,0.2)' }}
            >
              武汉人才留汉智能服务平台
            </Title>
            <Paragraph className="!text-white/80 text-base sm:!text-xl mb-8 sm:!mb-12 max-w-2xl mx-auto leading-relaxed">
              连接武汉<span className="text-cyan-300 font-medium">高校人才</span>与本地企业
              <br />
              帮助大学生留在武汉就业，帮助企业找到本地优秀人才
            </Paragraph>

            {/* 单一主要 CTA - 增强效果 */}
            <Link href="/register">
              <Button
                type="primary"
                size="large"
                className="h-12 sm:h-14 px-8 sm:px-12 text-base sm:text-lg font-semibold bg-white text-blue-600 hover:bg-white/95 hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-900/20"
                icon={<ArrowRightOutlined />}
              >
                免费注册
              </Button>
            </Link>

            {/* 次要入口 - 文字链接 */}
            <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-white/90">
              <Link
                href="/login"
                className="hover:text-white hover:underline transition-all duration-200 flex items-center gap-1 text-sm sm:text-base"
                style={{ textDecorationColor: 'rgba(255,255,255,0.9)' }}
              >
                已有账号？登录
              </Link>
              <span className="text-white/30 hidden sm:inline">|</span>
              <Link
                href="/about"
                className="hover:text-white hover:underline transition-all duration-200 flex items-center gap-1 text-sm sm:text-base"
                style={{ textDecorationColor: 'rgba(255,255,255,0.9)' }}
              >
                了解更多平台优势
              </Link>
            </div>

            {/* 底部信任标识 */}
            <div className="mt-12 sm:mt-16 flex items-center justify-center gap-4 sm:gap-8 text-white/50 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <CheckCircleOutlined className="text-green-400 text-base sm:text-lg" />
                <span>平台认证</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <SafetyCertificateOutlined className="text-blue-300 text-base sm:text-lg" />
                <span>数据安全</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <TeamOutlined className="text-cyan-300 text-base sm:text-lg" />
                <span>服务学生</span>
              </div>
            </div>
          </div>
        </div>

        {/* 数据可信度区 - 独立区域 */}
        <div className="py-12 bg-white border-b">
          <div className="max-w-6xl mx-auto px-8">
            <Row gutter={[32, 32]}>
              {stats.map((stat) => (
                <Col xs={12} sm={6} key={stat.title}>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-1">
                      {stat.value}<span className="text-xl text-gray-500 ml-1">{stat.suffix}</span>
                    </div>
                    <div className="text-gray-600">{stat.title}</div>
                  </div>
                </Col>
              ))}
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
                <Title level={3} className="mb-6">加入我们</Title>
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
      </PublicPageLayout>
    )
  }
