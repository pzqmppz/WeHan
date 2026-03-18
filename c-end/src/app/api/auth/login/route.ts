/**
 * 登录 API
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/auth/password'
import { signToken, getExpiresInSeconds } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, visitorId } = body

    // 参数验证
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: '邮箱和密码为必填项',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    // 查找用户（支持邮箱或手机号登录）
    const user = await prisma.cUser.findFirst({
      where: {
        OR: [{ email }, { phone: email }],
      },
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '邮箱或密码错误',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      )
    }

    // 验证密码
    const passwordMatch = await verifyPassword(password, user.password)
    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          error: '邮箱或密码错误',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      )
    }

    // 检查账号状态
    if (user.status === 'INACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: '账号已被禁用，请联系客服',
          code: 'ACCOUNT_DISABLED',
        },
        { status: 403 }
      )
    }

    // 更新最后登录时间
    await prisma.cUser.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        // 如果提供了 visitorId 且用户没有关联过，则关联
        ...(visitorId && !user.visitorId ? { visitorId } : {}),
      },
    })

    // 生成 JWT Token
    const token = await signToken({
      userId: user.id,
      email: user.email,
    })

    // 返回用户信息（不包含密码）
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: getExpiresInSeconds(),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '登录失败，请稍后重试',
      },
      { status: 500 }
    )
  }
}
