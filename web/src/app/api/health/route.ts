/**
 * 健康检查端点 - 用于测试网络连接
 * GET /api/health
 */

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const now = new Date().toISOString()
  const headers = Object.fromEntries(request.headers.entries())

  // 记录请求信息
  console.log('=== Health Check ===')
  console.log('Time:', now)
  console.log('IP:', request.headers.get('x-forwarded-for') || 'unknown')
  console.log('User-Agent:', request.headers.get('user-agent'))
  console.log('All Headers:', JSON.stringify(headers, null, 2))

  return NextResponse.json({
    success: true,
    message: 'WeHan API is running',
    timestamp: now,
    server: 'wehan.vercel.app',
    requestInfo: {
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent'),
    }
  })
}

// 支持 OPTIONS 预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    },
  })
}
