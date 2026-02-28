/**
 * 公开政策列表 Hook
 * 获取公开政策数据
 */

import { useState, useEffect, useCallback } from 'react'

export interface Policy {
  id: string
  title: string
  type: string
  summary?: string
  content: string
  conditions?: string
  benefits?: string
  isActive: boolean
  effectiveDate?: string
  expiryDate?: string
  createdAt: string
  updatedAt: string
}

interface UsePoliciesOptions {
  page?: number
  pageSize?: number
  type?: string
  enabled?: boolean
}

interface UsePoliciesResult {
  policies: Policy[]
  loading: boolean
  error: Error | null
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
  refetch: () => void
}

export function usePolicies(options: UsePoliciesOptions = {}): UsePoliciesResult {
  const { page = 1, pageSize = 10, type, enabled = true } = options
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchPolicies = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (type) {
        params.append('type', type)
      }

      const response = await fetch(`/api/policies?${params}`)
      const result = await response.json()

      if (result.success) {
        setPolicies(result.data)
        setPagination(result.pagination)
      } else {
        setError(new Error(result.error || '获取政策列表失败'))
      }
    } catch (err) {
      console.error('Fetch policies error:', err)
      setError(err instanceof Error ? err : new Error('获取政策列表失败'))
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, type, enabled])

  useEffect(() => {
    fetchPolicies()
  }, [fetchPolicies])

  return {
    policies,
    loading,
    error,
    pagination,
    refetch: fetchPolicies,
  }
}

// 单个政策详情 Hook
interface UsePolicyDetailResult {
  policy: Policy | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function usePolicyDetail(id: string | null, enabled = true): UsePolicyDetailResult {
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchPolicy = useCallback(async () => {
    if (!id || !enabled) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/policies/${id}`)
      const result = await response.json()

      if (result.success) {
        setPolicy(result.data)
      } else {
        setError(new Error(result.error || '获取政策详情失败'))
      }
    } catch (err) {
      console.error('Fetch policy detail error:', err)
      setError(err instanceof Error ? err : new Error('获取政策详情失败'))
    } finally {
      setLoading(false)
    }
  }, [id, enabled])

  useEffect(() => {
    fetchPolicy()
  }, [fetchPolicy])

  return {
    policy,
    loading,
    error,
    refetch: fetchPolicy,
  }
}
