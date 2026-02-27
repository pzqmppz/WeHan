'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, Descriptions, Tag, Button, Space, Typography, Spin, Divider, Row, Col, Avatar, Timeline, Modal, message, Tabs
} from 'antd'
import {
  ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined,
  MailOutlined, PhoneOutlined, UserOutlined, FileTextOutlined
} from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text, Paragraph } = Typography
const { Item: TimelineItem } = Timeline

interface Application {
  id: string
  status: string
  matchScore: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    school?: { name: string }
    major?: string
    graduationYear?: number
  }
  job: {
    id: string
    title: string
    location: string | null
    salaryMin: number | null
    salaryMax: number | null
    enterprise: { name: string }
  }
  resume?: {
    id: string
    phone?: string
    email?: string
    education?: any[]
    experiences?: any[]
    projects?: any[]
    skills: string[]
  }
  interview?: {
    id: string
    totalScore: number | null
    dimensions?: any[]
    suggestions?: string
    status: string
    createdAt: string
  }
}

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

  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (applicationId) {
      fetchApplication()
    }
  }, [applicationId])

  const fetchApplication = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}`)
      const data = await res.json()

      if (data.success) {
        setApplication(data.data)
      } else {
        message.error('投递记录不存在')
        router.push('/enterprise/applications')
      }
    } catch (error) {
      console.error('Fetch application error:', error)
      message.error('加载失败')
      router.push('/enterprise/applications')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (data.success) {
        message.success('状态已更新')
        setApplication(data.data)
      } else {
        message.error(data.error || '更新失败')
      }
    } catch (error) {
      message.error('更新失败')
    }
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
        try {
          const res = await fetch(`/api/applications/${applicationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notes }),
          })
          const data = await res.json()

          if (data.success) {
            message.success('备注已保存')
            setApplication(data.data)
          } else {
            message.error(data.error || '保存失败')
          }
        } catch (error) {
          message.error('保存失败')
        }
      },
    })
  }

  // 格式化薪资
  const formatSalary = () => {
    if (!application?.job.salaryMin && !application?.job.salaryMax) return '面议'
    const min = application?.job.salaryMin ? `${(application.job.salaryMin / 1000).toFixed(0)}K` : ''
    const max = application?.job.salaryMax ? `${(application.job.salaryMax / 1000).toFixed(0)}K` : ''
    return min && max ? `${min}-${max}` : min || max
  }

  // 格式化匹配分数
  const formatMatchScore = (score: number | null) => {
    if (score === null) return '未评估'
    if (score >= 80) return <Tag color="success">{score}分 - 优秀</Tag>
    if (score >= 60) return <Tag color="warning">{score}分 - 良好</Tag>
    return <Tag color="error">{score}分 - 一般</Tag>
  }

  // 获取状态时间线
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
            <Title level={4} className="!mb-0">{application.user.name} 的投递</Title>
            <Space className="mt-1">
              <Tag color={statusConfig.color}>{statusConfig.label}</Tag>
              <Text type="secondary">
                {new Date(application.createdAt).toLocaleString('zh-CN')}
              </Text>
            </Space>
          </div>
        </div>

        <Space>
          {application.status === 'PENDING' && (
            <>
              <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => handleUpdateStatus('VIEWED')}>
                标记已查看
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleUpdateStatus('REJECTED')}>
                拒绝
              </Button>
            </>
          )}
          {application.status === 'VIEWED' && (
            <>
              <Button type="primary" icon={<CalendarOutlined />} onClick={() => handleUpdateStatus('INTERVIEWING')}>
                安排面试
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleUpdateStatus('REJECTED')}>
                拒绝
              </Button>
            </>
          )}
          {application.status === 'INTERVIEWING' && (
            <>
              <Button type="primary" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} icon={<CheckCircleOutlined />} onClick={() => handleUpdateStatus('OFFERED')}>
                发送录用
              </Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => handleUpdateStatus('REJECTED')}>
                拒绝
              </Button>
            </>
          )}
          <Button onClick={showNotesModal}>
            添加备注
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* 候选人信息 */}
          <Card title="候选人信息" className="mb-4">
            <div className="flex items-start gap-4">
              <Avatar size={64} icon={<UserOutlined />} className="bg-blue-500" />
              <div className="flex-1">
                <Title level={4} className="!mb-2">{application.user.name}</Title>
                <Space direction="vertical" size="small">
                  <Space>
                    <MailOutlined />
                    <Text>{application.user.email}</Text>
                  </Space>
                  {application.resume?.phone && (
                    <Space>
                      <PhoneOutlined />
                      <Text>{application.resume.phone}</Text>
                    </Space>
                  )}
                  {application.user.school && (
                    <Text type="secondary">
                      {application.user.school.name}
                      {application.user.major && ` · ${application.user.major}`}
                      {application.user.graduationYear && ` · ${application.user.graduationYear}届`}
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
            <Card title="简历详情" className="mb-4">
              <Tabs defaultActiveKey="education">
                <Tabs.TabPane tab="教育经历" key="education">
                  {application.resume.education && Array.isArray(application.resume.education) ? (
                    <div className="space-y-4">
                      {application.resume.education.map((edu: any, idx: number) => (
                        <div key={idx} className="border-b pb-3 last:border-b-0">
                          <Text strong>{edu.school}</Text>
                          <br />
                          <Text type="secondary">
                            {edu.major} · {edu.degree} · {edu.startDate} - {edu.endDate || '至今'}
                          </Text>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">暂无教育经历</Text>
                  )}
                </Tabs.TabPane>
                <Tabs.TabPane tab="工作经历" key="experiences">
                  {application.resume.experiences && Array.isArray(application.resume.experiences) ? (
                    <div className="space-y-4">
                      {application.resume.experiences.map((exp: any, idx: number) => (
                        <div key={idx} className="border-b pb-3 last:border-b-0">
                          <Text strong>{exp.company}</Text>
                          <Text type="secondary" className="ml-2">{exp.position}</Text>
                          <br />
                          <Text type="secondary" className="text-xs">
                            {exp.startDate} - {exp.endDate || '至今'}
                          </Text>
                          {exp.description && (
                            <Paragraph className="mt-2 mb-0 text-sm" type="secondary">
                              {exp.description}
                            </Paragraph>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">暂无工作经历</Text>
                  )}
                </Tabs.TabPane>
                <Tabs.TabPane tab="技能标签" key="skills">
                  <div className="flex flex-wrap gap-2">
                    {application.resume.skills?.length > 0 ? (
                      application.resume.skills.map((skill, idx) => (
                        <Tag key={idx} color="blue">{skill}</Tag>
                      ))
                    ) : (
                      <Text type="secondary">暂无技能标签</Text>
                    )}
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          )}

          {/* 面试报告 */}
          {application.interview && (
            <Card title="AI 面试报告" className="mb-4">
              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label="综合评分">
                  {formatMatchScore(application.interview.totalScore)}
                </Descriptions.Item>
                {application.interview.dimensions?.map((dim: any, idx: number) => (
                  <Descriptions.Item key={idx} label={dim.name}>
                    <Space>
                      <Text>{dim.score}/{dim.maxScore}</Text>
                      {dim.comment && <Text type="secondary">({dim.comment})</Text>}
                    </Space>
                  </Descriptions.Item>
                ))}
                {application.interview.suggestions && (
                  <Descriptions.Item label="改进建议">
                    <Paragraph className="mb-0">{application.interview.suggestions}</Paragraph>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* 投递岗位信息 */}
          <Card title="投递岗位" className="mb-4">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="岗位名称">
                <a onClick={() => router.push(`/enterprise/jobs/${application.job.id}`)}>
                  {application.job.title}
                </a>
              </Descriptions.Item>
              <Descriptions.Item label="所属企业">
                {application.job.enterprise.name}
              </Descriptions.Item>
              <Descriptions.Item label="工作地点">
                {application.job.location || '未填写'}
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
