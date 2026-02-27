import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/services'
import { applicationRepository } from '@/repositories'
import { UpdateApplicationStatusSchema, IdSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { ZodError } from 'zod'

/**
 * 验证用户是否有权限操作该投递记录
 */
async function verifyApplicationOwnership(
  applicationId: string,
  user: any
): Promise<{ authorized: boolean; application?: any; error?: string }> {
  try {
    const application = await applicationRepository.findById(applicationId)

    if (!application) {
      return { authorized: false, error: '投递记录不存在' }
    }

    // 企业用户：验证岗位是否属于该企业
    if (user.role === 'ENTERPRISE' && user.enterpriseId) {
      if (application.job?.enterprise?.id !== user.enterpriseId) {
        return { authorized: false, error: '无权操作此投递记录' }
      }
    }

    // 求职者：验证是否是自己的投递
    if (user.role === 'STUDENT') {
      if (application.userId !== user.id) {
        return { authorized: false, error: '无权操作此投递记录' }
      }
    }

    return { authorized: true, application }
  } catch (error) {
    return { authorized: false, error: '验证权限失败' }
  }
}

/**
 * GET /api/applications/[id] - 获取投递详情
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params

    // 验证 ID
    const validatedId = IdSchema.parse(id)

    // 验证权限
    const ownership = await verifyApplicationOwnership(validatedId, user)
    if (!ownership.authorized) {
      return NextResponse.json(
        { success: false, error: ownership.error || '无权访问' },
        { status: 403 }
      )
    }

    const result = await applicationService.getApplicationById(validatedId)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Get application error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '无效的投递ID' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '获取投递详情失败' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/applications/[id] - 更新投递状态
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 验证用户登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // 验证 ID
    const validatedId = IdSchema.parse(id)

    // 验证权限
    const ownership = await verifyApplicationOwnership(validatedId, user)
    if (!ownership.authorized) {
      return NextResponse.json(
        { success: false, error: ownership.error || '无权操作' },
        { status: 403 }
      )
    }

    // 验证输入
    const validated = UpdateApplicationStatusSchema.parse(body)

    // 更新状态
    const result = await applicationService.updateStatus(validatedId, validated)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Update application error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '更新失败' },
      { status: 500 }
    )
  }
}
