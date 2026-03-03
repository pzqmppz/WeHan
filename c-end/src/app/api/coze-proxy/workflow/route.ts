/**
 * Coze 工作流代理
 * POST /api/coze-proxy/workflow
 *
 * 代理前端请求到 Coze Workflow API
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, WORKFLOW_RATE_LIMIT } from '@/lib/rateLimiter'
import {
  buildWorkflowRequest,
  validateWorkflowConfig,
  parseWorkflowResponse,
} from '@/lib/coze/workflows'
import type {
  WorkflowType,
  WorkflowApiRequest,
  WorkflowResponse,
} from '@/types/chat'

const COZE_WORKFLOW_URL = 'https://api.coze.cn/v1/workflow/run'

/**
 * 验证请求参数
 */
function validateRequest(body: unknown): {
  valid: boolean
  error?: string
  data?: WorkflowApiRequest
} {
  if (typeof body !== 'object' || body === null) {
    return { valid: false, error: 'Invalid request body' }
  }

  const { workflowType, parameters, userId } = body as Record<string, unknown>

  if (
    typeof workflowType !== 'string' ||
    !['generate_questions', 'interview_next', 'evaluate', 'force_finish'].includes(workflowType)
  ) {
    return { valid: false, error: 'Invalid workflowType' }
  }

  if (typeof parameters !== 'object' || parameters === null) {
    return { valid: false, error: 'parameters is required' }
  }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    return { valid: false, error: 'userId is required' }
  }

  return {
    valid: true,
    data: {
      workflowType: workflowType as WorkflowType,
      parameters: parameters as Record<string, unknown>,
      userId,
    } as WorkflowApiRequest & { userId: string },
  }
}

/**
 * POST /api/coze-proxy/workflow
 *
 * 工作流代理
 *
 * Request Body:
 * - workflowType: 工作流类型 (必填)
 * - parameters: 工作流参数 (必填)
 * - userId: 用户 ID (必填)
 *
 * Response:
 * - success: boolean
 * - data: 工作流返回数据
 * - error?: 错误信息
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 解析请求体
    const body = await request.json()

    // 2. 验证参数
    const validation = validateRequest(body)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      )
    }

    const { workflowType, parameters, userId } = validation.data! as WorkflowApiRequest & { userId: string }

    // 3. 限流检查
    const rateLimitResult = checkRateLimit(userId, WORKFLOW_RATE_LIMIT)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      )
    }

    // 4. 检查工作流配置
    const configStatus = validateWorkflowConfig()
    if (!configStatus.valid) {
      console.error('Missing workflow config:', configStatus.missing)
      return NextResponse.json(
        { success: false, error: 'Workflow not configured' },
        { status: 500 }
      )
    }

    // 5. 检查环境变量
    const accessToken = process.env.COZE_ACCESS_TOKEN
    if (!accessToken) {
      console.error('COZE_ACCESS_TOKEN not configured')
      return NextResponse.json(
        { success: false, error: 'Service not configured' },
        { status: 500 }
      )
    }

    // 6. 构建工作流请求
    const workflowRequest = buildWorkflowRequest(workflowType, parameters)

    // 7. 调用 Coze Workflow API
    const response = await fetch(COZE_WORKFLOW_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workflowRequest),
    })

    // 8. 解析响应
    const result: WorkflowResponse = await response.json()

    if (!response.ok) {
      console.error('Coze Workflow API error:', response.status, result)
      return NextResponse.json(
        {
          success: false,
          error: result.msg || 'Workflow API error',
          code: result.code,
        },
        { status: response.status }
      )
    }

    // 9. 解析并返回结果
    const parsed = parseWorkflowResponse(result)

    return NextResponse.json({
      success: parsed.success,
      data: parsed.data,
      error: parsed.error,
    })
  } catch (error) {
    console.error('Workflow proxy error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
