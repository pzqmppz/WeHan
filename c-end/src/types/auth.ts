/**
 * C 端认证相关类型定义
 */

// 用户状态
export type CUserStatus = 'ACTIVE' | 'INACTIVE'

// C 端用户
export interface CUser {
  id: string
  email: string
  phone: string | null
  name: string
  avatar: string | null
  gender: string | null
  birthday: Date | null
  education: string | null
  school: string | null
  major: string | null
  graduationYear: number | null
  jobIntention: string | null
  expectedCity: string | null
  visitorId: string | null
  status: CUserStatus
  emailVerified: Date | null
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
  visitorId?: string
}

// 注册请求
export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
  visitorId?: string
}

// 认证响应
export interface AuthResponse {
  success: boolean
  data?: {
    user: CUser
    token: string
    expiresIn: number
  }
  error?: string
  code?: 'INVALID_CREDENTIALS' | 'ACCOUNT_DISABLED' | 'EMAIL_EXISTS' | 'VALIDATION_ERROR'
}

// 用户信息响应
export interface MeResponse {
  success: boolean
  data?: {
    user: CUser
    stats?: {
      interviewCount: number
      conversationCount: number
    }
  }
  error?: string
}

// 认证状态
export interface AuthState {
  user: CUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
