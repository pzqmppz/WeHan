/**
 * 媒体查询 Hook
 * 统一管理响应式断点逻辑
 */

'use client'

import { useState, useEffect, useCallback } from 'react'

/** 断点定义 (与 Tailwind 保持一致) */
export const BREAKPOINTS = {
  sm: 640, // 平板竖屏
  md: 768, // 平板横屏
  lg: 1024, // 小桌面
  xl: 1280, // 大桌面
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

/**
 * 媒体查询 Hook
 * @param query CSS 媒体查询字符串
 * @returns 是否匹配
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // SSR 安全检查
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)

    // 设置初始值
    setMatches(media.matches)

    // 监听变化
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

/**
 * 断点查询 Hook
 * @param breakpoint 断点名称
 * @returns 是否匹配该断点及以上
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(min-width: ${BREAKPOINTS[breakpoint]}px)`
  return useMediaQuery(query)
}

/**
 * 多断点查询 Hook
 * @returns 各断点状态
 */
export function useBreakpoints(): Record<Breakpoint, boolean> {
  const sm = useBreakpoint('sm')
  const md = useBreakpoint('md')
  const lg = useBreakpoint('lg')
  const xl = useBreakpoint('xl')
  const xxl = useBreakpoint('2xl')

  return { sm, md, lg, xl, '2xl': xxl }
}

/**
 * 获取当前断点
 * @returns 当前激活的最大断点
 */
export function useCurrentBreakpoint(): Breakpoint | 'xs' {
  const breakpoints = useBreakpoints()

  if (breakpoints['2xl']) return '2xl'
  if (breakpoints.xl) return 'xl'
  if (breakpoints.lg) return 'lg'
  if (breakpoints.md) return 'md'
  if (breakpoints.sm) return 'sm'
  return 'xs'
}

export default useMediaQuery
