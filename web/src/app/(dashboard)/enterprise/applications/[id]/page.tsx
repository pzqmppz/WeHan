'use client'

import React from 'react'
import {
  Card, Descriptions, Tag, Button, Space, Typography, Spin, Row, Col, Avatar, Timeline, Modal
} from 'antd'
import {
  ArrowLeftOutlined, MailOutlined, PhoneOutlined, UserOutlined
} from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useApplicationDetail } from '@/hooks/useApplicationDetail'
import {
  ApplicationStatusActions,
  ApplicationResumeCard,
  ApplicationInterviewCard,
} from '@/components/applications'

const { Title, Text, Paragraph } = Typography
const { Item: TimelineItem } = Timeline

const APPLICATION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待处理' },
  VIEWED: { color: 'warning', label: '已查看' },
  INTERVIEWING: { color: 'processing', label: '面试中' },
  OFFERED: { color: 'success', label: '已录用' },
  REJECTED: { color: 'error', label: '已拒绝' },
  WITHDRAWN: { color: 'default', label: '已撤回' },
}

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const applicationId = params?.id as string

  const { application, loading, updateStatus, updateNotes } = useApplicationDetail(applicationId)

  const formatSalary = () => {
    if (!application?.Job.salaryMin && !application?.Job.salaryMax) return '面议'
    const min = application?.Job.salaryMin ? `${(application.Job.salaryMin / 1000).toFixed(0)}K` : ''
    const max = application?.Job.salaryMax ? `${(application.Job.salaryMax / 1000).toFixed(0)}K` : ''
    return min && max ? `${min}-${max}` : min || max
  }

  const formatMatchScore = (score: number | null) => {
    if (score === null) return '未评估'
    if (score >= 80) return <Tag color="success">{score}分 - 优秀</Tag>
    if (score >= 60) return <Tag color="warning">{score}分 - 良好</Tag>
    return <Tag color="error">{score}分 - 一般</Tag>
  }

  const showNotesModal = () => {
    Modal.confirm({
      title: '添加备注',
      content: (
        <textarea
          id="notes-input"
          className="w-full p-2 border rounded"
          rows={4}
          placeholder="输入备注信息..."
          defaultValue={application?.notes || ''}
        />
      ),
      onOk: async () => {
        const notes = (document.getElementById('notes-input') as HTMLTextAreaElement)?.value
        await updateNotes(notes)
      },
    })
  }

  const getStatusTimeline = () => {
    const items = [
      { status: 'PENDING', label: '投递', time: application?.createdAt },
      { status: 'VIEWED', label: '查看', time: null },
      { status: 'INTERVIEWING', label: '面试', time: null },
      { status: 'OFFERED', label: '录用', time: null },
    ]

    const currentIndex = items.findIndex(item => item.status === application?.status)

    return items.map((item, index) => (
      <TimelineItem
        key={item.status}
        color={index <= currentIndex ? 'green' : 'gray'}
      >
        <div>
          <Text strong={index <= currentIndex}>{item.label}</Text>
        </div>
      </TimelineItem>
    ))
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

  if (!application) {
    return (
      <DashboardLayout role="enterprise">
        <div className="text-center py-12">
          <Text type="secondary">投递记录不存在</Text>
        </div>
      </DashboardLayout>
    )
  }

  const statusConfig = APPLICATION_STATUS_CONFIG[application.status] || APPLICATION_STATUS_CONFIG.PENDING

  return (
    <DashboardLayout role="enterprise">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/enterprise/applications')}>
            返回
          </Button>
          <div>
            <Title level={4} className="!mb-0">{application.User.name} 的投递</Title>
            <Space className="mt-1">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
              <Text type="secondary">
                {new Date(application.createdAt).toLocaleString('zh-CN')}
              </Text>
            </Space>
          </div>
        </div>

        <ApplicationStatusActions
          status={application.status}
          onUpdateStatus={updateStatus}
          onAddNotes={showNotesModal}
        />
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* 候选人信息 */}
          <Card title="候选人信息" className="mb-4">
            <div className="flex items-start gap-4">
              <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
              <div className="flex-1">
                <Title level={4} className="!mb-2">{application.User.name}</Title>
                <Space direction="vertical" size="small">
                  <Space>
                    <MailOutlined />
                    <Text>{application.User.email}</Text>
                  </Space>
                  {application.resume?.phone && (
                    <Space>
                      <PhoneOutlined />
                      <Text>{application.resume.phone}</Text>
                    </Space>
                  )}
                  {application.User.school && (
                    <Text type="secondary">
                      {application.User.school.name}
                      {application.User.major && ` · ${application.User.major}`}
                      {application.User.graduationYear && ` · ${application.User.graduationYear}届`}
                    </Text>
                  )}
                </Space>
              </div>
              <div className="text-right">
                <div className="mb-2">
                  <Text type="secondary">匹配评分</Text>
                </div>
                {formatMatchScore(application.matchScore)}
              </div>
            </div>
          </Card>

          {/* 简历详情 */}
          {application.resume && (
            <ApplicationResumeCard resume={application.resume} />
          )}

          {/* 面试报告 */}
          {application.Interview && (
            <ApplicationInterviewCard interview={application.Interview} />
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* 投递岗位信息 */}
          <Card title="投递岗位" className="mb-4">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="岗位名称">
                <a onClick={() => router.push(`/enterprise/jobs/${application.Job.id}`)}>
                  {application.Job.title}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="所属企业">
                {application.Job.Enterprise.name}
              </Descriptions.Item>
              <Descriptions.Item label="工作地点">
                {application.Job.location || '未填写'}
              </Descriptions.Item>
              <Descriptions.Item label="薪资范围">
                {formatSalary()}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 状态流转 */}
          <Card title="状态流转" className="mb-4">
            <Timeline>
              {getStatusTimeline()}
            </Timeline>
          </Card>

          {/* 备注信息 */}
          {application.notes && (
            <Card title="备注" className="mb-4">
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {application.notes}
              </Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </DashboardLayout>
  )
}
