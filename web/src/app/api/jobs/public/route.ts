/**
 * 公开岗位列表 API - 不需要 API Key
 * 供前端公开页面使用
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 50)
    const industry = searchParams.get('industry')
    const location = searchParams.get('location')
    const keyword = searchParams.get('keyword')

    // 构建查询条件
    const where: any = {
      status: 'PUBLISHED',
    }

    if (industry) {
      where.industry = industry
    }

    if (location) {
      where.location = {
        contains: location,
      }
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
      ]
    }

    // 查询总数
    const total = await prisma.job.count({ where })

    // 查询岗位列表
    const jobs = await prisma.job.findMany({
      where,
      include: {
        Enterprise: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return NextResponse.json({
      success: true,
      data: jobs,
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Public jobs list error:', error)
    return NextResponse.json(
      { success: false, error: '获取岗位列表失败' },
      { status: 500 }
    )
  }
}
