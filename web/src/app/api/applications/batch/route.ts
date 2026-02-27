import { NextRequest, NextResponse } from 'next/server'
import { applicationService } from '@/services'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const BatchUpdateSchema = z.object({
  ids: z.array(z.string()).min(1, '请选择至少一条记录').max(100, '单次最多操作100条记录'),
  action: z.enum(['viewed', 'interviewing', 'offered', 'rejected']),
  notes: z.string().max(500, '备注不能超过500字').optional(),
})

const ACTION_TO_STATUS: Record<string, string> = {
  viewed: 'VIEWED',
  interviewing: 'INTERVIEWING',
  offered: 'OFFERED',
  rejected: 'REJECTED',
}

/**
 * POST /api/applications/batch - 批量更新投递状态
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

    // 验证企业权限
    const enterpriseId = (user as any).enterpriseId
    if (!enterpriseId) {
      return NextResponse.json(
        { success: false, error: '无权操作' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validated = BatchUpdateSchema.parse(body)

    const status = ACTION_TO_STATUS[validated.action]

    // 批量更新（service 层会验证所有权）
    const result = await applicationService.batchUpdateStatus(
      validated.ids,
      status,
      enterpriseId,
      validated.notes
    )

    return NextResponse.json({
      success: true,
      data: result.data,
    })
  } catch (error) {
    console.error('Batch update applications error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败' },
        { status: 400 }
      )
    }

    if (error instanceof Error && error.message.includes('无权')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { success: false, error: '批量更新失败' },
      { status: 500 }
    )
  }
}
