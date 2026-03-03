/**
 * 访客身份管理
 * 用于 Demo 阶段的匿名用户追踪
 */

import { v4 as uuidv4 } from 'uuid'
import type { UserIdentity } from '@/types/chat'

const STORAGE_KEY = 'wehan_user_identity'

/**
 * 生成访客 ID
 * 格式: visitor_xxxxxxxxxxxxxxxx
 */
function generateVisitorId(): string {
  return `visitor_${uuidv4().replace(/-/g, '').slice(0, 16)}`
}

/**
 * 获取或创建用户身份
 * - 如果 localStorage 中有记录，更新最后活跃时间并返回
 * - 如果没有记录，创建新身份
 */
export function getOrCreateUserIdentity(): UserIdentity {
  if (typeof window === 'undefined') {
    return createServerIdentity()
  }

  const stored = localStorage.getItem(STORAGE_KEY)

  if (stored) {
    try {
      const identity = JSON.parse(stored) as UserIdentity
      // 更新最后活跃时间
      identity.lastActiveAt = Date.now()
      saveIdentity(identity)
      return identity
    } catch {
      // 解析失败，创建新身份
    }
  }

  const newIdentity: UserIdentity = {
    visitorId: generateVisitorId(),
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  }

  saveIdentity(newIdentity)
  return newIdentity
}

/**
 * 保存身份到 localStorage
 */
function saveIdentity(identity: UserIdentity): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(identity))
    } catch (error) {
      // localStorage 可能被禁用或已满
      console.warn('Failed to save user identity:', error)
    }
  }
}

/**
 * 获取访客 ID (快捷方法)
 */
export function getVisitorId(): string {
  return getOrCreateUserIdentity().visitorId
}

/**
 * 服务端占位身份
 * SSR 时返回一个临时身份
 */
function createServerIdentity(): UserIdentity {
  return {
    visitorId: `server_${Date.now()}`,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  }
}

/**
 * 清除用户身份
 * 用于测试或用户主动清除
 */
export function clearUserIdentity(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear user identity:', error)
    }
  }
}

/**
 * 检查是否为新用户
 */
export function isNewUser(): boolean {
  if (typeof window === 'undefined') {
    return true
  }
  return !localStorage.getItem(STORAGE_KEY)
}
