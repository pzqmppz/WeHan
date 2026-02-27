import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/policies - 获取政策列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const type = searchParams.get('type')

    const where: any = {
      isActive: true,
    }

    if (type) {
      where.type = type
    }

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.policy.count({ where }),
    ])

    return NextResponse.json({
      data: policies,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Get policies error:', error)
    return NextResponse.json(
      { error: '获取政策列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/policies - 创建政策
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const policy = await prisma.policy.create({
      data: {
        title: body.title,
        type: body.type,
        content: body.content,
        summary: body.summary,
        conditions: body.conditions,
        benefits: body.benefits,
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        isActive: true,
      },
    })

    return NextResponse.json({ data: policy })
  } catch (error) {
    console.error('Create policy error:', error)
    return NextResponse.json(
      { error: '创建政策失败' },
      { status: 500 }
    )
  }
}
