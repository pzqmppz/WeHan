/**
 * 开放 API - 岗位详情
 * GET /api/open/jobs/{id}
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 验证 API Key
 */
function validateApiKey(request: NextRequest): { valid: boolean; error?: string } {
  const apiKey = request.headers.get('X-API-Key')
  const expectedKey = process.env.OPEN_API_KEY

  if (!expectedKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: OPEN_API_KEY not configured in production')
      return { valid: false, error: '服务配置错误' }
    }
    console.warn('OPEN_API_KEY not configured, skipping validation (dev only)')
    return { valid: true }
  }

  if (!apiKey || apiKey !== expectedKey) {
    return { valid: false, error: '无效的 API Key' }
  }

  return { valid: true }
}

/**
 * GET /api/open/jobs/{id} - 获取岗位详情（供 C 端调用）
 *
 * Path Parameters:
 * - id: 岗位ID
 *
 * Headers:
 * - X-API-Key: API 密钥
 *
 * 字段映射:
 * - responsibilities <- description (数据库字段)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. API Key 验证
  const auth = validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error || '未授权访问' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params

    // 2. 查询岗位（只返回已发布的）
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
            logo: true,
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

    // 3. 过滤敏感字段，映射字段名
    const responseData = {
      id: job.id,
      title: job.title,
      industry: job.industry,
      category: job.category,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      location: job.location,
      address: job.address,
      // 字段映射: responsibilities <- description
      responsibilities: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      skills: job.skills,
      educationLevel: job.educationLevel,
      experienceYears: job.experienceYears,
      freshGraduate: job.freshGraduate,
      headcount: job.headcount,
      publishedAt: job.publishedAt,
      enterprise: job.Enterprise ? {
        id: job.Enterprise.id,
        name: job.Enterprise.name,
        industry: job.Enterprise.industry,
        logo: job.Enterprise.logo,
      } : null,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Open API - Get job detail error:', error)

    return NextResponse.json(
      { success: false, error: '获取岗位详情失败' },
      { status: 500 }
    )
  }
}
