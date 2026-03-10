/**
 * 扩展种子数据 - 20个新岗位 + 10条官方政策
 * 运行: npx tsx prisma/seed-ext.ts
 */

import { PrismaClient, UserRole, UserStatus, JobStatus, PolicyType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import cuid from 'cuid'

const prisma = new PrismaClient()
const SALT_ROUNDS = 10

// ==================== 20个新岗位 ====================
const newJobs = [
  // 武汉东湖高新区企业
  {
    title: 'Java全栈开发工程师',
    enterpriseName: '武汉网讯信息技术有限公司',
    industry: '互联网/IT',
    category: '技术研发',
    salaryMin: 13000,
    salaryMax: 22000,
    location: '武汉市东湖高新区光谷大道303号',
    description: '负责公司SaaS平台的全栈开发，使用Spring Boot + Vue技术栈',
    requirements: '本科及以上学历，熟悉Spring Boot、Vue.js、MySQL，有项目经验者优先',
    benefits: '五险一金、带薪年假、餐补、交通补、节日福利',
    skills: ['Java', 'Spring Boot', 'Vue.js', 'MySQL', 'Redis'],
    educationLevel: '本科',
    experienceYears: 1,
    freshGraduate: true,
    headcount: 2,
  },
  {
    title: '移动端开发工程师(iOS)',
    enterpriseName: '武汉光谷移动互联科技有限公司',
    industry: '互联网/IT',
    category: '移动开发',
    salaryMin: 15000,
    salaryMax: 26000,
    location: '武汉市东湖高新区光谷软件园',
    description: '负责公司iOS应用的开发和维护，参与架构设计',
    requirements: '本科及以上学历，熟悉Swift/Objective-C，有App Store上架作品',
    benefits: '五险一金、股票期权、MacBook Pro、定期团建',
    skills: ['Swift', 'iOS', 'Objective-C', 'Xcode', 'CocoaPods'],
    educationLevel: '本科',
    experienceYears: 1,
    freshGraduate: true,
    headcount: 2,
  },
  {
    title: '数据分析师',
    enterpriseName: '武汉数智科技有限公司',
    industry: '互联网/IT',
    category: '数据分析',
    salaryMin: 10000,
    salaryMax: 18000,
    location: '武汉市东湖高新区金融港',
    description: '负责业务数据分析、报表制作，为决策提供数据支持',
    requirements: '本科及以上学历，统计学/数学/计算机专业，熟悉SQL、Excel、Python',
    benefits: '五险一金、弹性工作、下午茶、健身房',
    skills: ['SQL', 'Python', 'Excel', 'Tableau', '数据分析'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 3,
  },
  {
    title: '网络安全工程师',
    enterpriseName: '武汉网盾安全技术有限公司',
    industry: '互联网/IT',
    category: '安全',
    salaryMin: 15000,
    salaryMax: 28000,
    location: '武汉市东湖高新区光谷创业街',
    description: '负责公司网络安全防护体系建设、漏洞扫描与修复',
    requirements: '本科及以上学历，网络安全相关专业，熟悉渗透测试、安全加固',
    benefits: '五险一金、年终奖、安全培训、证书补贴',
    skills: ['网络安全', '渗透测试', 'Linux', 'Python', 'CISSP'],
    educationLevel: '本科',
    experienceYears: 1,
    freshGraduate: false,
    headcount: 2,
  },
  {
    title: 'UI/UX设计师',
    enterpriseName: '武汉创意互动科技有限公司',
    industry: '互联网/IT',
    category: '设计',
    salaryMin: 10000,
    salaryMax: 18000,
    location: '武汉市洪山区光谷广场',
    description: '负责产品界面设计、用户体验优化，参与设计规范制定',
    requirements: '本科及以上学历，设计相关专业，精通Figma、Sketch、Adobe XD',
    benefits: '五险一金、设计津贴、弹性工作、作品集支持',
    skills: ['Figma', 'Sketch', 'Photoshop', 'UI设计', 'UX设计'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },

  // 武汉经开区企业
  {
    title: '嵌入式开发工程师',
    enterpriseName: '武汉东风智能网联汽车技术有限公司',
    industry: '智能制造',
    category: '嵌入式',
    salaryMin: 14000,
    salaryMax: 24000,
    location: '武汉市经开区东风大道',
    description: '负责车载系统嵌入式软件开发，参与自动驾驶项目',
    requirements: '本科及以上学历，电子/通信/自动化专业，熟悉C/C++、RTOS',
    benefits: '五险一金、年终奖、购车优惠、班车接送',
    skills: ['C/C++', 'RTOS', 'Linux', 'CAN总线', '嵌入式'],
    educationLevel: '本科',
    experienceYears: 1,
    freshGraduate: true,
    headcount: 3,
  },
  {
    title: '测试工程师',
    enterpriseName: '武汉华星光电技术有限公司',
    industry: '智能制造',
    category: '测试',
    salaryMin: 9000,
    salaryMax: 16000,
    location: '武汉市经开区光谷左岭',
    description: '负责面板显示产品的测试工作，编写测试用例和报告',
    requirements: '本科及以上学历，电子/机械相关专业，熟悉测试流程和工具',
    benefits: '五险一金、包吃住、高温补贴、夜班补贴',
    skills: ['测试', 'Python', 'Selenium', 'JIRA', '自动化测试'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 5,
  },
  {
    title: '工业设计师',
    enterpriseName: '武汉格力智能装备有限公司',
    industry: '智能制造',
    category: '设计',
    salaryMin: 11000,
    salaryMax: 20000,
    location: '武汉市经开区格力产业园',
    description: '负责智能装备产品的外观设计、人机工程设计',
    requirements: '本科及以上学历，工业设计专业，精通Rhino、KeyShot',
    benefits: '五险一金、年终奖、员工宿舍、空调补贴',
    skills: ['Rhino', 'KeyShot', 'SolidWorks', '工业设计', '产品建模'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },

  // 武汉洪山区/武昌区企业
  {
    title: '新媒体运营专员',
    enterpriseName: '武汉楚天传媒文化有限公司',
    industry: '文化传媒',
    category: '运营',
    salaryMin: 8000,
    salaryMax: 15000,
    location: '武汉市武昌区积玉桥',
    description: '负责公众号、短视频账号运营，内容策划与粉丝增长',
    requirements: '本科及以上学历，新闻/传播/广告专业，有新媒体运营经验',
    benefits: '五险一金、弹性工作、节日福利、下午茶',
    skills: ['公众号运营', '短视频', '内容策划', 'PS', '数据分析'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },
  {
    title: '电商运营专员',
    enterpriseName: '武汉良品铺子食品股份有限公司',
    industry: '电子商务',
    category: '运营',
    salaryMin: 9000,
    salaryMax: 16000,
    location: '武汉市武昌区万达广场',
    description: '负责电商平台店铺运营、活动策划、数据分析',
    requirements: '本科及以上学历，电子商务/市场营销专业，熟悉淘宝/京东平台',
    benefits: '五险一金、产品福利、年终奖、带薪年假',
    skills: ['电商运营', '淘宝', '京东', '数据分析', '活动策划'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 3,
  },
  {
    title: '人力资源专员',
    enterpriseName: '武汉人瑞人才服务有限公司',
    industry: '人力资源',
    category: '人事',
    salaryMin: 7000,
    salaryMax: 12000,
    location: '武汉市洪山区街道口',
    description: '负责招聘、员工关系、培训等人力资源工作',
    requirements: '本科及以上学历，人力资源管理专业，熟悉劳动法',
    benefits: '五险一金、节日福利、专业培训、晋升空间',
    skills: ['招聘', '员工关系', '培训', '劳动法', 'HRBP'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },

  // 武汉江汉区企业
  {
    title: '财务专员',
    enterpriseName: '武汉永辉超市有限公司',
    industry: '零售',
    category: '财务',
    salaryMin: 7000,
    salaryMax: 11000,
    location: '武汉市江汉区武商广场',
    description: '负责日常会计核算、报表编制、税务申报',
    requirements: '本科及以上学历，会计/财务管理专业，有会计从业资格证',
    benefits: '五险一金、年终奖、节日福利、购物卡',
    skills: ['会计核算', '税务申报', 'Excel', '财务软件', 'CPA'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },
  {
    title: '市场营销专员',
    enterpriseName: '武汉中百控股集团股份有限公司',
    industry: '零售',
    category: '市场',
    salaryMin: 8000,
    salaryMax: 14000,
    location: '武汉市江汉区中山大道',
    description: '负责市场活动策划执行、品牌推广、渠道拓展',
    requirements: '本科及以上学历，市场营销相关专业，有创新思维',
    benefits: '五险一金、年终奖、购物福利、年节福利',
    skills: ['市场策划', '品牌推广', '活动执行', 'PPT', '数据分析'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 3,
  },

  // 金融行业
  {
    title: '投资分析师',
    enterpriseName: '武汉光谷金融控股集团有限公司',
    industry: '金融',
    category: '投资',
    salaryMin: 15000,
    salaryMax: 25000,
    location: '武汉市东湖高新区光谷资本大厦',
    description: '负责行业研究、投资项目尽调、投资报告撰写',
    requirements: '硕士及以上学历，金融/经济相关专业，有CFA证书者优先',
    benefits: '五险一金、年终奖、带薪年假、体检',
    skills: ['投资分析', '行业研究', '财务分析', 'PPT', 'CFA'],
    educationLevel: '硕士',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },
  {
    title: '风控专员',
    enterpriseName: '汉口银行股份有限公司',
    industry: '金融',
    category: '风控',
    salaryMin: 10000,
    salaryMax: 18000,
    location: '武汉市江汉区建设大道',
    description: '负责信贷风险审查、风险评估报告撰写',
    requirements: '本科及以上学历，金融/统计专业，熟悉风控模型',
    benefits: '五险一金、年终奖、节日福利、体检',
    skills: ['风险控制', '信贷审查', '数据分析', 'SAS', '风控模型'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },

  // 教育行业
  {
    title: '课程顾问',
    enterpriseName: '武汉新东方培训学校',
    industry: '教育',
    category: '销售',
    salaryMin: 8000,
    salaryMax: 20000,
    location: '武汉市洪山区珞喻路',
    description: '负责课程销售、学员咨询、学业规划',
    requirements: '本科及以上学历，专业不限，有销售经验优先',
    benefits: '五险一金、课时费、带薪年假、子女免费课程',
    skills: ['销售', '沟通能力', '课程顾问', '教育', '咨询服务'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 5,
  },
  {
    title: '教学管培生',
    enterpriseName: '武汉学而思培优在线教育科技有限公司',
    industry: '教育',
    category: '教学',
    salaryMin: 10000,
    salaryMax: 18000,
    location: '武汉市武昌区中北路',
    description: '作为教学方向储备干部，参与教研、授课、课程设计',
    requirements: '本科及以上学历，专业不限，有竞赛经历优先',
    benefits: '五险一金、课时费、年终奖、带薪年假',
    skills: ['教学', '课程设计', '沟通', 'PPT', 'K12教育'],
    educationLevel: '本科',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 10,
  },

  // 生物医药
  {
    title: '生物信息工程师',
    enterpriseName: '武汉华大基因科技有限公司',
    industry: '生物医药',
    category: '研发',
    salaryMin: 15000,
    salaryMax: 28000,
    location: '武汉市东湖高新区生物城',
    description: '负责基因组数据分析、流程优化、算法开发',
    requirements: '硕士及以上学历，生物信息/计算机相关专业，熟悉Python/R',
    benefits: '五险一金、年终奖、科研支持、论文奖励',
    skills: ['Python', 'R', '基因组学', '生物信息', 'Linux'],
    educationLevel: '硕士',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 3,
  },
  {
    title: '药物研发专员',
    enterpriseName: '武汉明德生物科技股份有限公司',
    industry: '生物医药',
    category: '研发',
    salaryMin: 12000,
    salaryMax: 22000,
    location: '武汉市东湖高新区生物城',
    description: '负责体外诊断试剂的研发、实验、验证',
    requirements: '硕士及以上学历，生物/医学相关专业，有实验室经验',
    benefits: '五险一金、年终奖、科研经费、住房补贴',
    skills: ['分子生物学', '细胞培养', 'ELISA', 'PCR', '研发'],
    educationLevel: '硕士',
    experienceYears: 0,
    freshGraduate: true,
    headcount: 2,
  },
]

// ==================== 10条官方政策 ====================
const officialPolicies = [
  {
    title: '武汉市高校毕业生落户政策',
    type: PolicyType.TALENT,
    content: `根据武汉市落户政策：

一、办理条件
1. 全日制本科及以上学历毕业生，可凭毕业证落户
2. 硕士、博士研究生享受"零门槛"落户
3. 技工院校预备技师班毕业生可落户

二、办理材料
1. 毕业证原件
2. 身份证
3. 户口本（家庭户）/集体户申请表（学校集体户）

三、办理时限
1. 网上办理：1个工作日
2. 窗口办理：3个工作日

来源：武汉市公安局官网
政策依据：武公规[2023]1号`,
    summary: '全日制本科及以上学历毕业生凭毕业证即可落户武汉，硕士博士"零门槛"落户',
    conditions: '全日制本科及以上学历，毕业5年内',
    benefits: '落户便捷、无社保年限要求、办理时间压缩至1-3个工作日',
    effectiveDate: new Date('2023-01-01'),
  },
  {
    title: '大学毕业生租赁房政策',
    type: PolicyType.HOUSING,
    content: `武汉市人才租赁房政策：

一、申请条件
1. 毕业3年内普通高校大学生
2. 在武汉就业创业
3. 家庭在武汉无自有住房

二、补贴标准
1. 博士研究生：免租2年，后续按市场价70%缴纳
2. 硕士研究生：免租1年，后续按市场价70%缴纳
3. 本科毕业生：按市场价70%缴纳租金

三、申请流程
1. 通过"武汉人才租赁房平台"在线申请
2. 提交学历证明、就业证明等材料
3. 审核通过后摇号配租

来源：武汉市住房保障和房屋管理局
政策依据：武房规[2022]2号`,
    summary: '本科及以上学历毕业生可享受人才租赁房租金减免优惠',
    conditions: '毕业3年内，在武汉就业创业，家庭无自有住房',
    benefits: '博士免租2年，硕士免租1年，本科按市场价70%缴纳租金',
    effectiveDate: new Date('2022-03-01'),
  },
  {
    title: '东湖高新区"3551光谷人才计划"',
    type: PolicyType.TALENT,
    content: `武汉东湖高新区3551人才政策：

一、人才类别
1. 顶尖人才：给予最高1亿元综合资助
2. 创新人才：给予100万元无偿资助
3. 高端管理人才：给予50万元无偿资助
4. 优秀青年人才：给予最高30万元无偿资助

二、申请条件
1. 在东湖高新区就业创业
2. 符合相应人才认定标准
3. 签订3年以上劳动合同

三、申报方式
通过"3551人才政策申报平台"在线申报

来源：武汉东湖新技术开发区管委会
政策依据：光谷科创[2024]1号`,
    summary: '东湖高新区引进高端人才，最高可获1亿元综合资助',
    conditions: '在东湖高新区就业创业，符合人才认定标准',
    benefits: '顶尖人才最高1亿元，创新人才100万，优秀青年人才最高30万',
    effectiveDate: new Date('2024-01-01'),
  },
  {
    title: '大学毕业生创业扶持政策',
    type: PolicyType.ENTREPRENEUR,
    content: `武汉市大学生创业扶持：

一、创业担保贷款
1. 个人创业：最高50万元
2. 合伙创业：最高200万元
3. 小微企业：最高500万元
4. 贷款期限最长3年，财政贴息

二、创业补贴
1. 一次性创业补贴：5000元
2. 场租补贴：最高6000元/年，最长3年
3. 带动就业补贴：每吸纳1人补贴2000元

三、孵化支持
1. 入驻政府认定孵化器免租金
2. 创业导师辅导
3. 融资对接服务

来源：武汉市人力资源和社会保障局
政策依据：武人社发[2023]15号`,
    summary: '大学生创业最高可获50万元免担保贷款及多项创业补贴',
    conditions: '毕业5年内高校毕业生，在武汉创办企业',
    benefits: '最高50万元免担保贷款，财政贴息，场租补贴最高6000元/年',
    effectiveDate: new Date('2023-01-01'),
  },
  {
    title: '人才购房补贴政策',
    type: PolicyType.HOUSING,
    content: `武汉市人才购房补贴政策：

一、补贴对象
1. 博士毕业生：最高10万元购房补贴
2. 硕士毕业生：最高6万元购房补贴
3. 本科毕业生：最高3万元购房补贴

二、申请条件
1. 毕业5年内大学生
2. 在武汉就业并缴纳社保满1年
3. 购买首套自住住房
4. 家庭在武汉无其他住房

三、申请方式
通过"武汉市人才购房补贴平台"在线申请

来源：武汉市住房保障和房屋管理局
政策依据：武房规[2023]3号`,
    summary: '博士最高10万元、硕士6万元、本科3万元购房补贴',
    conditions: '毕业5年内，在武汉就业缴社保满1年，购买首套房',
    benefits: '博士10万、硕士6万、本科3万购房补贴',
    effectiveDate: new Date('2023-06-01'),
  },
  {
    title: '武汉经开区"人才强区战略3.0"',
    type: PolicyType.TALENT,
    content: `武汉经开区人才政策：

一、领军人才支持
1. 给予最高500万元综合资助
2. 提供免费人才公寓
3. 子女优先入学

二、青年人才支持
1. 博士：每人20万元生活补贴
2. 硕士：每人10万元生活补贴
3. 本科：每人5万元生活补贴

三、技能人才支持
1. 高级技师：每人10万元奖励
2. 技师：每人5万元奖励
3. 技工技能竞赛获奖者最高20万元奖励

来源：武汉经济技术开发区管委会
政策依据：武经开[2024]1号`,
    summary: '武汉经开区为人才提供生活补贴，博士20万、硕士10万、本科5万',
    conditions: '在武汉经开区就业创业，签订3年以上劳动合同',
    benefits: '博士20万、硕士10万、本科5万生活补贴',
    effectiveDate: new Date('2024-01-01'),
  },
  {
    title: '企业吸纳就业社会保险补贴',
    type: PolicyType.SUBSIDY,
    content: `企业吸纳高校毕业生社保补贴：

一、补贴对象
招用毕业2年内高校毕业生的武汉中小微企业

二、补贴标准
1. 按企业为毕业生缴纳的社保部分给予补贴
2. 养老保险补贴：单位缴费部分全额
3. 医疗保险补贴：单位缴费部分全额
4. 失业保险补贴：单位缴费部分全额
5. 补贴期限：最长1年

三、申请方式
通过"武汉市人社局网上办事大厅"申请

来源：武汉市人力资源和社会保障局
政策依据：武人社规[2023]2号`,
    summary: '企业招用毕业2年内高校毕业生，可获社保单位缴纳部分全额补贴',
    conditions: '武汉中小微企业招用毕业2年内高校毕业生',
    benefits: '养老、医疗、失业保险单位缴费部分全额补贴，最长1年',
    effectiveDate: new Date('2023-01-01'),
  },
  {
    title: '高校毕业生就业见习补贴',
    type: PolicyType.SUBSIDY,
    content: `高校毕业生就业见习政策：

一、见习基地
武汉认定的见习基地可接收毕业生见习

二、见习补贴
1. 见习期：3-12个月
2. 补贴标准：
   - 本科生：每月1500元
   - 硕士生：每月2000元
   - 博士生：每月3000元
3. 见习留用率超过50%的，给予额外奖励

三、申请条件
1. 毕业两年内未就业高校毕业生
2. 16-24岁失业青年

来源：武汉市人力资源和社会保障局
政策依据：武人社规[2023]5号`,
    summary: '毕业生参加就业见习可获生活补贴，本科每月1500元',
    conditions: '毕业两年内未就业高校毕业生或16-24岁失业青年',
    benefits: '本科1500元/月、硕士2000元/月、博士3000元/月',
    effectiveDate: new Date('2023-03-01'),
  },
  {
    title: '技能提升培训补贴',
    type: PolicyType.SUBSIDY,
    content: `武汉市职业技能培训补贴：

一、补贴对象
1. 武汉市户籍劳动者
2. 在武汉就业并缴纳社保的外来劳动者
3. 毕业年度高校毕业生

二、补贴标准
1. 初级工（五级）：最高1200元
2. 中级工（四级）：最高1600元
3. 高级工（三级）：最高2000元
4. 技师（二级）：最高2500元
5. 高级技师（一级）：最高3000元

三、培训工种
包括电工、焊工、厨师、护理、计算机等200多个工种

来源：武汉市人力资源和社会保障局
政策依据：武人社规[2023]8号`,
    summary: '参加职业技能培训最高可获3000元补贴',
    conditions: '武汉市户籍或在汉就业劳动者，参加指定工种培训',
    benefits: '初级工1200元，中级工1600元，高级工2000元，最高3000元',
    effectiveDate: new Date('2023-01-01'),
  },
  {
    title: '留学回国人员创业支持',
    type: PolicyType.ENTREPRENEUR,
    content: `武汉市留学回国人员创业扶持：

一、启动资金支持
1. 硕士留学回国人员：20万元启动资金
2. 博士留学回国人员：50万元启动资金
3. 优秀项目最高200万元支持

二、办公场地支持
1. 免费提供办公场地（3年）
2. 孵化器入驻优惠

三、其他支持
1. 子女入学优先安排
2. 配偶就业协助
3. 医疗保健绿色通道

来源：武汉市人力资源和社会保障局
政策依据：武外专[2023]1号`,
    summary: '留学回国人员创业可获20-50万元启动资金支持',
    conditions: '在国（境）外学习并获得学士及以上学位，回国后在武汉创业',
    benefits: '硕士20万、博士50万启动资金，免费办公场地3年',
    effectiveDate: new Date('2023-01-01'),
  },
]

async function main() {
  console.log('🌱 开始扩展数据库...')

  const now = new Date()

  // ==================== 创建新企业 ====================
  console.log('🏢 创建新企业...')
  const enterpriseNames = [...new Set(newJobs.map(j => j.enterpriseName))]
  const newEnterprises: any[] = []

  for (const name of enterpriseNames) {
    const existing = await prisma.enterprise.findFirst({
      where: { name }
    })

    if (existing) {
      newEnterprises.push(existing)
    } else {
      const jobData = newJobs.find(j => j.enterpriseName === name)!
      const created = await prisma.enterprise.create({
        data: {
          id: cuid(),
          name,
          industry: jobData.industry,
          scale: '100-500',
          description: `${name}是一家在武汉本地注册的企业，致力于相关领域的研发与服务。`,
          address: jobData.location,
          contactName: 'HR',
          contactPhone: '027-xxxxxxxx',
          contactEmail: `hr@${name.replace(/[^\w]/g, '').toLowerCase()}.com`,
          verified: true,
          updatedAt: now,
        },
      })
      newEnterprises.push(created)
    }
  }
  console.log(`  ✅ 创建 ${newEnterprises.length} 家新企业`)

  // ==================== 创建新岗位 ====================
  console.log('💼 创建新岗位...')
  const jobPromises = newJobs.map(job => {
    const enterprise = newEnterprises.find(e => e.name === job.enterpriseName)!
    return prisma.job.create({
      data: {
        id: cuid(),
        title: job.title,
        enterpriseId: enterprise.id,
        industry: job.industry,
        category: job.category,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        location: job.location,
        address: job.location,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        skills: job.skills,
        educationLevel: job.educationLevel,
        experienceYears: job.experienceYears,
        freshGraduate: job.freshGraduate,
        headcount: job.headcount,
        status: JobStatus.PUBLISHED,
        publishedAt: now,
        updatedAt: now,
      },
    })
  })

  const createdJobs = await Promise.all(jobPromises)
  console.log(`  ✅ 创建 ${createdJobs.length} 个新岗位`)

  // ==================== 创建新政策 ====================
  console.log('📋 创建官方政策...')
  const policyPromises = officialPolicies.map(policy =>
    prisma.policy.create({
      data: {
        id: cuid(),
        title: policy.title,
        type: policy.type,
        content: policy.content,
        summary: policy.summary,
        conditions: policy.conditions,
        benefits: policy.benefits,
        effectiveDate: policy.effectiveDate,
        isActive: true,
        updatedAt: now,
      },
    })
  )

  const createdPolicies = await Promise.all(policyPromises)
  console.log(`  ✅ 创建 ${createdPolicies.length} 条官方政策`)

  // ==================== 总结 ====================
  console.log('\n🎉 扩展数据库完成！')
  console.log('\n📊 新增数据统计：')
  console.log(`  ├─ 新企业: ${newEnterprises.length} 家`)
  console.log(`  ├─ 新岗位: ${createdJobs.length} 个`)
  console.log(`  └─ 新政策: ${createdPolicies.length} 条`)

  console.log('\n💡 提示：运行以下命令查看所有数据')
  console.log('  npx prisma studio')
}

main()
  .catch(e => {
    console.error('❌ 扩展失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
