/**
 * 学校端统计 API
 * GET /api/statistics/school - 获取学校端统计数据
 */

import { NextRequest, NextResponse } from 'next/server'
import { statisticsService } from '@/services/statistics.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'SCHOOL' && userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    // 获取学校ID
    let schoolId = (session.user as any).schoolManagedId
    const { searchParams } = new URL(request.url)
    const querySchoolId = searchParams.get('schoolId')

    // 管理员可以指定学校ID
    if (userRole === 'ADMIN' && querySchoolId) {
      schoolId = querySchoolId
    }

    if (!schoolId) {
      return NextResponse.json({ success: false, error: '未关联学校' }, { status: 400 })
    }

    const result = await statisticsService.getSchoolDashboard(schoolId)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Get school stats error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取学校统计失败' },
      { status: 500 }
    )
  }
}
