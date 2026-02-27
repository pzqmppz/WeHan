import { NextRequest, NextResponse } from 'next/server'
import { jobService } from '@/services'
import { JobQuerySchema, CreateJobSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { ZodError } from 'zod'

// Note: getCurrentUser is defined in @/lib/auth and uses NextAuth's auth() function

/**
 * GET /api/jobs - 获取岗位列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // 验证并解析查询参数
    const query = JobQuerySchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
      industry: searchParams.get('industry') || undefined,
      location: searchParams.get('location') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      enterpriseId: searchParams.get('enterpriseId') || undefined,
    })

    const result = await jobService.getJobs(query)

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.pagination,
    })
  } catch (error) {
    console.error('Get jobs error:', error)

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

/**
 * POST /api/jobs - 创建岗位
 * 需要企业用户登录
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录状态
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    // 验证企业权限
    const enterpriseId = (user as any).enterpriseId
    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: '请先完善企业信息' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 验证输入，使用 session 中的 enterpriseId（安全）
    const validated = CreateJobSchema.parse({
      ...body,
      enterpriseId, // 覆盖客户端传递的值，防止伪造
    })

    // 调用 Service 创建岗位
    const result = await jobService.createJob(validated)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Create job error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '创建岗位失败' },
      { status: 500 }
    )
  }
}
