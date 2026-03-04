/**
 * 数据清理 API
 * POST /api/cleanup - 清理过期的面试数据（管理员专用）
 *
 * 清理规则：
 * - Interview 表：删除 15 天前的记录
 * - CozeQuestionSession 表：删除 15 天前的记录
 * - Conversation 表：删除 15 天前的记录
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'

// 数据保留天数
const RETENTION_DAYS = 15

// API 密钥验证（用于 cron 调用）
const CLEANUP_API_KEY = process.env.CLEANUP_API_KEY || 'wehan_cleanup_key_2026'

interface CleanupResult {
  table: string
  deleted: number
}

/**
 * POST /api/cleanup - 执行数据清理
 *
 * 认证方式：
 * 1. 管理员登录（通过 session）
 * 2. API 密钥（通过 X-Cleanup-Key header，用于 cron）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证权限：管理员登录 或 API 密钥
    const session = await auth()
    const isAdmin = session?.user && (session.user as { role?: string }).role === 'ADMIN'

    const cleanupKey = request.headers.get('X-Cleanup-Key')
    const isValidKey = cleanupKey === CLEANUP_API_KEY

    if (!isAdmin && !isValidKey) {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      )
    }

    // 计算截止日期
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)

    console.log(`[Cleanup] 开始清理 ${cutoffDate.toISOString()} 之前的数据`)

    const results: CleanupResult[] = []

    // 1. 清理 Interview 表
    const deletedInterviews = await prisma.interview.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    results.push({ table: 'Interview', deleted: deletedInterviews.count })

    // 2. 清理 CozeQuestionSession 表
    const deletedSessions = await prisma.cozeQuestionSession.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    results.push({ table: 'CozeQuestionSession', deleted: deletedSessions.count })

    // 3. 清理 Conversation 表（C 端对话）
    const deletedConversations = await prisma.conversation.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    results.push({ table: 'Conversation', deleted: deletedConversations.count })

    // 4. 清理 EmotionRecord 表（情绪记录）
    const deletedEmotions = await prisma.emotionRecord.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    })
    results.push({ table: 'EmotionRecord', deleted: deletedEmotions.count })

    const totalDeleted = results.reduce((sum, r) => sum + r.deleted, 0)

    console.log(`[Cleanup] 清理完成，共删除 ${totalDeleted} 条记录`)

    return NextResponse.json({
      success: true,
      message: `清理完成，共删除 ${totalDeleted} 条记录`,
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: RETENTION_DAYS,
      details: results,
    })
  } catch (error) {
    console.error('[Cleanup] 清理失败:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '清理失败',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/cleanup - 获取清理统计信息
 */
export async function GET(request: NextRequest) {
  try {
    // 验证权限
    const session = await auth()
    const isAdmin = session?.user && (session.user as { role?: string }).role === 'ADMIN'

    const cleanupKey = request.headers.get('X-Cleanup-Key')
    const isValidKey = cleanupKey === CLEANUP_API_KEY

    if (!isAdmin && !isValidKey) {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      )
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS)

    // 统计待清理数据量
    const stats = {
      cutoffDate: cutoffDate.toISOString(),
      retentionDays: RETENTION_DAYS,
      pendingCleanup: {
        interviews: await prisma.interview.count({
          where: { createdAt: { lt: cutoffDate } },
        }),
        sessions: await prisma.cozeQuestionSession.count({
          where: { createdAt: { lt: cutoffDate } },
        }),
        conversations: await prisma.conversation.count({
          where: { createdAt: { lt: cutoffDate } },
        }),
        emotionRecords: await prisma.emotionRecord.count({
          where: { createdAt: { lt: cutoffDate } },
        }),
      },
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error('[Cleanup] 获取统计失败:', error)
    return NextResponse.json(
      { success: false, error: '获取统计失败' },
      { status: 500 }
    )
  }
}
