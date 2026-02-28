/**
 * 系统配置 API
 * GET /api/config - 获取系统配置
 * PUT /api/config - 更新系统配置
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 默认配置
const DEFAULT_CONFIG = {
  siteName: '才聚江城',
  siteDescription: '武汉人才留汉智能服务平台',
  contactEmail: 'contact@wehan.com',
  contactPhone: '027-12345678',
  icpNumber: '',
}

// 配置键名
const CONFIG_KEY = 'system_settings'

/**
 * GET /api/config - 获取系统配置
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
        data: DEFAULT_CONFIG,
      })
    }

    return NextResponse.json({
      success: true,
      data: { ...DEFAULT_CONFIG, ...(config.value as object) },
    })
  } catch (error) {
    console.error('Get config error:', error)
    return NextResponse.json(
      { success: false, error: '获取配置失败' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/config - 更新系统配置
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const body = await request.json()
    const { siteName, siteDescription, contactEmail, contactPhone, icpNumber } = body
    const now = new Date()

    // 更新或创建配置
    const config = await prisma.portalConfig.upsert({
      where: { key: CONFIG_KEY },
      update: {
        value: {
          siteName,
          siteDescription,
          contactEmail,
          contactPhone,
          icpNumber,
        },
        updatedAt: now,
      },
      create: {
        id: `config_${Date.now()}`,
        key: CONFIG_KEY,
        value: {
          siteName,
          siteDescription,
          contactEmail,
          contactPhone,
          icpNumber,
        },
        updatedAt: now,
      },
    })

    return NextResponse.json({
      success: true,
      data: config.value,
    })
  } catch (error) {
    console.error('Update config error:', error)
    return NextResponse.json(
      { success: false, error: '保存配置失败' },
      { status: 500 }
    )
  }
}
