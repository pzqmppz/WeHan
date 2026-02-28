/**
 * 开放 API - 会话管理
 * POST /api/open/conversations - 创建/保存会话
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
 * 会话请求体结构
 */
interface ConversationRequestBody {
  userId: string                    // C端用户ID（豆包user_id）-> 映射到 externalUserId
  conversationId: string            // Coze会话ID -> 映射到 cozeConversationId
  title?: string                    // 会话标题
  status?: string                   // 状态：active | finished | interrupted
  type?: string                     // 类型：interview | counseling | general | resume_parsing | job_matching
  sessionData?: any                 // 完整会话数据（messages, workflowStatus等）
}

/**
 * POST /api/open/conversations - 创建会话（供 C 端调用）
 *
 * Request Body:
 * - userId: C端用户ID（必填）
 * - conversationId: Coze会话ID（必填）
 * - title: 会话标题（可选）
 * - status: 状态（可选，默认active）
 * - type: 类型（可选）
 * - sessionData: 会话数据（可选）
 *
 * 字段映射:
 * - userId -> externalUserId
 * - conversationId -> cozeConversationId
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
    const body: ConversationRequestBody = await request.json()

    // 2. 参数验证
    if (!body.userId || !body.conversationId) {
      return NextResponse.json(
        { success: false, error: 'userId 和 conversationId 是必填字段' },
        { status: 400 }
      )
    }

    // 3. 检查 cozeConversationId 是否已存在
    const existingConversation = await prisma.conversation.findUnique({
      where: { cozeConversationId: body.conversationId },
    })

    if (existingConversation) {
      // 如果已存在，更新会话
      const updated = await prisma.conversation.update({
        where: { id: existingConversation.id },
        data: {
          title: body.title || existingConversation.title,
          status: body.status || existingConversation.status,
          type: body.type || existingConversation.type,
          sessionData: body.sessionData || existingConversation.sessionData,
        },
      })

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        },
      })
    }

    // 4. 创建新会话
    const conversation = await prisma.conversation.create({
      data: {
        id: cuid(),
        externalUserId: body.userId,         // 字段映射: userId -> externalUserId
        cozeConversationId: body.conversationId, // 字段映射
        title: body.title,
        status: body.status || 'active',
        type: body.type,
        sessionData: body.sessionData,
      },
    })

    // 5. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        id: conversation.id,
        createdAt: conversation.createdAt,
      },
    })
  } catch (error) {
    console.error('Open API - Create conversation error:', error)

    return NextResponse.json(
      { success: false, error: '创建会话失败' },
      { status: 500 }
    )
  }
}
