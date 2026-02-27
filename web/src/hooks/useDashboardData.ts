/**
 * Dashboard 数据 Hook
 * 获取仪表盘数据，开发阶段使用 Mock，生产环境调用真实 API
 */

import { useState, useEffect } from 'react'
import {
  mockEnterpriseDashboard,
  mockGovernmentDashboard,
  mockSchoolDashboard,
  mockAdminDashboard,
  mockApiResponse,
} from '@/lib/mocks/dashboard.mock'

type DashboardRole = 'enterprise' | 'government' | 'school' | 'admin'

interface UseDashboardDataOptions {
  role: DashboardRole
  enabled?: boolean
}

interface DashboardData {
  enterprise: typeof mockEnterpriseDashboard
  government: typeof mockGovernmentDashboard
  school: typeof mockSchoolDashboard
  admin: typeof mockAdminDashboard
}

export function useDashboardData<T extends DashboardRole>(
  options: UseDashboardDataOptions
) {
  const { role, enabled = true } = options
  const [data, setData] = useState<DashboardData[T] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // 开发阶段使用 Mock 数据
        // 生产环境调用真实 API
        const useMock = false // 已切换到真实 API

        if (useMock) {
          let result: DashboardData[T]

          switch (role) {
            case 'enterprise':
              result = mockEnterpriseDashboard as DashboardData[T]
              break
            case 'government':
              result = mockGovernmentDashboard as DashboardData[T]
              break
            case 'school':
              result = mockSchoolDashboard as DashboardData[T]
              break
            case 'admin':
              result = mockAdminDashboard as DashboardData[T]
              break
            default:
              throw new Error(`Unknown role: ${role}`)
          }

          await mockApiResponse(result, 300)
          setData(result)
        } else {
          // 生产环境调用真实 API
          const response = await fetch(`/api/dashboard/${role}`)
          const json = await response.json()

          if (!response.ok || !json.success) {
            throw new Error(json.error || 'Failed to fetch dashboard data')
          }
          setData(json.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [role, enabled])

  return { data, loading, error, refetch: () => setLoading(true) }
}

// ==================== 专用 Hooks ====================

/**
 * 企业端仪表盘数据
 */
export function useEnterpriseDashboard() {
  const result = useDashboardData({ role: 'enterprise' })
  return {
    ...result,
    data: result.data as typeof mockEnterpriseDashboard | null,
  }
}

/**
 * 政府端仪表盘数据
 */
export function useGovernmentDashboard() {
  return useDashboardData({ role: 'government' })
}

/**
 * 学校端仪表盘数据
 */
export function useSchoolDashboard() {
  return useDashboardData({ role: 'school' })
}

/**
 * 管理员仪表盘数据
 */
export function useAdminDashboard() {
  return useDashboardData({ role: 'admin' })
}
