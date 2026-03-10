/**
 * 面试进度组件
 * 显示当前题目进度和分类标签
 */

'use client'

import { Progress, Tag, Space } from 'antd'
import {
  DIFFICULTY_COLORS,
  DIFFICULTY_LABELS,
} from '@/types/interview'
import type { InterviewProgressProps } from '@/types/interview'

export function InterviewProgress({
  current,
  total,
  category,
  difficulty,
  showLabels = true,
  className,
}: InterviewProgressProps) {
  // 计算百分比
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className={className}>
      {/* 进度条 */}
      <div className="mb-2">
        <Progress
          percent={percent}
          strokeColor={{
            '0%': 'var(--primary)',
            '100%': 'var(--cta)',
          }}
          trailColor="#E5E7EB"
          showInfo={false}
          size="small"
        />
      </div>

      {/* 进度文字和标签 */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--text-secondary)]">
          第 {current} / {total} 题
        </span>

        {showLabels && (
          <Space size="small">
            {category && (
              <Tag color="blue" className="text-xs">
                {category}
              </Tag>
            )}
            {difficulty && (
              <Tag
                color={DIFFICULTY_COLORS[difficulty] || 'default'}
                className="text-xs"
              >
                {DIFFICULTY_LABELS[difficulty] || difficulty}
              </Tag>
            )}
          </Space>
        )}
      </div>
    </div>
  )
}

export default InterviewProgress
