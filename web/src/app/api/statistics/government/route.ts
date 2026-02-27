/**
 * 政府端统计 API
 * GET /api/statistics/government - 获取政府端统计数据
 */

import { NextRequest, NextResponse } from 'next/server'
import { statisticsService, DateRangeSchema } from '@/services/statistics.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'GOVERNMENT' && userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = DateRangeSchema.parse({
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      months: parseInt(searchParams.get('months') || '6'),
    })

    const result = await statisticsService.getGovernmentDashboard({
      startDate: query.startDate,
      endDate: query.endDate,
      months: parseInt(searchParams.get('months') || '6'),
    })

    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Get government stats error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取政府统计失败' },
      { status: 500 }
    )
  }
}
