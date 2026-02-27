/**
 * 数据库种子数据
 * 运行: npx prisma db seed
 */

import { PrismaClient, UserRole, UserStatus, JobStatus, PolicyType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import cuid from 'cuid'

const prisma = new PrismaClient()

const SALT_ROUNDS = 10

async function main() {
  console.log('🌱 开始播种数据库...')

  // ==================== 清理现有数据 ====================
  console.log('📦 清理现有数据...')
  await prisma.emotionRecord.deleteMany()
  await prisma.jobPushRecord.deleteMany()
  await prisma.statistics.deleteMany()
  await prisma.portalConfig.deleteMany()
  await prisma.policy.deleteMany()
  await prisma.interview.deleteMany()
  await prisma.application.deleteMany()
  await prisma.resume.deleteMany()
  await prisma.job.deleteMany()
  await prisma.school.deleteMany()
  await prisma.enterprise.deleteMany()
  await prisma.user.deleteMany()

  // ==================== 创建管理员账号 ====================
  console.log('👤 创建管理员账号...')
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS)
  const now = new Date()
  const admin = await prisma.user.create({
    data: {
      id: cuid(),
      email: 'admin@wehan.com',
      name: '系统管理员',
      password: adminPassword,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      updatedAt: now,
    },
  })
  console.log('  ✅ 管理员: admin@wehan.com / admin123')

  // ==================== 创建测试企业 ====================
  console.log('🏢 创建测试企业...')
  const enterprises = await Promise.all([
    prisma.enterprise.create({
      data: {
        id: cuid(),
        name: '武汉光谷科技有限公司',
        industry: '互联网/IT',
        scale: '200-500',
        description: '专注于人工智能和大数据技术研发的高新技术企业',
        address: '武汉市东湖高新区光谷软件园',
        contactName: '张经理',
        contactPhone: '027-88888888',
        contactEmail: 'hr@guanggu-tech.com',
        verified: true,
        updatedAt: now,
      },
    }),
    prisma.enterprise.create({
      data: {
        id: cuid(),
        name: '长江智能制造有限公司',
        industry: '智能制造',
        scale: '500-1000',
        description: '工业4.0智能制造解决方案提供商',
        address: '武汉市经开区智能制造产业园',
        contactName: '李总监',
        contactPhone: '027-87654321',
        contactEmail: 'hr@changjiang-smart.com',
        verified: true,
        updatedAt: now,
      },
    }),
    prisma.enterprise.create({
      data: {
        id: cuid(),
        name: '楚天云计算服务有限公司',
        industry: '云计算',
        scale: '50-200',
        description: '提供企业级云服务和数字化转型解决方案',
        address: '武汉市洪山区光谷大道',
        contactName: '王经理',
        contactPhone: '027-87651234',
        contactEmail: 'hr@chutian-cloud.com',
        verified: true,
        updatedAt: now,
      },
    }),
  ])
  console.log(`  ✅ 创建 ${enterprises.length} 家企业`)

  // ==================== 创建企业用户 ====================
  console.log('👤 创建企业用户...')
  const enterprisePassword = await bcrypt.hash('enterprise123', SALT_ROUNDS)
  const enterpriseUsers = await Promise.all(
    enterprises.map((enterprise, index) =>
      prisma.user.create({
        data: {
          id: cuid(),
          email: `hr${index + 1}@enterprise.com`,
          name: `${enterprise.name}HR`,
          password: enterprisePassword,
          role: UserRole.ENTERPRISE,
          status: UserStatus.ACTIVE,
          enterpriseId: enterprise.id,
          updatedAt: now,
        },
      })
    )
  )
  console.log('  ✅ 企业用户: hr1@enterprise.com / enterprise123')

  // ==================== 创建测试学校 ====================
  console.log('🎓 创建测试学校...')
  const schools = await Promise.all([
    prisma.school.create({
      data: {
        id: cuid(),
        name: '武汉大学',
        type: '综合性',
        level: '本科',
        address: '武汉市武昌区珞珈山',
        contactName: '就业中心',
        contactPhone: '027-68754123',
        verified: true,
        updatedAt: now,
      },
    }),
    prisma.school.create({
      data: {
        id: cuid(),
        name: '华中科技大学',
        type: '理工',
        level: '本科',
        address: '武汉市洪山区珞喻路',
        contactName: '就业指导中心',
        contactPhone: '027-87542136',
        verified: true,
        updatedAt: now,
      },
    }),
    prisma.school.create({
      data: {
        id: cuid(),
        name: '武汉理工大学',
        type: '理工',
        level: '本科',
        address: '武汉市洪山区珞狮南路',
        contactName: '招生就业处',
        contactPhone: '027-87859017',
        verified: true,
        updatedAt: now,
      },
    }),
  ])
  console.log(`  ✅ 创建 ${schools.length} 所学校`)

  // ==================== 创建学校管理员 ====================
  console.log('👤 创建学校管理员...')
  const schoolPassword = await bcrypt.hash('school123', SALT_ROUNDS)
  const schoolUsers = await Promise.all(
    schools.map((school) =>
      prisma.user.create({
        data: {
          id: cuid(),
          email: `${school.name.replace(/大学|学院/g, '').toLowerCase()}@school.com`,
          name: `${school.name}就业办`,
          password: schoolPassword,
          role: UserRole.SCHOOL,
          status: UserStatus.ACTIVE,
          schoolManagedId: school.id,
          updatedAt: now,
        },
      })
    )
  )
  console.log('  ✅ 学校用户: 武大 / school123')

  // ==================== 创建政府用户 ====================
  console.log('👤 创建政府用户...')
  const governmentPassword = await bcrypt.hash('government123', SALT_ROUNDS)
  const governmentUser = await prisma.user.create({
    data: {
      id: cuid(),
      email: 'gov@wuhan.gov.cn',
      name: '武汉市人才服务中心',
      password: governmentPassword,
      role: UserRole.GOVERNMENT,
      status: UserStatus.ACTIVE,
      updatedAt: now,
    },
  })
  console.log('  ✅ 政府用户: gov@wuhan.gov.cn / government123')

  // ==================== 创建测试岗位 ====================
  console.log('💼 创建测试岗位...')
  const jobs = await Promise.all([
    // 企业1的岗位
    prisma.job.create({
      data: {
        id: cuid(),
        title: '前端开发工程师',
        enterpriseId: enterprises[0].id,
        industry: '互联网/IT',
        category: '技术研发',
        salaryMin: 12000,
        salaryMax: 20000,
        location: '武汉',
        address: '武汉市东湖高新区光谷软件园F3栋',
        description: `我们正在寻找一位有激情的前端开发工程师加入我们的团队。

工作职责：
- 负责公司产品的前端开发和维护
- 与设计师和后端工程师协作，实现产品功能
- 优化前端性能，提升用户体验
- 参与技术方案设计和代码评审`,
        requirements: `任职要求：
- 本科及以上学历，计算机相关专业
- 熟悉 React/Vue 等主流前端框架
- 熟悉 TypeScript、HTML5、CSS3
- 有良好的代码习惯和团队协作能力
- 应届毕业生亦可`,
        benefits: '五险一金、带薪年假、定期体检、节日福利、弹性工作',
        skills: ['React', 'TypeScript', 'CSS3', 'Git'],
        educationLevel: '本科',
        experienceYears: 0,
        freshGraduate: true,
        headcount: 3,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: now,
      },
    }),
    prisma.job.create({
      data: {
        id: cuid(),
        title: '后端开发工程师',
        enterpriseId: enterprises[0].id,
        industry: '互联网/IT',
        category: '技术研发',
        salaryMin: 15000,
        salaryMax: 25000,
        location: '武汉',
        description: '负责公司核心业务系统的后端开发，使用 Node.js/Java 技术栈',
        requirements: '本科及以上学历，熟悉 Node.js 或 Java，了解数据库设计',
        benefits: '五险一金、带薪年假、股票期权',
        skills: ['Node.js', 'Java', 'PostgreSQL', 'Redis'],
        educationLevel: '本科',
        experienceYears: 1,
        freshGraduate: true,
        headcount: 2,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: now,
      },
    }),
    prisma.job.create({
      data: {
        id: cuid(),
        title: 'AI算法工程师',
        enterpriseId: enterprises[0].id,
        industry: '互联网/IT',
        category: '人工智能',
        salaryMin: 20000,
        salaryMax: 35000,
        location: '武汉',
        description: '负责机器学习模型的研发和优化，包括NLP、推荐系统等方向',
        requirements: '硕士及以上学历，熟悉深度学习框架，有论文发表者优先',
        benefits: '五险一金、带薪年假、科研经费支持',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP'],
        educationLevel: '硕士',
        experienceYears: 0,
        freshGraduate: true,
        headcount: 2,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: now,
      },
    }),
    // 企业2的岗位
    prisma.job.create({
      data: {
        id: cuid(),
        title: '机械设计工程师',
        enterpriseId: enterprises[1].id,
        industry: '智能制造',
        category: '机械设计',
        salaryMin: 10000,
        salaryMax: 18000,
        location: '武汉',
        description: '负责智能装备的机械结构设计和优化',
        requirements: '本科及以上学历，机械相关专业，熟练使用 CAD/SolidWorks',
        benefits: '五险一金、包吃住、年终奖',
        skills: ['CAD', 'SolidWorks', '机械设计'],
        educationLevel: '本科',
        experienceYears: 0,
        freshGraduate: true,
        headcount: 5,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: now,
      },
    }),
    prisma.job.create({
      data: {
        id: cuid(),
        title: '电气工程师',
        enterpriseId: enterprises[1].id,
        industry: '智能制造',
        category: '电气设计',
        salaryMin: 12000,
        salaryMax: 20000,
        location: '武汉',
        description: '负责自动化生产线的电气系统设计和调试',
        requirements: '本科及以上学历，电气自动化相关专业，熟悉 PLC 编程',
        benefits: '五险一金、包吃住、技术培训',
        skills: ['PLC', '电气设计', 'AutoCAD'],
        educationLevel: '本科',
        experienceYears: 1,
        freshGraduate: true,
        headcount: 3,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: now,
      },
    }),
    // 企业3的岗位
    prisma.job.create({
      data: {
        id: cuid(),
        title: '云运维工程师',
        enterpriseId: enterprises[2].id,
        industry: '云计算',
        category: '运维',
        salaryMin: 12000,
        salaryMax: 20000,
        location: '武汉',
        description: '负责企业云平台的运维和优化',
        requirements: '本科及以上学历，熟悉 Linux、Docker、Kubernetes',
        benefits: '五险一金、弹性工作、技术培训',
        skills: ['Linux', 'Docker', 'Kubernetes', 'AWS'],
        educationLevel: '本科',
        experienceYears: 0,
        freshGraduate: true,
        headcount: 2,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: now,
      },
    }),
    prisma.job.create({
      data: {
        id: cuid(),
        title: '产品经理',
        enterpriseId: enterprises[2].id,
        industry: '云计算',
        category: '产品',
        salaryMin: 15000,
        salaryMax: 25000,
        location: '武汉',
        description: '负责云服务产品的规划、设计和迭代',
        requirements: '本科及以上学历，有产品思维，良好的沟通能力',
        benefits: '五险一金、弹性工作、团队建设',
        skills: ['产品规划', '需求分析', 'Axure'],
        educationLevel: '本科',
        experienceYears: 2,
        freshGraduate: false,
        headcount: 1,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        updatedAt: now,
      },
    }),
  ])
  console.log(`  ✅ 创建 ${jobs.length} 个岗位`)

  // ==================== 创建测试政策 ====================
  console.log('📋 创建测试政策...')
  const policies = await Promise.all([
    prisma.policy.create({
      data: {
        id: cuid(),
        title: '武汉市大学生落户政策',
        type: PolicyType.TALENT,
        content: `为吸引和留住优秀人才，武汉市出台了一系列大学生落户优惠政策。

政策要点：
1. 全日制本科及以上学历毕业生，凭毕业证即可落户
2. 硕士、博士研究生享受"零门槛"落户
3. 落户办理时限压缩至1个工作日`,
        summary: '本科及以上学历毕业生凭毕业证即可落户武汉',
        conditions: '全日制本科及以上学历，毕业5年内',
        benefits: '落户便捷、无社保年限要求、办理速度快',
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
        updatedAt: now,
      },
    }),
    prisma.policy.create({
      data: {
        id: cuid(),
        title: '大学毕业生租房补贴',
        type: PolicyType.HOUSING,
        content: `武汉市为大学毕业生提供租房补贴支持。

补贴标准：
- 本科生：每月800元，最长3年
- 硕士生：每月1200元，最长3年
- 博士生：每月2000元，最长5年`,
        summary: '本科生每月800元租房补贴，最长3年',
        conditions: '毕业5年内，在武汉就业或创业，无自有住房',
        benefits: '本科800元/月，硕士1200元/月，博士2000元/月',
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
        updatedAt: now,
      },
    }),
    prisma.policy.create({
      data: {
        id: cuid(),
        title: '大学生创业担保贷款',
        type: PolicyType.ENTREPRENEUR,
        content: `支持大学生在武汉创业，提供免担保贷款。

贷款额度：
- 个人创业：最高50万元
- 合伙创业：最高200万元
- 小微企业：最高500万元

贷款期限最长3年，财政给予贴息支持。`,
        summary: '大学生创业最高可获50万元免担保贷款',
        conditions: '毕业5年内的大学生，在武汉创办企业',
        benefits: '最高50万元免担保贷款，财政贴息',
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
        updatedAt: now,
      },
    }),
    prisma.policy.create({
      data: {
        id: cuid(),
        title: '高校毕业生就业补贴',
        type: PolicyType.SUBSIDY,
        content: `对到中小微企业就业的高校毕业生给予就业补贴。

补贴标准：
- 本科生：一次性5000元
- 硕士生：一次性8000元
- 博士生：一次性15000元`,
        summary: '到中小微企业就业可获5000-15000元补贴',
        conditions: '毕业2年内，与武汉中小微企业签订1年以上劳动合同',
        benefits: '一次性发放5000-15000元',
        effectiveDate: new Date('2024-01-01'),
        isActive: true,
        updatedAt: now,
      },
    }),
  ])
  console.log(`  ✅ 创建 ${policies.length} 条政策`)

  // ==================== 创建门户配置 ====================
  console.log('⚙️ 创建门户配置...')
  await prisma.portalConfig.create({
    data: {
      id: cuid(),
      key: 'site_info',
      value: {
        name: '才聚江城',
        description: '武汉人才留汉智能服务平台',
        contactEmail: 'contact@wehan.com',
        contactPhone: '027-12345678',
      },
      description: '网站基本信息配置',
      updatedAt: now,
    },
  })
  console.log('  ✅ 创建门户配置')

  // ==================== 总结 ====================
  console.log('\n🎉 数据库播种完成！')
  console.log('\n📝 测试账号：')
  console.log('  ├─ 管理员: admin@wehan.com / admin123')
  console.log('  ├─ 企业HR: hr1@enterprise.com / enterprise123')
  console.log('  ├─ 学校: 武大@school.com / school123')
  console.log('  └─ 政府: gov@wuhan.gov.cn / government123')
  console.log('\n📊 数据统计：')
  console.log(`  ├─ 企业: ${enterprises.length} 家`)
  console.log(`  ├─ 学校: ${schools.length} 所`)
  console.log(`  ├─ 岗位: ${jobs.length} 个`)
  console.log(`  └─ 政策: ${policies.length} 条`)
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
