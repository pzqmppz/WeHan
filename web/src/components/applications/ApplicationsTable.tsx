/**
 * 投递列表表格组件
 */

'use client'

import React from 'react'
import { Table, Button, Space, Tag, Tooltip, Avatar, Badge, Typography } from 'antd'
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import type { ColumnsType } from 'antd/es/table'
import { Application, APPLICATION_STATUS_CONFIG, STATUS_FLOW } from '@/hooks/useApplications'

const { Text } = Typography

interface ApplicationsTableProps {
  applications: Application[]
  loading: boolean
  pagination: { current: number; pageSize: number; total: number }
  onUpdateStatus: (id: string, status: string) => Promise<boolean>
  onPageChange: (page: number, pageSize: number) => void
}

export default function ApplicationsTable({
  applications,
  loading,
  pagination,
  onUpdateStatus,
  onPageChange,
}: ApplicationsTableProps) {
  const router = useRouter()

  const formatMatchScore = (score: number | null) => {
    if (score === null) return '-'
    if (score >= 80) return <Tag color="success">{score}分</Tag>
    if (score >= 60) return <Tag color="warning">{score}分</Tag>
    return <Tag color="error">{score}分</Tag>
  }

  const columns: ColumnsType<Application> = [
    {
      title: '候选人',
      key: 'candidate',
      width: 200,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <Text strong>{record.user.name}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {record.user.school?.name || record.user.major || '未知学校'}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '投递岗位',
      dataIndex: ['job', 'title'],
      key: 'job',
      width: 180,
      render: (title: string, record) => (
        <div>
          <Text>{title}</Text>
          <br />
          <Text type="secondary" className="text-xs">
            {record.job.location || '地点未知'}
          </Text>
        </div>
      ),
    },
    {
      title: '匹配度',
      dataIndex: 'matchScore',
      key: 'matchScore',
      width: 80,
      align: 'center',
      render: formatMatchScore,
    },
    {
      title: '面试评分',
      dataIndex: ['interview', 'totalScore'],
      key: 'interviewScore',
      width: 80,
      align: 'center',
      render: (score: number | null, record) => {
        if (!record.interview) return <Text type="secondary">未面试</Text>
        if (score === null) return <Text type="secondary">进行中</Text>
        return <Badge count={score} showZero color={score >= 60 ? 'green' : 'red'} />
      },
    },
    {
      title: '投递时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = APPLICATION_STATUS_CONFIG[status] || APPLICATION_STATUS_CONFIG.PENDING
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const currentIndex = STATUS_FLOW.indexOf(record.status)
        const canAdvance = currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 2

        return (
          <Space size="small">
            <Tooltip title="查看详情">
              <Button
                type="text"
                size="small"
                icon={<EyeOutlined />}
                onClick={() => router.push(`/enterprise/applications/${record.id}`)}
              />
            </Tooltip>

            {record.status === 'PENDING' && (
              <>
                <Tooltip title="标记已查看">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => onUpdateStatus(record.id, 'VIEWED')}
                  />
                </Tooltip>
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => onUpdateStatus(record.id, 'REJECTED')}
                  />
                </Tooltip>
              </>
            )}

            {record.status === 'VIEWED' && (
              <>
                <Tooltip title="安排面试">
                  <Button
                    type="text"
                    size="small"
                    icon={<CalendarOutlined />}
                    onClick={() => onUpdateStatus(record.id, 'INTERVIEWING')}
                  />
                </Tooltip>
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => onUpdateStatus(record.id, 'REJECTED')}
                  />
                </Tooltip>
              </>
            )}

            {record.status === 'INTERVIEWING' && (
              <>
                <Tooltip title="录用">
                  <Button
                    type="text"
                    size="small"
                    style={{ color: '#52c41a' }}
                    icon={<CheckCircleOutlined />}
                    onClick={() => onUpdateStatus(record.id, 'OFFERED')}
                  />
                </Tooltip>
                <Tooltip title="拒绝">
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={() => onUpdateStatus(record.id, 'REJECTED')}
                  />
                </Tooltip>
              </>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={applications}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1000 }}
      pagination={{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        onChange: onPageChange,
      }}
    />
  )
}
