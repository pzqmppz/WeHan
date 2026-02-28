/**
 * 开放 API - 简历保存
 * POST /api/open/resumes
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import cuid from 'cuid'

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
 * 简历保存请求体结构
 */
interface ResumeRequestBody {
  userId: string                    // C端用户ID（豆包user_id）-> 映射到 externalUserId
  resumeText?: string               // 原始简历文本
  structuredData?: {
    name?: string
    phone?: string
    email?: string
    education?: any
    experiences?: any
    projects?: any
    skills?: string[]
    certifications?: any
    awards?: any
  }
  fileId?: string                   // Coze文件ID（可选，忽略）
}

/**
 * POST /api/open/resumes - 保存/更新简历（供 C 端调用）
 *
 * Request Body:
 * - userId: C端用户ID（必填）
 * - resumeText: 原始简历文本
 * - structuredData: 结构化数据（拆分存储）
 * - fileId: Coze文件ID（可选，忽略）
 *
 * 字段映射:
 * - userId -> externalUserId
 * - structuredData.* -> 各独立字段
 */
export async function POST(request: NextRequest) {
  // 1. API Key 验证
  const auth = validateApiKey(request)
  if (!auth.valid) {
    return NextResponse.json(
      { success: false, error: auth.error || '未授权访问' },
      { status: 401 }
    )
  }

  try {
    const body: ResumeRequestBody = await request.json()

    // 2. 参数验证
    if (!body.userId) {
      return NextResponse.json(
        { success: false, error: 'userId 是必填字段' },
        { status: 400 }
      )
    }

    const { userId, resumeText, structuredData } = body
    const now = new Date()

    // 3. 查询用户是否已有简历（通过 externalUserId 查询）
    const existingResume = await prisma.resume.findFirst({
      where: { externalUserId: userId },
    })

    // 4. 准备简历数据（拆分 structuredData）
    const resumeData = {
      externalUserId: userId,           // 字段映射: userId -> externalUserId
      resumeText: resumeText,
      name: structuredData?.name,
      phone: structuredData?.phone,
      email: structuredData?.email,
      education: structuredData?.education,
      experiences: structuredData?.experiences,
      projects: structuredData?.projects,
      skills: structuredData?.skills || [],
      certifications: structuredData?.certifications,
      awards: structuredData?.awards,
      updatedAt: now,
    }

    let resume

    if (existingResume) {
      // 更新现有简历
      resume = await prisma.resume.update({
        where: { id: existingResume.id },
        data: resumeData,
      })
    } else {
      // 创建新简历
      resume = await prisma.resume.create({
        data: {
          id: cuid(),
          ...resumeData,
          createdAt: now,
        },
      })
    }

    // 5. 返回结果
    return NextResponse.json({
      success: true,
      data: {
        id: resume.id,
        userId: userId,                  // 返回时用 C 端熟悉的字段名
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      },
    })
  } catch (error) {
    console.error('Open API - Save resume error:', error)

    return NextResponse.json(
      { success: false, error: '保存简历失败' },
      { status: 500 }
    )
  }
}
