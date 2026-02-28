'use client'

import React from 'react'
import {
  Card, Descriptions, Tag, Button, Typography, Spin, Row, Col, Avatar
} from 'antd'
import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import { useTalentDetail } from '@/hooks/useTalentDetail'
import { TalentProfile, TalentApplications } from '@/components/talent'

const { Title, Text } = Typography

export default function TalentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const talentId = params?.id as string

  const { talent, loading } = useTalentDetail(talentId)

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
              <div className="flex gap-2 mt-1">
                <Text type="secondary">{talent.major || '未知专业'}</Text>
                {talent.graduationYear && (
                  <Text type="secondary">{talent.graduationYear}届</Text>
                )}
              </div>
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
          <TalentProfile resume={talent.resume} />
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

          {/* 投递记录和面试报告 */}
          <TalentApplications applications={talent.applications} />
        </Col>
      </Row>
    </DashboardLayout>
  )
}
