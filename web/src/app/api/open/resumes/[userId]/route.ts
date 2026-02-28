/**
 * 开放 API - 简历查询
 * GET /api/open/resumes/{userId}
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * 验证 API Key
 */
function validateApiKey(request: NextRequest): { valid: boolean; error?: string } {
  const apiKey = request.headers.get('X-API-Key')
  const expectedKey = process.env.OPEN_API_KEY

  if (!expectedKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: OPEN_API_KEY not configured in production')
      return { valid: false, error: '服务配置错误' }
    }
    console.warn('OPEN_API_KEY not configured, skipping validation (dev only)')
    return { valid: true }
  }

  if (!apiKey || apiKey !== expectedKey) {
    return { valid: false, error: '无效的 API Key' }
  }

  return { valid: true }
}

/**
 * GET /api/open/resumes/{userId} - 获取用户简历（供 C 端调用）
 *
 * Path Parameters:
 * - userId: C端用户ID（豆包user_id）
 *
 * 字段映射:
 * - 查询时用 externalUserId 匹配 userId
 * - 返回时组装 structuredData
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  // 1. API Key 验证
  const auth = validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error || '未授权访问' },
      { status: 401 }
    )
  }

  try {
    const { userId } = await params

    // 2. 通过 externalUserId 查询简历
    const resume = await prisma.resume.findFirst({
      where: { externalUserId: userId },
    })

    // 3. 简历不存在
    if (!resume) {
      return NextResponse.json(
        { success: false, error: '简历不存在' },
        { status: 404 }
      )
    }

    // 4. 组装响应数据（将分散字段组装成 structuredData）
    const responseData = {
      id: resume.id,
      resumeText: resume.resumeText,
      // 组装 structuredData
      structuredData: {
        name: resume.name,
        phone: resume.phone,
        email: resume.email,
        education: resume.education,
        experiences: resume.experiences,
        projects: resume.projects,
        skills: resume.skills,
        certifications: resume.certifications,
        awards: resume.awards,
      },
      updatedAt: resume.updatedAt,
      createdAt: resume.createdAt,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (error) {
    console.error('Open API - Get resume error:', error)

    return NextResponse.json(
      { success: false, error: '获取简历失败' },
      { status: 500 }
    )
  }
}
