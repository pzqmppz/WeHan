import { NextRequest, NextResponse } from 'next/server'
import { talentService } from '@/services'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

const TalentQuerySchema = z.object({
  keyword: z.string().max(100).optional(),
  skills: z.array(z.string().max(50)).max(20).optional(),
  education: z.string().max(50).optional(),
  status: z.enum(['PENDING', 'VIEWED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN']).optional(),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

/**
 * GET /api/talent - 获取企业人才库列表
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

    const { searchParams } = new URL(request.url)

    // 验证输入
    const validated = TalentQuerySchema.parse({
      keyword: searchParams.get('keyword') || undefined,
      skills: searchParams.get('skills')?.split(',').filter(Boolean) || undefined,
      education: searchParams.get('education') || undefined,
      status: searchParams.get('status') || undefined,
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '10',
    })

    const result = await talentService.getTalents({
      enterpriseId,
      ...validated,
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.pagination,
    })
  } catch (error) {
    console.error('Get talents error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: '参数验证失败' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: '获取人才库失败' },
      { status: 500 }
    )
  }
}
