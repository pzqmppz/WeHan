/**
 * 岗位相关类型定义
 * 与 B 端数据模型保持一致
 */

/** 岗位状态 */
export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'

/** 工作类型 */
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT'

/** 经验要求 */
export type ExperienceLevel = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'MANAGER'

/** 学历要求 */
export type EducationLevel = 'HIGH_SCHOOL' | 'ASSOCIATE' | 'BACHELOR' | 'MASTER' | 'DOCTORATE'

/** 企业信息（精简版） */
export interface EnterpriseInfo {
  id: string
  name: string
  logo?: string
  industry?: string
  scale?: string
}

/** 岗位信息 */
export interface Job {
  id: string
  title: string
  enterpriseId: string
  enterprise?: EnterpriseInfo
  description: string
  requirements?: string
  salaryMin?: number
  salaryMax?: number
  salaryType?: 'MONTHLY' | 'YEARLY' | 'NEGOTIABLE'
  location?: string
  address?: string
  jobType?: JobType
  experience?: ExperienceLevel
  education?: EducationLevel
  skills: string[]
  benefits?: string[]
  headcount?: number
  status: JobStatus
  publishedAt?: number
  createdAt: number
  updatedAt: number
}

/** 岗位卡片属性 */
export interface JobCardProps {
  job: Job
  onSendToChat?: (job: Job) => void
  onFavorite?: (jobId: string) => void
  onApply?: (jobId: string) => void
  isFavorited?: boolean
  applied?: boolean
  compact?: boolean // 紧凑模式
  className?: string
}

/** 岗位搜索参数 */
export interface JobSearchParams {
  keyword?: string
  location?: string
  jobType?: JobType
  experience?: ExperienceLevel
  education?: EducationLevel
  salaryMin?: number
  salaryMax?: number
  skills?: string[]
  page?: number
  pageSize?: number
}

/** 岗位搜索结果 */
export interface JobSearchResult {
  jobs: Job[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
