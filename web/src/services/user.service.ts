/**
 * 用户 Service
 * 封装用户相关的业务逻辑
 */

import { userRepository, UserFilter, UserPagination } from '@/repositories/user.repository'
import { z } from 'zod'

export const UserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  role: z.enum(['STUDENT', 'ENTERPRISE', 'SCHOOL', 'GOVERNMENT', 'ADMIN']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED']).optional(),
  schoolId: z.string().optional(),
  enterpriseId: z.string().optional(),
  keyword: z.string().optional(),
})

export const UpdateUserStatusInputSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED']),
})

export type UserQueryInput = z.infer<typeof UserQuerySchema>
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusInputSchema>

export const userService = {
  /**
   * 获取用户列表
   */
  async getUsers(query: UserQueryInput) {
    const { page, pageSize, role, status, schoolId, enterpriseId, keyword } = query

    const filter: UserFilter = {}
    if (role) filter.role = role
    if (status) filter.status = status
    if (schoolId) filter.schoolId = schoolId
    if (enterpriseId) filter.enterpriseId = enterpriseId
    if (keyword) filter.keyword = keyword

    const pagination: UserPagination = { page, pageSize }

    const { users, total } = await userRepository.findMany(filter, pagination)

    return {
      data: users,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * 获取用户详情
   */
  async getUserById(id: string) {
    const user = await userRepository.findById(id)

    if (!user) {
      throw new Error('用户不存在')
    }

    // 移除密码字段
    const { password, ...userWithoutPassword } = user

    return { data: userWithoutPassword }
  },

  /**
   * 更新用户状态
   */
  async updateUserStatus(id: string, input: UpdateUserStatusInput) {
    const existing = await userRepository.findById(id)
    if (!existing) {
      throw new Error('用户不存在')
    }

    const validated = UpdateUserStatusInputSchema.parse(input)

    const user = await userRepository.updateStatus(id, validated.status as any)

    const { password, ...userWithoutPassword } = user

    return { data: userWithoutPassword }
  },

  /**
   * 获取用户统计
   */
  async getUserStats() {
    const [countByRole, activeCount, pendingCount] = await Promise.all([
      userRepository.countAllRoles(),
      userRepository.countByStatus('ACTIVE'),
      userRepository.countByStatus('PENDING'),
    ])

    return {
      data: {
        countByRole,
        activeCount,
        pendingCount,
      },
    }
  },

  /**
   * 批量导入学生
   */
  async batchImportStudents(
    schoolId: string,
    students: Array<{
      email: string
      name: string
      password: string
      major?: string
      graduationYear?: number
    }>
  ) {
    // 验证学校存在
    const school = await userRepository.findById(schoolId)
    if (!school) {
      throw new Error('学校不存在')
    }

    const cuid = require('cuid')
    const studentsWithId = students.map((s) => ({
      ...s,
      id: cuid(),
      schoolId,
    }))

    const result = await userRepository.batchCreateStudents(studentsWithId)

    return {
      data: {
        success: result.success,
        failed: result.failed,
        errors: result.errors,
      },
    }
  },
}
