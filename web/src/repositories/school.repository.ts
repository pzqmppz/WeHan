/**
 * 学校 Repository
 * 封装学校相关的数据库操作
 */

import { prisma } from '@/lib/prisma'
import { School, User, Prisma } from '@prisma/client'

export interface SchoolFilter {
  verified?: boolean
  keyword?: string
}

export interface SchoolPagination {
  page: number
  pageSize: number
}

export interface SchoolWithStats extends School {
  _count: {
    User: number
    JobPushRecord: number
  }
}

export const schoolRepository = {
  /**
   * 查找所有学校（带分页和筛选）
   */
  async findMany(
    filter: SchoolFilter,
    pagination: SchoolPagination
  ): Promise<{ schools: SchoolWithStats[]; total: number }> {
    const where: Prisma.SchoolWhereInput = {}

    if (filter.verified !== undefined) {
      where.verified = filter.verified
    }

    if (filter.keyword) {
      where.OR = [
        { name: { contains: filter.keyword, mode: 'insensitive' } },
        { type: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        include: {
          _count: {
            select: {
              User: { where: { role: 'STUDENT' } },
              JobPushRecord: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.school.count({ where }),
    ])

    return { schools: schools as SchoolWithStats[], total }
  },

  /**
   * 根据 ID 查找学校
   */
  async findById(id: string): Promise<School | null> {
    return prisma.school.findUnique({
      where: { id },
    })
  },

  /**
   * 根据 ID 查找学校（带统计信息）
   */
  async findByIdWithStats(id: string): Promise<SchoolWithStats | null> {
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            User: { where: { role: 'STUDENT' } },
            JobPushRecord: true,
          },
        },
      },
    })

    return school as SchoolWithStats | null
  },

  /**
   * 创建学校
   */
  async create(data: Prisma.SchoolCreateInput): Promise<School> {
    return prisma.school.create({ data })
  },

  /**
   * 更新学校
   */
  async update(id: string, data: Prisma.SchoolUpdateInput): Promise<School> {
    return prisma.school.update({ where: { id }, data })
  },

  /**
   * 更新学校审核状态
   */
  async updateVerifyStatus(id: string, verified: boolean): Promise<School> {
    return prisma.school.update({
      where: { id },
      data: { verified },
    })
  },

  /**
   * 查找学校的学生列表
   */
  async findStudents(
    schoolId: string,
    filter: { status?: string; keyword?: string },
    pagination: { page: number; pageSize: number }
  ): Promise<{ students: User[]; total: number }> {
    const where: Prisma.UserWhereInput = {
      schoolId,
      role: 'STUDENT',
    }

    if (filter.status) {
      where.status = filter.status as Prisma.EnumUserStatusFilter
    }

    if (filter.keyword) {
      where.OR = [
        { name: { contains: filter.keyword, mode: 'insensitive' } },
        { email: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }

    const [students, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          Resume: {
            select: {
              id: true,
              education: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return { students, total }
  },

  /**
   * 统计学校学生数量
   */
  async countStudents(schoolId: string): Promise<number> {
    return prisma.user.count({
      where: { schoolId, role: 'STUDENT' },
    })
  },

  /**
   * 获取所有已认证学校（用于下拉选择）
   */
  async findAllVerified(): Promise<School[]> {
    return prisma.school.findMany({
      where: { verified: true },
      orderBy: { name: 'asc' },
    })
  },
}
