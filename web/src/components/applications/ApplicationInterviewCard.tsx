/**
 * 面试报告卡片组件
 */

'use client'

import React from 'react'
import { Card, Descriptions, Typography, Tag, Space } from 'antd'

const { Text, Paragraph } = Typography

interface Interview {
  id: string
  totalScore: number | null
  dimensions?: any[]
  suggestions?: string
  status: string
  createdAt: string
}

interface ApplicationInterviewCardProps {
  interview: Interview
}

export function ApplicationInterviewCard({ interview }: ApplicationInterviewCardProps) {
  const formatScore = (score: number | null) => {
    if (score === null) return '未评估'
    if (score >= 80) return <Tag color="success">{score}分 - 优秀</Tag>
    if (score >= 60) return <Tag color="warning">{score}分 - 良好</Tag>
    return <Tag color="error">{score}分 - 一般</Tag>
  }

  return (
    <Card title="AI 面试报告" className="mb-4">
      <Descriptions column={1} bordered size="small">
        <Descriptions.Item label="综合评分">
          {formatScore(interview.totalScore)}
        </Descriptions.Item>
        {interview.dimensions?.map((dim: any, idx: number) => (
          <Descriptions.Item key={idx} label={dim.name}>
            <Space>
              <Text>{dim.score}/{dim.maxScore}</Text>
              {dim.comment && <Text type="secondary">({dim.comment})</Text>}
            </Space>
          </Descriptions.Item>
        ))}
        {interview.suggestions && (
          <Descriptions.Item label="改进建议">
            <Paragraph className="mb-0">{interview.suggestions}</Paragraph>
          </Descriptions.Item>
        )}
      </Descriptions>
    </Card>
  )
}
