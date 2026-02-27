/**
 * 学校详情 API
 * GET /api/schools/[id] - 获取学校详情
 * PATCH /api/schools/[id] - 更新学校
 */

import { NextRequest, NextResponse } from 'next/server'
import { schoolService } from '@/services/school.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await schoolService.getSchoolById(id)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Get school error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取学校失败' },
      { status: error.message === '学校不存在' ? 404 : 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SCHOOL') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const result = await schoolService.updateSchool(id, body)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Update school error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新学校失败' },
      { status: error.message === '学校不存在' ? 404 : 500 }
    )
  }
}
