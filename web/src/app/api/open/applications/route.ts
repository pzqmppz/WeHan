/**
 * 开放 API - 投递管理
 * POST /api/open/applications - 提交投递
 * GET /api/open/applications - 获取投递列表
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cuid from 'cuid'

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
 * 投递请求体结构
 */
interface ApplicationRequestBody {
  userId: string                    // C端用户ID（豆包user_id）-> 映射到 externalUserId
  jobId: string                     // 岗位ID
  resumeId?: string                 // 简历ID（可选）
  interviewId?: string              // 面试报告ID（可选）
}

/**
 * POST /api/open/applications - 提交投递（供 C 端调用）
 *
 * Request Body:
 * - userId: C端用户ID（必填）
 * - jobId: 岗位ID（必填）
 * - resumeId: 简历ID（可选）
 * - interviewId: 面试报告ID（可选）
 *
 * 字段映射:
 * - userId -> externalUserId
 */
export async function POST(request: NextRequest) {
  // 1. API Key 验证
  const auth = validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error || '未授权访问' },
      { status: 401 }
    )
  }

  try {
    const body: ApplicationRequestBody = await request.json()

    // 2. 参数验证
    if (!body.userId || !body.jobId) {
      return NextResponse.json(
        { success: false, error: 'userId 和 jobId 是必填字段' },
        { status: 400 }
      )
    }

    // 3. 检查岗位是否存在且已发布
    const job = await prisma.job.findFirst({
      where: {
        id: body.jobId,
        status: 'PUBLISHED',
      },
    })

    if (!job) {
      return NextResponse.json(
        { success: false, error: '岗位不存在或已下架' },
        { status: 404 }
      )
    }

    // 4. 检查是否已投递过（同一用户对同一岗位）
    const existingApplication = await prisma.application.findFirst({
      where: {
        externalUserId: body.userId,
        jobId: body.jobId,
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: '您已投递过该岗位，请勿重复投递' },
        { status: 400 }
      )
    }

    const now = new Date()

    // 5. 创建投递记录
    const application = await prisma.application.create({
      data: {
        id: cuid(),
        externalUserId: body.userId,     // 字段映射: userId -> externalUserId
        jobId: body.jobId,
        resumeId: body.resumeId,
        interviewId: body.interviewId,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
    })

    // 6. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt,
      },
    })
  } catch (error) {
    console.error('Open API - Submit application error:', error)

    return NextResponse.json(
      { success: false, error: '提交投递失败' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/open/applications - 获取投递列表（供 C 端调用）
 *
 * Query Parameters:
 * - userId: C端用户ID（必填）
 *
 * 字段映射:
 * - 查询时用 externalUserId 匹配 userId
 */
export async function GET(request: NextRequest) {
  // 1. API Key 验证
  const auth = validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error || '未授权访问' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 2. 参数验证
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId 是必填参数' },
        { status: 400 }
      )
    }

    // 3. 查询投递列表（通过 externalUserId 查询）
    const applications = await prisma.application.findMany({
      where: {
        externalUserId: userId,
      },
      include: {
        Job: {
          select: {
            id: true,
            title: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
            Enterprise: {
              select: {
                id: true,
                name: true,
                industry: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 4. 格式化返回数据
    const formattedData = applications.map(app => ({
      id: app.id,
      job: {
        id: app.Job.id,
        title: app.Job.title,
        company: app.Job.Enterprise?.name,
        location: app.Job.location,
        salaryMin: app.Job.salaryMin,
        salaryMax: app.Job.salaryMax,
      },
      status: app.status,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
    })
  } catch (error) {
    console.error('Open API - Get applications error:', error)

    return NextResponse.json(
      { success: false, error: '获取投递列表失败' },
      { status: 500 }
    )
  }
}
