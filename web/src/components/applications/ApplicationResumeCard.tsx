/**
 * 简历详情卡片组件
 */

'use client'

import React from 'react'
import { Card, Tabs, Typography, Tag } from 'antd'

const { Text, Paragraph } = Typography

interface ApplicationResumeCardProps {
  resume: {
    id: string
    phone?: string
    email?: string
    education?: any[]
    experiences?: any[]
    projects?: any[]
    skills: string[]
  }
}

export function ApplicationResumeCard({ resume }: ApplicationResumeCardProps) {
  return (
    <Card title="简历详情" className="mb-4">
      <Tabs defaultActiveKey="education">
        <Tabs.TabPane tab="教育经历" key="education">
          {resume.education && Array.isArray(resume.education) && resume.education.length > 0 ? (
            <div className="space-y-4">
              {resume.education.map((edu: any, idx: number) => (
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
          {resume.experiences && Array.isArray(resume.experiences) && resume.experiences.length > 0 ? (
            <div className="space-y-4">
              {resume.experiences.map((exp: any, idx: number) => (
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
            {resume.skills?.length > 0 ? (
              resume.skills.map((skill, idx) => (
                <Tag key={idx} color="blue">{skill}</Tag>
              ))
            ) : (
              <Text type="secondary">暂无技能标签</Text>
            )}
          </div>
        </Tabs.TabPane>
      </Tabs>
    </Card>
  )
}
