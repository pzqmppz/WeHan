/**
 * 首页配置 API
 * GET /api/config/homepage - 获取首页配置（公开）
 * PUT /api/config/homepage - 更新首页配置（管理员）
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

// 默认首页配置
const DEFAULT_HOMEPAGE_CONFIG = {
  stats: {
    enterprises: 120,
    universities: 35,
    students: 15000,
    retentionRate: 68,
  },
  features: [
    {
      id: 'feature-1',
      icon: 'RocketOutlined',
      title: 'AI求职助手',
      description: '智能简历解析、AI模拟面试、个性化评估报告，提升求职竞争力',
      order: 1,
      enabled: true,
    },
    {
      id: 'feature-2',
      icon: 'BankOutlined',
      title: '本地岗位精准匹配',
      description: '汇聚武汉优质企业岗位，基于画像智能推荐，找到最适合你的工作',
      order: 2,
      enabled: true,
    },
    {
      id: 'feature-3',
      icon: 'HeartOutlined',
      title: '心理健康关怀',
      description: '求职焦虑疏导、情绪记录追踪，陪伴你度过求职季',
      order: 3,
      enabled: true,
    },
    {
      id: 'feature-4',
      icon: 'SafetyCertificateOutlined',
      title: '政策一键触达',
      description: '人才补贴、住房优惠、创业扶持，武汉人才政策一站掌握',
      order: 4,
      enabled: true,
    },
  ],
  footerLinks: {
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms',
    icpNumber: '',
  },
}

// 配置键名
const CONFIG_KEY = 'homepage_config'

// 验证 Schema
const HomepageConfigSchema = z.object({
  stats: z.object({
    enterprises: z.number().int().min(0),
    universities: z.number().int().min(0),
    students: z.number().int().min(0),
    retentionRate: z.number().min(0).max(100),
  }),
  features: z.array(
    z.object({
      id: z.string(),
      icon: z.string(),
      title: z.string().min(1).max(50),
      description: z.string().min(1).max(200),
      order: z.number().int().min(1),
      enabled: z.boolean(),
    })
  ).max(8),
  footerLinks: z.object({
    privacyPolicyUrl: z.string().max(500),
    termsOfServiceUrl: z.string().max(500),
    icpNumber: z.string().max(100).optional(),
  }),
})

/**
 * GET /api/config/homepage - 获取首页配置（公开接口）
 */
export async function GET() {
  try {
    const config = await prisma.portalConfig.findUnique({
      where: { key: CONFIG_KEY },
    })

    if (!config) {
      // 返回默认配置
      return NextResponse.json({
        success: true,
        data: DEFAULT_HOMEPAGE_CONFIG,
      })
    }

    // 合并默认配置（防止缺少字段）
    const mergedConfig = {
      ...DEFAULT_HOMEPAGE_CONFIG,
      ...(config.value as object),
    }

    return NextResponse.json({
      success: true,
      data: mergedConfig,
    })
  } catch (error) {
    console.error('Get homepage config error:', error)
    // 出错时返回默认配置，确保首页可用
    return NextResponse.json({
      success: true,
      data: DEFAULT_HOMEPAGE_CONFIG,
    })
  }
}

/**
 * PUT /api/config/homepage - 更新首页配置（管理员）
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string }).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const body = await request.json()

    // 验证输入
    const validationResult = HomepageConfigSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: '数据格式错误', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const validatedData = validationResult.data
    const now = new Date()

    // 更新或创建配置
    const config = await prisma.portalConfig.upsert({
      where: { key: CONFIG_KEY },
      update: {
        value: validatedData as Prisma.InputJsonValue,
        updatedAt: now,
      },
      create: {
        id: `config_homepage_${Date.now()}`,
        key: CONFIG_KEY,
        value: validatedData as Prisma.InputJsonValue,
        updatedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      data: config.value,
      message: '首页配置已保存',
    })
  } catch (error) {
    console.error('Update homepage config error:', error)
    const errorMessage = error instanceof Error ? error.message : '保存配置失败'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}
