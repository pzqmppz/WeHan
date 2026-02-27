/**
 * 开放 API - 供 C 端（扣子平台）调用
 * 使用 API Key 验证
 */

import { NextRequest, NextResponse } from 'next/server'
import { jobService } from '@/services'
import { JobQuerySchema } from '@/lib/validators'
import { ZodError } from 'zod'

/**
 * 验证 API Key
 * 生产环境必须配置 OPEN_API_KEY
 */
function validateApiKey(request: NextRequest): { valid: boolean; error?: string } {
  const apiKey = request.headers.get('X-API-Key')
  const expectedKey = process.env.OPEN_API_KEY

  // 生产环境必须配置 API Key
  if (!expectedKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: OPEN_API_KEY not configured in production')
      return { valid: false, error: '服务配置错误' }
    }
    // 仅开发环境允许跳过
    console.warn('OPEN_API_KEY not configured, skipping validation (dev only)')
    return { valid: true }
  }

  if (!apiKey || apiKey !== expectedKey) {
    return { valid: false, error: '无效的 API Key' }
  }

  return { valid: true }
}

/**
 * GET /api/open/jobs - 获取岗位列表（供 C 端调用）
 *
 * Query Parameters:
 * - page: 页码 (默认 1)
 * - pageSize: 每页数量 (默认 20, 最大 50)
 * - industry: 行业筛选
 * - location: 地点筛选
 * - keyword: 关键词搜索
 *
 * Headers:
 * - X-API-Key: API 密钥
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

    // 限制最大页面大小，防止滥用
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || '20'),
      50
    )

    // 验证并解析查询参数
    const query = JobQuerySchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: pageSize.toString(),
      industry: searchParams.get('industry') || undefined,
      location: searchParams.get('location') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      status: 'PUBLISHED', // 开放 API 只返回已发布的岗位
    })

    const result = await jobService.getJobs(query)

    // 过滤敏感字段，只返回必要信息
    const filteredData = result.data.map(job => ({
      id: job.id,
      title: job.title,
      industry: job.industry,
      category: job.category,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      benefits: job.benefits,
      skills: job.skills,
      educationLevel: job.educationLevel,
      experienceYears: job.experienceYears,
      freshGraduate: job.freshGraduate,
      headcount: job.headcount,
      publishedAt: job.publishedAt,
      // 不返回 enterpriseId 等敏感信息
      enterprise: job.Enterprise ? {
        id: job.Enterprise.id,
        name: job.Enterprise.name,
        industry: job.Enterprise.industry,
      } : null,
    }))

    return NextResponse.json({
      success: true,
      data: filteredData,
      meta: result.pagination,
    })
  } catch (error) {
    console.error('Open API - Get jobs error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '获取岗位列表失败' },
      { status: 500 }
    )
  }
}
