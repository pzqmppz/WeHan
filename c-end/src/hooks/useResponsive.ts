/**
 * 响应式断点 Hook
 * 提供语义化的设备类型判断
 */

'use client'

import { useState, useEffect } from 'react'
import { useBreakpoint } from './useMediaQuery'

export interface ResponsiveState {
  /** 移动端 (< 768px) */
  isMobile: boolean
  /** 平板 (768px - 1024px) */
  isTablet: boolean
  /** 桌面 (> 1024px) */
  isDesktop: boolean
  /** 窗口宽度 (px) */
  width: number
  /** 窗口高度 (px) */
  height: number
  /** 触控设备 */
  isTouchDevice: boolean
}

/**
 * 响应式状态 Hook
 * @returns 响应式状态对象
 */
export function useResponsive(): ResponsiveState {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  // 断点检测
  const isMd = useBreakpoint('md')
  const isLg = useBreakpoint('lg')

  // 监听窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined') return

    // 初始化
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // 检测触控设备
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0)

    // 监听变化
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return {
    isMobile: !isMd, // < 768px
    isTablet: isMd && !isLg, // 768px - 1024px
    isDesktop: isLg, // > 1024px
    width: dimensions.width,
    height: dimensions.height,
    isTouchDevice,
  }
}

/**
 * 简化版 - 仅返回设备类型
 */
export function useDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const { isMobile, isTablet, isDesktop } = useResponsive()

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}

/**
 * 触控区域大小 Hook
 * 返回适合当前设备的触控区域大小
 */
export function useTouchTargetSize(): number {
  const { isTouchDevice } = useResponsive()
  return isTouchDevice ? 44 : 32 // 移动端 44px，桌面 32px
}

export default useResponsive
