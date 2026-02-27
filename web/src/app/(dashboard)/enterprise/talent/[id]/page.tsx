'use client'

import React, { useState, useEffect } from 'react'
import {
  Card, Descriptions, Tag, Button, Space, Typography, Spin, Divider,
  Row, Col, Avatar, Timeline, Progress, Tabs, Empty, Statistic
} from 'antd'
import {
  ArrowLeftOutlined, UserOutlined, MailOutlined, PhoneOutlined,
  TrophyOutlined, BookOutlined, ProjectOutlined, SafetyOutlined,
  StarOutlined
} from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'

const { Title, Text, Paragraph } = Typography

interface Talent {
  id: string
  name: string
  email: string
  phone: string | null
  major: string | null
  graduationYear: number | null
  resume: {
    id: string
    education: any
    experiences: any
    projects: any
    skills: string[]
    certifications: any
    awards: any
    profile: any
  } | null
  applications: {
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
  }[]
}

const APPLICATION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待处理' },
  VIEWED: { color: 'default', label: '已查看' },
  INTERVIEWING: { color: 'warning', label: '面试中' },
  OFFERED: { color: 'success', label: '已录用' },
  REJECTED: { color: 'error', label: '已拒绝' },
  WITHDRAWN: { color: 'default', label: '已撤回' },
}

const INTERVIEW_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PREPARING: { color: 'default', label: '准备中' },
  IN_PROGRESS: { color: 'processing', label: '进行中' },
  COMPLETED: { color: 'success', label: '已完成' },
  EXPIRED: { color: 'error', label: '已过期' },
}

