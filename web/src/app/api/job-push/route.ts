/**
 * 岗位推送 API
 * POST /api/job-push - 创建岗位推送
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import cuid from 'cuid'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'SCHOOL' && userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const { jobId, schoolId, targetMajors } = body

    // 验证岗位存在
    const job = await prisma.job.findUnique({
      where: { id: jobId },
    })

    if (!job) {
      return NextResponse.json({ success: false, error: '岗位不存在' }, { status: 404 })
    }

    // 验证学校存在
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    })

    if (!school) {
      return NextResponse.json({ success: false, error: '学校不存在' }, { status: 404 })
    }

    // 创建推送记录
    const pushRecord = await prisma.jobPushRecord.create({
      data: {
        id: cuid(),
        jobId,
        schoolId,
        targetMajors: targetMajors || [],
        pushCount: 0,
      },
    })

    return NextResponse.json({ success: true, data: pushRecord })
  } catch (error: any) {
    console.error('Create job push error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '创建推送失败' },
      { status: 500 }
    )
  }
}
