import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return '面议'
  if (min === max) return `${(min! / 1000).toFixed(0)}K`
  if (min && max) return `${(min / 1000).toFixed(0)}K-${(max / 1000).toFixed(0)}K`
  if (min) return `${(min / 1000).toFixed(0)}K以上`
  return `${(max! / 1000).toFixed(0)}K以下`
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
