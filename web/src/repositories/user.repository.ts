/**
 * 用户 Repository
 * 封装用户相关的数据库操作
 */

import { prisma } from '@/lib/prisma'
import { User, UserRole, UserStatus, Prisma } from '@prisma/client'

export interface UserFilter {
  role?: string
  status?: string
  schoolId?: string
  enterpriseId?: string
  keyword?: string
}

export interface UserPagination {
  page: number
  pageSize: number
}

export interface UserWithRelations extends User {
  School?: {
    id: string
    name: string
  } | null
  Enterprise?: {
    id: string
    name: string
    industry: string | null
  } | null
  Resume?: {
    id: string
    education: any
  }[]
}

export const userRepository = {
  /**
   * 查找所有用户（带分页和筛选）
   */
  async findMany(
    filter: UserFilter,
    pagination: UserPagination
  ): Promise<{ users: UserWithRelations[]; total: number }> {
    const where: Prisma.UserWhereInput = {}

    if (filter.role) {
      where.role = filter.role as UserRole
    }

    if (filter.status) {
      where.status = filter.status as Prisma.EnumUserStatusFilter
    }

    if (filter.schoolId) {
      where.schoolId = filter.schoolId
    }

    if (filter.enterpriseId) {
      where.enterpriseId = filter.enterpriseId
    }

    if (filter.keyword) {
      where.OR = [
        { name: { contains: filter.keyword, mode: 'insensitive' } },
        { email: { contains: filter.keyword, mode: 'insensitive' } },
      ]
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          School: {
            select: {
              id: true,
              name: true,
            },
          },
          Enterprise: {
            select: {
              id: true,
              name: true,
              industry: true,
            },
          },
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

    return { users: users as UserWithRelations[], total }
  },

  /**
   * 根据 ID 查找用户
   */
  async findById(id: string): Promise<UserWithRelations | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        School: {
          select: {
            id: true,
            name: true,
          },
        },
        Enterprise: {
          select: {
            id: true,
            name: true,
            industry: true,
          },
        },
        Resume: {
          select: {
            id: true,
            education: true,
          },
        },
      },
    })

    return user as UserWithRelations | null
  },

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    })
  },

  /**
   * 更新用户状态
   */
  async updateStatus(id: string, status: UserStatus): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { status },
    })
  },

  /**
   * 更新用户最后登录时间
   */
  async updateLastLogin(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  },

  /**
   * 按角色统计用户数量
   */
  async countByRole(role: UserRole): Promise<number> {
    return prisma.user.count({
      where: { role },
    })
  },

  /**
   * 统计所有角色数量
   */
  async countAllRoles(): Promise<{ role: UserRole; count: number }[]> {
    const result = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true },
    })

    return result.map((item) => ({
      role: item.role,
      count: item._count.id,
    }))
  },

  /**
   * 按状态统计用户数量
   */
  async countByStatus(status: UserStatus): Promise<number> {
    return prisma.user.count({
      where: { status },
    })
  },

  /**
   * 批量创建学生
   */
  async batchCreateStudents(
    students: Array<{
      id: string
      email: string
      name: string
      password: string
      schoolId: string
      major?: string
      graduationYear?: number
    }>
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = []
    let success = 0

    for (const student of students) {
      try {
        await prisma.user.create({
          data: {
            id: student.id,
            email: student.email,
            name: student.name,
            password: student.password,
            role: 'STUDENT',
            status: 'ACTIVE',
            schoolId: student.schoolId,
            major: student.major,
            graduationYear: student.graduationYear,
            updatedAt: new Date(),
          },
        })
        success++
      } catch (error: any) {
        errors.push(`${student.email}: ${error.message || '创建失败'}`)
      }
    }

    return {
      success,
      failed: students.length - success,
      errors,
    }
  },
}
