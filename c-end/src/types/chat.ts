/**
 * C 端聊天相关类型定义
 * 用于 Coze API 集成和前端状态管理
 */

// ==================== 消息类型 ====================

/** 聊天消息角色 */
export type ChatRole = 'user' | 'assistant' | 'system'

/** 消息内容类型 */
export type ContentType = 'text' | 'object_string'

/** 消息状态 */
export type MessageStatus = 'pending' | 'streaming' | 'completed' | 'error'

/** 聊天消息 */
export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  contentType: ContentType
  timestamp: number
  status?: MessageStatus
  metadata?: Record<string, unknown>
}

/** Coze API 消息格式 (v3) */
export interface CozeMessage {
  role: 'user' | 'assistant'
  content: string
  content_type: 'text' | 'object_string'
}

// ==================== 会话类型 ====================

/** 会话状态 */
export type ConversationStatus = 'active' | 'archived' | 'expired'

/** 会话 */
export interface Conversation {
  id: string
  userId: string
  title: string
  status: ConversationStatus
  messageCount: number
  lastMessageAt: number
  createdAt: number
  messages?: ChatMessage[]
}

// ==================== SSE 事件类型 ====================

/** SSE 事件类型枚举 */
export type SSEEventType =
  | 'conversation.chat.created'
  | 'conversation.message.delta'
  | 'conversation.message.completed'
  | 'conversation.chat.completed'
  | 'error'
  | 'done'

/** SSE 事件基础接口 */
export interface SSEEvent<T = unknown> {
  event: SSEEventType
  data: T
}

/** 对话创建事件数据 */
export interface ChatCreatedData {
  id: string
  conversation_id: string
  bot_id: string
  status: string
}

/** 消息增量事件数据 */
export interface MessageDeltaData {
  id: string
  conversation_id: string
  role: 'assistant'
  type: 'answer' | 'verbose'
  content: string
  content_type: 'text'
}

/** 消息完成事件数据 */
export interface MessageCompletedData extends MessageDeltaData {
  status: 'completed'
}

/** 对话完成事件数据 */
export interface ChatCompletedData {
  id: string
  conversation_id: string
  status: 'completed'
  usage?: {
    token_count: number
    input_tokens: number
    output_tokens: number
  }
}

/** 错误事件数据 */
export interface ErrorEventData {
  code: number
  msg: string
}

// ==================== 工作流类型 ====================

/** 工作流类型枚举 */
export type WorkflowType =
  | 'generate_questions'
  | 'interview_next'
  | 'evaluate'
  | 'force_finish'

/** 工作流请求 */
export interface WorkflowRequest {
  workflow_id: string
  parameters: Record<string, unknown>
}

/** 工作流响应 */
export interface WorkflowResponse {
  code: number
  msg: string
  data: Record<string, unknown>
}

// ==================== 面试相关 ====================

/** 面试会话阶段 */
export type InterviewPhase =
  | 'idle' // 空闲
  | 'generating' // 生成题目中
  | 'answering' // 回答中
  | 'evaluating' // 评估中
  | 'completed' // 已完成
  | 'error' // 错误

/** 面试进度 */
export interface InterviewProgress {
  phase: InterviewPhase
  currentQuestion: number
  totalQuestions: number
  questionOutline: InterviewQuestionOutline[]
}

/** 面试题目大纲 */
export interface InterviewQuestionOutline {
  id: string
  category: string
  question: string
  difficulty: 'easy' | 'medium' | 'hard'
}

/** 面试会话数据 */
export interface InterviewSession {
  sessionId: string
  jobTitle: string
  jobId?: string
  questions: InterviewQuestionOutline[]
  currentQuestionIndex: number
  answers: InterviewAnswer[]
  status: InterviewPhase
  startedAt: number
  completedAt?: number
}

/** 面试回答 */
export interface InterviewAnswer {
  questionIndex: number
  question: string
  answer: string
  timestamp: number
}

// ==================== API 请求/响应 ====================

/** Chat API 请求 */
export interface ChatApiRequest {
  message: string
  conversationId?: string
  userId: string
}

/** Chat API 响应 (非流式) */
export interface ChatApiResponse {
  success: boolean
  data?: {
    messageId: string
    conversationId: string
  }
  error?: string
  code?: string
}

/** Workflow API 请求 */
export interface WorkflowApiRequest {
  workflowType: WorkflowType
  parameters: Record<string, unknown>
}

/** Workflow API 响应 */
export interface WorkflowApiResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: string
  code?: string
}

// ==================== 错误类型 ====================

/** 错误码枚举 */
export enum ChatErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  RATE_LIMITED = 'RATE_LIMITED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNKNOWN = 'UNKNOWN',
}

/** 聊天错误 */
export interface ChatError {
  code: ChatErrorCode
  message: string
  retryable: boolean
  details?: unknown
}

// ==================== 用户身份 ====================

/** 用户身份信息 */
export interface UserIdentity {
  visitorId: string
  createdAt: number
  lastActiveAt: number
  deviceInfo?: string
}

// ==================== 浏览器检测 ====================

/** 浏览器类型 */
export type BrowserType =
  | 'wechat'
  | 'alipay'
  | 'weibo'
  | 'qq'
  | 'chrome'
  | 'safari'
  | 'firefox'
  | 'unknown'

/** 设备类型 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

/** 浏览器检测结果 */
export interface BrowserInfo {
  type: BrowserType
  device: DeviceType
  isMobile: boolean
  isWechat: boolean
  supportsSSE: boolean
  supportsWebSocket: boolean
  userAgent: string
}

// ==================== 限流 ====================

/** 限流配置 */
export interface RateLimitConfig {
  windowMs: number // 时间窗口 (毫秒)
  maxRequests: number // 窗口内最大请求数
  keyPrefix?: string // 存储键前缀
}

/** 限流结果 */
export interface RateLimitResult {
  allowed: boolean
  remaining: number // 剩余请求数
  resetAt: number // 重置时间戳
  retryAfter?: number // 需要等待的毫秒数
}
