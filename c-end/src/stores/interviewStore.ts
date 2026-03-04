/**
 * 面试状态管理
 * 管理面试会话、计时器、回答记录
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { InterviewPhase, InterviewQuestionOutline, InterviewAnswer } from '@/types/chat'
import type { TimerState, InterviewSessionExt } from '@/types/interview'

interface InterviewState {
  // 当前面试会话
  session: InterviewSessionExt | null

  // 计时器
  timer: TimerState

  // Actions - 会话管理
  startSession: (
    sessionId: string,
    jobTitle: string,
    questions: InterviewQuestionOutline[]
  ) => void
  updateProgress: (index: number) => void
  recordAnswer: (answer: string) => void
  endSession: () => void
  clearSession: () => void

  // Actions - 计时器
  tickTimer: () => void
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void

  // 状态更新
  setStatus: (status: InterviewPhase) => void
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      // 初始状态
      session: null,
      timer: {
        elapsed: 0,
        isRunning: false,
        startedAt: null,
      },

      // 开始新会话
      startSession: (sessionId, jobTitle, questions) => {
        const session: InterviewSessionExt = {
          sessionId,
          jobTitle,
          questions,
          currentQuestionIndex: 0,
          answers: [],
          status: 'answering',
          startedAt: Date.now(),
          timer: {
            elapsed: 0,
            isRunning: true,
            startedAt: Date.now(),
          },
        }
        set({
          session,
          timer: session.timer,
        })
      },

      // 更新进度（切换到下一题）
      updateProgress: (index) => {
        const { session } = get()
        if (!session) return

        set({
          session: {
            ...session,
            currentQuestionIndex: index,
          },
        })
      },

      // 记录回答
      recordAnswer: (answer) => {
        const { session } = get()
        if (!session) return

        const currentIndex = session.currentQuestionIndex
        const newAnswer: InterviewAnswer = {
          questionIndex: currentIndex,
          question: session.questions[currentIndex]?.question || '',
          answer,
          timestamp: Date.now(),
        }

        // 更新或添加回答
        const existingIndex = session.answers.findIndex((a) => a.questionIndex === currentIndex)
        const newAnswers = [...session.answers]
        if (existingIndex >= 0) {
          newAnswers[existingIndex] = newAnswer
        } else {
          newAnswers.push(newAnswer)
        }

        set({
          session: {
            ...session,
            answers: newAnswers,
          },
        })
      },

      // 结束会话
      endSession: () => {
        const { session } = get()
        if (!session) return

        set({
          session: {
            ...session,
            status: 'completed',
            completedAt: Date.now(),
          },
          timer: {
            ...get().timer,
            isRunning: false,
          },
        })
      },

      // 清除会话
      clearSession: () => {
        set({
          session: null,
          timer: {
            elapsed: 0,
            isRunning: false,
            startedAt: null,
          },
        })
      },

      // 计时器滴答
      tickTimer: () => {
        set((state) => ({
          timer: {
            ...state.timer,
            elapsed: state.timer.elapsed + 1,
          },
        }))
      },

      // 开始计时
      startTimer: () => {
        set({
          timer: {
            ...get().timer,
            isRunning: true,
            startedAt: Date.now(),
          },
        })
      },

      // 暂停计时
      pauseTimer: () => {
        set({
          timer: {
            ...get().timer,
            isRunning: false,
          },
        })
      },

      // 重置计时
      resetTimer: () => {
        set({
          timer: {
            elapsed: 0,
            isRunning: false,
            startedAt: null,
          },
        })
      },

      // 设置状态
      setStatus: (status) => {
        const { session } = get()
        if (!session) return
        set({
          session: {
            ...session,
            status,
          },
        })
      },
    }),
    {
      name: 'wehan-interview',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
        timer: state.timer,
      }),
    }
  )
)

// ==================== 选择器 ====================

/** 获取当前会话 */
export const selectSession = (state: InterviewState) => state.session

/** 获取计时器状态 */
export const selectTimer = (state: InterviewState) => state.timer

/** 获取当前问题 */
export const selectCurrentQuestion = (state: InterviewState) => {
  if (!state.session) return null
  const { questions, currentQuestionIndex } = state.session
  return questions[currentQuestionIndex] || null
}

/** 获取进度信息 */
export const selectProgress = (state: InterviewState) => {
  if (!state.session) return { current: 0, total: 0 }
  return {
    current: state.session.currentQuestionIndex + 1,
    total: state.session.questions.length,
  }
}

/** 是否正在进行面试 */
export const selectIsActive = (state: InterviewState) => {
  return state.session?.status === 'answering' || state.session?.status === 'generating'
}

/** 获取回答统计 */
export const selectAnswerStats = (state: InterviewState) => {
  if (!state.session) return { answered: 0, total: 0 }
  return {
    answered: state.session.answers.length,
    total: state.session.questions.length,
  }
}
