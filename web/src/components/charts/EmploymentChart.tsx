'use client'

import React from 'react'
import { Card, Empty, Spin, Row, Col, Statistic } from 'antd'
import { UserOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons'

interface EmploymentStats {
  totalStudents: number
  appliedStudents: number
  employedStudents: number
  employmentRate: number
  topIndustries: { industry: string; count: number }[]
  topCompanies: { name: string; count: number }[]
}

interface EmploymentChartProps {
  data: EmploymentStats | null
  loading?: boolean
  title?: string
}

export default function EmploymentChart({
  data,
  loading = false,
  title = '就业统计',
}: EmploymentChartProps) {
  if (loading) {
    return (
      <Card title={title}>
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card title={title}>
        <Empty description="暂无数据" />
      </Card>
    )
  }

  return (
    <Card title={title}>
      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Statistic
            title="学生总数"
            value={data.totalStudents}
            prefix={<TeamOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="已投递"
            value={data.appliedStudents}
            prefix={<UserOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="已录用"
            value={data.employedStudents}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="就业率"
            value={data.employmentRate}
            suffix="%"
            valueStyle={{ color: data.employmentRate >= 50 ? '#52C41A' : '#FAAD14' }}
          />
        </Col>
      </Row>

      {data.topIndustries.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">热门行业</div>
          <div className="flex flex-wrap gap-2">
            {data.topIndustries.slice(0, 5).map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-sm"
              >
                {item.industry} ({item.count})
              </span>
            ))}
          </div>
        </div>
      )}

      {data.topCompanies.length > 0 && (
        <div className="mt-4">
          <div className="text-sm text-gray-500 mb-2">热门企业</div>
          <div className="flex flex-wrap gap-2">
            {data.topCompanies.slice(0, 5).map((item, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-50 text-green-600 rounded text-sm"
              >
                {item.name} ({item.count})
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
