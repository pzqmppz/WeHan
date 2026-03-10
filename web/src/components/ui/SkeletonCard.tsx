/**
 * 骨架屏卡片组件
 * 用于改善感知性能，提供更好的加载体验
 */

'use client'

import React from 'react'
import { Card, Skeleton } from 'antd'

interface SkeletonCardProps {
  lines?: number
  avatar?: boolean
  title?: boolean
  className?: string
}

/**
 * 统计卡片骨架屏
 */
export function StatisticSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 16 }} />
      <Skeleton.Input active size="large" style={{ width: 120, height: 32 }} />
    </Card>
  )
}

/**
 * 表格行骨架屏
 */
export function TableRowSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton.Input active style={{ width: 60 }} />
          <Skeleton.Input active style={{ width: 200 }} />
          <Skeleton.Input active style={{ width: 150 }} />
          <Skeleton.Input active style={{ width: 100 }} />
          <Skeleton.Input active style={{ width: 120 }} />
        </div>
      ))}
    </div>
  )
}

/**
 * 列表项骨架屏
 */
export function ListItemSkeleton({ avatar = true }: { avatar?: boolean }) {
  return (
    <div className="flex items-center gap-4">
      {avatar && <Skeleton.Avatar active size="large" />}
      <div className="flex-1 space-y-2">
        <Skeleton.Input active size="small" />
        <Skeleton.Input active size="small" style={{ width: '60%' }} />
      </div>
    </div>
  )
}

/**
 * 通用卡片骨架屏
 */
export function SkeletonCard({
  lines = 3,
  avatar = false,
  title = true,
  className,
}: SkeletonCardProps) {
  return (
    <Card className={className}>
      {title && <Skeleton.Input active size="small" style={{ marginBottom: 16 }} />}
      <div className="space-y-3">
        {avatar && (
          <div className="flex items-center gap-4">
            <Skeleton.Avatar active />
            <Skeleton.Input active style={{ flex: 1 }} />
          </div>
        )}
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton.Input active key={index} size="small" />
        ))}
      </div>
    </Card>
  )
}

// 保持 default export 以兼容旧代码
export default SkeletonCard
