/**
 * 政策详情 API
 * GET /api/policies/[id] - 获取政策详情
 * PATCH /api/policies/[id] - 更新政策
 * DELETE /api/policies/[id] - 删除政策
 */

import { NextRequest, NextResponse } from 'next/server'
import { policyService } from '@/services/policy.service'
import { auth } from '@/app/api/auth/[...nextauth]/route'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const result = await policyService.getPolicyById(id)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Get policy error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '获取政策失败' },
      { status: error.message === '政策不存在' ? 404 : 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'GOVERNMENT' && userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()

    // 处理状态切换
    if (body.action === 'publish') {
      const result = await policyService.publishPolicy(id)
      return NextResponse.json({ success: true, data: result.data })
    }

    if (body.action === 'unpublish') {
      const result = await policyService.unpublishPolicy(id)
      return NextResponse.json({ success: true, data: result.data })
    }

    // 普通更新
    const result = await policyService.updatePolicy(id, body)
    return NextResponse.json({ success: true, data: result.data })
  } catch (error: any) {
    console.error('Update policy error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '更新政策失败' },
      { status: error.message === '政策不存在' ? 404 : 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ success: false, error: '未登录' }, { status: 401 })
    }

    const userRole = (session.user as any).role
    if (userRole !== 'GOVERNMENT' && userRole !== 'ADMIN') {
      return NextResponse.json({ success: false, error: '无权限' }, { status: 403 })
    }

    const { id } = await params
    await policyService.deletePolicy(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete policy error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '删除政策失败' },
      { status: error.message === '政策不存在' ? 404 : 500 }
    )
  }
}
