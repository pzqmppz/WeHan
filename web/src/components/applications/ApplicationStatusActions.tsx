/**
 * 投递状态操作按钮组件
 */

'use client'

import React from 'react'
import { Button, Space } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, CalendarOutlined } from '@ant-design/icons'

interface ApplicationStatusActionsProps {
  status: string
  onUpdateStatus: (status: string) => Promise<boolean>
  onAddNotes: () => void
}

export function ApplicationStatusActions({
  status,
  onUpdateStatus,
  onAddNotes,
}: ApplicationStatusActionsProps) {
  return (
    <Space>
      {status === 'PENDING' && (
        <>
          <Button type="primary" icon={<CheckCircleOutlined />} onClick={() => onUpdateStatus('VIEWED')}>
            标记已查看
          </Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={() => onUpdateStatus('REJECTED')}>
            拒绝
          </Button>
        </>
      )}
      {status === 'VIEWED' && (
        <>
          <Button type="primary" icon={<CalendarOutlined />} onClick={() => onUpdateStatus('INTERVIEWING')}>
            安排面试
          </Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={() => onUpdateStatus('REJECTED')}>
            拒绝
          </Button>
        </>
      )}
      {status === 'INTERVIEWING' && (
        <>
          <Button
            type="primary"
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
            icon={<CheckCircleOutlined />}
            onClick={() => onUpdateStatus('OFFERED')}
          >
            发送录用
          </Button>
          <Button danger icon={<CloseCircleOutlined />} onClick={() => onUpdateStatus('REJECTED')}>
            拒绝
          </Button>
        </>
      )}
      <Button onClick={onAddNotes}>
        添加备注
      </Button>
    </Space>
  )
}
