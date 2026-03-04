/**
 * 面试计时器 Hook
 * 封装计时逻辑，支持开始/暂停/重置
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatTime } from '@/types/interview'

export interface UseInterviewTimerOptions {
  initialSeconds?: number
  onUpdate?: (elapsed: number) => void
  onComplete?: () => void
  maxSeconds?: number
}

export interface UseInterviewTimerReturn {
  elapsed: number
  isRunning: boolean
  formattedTime: string
  start: () => void
  pause: () => void
  reset: () => void
  setElapsed: (seconds: number) => void
}

export function useInterviewTimer(
  options: UseInterviewTimerOptions = {}
): UseInterviewTimerReturn {
  const { initialSeconds = 0, onUpdate, onComplete, maxSeconds } = options

  const [elapsed, setElapsed] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // 格式化时间
  const formattedTime = formatTime(elapsed)

  // 清理定时器
  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // 开始计时
  const start = useCallback(() => {
    if (isRunning) return
    setIsRunning(true)
  }, [isRunning])

  // 暂停计时
  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  // 重置计时
  const reset = useCallback(() => {
    setIsRunning(false)
    setElapsed(initialSeconds)
    clearTimer()
  }, [initialSeconds, clearTimer])

  // 手动设置时间
  const setElapsedManually = useCallback((seconds: number) => {
    setElapsed(seconds)
  }, [])

  // 计时逻辑
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1
          onUpdate?.(next)

          // 检查是否达到最大时间
          if (maxSeconds && next >= maxSeconds) {
            setIsRunning(false)
            onComplete?.()
          }

          return next
        })
      }, 1000)
    } else {
      clearTimer()
    }

    return clearTimer
  }, [isRunning, clearTimer, onUpdate, onComplete, maxSeconds])

  return {
    elapsed,
    isRunning,
    formattedTime,
    start,
    pause,
    reset,
    setElapsed: setElapsedManually,
  }
}

export default useInterviewTimer
