'use client'

import React, { useState } from 'react'
import { Card, Row, Col, Statistic, Typography, Spin, DatePicker, Space } from 'antd'
import {
  TeamOutlined, FileTextOutlined, CheckCircleOutlined,
  RiseOutlined
} from '@ant-design/icons'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { RetentionTrendChart, IndustryDistributionChart } from '@/components/charts'
import useSWR from 'swr'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

interface GovernmentStats {
  totalApplications: number
  todayApplications: number
  totalInterviews: number
  avgMatchScore: number
  retentionRate: number
}

interface TrendData {
  month: string
  applications: number
  interviews: number
  offers: number
}

interface IndustryData {
  industry: string
  count: number
}

// SWR fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url)
  return res.json()
}

export default function GovernmentStatisticsPage() {
  const { status } = useSession()
  const router = useRouter()
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

  // 构建请求 URL
  const getApiUrl = () => {
    const params = new URLSearchParams()
    if (dateRange?.[0] && dateRange?.[1]) {
      params.append('startDate', dateRange[0].format('YYYY-MM-DD'))
      params.append('endDate', dateRange[1].format('YYYY-MM-DD'))
    }
    const queryString = params.toString()
    return `/api/statistics/government${queryString ? `?${queryString}` : ''}`
  }

  // 使用 SWR 获取数据（带缓存）
  const { data, isLoading } = useSWR(
    status === 'authenticated' ? getApiUrl() : null,
    fetcher,
    {
      revalidateOnFocus: false,    // 切换标签页不刷新
      dedupingInterval: 60000,     // 60秒内相同请求不重复发送
      refreshInterval: 0,          // 不自动刷新
    }
  )

  const stats = data?.data?.stats as GovernmentStats | undefined
  const trend = data?.data?.trend as TrendData[] | undefined
  const industryDistribution = data?.data?.industryDistribution as IndustryData[] | undefined
  const loading = isLoading && !data

  if (status === 'loading') {
    return (
      <DashboardLayout role="government">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/government/statistics')
    return null
  }

  return (
    <DashboardLayout role="government">
      <div className="mb-6">
        <Title level={4} className="!mb-2">数据统计</Title>
        <Text type="secondary">武汉市人才留汉数据分析</Text>
      </div>

      <Card className="mb-4">
        <Space>
          <Text>时间范围:</Text>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            allowClear
          />
        </Space>
      </Card>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="总投递数"
              value={stats?.totalApplications || 0}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="今日投递"
              value={stats?.todayApplications || 0}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#1677FF' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="面试总数"
              value={stats?.totalInterviews || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card loading={loading}>
            <Statistic
              title="留汉率"
              value={stats?.retentionRate || 0}
              suffix="%"
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52C41A' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <RetentionTrendChart data={trend || []} loading={loading} title="留汉趋势" />
        </Col>
        <Col xs={24} lg={8}>
          <IndustryDistributionChart data={industryDistribution || []} loading={loading} title="行业分布" />
        </Col>
      </Row>
    </DashboardLayout>
  )
}
