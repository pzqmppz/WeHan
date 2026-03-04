/**
 * 面试控制面板
 * 集成进度条、计时器、当前问题显示、控制按钮
 */

'use client'

import { useCallback } from 'react'
import { Card, Button, Modal, Space, Typography, Divider, Tooltip } from 'antd'
import {
  ClockCircleOutlined,
  StopOutlined,
  FileTextOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import { InterviewProgress } from './InterviewProgress'
import { useInterviewTimer } from '@/hooks/useInterviewTimer'
import { useInterviewStore, selectCurrentQuestion, selectProgress } from '@/stores/interviewStore'
import { formatDuration, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from '@/types/interview'

const { Text, Paragraph } = Typography

export function InterviewPanel() {
  const session = useInterviewStore((s) => s.session)
  const endSession = useInterviewStore((s) => s.endSession)
  const setStatus = useInterviewStore((s) => s.setStatus)
  const currentQuestion = useInterviewStore(selectCurrentQuestion)
  const progress = useInterviewStore(selectProgress)

  // 计时器
  const { elapsed, isRunning, formattedTime, start, pause } = useInterviewTimer({
    onUpdate: (time) => {
      // 可选：持久化时间
    },
  })

  // 结束面试确认
  const handleEndInterview = useCallback(() => {
    Modal.confirm({
      title: '确认结束面试？',
      content: (
        <div>
          <p>当前进度：{progress.current}/{progress.total} 题</p>
          <p>已用时间：{formatDuration(elapsed)}</p>
          <p className="text-gray-400 mt-2">结束后将生成评估报告</p>
        </div>
      ),
      okText: '确认结束',
      cancelText: '继续面试',
      okButtonProps: { danger: true },
      onOk: () => {
        endSession()
      },
    })
  }, [progress, elapsed, endSession])

  // 暂停/继续
  const handleTogglePause = useCallback(() => {
    if (isRunning) {
      pause()
      setStatus('idle')
    } else {
      start()
      setStatus('answering')
    }
  }, [isRunning, pause, start, setStatus])

  // 没有进行中的面试
  if (!session) {
    return null
  }

  // 面试已完成
  if (session.status === 'completed') {
    return (
      <Card className="bg-green-50 border-green-200">
        <div className="text-center">
          <Text className="text-green-600 text-lg font-medium">面试已完成</Text>
          <Divider className="my-3" />
          <Space direction="vertical" size="small">
            <Text type="secondary">
              总用时：{formatDuration(elapsed)}
            </Text>
            <Text type="secondary">
              回答题目：{progress.current}/{progress.total}
            </Text>
            <Button type="primary" icon={<FileTextOutlined />}>
              查看评估报告
            </Button>
          </Space>
        </div>
      </Card>
    )
  }

  return (
    <Card className="bg-white shadow-sm">
      {/* 顶部状态栏 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            面试进行中
          </span>
          <Text type="secondary" className="text-sm">
            {session.jobTitle}
          </Text>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <ClockCircleOutlined />
          <Text className="font-mono text-lg">{formattedTime}</Text>
        </div>
      </div>

      {/* 进度条 */}
      <InterviewProgress
        current={progress.current}
        total={progress.total}
        category={currentQuestion?.category}
        difficulty={currentQuestion?.difficulty}
        className="mb-4"
      />

      {/* 当前问题 */}
      {currentQuestion && (
        <div className="p-3 bg-gray-50 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Text strong>第 {progress.current} 题</Text>
            {currentQuestion.category && (
              <Text type="secondary" className="text-xs">
                · {currentQuestion.category}
              </Text>
            )}
          </div>
          <Paragraph className="text-gray-700 mb-0">
            {currentQuestion.question}
          </Paragraph>
        </div>
      )}

      {/* 控制按钮 */}
      <div className="flex items-center justify-between">
        <Tooltip title={isRunning ? '暂停面试' : '继续面试'}>
          <Button
            type="text"
            icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={handleTogglePause}
          >
            {isRunning ? '暂停' : '继续'}
          </Button>
        </Tooltip>

        <Button
          danger
          icon={<StopOutlined />}
          onClick={handleEndInterview}
        >
          结束面试
        </Button>
      </div>
    </Card>
  )
}

export default InterviewPanel
