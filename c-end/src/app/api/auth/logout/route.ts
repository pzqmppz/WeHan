/**
 * 登出 API
 * POST /api/auth/logout
 *
 * 由于使用 JWT 无状态认证，登出主要由前端清除 Token
 * 此 API 预留用于后续可能的 Token 黑名单功能
 */

import { NextResponse } from 'next/server'

export async function POST() {
  // JWT 是无状态的，服务端不存储 session
  // 登出操作主要由前端清除 localStorage 中的 token
  // 此 API 预留用于后续可能的 Token 黑名单功能

  return NextResponse.json({
    success: true,
    message: '登出成功',
  })
}
