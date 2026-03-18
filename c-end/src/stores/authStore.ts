/**
 * C 端认证状态管理
 * 使用 Zustand + persist 持久化
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CUser } from '@/types/auth'

interface AuthState {
  // 状态
  user: CUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setUser: (user: CUser | null) => void
  setToken: (token: string | null) => void
  login: (user: CUser, token: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (updates: Partial<CUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // 设置用户
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),

      // 设置 Token
      setToken: (token) => set({ token }),

      // 登录
      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        }),

      // 登出
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      // 设置加载状态
      setLoading: (isLoading) => set({ isLoading }),

      // 更新用户信息
      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'wehan_c_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// ==================== 选择器 ====================

/** 获取当前用户 */
export const selectUser = (state: AuthState) => state.user

/** 获取 Token */
export const selectToken = (state: AuthState) => state.token

/** 是否已认证 */
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated

/** 是否加载中 */
export const selectIsLoading = (state: AuthState) => state.isLoading

/** 获取用户显示名称 */
export const selectUserDisplayName = (state: AuthState) =>
  state.user?.name || state.user?.email?.split('@')[0] || '用户'
