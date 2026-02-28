/**
 * 投递管理 Hook
 * 封装投递列表数据获取和操作逻辑
 */

import { useState, useEffect, useCallback } from 'react'
import type { MessageInstance } from 'antd/es/message/interface'

export interface Application {
  id: string
  status: string
  matchScore: number | null
  notes: string | null
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    school?: { name: string }
    major?: string
  }
  job: {
    id: string
    title: string
    location: string | null
  }
  resume?: {
    id: string
    education?: any
    skills: string[]
  }
  interview?: {
    id: string
    totalScore: number | null
    status: string
  }
}

interface ApplicationListResponse {
  success: boolean
  data: Application[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const APPLICATION_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'processing', label: '待处理' },
  VIEWED: { color: 'default', label: '已查看' },
  INTERVIEWING: { color: 'warning', label: '面试中' },
  OFFERED: { color: 'success', label: '已录用' },
  REJECTED: { color: 'error', label: '已拒绝' },
  WITHDRAWN: { color: 'default', label: '已撤回' },
}

export const STATUS_FLOW = ['PENDING', 'VIEWED', 'INTERVIEWING', 'OFFERED', 'REJECTED']

export function useApplications(enterpriseId: string | undefined, messageApi?: MessageInstance) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statistics, setStatistics] = useState({ pending: 0, today: 0 })

  const fetchApplications = useCallback(async (page = 1, pageSize = 10, filters: Record<string, string> = {}) => {
    if (!enterpriseId) return

    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        enterpriseId,
        ...filters,
      })

      const res = await fetch(`/api/applications?${params}`)
      const data: ApplicationListResponse = await res.json()

      if (data.success) {
        setApplications(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.meta?.page || page,
          total: data.meta?.total || 0,
        }))
      } else {
        messageApi?.error('获取投递列表失败')
      }
    } catch (error) {
      console.error('Fetch applications error:', error)
      messageApi?.error('获取投递列表失败')
    } finally {
      setLoading(false)
    }
  }, [enterpriseId, messageApi])

  const fetchStatistics = useCallback(async () => {
    if (!enterpriseId) return

    try {
      const res = await fetch(`/api/applications/statistics?enterpriseId=${enterpriseId}`)
      const data = await res.json()

      if (data.success) {
        setStatistics({
          pending: data.data.pendingApplications || 0,
          today: data.data.todayApplications || 0,
        })
      }
    } catch (error) {
      console.error('Fetch statistics error:', error)
    }
  }, [enterpriseId])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi?.success('状态已更新')
        fetchApplications(pagination.current, pagination.pageSize)
        fetchStatistics()
        return true
      } else {
        messageApi?.error(data.error || '更新失败')
        return false
      }
    } catch (error) {
      messageApi?.error('更新失败')
      return false
    }
  }

  const batchAction = async (ids: string[], action: string) => {
    try {
      const res = await fetch('/api/applications/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, action }),
      })
      const data = await res.json()

      if (data.success) {
        messageApi?.success(`已处理 ${data.data.updated} 条记录`)
        fetchApplications(pagination.current, pagination.pageSize)
        fetchStatistics()
        return true
      } else {
        messageApi?.error(data.error || '操作失败')
        return false
      }
    } catch (error) {
      messageApi?.error('操作失败')
      return false
    }
  }

  useEffect(() => {
    if (enterpriseId) {
      fetchApplications()
      fetchStatistics()
    }
  }, [enterpriseId, fetchApplications, fetchStatistics])

  return {
    applications,
    loading,
    pagination,
    statistics,
    fetchApplications,
    fetchStatistics,
    updateStatus,
    batchAction,
  }
}
