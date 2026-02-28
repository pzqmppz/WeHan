/**
 * 面试报告组件
 * 显示面试评分、维度分析、亮点和改进点
 */

'use client'

import React from 'react'
import { Typography, Progress, Statistic, Tag } from 'antd'
import { StarOutlined, SafetyOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

export const INTERVIEW_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PREPARING: { color: 'default', label: '准备中' },
  IN_PROGRESS: { color: 'processing', label: '进行中' },
  COMPLETED: { color: 'success', label: '已完成' },
  EXPIRED: { color: 'error', label: '已过期' },
}

interface InterviewReportProps {
  interview: {
    id: string
    totalScore: number | null
    status: string
    dimensions: any
    highlights: any
    improvements: any
    suggestions: string | null
    completedAt: string | null
  }
}

export function InterviewReport({ interview }: InterviewReportProps) {
  const dimensions = interview.dimensions as Record<string, number> || {}
  const highlights = interview.highlights as string[] || []
  const improvements = interview.improvements as string[] || []

  return (
    <div className="space-y-4">
      {/* 综合评分 */}
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <Statistic
          title="综合评分"
          value={interview.totalScore ? Math.round(interview.totalScore) : '-'}
          suffix="分"
          valueStyle={{
            color: (interview.totalScore || 0) >= 80 ? '#52c41a' :
                   (interview.totalScore || 0) >= 60 ? '#1890ff' : '#faad14'
          }}
        />
      </div>

      {/* 维度评分 */}
      {Object.keys(dimensions).length > 0 && (
        <div>
          <Text strong>各维度评分</Text>
          <div className="mt-2 space-y-2">
            {Object.entries(dimensions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <Text className="w-24 text-sm">{key}</Text>
                <Progress
                  percent={value}
                  size="small"
                  className="flex-1"
                  strokeColor={value >= 80 ? '#52c41a' : value >= 60 ? '#1890ff' : '#faad14'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 亮点 */}
      {highlights.length > 0 && (
        <div>
          <Text strong className="flex items-center gap-1">
            <StarOutlined className="text-yellow-500" />
            亮点回答
          </Text>
          <ul className="mt-2 space-y-1 pl-4">
            {highlights.map((h, i) => (
              <li key={i} className="text-sm text-gray-600">{h}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 改进点 */}
      {improvements.length > 0 && (
        <div>
          <Text strong className="flex items-center gap-1">
            <SafetyOutlined className="text-blue-500" />
            待改进点
          </Text>
          <ul className="mt-2 space-y-1 pl-4">
            {improvements.map((imp, i) => (
              <li key={i} className="text-sm text-gray-600">{imp}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 建议 */}
      {interview.suggestions && (
        <div>
          <Text strong>改进建议</Text>
          <Paragraph className="mt-2 text-sm text-gray-600">
            {interview.suggestions}
          </Paragraph>
        </div>
      )}
    </div>
  )
}
