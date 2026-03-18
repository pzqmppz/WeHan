/**
 * 注册 API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password'
import { signToken, getExpiresInSeconds } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, phone, visitorId } = body

    // 参数验证
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: '邮箱、密码和姓名为必填项',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: '邮箱格式不正确',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    // 密码强度验证
    const passwordValidation = validatePasswordStrength(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: passwordValidation.message,
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    // 姓名长度验证
    if (name.length < 2 || name.length > 20) {
      return NextResponse.json(
        {
          success: false,
          error: '姓名长度应为 2-20 个字符',
          code: 'VALIDATION_ERROR',
        },
        { status: 400 }
      )
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.cUser.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: '该邮箱已被注册',
          code: 'EMAIL_EXISTS',
        },
        { status: 400 }
      )
    }

    // 如果提供了手机号，检查是否已存在
    if (phone) {
      const existingPhone = await prisma.cUser.findUnique({
        where: { phone },
      })
      if (existingPhone) {
        return NextResponse.json(
          {
            success: false,
            error: '该手机号已被注册',
            code: 'PHONE_EXISTS',
          },
          { status: 400 }
        )
      }
    }

    // 加密密码
    const hashedPassword = await hashPassword(password)

    // 创建用户
    const user = await prisma.cUser.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone: phone || null,
        visitorId: visitorId || null,
        status: 'ACTIVE',
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
    console.error('Register error:', error)
    return NextResponse.json(
      {
        success: false,
        error: '注册失败，请稍后重试',
      },
      { status: 500 }
    )
  }
}
