/**
 * 政策详情页面
 */

'use client'

import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Layout, Card, Typography, Tag, Button, Spin, Result } from 'antd'
import { ArrowLeftOutlined, CalendarOutlined } from '@ant-design/icons'
import { PortalHeader, PortalFooter } from '@/components/layout'
import { usePolicyDetail } from '@/hooks/usePolicies'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography

// 政策类型标签颜色
const TYPE_COLORS: Record<string, string> = {
  TALENT: 'blue',
  HOUSING: 'green',
  ENTREPRENEURSHIP: 'orange',
  EMPLOYMENT: 'purple',
  OTHER: 'default',
}

// 政策类型名称
const TYPE_NAMES: Record<string, string> = {
  TALENT: '人才政策',
  HOUSING: '住房政策',
  ENTREPRENEURSHIP: '创业扶持',
  EMPLOYMENT: '就业政策',
  OTHER: '其他',
}

export default function PolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const { policy, loading, error } = usePolicyDetail(id)

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <PortalHeader />
        <Content className="bg-gray-50 flex items-center justify-center">
          <Spin size="large" />
        </Content>
        <PortalFooter />
      </Layout>
    )
  }

  if (error || !policy) {
    return (
      <Layout className="min-h-screen">
        <PortalHeader />
        <Content className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <Result
              status="404"
              title="政策不存在"
              subTitle="该政策可能已被删除或下架"
              extra={
                <Link href="/policies">
                  <Button type="primary">返回政策列表</Button>
                </Link>
              }
            />
          </div>
        </Content>
        <PortalFooter />
      </Layout>
    )
  }

  return (
    <Layout className="min-h-screen">
      <PortalHeader />
      <Content className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.push('/policies')}
            className="mb-4"
          >
            返回政策列表
          </Button>

          <Card>
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Tag color={TYPE_COLORS[policy.type] || 'default'}>
                  {TYPE_NAMES[policy.type] || '其他'}
                </Tag>
                {policy.effectiveDate && (
                  <Text type="secondary" className="text-sm">
                    <CalendarOutlined className="mr-1" />
                    生效日期：{new Date(policy.effectiveDate).toLocaleDateString('zh-CN')}
                  </Text>
                )}
              </div>
              <Title level={2} className="!mb-2">{policy.title}</Title>
              <Text type="secondary">
                发布时间：{new Date(policy.createdAt).toLocaleDateString('zh-CN')}
              </Text>
            </div>

            {policy.summary && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <Text strong>政策摘要</Text>
                <Paragraph className="!mb-0 mt-2">{policy.summary}</Paragraph>
              </div>
            )}

            <div className="prose max-w-none">
              <Title level={4}>政策内容</Title>
              <div className="whitespace-pre-wrap text-gray-700">
                {policy.content}
              </div>
            </div>

            {policy.conditions && (
              <div className="mt-6">
                <Title level={4}>适用条件</Title>
                <div className="whitespace-pre-wrap text-gray-700">
                  {policy.conditions}
                </div>
              </div>
            )}

            {policy.benefits && (
              <div className="mt-6">
                <Title level={4}>政策福利</Title>
                <div className="whitespace-pre-wrap text-gray-700">
                  {policy.benefits}
                </div>
              </div>
            )}

            {policy.expiryDate && (
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <Text type="warning">
                  政策有效期至：{new Date(policy.expiryDate).toLocaleDateString('zh-CN')}
                </Text>
              </div>
            )}
          </Card>
        </div>
      </Content>
      <PortalFooter />
    </Layout>
  )
}
