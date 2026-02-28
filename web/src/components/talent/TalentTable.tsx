/**
 * 人才库表格组件
 */

'use client'

import React from 'react'
import { Table, Button, Space, Tag, Typography, Avatar, Progress, Badge } from 'antd'
import { useRouter } from 'next/navigation'
import { EyeOutlined, MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { TalentPoolItem } from '@/hooks/useTalentPool'

const { Text } = Typography

const APPLICATION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待处理' },
  VIEWED: { color: 'default', label: '已查看' },
  INTERVIEWING: { color: 'warning', label: '面试中' },
  OFFERED: { color: 'success', label: '已录用' },
  REJECTED: { color: 'error', label: '已拒绝' },
  WITHDRAWN: { color: 'default', label: '已撤回' },
}

interface TalentTableProps {
  talents: TalentPoolItem[]
  loading: boolean
  pagination: { current: number; pageSize: number; total: number }
  onPageChange: (page: number, pageSize: number) => void
}

export function TalentTable({ talents, loading, pagination, onPageChange }: TalentTableProps) {
  const router = useRouter()

  const getHighestInterviewScore = (applications: TalentPoolItem['applications']) => {
    const scores = applications
      .filter(a => a.interview?.totalScore)
      .map(a => a.interview!.totalScore as number)
    return scores.length > 0 ? Math.max(...scores) : null
  }

  const getHighestMatchScore = (applications: TalentPoolItem['applications']) => {
    const scores = applications
      .filter(a => a.matchScore)
      .map(a => a.matchScore as number)
    return scores.length > 0 ? Math.max(...scores) : null
  }

  const getLatestStatus = (applications: TalentPoolItem['applications']) => {
    if (applications.length === 0) return null
    return applications[0].status
  }

  const columns: ColumnsType<TalentPoolItem> = [
    {
      title: '候选人',
      key: 'candidate',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium">{record.name}</div>
            <Text type="secondary" className="text-xs">
              {record.major || '未知专业'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '联系方式',
      key: 'contact',
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-xs">
            <MailOutlined className="text-gray-400" />
            <Text type="secondary" className="text-xs truncate max-w-[140px]">
              {record.email}
            </Text>
          </div>
          {record.phone && (
            <div className="flex items-center gap-1 text-xs">
              <PhoneOutlined className="text-gray-400" />
              <Text type="secondary">{record.phone}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '技能标签',
      key: 'skills',
      width: 200,
      render: (_, record) => {
        const skills = record.resume?.skills || []
        if (skills.length === 0) {
          return <Text type="secondary">暂无</Text>
        }
        return (
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 3).map((skill, index) => (
              <Tag key={index} className="text-xs">
                {skill}
              </Tag>
            ))}
            {skills.length > 3 && (
              <Tag className="text-xs">+{skills.length - 3}</Tag>
            )}
          </div>
        )
      },
    },
    {
      title: '投递岗位',
      key: 'applications',
      width: 150,
      render: (_, record) => (
        <div>
          <Badge count={record.applications.length} showZero color="blue" />
          <Text className="ml-2">个岗位</Text>
        </div>
      ),
    },
    {
      title: '匹配度',
      key: 'matchScore',
      width: 120,
      render: (_, record) => {
        const score = getHighestMatchScore(record.applications)
        if (score === null) {
          return <Text type="secondary">-</Text>
        }
        const percent = Math.round(score)
        return (
          <Progress
            percent={percent}
            size="small"
            format={p => `${p}%`}
            strokeColor={percent >= 80 ? '#52c41a' : percent >= 60 ? '#1890ff' : '#faad14'}
          />
        )
      },
    },
    {
      title: '面试分数',
      key: 'interviewScore',
      width: 100,
      render: (_, record) => {
        const score = getHighestInterviewScore(record.applications)
        if (score === null) {
          return <Text type="secondary">-</Text>
        }
        const roundedScore = Math.round(score)
        return (
          <Tag color={roundedScore >= 80 ? 'success' : roundedScore >= 60 ? 'processing' : 'warning'}>
            {roundedScore}分
          </Tag>
        )
      },
    },
    {
      title: '最新状态',
      key: 'status',
      width: 100,
      render: (_, record) => {
        const status = getLatestStatus(record.applications)
        if (!status) return <Text type="secondary">-</Text>
        const config = APPLICATION_STATUS_CONFIG[status] || APPLICATION_STATUS_CONFIG.PENDING
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => router.push(`/enterprise/talent/${record.id}`)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={talents}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 人`,
        onChange: onPageChange,
      }}
    />
  )
}
