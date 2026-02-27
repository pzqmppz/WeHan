import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/jobs - 获取岗位列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const industry = searchParams.get('industry')
    const location = searchParams.get('location')
    const keyword = searchParams.get('keyword')

    const where: any = {
      status: 'PUBLISHED',
    }

    if (industry) {
      where.industry = industry
    }

    if (location) {
      where.location = location
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { description: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          enterprise: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.job.count({ where }),
    ])

    return NextResponse.json({
      data: jobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json(
      { error: '获取岗位列表失败' },
      { status: 500 }
    )
  }
}

// POST /api/jobs - 创建岗位
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const job = await prisma.job.create({
      data: {
        title: body.title,
        enterpriseId: body.enterpriseId,
        industry: body.industry,
        category: body.category,
        salaryMin: body.salaryMin,
        salaryMax: body.salaryMax,
        location: body.location,
        address: body.address,
        description: body.description,
        requirements: body.requirements,
        benefits: body.benefits,
        skills: body.skills || [],
        educationLevel: body.educationLevel,
        experienceYears: body.experienceYears,
        freshGraduate: body.freshGraduate ?? true,
        headcount: body.headcount || 1,
        status: 'DRAFT',
      },
    })

    return NextResponse.json({ data: job })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json(
      { error: '创建岗位失败' },
      { status: 500 }
    )
  }
}
