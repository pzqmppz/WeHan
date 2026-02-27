'use client'

import React, { useState, useEffect } from 'react'
import { Typography, message, Spin, Result, Button } from 'antd'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '@/components/layout/DashboardLayout'
import JobForm, { JobFormValues } from '@/components/jobs/JobForm'

const { Title, Text } = Typography

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
}

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
        message.error('岗位不存在')
        router.push('/enterprise/jobs')
      }
    } catch (error) {
      console.error('Fetch job error:', error)
      message.error('加载失败')
      router.push('/enterprise/jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: JobFormValues) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await res.json()

      if (data.success) {
        message.success('保存成功')
        router.push(`/enterprise/jobs/${jobId}`)
      } else {
        message.error(data.error || '保存失败')
      }
    } catch (error) {
      console.error('Update job error:', error)
      message.error('保存失败')
    } finally {
      setSubmitting(false)
    }
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
        <Result
          status="404"
          title="岗位不存在"
          extra={
            <Button type="primary" onClick={() => router.push('/enterprise/jobs')}>
              返回列表
            </Button>
          }
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="enterprise">
      <div className="mb-6">
        <Title level={4} className="!mb-2">编辑岗位</Title>
        <Text type="secondary">修改岗位信息</Text>
      </div>

      <JobForm
        initialValues={{
          ...job,
          industry: job.industry ?? undefined,
          category: job.category ?? undefined,
          salaryMin: job.salaryMin ?? undefined,
          salaryMax: job.salaryMax ?? undefined,
          location: job.location ?? undefined,
          address: job.address ?? undefined,
          requirements: job.requirements ?? undefined,
          benefits: job.benefits ?? undefined,
          educationLevel: job.educationLevel ?? undefined,
          experienceYears: job.experienceYears ?? undefined,
        }}
        onSubmit={handleSubmit}
        loading={submitting}
        isEdit
      />
    </DashboardLayout>
  )
}
