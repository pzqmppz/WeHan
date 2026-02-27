'use client'

import React, { useState } from 'react'
import { Typography, message, Result, Button } from 'antd'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import JobForm, { JobFormValues } from '@/components/jobs/JobForm'

const { Title, Text } = Typography

export default function CreateJobPage() {
  const sessionData = useSession()
  const { data: session } = sessionData || { data: null }
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // 获取企业ID
  const enterpriseId = (session?.user as any)?.enterpriseId

  const handleSubmit = async (values: JobFormValues) => {
    if (!enterpriseId) {
      message.error('请先完善企业信息')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          enterpriseId,
        }),
      })

      const data = await res.json()

      if (data.success) {
        message.success('岗位创建成功')
        router.push('/enterprise/jobs')
      } else {
        message.error(data.error || '创建失败')
      }
    } catch (error) {
      console.error('Create job error:', error)
      message.error('创建岗位失败')
    } finally {
      setLoading(false)
    }
  }

  // 未关联企业
  if (session && !enterpriseId) {
    return (
      <DashboardLayout role="enterprise">
        <Result
          status="warning"
          title="请先完善企业信息"
          subTitle="您还没有关联企业，请先完善企业资料后再发布岗位"
          extra={
            <Button type="primary" onClick={() => router.push('/enterprise/profile')}>
              完善企业信息
            </Button>
          }
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="enterprise">
      <div className="mb-6">
        <Title level={4} className="!mb-2">发布岗位</Title>
        <Text type="secondary">填写岗位信息，发布后将对求职者可见</Text>
      </div>

      <JobForm onSubmit={handleSubmit} loading={loading} />
    </DashboardLayout>
  )
}
