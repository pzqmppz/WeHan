/**
 * 临时脚本 - 查询测试数据
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('=== 查询岗位数据 ===')
  const jobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED' },
    select: { id: true, title: true },
    take: 3
  })
  jobs.forEach(j => console.log(`job_id: ${j.id} | ${j.title}`))

  console.log('\n=== 查询用户数据 ===')
  const users = await prisma.user.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, email: true, name: true, role: true },
    take: 3
  })
  users.forEach(u => console.log(`user_id: ${u.id} | ${u.email} | ${u.name} | ${u.role}`))

  console.log('\n=== C端测试用 user_id (虚拟) ===')
  console.log('user_id: test_user_c_001 | C端测试用户')
  console.log('user_id: douyin_user_001 | 豆包用户ID')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
