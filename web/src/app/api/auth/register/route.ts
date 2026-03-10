/**
 * 注册 API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import cuid from 'cuid'
import { z } from 'zod'

/**
 * 注册数据验证 Schema
 */
const RegisterSchema = z.object({
  // 注册类型
  type: z.enum(['STUDENT', 'ENTERPRISE', 'SCHOOL']),

  // 用户基本信息
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号'),

  // 企业/学校信息
  organizationName: z.string().min(2, '企业/学校名称至少2个字符').optional(),
  contactName: z.string().min(2, '联系人姓名至少2个字符').optional(),
  industry: z.string().optional(),
  scale: z.string().optional(),

  // 学生信息
  major: z.string().optional(),
  graduationYear: z.number().min(2000).max(2030).optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validatedData = RegisterSchema.parse(body)

    const {
      type,
      name,
      email,
      password,
      phone,
      organizationName,
      contactName,
      industry,
      scale,
      major,
      graduationYear,
    } = validatedData

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 根据注册类型创建数据
    let userId: string
    let organizationId: string | undefined

    if (type === 'ENTERPRISE') {
      // 1. 创建企业
      const enterprise = await prisma.enterprise.create({
        data: {
          id: cuid(),
          name: organizationName!,
          industry: industry || '其他',
          scale: scale || '1-49',
          contactName: contactName || name,
          contactPhone: phone,
          contactEmail: email,
          verified: false, // 需要管理员审核
          updatedAt: new Date(),
        },
      })

      organizationId = enterprise.id

      // 2. 创建企业用户
      const user = await prisma.user.create({
        data: {
          id: cuid(),
          email,
          password: hashedPassword,
          name: contactName || name,
          phone,
          role: 'ENTERPRISE',
          status: 'PENDING', // 待审核
          enterpriseId: enterprise.id,
          updatedAt: new Date(),
        },
      })

      userId = user.id

    } else if (type === 'SCHOOL') {
      // 1. 创建学校
      const school = await prisma.school.create({
        data: {
          id: cuid(),
          name: organizationName!,
          type: '高校',
          level: '本科',
          contactName: contactName || name,
          contactPhone: phone,
          verified: false, // 需要管理员审核
          updatedAt: new Date(),
        },
      })

      organizationId = school.id

      // 2. 创建学校用户
      const user = await prisma.user.create({
        data: {
          id: cuid(),
          email,
          password: hashedPassword,
          name: contactName || name,
          phone,
          role: 'SCHOOL',
          status: 'PENDING', // 待审核
          schoolManagedId: school.id,
          updatedAt: new Date(),
        },
      })

      userId = user.id

    } else {
      // STUDENT - 学生注册
      // 学生不需要关联学校，可以直接注册
      const user = await prisma.user.create({
        data: {
          id: cuid(),
          email,
          password: hashedPassword,
          name,
          phone,
          role: 'STUDENT',
          status: 'ACTIVE', // 学生直接激活
          major,
          graduationYear,
          updatedAt: new Date(),
        },
      })

      userId = user.id
    }

    return NextResponse.json({
      success: true,
      message:
        type === 'STUDENT'
          ? '注册成功！即将跳转到登录页'
          : '注册成功！您的账号需要管理员审核，请耐心等待',
      data: {
        userId,
        requiresReview: type !== 'STUDENT',
      },
    })
  } catch (error) {
    console.error('Register error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: '参数验证失败',
          details: error.issues,
        },
        { status: 400 }
      )
    }

    // 处理唯一约束错误
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: '该邮箱已被注册' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '注册失败，请稍后重试' },
      { status: 500 }
    )
  }
}
