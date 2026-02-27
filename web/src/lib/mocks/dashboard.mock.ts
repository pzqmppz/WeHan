/**
 * Mock 数据
 * 开发阶段使用，生产环境替换为真实 API
 */

// ==================== 企业端 Mock ====================

export const mockEnterpriseDashboard = {
  statistics: {
    todayApplications: 12,
    pendingResumes: 28,
    todayInterviews: 5,
    hired: 8,
  },

  recentApplications: [
    { id: '1', name: '张三', position: '前端开发工程师', school: '武汉大学', score: 85, time: '10分钟前' },
    { id: '2', name: '李四', position: '产品经理', school: '华中科技大学', score: 92, time: '30分钟前' },
    { id: '3', name: '王五', position: 'Java开发工程师', school: '武汉理工大学', score: 78, time: '1小时前' },
    { id: '4', name: '赵六', position: 'UI设计师', school: '湖北大学', score: 88, time: '2小时前' },
    { id: '5', name: '钱七', position: '数据分析师', school: '中南财经政法大学', score: 81, time: '3小时前' },
  ],

  hotJobs: [
    { id: '1', title: '前端开发工程师', applications: 45, views: 230 },
    { id: '2', title: '产品经理', applications: 38, views: 180 },
    { id: '3', title: 'Java开发工程师', applications: 32, views: 156 },
    { id: '4', title: 'UI设计师', applications: 28, views: 142 },
    { id: '5', title: '数据分析师', applications: 25, views: 128 },
  ],
}

// ==================== 政府端 Mock ====================

export const mockGovernmentDashboard = {
  statistics: {
    totalApplications: 8650,
    totalContracts: 2150,
    retentionRate: 68.5,
    totalEnterprises: 120,
  },

  industryDistribution: [
    { name: '互联网/IT', count: 1250, percent: 35 },
    { name: '金融', count: 680, percent: 19 },
    { name: '制造业', count: 520, percent: 15 },
    { name: '教育', count: 380, percent: 11 },
    { name: '医疗健康', count: 320, percent: 9 },
    { name: '房地产', count: 280, percent: 8 },
    { name: '其他', count: 220, percent: 3 },
  ],

  schoolRetention: [
    { name: '武汉大学', retention: 72, total: 1200 },
    { name: '华中科技大学', retention: 75, total: 1100 },
    { name: '武汉理工大学', retention: 68, total: 980 },
    { name: '华中师范大学', retention: 65, total: 850 },
    { name: '中国地质大学', retention: 62, total: 720 },
    { name: '华中农业大学', retention: 60, total: 680 },
    { name: '中南财经政法大学', retention: 70, total: 750 },
    { name: '湖北大学', retention: 55, total: 620 },
  ],

  monthlyTrend: [
    { month: '2025-08', applications: 1200, contracts: 280 },
    { month: '2025-09', applications: 1500, contracts: 350 },
    { month: '2025-10', applications: 1800, contracts: 420 },
    { month: '2025-11', applications: 1650, contracts: 380 },
    { month: '2025-12', applications: 1400, contracts: 320 },
    { month: '2026-01', applications: 1100, contracts: 400 },
  ],
}

// ==================== 学校端 Mock ====================

export const mockSchoolDashboard = {
  statistics: {
    totalStudents: 5200,
    employedRate: 78.5,
    totalPushed: 1250,
    pendingReview: 45,
  },

  employmentByMajor: [
    { major: '计算机科学与技术', total: 320, employed: 280, rate: 87.5 },
    { major: '软件工程', total: 280, employed: 252, rate: 90 },
    { major: '电子信息工程', total: 240, employed: 204, rate: 85 },
    { major: '机械工程', total: 200, employed: 150, rate: 75 },
    { major: '工商管理', total: 180, employed: 126, rate: 70 },
    { major: '会计学', total: 160, employed: 120, rate: 75 },
  ],

  destinationDistribution: [
    { destination: '武汉本地', count: 2450, percent: 60 },
    { destination: '北上广深', count: 980, percent: 24 },
    { destination: '其他城市', count: 650, percent: 16 },
  ],

  recentActivities: [
    { id: '1', type: 'push', title: '腾讯武汉研发中心岗位推送', time: '2小时前', count: 45 },
    { id: '2', type: 'interview', title: '华为校招面试安排', time: '5小时前', count: 28 },
    { id: '3', type: 'offer', title: '小米武汉Offer发放', time: '1天前', count: 12 },
  ],
}

// ==================== 管理员 Mock ====================

export const mockAdminDashboard = {
  statistics: {
    totalUsers: 15680,
    totalEnterprises: 120,
    totalSchools: 45,
    totalJobs: 2350,
    totalApplications: 8650,
    todayActive: 3250,
  },

  recentUsers: [
    { id: '1', name: '张三', email: 'zhangsan@whu.edu.cn', role: '学生', school: '武汉大学', time: '10分钟前' },
    { id: '2', name: '李四', email: 'lisi@hust.edu.cn', role: '学生', school: '华中科技大学', time: '30分钟前' },
    { id: '3', name: '王五', email: 'wangwu@company.com', role: '企业', company: '腾讯武汉', time: '1小时前' },
  ],

  pendingReviews: [
    { id: '1', type: 'enterprise', name: '某某科技有限公司', submitTime: '2026-02-26' },
    { id: '2', type: 'school', name: '某某职业技术学院', submitTime: '2026-02-25' },
    { id: '3', type: 'job', name: '高级Java开发工程师', enterprise: '某某科技', submitTime: '2026-02-24' },
  ],

  systemHealth: {
    apiResponseTime: 45,
    dbConnectionPool: 65,
    errorRate: 0.12,
    uptime: 99.98,
  },
}

// ==================== 工具函数 ====================

/**
 * 模拟 API 延迟
 */
export function mockDelay(ms: number = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 模拟 API 响应
 */
export async function mockApiResponse<T>(data: T, delay: number = 300): Promise<{ data: T; success: boolean }> {
  await mockDelay(delay)
  return { data, success: true }
}
