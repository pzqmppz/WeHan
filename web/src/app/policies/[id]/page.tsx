/**
 * 政策详情页面 - 与首页风格统一
 */

'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, Typography, Button, Spin, Divider } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { PublicPageLayout } from '@/components/layout'

const { Title, Paragraph, Text } = Typography

// 政策类型配置 - 与首页保持一致的配色
const POLICY_TYPES: Record<string, { name: string; color: string; bg: string; text: string }> = {
  TALENT: { name: '人才政策', color: '#1677FF', bg: '#E6F4FF', text: '#1677FF' },
  HOUSING: { name: '住房政策', color: '#52C41A', bg: '#F6FFED', text: '#52C41A' },
  ENTREPRENEURSHIP: { name: '创业扶持', color: '#FAAD14', bg: '#FFFBE6', text: '#D48806' },
  EMPLOYMENT: { name: '就业政策', color: '#722ED1', bg: '#F9F0FF', text: '#722ED1' },
  OTHER: { name: '其他', color: '#8C8C8C', bg: '#FAFAFA', text: '#595959' },
}

interface Policy {
  id: string
  title: string
  type: string
  summary?: string
  content: string
  conditions?: string
  benefits?: string
  effectiveDate?: Date | string
  expiryDate?: Date | string
  createdAt: Date | string
  source?: string
}

// 模拟数据获取
function usePolicyDetail(id: string) {
  const [policy, setPolicy] = React.useState<Policy | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    const fetchPolicy = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/policies/public/${id}`)
        if (response.ok) {
          const data = await response.json()
          setPolicy(data.data)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPolicy()
    }
  }, [id])

  return { policy, loading, error }
}

export default function PolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { policy, loading, error } = usePolicyDetail(id)

  if (loading) {
    return (
      <PublicPageLayout bgClassName="bg-gray-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4">
              <Text type="secondary">加载中...</Text>
            </div>
          </div>
        </div>
      </PublicPageLayout>
    )
  }

  if (error || !policy) {
    return (
      <PublicPageLayout bgClassName="bg-gray-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="text-center max-w-md">
            <FileTextOutlined className="text-6xl text-gray-300 mb-4" />
            <Title level={4} className="!mb-2">政策不存在</Title>
            <Text type="secondary" className="block mb-4">
              该政策不存在或已过期
            </Text>
            <Link href="/policies">
              <Button type="primary">返回政策列表</Button>
            </Link>
          </Card>
        </div>
      </PublicPageLayout>
    )
  }

  const typeConfig = POLICY_TYPES[policy.type] || POLICY_TYPES.OTHER

  return (
    <PublicPageLayout bgClassName="bg-gray-50">
      {/* 面包屑返回 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/policies"
            className="inline-flex items-center text-gray-500 hover:text-blue-600 text-sm"
          >
            <ArrowLeftOutlined className="mr-1" />
            返回政策列表
          </Link>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 政策标题区 */}
        <div className="mb-6 sm:mb-8">
          {/* 类型标签 */}
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
            <span
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium"
              style={{
                backgroundColor: typeConfig.bg,
                color: typeConfig.text
              }}
            >
              {typeConfig.name}
            </span>
            {policy.effectiveDate && (
              <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                <CalendarOutlined className="mr-1" />
                生效：{new Date(policy.effectiveDate).toLocaleDateString('zh-CN')}
              </div>
            )}
          </div>

          {/* 标题 */}
          <Title level={1} className="!text-2xl sm:!text-3xl !mb-2 sm:!mb-3 !font-semibold !text-gray-900">
            {policy.title}
          </Title>

          {/* 发布信息 */}
          <Text type="secondary" className="text-xs sm:text-sm">
            发布时间：{new Date(policy.createdAt).toLocaleDateString('zh-CN')}
            {policy.source && ` | 来源：${policy.source}`}
          </Text>
        </div>

        {/* 政策摘要 - 蓝色高亮与首页一致 */}
        {policy.summary && (
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4 sm:p-5 mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <FileTextOutlined className="text-lg sm:text-xl text-blue-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <Title level={5} className="!mb-2 text-blue-900 text-sm sm:text-base">政策摘要</Title>
                <Paragraph className="!mb-0 text-gray-700 leading-relaxed text-sm sm:text-base">
                  {policy.summary}
                </Paragraph>
              </div>
            </div>
          </div>
        )}

        {/* 主要内容卡片 */}
        <Card className="shadow-sm mb-4 sm:mb-6" styles={{ body: { padding: '16px sm:px-6 sm:py-6' } }}>
          {/* 政策内容 */}
          <div className="mb-6">
            <Title level={3} className="!mb-4 text-xl font-semibold">政策内容</Title>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {policy.content}
            </div>
          </div>

          <Divider />

          {/* 适用条件 */}
          {policy.conditions && (
            <div className="mb-6">
              <Title level={4} className="!mb-3">适用条件</Title>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {policy.conditions}
              </div>
            </div>
          )}

          {policy.benefits && (
            <>
              <Divider />
              <div className="mb-0">
                <Title level={4} className="!mb-3">政策福利</Title>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {policy.benefits}
                </div>
              </div>
            </>
          )}
        </Card>

        {/* 有效期提醒 */}
        {policy.expiryDate && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <Text strong className="text-orange-800 text-sm sm:text-base">
              政策有效期至：{new Date(policy.expiryDate).toLocaleDateString('zh-CN')}
            </Text>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-center gap-3 sm:gap-4 flex-col sm:flex-row">
          <Button size="large" onClick={() => router.push('/policies')} className="min-h-[44px]">
            返回列表
          </Button>
          <Link href="/register">
            <Button type="primary" size="large" className="min-h-[44px]">
              注册获取更多服务
            </Button>
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  )
}
