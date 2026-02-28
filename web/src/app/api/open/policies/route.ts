/**
 * 开放 API - 政策列表
 * GET /api/open/policies
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
 * 政策类型映射（中文 -> 枚举值）
 */
const policyTypeMap: Record<string, string> = {
  '人才引进': 'TALENT',
  '创业扶持': 'ENTREPRENEUR',
  '住房保障': 'HOUSING',
  '就业补贴': 'SUBSIDY',
  '其他': 'OTHER',
}

/**
 * GET /api/open/policies - 获取政策列表（供 C 端调用）
 *
 * Query Parameters:
 * - category: 政策分类（可选：人才引进/创业扶持/住房保障/就业补贴）
 * - keyword: 关键词搜索（可选）
 * - limit: 返回数量（可选，默认10，最大50）
 * - offset: 分页偏移（可选，默认0）
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

    // 2. 解析查询参数
    const category = searchParams.get('category')
    const keyword = searchParams.get('keyword')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')

    // 3. 构建查询条件
    const where: any = {
      isActive: true,
    }

    if (category && policyTypeMap[category]) {
      where.type = policyTypeMap[category]
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { summary: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    // 4. 查询政策列表
    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        select: {
          id: true,
          title: true,
          type: true,
          summary: true,
          content: true,
          conditions: true,
          benefits: true,
          effectiveDate: true,
          expiryDate: true,
          createdAt: true,
        },
        orderBy: {
          effectiveDate: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.policy.count({ where }),
    ])

    // 5. 格式化返回数据
    const formattedData = policies.map(policy => ({
      id: policy.id,
      title: policy.title,
      category: policy.type,
      summary: policy.summary,
      content: policy.content,
      conditions: policy.conditions,
      benefits: policy.benefits,
      effectiveDate: policy.effectiveDate,
      expiryDate: policy.expiryDate,
      createdAt: policy.createdAt,
    }))

    return NextResponse.json({
      success: true,
      data: formattedData,
      meta: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Open API - Get policies error:', error)

    return NextResponse.json(
      { success: false, error: '获取政策列表失败' },
      { status: 500 }
    )
  }
}
