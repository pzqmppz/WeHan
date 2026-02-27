/**
 * 统一验证 Schemas
 * 使用 Zod 进行运行时类型验证
 */

import { z } from 'zod'

// ==================== 通用 ====================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export const IdSchema = z.string().cuid()

// ==================== 用户相关 ====================

export const UserRoleSchema = z.enum(['STUDENT', 'ENTERPRISE', 'SCHOOL', 'GOVERNMENT', 'ADMIN'])
export const UserStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'PENDING', 'REJECTED'])

export const LoginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  role: z.enum(['enterprise', 'school', 'government', 'admin']),
})

export const RegisterSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(6, '密码至少6位'),
  name: z.string().min(2, '姓名至少2个字符'),
  phone: z.string().regex(/^1[3-9]\d{9}$/, '请输入有效的手机号').optional(),
  role: UserRoleSchema,
})

// ==================== 岗位相关 ====================

export const JobStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'CLOSED', 'ARCHIVED'])

export const JobQuerySchema = PaginationSchema.extend({
  industry: z.string().optional(),
  location: z.string().optional(),
  keyword: z.string().optional(),
  status: JobStatusSchema.optional(),
  enterpriseId: IdSchema.optional(),
})

export const CreateJobSchema = z.object({
  title: z.string().min(1, '岗位名称不能为空').max(200),
  enterpriseId: IdSchema,
  industry: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  salaryMin: z.number().int().min(0).optional(),
  salaryMax: z.number().int().min(0).optional(),
  location: z.string().max(100).optional(),
  address: z.string().max(200).optional(),
  description: z.string().min(1, '岗位描述不能为空'),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  skills: z.array(z.string()).default([]),
  educationLevel: z.string().max(50).optional(),
  experienceYears: z.number().int().min(0).optional(),
  freshGraduate: z.boolean().default(true),
  headcount: z.number().int().min(1).default(1),
})

export const UpdateJobSchema = CreateJobSchema.partial()

// ==================== 投递相关 ====================

export const ApplicationStatusSchema = z.enum([
  'PENDING', 'VIEWED', 'INTERVIEWING', 'OFFERED', 'REJECTED', 'WITHDRAWN'
])

export const ApplicationQuerySchema = PaginationSchema.extend({
  status: ApplicationStatusSchema.optional(),
  enterpriseId: IdSchema.optional(),
  userId: IdSchema.optional(),
  jobId: IdSchema.optional(),
})

export const CreateApplicationSchema = z.object({
  userId: IdSchema,
  jobId: IdSchema,
  resumeId: IdSchema.optional(),
  interviewId: IdSchema.optional(),
  matchScore: z.number().min(0).max(100).optional(),
})

export const UpdateApplicationStatusSchema = z.object({
  status: ApplicationStatusSchema,
  notes: z.string().optional(),
})

// ==================== 面试相关 ====================

export const InterviewStatusSchema = z.enum(['PREPARING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED'])

export const CreateInterviewSchema = z.object({
  userId: IdSchema,
  jobId: IdSchema.optional(),
  applicationId: IdSchema.optional(),
})

export const UpdateInterviewSchema = z.object({
  status: InterviewStatusSchema.optional(),
  totalScore: z.number().min(0).max(100).optional(),
  dimensions: z.array(z.object({
    name: z.string(),
    score: z.number(),
    maxScore: z.number(),
    comment: z.string().optional(),
  })).optional(),
  suggestions: z.string().optional(),
})

// ==================== 政策相关 ====================

export const PolicyTypeSchema = z.enum(['SUBSIDY', 'HOUSING', 'TALENT', 'ENTREPRENEUR', 'OTHER'])

export const PolicyQuerySchema = PaginationSchema.extend({
  type: PolicyTypeSchema.optional(),
  isActive: z.coerce.boolean().optional(),
  keyword: z.string().optional(),
})

export const CreatePolicySchema = z.object({
  title: z.string().min(1, '政策标题不能为空').max(200),
  type: PolicyTypeSchema,
  content: z.string().min(1, '政策内容不能为空'),
  summary: z.string().optional(),
  conditions: z.string().optional(),
  benefits: z.string().optional(),
  effectiveDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date().optional(),
})

export const UpdatePolicySchema = CreatePolicySchema.partial()

// ==================== 企业相关 ====================

export const EnterpriseScaleSchema = z.enum(['0-50', '50-200', '200-500', '500-1000', '1000+'])

export const CreateEnterpriseSchema = z.object({
  name: z.string().min(1, '企业名称不能为空').max(100),
  industry: z.string().min(1, '行业不能为空').max(50),
  scale: EnterpriseScaleSchema,
  description: z.string().optional(),
  address: z.string().max(200).optional(),
  contactName: z.string().max(50).optional(),
  contactPhone: z.string().regex(/^1[3-9]\d{9}$/).optional().or(z.literal('')),
  contactEmail: z.string().email().optional().or(z.literal('')),
  businessLicense: z.string().url().optional(),
})

// ==================== API 响应 ====================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export function successResponse<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return { success: true, data, meta }
}

export function errorResponse(error: string, code?: string): ApiResponse<never> {
  return { success: false, error, code }
}
