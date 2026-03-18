/**
 * C 端认证 Hook
 * 封装登录、注册、登出等认证操作
 */

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, selectUser, selectIsAuthenticated, selectIsLoading } from '@/stores/authStore'
import { getVisitorId } from '@/lib/userIdentity'
import type { CUser, LoginRequest, RegisterRequest, AuthResponse } from '@/types/auth'

interface UseAuthReturn {
  // 状态
  user: CUser | null
  isAuthenticated: boolean
  isLoading: boolean

  // 方法
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const store = useAuthStore()

  // 选择器
  const user = useAuthStore(selectUser)
  const isAuthenticated = useAuthStore(selectIsAuthenticated)
  const isLoading = useAuthStore(selectIsLoading)

  /**
   * 登录
   */
  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      store.setLoading(true)

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            visitorId: getVisitorId(),
          } as LoginRequest),
        })

        const data: AuthResponse = await response.json()

        if (data.success && data.data) {
          store.login(data.data.user, data.data.token)
          return { success: true }
        }

        return { success: false, error: data.error || '登录失败' }
      } catch (error) {
        console.error('Login error:', error)
        return { success: false, error: '网络错误，请稍后重试' }
      } finally {
        store.setLoading(false)
      }
    },
    [store]
  )

  /**
   * 注册
   */
  const register = useCallback(
    async (userData: RegisterRequest): Promise<{ success: boolean; error?: string }> => {
      store.setLoading(true)

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...userData,
            visitorId: getVisitorId(),
          }),
        })

        const data: AuthResponse = await response.json()

        if (data.success && data.data) {
          store.login(data.data.user, data.data.token)
          return { success: true }
        }

        return { success: false, error: data.error || '注册失败' }
      } catch (error) {
        console.error('Register error:', error)
        return { success: false, error: '网络错误，请稍后重试' }
      } finally {
        store.setLoading(false)
      }
    },
    [store]
  )

  /**
   * 登出
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      store.logout()
      router.push('/')
    }
  }, [store, router])

  /**
   * 检查认证状态（从服务端验证 token）
   */
  const checkAuth = useCallback(async (): Promise<void> => {
    const token = store.token
    if (!token) {
      store.logout()
      return
    }

    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (data.success && data.data?.user) {
        store.setUser(data.data.user)
      } else {
        // Token 无效，清除状态
        store.logout()
      }
    } catch (error) {
      console.error('Check auth error:', error)
      // 网络错误时不清除状态，保持现有登录状态
    }
  }, [store])

  // 初始化时检查认证状态
  useEffect(() => {
    if (store.token && !store.user) {
      checkAuth()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 仅在组件挂载时执行一次

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  }
}

export default useAuth
