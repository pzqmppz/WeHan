import { NextRequest, NextResponse } from 'next/server'
import { talentService } from '@/services'
import { getCurrentUser } from '@/lib/auth'

/**
 * GET /api/talent/statistics - 获取企业人才库统计
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

    // 验证企业权限
    const enterpriseId = (user as any).enterpriseId
    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: '无权访问' },
        { status: 403 }
      )
    }

    const result = await talentService.getStatistics(enterpriseId)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Get talent statistics error:', error)

    return NextResponse.json(
      { success: false, error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}
