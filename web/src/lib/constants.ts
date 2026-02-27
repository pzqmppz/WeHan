// 用户角色
export const USER_ROLES = {
  STUDENT: 'STUDENT',
  ENTERPRISE: 'ENTERPRISE',
  SCHOOL: 'SCHOOL',
  GOVERNMENT: 'GOVERNMENT',
  ADMIN: 'ADMIN',
} as const

export const USER_ROLE_LABELS: Record<string, string> = {
  STUDENT: '学生',
  ENTERPRISE: '企业',
  SCHOOL: '学校',
  GOVERNMENT: '政府',
  ADMIN: '管理员',
}

// 用户状态
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
} as const

export const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: '正常',
  INACTIVE: '禁用',
  PENDING: '待审核',
  REJECTED: '已拒绝',
}

// 岗位状态
export const JOB_STATUS = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  CLOSED: '已关闭',
  ARCHIVED: '已归档',
}

// 投递状态
export const APPLICATION_STATUS = {
  PENDING: 'PENDING',
  VIEWED: 'VIEWED',
  INTERVIEWING: 'INTERVIEWING',
  OFFERED: 'OFFERED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN',
} as const

export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  PENDING: '待处理',
  VIEWED: '已查看',
  INTERVIEWING: '面试中',
  OFFERED: '已录用',
  REJECTED: '已拒绝',
  WITHDRAWN: '已撤回',
}

// 政策类型
export const POLICY_TYPES = {
  SUBSIDY: 'SUBSIDY',
  HOUSING: 'HOUSING',
  TALENT: 'TALENT',
  ENTREPRENEUR: 'ENTREPRENEUR',
  OTHER: 'OTHER',
} as const

export const POLICY_TYPE_LABELS: Record<string, string> = {
  SUBSIDY: '补贴类',
  HOUSING: '住房类',
  TALENT: '人才类',
  ENTREPRENEUR: '创业类',
  OTHER: '其他',
}

// 行业列表
export const INDUSTRIES = [
  '互联网/IT',
  '金融',
  '教育',
  '医疗健康',
  '制造业',
  '房地产',
  '零售/电商',
  '物流/运输',
  '文化/娱乐',
  '能源/环保',
  '政府/非盈利',
  '其他',
]

// 企业规模
export const COMPANY_SCALES = [
  { value: '0-50', label: '0-50人' },
  { value: '50-200', label: '50-200人' },
  { value: '200-500', label: '200-500人' },
  { value: '500-1000', label: '500-1000人' },
  { value: '1000+', label: '1000人以上' },
]

// 学历要求
export const EDUCATION_LEVELS = [
  '不限',
  '大专',
  '本科',
  '硕士',
  '博士',
]

// 工作经验
export const EXPERIENCE_OPTIONS = [
  { value: 0, label: '不限/应届生' },
  { value: 1, label: '1年以下' },
  { value: 1, label: '1-3年' },
  { value: 3, label: '3-5年' },
  { value: 5, label: '5-10年' },
  { value: 10, label: '10年以上' },
]

// 武汉区域
export const WUHAN_DISTRICTS = [
  '江岸区',
  '江汉区',
  '硚口区',
  '汉阳区',
  '武昌区',
  '青山区',
  '洪山区',
  '东西湖区',
  '汉南区',
  '蔡甸区',
  '江夏区',
  '黄陂区',
  '新洲区',
  '东湖高新区',
  '武汉经开区',
]
