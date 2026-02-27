/**
 * 政策 Service
 * 封装政策相关的业务逻辑
 */

import { policyRepository, PolicyFilter, PolicyPagination } from '@/repositories/policy.repository'
import { CreatePolicySchema, UpdatePolicySchema, PolicyQuerySchema } from '@/lib/validators'
import { z } from 'zod'
import cuid from 'cuid'

export type CreatePolicyInput = z.infer<typeof CreatePolicySchema>
export type UpdatePolicyInput = z.infer<typeof UpdatePolicySchema>
export type PolicyQueryInput = z.infer<typeof PolicyQuerySchema>

export const policyService = {
  /**
   * 获取政策列表
   */
  async getPolicies(query: PolicyQueryInput) {
    const { page, pageSize, type, isActive, keyword } = query

    const filter: PolicyFilter = {}
    if (type) filter.type = type
    if (isActive !== undefined) filter.isActive = isActive
    if (keyword) filter.keyword = keyword

    const pagination: PolicyPagination = { page, pageSize }

    const { policies, total } = await policyRepository.findMany(filter, pagination)

    return {
      data: policies,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    }
  },

  /**
   * 获取政策详情
   */
  async getPolicyById(id: string) {
    const policy = await policyRepository.findById(id)

    if (!policy) {
      throw new Error('政策不存在')
    }

    return { data: policy }
  },

  /**
   * 创建政策
   */
  async createPolicy(input: CreatePolicyInput) {
    const validated = CreatePolicySchema.parse(input)
    const now = new Date()

    const policy = await policyRepository.create({
      id: cuid(),
      title: validated.title,
      type: validated.type,
      content: validated.content,
      summary: validated.summary,
      conditions: validated.conditions,
      benefits: validated.benefits,
      effectiveDate: validated.effectiveDate,
      expiryDate: validated.expiryDate,
      isActive: true,
      updatedAt: now,
    })

    return { data: policy }
  },

  /**
   * 更新政策
   */
  async updatePolicy(id: string, input: Partial<UpdatePolicyInput>) {
    const existing = await policyRepository.findById(id)
    if (!existing) {
      throw new Error('政策不存在')
    }

    const validated = UpdatePolicySchema.partial().parse(input)

    const policy = await policyRepository.update(id, {
      ...validated,
      updatedAt: new Date(),
    })

    return { data: policy }
  },

  /**
   * 删除政策
   */
  async deletePolicy(id: string) {
    const existing = await policyRepository.findById(id)
    if (!existing) {
      throw new Error('政策不存在')
    }

    await policyRepository.delete(id)

    return { success: true }
  },

  /**
   * 发布政策（上架）
   */
  async publishPolicy(id: string) {
    const existing = await policyRepository.findById(id)
    if (!existing) {
      throw new Error('政策不存在')
    }

    const policy = await policyRepository.updateStatus(id, true)

    return { data: policy }
  },

  /**
   * 下架政策
   */
  async unpublishPolicy(id: string) {
    const existing = await policyRepository.findById(id)
    if (!existing) {
      throw new Error('政策不存在')
    }

    const policy = await policyRepository.updateStatus(id, false)

    return { data: policy }
  },

  /**
   * 获取政策统计
   */
  async getPolicyStats() {
    const [totalActive, countByType] = await Promise.all([
      policyRepository.countActive(),
      policyRepository.countByType(),
    ])

    return {
      data: {
        totalActive,
        countByType,
      },
    }
  },
}
