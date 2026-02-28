/**
 * 岗位 Service
 * 封装岗位相关的业务逻辑
 */

import { jobRepository, JobFilter, JobPagination } from '@/repositories/job.repository'
import { CreateJobSchema, UpdateJobSchema, JobQuerySchema } from '@/lib/validators'
import { z } from 'zod'
import cuid from 'cuid'

export type CreateJobInput = z.infer<typeof CreateJobSchema>
export type UpdateJobInput = z.infer<typeof UpdateJobSchema>
export type JobQueryInput = z.infer<typeof JobQuerySchema>

export const jobService = {
  /**
   * 获取岗位列表
   */
  async getJobs(query: JobQueryInput) {
    const { page, pageSize, industry, location, keyword, enterpriseId, status } = query

    const filter: JobFilter = {}
    if (industry) filter.industry = industry
    if (location) filter.location = location
    if (keyword) filter.keyword = keyword
    if (enterpriseId) filter.enterpriseId = enterpriseId
    if (status) filter.status = status

    const pagination: JobPagination = { page, pageSize }

    const { jobs, total } = await jobRepository.findMany(filter, pagination)

    return {
      data: jobs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * 获取岗位详情
   */
  async getJobById(id: string) {
    const job = await jobRepository.findById(id)

    if (!job) {
      throw new Error('岗位不存在')
    }

    return { data: job }
  },

  /**
   * 创建岗位
   */
  async createJob(input: CreateJobInput) {
    // 验证输入
    const validated = CreateJobSchema.parse(input)

    const now = new Date()

    // 创建岗位
    const job = await jobRepository.create({
      id: cuid(),
      title: validated.title,
      Enterprise: { connect: { id: validated.enterpriseId } },
      industry: validated.industry,
      category: validated.category,
      salaryMin: validated.salaryMin,
      salaryMax: validated.salaryMax,
      location: validated.location,
      address: validated.address,
      description: validated.description,
      requirements: validated.requirements,
      benefits: validated.benefits,
      skills: validated.skills,
      educationLevel: validated.educationLevel,
      experienceYears: validated.experienceYears,
      freshGraduate: validated.freshGraduate ?? true,
      headcount: validated.headcount ?? 1,
      status: 'DRAFT',
      updatedAt: now,
    })

    return { data: job }
  },

  /**
   * 更新岗位
   */
  async updateJob(id: string, input: Partial<UpdateJobInput>) {
    // 验证岗位存在
    const existing = await jobRepository.findById(id)
    if (!existing) {
      throw new Error('岗位不存在')
    }

    // 部分验证
    const validated = UpdateJobSchema.partial().parse(input)

    // 更新岗位
    const job = await jobRepository.update(id, validated)

    return { data: job }
  },

  /**
   * 删除岗位
   */
  async deleteJob(id: string) {
    // 验证岗位存在
    const existing = await jobRepository.findById(id)
    if (!existing) {
      throw new Error('岗位不存在')
    }

    await jobRepository.delete(id)

    return { success: true }
  },

  /**
   * 发布岗位
   */
  async publishJob(id: string) {
    const existing = await jobRepository.findById(id)
    if (!existing) {
      throw new Error('岗位不存在')
    }

    // 验证必填字段
    if (!existing.title || !existing.description) {
      throw new Error('请完善岗位信息后再发布')
    }

    const job = await jobRepository.updateStatus(id, 'PUBLISHED')

    return { data: job }
  },

  /**
   * 下架岗位
   */
  async closeJob(id: string) {
    const job = await jobRepository.updateStatus(id, 'CLOSED')
    return { data: job }
  },

  /**
   * 获取热门岗位
   */
  async getHotJobs(limit: number = 10) {
    const jobs = await jobRepository.findHot(limit)
    return { data: jobs }
  },

  /**
   * 获取企业岗位列表
   */
  async getJobsByEnterprise(enterpriseId: string) {
    const jobs = await jobRepository.findByEnterprise(enterpriseId)
    return { data: jobs }
  },
}
