/**
 * 政策 Repository
 * 封装政策相关的数据库操作
 */

import { prisma } from '@/lib/prisma'
import { Policy, Prisma, PolicyType } from '@prisma/client'

export interface PolicyFilter {
  type?: string
  isActive?: boolean
  keyword?: string
}

export interface PolicyPagination {
  page: number
  pageSize: number
}

export const policyRepository = {
  /**
   * 查找所有政策（带分页和筛选）
   */
  async findMany(
    filter: PolicyFilter,
    pagination: PolicyPagination
  ): Promise<{ policies: Policy[]; total: number }> {
    const where: Prisma.PolicyWhereInput = {}

    if (filter.type) {
      where.type = filter.type as PolicyType
    }

    if (filter.isActive !== undefined) {
      where.isActive = filter.isActive
    }

    if (filter.keyword) {
      where.OR = [
        { title: { contains: filter.keyword, mode: 'insensitive' } },
        { content: { contains: filter.keyword, mode: 'insensitive' } },
        { summary: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }

    const [policies, total] = await Promise.all([
      prisma.policy.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.policy.count({ where }),
    ])

    return { policies, total }
  },

  /**
   * 根据 ID 查找政策
   */
  async findById(id: string): Promise<Policy | null> {
    return prisma.policy.findUnique({
      where: { id },
    })
  },

  /**
   * 创建政策
   */
  async create(data: Prisma.PolicyCreateInput): Promise<Policy> {
    return prisma.policy.create({ data })
  },

  /**
   * 更新政策
   */
  async update(id: string, data: Prisma.PolicyUpdateInput): Promise<Policy> {
    return prisma.policy.update({ where: { id }, data })
  },

  /**
   * 删除政策
   */
  async delete(id: string): Promise<void> {
    await prisma.policy.delete({ where: { id } })
  },

  /**
   * 更新政策状态（上下架）
   */
  async updateStatus(id: string, isActive: boolean): Promise<Policy> {
    return prisma.policy.update({
      where: { id },
      data: { isActive },
    })
  },

  /**
   * 获取活跃政策数量
   */
  async countActive(): Promise<number> {
    return prisma.policy.count({
      where: { isActive: true },
    })
  },

  /**
   * 按类型统计政策数量
   */
  async countByType(): Promise<{ type: PolicyType; count: number }[]> {
    const result = await prisma.policy.groupBy({
      by: ['type'],
      _count: { id: true },
      where: { isActive: true },
    })

    return result.map((item) => ({
      type: item.type,
      count: item._count.id,
    }))
  },
}
