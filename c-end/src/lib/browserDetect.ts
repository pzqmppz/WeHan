/**
 * 浏览器检测
 * 用于检测运行环境，实现兼容性降级
 */

import type { BrowserInfo, BrowserType, DeviceType } from '@/types/chat'

/**
 * 检测浏览器信息
 */
export function detectBrowser(): BrowserInfo {
  if (typeof window === 'undefined') {
    return getServerDefaults()
  }

  const ua = navigator.userAgent.toLowerCase()

  const type = detectBrowserType(ua)
  const device = detectDevice(ua)

  return {
    type,
    device,
    isMobile: device === 'mobile',
    isWechat: type === 'wechat',
    supportsSSE: checkSSESupport(),
    supportsWebSocket: checkWebSocketSupport(),
    userAgent: navigator.userAgent,
  }
}

/**
 * 检测浏览器类型
 */
function detectBrowserType(ua: string): BrowserType {
  if (ua.includes('micromessenger')) return 'wechat'
  if (ua.includes('alipay')) return 'alipay'
  if (ua.includes('weibo')) return 'weibo'
  if (ua.includes('qq/')) return 'qq'
  if (ua.includes('chrome') || ua.includes('chromium')) return 'chrome'
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari'
  if (ua.includes('firefox')) return 'firefox'
  return 'unknown'
}

/**
 * 检测设备类型
 */
function detectDevice(ua: string): DeviceType {
  if (/mobile|android|iphone|ipod|phone/i.test(ua)) return 'mobile'
  if (/tablet|ipad|pad/i.test(ua)) return 'tablet'
  return 'desktop'
}

/**
 * 检查 SSE 支持
 */
function checkSSESupport(): boolean {
  return typeof EventSource !== 'undefined'
}

/**
 * 检查 WebSocket 支持
 */
function checkWebSocketSupport(): boolean {
  return typeof WebSocket !== 'undefined'
}

/**
 * 服务端默认值
 */
function getServerDefaults(): BrowserInfo {
  return {
    type: 'unknown',
    device: 'desktop',
    isMobile: false,
    isWechat: false,
    supportsSSE: false,
    supportsWebSocket: false,
    userAgent: '',
  }
}

/**
 * 快捷判断: 是否需要降级为轮询
 * 微信浏览器可能存在 SSE 兼容性问题
 */
export function shouldUsePolling(): boolean {
  const info = detectBrowser()
  // 微信浏览器可能存在 SSE 问题
  return !info.supportsSSE || info.isWechat
}

/**
 * 快捷判断: 是否为移动端
 */
export function isMobileDevice(): boolean {
  return detectBrowser().isMobile
}

/**
 * 快捷判断: 是否为微信浏览器
 */
export function isWechatBrowser(): boolean {
  return detectBrowser().isWechat
}

/**
 * 获取 User Agent 字符串
 */
export function getUserAgent(): string {
  if (typeof window === 'undefined') {
    return ''
  }
  return navigator.userAgent
}
