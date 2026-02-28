/**
 * 企业信息 API
 * GET: 获取当前用户的企业信息
 * PUT: 更新企业信息
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 获取企业信息
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { Enterprise: true },
    })

    if (!user || !user.Enterprise) {
      return NextResponse.json(
        { success: false, error: '企业信息不存在' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: user.Enterprise,
    })
  } catch (error) {
    console.error('Get enterprise error:', error)
    return NextResponse.json(
      { success: false, error: '获取企业信息失败' },
      { status: 500 }
    )
  }
}

// 更新企业信息
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      include: { Enterprise: true },
    })

    if (!user || !user.Enterprise) {
      return NextResponse.json(
        { success: false, error: '企业信息不存在' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const {
      name,
      logo,
      industry,
      scale,
      description,
      address,
      contactName,
      contactPhone,
      contactEmail,
      businessLicense,
    } = body

    // 验证必填字段
    if (!name || !industry || !scale) {
      return NextResponse.json(
        { success: false, error: '企业名称、行业和规模为必填项' },
        { status: 400 }
      )
    }

    const updatedEnterprise = await prisma.enterprise.update({
      where: { id: user.Enterprise.id },
      data: {
        name,
        logo,
        industry,
        scale,
        description,
        address,
        contactName,
        contactPhone,
        contactEmail,
        businessLicense,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedEnterprise,
      message: '企业信息更新成功',
    })
  } catch (error) {
    console.error('Update enterprise error:', error)
    return NextResponse.json(
      { success: false, error: '更新企业信息失败' },
      { status: 500 }
    )
  }
}
