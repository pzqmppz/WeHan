import { NextRequest, NextResponse } from 'next/server'
import { jobService } from '@/services'
import { jobRepository } from '@/repositories'
import { UpdateJobSchema, IdSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { ZodError } from 'zod'

/**
 * 验证用户是否有权限操作该岗位
 * 检查岗位是否属于当前用户所在企业
 */
async function verifyJobOwnership(
  jobId: string,
  user: any
): Promise<{ authorized: boolean; job?: any; error?: string }> {
  try {
    const job = await jobRepository.findById(jobId)

    if (!job) {
      return { authorized: false, error: '岗位不存在' }
    }

    // 获取用户的企业ID
    const userEnterpriseId = user.enterpriseId

    // 管理员可以操作所有岗位
    if (user.role === 'ADMIN') {
      return { authorized: true, job }
    }

    // 验证岗位是否属于用户所在企业
    if (!userEnterpriseId || job.enterpriseId !== userEnterpriseId) {
      return { authorized: false, error: '无权操作此岗位' }
    }

    return { authorized: true, job }
  } catch (error) {
    return { authorized: false, error: '验证权限失败' }
  }
}

/**
 * GET /api/jobs/[id] - 获取岗位详情
 * 公开接口，无需认证
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 验证 ID
    const validatedId = IdSchema.parse(id)

    const result = await jobService.getJobById(validatedId)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Get job error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '无效的岗位ID' },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === '岗位不存在') {
      return NextResponse.json(
        { success: false, error: '岗位不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: '获取岗位详情失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/jobs/[id] - 更新岗位
 * 需要认证 + 所有权验证
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 验证用户登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // 2. 验证 ID
    const validatedId = IdSchema.parse(id)

    // 3. 验证岗位所有权
    const ownership = await verifyJobOwnership(validatedId, user)
    if (!ownership.authorized) {
      return NextResponse.json(
        { success: false, error: ownership.error || '无权操作此岗位' },
        { status: 403 }
      )
    }

    // 4. 验证输入
    const validated = UpdateJobSchema.partial().parse(body)

    // 5. 执行更新
    const result = await jobService.updateJob(validatedId, validated)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Update job error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === '岗位不存在') {
      return NextResponse.json(
        { success: false, error: '岗位不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: '更新岗位失败' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/jobs/[id] - 删除岗位
 * 需要认证 + 所有权验证
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 验证用户登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 2. 验证 ID
    const validatedId = IdSchema.parse(id)

    // 3. 验证岗位所有权
    const ownership = await verifyJobOwnership(validatedId, user)
    if (!ownership.authorized) {
      return NextResponse.json(
        { success: false, error: ownership.error || '无权操作此岗位' },
        { status: 403 }
      )
    }

    // 4. 执行删除
    await jobService.deleteJob(validatedId)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete job error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '无效的岗位ID' },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message === '岗位不存在') {
      return NextResponse.json(
        { success: false, error: '岗位不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: '删除岗位失败' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/jobs/[id] - 更新岗位状态（发布/下架）
 * 需要认证 + 所有权验证
 *
 * 支持两种调用方式：
 * 1. { action: 'publish' | 'close' } - 旧方式
 * 2. { status: 'PUBLISHED' | 'CLOSED' } - 新方式
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 验证用户登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // 2. 验证 ID
    const validatedId = IdSchema.parse(id)

    // 3. 验证岗位所有权
    const ownership = await verifyJobOwnership(validatedId, user)
    if (!ownership.authorized) {
      return NextResponse.json(
        { success: false, error: ownership.error || '无权操作此岗位' },
        { status: 403 }
      )
    }

    // 4. 执行状态更新（支持两种方式）
    const { action, status } = body
    let result

    // 优先使用 status 参数
    if (status === 'PUBLISHED') {
      result = await jobService.publishJob(validatedId)
    } else if (status === 'CLOSED') {
      result = await jobService.closeJob(validatedId)
    } else if (action === 'publish') {
      result = await jobService.publishJob(validatedId)
    } else if (action === 'close') {
      result = await jobService.closeJob(validatedId)
    } else {
      return NextResponse.json(
        { success: false, error: '无效的操作，请使用 action(publish/close) 或 status(PUBLISHED/CLOSED)' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Update job status error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '无效的岗位ID' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '操作失败' },
      { status: 500 }
    )
  }
}
