/**
 * 学校审核 API
 * POST /api/schools/[id]/verify - 审核学校
 */

import { NextRequest, NextResponse } from 'next/server'
import { schoolService } from '@/services/school.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const verified = body.verified === true

    const result = await schoolService.verifySchool(id, verified)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Verify school error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '审核学校失败' },
      { status: error.message === '学校不存在' ? 404 : 500 }
    )
  }
}
