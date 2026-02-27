import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/services'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/applications/statistics - 获取投递统计
 * 企业用户获取自己企业的投递统计
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
    const enterpriseId = searchParams.get('enterpriseId')

    // 验证企业权限
    if (user.role === 'ENTERPRISE') {
      const userEnterpriseId = (user as any).enterpriseId

      if (!userEnterpriseId) {
        return NextResponse.json(
          { success: false, error: '请先完善企业信息' },
          { status: 403 }
        )
      }

      // 只能查看自己企业的统计
      if (enterpriseId && enterpriseId !== userEnterpriseId) {
        return NextResponse.json(
          { success: false, error: '无权查看此企业统计' },
          { status: 403 }
        )
      }

      const result = await applicationService.getEnterpriseStatistics(userEnterpriseId)

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    // 管理员可以查看任意企业统计
    if (user.role === 'ADMIN' && enterpriseId) {
      const result = await applicationService.getEnterpriseStatistics(enterpriseId)

      return NextResponse.json({
        success: true,
        data: result.data,
      })
    }

    return NextResponse.json(
      { success: false, error: '无权访问' },
      { status: 403 }
    )
  } catch (error) {
    console.error('Get application statistics error:', error)

    return NextResponse.json(
      { success: false, error: '获取统计失败' },
      { status: 500 }
    )
  }
}
