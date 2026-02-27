/**
 * 推送记录 API
 * GET /api/job-push/records - 获取推送记录列表
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
    if (userRole !== 'SCHOOL' && userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    let schoolId = searchParams.get('schoolId') || undefined

    // 学校用户只能查看自己学校的推送记录
    if (userRole === 'SCHOOL') {
      schoolId = (session.user as any).schoolManagedId
    }

    const where: any = {}
    if (schoolId) {
      where.schoolId = schoolId
    }

    const [records, total] = await Promise.all([
      prisma.jobPushRecord.findMany({
        where,
        include: {
          Job: {
            include: {
              Enterprise: {
                select: {
                  id: true,
                  name: true,
                  industry: true,
                },
              },
            },
          },
          School: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.jobPushRecord.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: records,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error: any) {
    console.error('Get job push records error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取推送记录失败' },
      { status: 500 }
    )
  }
}
