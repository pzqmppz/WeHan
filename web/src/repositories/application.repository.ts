/**
 * 投递 Repository
 * 封装投递相关的数据库操作
 */

import { prisma } from '@/lib/prisma'
import { Application, Prisma, ApplicationStatus } from '@prisma/client'
import cuid from 'cuid'

export interface ApplicationFilter {
  status?: string
  enterpriseId?: string
  userId?: string
  jobId?: string
}

export interface ApplicationPagination {
  page: number
  pageSize: number
}

export interface ApplicationWithRelations extends Application {
  User: {
    id: string
    name: string
    email: string
    major: string | null
  }
  Job: {
    id: string
    title: string
    location: string | null
    Enterprise: {
      id: string
      name: string
    }
  }
  Interview: {
    totalScore: number | null
    status: string
  } | null
}

export const applicationRepository = {
  /**
   * 查找所有投递（带分页和筛选）
   */
  async findMany(
    filter: ApplicationFilter,
    pagination: ApplicationPagination
  ): Promise<{ applications: ApplicationWithRelations[]; total: number }> {
    const where: Prisma.ApplicationWhereInput = {}

    if (filter.status) {
      where.status = filter.status as Prisma.EnumApplicationStatusFilter
    }

    if (filter.userId) {
      where.userId = filter.userId
    }

    if (filter.jobId) {
      where.jobId = filter.jobId
    }

    if (filter.enterpriseId) {
      where.Job = { enterpriseId: filter.enterpriseId }
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          User: {
            select: {
              id: true,
              name: true,
              email: true,
              major: true,
            },
          },
          Job: {
            select: {
              id: true,
              title: true,
              location: true,
              Enterprise: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          Interview: {
            select: {
              totalScore: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.application.count({ where }),
    ])

    return { applications: applications as ApplicationWithRelations[], total }
  },

  /**
   * 根据 ID 查找投递
   */
  async findById(id: string): Promise<ApplicationWithRelations | null> {
    return prisma.application.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            major: true,
          },
        },
        Job: {
          select: {
            id: true,
            title: true,
            location: true,
            Enterprise: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        Interview: {
          select: {
            totalScore: true,
            status: true,
          },
        },
      },
    }) as Promise<ApplicationWithRelations | null>
  },

  /**
   * 检查是否已投递
   */
  async findByUserAndJob(userId: string, jobId: string): Promise<Application | null> {
    return prisma.application.findUnique({
      where: {
        userId_jobId: { userId, jobId },
      },
    })
  },

  /**
   * 创建投递
   */
  async create(data: {
    userId: string
    jobId: string
    resumeId?: string
    interviewId?: string
    matchScore?: number
  }): Promise<Application> {
    return prisma.application.create({
      data: {
        id: cuid(),
        userId: data.userId,
        jobId: data.jobId,
        resumeId: data.resumeId,
        interviewId: data.interviewId,
        matchScore: data.matchScore,
        status: 'PENDING',
        updatedAt: new Date(),
      },
    })
  },

  /**
   * 更新投递状态
   */
  async updateStatus(
    id: string,
    status: ApplicationStatus,
    notes?: string
  ): Promise<Application> {
    const updateData: Prisma.ApplicationUpdateInput = {
      status,
      notes,
    }

    if (status === 'VIEWED') {
      updateData.viewedAt = new Date()
    }

    return prisma.application.update({
      where: { id },
      data: updateData,
    })
  },

  /**
   * 获取企业今日新增投递数
   */
  async countTodayByEnterprise(enterpriseId: string): Promise<number> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return prisma.application.count({
      where: {
        Job: { enterpriseId },
        createdAt: { gte: today },
      },
    })
  },

  /**
   * 获取企业待处理投递数
   */
  async countPendingByEnterprise(enterpriseId: string): Promise<number> {
    return prisma.application.count({
      where: {
        Job: { enterpriseId },
        status: 'PENDING',
      },
    })
  },

  /**
   * 批量检查投递记录是否属于指定企业
   * 返回不属于该企业的投递ID列表
   */
  async findUnauthorizedIds(
    ids: string[],
    enterpriseId: string
  ): Promise<string[]> {
    const applications = await prisma.application.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        Job: {
          select: { enterpriseId: true },
        },
      },
    })

    return applications
      .filter(app => app.Job.enterpriseId !== enterpriseId)
      .map(app => app.id)
  },

  /**
   * 批量更新投递状态（仅更新属于指定企业的记录）
   */
  async batchUpdateStatus(
    ids: string[],
    status: ApplicationStatus,
    enterpriseId: string,
    notes?: string
  ): Promise<{ count: number }> {
    const updateData: Prisma.ApplicationUpdateInput = {
      status,
      notes,
    }

    if (status === 'VIEWED') {
      updateData.viewedAt = new Date()
    }

    const result = await prisma.application.updateMany({
      where: {
        id: { in: ids },
        Job: { enterpriseId }, // 只更新属于该企业的投递
      },
      data: updateData,
    })

    return { count: result.count }
  },
}
