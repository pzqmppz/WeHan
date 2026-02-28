/**
 * 公开政策列表页面
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { Layout, Card, Typography, Tag, Empty, Spin, Pagination } from 'antd'
import { CalendarOutlined, ArrowRightOutlined } from '@ant-design/icons'
import { PortalHeader, PortalFooter } from '@/components/layout'
import { usePolicies } from '@/hooks/usePolicies'
import { useState } from 'react'

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

export default function PoliciesPage() {
  const [page, setPage] = useState(1)
  const { policies, loading, error, pagination } = usePolicies({ page, pageSize: 10 })

  return (
    <Layout className="min-h-screen">
      <PortalHeader />
      <Content className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-8">
            <Title level={2}>人才政策</Title>
            <Text type="secondary">
              武汉市最新人才政策、住房补贴、创业扶持等政策信息
            </Text>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spin size="large" />
            </div>
          ) : error ? (
            <Card>
              <Empty description="加载失败，请稍后重试" />
            </Card>
          ) : policies.length === 0 ? (
            <Card>
              <Empty description="暂无政策信息" />
            </Card>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Link key={policy.id} href={`/policies/${policy.id}`}>
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow mb-4"
                    hoverable
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag color={TYPE_COLORS[policy.type] || 'default'}>
                            {TYPE_NAMES[policy.type] || '其他'}
                          </Tag>
                          {policy.effectiveDate && (
                            <Text type="secondary" className="text-xs">
                              <CalendarOutlined className="mr-1" />
                              {new Date(policy.effectiveDate).toLocaleDateString('zh-CN')}
                            </Text>
                          )}
                        </div>
                        <Title level={4} className="!mb-2">{policy.title}</Title>
                        {policy.summary && (
                          <Paragraph
                            type="secondary"
                            className="!mb-0"
                            ellipsis={{ rows: 2 }}
                          >
                            {policy.summary}
                          </Paragraph>
                        )}
                      </div>
                      <ArrowRightOutlined className="text-gray-400 ml-4 mt-2" />
                    </div>
                  </Card>
                </Link>
              ))}

              {pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
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
            </div>
          )}
        </div>
      </Content>
      <PortalFooter />
    </Layout>
  )
}
