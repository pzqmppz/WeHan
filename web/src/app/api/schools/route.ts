/**
 * 学校列表 API
 * GET /api/schools - 获取学校列表
 * POST /api/schools - 创建学校
 */

import { NextRequest, NextResponse } from 'next/server'
import { schoolService, SchoolQuerySchema } from '@/services/school.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = SchoolQuerySchema.parse({
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 10,
      verified: searchParams.get('verified') || undefined,
      keyword: searchParams.get('keyword') || undefined,
    })

    const result = await schoolService.getSchools(query)
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('Get schools error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取学校列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const result = await schoolService.createSchool(body)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Create school error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '创建学校失败' },
      { status: 500 }
    )
  }
}
