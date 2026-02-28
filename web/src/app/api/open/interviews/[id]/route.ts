/**
 * 开放 API - 面试记录查询和更新
 * GET /api/open/interviews/{id} - 获取面试详情
 * PATCH /api/open/interviews/{id} - 更新面试进度
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
 * 面试更新请求体结构
 */
interface UpdateInterviewRequestBody {
  currentIndex?: number           // 当前面试进度（第几题）
  answers?: Array<{               // 回答记录数组
    questionIndex: number
    question: string
    answer: string
    audioUrl?: string
    timestamp: string
  }>
  status?: 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED'  // 状态更新
  totalScore?: number               // 总分
  dimensions?: any                  // 维度评分
  highlights?: any                  // 亮点
  improvements?: any                // 改进建议
  suggestions?: string              // 整体建议
  audioUrl?: string                 // 录音URL
  conversation?: any[]              // 完整对话记录
  duration?: number                 // 面试时长（秒）
}

/**
 * PATCH /api/open/interviews/{id} - 更新面试进度（供 C 端调用）
 *
 * Request Body:
 * - currentIndex: 当前面试进度（第几题）
 * - answers: 回答记录数组（追加或替换）
 * - status: 状态更新（可选）
 *
 * 用途:
 * - 断点续答：每回答一题，更新 currentIndex 和 answers
 * - 完成面试：更新状态为 COMPLETED，保存评估结果
 */
export async function PATCH(
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
    const body: UpdateInterviewRequestBody = await request.json()

    // 2. 检查面试是否存在
    const existing = await prisma.interview.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '面试记录不存在' },
        { status: 404 }
      )
    }

    // 3. 构建更新数据
    const updateData: any = {
      updatedAt: new Date(),
    }

    // 支持更新当前进度
    if (body.currentIndex !== undefined) {
      updateData.currentIndex = body.currentIndex
    }

    // 支持更新回答记录（直接替换，由调用方管理完整数组）
    if (body.answers !== undefined) {
      updateData.answers = body.answers
    }

    // 支持状态更新
    if (body.status) {
      updateData.status = body.status
      if (body.status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }

    // 支持评估结果更新
    if (body.totalScore !== undefined) updateData.totalScore = body.totalScore
    if (body.dimensions !== undefined) updateData.dimensions = body.dimensions
    if (body.highlights !== undefined) updateData.highlights = body.highlights
    if (body.improvements !== undefined) updateData.improvements = body.improvements
    if (body.suggestions !== undefined) updateData.suggestions = body.suggestions
    if (body.audioUrl !== undefined) updateData.audioUrl = body.audioUrl
    if (body.conversation !== undefined) updateData.conversation = body.conversation
    if (body.duration !== undefined) updateData.duration = body.duration

    // 4. 更新面试记录
    const interview = await prisma.interview.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: {
        id: interview.id,
        currentIndex: interview.currentIndex,
        answers: interview.answers,
        status: interview.status,
        updatedAt: interview.updatedAt,
      },
    })
  } catch (error) {
    console.error('Open API - Update interview error:', error)

    return NextResponse.json(
      { success: false, error: '更新面试记录失败' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/open/interviews/{id} - 获取面试详情（供 C 端调用）
 *
 * Path Parameters:
 * - id: 面试记录ID
 *
 * 用途: 断点恢复 - 获取特定面试的完整信息（包括 outline、currentIndex、answers）
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

    // 2. 查询面试记录（返回完整数据用于断点恢复）
    const interview = await prisma.interview.findUnique({
      where: { id },
    })

    if (!interview) {
      return NextResponse.json(
        { success: false, error: '面试记录不存在' },
        { status: 404 }
      )
    }

    // 3. 查询关联的岗位信息（如果有）
    let job = null
    if (interview.jobId) {
      const jobData = await prisma.job.findUnique({
        where: { id: interview.jobId },
        include: {
          Enterprise: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })
      if (jobData) {
        job = {
          id: jobData.id,
          title: jobData.title,
          company: jobData.Enterprise?.name,
        }
      }
    }

    // 4. 格式化返回数据（包含断点恢复所需的字段）
    const responseData = {
      id: interview.id,
      job,
      // 面试内容（用于断点恢复）
      outline: interview.outline,
      currentIndex: interview.currentIndex,
      answers: interview.answers,
      // 评估结果
      totalScore: interview.totalScore,
      dimensions: interview.dimensions,
      highlights: interview.highlights,
      improvements: interview.improvements,
      suggestions: interview.suggestions,
      // 其他
      audioUrl: interview.audioUrl,
      duration: interview.duration,
      status: interview.status,
      createdAt: interview.createdAt,
      completedAt: interview.completedAt,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Open API - Get interview error:', error)

    return NextResponse.json(
      { success: false, error: '获取面试记录失败' },
      { status: 500 }
    )
  }
}
