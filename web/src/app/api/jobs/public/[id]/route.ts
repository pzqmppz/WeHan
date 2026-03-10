/**
 * 公开岗位详情 API - 不需要 API Key
 * 供前端公开页面使用
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 查询岗位（只返回已发布的）
    const job = await prisma.job.findFirst({
      where: {
        id,
        status: 'PUBLISHED',
      },
      include: {
        Enterprise: {
          select: {
            id: true,
            name: true,
            industry: true,
            scale: true,
            description: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: '岗位不存在或已下架' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: job,
    })
  } catch (error) {
    console.error('Public job detail error:', error)
    return NextResponse.json(
      { success: false, error: '获取岗位详情失败' },
      { status: 500 }
    )
  }
}
