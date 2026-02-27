/**
 * 统计 Repository
 * 封装统计数据相关的数据库操作
 */

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export interface PlatformOverviewStats {
  totalUsers: number
  totalEnterprises: number
  totalSchools: number
  totalJobs: number
  totalApplications: number
  activeJobs: number
  verifiedEnterprises: number
  verifiedSchools: number
}

export interface GovernmentStats {
  totalApplications: number
  todayApplications: number
  totalInterviews: number
  avgMatchScore: number
  retentionRate: number
}

export interface SchoolEmploymentStats {
  totalStudents: number
  appliedStudents: number
  employedStudents: number
  employmentRate: number
  topIndustries: { industry: string; count: number }[]
  topCompanies: { name: string; count: number }[]
}

export interface RetentionTrend {
  month: string
  applications: number
  interviews: number
  offers: number
}

export const statisticsRepository = {
  /**
   * 获取平台总览统计
   */
  async getPlatformOverview(): Promise<PlatformOverviewStats> {
    const [
      totalUsers,
      totalEnterprises,
      totalSchools,
      totalJobs,
      totalApplications,
      activeJobs,
      verifiedEnterprises,
      verifiedSchools,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.enterprise.count(),
      prisma.school.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
      prisma.enterprise.count({ where: { verified: true } }),
      prisma.school.count({ where: { verified: true } }),
    ])

    return {
      totalUsers,
      totalEnterprises,
      totalSchools,
      totalJobs,
      totalApplications,
      activeJobs,
      verifiedEnterprises,
      verifiedSchools,
    }
  },

  /**
   * 获取政府端统计
   */
  async getGovernmentStats(startDate?: Date, endDate?: Date): Promise<GovernmentStats> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dateFilter: Prisma.ApplicationWhereInput = {}
    if (startDate || endDate) {
      dateFilter.createdAt = {}
      if (startDate) dateFilter.createdAt.gte = startDate
      if (endDate) dateFilter.createdAt.lte = endDate
    }

    const [totalApplications, todayApplications, totalInterviews, avgScoreResult] =
      await Promise.all([
        prisma.application.count({ where: dateFilter }),
        prisma.application.count({
          where: { createdAt: { gte: today } },
        }),
        prisma.interview.count({
          where: { status: 'COMPLETED' },
        }),
        prisma.interview.aggregate({
          where: { totalScore: { not: null } },
          _avg: { totalScore: true },
        }),
      ])

    // 计算留汉率（录用的申请数 / 总申请数）
    const offeredCount = await prisma.application.count({
      where: { ...dateFilter, status: 'OFFERED' },
    })

    const retentionRate = totalApplications > 0 ? (offeredCount / totalApplications) * 100 : 0

    return {
      totalApplications,
      todayApplications,
      totalInterviews,
      avgMatchScore: avgScoreResult._avg.totalScore || 0,
      retentionRate: Math.round(retentionRate * 10) / 10,
    }
  },

  /**
   * 获取学校就业统计
   */
  async getSchoolEmploymentStats(schoolId: string): Promise<SchoolEmploymentStats> {
    // 获取该学校的所有学生
    const students = await prisma.user.findMany({
      where: { schoolId, role: 'STUDENT' },
      select: { id: true },
    })

    const studentIds = students.map((s) => s.id)
    const totalStudents = students.length

    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        appliedStudents: 0,
        employedStudents: 0,
        employmentRate: 0,
        topIndustries: [],
        topCompanies: [],
      }
    }

    // 获取有申请记录的学生
    const appliedStudents = await prisma.application.findMany({
      where: { userId: { in: studentIds } },
      select: { userId: true },
      distinct: ['userId'],
    })

    // 获取被录用的学生
    const employedStudents = await prisma.application.findMany({
      where: { userId: { in: studentIds }, status: 'OFFERED' },
      select: { userId: true },
      distinct: ['userId'],
    })

    // 获取学生申请的岗位信息
    const applications = await prisma.application.findMany({
      where: { userId: { in: studentIds } },
      include: {
        Job: {
          include: {
            Enterprise: {
              select: { name: true, industry: true },
            },
          },
        },
      },
    })

    // 统计行业分布
    const industryMap = new Map<string, number>()
    applications.forEach((app) => {
      const industry = app.Job?.industry || '未知'
      industryMap.set(industry, (industryMap.get(industry) || 0) + 1)
    })

    const topIndustries = Array.from(industryMap.entries())
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 统计企业分布
    const companyMap = new Map<string, number>()
    applications.forEach((app) => {
      const name = app.Job?.Enterprise?.name || '未知'
      companyMap.set(name, (companyMap.get(name) || 0) + 1)
    })

    const topCompanies = Array.from(companyMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalStudents,
      appliedStudents: appliedStudents.length,
      employedStudents: employedStudents.length,
      employmentRate:
        totalStudents > 0 ? Math.round((employedStudents.length / totalStudents) * 100 * 10) / 10 : 0,
      topIndustries,
      topCompanies,
    }
  },

  /**
   * 获取留汉趋势数据
   */
  async getRetentionTrend(months: number = 6): Promise<RetentionTrend[]> {
    const result: RetentionTrend[] = []

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - i, 1)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + 1)
      endDate.setDate(0) // 月末
      endDate.setHours(23, 59, 59, 999)

      const monthStr = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`

      const [applications, interviews, offers] = await Promise.all([
        prisma.application.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        }),
        prisma.interview.count({
          where: { createdAt: { gte: startDate, lte: endDate } },
        }),
        prisma.application.count({
          where: { createdAt: { gte: startDate, lte: endDate }, status: 'OFFERED' },
        }),
      ])

      result.push({
        month: monthStr,
        applications,
        interviews,
        offers,
      })
    }

    return result
  },

  /**
   * 获取行业分布
   */
  async getIndustryDistribution(): Promise<{ industry: string; count: number }[]> {
    const result = await prisma.job.groupBy({
      by: ['industry'],
      _count: { id: true },
      where: { status: 'PUBLISHED', industry: { not: null } },
    })

    return result
      .filter((item) => item.industry)
      .map((item) => ({
        industry: item.industry!,
        count: item._count.id,
      }))
      .sort((a, b) => b.count - a.count)
  },

  /**
   * 获取学校留汉排名
   */
  async getSchoolRetentionRanking(
    limit: number = 10
  ): Promise<{ schoolId: string; schoolName: string; total: number; offered: number; rate: number }[]> {
    // 获取所有学校
    const schools = await prisma.school.findMany({
      where: { verified: true },
      select: { id: true, name: true },
    })

    const result = []

    for (const school of schools) {
      // 获取该学校学生的申请
      const students = await prisma.user.findMany({
        where: { schoolId: school.id, role: 'STUDENT' },
        select: { id: true },
      })

      const studentIds = students.map((s) => s.id)

      if (studentIds.length === 0) continue

      const [total, offered] = await Promise.all([
        prisma.application.count({
          where: { userId: { in: studentIds } },
        }),
        prisma.application.count({
          where: { userId: { in: studentIds }, status: 'OFFERED' },
        }),
      ])

      if (total > 0) {
        result.push({
          schoolId: school.id,
          schoolName: school.name,
          total,
          offered,
          rate: Math.round((offered / total) * 100 * 10) / 10,
        })
      }
    }

    return result.sort((a, b) => b.rate - a.rate).slice(0, limit)
  },
}
