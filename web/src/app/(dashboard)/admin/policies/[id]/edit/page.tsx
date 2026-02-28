/**
 * 管理员端 - 政策编辑页
 */

'use client'

import React, { useEffect, useState } from 'react'
import { Card, Typography, Spin, App } from 'antd'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/layout/DashboardLayout'
import PolicyForm from '@/components/policies/PolicyForm'
import type { PolicyFormValues } from '@/components/policies/PolicyForm'

const { Title, Text } = Typography

interface PolicyDetail {
  id: string
  title: string
  type: string
  content: string
  summary: string | null
  conditions: string | null
  benefits: string | null
  effectiveDate: string | null
  expiryDate: string | null
}

export default function AdminEditPolicyPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { message } = App.useApp()
  const [policy, setPolicy] = useState<PolicyDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session && params.id) {
      fetchPolicy()
    }
  }, [session, params.id])

  const fetchPolicy = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/policies/${params.id}`)
      const data = await res.json()

      if (data.success) {
        setPolicy(data.data)
      } else {
        message.error('获取政策详情失败')
        router.push('/admin/policies')
      }
    } catch (error) {
      console.error('Fetch policy error:', error)
      message.error('获取政策详情失败')
      router.push('/admin/policies')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (values: PolicyFormValues) => {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/policies/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()

      if (data.success) {
        message.success('政策更新成功')
        router.push('/admin/policies')
      } else {
        message.error(data.error || '更新失败')
      }
    } catch (error) {
      console.error('Update policy error:', error)
      message.error('更新失败')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </DashboardLayout>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login?callbackUrl=/admin/policies')
    return null
  }

  if (!policy) {
    return null
  }

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <Title level={4} className="!mb-2">编辑政策</Title>
        <Text type="secondary">修改政策信息</Text>
      </div>

      <Card>
        <PolicyForm
          initialValues={{
            title: policy.title,
            type: policy.type as any,
            content: policy.content,
            summary: policy.summary || undefined,
            conditions: policy.conditions || undefined,
            benefits: policy.benefits || undefined,
            effectiveDate: policy.effectiveDate ? new Date(policy.effectiveDate) : undefined,
            expiryDate: policy.expiryDate ? new Date(policy.expiryDate) : undefined,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/admin/policies')}
          loading={submitting}
          isEdit
        />
      </Card>
    </DashboardLayout>
  )
}
