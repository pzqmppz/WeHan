/**
 * 人才简历组件
 * 显示教育、工作、项目经历
 */

'use client'

import React from 'react'
import { Card, Tabs, Typography, Tag, Empty } from 'antd'
import { BookOutlined, UserOutlined, ProjectOutlined } from '@ant-design/icons'

const { Text, Paragraph } = Typography

interface TalentProfileProps {
  resume: {
    education: any
    experiences: any
    projects: any
    skills: string[]
  } | null
}

export function TalentProfile({ resume }: TalentProfileProps) {
  const renderEducation = () => {
    const education = resume?.education
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

  const renderExperiences = () => {
    const experiences = resume?.experiences
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

  const renderProjects = () => {
    const projects = resume?.projects
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

  return (
    <Card title="简历详情">
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
  )
}
