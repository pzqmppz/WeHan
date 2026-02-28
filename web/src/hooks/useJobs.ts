/**
 * 岗位管理 Hook
 * 封装岗位列表数据获取和操作逻辑
 */

import { useState, useEffect, useCallback } from 'react'
import type { MessageInstance } from 'antd/es/message/interface'

export interface Job {
  id: string
  title: string
  industry: string | null
  location: string | null
  salaryMin: number | null
  salaryMax: number | null
  status: string
  headcount: number
  applicationsCount: number
  createdAt: string
  publishedAt: string | null
}

interface JobListResponse {
  success: boolean
  data: Job[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const JOB_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  DRAFT: { color: 'default', label: '草稿' },
  PUBLISHED: { color: 'success', label: '已发布' },
  CLOSED: { color: 'warning', label: '已关闭' },
  ARCHIVED: { color: 'default', label: '已归档' },
}

export function useJobs(enterpriseId: string | undefined, messageApi?: MessageInstance) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })

  const fetchJobs = useCallback(async (page = 1, pageSize = 10, filters: Record<string, string> = {}) => {
    if (!enterpriseId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        enterpriseId,
        ...filters,
      })

      const res = await fetch(`/api/jobs?${params}`)
      const data: JobListResponse = await res.json()

      if (data.success) {
        setJobs(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.meta?.page || page,
          total: data.meta?.total || 0,
        }))
      } else {
        messageApi?.error('获取岗位列表失败')
      }
    } catch (error) {
      console.error('Fetch jobs error:', error)
      messageApi?.error('获取岗位列表失败')
    } finally {
      setLoading(false)
    }
  }, [enterpriseId, messageApi])

  const publishJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi?.success('岗位已发布')
        fetchJobs(pagination.current, pagination.pageSize)
        return true
      } else {
        messageApi?.error(data.error || '发布失败')
        return false
      }
    } catch (error) {
      messageApi?.error('发布失败')
      return false
    }
  }

  const closeJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi?.success('岗位已下架')
        fetchJobs(pagination.current, pagination.pageSize)
        return true
      } else {
        messageApi?.error(data.error || '下架失败')
        return false
      }
    } catch (error) {
      messageApi?.error('下架失败')
      return false
    }
  }

  const deleteJob = async (id: string) => {
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (data.success) {
        messageApi?.success('岗位已删除')
        fetchJobs(pagination.current, pagination.pageSize)
        return true
      } else {
        messageApi?.error(data.error || '删除失败')
        return false
      }
    } catch (error) {
      messageApi?.error('删除失败')
      return false
    }
  }

  useEffect(() => {
    if (enterpriseId) {
      fetchJobs()
    }
  }, [enterpriseId, fetchJobs])

  return {
    jobs,
    loading,
    pagination,
    fetchJobs,
    publishJob,
    closeJob,
    deleteJob,
  }
}
