/**
 * 面试相关类型定义
 * 扩展 chat.ts 中的基础类型
 */

import type { InterviewPhase, InterviewQuestionOutline, InterviewAnswer } from './chat'

/** 计时器状态 */
export interface TimerState {
  elapsed: number // 已用时间（秒）
  isRunning: boolean
  startedAt: number | null
}

/** 面试会话扩展 */
export interface InterviewSessionExt {
  sessionId: string
  jobTitle: string
  jobId?: string
  questions: InterviewQuestionOutline[]
  currentQuestionIndex: number
  answers: InterviewAnswer[]
  status: InterviewPhase
  startedAt: number
  completedAt?: number
  timer: TimerState
}

/** 面试进度组件属性 */
export interface InterviewProgressProps {
  current: number
  total: number
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  showLabels?: boolean
  className?: string
}

/** 面试控制面板属性 */
export interface InterviewPanelProps {
  session: InterviewSessionExt | null
  onEndInterview: () => void
  onViewReport?: () => void
  onPause?: () => void
  onResume?: () => void
  isPaused?: boolean
  className?: string
}

/** 面试结果报告 */
export interface InterviewReport {
  sessionId: string
  jobTitle: string
  totalQuestions: number
  answeredQuestions: number
  duration: number // 秒
  score?: number // 0-100
  feedback?: string
  questionResults: QuestionResult[]
  generatedAt: number
}

/** 单题结果 */
export interface QuestionResult {
  questionIndex: number
  question: string
  answer: string
  score?: number
  feedback?: string
  strengths?: string[]
  improvements?: string[]
}

/** 面试配置 */
export interface InterviewConfig {
  totalQuestions: number
  timeLimit?: number // 分钟，可选
  categories: InterviewCategory[]
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
}

/** 面试题目分类 */
export interface InterviewCategory {
  id: string
  name: string
  description?: string
  weight: number // 权重
}

/** 格式化时间（秒 -> MM:SS） */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/** 格式化时长（秒 -> X分Y秒） */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return secs > 0 ? `${mins}分${secs}秒` : `${mins}分钟`
}

/** 默认面试分类 */
export const DEFAULT_CATEGORIES: InterviewCategory[] = [
  { id: 'technical', name: '专业知识', weight: 40 },
  { id: 'behavioral', name: '行为面试', weight: 30 },
  { id: 'situational', name: '情景模拟', weight: 30 },
]

/** 难度标签颜色映射 */
export const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'green',
  medium: 'orange',
  hard: 'red',
}

/** 难度中文映射 */
export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难',
}
