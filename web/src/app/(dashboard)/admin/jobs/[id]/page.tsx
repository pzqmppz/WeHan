/**
 * 管理员端 - 岗位详情页
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, Descriptions, Button, Space, Tag, Typography, Spin, App } from 'antd'
import { ArrowLeftOutlined, EditOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text } = Typography

interface JobDetail {
  id: string
  title: string
  industry: string | null
  category: string | null
  location: string | null
  address: string | null
  salaryMin: number | null
  salaryMax: number | null
  description: string
  requirements: string | null
  benefits: string | null
  skills: string[]
  educationLevel: string | null
  experienceYears: number | null
  freshGraduate: boolean
  headcount: number
  status: string
  createdAt: string
  updatedAt: string
  Enterprise: {
    id: string
    name: string
    industry: string | null
    scale: string | null
    address: string | null
  }
}

const JOB_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  DRAFT: { label: '草稿', color: 'default' },
  PUBLISHED: { label: '已发布', color: 'success' },
  CLOSED: { label: '已关闭', color: 'warning' },
  ARCHIVED: { label: '已归档', color: 'default' },
}

export default function AdminJobDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { message } = App.useApp()
  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    if (session && params.id) {
      fetchJob()
    }
  }, [session, params.id])

  const fetchJob = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setJob(data.data)
      } else {
        message.error('获取岗位详情失败')
        router.push('/admin/jobs')
      }
    } catch (error) {
      console.error('Fetch job error:', error)
      message.error('获取岗位详情失败')
      router.push('/admin/jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: 'PUBLISHED' | 'CLOSED') => {
    if (!job) return

    setActionLoading(true)
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (data.success) {
        message.success(newStatus === 'PUBLISHED' ? '岗位已发布' : '岗位已下架')
        fetchJob()
      } else {
        message.error(data.error || '操作失败')
      }
    } catch (error) {
      message.error('操作失败')
    } finally {
      setActionLoading(false)
    }
  }

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return '面议'
    if (min && max) return `${(min / 1000).toFixed(0)}-${(max / 1000).toFixed(0)}K/月`
    if (min) return `${(min / 1000).toFixed(0)}K起/月`
    return `最高${(max! / 1000).toFixed(0)}K/月`
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin/jobs')
    return null
  }

  if (!job) {
    return null
  }

  const statusConfig = JOB_STATUS_LABELS[job.status] || JOB_STATUS_LABELS.DRAFT

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/admin/jobs')}>
            返回
          </Button>
        </Space>
      </div>

      <Card
        title={
          <div className="flex items-center justify-between">
            <Title level={4} className="!mb-0">{job.title}</Title>
            <Space>
              {(job.status === 'DRAFT' || job.status === 'CLOSED') && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusChange('PUBLISHED')}
                  loading={actionLoading}
                >
                  {job.status === 'CLOSED' ? '重新发布' : '发布'}
                </Button>
              )}
              {job.status === 'PUBLISHED' && (
                <Button
                  icon={<StopOutlined />}
                  onClick={() => handleStatusChange('CLOSED')}
                  loading={actionLoading}
                >
                  下架
                </Button>
              )}
            </Space>
          </div>
        }
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="所属企业">
            <a onClick={() => router.push(`/admin/enterprises/${job.Enterprise?.id}`)}>
              {job.Enterprise?.name || '-'}
            </a>
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="行业">
            {job.industry || job.Enterprise?.industry || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="岗位类别">
            {job.category || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="工作地点">
            {job.location || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="详细地址">
            {job.address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="薪资范围">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </Descriptions.Item>
          <Descriptions.Item label="招聘人数">
            {job.headcount}人
          </Descriptions.Item>
          <Descriptions.Item label="学历要求">
            {job.educationLevel || '不限'}
          </Descriptions.Item>
          <Descriptions.Item label="经验要求">
            {job.experienceYears ? `${job.experienceYears}年` : '不限'}
          </Descriptions.Item>
          <Descriptions.Item label="接受应届生">
            <Tag color={job.freshGraduate ? 'success' : 'default'}>
              {job.freshGraduate ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="技能要求">
            {job.skills?.length > 0 ? job.skills.join('、') : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="岗位描述" span={2}>
            <div className="whitespace-pre-wrap">{job.description}</div>
          </Descriptions.Item>
          <Descriptions.Item label="任职要求" span={2}>
            <div className="whitespace-pre-wrap">{job.requirements || '-'}</div>
          </Descriptions.Item>
          <Descriptions.Item label="福利待遇" span={2}>
            <div className="whitespace-pre-wrap">{job.benefits || '-'}</div>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(job.createdAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(job.updatedAt).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </DashboardLayout>
  )
}
