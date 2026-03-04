/**
 * 岗位卡片组件
 * 显示岗位信息，支持发送到聊天、收藏、投递
 */

'use client'

import { useCallback } from 'react'
import { Card, Tag, Button, Tooltip, Space } from 'antd'
import {
  EnvironmentOutlined,
  DollarOutlined,
  SendOutlined,
  HeartOutlined,
  HeartFilled,
  CheckCircleOutlined,
} from '@ant-design/icons'
import type { Job, JobCardProps } from '@/types/job'

/** 格式化薪资 */
function formatSalary(min?: number, max?: number): string {
  if (!min && !max) return '面议'
  if (min && max) return `${min / 1000}-${max / 1000}K`
  if (min) return `${min / 1000}K+`
  return `Up to ${max! / 1000}K`
}

export function JobCard({
  job,
  onSendToChat,
  onFavorite,
  onApply,
  isFavorited = false,
  applied = false,
  compact = false,
  className,
}: JobCardProps) {
  // 发送到聊天
  const handleSend = useCallback(() => {
    onSendToChat?.(job)
  }, [job, onSendToChat])

  // 收藏/取消收藏
  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onFavorite?.(job.id)
    },
    [job.id, onFavorite]
  )

  // 投递
  const handleApply = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onApply?.(job.id)
    },
    [job.id, onApply]
  )

  // 紧凑模式
  if (compact) {
    return (
      <div
        className={`flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow cursor-pointer ${className || ''}`}
        onClick={handleSend}
      >
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-800 truncate">{job.title}</h4>
          <p className="text-xs text-gray-500 truncate">
            {job.enterprise?.name} · {job.location}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className="text-sm font-medium text-blue-600">
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          {applied && <CheckCircleOutlined className="text-green-500" />}
        </div>
      </div>
    )
  }

  // 标准卡片
  return (
    <Card
      className={`hover:shadow-md transition-shadow ${className || ''}`}
      styles={{ body: { padding: '16px' } }}
    >
      {/* 标题行 */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-base font-semibold text-gray-800 line-clamp-1">{job.title}</h3>
        <Tooltip title={isFavorited ? '取消收藏' : '收藏'}>
          <Button
            type="text"
            size="small"
            icon={isFavorited ? <HeartFilled className="text-red-500" /> : <HeartOutlined />}
            onClick={handleFavorite}
            className="flex-shrink-0"
          />
        </Tooltip>
      </div>

      {/* 公司信息 */}
      <p className="text-sm text-gray-600 mb-2">{job.enterprise?.name || '匿名公司'}</p>

      {/* 薪资和地点 */}
      <div className="flex items-center gap-4 mb-3 text-sm">
        <span className="font-medium text-blue-600">
          <DollarOutlined className="mr-1" />
          {formatSalary(job.salaryMin, job.salaryMax)}
        </span>
        {job.location && (
          <span className="text-gray-500">
            <EnvironmentOutlined className="mr-1" />
            {job.location}
          </span>
        )}
      </div>

      {/* 技能标签 */}
      {job.skills.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {job.skills.slice(0, 4).map((skill) => (
            <Tag key={skill} className="text-xs">
              {skill}
            </Tag>
          ))}
          {job.skills.length > 4 && (
            <Tag className="text-xs text-gray-400">+{job.skills.length - 4}</Tag>
          )}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between pt-2 border-t">
        {applied ? (
          <span className="text-sm text-green-600">
            <CheckCircleOutlined className="mr-1" />
            已投递
          </span>
        ) : (
          <Button
            type="primary"
            size="small"
            icon={<SendOutlined />}
            onClick={handleApply}
          >
            投递
          </Button>
        )}
        <Button type="link" size="small" onClick={handleSend}>
          发送到聊天
        </Button>
      </div>
    </Card>
  )
}

export default JobCard
