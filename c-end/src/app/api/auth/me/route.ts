/**
 * 获取当前用户信息 API
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, extractToken } from '@/lib/auth/jwt'

export async function GET(request: NextRequest) {
  try {
    // 提取 Token
    const authHeader = request.headers.get('authorization')
    const token = extractToken(authHeader)

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: '未提供认证令牌',
        },
        { status: 401 }
      )
    }

    // 验证 Token
    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: '认证令牌无效或已过期',
        },
        { status: 401 }
      )
    }

    // 获取用户信息
    const user = await prisma.cUser.findUnique({
      where: { id: payload.userId },
      include: {
        _count: {
          select: {
            interviews: true,
            conversations: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '用户不存在',
        },
        { status: 404 }
      )
    }

    // 检查账号状态
    if (user.status === 'INACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: '账号已被禁用',
        },
        { status: 403 }
      )
    }

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        stats: {
          interviewCount: user._count.interviews,
          conversationCount: user._count.conversations,
        },
      },
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '获取用户信息失败',
      },
      { status: 500 }
    )
  }
}
