/**
 * 用户详情 API
 * GET /api/users/[id] - 获取用户详情
 * PATCH /api/users/[id] - 更新用户状态
 */

import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services/user.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const { id } = await params
    const result = await userService.getUserById(id)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取用户失败' },
      { status: error.message === '用户不存在' ? 404 : 500 }
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
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const result = await userService.updateUserStatus(id, body)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新用户失败' },
      { status: error.message === '用户不存在' ? 404 : 500 }
    )
  }
}
