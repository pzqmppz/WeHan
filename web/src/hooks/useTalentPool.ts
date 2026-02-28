/**
 * 人才库 Hook
 * 封装人才列表数据获取和统计逻辑
 */

import { useState, useEffect, useCallback } from 'react'
import type { MessageInstance } from 'antd/es/message/interface'

export interface TalentPoolItem {
  id: string
  name: string
  email: string
  phone: string | null
  major: string | null
  graduationYear: number | null
  resume: {
    id: string
    education: any
    experiences: any
    projects: any
    skills: string[]
    certifications: any
    awards: any
    profile: any
  } | null
  applications: {
    id: string
    status: string
    matchScore: number | null
    createdAt: string
    job: {
      id: string
      title: string
    }
    interview: {
      id: string
      totalScore: number | null
      status: string
    } | null
  }[]
}

interface TalentStatistics {
  totalTalents: number
  newThisWeek: number
  interviewed: number
  offered: number
}

interface TalentPoolResponse {
  success: boolean
  data: TalentPoolItem[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function useTalentPool(messageApi?: MessageInstance) {
  const [talents, setTalents] = useState<TalentPoolItem[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [statistics, setStatistics] = useState<TalentStatistics | null>(null)

  const fetchStatistics = useCallback(async () => {
    try {
      const res = await fetch('/api/talent/statistics')
      const data = await res.json()

      if (data.success) {
        setStatistics(data.data)
      }
    } catch (error) {
      console.error('Fetch statistics error:', error)
    }
  }, [])

  const fetchTalents = useCallback(async (page = 1, pageSize = 10, filters: Record<string, string> = {}) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...filters,
      })

      const res = await fetch(`/api/talent?${params}`)
      const data: TalentPoolResponse = await res.json()

      if (data.success) {
        setTalents(data.data)
        setPagination(prev => ({
          ...prev,
          current: data.meta?.page || page,
          total: data.meta?.total || 0,
        }))
      } else {
        messageApi?.error('获取人才列表失败')
      }
    } catch (error) {
      console.error('Fetch talents error:', error)
      messageApi?.error('获取人才列表失败')
    } finally {
      setLoading(false)
    }
  }, [messageApi])

  useEffect(() => {
    fetchStatistics()
    fetchTalents()
  }, [fetchTalents, fetchStatistics])

  return {
    talents,
    loading,
    pagination,
    statistics,
    fetchTalents,
    fetchStatistics,
  }
}
