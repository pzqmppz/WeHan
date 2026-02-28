/**
 * 投递详情 Hook
 * 封装投递详情数据获取和操作逻辑
 */

import { useState, useEffect, useCallback } from 'react'
import type { MessageInstance } from 'antd/es/message/interface'
import { useRouter } from 'next/navigation'

export interface ApplicationDetail {
  id: string
  status: string
  matchScore: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  User: {
    id: string
    name: string
    email: string
    phone?: string
    school?: { name: string }
    major?: string
    graduationYear?: number
  }
  Job: {
    id: string
    title: string
    location: string | null
    salaryMin: number | null
    salaryMax: number | null
    Enterprise: { name: string }
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
  Interview?: {
    id: string
    totalScore: number | null
    dimensions?: any[]
    suggestions?: string
    status: string
    createdAt: string
  }
}

export function useApplicationDetail(applicationId: string | undefined, messageApi?: MessageInstance) {
  const router = useRouter()
  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchApplication = useCallback(async () => {
    if (!applicationId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}`)
      const data = await res.json()

      if (data.success) {
        setApplication(data.data)
      } else {
        messageApi?.error('投递记录不存在')
        router.push('/enterprise/applications')
      }
    } catch (error) {
      console.error('Fetch application error:', error)
      messageApi?.error('加载失败')
      router.push('/enterprise/applications')
    } finally {
      setLoading(false)
    }
  }, [applicationId, router, messageApi])

  const updateStatus = useCallback(async (newStatus: string) => {
    if (!applicationId) return false

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi?.success('状态已更新')
        setApplication(data.data)
        return true
      } else {
        messageApi?.error(data.error || '更新失败')
        return false
      }
    } catch (error) {
      messageApi?.error('更新失败')
      return false
    }
  }, [applicationId, messageApi])

  const updateNotes = useCallback(async (notes: string) => {
    if (!applicationId) return false

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi?.success('备注已保存')
        setApplication(data.data)
        return true
      } else {
        messageApi?.error(data.error || '保存失败')
        return false
      }
    } catch (error) {
      messageApi?.error('保存失败')
      return false
    }
  }, [applicationId, messageApi])

  useEffect(() => {
    fetchApplication()
  }, [fetchApplication])

  return {
    application,
    loading,
    refetch: fetchApplication,
    updateStatus,
    updateNotes,
  }
}
