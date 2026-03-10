/**
 * 人才政策页面 - 与首页风格统一
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Card, Typography, Tag, Empty, Spin, Pagination } from 'antd'
import { CalendarOutlined, FileTextOutlined } from '@ant-design/icons'
import { usePolicies } from '@/hooks/usePolicies'
import { useState } from 'react'
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

export default function PoliciesPage() {
  const [page, setPage] = useState(1)
  const { policies, loading, error, pagination } = usePolicies({ page, pageSize: 10 })

  return (
    <PublicPageLayout bgClassName="bg-white">
      {/* Hero Section - 与首页统一的蓝色渐变 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-16 sm:py-20">
        {/* 装饰性网格背景 - 与首页一致 */}
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

        {/* 装饰性光晕 */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-400/15 to-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Title level={1} className="!text-white !mb-4 !text-3xl sm:!text-4xl !font-semibold">
              武汉人才政策信息
            </Title>
            <Paragraph className="!text-white/90 !text-base sm:!text-lg !mb-6 sm:!mb-8 !leading-relaxed">
              及时了解武汉市最新人才引进、住房补贴、创业扶持等政策信息，把握发展机遇
            </Paragraph>

            {/* 关键数据 */}
            <div className="flex gap-6 sm:gap-12">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">{pagination.total}+</div>
                <Text className="text-white/70 text-xs sm:text-sm">政策文件</Text>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">4</div>
                <Text className="text-white/70 text-xs sm:text-sm">政策类型</Text>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">实时</div>
                <Text className="text-white/70 text-xs sm:text-sm">更新同步</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 快速筛选区 */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/policies" className="px-4 sm:px-5 py-2 rounded-full text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              全部政策
            </Link>
            <Link href="/policies?type=TALENT" className="px-4 sm:px-5 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              人才政策
            </Link>
            <Link href="/policies?type=HOUSING" className="px-4 sm:px-5 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              住房政策
            </Link>
            <Link href="/policies?type=ENTREPRENEURSHIP" className="px-4 sm:px-5 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              创业扶持
            </Link>
            <Link href="/policies?type=EMPLOYMENT" className="px-4 sm:px-5 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              就业政策
            </Link>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="bg-gray-50 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Card className="text-center py-12">
              <FileTextOutlined className="text-6xl text-gray-300 mb-4" />
              <Title level={4} className="!mb-2">加载失败</Title>
              <Text type="secondary">请稍后重试</Text>
            </Card>
          ) : policies.length === 0 ? (
            <Card className="text-center py-12">
              <FileTextOutlined className="text-6xl text-gray-300 mb-4" />
              <Title level={4} className="!mb-2">暂无政策信息</Title>
              <Text type="secondary">请关注后续更新</Text>
            </Card>
          ) : (
            <>
              {/* 政策卡片网格 - 与首页 feature cards 一致的布局 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {policies.map((policy) => {
                  const typeConfig = POLICY_TYPES[policy.type] || POLICY_TYPES.OTHER
                  return (
                    <Link
                      key={policy.id}
                      href={`/policies/${policy.id}`}
                      className="block"
                    >
                      <Card
                        className="h-full shadow-sm hover:shadow-md transition-shadow border-0"
                        styles={{ body: { padding: '16px sm:px-6 sm:py-6' } }}
                      >
                        {/* 类型标签 + 日期 */}
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: typeConfig.bg,
                              color: typeConfig.text
                            }}
                          >
                            {typeConfig.name}
                          </span>
                          {policy.effectiveDate && (
                            <div className="flex items-center text-gray-400 text-xs">
                              <CalendarOutlined className="mr-1" />
                              {new Date(policy.effectiveDate).toLocaleDateString('zh-CN')}
                            </div>
                          )}
                        </div>

                        {/* 标题 */}
                        <Title level={5} className="!mb-2 !text-lg !text-gray-900">
                          {policy.title}
                        </Title>

                        {/* 摘要 */}
                        {policy.summary && (
                          <Paragraph
                            className="!mb-0 text-gray-500 text-sm leading-relaxed"
                            ellipsis={{ rows: 2 }}
                          >
                            {policy.summary}
                          </Paragraph>
                        )}

                        {/* 查看详情 */}
                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                          <Text type="secondary" className="text-xs">
                            查看完整政策内容
                          </Text>
                          <span className="text-blue-600 text-xs font-medium">
                            查看详情 →
                          </span>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>

              {/* 分页 */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <Pagination
                    current={pagination.page}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    onChange={setPage}
                    showSizeChanger={false}
                    showTotal={(total) => `共 ${total} 条政策`}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </PublicPageLayout>
  )
}
