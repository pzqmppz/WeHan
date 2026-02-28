/**
 * 开放 API - 会话更新/详情
 * PUT /api/open/conversations/{id} - 更新会话
 * GET /api/open/conversations/{id} - 获取会话详情
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
 * 会话更新请求体结构
 */
interface ConversationUpdateBody {
  title?: string
  status?: string
  type?: string
  sessionData?: any
}

/**
 * PUT /api/open/conversations/{id} - 更新会话（供 C 端调用）
 *
 * Path Parameters:
 * - id: 数据库会话ID
 *
 * Request Body:
 * - title: 会话标题（可选）
 * - status: 状态（可选）
 * - type: 类型（可选）
 * - sessionData: 会话数据（可选）
 */
export async function PUT(
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
    const body: ConversationUpdateBody = await request.json()

    // 2. 检查会话是否存在
    const existing = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    // 3. 更新会话
    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        title: body.title,
        status: body.status,
        type: body.type,
        sessionData: body.sessionData,
      },
    })

    // 4. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        updatedAt: updated.updatedAt,
      },
    })
  } catch (error) {
    console.error('Open API - Update conversation error:', error)

    return NextResponse.json(
      { success: false, error: '更新会话失败' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/open/conversations/{id} - 获取会话详情（供 C 端调用）
 *
 * Path Parameters:
 * - id: 数据库会话ID
 *
 * Query Parameters:
 * - userId: C端用户ID（用于权限校验，可选）
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
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // 2. 查询会话
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    })

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: '会话不存在' },
        { status: 404 }
      )
    }

    // 3. 权限校验（如果提供了 userId）
    if (userId && conversation.externalUserId !== userId) {
      return NextResponse.json(
        { success: false, error: '无权访问此会话' },
        { status: 403 }
      )
    }

    // 4. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        id: conversation.id,
        conversationId: conversation.cozeConversationId,
        title: conversation.title,
        status: conversation.status,
        type: conversation.type,
        sessionData: conversation.sessionData,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
      },
    })
  } catch (error) {
    console.error('Open API - Get conversation error:', error)

    return NextResponse.json(
      { success: false, error: '获取会话失败' },
      { status: 500 }
    )
  }
}
