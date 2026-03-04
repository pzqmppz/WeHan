/**
 * 简历相关类型定义
 */

/** 上传状态 */
export type UploadStatus = 'idle' | 'uploading' | 'parsing' | 'success' | 'error'

/** 文件类型 */
export type ResumeFileType = 'pdf' | 'doc' | 'docx'

/** 简历解析结果 */
export interface ResumeParseResult {
  success: boolean
  name?: string
  email?: string
  phone?: string
  education?: ResumeEducation[]
  experience?: ResumeExperience[]
  skills?: string[]
  summary?: string
  rawText?: string
  error?: string
}

/** 教育经历 */
export interface ResumeEducation {
  school: string
  degree: string
  major?: string
  startDate?: string
  endDate?: string
  gpa?: number
}

/** 工作经历 */
export interface ResumeExperience {
  company: string
  title: string
  startDate?: string
  endDate?: string
  description?: string
  achievements?: string[]
}

/** 简历文件信息 */
export interface ResumeFile {
  id: string
  name: string
  size: number
  type: ResumeFileType
  url?: string
  uploadedAt: number
  status: UploadStatus
  parseResult?: ResumeParseResult
}

/** 简历上传组件属性 */
export interface ResumeUploadProps {
  onUploadSuccess?: (resume: ResumeFile) => void
  onUploadError?: (error: string) => void
  onParseComplete?: (result: ResumeParseResult) => void
  maxSizeMB?: number
  allowedTypes?: ResumeFileType[]
  className?: string
  disabled?: boolean
  showPreview?: boolean
}

/** 上传配置 */
export const DEFAULT_UPLOAD_CONFIG = {
  maxSizeMB: 5,
  allowedTypes: ['pdf', 'doc', 'docx'] as ResumeFileType[],
  maxFiles: 1,
}

/** 文件大小格式化 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** 获取文件扩展名 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/** 校验文件类型 */
export function isValidResumeType(
  filename: string,
  allowedTypes: ResumeFileType[] = DEFAULT_UPLOAD_CONFIG.allowedTypes
): boolean {
  const ext = getFileExtension(filename)
  return allowedTypes.includes(ext as ResumeFileType)
}

/** 校验文件大小 */
export function isValidFileSize(
  size: number,
  maxSizeMB: number = DEFAULT_UPLOAD_CONFIG.maxSizeMB
): boolean {
  return size <= maxSizeMB * 1024 * 1024
}
