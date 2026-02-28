import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // 超时配置（毫秒）
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// Vercel Serverless 环境下的连接优化
if (process.env.NODE_ENV === 'production') {
  // 生产环境：保持连接池活跃
  prisma.$connect()
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
