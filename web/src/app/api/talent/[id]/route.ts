import { NextRequest, NextResponse } from 'next/server'
import { talentService } from '@/services'
import { getCurrentUser } from '@/lib/auth'
import { IdSchema } from '@/lib/validators'
import { z } from 'zod'

/**
 * GET /api/talent/[id] - 获取人才详情
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

    // 验证企业权限
    const enterpriseId = (user as any).enterpriseId
    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: '无权访问' },
        { status: 403 }
      )
    }

    const { id } = await params

    // 验证 ID 格式
    const userId = IdSchema.parse(id)

    const result = await talentService.getTalentById(userId, enterpriseId)

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Get talent error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: '无效的ID格式' },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('不存在')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, error: '获取人才详情失败' },
      { status: 500 }
    )
  }
}
