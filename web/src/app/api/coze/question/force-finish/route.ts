/**
 * Coze 多轮问询 - 强制结束会话接口
 * POST /api/coze/question/force-finish
 *
 * 用于用户中途退出面试时，强制结束会话并返回已完成的数据
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
interface ForceFinishRequest {
  session_id: string
}

/**
 * POST /api/coze/question/force-finish
 *
 * 强制结束会话，返回已完成的问题和回答
 *
 * Request Body:
 * - session_id: Coze 会话 ID（必填）
 *
 * Response:
 * - code: 200
 * - data: { is_finish: true, questions, answers, unfinished_questions }
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
    const body: ForceFinishRequest = await request.json()
    const { session_id } = body

    // 3. 参数校验
    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { code: 400, msg: 'session_id 是必填项', data: null },
        { status: 400 }
      )
    }

    // 4. 查询会话
    const session = await prisma.cozeQuestionSession.findUnique({
      where: { sessionId: session_id },
    })

    if (!session) {
      return NextResponse.json(
        { code: 404, msg: '会话不存在', data: null },
        { status: 404 }
      )
    }

    // 5. 获取当前数据
    const allQuestions = session.questions as string[]
    const answers = session.answers as string[]
    const currentIdx = session.currentIdx

    // 6. 已完成的问题（已提问的）
    const finishedQuestions = allQuestions.slice(0, answers.length)

    // 7. 未完成的问题（尚未提问的）
    const unfinishedQuestions = allQuestions.slice(answers.length)

    // 8. 更新会话状态
    await prisma.cozeQuestionSession.update({
      where: { sessionId: session_id },
      data: {
        isFinish: true,
        updatedAt: new Date(),
      },
    })

    // 9. 返回结果
    return NextResponse.json({
      code: 200,
      msg: '会话已强制结束',
      data: {
        is_finish: true,
        questions: finishedQuestions,
        answers: answers,
        unfinished_questions: unfinishedQuestions,
        total_questions: allQuestions.length,
        completed_count: answers.length,
      },
    })
  } catch (error) {
    console.error('Coze question force-finish error:', error)
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}
