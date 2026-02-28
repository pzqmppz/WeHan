/**
 * 企业仪表盘 API
 * 获取企业端首页统计数据
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/app/api/auth/[...nextauth]/route'

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
      include: { enterprise: true },
    })

    if (!user || !user.enterprise) {
      return NextResponse.json(
        { success: false, error: '企业信息不存在' },
        { status: 404 }
      )
    }

    const enterpriseId = user.enterprise.id
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 获取统计数据
    const [
      todayApplicationsCount,
      pendingResumesCount,
      todayInterviewsCount,
      hiredCount,
      recentApplicationsData,
      hotJobsData,
    ] = await Promise.all([
      // 今日新增投递
      prisma.application.count({
        where: {
          job: { enterpriseId },
          createdAt: { gte: today },
        },
      }),

      // 待处理简历
      prisma.application.count({
        where: {
          job: { enterpriseId },
          status: 'PENDING',
        },
      }),

      // 今日面试（基于 Interview 表）
      prisma.interview.count({
        where: {
          application: {
            job: { enterpriseId },
          },
          createdAt: { gte: today },
        },
      }),

      // 已录用
      prisma.application.count({
        where: {
          job: { enterpriseId },
          status: 'OFFERED',
        },
      }),

      // 最新投递（最近5条）
      prisma.application.findMany({
        where: {
          job: { enterpriseId },
        },
        include: {
          user: {
            include: {
              resume: true,
            },
          },
          job: {
            select: { title: true },
          },
          interview: {
            select: { totalScore: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // 热门岗位（按投递数排序，只显示已发布的）
      prisma.job.findMany({
        where: { enterpriseId, status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          _count: {
            select: { applications: true },
          },
        },
        orderBy: {
          applications: { _count: 'desc' },
        },
        take: 5,
      }),
    ])

    // 格式化最新投递数据
    const recentApplications = recentApplicationsData.map(app => {
      const timeAgo = getTimeAgo(app.createdAt)
      // resume 是数组，取第一个
      const resumes = app.user?.resume as any[] || []
      const resume = resumes[0]
      return {
        id: app.id,
        name: app.user?.name || '未知用户',
        position: app.job.title,
        school: resume?.education
          ? getSchoolFromEducation(resume.education)
          : '未知学校',
        score: app.interview?.totalScore
          ? Math.round(app.interview.totalScore)
          : null,
        time: timeAgo,
      }
    })

    // 格式化热门岗位数据
    const hotJobs = hotJobsData.map(job => ({
      id: job.id,
      title: job.title,
      applications: job._count.applications,
      views: 0, // 暂无浏览数据
    }))

    return NextResponse.json({
      success: true,
      data: {
        statistics: {
          todayApplications: todayApplicationsCount,
          pendingResumes: pendingResumesCount,
          todayInterviews: todayInterviewsCount,
          hired: hiredCount,
        },
        recentApplications,
        hotJobs,
      },
    })
  } catch (error) {
    console.error('Get enterprise dashboard error:', error)
    return NextResponse.json(
      { success: false, error: '获取仪表盘数据失败' },
      { status: 500 }
    )
  }
}

// 计算时间差
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  return `${Math.floor(diffDays / 7)}周前`
}

// 从教育经历中提取学校名称
function getSchoolFromEducation(education: any): string {
  if (!education) return '未知学校'
  if (Array.isArray(education) && education.length > 0) {
    return education[0].school || education[0].name || '未知学校'
  }
  if (typeof education === 'object' && education.school) {
    return education.school
  }
  return '未知学校'
}
