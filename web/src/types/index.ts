// 用户相关类型
export type UserRole = 'STUDENT' | 'ENTERPRISE' | 'SCHOOL' | 'GOVERNMENT' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'REJECTED'

export interface User {
  id: string
  email: string
  phone?: string
  name: string
  avatar?: string
  role: UserRole
  status: UserStatus
  schoolId?: string
  major?: string
  graduationYear?: number
  resumeId?: string
  enterpriseId?: string
  schoolManagedId?: string
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
}

// 企业相关类型
export interface Enterprise {
  id: string
  name: string
  logo?: string
  industry: string
  scale: string
  description?: string
  address?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  businessLicense?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// 学校相关类型
export interface School {
  id: string
  name: string
  logo?: string
  type: string
  level: string
  address?: string
  contactName?: string
  contactPhone?: string
  verified: boolean
  createdAt: Date
  updatedAt: Date
}

// 岗位相关类型
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'

export interface Job {
  id: string
  title: string
  enterpriseId: string
  industry?: string
  category?: string
  salaryMin?: number
  salaryMax?: number
  location?: string
  address?: string
  description: string
  requirements?: string
  benefits?: string
  skills: string[]
  educationLevel?: string
  experienceYears?: number
  freshGraduate: boolean
  headcount: number
  status: JobStatus
  interviewQuestions?: string
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  enterprise?: Enterprise
}

// 简历相关类型
export interface Resume {
  id: string
  userId: string
  originalUrl?: string
  name?: string
  phone?: string
  email?: string
  education?: Education[]
  experiences?: Experience[]
  projects?: Project[]
  skills: string[]
  certifications?: Certification[]
  awards?: Award[]
  profile?: UserProfile
  createdAt: Date
  updatedAt: Date
}

export interface Education {
  school: string
  major: string
  degree: string
  startDate: string
  endDate?: string
  gpa?: string
}

export interface Experience {
  company: string
  position: string
  startDate: string
  endDate?: string
  description?: string
}

export interface Project {
  name: string
  role: string
  startDate: string
  endDate?: string
  description?: string
  technologies?: string[]
}

export interface Certification {
  name: string
  issuer: string
  date: string
}

export interface Award {
  name: string
  issuer: string
  date: string
  level?: string
}

export interface UserProfile {
  summary: string
  strengths: string[]
  interests: string[]
  careerGoals?: string
}

// 投递相关类型
export type ApplicationStatus = 'PENDING' | 'VIEWED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED' | 'WITHDRAWN'

export interface Application {
  id: string
  userId: string
  jobId: string
  resumeId?: string
  interviewId?: string
  matchScore?: number
  status: ApplicationStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
  viewedAt?: Date
  user?: User
  job?: Job
  interview?: Interview
}

// 面试相关类型
export type InterviewStatus = 'PREPARING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED'

export interface Interview {
  id: string
  userId?: string
  externalUserId?: string
  jobId?: string
  applicationId?: string
  // 面试内容（用于断点恢复）
  outline?: InterviewQuestion[]
  currentIndex?: number
  answers?: InterviewAnswer[]
  // 面试过程
  conversation?: ConversationMessage[]
  duration?: number
  // 评估报告
  status: InterviewStatus
  totalScore?: number
  dimensions?: ScoreDimension[]
  highlights?: Highlight[]
  improvements?: Improvement[]
  suggestions?: string
  audioUrl?: string
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
}

export interface InterviewQuestion {
  id: string
  category: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface InterviewAnswer {
  questionIndex: number
  question: string
  answer: string
  audioUrl?: string
  timestamp: string
}

export interface ConversationMessage {
  role: 'assistant' | 'user'
  content: string
  timestamp: string
}

export interface ScoreDimension {
  name: string
  score: number
  maxScore: number
  comment?: string
}

export interface Highlight {
  question: string
  answer: string
  score: number
}

export interface Improvement {
  area: string
  suggestion: string
}

// 政策相关类型
export type PolicyType = 'SUBSIDY' | 'HOUSING' | 'TALENT' | 'ENTREPRENEUR' | 'OTHER'

export interface Policy {
  id: string
  title: string
  type: PolicyType
  content: string
  summary?: string
  conditions?: string
  benefits?: string
  effectiveDate?: Date
  expiryDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 情绪记录类型
export interface EmotionRecord {
  id: string
  userId: string
  emotion: string
  score: number
  content?: string
  tags: string[]
  createdAt: Date
}

// 统计数据类型
export interface Statistics {
  totalJobs: number
  totalEnterprises: number
  totalSchools: number
  totalStudents: number
  totalApplications: number
  retentionRate: number
}
