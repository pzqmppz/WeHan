'use client'

import React, { useState } from 'react'
import { Card, Typography, Spin, App } from 'antd'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PolicyForm from '@/components/policies/PolicyForm'
import type { PolicyFormValues } from '@/components/policies/PolicyForm'

const { Title, Text } = Typography

export default function CreatePolicyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { message } = App.useApp()

  const handleSubmit = async (values: PolicyFormValues) => {
    setLoading(true)
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (data.success) {
        message.success('政策创建成功')
        router.push('/government/policies')
      } else {
        message.error(data.error || '创建失败')
      }
    } catch (error) {
      console.error('Create policy error:', error)
      message.error('创建失败')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <DashboardLayout role="government">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/government/policies/create')
    return null
  }

  return (
    <DashboardLayout role="government">
      <div className="mb-6">
        <Title level={4} className="!mb-2">发布政策</Title>
        <Text type="secondary">创建新的政策信息</Text>
      </div>

      <Card>
        <PolicyForm
          onSubmit={handleSubmit}
          onCancel={() => router.push('/government/policies')}
          loading={loading}
          isEdit={false}
        />
      </Card>
    </DashboardLayout>
  )
}
