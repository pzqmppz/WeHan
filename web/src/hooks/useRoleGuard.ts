/**
 * 角色守卫 Hook
 * 验证当前用户角色是否与页面要求的角色匹配
 * 如果不匹配，重定向到正确的页面
 */

'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { UserRole } from '@/components/layout/menuConfig'

// 角色到默认路径的映射
const roleToPath: Record<string, string> = {
  ENTERPRISE: '/enterprise',
  GOVERNMENT: '/government',
  SCHOOL: '/school',
  ADMIN: '/admin',
  STUDENT: '/',
}

// 角色名称映射
const roleNames: Record<string, string> = {
  ENTERPRISE: '企业用户',
  GOVERNMENT: '政府用户',
  SCHOOL: '学校管理员',
  ADMIN: '系统管理员',
  STUDENT: '学生',
}

/**
 * 验证用户角色是否匹配页面要求
 * @param requiredRole 页面要求的角色
 */
export function useRoleGuard(requiredRole: UserRole) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // 等待 session 加载完成
    if (status === 'loading') return

    // 未登录，跳转到登录页
    if (status === 'unauthenticated' || !session?.user) {
      const currentPath = window.location.pathname
      router.push(`/login?callbackUrl=${encodeURIComponent(currentPath)}`)
      return
    }

    // 获取用户实际角色
    const userRole = (session.user as any)?.role as string | undefined

    // 角色不匹配，重定向到正确的页面
    if (userRole && userRole.toLowerCase() !== requiredRole.toLowerCase()) {
      console.warn(`角色不匹配: 页面要求 ${requiredRole}, 用户角色 ${userRole}`)

      // 重定向到用户对应的页面
      const correctPath = roleToPath[userRole] || '/enterprise'
      window.location.href = correctPath
    }
  }, [session, status, requiredRole, router])

  return {
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    userRole: (session?.user as any)?.role as string | undefined,
    userName: session?.user?.name || roleNames[requiredRole] || '用户',
  }
}