export default function TalentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const talentId = params?.id as string

  const [talent, setTalent] = useState<Talent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (talentId) {
      fetchTalent()
    }
  }, [talentId])

  const fetchTalent = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/talent/${talentId}`)
      const data = await res.json()

      if (data.success) {
        setTalent(data.data)
      } else {
        router.push('/enterprise/talent')
      }
    } catch (error) {
      console.error('Fetch talent error:', error)
      router.push('/enterprise/talent')
    } finally {
      setLoading(false)
    }
  }

  // 薪资格式化
  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return '面议'
    const minStr = min ? `${(min / 1000).toFixed(0)}K` : ''
    const maxStr = max ? `${(max / 1000).toFixed(0)}K` : ''
    return minStr && maxStr ? `${minStr}-${maxStr}` : minStr || maxStr
  }

  // 渲染教育经历
  const renderEducation = () => {
    const education = talent?.resume?.education
    if (!education || (Array.isArray(education) && education.length === 0)) {
      return <Empty description="暂无教育经历" />
    }

    const eduList = Array.isArray(education) ? education : [education]

    return (
      <div className="space-y-4">
        {eduList.map((edu: any, index: number) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex justify-between items-start">
              <div>
                <Text strong>{edu.school || edu.name}</Text>
                <div className="text-gray-500 text-sm">
                  {edu.major} · {edu.degree}
                </div>
              </div>
              <Text type="secondary" className="text-sm">
                {edu.startDate} - {edu.endDate || '至今'}
              </Text>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 渲染工作经历
  const renderExperiences = () => {
    const experiences = talent?.resume?.experiences
    if (!experiences || (Array.isArray(experiences) && experiences.length === 0)) {
      return <Empty description="暂无工作经历" />
    }

    const expList = Array.isArray(experiences) ? experiences : [experiences]

    return (
      <div className="space-y-4">
        {expList.map((exp: any, index: number) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
            <div className="flex justify-between items-start">
              <div>
                <Text strong>{exp.company}</Text>
                <div className="text-gray-500 text-sm">
                  {exp.position}
                </div>
              </div>
              <Text type="secondary" className="text-sm">
                {exp.startDate} - {exp.endDate || '至今'}
              </Text>
            </div>
            {exp.description && (
              <Paragraph className="mt-2 text-sm text-gray-600" style={{ marginBottom: 0 }}>
                {exp.description}
              </Paragraph>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 渲染项目经历
  const renderProjects = () => {
    const projects = talent?.resume?.projects
    if (!projects || (Array.isArray(projects) && projects.length === 0)) {
      return <Empty description="暂无项目经历" />
    }

    const projList = Array.isArray(projects) ? projects : [projects]

    return (
      <div className="space-y-4">
        {projList.map((proj: any, index: number) => (
          <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
            <Text strong>{proj.name}</Text>
            {proj.role && (
              <div className="text-gray-500 text-sm">
                角色：{proj.role}
              </div>
            )}
            {proj.description && (
              <Paragraph className="mt-2 text-sm text-gray-600" style={{ marginBottom: 0 }}>
                {proj.description}
              </Paragraph>
            )}
            {proj.technologies && (
              <div className="mt-2 flex flex-wrap gap-1">
                {proj.technologies.map((tech: string, i: number) => (
                  <Tag key={i} className="text-xs">{tech}</Tag>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  // 渲染面试报告
  const renderInterviewReport = (interview: NonNullable<Talent['applications'][0]['interview']>) => {
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

  if (loading) {
    return (
      <DashboardLayout role="enterprise">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (!talent) {
    return (
      <DashboardLayout role="enterprise">
        <div className="text-center py-12">
          <Text type="secondary">人才不存在</Text>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="enterprise">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => router.push('/enterprise/talent')}>
            返回
          </Button>
          <div className="flex items-center gap-3">
            <Avatar size={48} icon={<UserOutlined />} className="bg-blue-500" />
            <div>
              <Title level={4} className="!mb-0">{talent.name}</Title>
              <Space className="mt-1">
                <Text type="secondary">{talent.major || '未知专业'}</Text>
                {talent.graduationYear && (
                  <Text type="secondary">{talent.graduationYear}届</Text>
                )}
              </Space>
            </div>
          </div>
        </div>
      </div>

      <Row gutter={24}>
        <Col xs={24} lg={16}>
          {/* 基本信息 */}
          <Card title="基本信息" className="mb-4">
            <Descriptions column={2} size="small">
              <Descriptions.Item label="姓名">{talent.name}</Descriptions.Item>
              <Descriptions.Item label="专业">{talent.major || '-'}</Descriptions.Item>
              <Descriptions.Item label="毕业年份">
                {talent.graduationYear ? `${talent.graduationYear}年` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="邮箱">{talent.email}</Descriptions.Item>
              <Descriptions.Item label="电话">{talent.phone || '-'}</Descriptions.Item>
            </Descriptions>
          </Card>

          {/* 简历详情 */}
          <Card title="简历详情" className="mb-4">
            <Tabs
              items={[
                {
                  key: 'education',
                  label: (
                    <span>
                      <BookOutlined className="mr-1" />
                      教育经历
                    </span>
                  ),
                  children: renderEducation(),
                },
                {
                  key: 'experience',
                  label: (
                    <span>
                      <UserOutlined className="mr-1" />
                      工作经历
                    </span>
                  ),
                  children: renderExperiences(),
                },
                {
                  key: 'projects',
                  label: (
                    <span>
                      <ProjectOutlined className="mr-1" />
                      项目经历
                    </span>
                  ),
                  children: renderProjects(),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* 技能标签 */}
          {talent.resume?.skills && talent.resume.skills.length > 0 && (
            <Card title="技能标签" className="mb-4">
              <div className="flex flex-wrap gap-2">
                {talent.resume.skills.map((skill, index) => (
                  <Tag key={index} color="blue">{skill}</Tag>
                ))}
              </div>
            </Card>
          )}

          {/* 投递记录 */}
          <Card title="投递记录" className="mb-4">
            <Timeline
              items={talent.applications.map(app => ({
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
        </Col>
      </Row>

      {/* 面试报告 */}
      {talent.applications.some(app => app.interview) && (
        <Card title="面试报告" className="mt-4">
          <Tabs
            items={talent.applications
              .filter(app => app.interview)
              .map((app, index) => ({
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
                children: renderInterviewReport(app.interview!),
              }))}
          />
        </Card>
      )}
    </DashboardLayout>
  )
}
