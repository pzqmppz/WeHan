import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/applications - 获取投递列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const status = searchParams.get('status')
    const enterpriseId = searchParams.get('enterpriseId')
    const userId = searchParams.get('userId')

    const where: any = {}

    if (status) {
      where.status = status
    }

    if (enterpriseId) {
      where.job = { enterpriseId }
    }

    if (userId) {
      where.userId = userId
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              major: true,
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              enterprise: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          interview: {
            select: {
              totalScore: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.application.count({ where }),
    ])

    return NextResponse.json({
      data: applications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: '获取投递列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/applications - 创建投递
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 检查是否已投递
    const existing = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: body.userId,
          jobId: body.jobId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: '您已投递过该岗位' },
        { status: 400 }
      )
    }

    const application = await prisma.application.create({
      data: {
        userId: body.userId,
        jobId: body.jobId,
        resumeId: body.resumeId,
        interviewId: body.interviewId,
        matchScore: body.matchScore,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ data: application })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { error: '投递失败' },
      { status: 500 }
    )
  }
}
