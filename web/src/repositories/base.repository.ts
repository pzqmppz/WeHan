/**
 * 基础 Repository 接口
 * 定义通用的数据访问方法
 */

import { PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface Repository<T, CreateInput, UpdateInput> {
  findById(id: string): Promise<T | null>
  findMany(params?: {
    where?: Record<string, unknown>
    include?: Record<string, unknown>
    orderBy?: Record<string, unknown>
    skip?: number
    take?: number
  }): Promise<T[]>
  count(where?: Record<string, unknown>): Promise<number>
  create(data: CreateInput): Promise<T>
  update(id: string, data: UpdateInput): Promise<T>
  delete(id: string): Promise<void>
}

/**
 * 基础 Repository 实现类
 * 提供通用的 CRUD 操作
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput>
  implements Repository<T, CreateInput, UpdateInput>
{
  protected prisma: PrismaClient
  protected model: any // Prisma 模型

  constructor(model: any) {
    this.prisma = prisma
    this.model = model
  }

  async findById(id: string): Promise<T | null> {
    return this.model.findUnique({ where: { id } })
  }

  async findMany(params?: {
    where?: Record<string, unknown>
    include?: Record<string, unknown>
    orderBy?: Record<string, unknown>
    skip?: number
    take?: number
  }): Promise<T[]> {
    return this.model.findMany(params)
  }

  async count(where?: Record<string, unknown>): Promise<number> {
    return this.model.count({ where })
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data })
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({ where: { id } })
  }
}
