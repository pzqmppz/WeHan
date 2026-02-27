'use client'

import React from 'react'
import { Card, Typography, Empty, Spin } from 'antd'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const { Title, Text } = Typography

interface TrendData {
  month: string
  applications: number
  interviews: number
  offers: number
}

interface RetentionTrendChartProps {
  data: TrendData[]
  loading?: boolean
  title?: string
}

export default function RetentionTrendChart({
  data,
  loading = false,
  title = '留汉趋势',
}: RetentionTrendChartProps) {
  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card title={title}>
        <Empty description="暂无数据" />
      </Card>
    )
  }

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="applications"
            name="投递数"
            stroke="#1677FF"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="interviews"
            name="面试数"
            stroke="#52C41A"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="offers"
            name="录用数"
            stroke="#FAAD14"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
