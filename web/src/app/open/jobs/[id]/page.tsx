/**
 * 岗位详情页面 - 公开访问
 * 显示岗位完整信息，无需登录
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Descriptions, Tag, Typography, Button, Space, Row, Col, message } from 'antd'
import {
  EnvironmentOutlined,
  DollarOutlined,
  BankOutlined,
  CalendarOutlined,
  TeamOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { PublicPageLayout } from '@/components/layout'

const { Title, Text, Paragraph } = Typography

interface JobDetail {
  id: string
  title: string
  industry: string | null
  category: string | null
  salaryMin: number | null
  salaryMax: number | null
  location: string | null
  address: string | null
  description: string
  requirements: string | null
  benefits: string | null
  skills: string[]
  educationLevel: string | null
  experienceYears: number | null
  freshGraduate: boolean
  headcount: number
  publishedAt: Date | null
  Enterprise: {
    id: string
    name: string
    industry: string
    scale: string | null
    description: string | null
  } | null
}

export default function JobDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchJobDetail(params.id as string)
    }
  }, [params.id])

  const fetchJobDetail = async (id: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/jobs/public/${id}`)
      const data = await response.json()

      if (data.success) {
        setJob(data.data)
      } else {
        message.error('岗位不存在或已下架')
        router.push('/jobs')
      }
    } catch (error) {
      console.error('获取岗位详情失败:', error)
      message.error('加载失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 格式化薪资
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return '薪资面议'
    if (min && !max) return `${(min / 1000).toFixed(0)}k+`
    if (!min && max) return `~${(max / 1000).toFixed(0)}k`
    // 到这里 min 和 max 都存在
    return `${(min! / 1000).toFixed(0)}k-${(max! / 1000).toFixed(0)}k`
  }

  // 格式化日期
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <PublicPageLayout bgClassName="bg-gray-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Text type="secondary">加载中...</Text>
          </div>
        </div>
      </PublicPageLayout>
    )
  }

  if (!job) {
    return (
      <PublicPageLayout bgClassName="bg-gray-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card>
            <Text>岗位不存在</Text>
            <Link href="/jobs" className="ml-4">
              <Button type="primary">返回列表</Button>
            </Link>
          </Card>
        </div>
      </PublicPageLayout>
    )
  }

  return (
    <PublicPageLayout bgClassName="bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/jobs" className="text-gray-600 hover:text-blue-600">
            <ArrowLeftOutlined className="mr-1" />
            返回岗位列表
          </Link>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 岗位基本信息 */}
        <Card className="mb-6">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={18}>
              <div className="mb-4">
                <Title level={2} className="!mb-2">
                  {job.title}
                  {job.freshGraduate && (
                    <Tag color="green" className="ml-2">应届生可投</Tag>
                  )}
                </Title>
                <Space size="middle">
                  {job.industry && <Tag color="blue">{job.industry}</Tag>}
                  {job.category && <Tag>{job.category}</Tag>}
                  <Text type="secondary">
                    <CalendarOutlined className="mr-1" />
                    发布于 {formatDate(job.publishedAt)}
                  </Text>
                </Space>
              </div>

              <Descriptions column={{ xs: 1, sm: 2 }} className="mt-6">
                {job.Enterprise && (
                  <Descriptions.Item
                    label={
                      <span>
                        <BankOutlined className="mr-1" />
                        公司名称
                      </span>
                    }
                  >
                    <Text strong>{job.Enterprise.name}</Text>
                  </Descriptions.Item>
                )}

                <Descriptions.Item
                  label={
                    <span>
                      <DollarOutlined className="mr-1" />
                      薪资待遇
                    </span>
                  }
                >
                  <Text strong className="text-green-600 text-lg">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </Text>
                </Descriptions.Item>

                {job.location && (
                  <Descriptions.Item
                    label={
                      <span>
                        <EnvironmentOutlined className="mr-1" />
                        工作地点
                      </span>
                    }
                  >
                    {job.location}
                  </Descriptions.Item>
                )}

                <Descriptions.Item
                  label={
                    <span>
                      <TeamOutlined className="mr-1" />
                      招聘人数
                    </span>
                }
                >
                  {job.headcount} 人
                </Descriptions.Item>

                {job.educationLevel && (
                  <Descriptions.Item label="学历要求">
                    {job.educationLevel}
                  </Descriptions.Item>
                )}

                {job.experienceYears !== null && (
                  <Descriptions.Item label="经验要求">
                    {job.experienceYears === 0 ? '应届生' : `${job.experienceYears} 年`}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Col>

            <Col xs={24} md={6} className="text-center">
              <Link href="/register">
                <Button type="primary" size="large" block className="mb-3">
                  立即投递
                </Button>
              </Link>
              <Text type="secondary" className="text-xs">
                注册后可投递简历
              </Text>
            </Col>
          </Row>
        </Card>

        {/* 岗位详情 */}
        <Card title="岗位描述" className="mb-6">
          <Paragraph className="whitespace-pre-wrap">
            {job.description}
          </Paragraph>
        </Card>

        {job.requirements && (
          <Card title="任职要求" className="mb-6">
            <Paragraph className="whitespace-pre-wrap">
              {job.requirements}
            </Paragraph>
          </Card>
        )}

        {job.benefits && (
          <Card title="福利待遇" className="mb-6">
            <Paragraph className="whitespace-pre-wrap">
              {job.benefits}
            </Paragraph>
          </Card>
        )}

        {job.skills && job.skills.length > 0 && (
          <Card title="技能要求" className="mb-6">
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, index) => (
                <Tag key={index} color="default" className="px-3 py-1">
                  {skill}
                </Tag>
              ))}
            </div>
          </Card>
        )}

        {/* 企业信息 */}
        {job.Enterprise && (
          <Card title="公司信息" className="mb-6">
            <Descriptions column={1}>
              <Descriptions.Item label="公司名称">
                {job.Enterprise.name}
              </Descriptions.Item>
              <Descriptions.Item label="所属行业">
                {job.Enterprise.industry}
              </Descriptions.Item>
              {job.Enterprise.scale && (
                <Descriptions.Item label="公司规模">
                  {job.Enterprise.scale}
                </Descriptions.Item>
              )}
              {job.Enterprise.description && (
                <Descriptions.Item label="公司简介">
                  <Paragraph className="!mb-0">
                    {job.Enterprise.description}
                  </Paragraph>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* 操作按钮 */}
        <Card className="text-center">
          <Space size="middle">
            <Link href="/register">
              <Button type="primary" size="large">
                注册并投递简历
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="large">
                浏览更多岗位
              </Button>
            </Link>
          </Space>
        </Card>
      </div>
    </PublicPageLayout>
  )
}
