/**
 * 政府端仪表盘 API
 * 获取政府端首页统计数据
 */

import { NextRequest, NextResponse } from 'next/server'
import { statisticsService } from '@/services/statistics.service'
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

    const userRole = (session.user as any).role
    if (userRole !== 'GOVERNMENT' && userRole !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: '无权限' },
        { status: 403 }
      )
    }

    // 获取政府端仪表盘数据
    const result = await statisticsService.getGovernmentDashboard({
      months: 6,
    })

    // 格式化统计数据
    const { stats, trend, industryDistribution, schoolRanking } = result.data

    // 获取企业数量
    const overviewResult = await statisticsService.getPlatformOverview()
    const totalEnterprises = overviewResult.data.verifiedEnterprises

    // 计算核心指标
    const statistics = {
      totalApplications: stats.totalApplications,
      totalContracts: trend.reduce((sum, t) => sum + t.offers, 0),
      retentionRate: stats.retentionRate,
      totalEnterprises,
    }

    // 格式化行业分布数据 - 匹配 mock 格式
    const totalCount = industryDistribution.reduce((sum, item) => sum + item.count, 0)
    const industryDistributionData = industryDistribution
      .slice(0, 7)
      .map((item) => ({
        name: item.industry || '其他',
        count: item.count,
        percent: totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0,
      }))

    // 格式化学校排名数据 - 匹配 mock 格式
    const schoolRetention = schoolRanking.map((item) => ({
      name: item.schoolName,
      retention: item.rate,
      total: item.total,
    }))

    // 格式化月度趋势数据 - 匹配 mock 格式
    const monthlyTrend = trend.map((item) => ({
      month: item.month,
      applications: item.applications,
      contracts: item.offers,
    }))

    return NextResponse.json({
      success: true,
      data: {
        statistics,
        industryDistribution: industryDistributionData,
        schoolRetention,
        monthlyTrend,
      },
    })
  } catch (error) {
    console.error('Get government dashboard error:', error)
    return NextResponse.json(
      { success: false, error: '获取仪表盘数据失败' },
      { status: 500 }
    )
  }
}
