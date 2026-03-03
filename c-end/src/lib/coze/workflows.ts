/**
 * Coze 工作流封装
 * 管理工作流 ID 映射和请求构建
 */

import type {
  WorkflowType,
  WorkflowRequest,
  WorkflowResponse,
} from '@/types/chat'

// ==================== 工作流 ID 映射 ====================

/** 工作流 ID 配置 */
const WORKFLOW_IDS: Record<WorkflowType, string> = {
  generate_questions: process.env.COZE_WORKFLOW_GENERATE_QUESTIONS || '',
  interview_next: process.env.COZE_WORKFLOW_INTERVIEW_NEXT || '',
  evaluate: process.env.COZE_WORKFLOW_EVALUATE || '',
  force_finish: process.env.COZE_WORKFLOW_FORCE_FINISH || '',
}

// ==================== 工作流参数类型守卫 ====================

/** 生成题目参数 */
export interface GenerateQuestionsParams {
  job_id?: string
  job_title: string
  job_requirements?: string
  question_count?: number
}

/** 面试下一题参数 */
export interface InterviewNextParams {
  session_id: string
  current_index: number
  user_answer: string
}

/** 评估参数 */
export interface EvaluateParams {
  session_id: string
  answers: Array<{
    question_index: number
    question: string
    answer: string
  }>
}

/** 强制结束参数 */
export interface ForceFinishParams {
  session_id: string
}

/** 类型守卫: 生成题目参数 */
export function isGenerateQuestionsParams(
  params: unknown
): params is GenerateQuestionsParams {
  if (typeof params !== 'object' || params === null) return false
  const p = params as GenerateQuestionsParams
  return typeof p.job_title === 'string'
}

/** 类型守卫: 面试下一题参数 */
export function isInterviewNextParams(
  params: unknown
): params is InterviewNextParams {
  if (typeof params !== 'object' || params === null) return false
  const p = params as InterviewNextParams
  return (
    typeof p.session_id === 'string' &&
    typeof p.current_index === 'number' &&
    typeof p.user_answer === 'string'
  )
}

/** 类型守卫: 评估参数 */
export function isEvaluateParams(params: unknown): params is EvaluateParams {
  if (typeof params !== 'object' || params === null) return false
  const p = params as EvaluateParams
  return (
    typeof p.session_id === 'string' &&
    Array.isArray(p.answers) &&
    p.answers.length > 0
  )
}

/** 类型守卫: 强制结束参数 */
export function isForceFinishParams(
  params: unknown
): params is ForceFinishParams {
  if (typeof params !== 'object' || params === null) return false
  const p = params as ForceFinishParams
  return typeof p.session_id === 'string'
}

// ==================== 核心函数 ====================

/**
 * 获取工作流 ID
 * @param type 工作流类型
 * @returns 工作流 ID
 * @throws 如果工作流 ID 未配置
 */
export function getWorkflowId(type: WorkflowType): string {
  const id = WORKFLOW_IDS[type]
  if (!id) {
    throw new Error(`Workflow ID not configured for type: ${type}`)
  }
  return id
}

/**
 * 构建工作流请求
 * @param type 工作流类型
 * @param parameters 工作流参数
 * @returns 工作流请求对象
 */
export function buildWorkflowRequest(
  type: WorkflowType,
  parameters: Record<string, unknown>
): WorkflowRequest {
  const workflowId = getWorkflowId(type)

  return {
    workflow_id: workflowId,
    parameters,
  }
}

/**
 * 验证工作流配置是否完整
 * @returns 配置状态
 */
export function validateWorkflowConfig(): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []

  for (const [type, id] of Object.entries(WORKFLOW_IDS)) {
    if (!id) {
      missing.push(`COZE_WORKFLOW_${type.toUpperCase()}`)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  }
}

/**
 * 获取所有已配置的工作流类型
 * @returns 已配置的工作流类型列表
 */
export function getConfiguredWorkflowTypes(): WorkflowType[] {
  const types: WorkflowType[] = []

  for (const [type, id] of Object.entries(WORKFLOW_IDS)) {
    if (id) {
      types.push(type as WorkflowType)
    }
  }

  return types
}

/**
 * 检查特定工作流是否已配置
 * @param type 工作流类型
 */
export function isWorkflowConfigured(type: WorkflowType): boolean {
  return Boolean(WORKFLOW_IDS[type])
}

// ==================== 响应解析 ====================

/**
 * 解析工作流响应
 * @param response 原始响应
 * @returns 解析后的数据或错误
 */
export function parseWorkflowResponse(
  response: WorkflowResponse
): { success: boolean; data?: unknown; error?: string } {
  if (response.code === 0) {
    return {
      success: true,
      data: response.data,
    }
  }

  return {
    success: false,
    error: response.msg || 'Unknown error',
  }
}

/**
 * 提取工作流输出
 * Coze 工作流返回格式通常为 { output: string } 或直接返回数据
 */
export function extractWorkflowOutput(
  data: Record<string, unknown>
): string | null {
  // 尝试常见的输出字段
  if (typeof data.output === 'string') return data.output
  if (typeof data.result === 'string') return data.result
  if (typeof data.content === 'string') return data.content

  return null
}
