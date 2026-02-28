/**
 * 人才投递记录组件
 * 显示投递历史和面试报告
 */

'use client'

import React from 'react'
import { Card, Timeline, Tag, Typography, Tabs } from 'antd'
import { useRouter } from 'next/navigation'
import { InterviewReport, INTERVIEW_STATUS_CONFIG } from './InterviewReport'

const { Text } = Typography

export const APPLICATION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待处理' },
  VIEWED: { color: 'default', label: '已查看' },
  INTERVIEWING: { color: 'warning', label: '面试中' },
  OFFERED: { color: 'success', label: '已录用' },
  REJECTED: { color: 'error', label: '已拒绝' },
  WITHDRAWN: { color: 'default', label: '已撤回' },
}

interface Application {
  id: string
  status: string
  matchScore: number | null
  createdAt: string
  job: {
    id: string
    title: string
    location: string | null
    salaryMin: number | null
    salaryMax: number | null
  }
  interview: {
    id: string
    totalScore: number | null
    status: string
    dimensions: any
    highlights: any
    improvements: any
    suggestions: string | null
    completedAt: string | null
  } | null
}

interface TalentApplicationsProps {
  applications: Application[]
}

export function TalentApplications({ applications }: TalentApplicationsProps) {
  const router = useRouter()

  return (
    <>
      {/* 投递记录 */}
      <Card title="投递记录" className="mb-4">
        <Timeline
          items={applications.map(app => ({
            color: APPLICATION_STATUS_CONFIG[app.status]?.color === 'success' ? 'green' :
                   APPLICATION_STATUS_CONFIG[app.status]?.color === 'error' ? 'red' :
                   APPLICATION_STATUS_CONFIG[app.status]?.color === 'warning' ? 'yellow' : 'gray',
            children: (
              <div>
                <div className="flex justify-between items-start">
                  <Text strong
                    className="cursor-pointer hover:text-blue-500"
                    onClick={() => router.push(`/enterprise/jobs/${app.job.id}`)}
                  >
                    {app.job.title}
                  </Text>
                  <Tag color={APPLICATION_STATUS_CONFIG[app.status]?.color}>
                    {APPLICATION_STATUS_CONFIG[app.status]?.label}
                  </Tag>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(app.createdAt).toLocaleDateString('zh-CN')}
                </div>
                {app.matchScore && (
                  <div className="mt-1">
                    <Text type="secondary" className="text-xs">
                      匹配度：{Math.round(app.matchScore)}%
                    </Text>
                  </div>
                )}
              </div>
            ),
          }))}
        />
      </Card>

      {/* 面试报告 */}
      {applications.some(app => app.interview) && (
        <Card title="面试报告">
          <Tabs
            items={applications
              .filter(app => app.interview)
              .map((app) => ({
                key: app.interview!.id,
                label: (
                  <span>
                    {app.job.title}
                    <Tag
                      color={INTERVIEW_STATUS_CONFIG[app.interview!.status]?.color}
                      className="ml-2"
                    >
                      {INTERVIEW_STATUS_CONFIG[app.interview!.status]?.label}
                    </Tag>
                  </span>
                ),
                children: <InterviewReport interview={app.interview!} />,
              }))}
          />
        </Card>
      )}
    </>
  )
}
