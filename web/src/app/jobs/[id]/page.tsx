/**
 * 岗位详情页面 - 专业可信风格
 * 强调信息层级、视觉节奏、专业感
 */

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, Descriptions, Tag, Typography, Button, Divider, message } from 'antd'
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

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return '薪资面议'
    if (min && !max) return `${(min / 1000).toFixed(0)}k+`
    if (!min && max) return `~${(max / 1000).toFixed(0)}k`
    return `${(min! / 1000).toFixed(0)}k-${(max! / 1000).toFixed(0)}k`
  }

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
          <Card className="text-center">
            <Title level={4} className="!mb-4">岗位不存在</Title>
            <Text type="secondary" className="block mb-4">
              该岗位不存在或已过期
            </Text>
            <Link href="/jobs">
              <Button type="primary">返回岗位列表</Button>
            </Link>
          </Card>
        </div>
      </PublicPageLayout>
    )
  }

  return (
    <PublicPageLayout bgClassName="bg-gray-50 pb-20 md:pb-8">

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 返回链接 */}
        <Link href="/jobs" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-4 sm:mb-6 text-sm">
          <ArrowLeftOutlined className="mr-1" />
          返回岗位列表
        </Link>

        {/* 岗位标题 - 超大字号 */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className="flex-1 min-w-0">
              <Title level={1} className="!text-2xl sm:!text-3xl lg:!text-4xl !mb-2 sm:!mb-3 !font-semibold !text-gray-900">
                {job.title}
              </Title>
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {job.freshGraduate && (
                  <Tag color="success" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">应届生可投</Tag>
                )}
                {job.industry && <Tag className="!text-gray-600 !border-gray-300 text-xs sm:text-sm">{job.industry}</Tag>}
                {job.category && <Tag className="!text-gray-600 !border-gray-300 text-xs sm:text-sm">{job.category}</Tag>}
              </div>
            </div>
          </div>

          {/* 薪资 - 超大显示 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 px-4 sm:px-6 py-3 sm:py-4 mb-6 sm:mb-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Text type="secondary" className="text-xs sm:text-sm block mb-1">薪资待遇</Text>
                <Text className="text-2xl sm:text-3xl font-bold text-green-700">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </Text>
              </div>
              <div className="text-right">
                <Text type="secondary" className="text-xs sm:text-sm block mb-1">招聘人数</Text>
                <Text className="text-lg sm:text-xl font-semibold text-gray-700">{job.headcount} 人</Text>
              </div>
            </div>
          </div>

          {/* 关键信息 - 紧凑横向布局 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {job.Enterprise && (
              <div>
                <Text type="secondary" className="text-xs block mb-1">招聘企业</Text>
                <Text strong className="text-gray-800">{job.Enterprise.name}</Text>
              </div>
            )}
            {job.location && (
              <div>
                <Text type="secondary" className="text-xs block mb-1">工作地点</Text>
                <div className="flex items-center gap-1">
                  <EnvironmentOutlined className="text-gray-400 text-sm" />
                  <Text className="text-gray-800">{job.location}</Text>
                </div>
              </div>
            )}
            {job.educationLevel && (
              <div>
                <Text type="secondary" className="text-xs block mb-1">学历要求</Text>
                <Text className="text-gray-800">{job.educationLevel}</Text>
              </div>
            )}
            {job.experienceYears !== null && (
              <div>
                <Text type="secondary" className="text-xs block mb-1">经验要求</Text>
                <Text className="text-gray-800">
                  {job.experienceYears === 0 ? '应届生' : `${job.experienceYears} 年`}
                </Text>
              </div>
            )}
          </div>
        </div>

        {/* 岗位详情 - 大标题分隔 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 shadow-sm">
          <Title level={3} className="!mb-4 sm:!mb-6 !text-lg sm:!text-xl !font-semibold">岗位详情</Title>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <Title level={5} className="!mb-2 !text-gray-700">岗位描述</Title>
              <Paragraph className="text-gray-700 leading-relaxed whitespace-pre-wrap !mb-0">
                {job.description}
              </Paragraph>
            </div>

            {job.requirements && (
              <>
                <Divider className="!my-3 sm:!my-4" />
                <div>
                  <Title level={5} className="!mb-2 !text-gray-700 text-sm sm:text-base">任职要求</Title>
                  <Paragraph className="text-gray-700 leading-relaxed whitespace-pre-wrap !mb-0 text-sm sm:text-base">
                    {job.requirements}
                  </Paragraph>
                </div>
              </>
            )}

            {job.benefits && (
              <>
                <Divider className="!my-3 sm:!my-4" />
                <div>
                  <Title level={5} className="!mb-2 !text-gray-700 text-sm sm:text-base">福利待遇</Title>
                  <Paragraph className="text-gray-700 leading-relaxed whitespace-pre-wrap !mb-0 text-sm sm:text-base">
                    {job.benefits}
                  </Paragraph>
                </div>
              </>
            )}

            {job.skills && job.skills.length > 0 && (
              <>
                <Divider className="!my-3 sm:!my-4" />
                <div>
                  <Title level={5} className="!mb-2 sm:!mb-3 !text-gray-700 text-sm sm:text-base">技能要求</Title>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-block bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 企业信息 */}
        {job.Enterprise && (
          <Card className="mb-4 sm:mb-6 border-gray-200" styles={{ body: { padding: '16px sm:px-6 sm:py-6' } }}>
            <Title level={3} className="!mb-3 sm:!mb-4 !text-lg sm:!text-xl !font-semibold">企业信息</Title>

            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
              <Descriptions.Item label="公司名称">
                <Text strong>{job.Enterprise.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="所属行业">
                <Text>{job.Enterprise.industry}</Text>
              </Descriptions.Item>
              {job.Enterprise.scale && (
                <Descriptions.Item label="公司规模">
                  <Text>{job.Enterprise.scale}</Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {job.Enterprise.description && (
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
                <Text type="secondary" className="text-xs sm:text-sm block mb-2">公司简介</Text>
                <Paragraph className="text-gray-600 !mb-0 text-sm sm:text-base">
                  {job.Enterprise.description}
                </Paragraph>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* 移动端固定底部 CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 md:hidden z-30 safe-area-bottom">
        <Link href="/register" className="block">
          <Button type="primary" size="large" block className="h-12 text-base font-semibold">
            注册并申请岗位
          </Button>
        </Link>
      </div>
    </PublicPageLayout>
  )
}
