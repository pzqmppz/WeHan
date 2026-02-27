import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/services'
import { ApplicationQuerySchema, CreateApplicationSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { ZodError } from 'zod'

/**
 * GET /api/applications - 获取投递列表
 * 企业用户：查看投递到本企业的申请
 * 学生用户：查看自己的投递记录
 */
export async function GET(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)

    // 根据用户角色设置查询范围
    let queryOverrides: Record<string, string> = {}

    if (user.role === 'ENTERPRISE') {
      // 企业用户只能查看投递到本企业的申请
      const enterpriseId = (user as any).enterpriseId
      if (!enterpriseId) {
        return NextResponse.json(
          { success: false, error: '请先完善企业信息' },
          { status: 403 }
        )
      }
      queryOverrides.enterpriseId = enterpriseId
    } else if (user.role === 'STUDENT') {
      // 学生只能查看自己的投递记录
      queryOverrides.userId = user.id
    }
    // ADMIN 可以查看所有投递

    // 验证并解析查询参数
    const query = ApplicationQuerySchema.parse({
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
      status: searchParams.get('status') || undefined,
      ...queryOverrides,
      // 以下参数只对 ADMIN 开放
      ...(user.role === 'ADMIN' && {
        enterpriseId: searchParams.get('enterpriseId') || undefined,
        userId: searchParams.get('userId') || undefined,
        jobId: searchParams.get('jobId') || undefined,
      }),
    })

    const result = await applicationService.getApplications(query)

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.pagination,
    })
  } catch (error) {
    console.error('Get applications error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '获取投递列表失败' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/applications - 创建投递
 * 学生用户：投递岗位
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户登录
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      )
    }

    // 只有学生可以投递
    if (user.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: '只有学生可以投递岗位' },
        { status: 403 }
      )
    }

    const body = await request.json()

    // 强制使用当前用户ID，防止IDOR攻击
    const validated = CreateApplicationSchema.parse({
      ...body,
      userId: user.id, // 覆盖客户端传递的值
    })

    // 调用 Service 创建投递
    const result = await applicationService.createApplication(validated)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Create application error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败' },
        { status: 400 }
      )
    }

    // 业务错误（如已投递）
    if (error instanceof Error && error.message.includes('已投递')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '投递失败' },
      { status: 500 }
    )
  }
}
