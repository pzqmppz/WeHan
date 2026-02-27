/**
 * 岗位 Repository
 * 封装岗位相关的数据库操作
 */

import { prisma } from '@/lib/prisma'
import { Job, Prisma, JobStatus } from '@prisma/client'

export interface JobFilter {
  industry?: string
  location?: string
  keyword?: string
  status?: string
  enterpriseId?: string
}

export interface JobPagination {
  page: number
  pageSize: number
}

export interface JobWithRelations extends Job {
  Enterprise: {
    id: string
    name: string
    logo: string | null
    industry: string | null
  }
}

export const jobRepository = {
  /**
   * 查找所有岗位（带分页和筛选）
   * - 如果提供了 enterpriseId（企业查看自己的岗位），默认显示所有状态
   * - 如果没有提供 enterpriseId（公开 API），默认只显示 PUBLISHED 状态
   */
  async findMany(
    filter: JobFilter,
    pagination: JobPagination
  ): Promise<{ jobs: JobWithRelations[]; total: number }> {
    const where: Prisma.JobWhereInput = {}

    // 状态筛选：企业查看自己的岗位时显示所有状态，公开API只显示已发布
    if (filter.status) {
      where.status = filter.status as Prisma.EnumJobStatusFilter
    } else if (!filter.enterpriseId) {
      // 公开 API：只显示已发布的岗位
      where.status = 'PUBLISHED'
    }
    // 如果有 enterpriseId 且没有指定 status，则显示所有状态（企业自己查看）

    if (filter.industry) {
      where.industry = filter.industry
    }

    if (filter.location) {
      where.location = filter.location
    }

    if (filter.keyword) {
      where.OR = [
        { title: { contains: filter.keyword, mode: 'insensitive' } },
        { description: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }

    if (filter.enterpriseId) {
      where.enterpriseId = filter.enterpriseId
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          Enterprise: {
            select: {
              id: true,
              name: true,
              logo: true,
              industry: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.job.count({ where }),
    ])

    return { jobs: jobs as JobWithRelations[], total }
  },

  /**
   * 根据 ID 查找岗位
   */
  async findById(id: string): Promise<JobWithRelations | null> {
    return prisma.job.findUnique({
      where: { id },
      include: {
        Enterprise: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
          },
        },
      },
    }) as Promise<JobWithRelations | null>
  },

  /**
   * 创建岗位
   */
  async create(data: Prisma.JobCreateInput): Promise<Job> {
    return prisma.job.create({ data })
  },

  /**
   * 更新岗位
   */
  async update(id: string, data: Prisma.JobUpdateInput): Promise<Job> {
    return prisma.job.update({ where: { id }, data })
  },

  /**
   * 删除岗位
   */
  async delete(id: string): Promise<void> {
    await prisma.job.delete({ where: { id } })
  },

  /**
   * 更新岗位状态
   */
  async updateStatus(id: string, status: JobStatus): Promise<Job> {
    return prisma.job.update({
      where: { id },
      data: {
        status,
        publishedAt: status === 'PUBLISHED' ? new Date() : undefined,
      },
    })
  },

  /**
   * 获取企业的岗位列表
   */
  async findByEnterprise(enterpriseId: string): Promise<Job[]> {
    return prisma.job.findMany({
      where: { enterpriseId },
      orderBy: { createdAt: 'desc' },
    })
  },

  /**
   * 获取热门岗位
   */
  async findHot(limit: number = 10): Promise<JobWithRelations[]> {
    return prisma.job.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        Enterprise: {
          select: {
            id: true,
            name: true,
            logo: true,
            industry: true,
          },
        },
        _count: {
          select: { Application: true },
        },
      },
      orderBy: {
        Application: { _count: 'desc' },
      },
      take: limit,
    }) as Promise<JobWithRelations[]>
  },
}
