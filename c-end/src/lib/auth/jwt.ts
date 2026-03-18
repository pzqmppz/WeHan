/**
 * JWT 工具函数
 * 用于生成和验证 JWT Token
 */

import { SignJWT, jwtVerify } from 'jose'

// JWT 配置
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'wehan-c-end-jwt-secret-key-at-least-32-characters'
)
const JWT_EXPIRES_IN = '7d' // 7 天过期
const JWT_ISSUER = 'wehan-c-end'
const JWT_AUDIENCE = 'wehan-user'

export interface JWTPayload {
  userId: string
  email: string
  iat: number
  exp: number
}

/**
 * 生成 JWT Token
 */
export async function signToken(payload: { userId: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(JWT_SECRET)
}

/**
 * 验证 JWT Token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

/**
 * 从 Authorization Header 提取 Token
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  if (!authHeader.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

/**
 * 计算过期时间（秒）
 */
export function getExpiresInSeconds(): number {
  // 7 天 = 7 * 24 * 60 * 60 = 604800 秒
  return 7 * 24 * 60 * 60
}
