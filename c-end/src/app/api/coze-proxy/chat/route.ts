/**
 * Coze SSE 流式对话代理
 * POST /api/coze-proxy/chat
 *
 * 代理前端请求到 Coze API，返回 SSE 流式响应
 */

import { NextRequest } from 'next/server'
import { checkRateLimit, CHAT_RATE_LIMIT } from '@/lib/rateLimiter'
import type { ChatApiRequest } from '@/types/chat'

const COZE_API_URL = 'https://api.coze.cn/v3/chat'

/**
 * 验证请求参数
 */
function validateRequest(body: unknown): {
  valid: boolean
  error?: string
  data?: ChatApiRequest
} {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Invalid request body' }
  }

  const { message, conversationId, userId } = body as Record<string, unknown>

  if (typeof message !== 'string' || message.trim().length === 0) {
    return { valid: false, error: 'message is required' }
  }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return { valid: false, error: 'userId is required' }
  }

  return {
    valid: true,
    data: {
      message: message.trim(),
      conversationId:
        typeof conversationId === 'string' ? conversationId : undefined,
      userId,
    },
  }
}

/**
 * POST /api/coze-proxy/chat
 *
 * SSE 流式对话代理
 *
 * Request Body:
 * - message: 用户消息 (必填)
 * - conversationId: 会话 ID (可选，首次对话不传)
 * - userId: 用户 ID (必填)
 *
 * Response: SSE 流
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json()

    // 2. 验证参数
    const validation = validateRequest(body)
    if (!validation.valid) {
      return new Response(JSON.stringify({ error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const { message, conversationId, userId } = validation.data!

    // 3. 限流检查
    const rateLimitResult = checkRateLimit(userId, CHAT_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(
              Math.ceil((rateLimitResult.retryAfter || 60000) / 1000)
            ),
          },
        }
      )
    }

    // 4. 检查环境变量
    const accessToken = process.env.COZE_ACCESS_TOKEN
    const botId = process.env.COZE_BOT_ID

    if (!accessToken || !botId) {
      console.error('Coze API credentials not configured')
      return new Response(JSON.stringify({ error: 'Service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 5. 构建请求体
    const cozeRequestBody = {
      bot_id: botId,
      user_id: userId,
      stream: true,
      conversation_id: conversationId || undefined,
      auto_save_history: true,
      additional_messages: [
        {
          role: 'user',
          content: message,
          content_type: 'text',
        },
      ],
    }

    // 6. 调用 Coze API
    const response = await fetch(COZE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cozeRequestBody),
    })

    // 7. 检查响应状态
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Coze API error:', response.status, errorText)
      return new Response(
        JSON.stringify({
          error: 'Coze API error',
          status: response.status,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 8. 返回 SSE 流
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.resetAt),
      },
    })
  } catch (error) {
    console.error('Chat proxy error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
