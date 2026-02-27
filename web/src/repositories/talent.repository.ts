/**
 * 人才库 Repository
 * 封装人才库相关的数据库操作
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface TalentFilter {
  enterpriseId: string
  keyword?: string
  skills?: string[]
  education?: string
  status?: string // 投递状态筛选
}

export interface TalentPagination {
  page: number
  pageSize: number
}

export interface TalentWithResume {
  id: string
  name: string
  email: string
  phone: string | null
  major: string | null
  graduationYear: number | null
  resume: {
    id: string
    education: any
    experiences: any
    projects: any
    skills: string[]
    certifications: any
    awards: any
    profile: any
  } | null
  applications: {
    id: string
    status: string
    matchScore: number | null
    createdAt: Date
    job: {
      id: string
      title: string
    }
    interview: {
      id: string
      totalScore: number | null
      status: string
    } | null
  }[]
}

export const talentRepository = {
  /**
   * 获取企业人才库（投递过该企业岗位的候选人）
   */
  async findMany(
    filter: TalentFilter,
    pagination: TalentPagination
  ): Promise<{ talents: TalentWithResume[]; total: number }> {
    // 构建基础查询条件
    const where: Prisma.ApplicationWhereInput = {
      job: { enterpriseId: filter.enterpriseId },
    }

    // 状态筛选
    if (filter.status) {
      where.status = filter.status as Prisma.EnumApplicationStatusFilter
    }

    // 先查询所有符合条件的投递，然后按用户去重
    const applications = await prisma.application.findMany({
      where,
      include: {
        user: {
          include: {
            resume: {
              select: {
                id: true,
                phone: true,
                education: true,
                experiences: true,
                projects: true,
                skills: true,
                certifications: true,
                awards: true,
                profile: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
        interview: {
          select: {
            id: true,
            totalScore: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // 按用户分组去重
    const userMap = new Map<string, TalentWithResume>()

    for (const app of applications) {
      const userId = app.userId

      if (!userMap.has(userId)) {
        userMap.set(userId, {
          id: userId,
          name: app.user.name,
          email: app.user.email,
          phone: app.user.resume?.phone || null,
          major: app.user.major,
          graduationYear: app.user.graduationYear,
          resume: app.user.resume,
          applications: [],
        })
      }

      // 添加投递记录
      const talent = userMap.get(userId)!
      talent.applications.push({
        id: app.id,
        status: app.status,
        matchScore: app.matchScore,
        createdAt: app.createdAt,
        job: app.job,
        interview: app.interview,
      })
    }

    let talents = Array.from(userMap.values())

    // 关键词搜索（姓名、邮箱、技能）
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase()
      talents = talents.filter(t =>
        t.name.toLowerCase().includes(keyword) ||
        t.email.toLowerCase().includes(keyword) ||
        t.resume?.skills?.some((s: string) => s.toLowerCase().includes(keyword))
      )
    }

    // 技能筛选
    if (filter.skills && filter.skills.length > 0) {
      talents = talents.filter(t =>
        filter.skills!.some(skill =>
          t.resume?.skills?.some((s: string) =>
            s.toLowerCase().includes(skill.toLowerCase())
          )
        )
      )
    }

    const total = talents.length

    // 分页
    const startIndex = (pagination.page - 1) * pagination.pageSize
    const paginatedTalents = talents.slice(
      startIndex,
      startIndex + pagination.pageSize
    )

    return { talents: paginatedTalents, total }
  },

  /**
   * 获取单个人才详情
   */
  async findById(
    userId: string,
    enterpriseId: string
  ): Promise<TalentWithResume | null> {
    // 获取用户投递到该企业的所有记录
    const applications = await prisma.application.findMany({
      where: {
        userId,
        job: { enterpriseId },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            salaryMin: true,
            salaryMax: true,
          },
        },
        interview: {
          select: {
            id: true,
            totalScore: true,
            status: true,
            dimensions: true,
            highlights: true,
            improvements: true,
            suggestions: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (applications.length === 0) {
      return null
    }

    // 获取用户信息和简历
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        resume: true,
      },
    })

    if (!user) {
      return null
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.resume?.phone || null,
      major: user.major,
      graduationYear: user.graduationYear,
      resume: user.resume,
      applications: applications.map(app => ({
        id: app.id,
        status: app.status,
        matchScore: app.matchScore,
        createdAt: app.createdAt,
        job: app.job,
        interview: app.interview,
      })),
    }
  },

  /**
   * 获取企业人才统计数据
   */
  async getStatistics(enterpriseId: string): Promise<{
    totalTalents: number
    newThisWeek: number
    interviewed: number
    offered: number
  }> {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    // 获取所有投递
    const applications = await prisma.application.findMany({
      where: {
        job: { enterpriseId },
      },
      select: {
        userId: true,
        createdAt: true,
        status: true,
      },
    })

    // 去重统计
    const uniqueUsers = new Set(applications.map(a => a.userId))
    const newUsersThisWeek = new Set(
      applications
        .filter(a => a.createdAt >= oneWeekAgo)
        .map(a => a.userId)
    )

    const interviewed = applications.filter(a =>
      a.status === 'INTERVIEWING' || a.status === 'OFFERED'
    ).length
    const offered = applications.filter(a => a.status === 'OFFERED').length

    return {
      totalTalents: uniqueUsers.size,
      newThisWeek: newUsersThisWeek.size,
      interviewed,
      offered,
    }
  },
}
