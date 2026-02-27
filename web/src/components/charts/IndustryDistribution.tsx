'use client'

import React from 'react'
import { Card, Empty, Spin } from 'antd'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts'

const COLORS = [
  '#1677FF', '#52C41A', '#FAAD14', '#FF4D4F', '#722ED1',
  '#13C2C2', '#EB2F96', '#FA8C16', '#A0D911', '#2F54EB'
]

interface IndustryData {
  industry: string
  count: number
}

interface IndustryDistributionChartProps {
  data: IndustryData[]
  loading?: boolean
  title?: string
}

export default function IndustryDistributionChart({
  data,
  loading = false,
  title = '行业分布',
}: IndustryDistributionChartProps) {
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

  const chartData = data.slice(0, 10).map((item) => ({
    name: item.industry,
    value: item.count,
  }))

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
