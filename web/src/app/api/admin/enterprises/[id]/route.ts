/**
 * 企业审核 API
 * POST /api/admin/enterprises/[id]/verify - 审核企业
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'

interface RouteParams {
  params: Promise<{ id: string }>
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
