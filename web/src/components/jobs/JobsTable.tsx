/**
 * 岗位管理表格组件
 */

'use client'

import React from 'react'
import { Table, Button, Space, Tag, Badge, Tooltip, Popconfirm } from 'antd'
import { useRouter } from 'next/navigation'
import {
  EyeOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { Job, JOB_STATUS_CONFIG } from '@/hooks/useJobs'

interface JobsTableProps {
  jobs: Job[]
  loading: boolean
  pagination: { current: number; pageSize: number; total: number }
  onPageChange: (page: number, pageSize: number) => void
  onPublish: (id: string) => Promise<boolean>
  onClose: (id: string) => Promise<boolean>
  onDelete: (id: string) => Promise<boolean>
}

export function JobsTable({
  jobs,
  loading,
  pagination,
  onPageChange,
  onPublish,
  onClose,
  onDelete,
}: JobsTableProps) {
  const router = useRouter()

  const columns: ColumnsType<Job> = [
    {
      title: '岗位名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text: string, record) => (
        <a onClick={() => router.push(`/enterprise/jobs/${record.id}`)}>
          {text}
        </a>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '薪资范围',
      key: 'salary',
      width: 150,
      render: (_, record) => {
        if (!record.salaryMin && !record.salaryMax) return '面议'
        const min = record.salaryMin ? `${(record.salaryMin / 1000).toFixed(0)}K` : ''
        const max = record.salaryMax ? `${(record.salaryMax / 1000).toFixed(0)}K` : ''
        return min && max ? `${min}-${max}` : min || max
      },
    },
    {
      title: '招聘人数',
      dataIndex: 'headcount',
      key: 'headcount',
      width: 100,
      align: 'center',
    },
    {
      title: '投递数',
      dataIndex: 'applicationsCount',
      key: 'applicationsCount',
      width: 80,
      align: 'center',
      render: (count: number) => <Badge count={count} showZero color="blue" />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = JOB_STATUS_CONFIG[status] || JOB_STATUS_CONFIG.DRAFT
        return <Tag color={config.color}>{config.label}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="查看">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/enterprise/jobs/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => router.push(`/enterprise/jobs/${record.id}/edit`)}
            />
          </Tooltip>
          {record.status === 'DRAFT' && (
            <Tooltip title="发布">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onPublish(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'PUBLISHED' && (
            <Tooltip title="下架">
              <Button
                type="text"
                size="small"
                icon={<StopOutlined />}
                onClick={() => onClose(record.id)}
              />
            </Tooltip>
          )}
          {record.status === 'CLOSED' && (
            <Tooltip title="重新发布">
              <Button
                type="text"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onPublish(record.id)}
              />
            </Tooltip>
          )}
          <Popconfirm
            title="确定要删除这个岗位吗？"
            onConfirm={() => onDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={jobs}
      rowKey="id"
      loading={loading}
      scroll={{ x: 1200 }}
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
