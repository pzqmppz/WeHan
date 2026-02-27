/**
 * 学校 Service
 * 封装学校相关的业务逻辑
 */

import { schoolRepository, SchoolFilter, SchoolPagination } from '@/repositories/school.repository'
import { z } from 'zod'
import cuid from 'cuid'

export const SchoolQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  verified: z.coerce.boolean().optional(),
  keyword: z.string().optional(),
})

export const CreateSchoolSchema = z.object({
  name: z.string().min(1, '学校名称不能为空').max(100),
  type: z.string().min(1, '学校类型不能为空').max(50),
  level: z.string().min(1, '学校层次不能为空').max(50),
  address: z.string().max(200).optional(),
  contactName: z.string().max(50).optional(),
  contactPhone: z.string().optional(),
  logo: z.string().url().optional(),
})

export const UpdateSchoolSchema = CreateSchoolSchema.partial()

export const StudentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED']).optional(),
  keyword: z.string().optional(),
})

export type SchoolQueryInput = z.infer<typeof SchoolQuerySchema>
export type CreateSchoolInput = z.infer<typeof CreateSchoolSchema>
export type UpdateSchoolInput = z.infer<typeof UpdateSchoolSchema>
export type StudentQueryInput = z.infer<typeof StudentQuerySchema>

export const schoolService = {
  /**
   * 获取学校列表
   */
  async getSchools(query: SchoolQueryInput) {
    const { page, pageSize, verified, keyword } = query

    const filter: SchoolFilter = {}
    if (verified !== undefined) filter.verified = verified
    if (keyword) filter.keyword = keyword

    const pagination: SchoolPagination = { page, pageSize }

    const { schools, total } = await schoolRepository.findMany(filter, pagination)

    return {
      data: schools,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * 获取学校详情
   */
  async getSchoolById(id: string) {
    const school = await schoolRepository.findByIdWithStats(id)

    if (!school) {
      throw new Error('学校不存在')
    }

    return { data: school }
  },

  /**
   * 创建学校
   */
  async createSchool(input: CreateSchoolInput) {
    const validated = CreateSchoolSchema.parse(input)
    const now = new Date()

    const school = await schoolRepository.create({
      id: cuid(),
      name: validated.name,
      type: validated.type,
      level: validated.level,
      address: validated.address,
      contactName: validated.contactName,
      contactPhone: validated.contactPhone,
      logo: validated.logo,
      verified: false,
      updatedAt: now,
    })

    return { data: school }
  },

  /**
   * 更新学校
   */
  async updateSchool(id: string, input: Partial<UpdateSchoolInput>) {
    const existing = await schoolRepository.findById(id)
    if (!existing) {
      throw new Error('学校不存在')
    }

    const validated = UpdateSchoolSchema.partial().parse(input)

    const school = await schoolRepository.update(id, {
      ...validated,
      updatedAt: new Date(),
    })

    return { data: school }
  },

  /**
   * 审核学校（通过/拒绝）
   */
  async verifySchool(id: string, verified: boolean) {
    const existing = await schoolRepository.findById(id)
    if (!existing) {
      throw new Error('学校不存在')
    }

    const school = await schoolRepository.updateVerifyStatus(id, verified)

    return { data: school }
  },

  /**
   * 获取学校学生列表
   */
  async getStudents(schoolId: string, query: StudentQueryInput) {
    const { page, pageSize, status, keyword } = query

    const filter: { status?: string; keyword?: string } = {}
    if (status) filter.status = status
    if (keyword) filter.keyword = keyword

    const pagination = { page, pageSize }

    const { students, total } = await schoolRepository.findStudents(schoolId, filter, pagination)

    return {
      data: students,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * 获取所有已认证学校（用于下拉选择）
   */
  async getAllVerifiedSchools() {
    const schools = await schoolRepository.findAllVerified()
    return { data: schools }
  },
}
