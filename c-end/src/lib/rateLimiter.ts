/**
 * 限流工具函数
 * Demo 阶段使用内存存储，生产环境可迁移到 Redis
 */

import type { RateLimitConfig, RateLimitResult } from '@/types/chat'

/** 内存存储记录 */
interface RateRecord {
  count: number
  resetAt: number
}

// 内存存储 (Demo 阶段)
const memoryStore = new Map<string, RateRecord>()

/**
 * 清理过期记录
 * 定期执行，避免内存泄漏
 */
function cleanupExpiredRecords(): void {
  const now = Date.now()
  for (const [key, record] of memoryStore.entries()) {
    if (record.resetAt < now) {
      memoryStore.delete(key)
    }
  }
}

// 每分钟清理一次
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRecords, 60 * 1000)
}

/**
 * 检查是否允许请求
 * @param key 限流键 (通常是 userId)
 * @param config 限流配置
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const fullKey = `${config.keyPrefix || 'rl'}:${key}`

  const record = memoryStore.get(fullKey)

  // 无记录或已过期，创建新记录
  if (!record || record.resetAt < now) {
    const newRecord: RateRecord = {
      count: 1,
      resetAt: now + config.windowMs,
    }
    memoryStore.set(fullKey, newRecord)

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newRecord.resetAt,
    }
  }

  // 未超过限制
  if (record.count < config.maxRequests) {
    record.count++
    return {
      allowed: true,
      remaining: config.maxRequests - record.count,
      resetAt: record.resetAt,
    }
  }

  // 超过限制
  return {
    allowed: false,
    remaining: 0,
    resetAt: record.resetAt,
    retryAfter: record.resetAt - now,
  }
}

/**
 * 预设配置: 聊天限流
 * 每分钟最多 20 条消息
 */
export const CHAT_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 分钟
  maxRequests: 20,
  keyPrefix: 'chat',
}

/**
 * 预设配置: 工作流限流
 * 每分钟最多 10 次调用
 */
export const WORKFLOW_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 分钟
  maxRequests: 10,
  keyPrefix: 'workflow',
}

/**
 * 预设配置: 每日总限流
 * 每天最多 100 次 API 调用 (Demo 阶段)
 */
export const DAILY_RATE_LIMIT: RateLimitConfig = {
  windowMs: 24 * 60 * 60 * 1000, // 24 小时
  maxRequests: 100,
  keyPrefix: 'daily',
}

/**
 * 重置某 key 的限流记录
 * 用于测试
 */
export function resetRateLimit(key: string, prefix?: string): void {
  const fullKey = `${prefix || 'rl'}:${key}`
  memoryStore.delete(fullKey)
}

/**
 * 获取当前计数
 * 用于调试和展示
 */
export function getCurrentCount(key: string, prefix?: string): number {
  const fullKey = `${prefix || 'rl'}:${key}`
  const record = memoryStore.get(fullKey)

  if (!record || record.resetAt < Date.now()) {
    return 0
  }

  return record.count
}
