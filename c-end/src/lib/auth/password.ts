/**
 * 密码加密工具
 * 使用 bcrypt 进行密码哈希和验证
 */

import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

/**
 * 对密码进行哈希
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * 验证密码
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * 验证密码强度
 * - 至少 6 个字符
 * - 最多 50 个字符
 */
export function validatePasswordStrength(password: string): {
  valid: boolean
  message?: string
} {
  if (password.length < 6) {
    return { valid: false, message: '密码至少需要 6 个字符' }
  }
  if (password.length > 50) {
    return { valid: false, message: '密码不能超过 50 个字符' }
  }
  return { valid: true }
}
