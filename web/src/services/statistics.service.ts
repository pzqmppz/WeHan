/**
 * 统计 Service
 * 封装统计相关的业务逻辑
 */

import { statisticsRepository } from '@/repositories/statistics.repository'
import { z } from 'zod'

export const DateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const SchoolStatsQuerySchema = z.object({
  schoolId: z.string(),
})

export const TrendQuerySchema = z.object({
  months: z.coerce.number().int().min(1).max(24).default(6),
})

export type DateRangeInput = z.infer<typeof DateRangeSchema>
export type SchoolStatsQueryInput = z.infer<typeof SchoolStatsQuerySchema>
export type TrendQueryInput = z.infer<typeof TrendQuerySchema>

export const statisticsService = {
  /**
   * 获取平台总览统计
   */
  async getPlatformOverview() {
    const stats = await statisticsRepository.getPlatformOverview()
    return { data: stats }
  },

  /**
   * 获取政府端统计
   */
  async getGovernmentStats(query: DateRangeInput) {
    const { startDate, endDate } = DateRangeSchema.parse(query)
    const stats = await statisticsRepository.getGovernmentStats(startDate, endDate)
    return { data: stats }
  },

  /**
   * 获取学校就业统计
   */
  async getSchoolEmploymentStats(query: SchoolStatsQueryInput) {
    const { schoolId } = SchoolStatsQuerySchema.parse(query)
    const stats = await statisticsRepository.getSchoolEmploymentStats(schoolId)
    return { data: stats }
  },

  /**
   * 获取留汉趋势
   */
  async getRetentionTrend(query: TrendQueryInput) {
    const { months } = TrendQuerySchema.parse(query)
    const trend = await statisticsRepository.getRetentionTrend(months)
    return { data: trend }
  },

  /**
   * 获取行业分布
   */
  async getIndustryDistribution() {
    const distribution = await statisticsRepository.getIndustryDistribution()
    return { data: distribution }
  },

  /**
   * 获取学校留汉排名
   */
  async getSchoolRetentionRanking(limit: number = 10) {
    const ranking = await statisticsRepository.getSchoolRetentionRanking(limit)
    return { data: ranking }
  },

  /**
   * 获取政府端完整仪表盘数据
   */
  async getGovernmentDashboard(query: DateRangeInput & { months?: number }) {
    const { startDate, endDate, months = 6 } = query

    const [stats, trend, industryDistribution, schoolRanking] = await Promise.all([
      statisticsRepository.getGovernmentStats(startDate, endDate),
      statisticsRepository.getRetentionTrend(months),
      statisticsRepository.getIndustryDistribution(),
      statisticsRepository.getSchoolRetentionRanking(10),
    ])

    return {
      data: {
        stats,
        trend,
        industryDistribution,
        schoolRanking,
      },
    }
  },

  /**
   * 获取学校端完整仪表盘数据
   */
  async getSchoolDashboard(schoolId: string) {
    const [employmentStats, industryDistribution] = await Promise.all([
      statisticsRepository.getSchoolEmploymentStats(schoolId),
      statisticsRepository.getIndustryDistribution(),
    ])

    return {
      data: {
        employmentStats,
        industryDistribution,
      },
    }
  },

  /**
   * 获取管理员完整仪表盘数据
   */
  async getAdminDashboard() {
    const [overview, trend, industryDistribution] = await Promise.all([
      statisticsRepository.getPlatformOverview(),
      statisticsRepository.getRetentionTrend(6),
      statisticsRepository.getIndustryDistribution(),
    ])

    return {
      data: {
        overview,
        trend,
        industryDistribution,
      },
    }
  },
}
