/**
 * 人才库 Service
 * 封装人才库相关的业务逻辑
 */

import { talentRepository, TalentFilter, TalentPagination } from '@/repositories/talent.repository'

export type TalentQueryInput = {
  enterpriseId: string
  keyword?: string
  skills?: string[]
  education?: string
  status?: string
  page?: number
  pageSize?: number
}

export const talentService = {
  /**
   * 获取企业人才库列表
   */
  async getTalents(query: TalentQueryInput) {
    const {
      enterpriseId,
      keyword,
      skills,
      education,
      status,
      page = 1,
      pageSize = 10,
    } = query

    const filter: TalentFilter = { enterpriseId }
    if (keyword) filter.keyword = keyword
    if (skills && skills.length > 0) filter.skills = skills
    if (education) filter.education = education
    if (status) filter.status = status

    const pagination: TalentPagination = { page, pageSize }

    const { talents, total } = await talentRepository.findMany(filter, pagination)

    return {
      data: talents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * 获取人才详情
   */
  async getTalentById(userId: string, enterpriseId: string) {
    const talent = await talentRepository.findById(userId, enterpriseId)

    if (!talent) {
      throw new Error('人才不存在或未投递过贵公司岗位')
    }

    return { data: talent }
  },

  /**
   * 获取企业人才统计数据
   */
  async getStatistics(enterpriseId: string) {
    const stats = await talentRepository.getStatistics(enterpriseId)
    return { data: stats }
  },
}
