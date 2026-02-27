/**
 * 平台总览统计 API
 * GET /api/statistics/overview - 获取平台总览统计
 */

import { NextRequest, NextResponse } from 'next/server'
import { statisticsService } from '@/services/statistics.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const result = await statisticsService.getPlatformOverview()
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Get platform overview error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取平台统计失败' },
      { status: 500 }
    )
  }
}
