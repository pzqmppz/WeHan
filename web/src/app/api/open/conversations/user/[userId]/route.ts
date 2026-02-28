/**
 * 开放 API - 用户会话列表
 * GET /api/open/conversations/user/{userId}
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
 * GET /api/open/conversations/user/{userId} - 获取用户会话列表（供 C 端调用）
 *
 * Path Parameters:
 * - userId: C端用户ID（豆包user_id）
 *
 * Query Parameters:
 * - status: 状态筛选（可选）
 * - type: 类型筛选（可选）
 * - limit: 返回数量（可选，默认20）
 *
 * 字段映射:
 * - 查询时用 externalUserId 匹配 userId
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
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
    const { userId } = await params
    const { searchParams } = new URL(request.url)

    // 2. 解析查询参数
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // 3. 构建查询条件
    const where: any = {
      externalUserId: userId,  // 字段映射: userId -> externalUserId
    }

    if (status) {
      where.status = status
    }
    if (type) {
      where.type = type
    }

    // 4. 查询会话列表
    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    })

    // 5. 格式化返回数据
    const formattedData = conversations.map(conv => ({
      id: conv.id,
      conversationId: conv.cozeConversationId,
      title: conv.title,
      status: conv.status,
      type: conv.type,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
    })
  } catch (error) {
    console.error('Open API - Get user conversations error:', error)

    return NextResponse.json(
      { success: false, error: '获取会话列表失败' },
      { status: 500 }
    )
  }
}
