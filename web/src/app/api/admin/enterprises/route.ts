/**
 * 企业管理 API (管理员)
 * GET /api/admin/enterprises - 获取企业列表（含审核状态）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const verified = searchParams.get('verified')
    const keyword = searchParams.get('keyword')

    const where: any = {}
    if (verified !== null && verified !== undefined && verified !== '') {
      where.verified = verified === 'true'
    }
    if (keyword) {
      where.OR = [
        { name: { contains: keyword, mode: 'insensitive' } },
        { industry: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    const [enterprises, total] = await Promise.all([
      prisma.enterprise.findMany({
        where,
        include: {
          _count: {
            select: {
              jobs: true,
              users: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.enterprise.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: enterprises,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error('Get enterprises error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取企业列表失败' },
      { status: 500 }
    )
  }
}
