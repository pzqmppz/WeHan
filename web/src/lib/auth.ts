/**
 * 认证工具函数
 * 用于服务端组件获取当前用户会话
 */

import { auth } from '@/app/api/auth/[...nextauth]/route'
import type { UserRole } from '@prisma/client'

export interface SessionUser {
  id: string
  email: string
  name: string
  role: UserRole
}

/**
 * 获取当前登录用户
 * 仅用于服务端组件
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth()

  if (!session?.user) {
    return null
  }

  return {
    id: session.user.id || '',
    email: session.user.email || '',
    name: session.user.name || '',
    role: (session.user as any).role as UserRole,
  }
}

/**
 * 检查用户是否已登录
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('未授权：请先登录')
  }

  return user
}

/**
 * 检查用户是否具有指定角色
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<SessionUser> {
  const user = await requireAuth()

  if (!allowedRoles.includes(user.role)) {
    throw new Error('禁止访问：权限不足')
  }

  return user
}

/**
 * 角色到门户路径的映射
 */
export const roleToPath: Record<UserRole, string> = {
  ENTERPRISE: '/enterprise',
  GOVERNMENT: '/government',
  SCHOOL: '/school',
  ADMIN: '/admin',
  STUDENT: '/', // 学生使用 C 端
}

/**
 * 根据角色获取默认跳转路径
 */
export function getDefaultPathForRole(role: UserRole): string {
  return roleToPath[role] || '/'
}
