/**
 * 用户列表 API
 * GET /api/users - 获取用户列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { userService, UserQuerySchema } from '@/services/user.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SCHOOL') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const query = UserQuerySchema.parse({
      page: searchParams.get('page') || 1,
      pageSize: searchParams.get('pageSize') || 10,
      role: searchParams.get('role') || undefined,
      status: searchParams.get('status') || undefined,
      schoolId: searchParams.get('schoolId') || undefined,
      enterpriseId: searchParams.get('enterpriseId') || undefined,
      keyword: searchParams.get('keyword') || undefined,
    })

    const result = await userService.getUsers(query)
    return NextResponse.json({ success: true, ...result })
  } catch (error: any) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取用户列表失败' },
      { status: 500 }
    )
  }
}
