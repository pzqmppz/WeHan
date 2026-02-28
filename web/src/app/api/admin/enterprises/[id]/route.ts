/**
 * 企业详情 API
 * GET /api/admin/enterprises/[id] - 获取企业详情
 * POST /api/admin/enterprises/[id] - 审核企业
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
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

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { id } = await params

    const enterprise = await prisma.enterprise.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            Job: true,
            User: true,
          },
        },
      },
    })

    if (!enterprise) {
      return NextResponse.json({ success: false, error: '企业不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: enterprise })
  } catch (error: any) {
    console.error('Get enterprise error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取企业详情失败' },
      { status: 500 }
    )
  }
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

    const enterprise = await prisma.enterprise.update({
      where: { id },
      data: { verified },
    })

    return NextResponse.json({ success: true, data: enterprise })
  } catch (error: any) {
    console.error('Verify enterprise error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '审核企业失败' },
      { status: 500 }
    )
  }
}
