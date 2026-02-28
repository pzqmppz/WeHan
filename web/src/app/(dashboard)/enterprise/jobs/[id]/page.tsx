'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, Descriptions, Tag, Button, Space, Typography, Spin, Divider, Row, Col, Badge, Modal, App
} from 'antd'
import {
  EditOutlined, DeleteOutlined, CheckCircleOutlined, StopOutlined, ArrowLeftOutlined
} from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text, Paragraph } = Typography

// 岗位状态配置
const JOB_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  PUBLISHED: { color: 'success', label: '已发布' },
  CLOSED: { color: 'warning', label: '已关闭' },
  ARCHIVED: { color: 'default', label: '已归档' },
}

interface Job {
  id: string
  title: string
  industry: string | null
  category: string | null
  salaryMin: number | null
  salaryMax: number | null
  location: string | null
  address: string | null
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
  publishedAt: string | null
  enterprise: {
    id: string
    name: string
  }
  _count?: {
    applications: number
  }
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.id as string
  const { message } = App.useApp()

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const fetchJob = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`)
      const data = await res.json()

      if (data.success) {
        setJob(data.data)
      } else {
        router.push('/enterprise/jobs')
      }
    } catch (error) {
      console.error('Fetch job error:', error)
      router.push('/enterprise/jobs')
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('岗位已发布')
        setJob(data.data)
      } else {
        message.error(data.error || '发布失败')
      }
    } catch (error) {
      message.error('发布失败')
    }
  }

  const handleClose = async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('岗位已下架')
        setJob(data.data)
      } else {
        message.error(data.error || '下架失败')
      }
    } catch (error) {
      message.error('下架失败')
    }
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个岗位吗？此操作不可恢复。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' })
          const data = await res.json()

          if (data.success) {
            message.success('岗位已删除')
            router.push('/enterprise/jobs')
          } else {
            message.error(data.error || '删除失败')
          }
        } catch (error) {
          message.error('删除失败')
        }
      },
    })
  }

  // 薪资格式化
  const formatSalary = () => {
    if (!job?.salaryMin && !job?.salaryMax) return '面议'
    const min = job.salaryMin ? `${(job.salaryMin / 1000).toFixed(0)}K` : ''
    const max = job.salaryMax ? `${(job.salaryMax / 1000).toFixed(0)}K` : ''
    return min && max ? `${min}-${max}` : min || max
  }

  if (loading) {
    return (
      <DashboardLayout role="enterprise">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (!job) {
    return (
      <DashboardLayout role="enterprise">
        <div className="text-center py-12">
          <Text type="secondary">岗位不存在</Text>
        </div>
      </DashboardLayout>
    )
  }

  const statusConfig = JOB_STATUS_CONFIG[job.status] || JOB_STATUS_CONFIG.DRAFT

  return (
    <DashboardLayout role="enterprise">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/enterprise/jobs')}>
            返回
          </Button>
          <div>
            <Title level={4} className="!mb-0">{job.title}</Title>
            <Space className="mt-1">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
              <Text type="secondary">
                {job._count?.applications || 0} 人投递
              </Text>
            </Space>
          </div>
        </div>

        <Space>
          {job.status === 'DRAFT' && (
            <>
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                onClick={handlePublish}
              >
                发布岗位
              </Button>
              <Button icon={<EditOutlined />} onClick={() => router.push(`/enterprise/jobs/${jobId}/edit`)}>
                编辑
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                删除
              </Button>
            </>
          )}
          {job.status === 'PUBLISHED' && (
            <>
              <Button icon={<StopOutlined />} onClick={handleClose}>
                下架
              </Button>
              <Button icon={<EditOutlined />} onClick={() => router.push(`/enterprise/jobs/${jobId}/edit`)}>
                编辑
              </Button>
            </>
          )}
          {job.status === 'CLOSED' && (
            <>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={handlePublish}>
                重新发布
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
                删除
              </Button>
            </>
          )}
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* 基本信息 */}
          <Card title="基本信息" className="mb-4">
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="岗位名称">{job.title}</Descriptions.Item>
              <Descriptions.Item label="岗位类别">{job.category || '-'}</Descriptions.Item>
              <Descriptions.Item label="所属行业">{job.industry || '-'}</Descriptions.Item>
              <Descriptions.Item label="招聘人数">{job.headcount} 人</Descriptions.Item>
              <Descriptions.Item label="薪资范围">{formatSalary()}</Descriptions.Item>
              <Descriptions.Item label="学历要求">{job.educationLevel || '不限'}</Descriptions.Item>
              <Descriptions.Item label="经验要求">
                {job.experienceYears ? `${job.experienceYears}年` : '不限'}
              </Descriptions.Item>
              <Descriptions.Item label="接受应届生">
                {job.freshGraduate ? '是' : '否'}
              </Descriptions.Item>
              <Descriptions.Item label="工作区域">{job.location || '-'}</Descriptions.Item>
              <Descriptions.Item label="详细地址">{job.address || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 岗位描述 */}
          <Card title="岗位描述" className="mb-4">
            <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {job.description}
            </Paragraph>
          </Card>

          {/* 任职要求 */}
          {job.requirements && (
            <Card title="任职要求" className="mb-4">
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {job.requirements}
              </Paragraph>
            </Card>
          )}

          {/* 福利待遇 */}
          {job.benefits && (
            <Card title="福利待遇" className="mb-4">
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {job.benefits}
              </Paragraph>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* 技能要求 */}
          {job.skills.length > 0 && (
            <Card title="技能要求" className="mb-4">
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <Tag key={index} color="blue">{skill}</Tag>
                ))}
              </div>
            </Card>
          )}

          {/* 时间信息 */}
          <Card title="时间信息" className="mb-4">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="创建时间">
                {new Date(job.createdAt).toLocaleString('zh-CN')}
              </Descriptions.Item>
              {job.publishedAt && (
                <Descriptions.Item label="发布时间">
                  {new Date(job.publishedAt).toLocaleString('zh-CN')}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </DashboardLayout>
  )
}
