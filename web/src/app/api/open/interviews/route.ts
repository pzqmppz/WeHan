/**
 * 开放 API - 面试报告保存
 * POST /api/open/interviews
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
 * 面试报告请求体结构
 */
interface InterviewRequestBody {
  userId: string                    // C端用户ID（豆包user_id）-> 映射到 externalUserId
  jobId?: string                    // 岗位ID（可选）
  status?: 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED'  // 面试状态，默认COMPLETED
  outline?: any[]                   // 题目列表（用于创建进行中的面试）
  currentIndex?: number             // 当前面试进度（第几题）
  answers?: Array<{                 // 回答记录数组
    questionIndex: number
    question: string
    answer: string
    audioUrl?: string
    timestamp: string
  }>
  totalScore?: number               // 总分
  dimensions?: Array<{              // 维度评分
    name: string
    score: number
    maxScore: number
  }>
  highlights?: Array<{              // 亮点
    question: string
    answer: string
    score: number
    comment: string
  }>
  improvements?: Array<{            // 改进建议
    area: string
    suggestion: string
  }>
  suggestions?: string              // 整体建议
  audioUrl?: string                 // 录音URL（可选）
  conversation?: any[]              // 完整对话记录
  duration?: number                 // 面试时长（秒）
}

/**
 * POST /api/open/interviews - 创建面试记录（供 C 端调用）
 *
 * Request Body:
 * - userId: C端用户ID（必填）
 * - jobId: 岗位ID
 * - status: 面试状态 (PREPARING/IN_PROGRESS/COMPLETED)，默认COMPLETED
 * - outline: 题目列表（用于断点恢复）
 * - currentIndex: 当前面试进度（第几题）
 * - answers: 回答记录数组
 * - totalScore: 总分
 * - dimensions: 维度评分
 * - highlights: 亮点
 * - improvements: 改进建议
 * - suggestions: 整体建议
 * - audioUrl: 录音URL
 * - conversation: 完整对话记录
 *
 * 字段映射:
 * - userId -> externalUserId
 *
 * 支持场景:
 * - 完成面试：传入status=COMPLETED，保存完整报告
 * - 开始面试：传入status=IN_PROGRESS和outline，初始化空数组
 * - 断点恢复：配合 GET 接口查询未完成的面试
 */

/**
 * GET /api/open/interviews - 查询面试记录（供 C 端调用）
 *
 * Query Params:
 * - userId: C端用户ID（必填）
 * - status: 状态筛选 (PREPARING/IN_PROGRESS/COMPLETED)，可选
 *
 * 用途: 断点恢复 - 查询用户未完成的面试
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
    const status = searchParams.get('status')

    // 2. 参数验证
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId 是必填字段' },
        { status: 400 }
      )
    }

    // 3. 构建查询条件
    const where: any = {
      externalUserId: userId,
    }
    if (status) {
      where.status = status
    }

    // 4. 查询面试记录（按创建时间倒序）
    const interviews = await prisma.interview.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // 最多返回10条
    })

    return NextResponse.json({
      success: true,
      data: interviews,
    })
  } catch (error) {
    console.error('Open API - Get interviews error:', error)

    return NextResponse.json(
      { success: false, error: '查询面试记录失败' },
      { status: 500 }
    )
  }
}
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
    const body: InterviewRequestBody = await request.json()

    // 2. 参数验证
    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'userId 是必填字段' },
        { status: 400 }
      )
    }

    const now = new Date()
    const status = body.status || 'COMPLETED'

    // 3. 创建面试记录
    const interview = await prisma.interview.create({
      data: {
        id: cuid(),
        externalUserId: body.userId,       // 字段映射: userId -> externalUserId
        jobId: body.jobId,
        status: status,                    // 支持创建进行中的面试
        outline: body.outline,
        currentIndex: body.currentIndex ?? 0,
        answers: body.answers ?? [],
        totalScore: body.totalScore,
        dimensions: body.dimensions,
        highlights: body.highlights,
        improvements: body.improvements,
        suggestions: body.suggestions,
        audioUrl: body.audioUrl,
        conversation: body.conversation,
        duration: body.duration,
        completedAt: status === 'COMPLETED' ? now : null,
        updatedAt: now,
        createdAt: now,
      },
    })

    // 4. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        id: interview.id,
        createdAt: interview.createdAt,
      },
    })
  } catch (error) {
    console.error('Open API - Save interview error:', error)

    return NextResponse.json(
      { success: false, error: '保存面试报告失败' },
      { status: 500 }
    )
  }
}
