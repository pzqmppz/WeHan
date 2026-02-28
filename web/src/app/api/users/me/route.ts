/**
 * 当前用户信息 API
 * GET /api/users/me - 获取当前用户信息
 * PUT /api/users/me - 更新当前用户信息
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'

/**
 * GET /api/users/me - 获取当前登录用户的完整信息
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userId = (session.user as any).id

    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        school: true,
        enterprise: true,
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }

    // 返回用户信息（不包含密码）
    const { password, ...userInfo } = user

    return NextResponse.json({
      success: true,
      data: {
        ...userInfo,
        school: user.school,
        enterprise: user.enterprise,
      },
    })
  } catch (error: any) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取用户信息失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/users/me - 更新当前用户信息
 * 只允许修改: name, phone
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const body = await request.json()

    // 只允许修改特定字段
    const updateData: { name?: string; phone?: string } = {}

    if (body.name !== undefined) {
      updateData.name = body.name
    }
    if (body.phone !== undefined) {
      updateData.phone = body.phone || null
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      include: {
        school: true,
        enterprise: true,
      },
    })

    // 返回更新后的用户信息（不包含密码）
    const { password, ...userInfo } = user

    return NextResponse.json({
      success: true,
      data: {
        ...userInfo,
        school: user.school,
        enterprise: user.enterprise,
      },
    })
  } catch (error: any) {
    console.error('Update current user error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新用户信息失败' },
      { status: 500 }
    )
  }
}
