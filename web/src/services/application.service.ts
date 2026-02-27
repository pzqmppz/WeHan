/**
 * 投递 Service
 * 封装投递相关的业务逻辑
 */

import { applicationRepository, ApplicationFilter, ApplicationPagination } from '@/repositories/application.repository'
import { CreateApplicationSchema, UpdateApplicationStatusSchema, ApplicationQuerySchema } from '@/lib/validators'
import { z } from 'zod'

export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>
export type UpdateApplicationStatusInput = z.infer<typeof UpdateApplicationStatusSchema>
export type ApplicationQueryInput = z.infer<typeof ApplicationQuerySchema>

export const applicationService = {
  /**
   * 获取投递列表
   */
  async getApplications(query: ApplicationQueryInput) {
    const { page, pageSize, status, enterpriseId, userId, jobId } = query

    const filter: ApplicationFilter = {}
    if (status) filter.status = status
    if (enterpriseId) filter.enterpriseId = enterpriseId
    if (userId) filter.userId = userId
    if (jobId) filter.jobId = jobId

    const pagination: ApplicationPagination = { page, pageSize }

    const { applications, total } = await applicationRepository.findMany(filter, pagination)

    return {
      data: applications,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * 获取投递详情
   */
  async getApplicationById(id: string) {
    const application = await applicationRepository.findById(id)

    if (!application) {
      throw new Error('投递记录不存在')
    }

    return { data: application }
  },

  /**
   * 创建投递
   */
  async createApplication(input: CreateApplicationInput) {
    // 验证输入
    const validated = CreateApplicationSchema.parse(input)

    // 检查是否已投递
    const existing = await applicationRepository.findByUserAndJob(
      validated.userId,
      validated.jobId
    )

    if (existing) {
      throw new Error('您已投递过该岗位')
    }

    // 创建投递
    const application = await applicationRepository.create({
      userId: validated.userId,
      jobId: validated.jobId,
      resumeId: validated.resumeId,
      interviewId: validated.interviewId,
      matchScore: validated.matchScore,
    })

    return { data: application }
  },

  /**
   * 更新投递状态
   */
  async updateStatus(id: string, input: UpdateApplicationStatusInput) {
    const validated = UpdateApplicationStatusSchema.parse(input)

    // 验证投递存在
    const existing = await applicationRepository.findById(id)
    if (!existing) {
      throw new Error('投递记录不存在')
    }

    const application = await applicationRepository.updateStatus(
      id,
      validated.status as any,
      validated.notes
    )

    return { data: application }
  },

  /**
   * 获取企业投递统计
   */
  async getEnterpriseStatistics(enterpriseId: string) {
    const [todayCount, pendingCount] = await Promise.all([
      applicationRepository.countTodayByEnterprise(enterpriseId),
      applicationRepository.countPendingByEnterprise(enterpriseId),
    ])

    return {
      data: {
        todayApplications: todayCount,
        pendingApplications: pendingCount,
      },
    }
  },

  /**
   * 批量更新投递状态
   */
  async batchUpdateStatus(
    ids: string[],
    status: string,
    enterpriseId: string,
    notes?: string
  ) {
    // 检查所有投递是否属于该企业
    const unauthorizedIds = await applicationRepository.findUnauthorizedIds(
      ids,
      enterpriseId
    )

    if (unauthorizedIds.length > 0) {
      throw new Error('包含无权操作的投递记录')
    }

    // 批量更新
    const result = await applicationRepository.batchUpdateStatus(
      ids,
      status as any,
      enterpriseId,
      notes
    )

    return {
      data: {
        updated: result.count,
        ids,
      },
    }
  },
}
