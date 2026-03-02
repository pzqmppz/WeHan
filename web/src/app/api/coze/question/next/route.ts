/**
 * Coze 多轮问询 - 记录回答并返回下一题接口
 * POST /api/coze/question/next
 *
 * 用于智能体调用，记录用户回答，返回下一个问题或完整数组
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
interface NextRequest {
  session_id: string
  answer: string
}

/**
 * POST /api/coze/question/next
 *
 * 记录用户回答，返回下一个问题或完整问答数组
 *
 * Request Body:
 * - session_id: Coze 会话 ID（必填）
 * - answer: 用户回答（必填）
 *
 * Response (未完成):
 * - code: 200
 * - data: { current_question, current_idx, is_finish: false }
 *
 * Response (已完成):
 * - code: 200
 * - msg: "all questions finished"
 * - data: { is_finish: true, questions, answers }
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
    const body: NextRequest = await request.json()
    const { session_id, answer } = body

    // 3. 参数校验
    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { code: 400, msg: 'session_id 是必填项', data: null },
        { status: 400 }
      )
    }

    if (typeof answer !== 'string') {
      return NextResponse.json(
        { code: 400, msg: 'answer 必须是字符串', data: null },
        { status: 400 }
      )
    }

    // 4. 查询会话
    const session = await prisma.cozeQuestionSession.findUnique({
      where: { sessionId: session_id },
    })

    if (!session) {
      return NextResponse.json(
        { code: 404, msg: '会话不存在，请先调用 init 接口', data: null },
        { status: 404 }
      )
    }

    // 5. 检查会话是否已完成
    if (session.isFinish) {
      return NextResponse.json(
        { code: 400, msg: '会话已结束', data: null },
        { status: 400 }
      )
    }

    // 6. 检查会话是否过期
    if (session.expiredAt < new Date()) {
      return NextResponse.json(
        { code: 410, msg: '会话已过期', data: null },
        { status: 410 }
      )
    }

    // 7. 获取当前数据
    const questions = session.questions as string[]
    const answers = session.answers as string[]
    const currentIdx = session.currentIdx

    // 8. 追加回答
    answers.push(answer)

    // 9. 计算下一题索引
    const nextIdx = currentIdx + 1

    // 10. 判断是否还有下一题
    if (nextIdx < questions.length) {
      // 还有下一题，更新会话并返回下一题
      await prisma.cozeQuestionSession.update({
        where: { sessionId: session_id },
        data: {
          answers: answers,
          currentIdx: nextIdx,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        code: 200,
        msg: 'success',
        data: {
          current_question: questions[nextIdx],
          current_idx: nextIdx,
          is_finish: false,
        },
      })
    } else {
      // 所有问题已完成，更新会话状态并返回完整数组
      await prisma.cozeQuestionSession.update({
        where: { sessionId: session_id },
        data: {
          answers: answers,
          currentIdx: nextIdx,
          isFinish: true,
          updatedAt: new Date(),
        },
      })

      return NextResponse.json({
        code: 200,
        msg: 'all questions finished',
        data: {
          is_finish: true,
          questions: questions,
          answers: answers,
        },
      })
    }
  } catch (error) {
    console.error('Coze question next error:', error)
    return NextResponse.json(
      { code: 500, msg: '服务器内部错误', data: null },
      { status: 500 }
    )
  }
}
