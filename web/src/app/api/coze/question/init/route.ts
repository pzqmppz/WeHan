/**
 * Coze 多轮问询 - 初始化会话接口
 * POST /api/coze/question/init
 *
 * 用于工作流一调用，初始化面试问答会话
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 验证 API Key（复用开放 API 的鉴权方式）
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
 * 请求体 Schema
 */
interface InitRequest {
  session_id: string
  questions: string[]
}

/**
 * POST /api/coze/question/init
 *
 * 初始化会话，存储问题数组，返回第一个问题
 *
 * Request Body:
 * - session_id: Coze 会话 ID（必填）
 * - questions: 问题数组（必填，至少1个问题）
 *
 * Response:
 * - code: 200 成功，400 参数错误，401 未授权，500 服务器错误
 * - data: { current_question, current_idx, is_finish }
 */
export async function POST(request: NextRequest) {
  // 1. API Key 验证
  const auth = validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { code: 401, msg: auth.error || '未授权访问', data: null },
      { status: 401 }
    )
  }

  try {
    // 2. 解析请求体
    const body: InitRequest = await request.json()
    const { session_id, questions } = body

    // 3. 参数校验
    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { code: 400, msg: 'session_id 是必填项', data: null },
        { status: 400 }
      )
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { code: 400, msg: 'questions 必须是非空数组', data: null },
        { status: 400 }
      )
    }

    // 校验每个问题都是字符串
    for (let i = 0; i < questions.length; i++) {
      if (typeof questions[i] !== 'string') {
        return NextResponse.json(
          { code: 400, msg: `questions[${i}] 必须是字符串`, data: null },
          { status: 400 }
        )
      }
    }

    // 4. 计算过期时间（30分钟后）
    const expiredAt = new Date(Date.now() + 30 * 60 * 1000)

    // 5. 创建或更新会话（使用 upsert 避免重复）
    const session = await prisma.cozeQuestionSession.upsert({
      where: { sessionId: session_id },
      update: {
        questions: questions,
        answers: [],
        currentIdx: 0,
        isFinish: false,
        expiredAt: expiredAt,
        updatedAt: new Date(),
      },
      create: {
        sessionId: session_id,
        questions: questions,
        answers: [],
        currentIdx: 0,
        isFinish: false,
        expiredAt: expiredAt,
      },
    })

    // 6. 返回第一个问题
    return NextResponse.json({
      code: 200,
      msg: 'success',
      data: {
        current_question: questions[0],
        current_idx: 0,
        is_finish: false,
        total_questions: questions.length,
      },
    })
  } catch (error) {
    console.error('Coze question init error:', error)
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}
