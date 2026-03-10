/**
 * 简历上传组件
 * 支持拖拽上传 PDF/Word 文件
 */

'use client'

import { useState, useCallback, useRef } from 'react'
import { Upload, Progress, message, Button } from 'antd'
import {
  InboxOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd'
import type {
  ResumeUploadProps,
  ResumeFile,
  UploadStatus,
} from '@/types/resume'
import {
  DEFAULT_UPLOAD_CONFIG,
  formatFileSize,
  isValidResumeType,
  isValidFileSize,
} from '@/types/resume'

const { Dragger } = Upload

export function ResumeUpload({
  onUploadSuccess,
  onUploadError,
  onParseComplete,
  maxSizeMB = DEFAULT_UPLOAD_CONFIG.maxSizeMB,
  allowedTypes = DEFAULT_UPLOAD_CONFIG.allowedTypes,
  className,
  disabled = false,
  showPreview = true,
}: ResumeUploadProps) {
  const [file, setFile] = useState<ResumeFile | null>(null)
  const [status, setStatus] = useState<UploadStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 校验文件
  const validateFile = useCallback(
    (file: File): string | null => {
      if (!isValidResumeType(file.name, allowedTypes)) {
        return `不支持的文件格式，仅支持 ${allowedTypes.join(', ').toUpperCase()}`
      }
      if (!isValidFileSize(file.size, maxSizeMB)) {
        return `文件大小超过 ${maxSizeMB}MB 限制`
      }
      return null
    },
    [allowedTypes, maxSizeMB]
  )

  // 处理文件选择
  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      // 校验
      const validationError = validateFile(selectedFile)
      if (validationError) {
        setError(validationError)
        onUploadError?.(validationError)
        return
      }

      // 重置状态
      setError(null)
      setStatus('uploading')
      setUploadProgress(0)

      const resumeFile: ResumeFile = {
        id: `resume-${Date.now()}`,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.name.split('.').pop()?.toLowerCase() as ResumeFile['type'],
        uploadedAt: Date.now(),
        status: 'uploading',
      }

      setFile(resumeFile)

      try {
        // 模拟上传进度（实际项目中应调用 API）
        for (let i = 0; i <= 100; i += 10) {
          await new Promise((r) => setTimeout(r, 100))
          setUploadProgress(i)
        }

        // 上传成功，开始解析
        setStatus('parsing')

        // 模拟解析（实际项目中应调用解析 API）
        await new Promise((r) => setTimeout(r, 1500))

        // 解析完成
        setStatus('success')
        resumeFile.status = 'success'

        onUploadSuccess?.(resumeFile)
        onParseComplete?.({
          success: true,
          rawText: '简历内容已解析...',
        })
      } catch (err) {
        setStatus('error')
        const errorMsg = err instanceof Error ? err.message : '上传失败'
        setError(errorMsg)
        onUploadError?.(errorMsg)
      }
    },
    [validateFile, onUploadSuccess, onUploadError, onParseComplete]
  )

  // 删除文件
  const handleRemove = useCallback(() => {
    setFile(null)
    setStatus('idle')
    setUploadProgress(0)
    setError(null)
  }, [])

  // 拖拽上传配置
  const uploadProps: UploadProps = {
    name: 'resume',
    multiple: false,
    disabled: disabled || status === 'uploading' || status === 'parsing',
    showUploadList: false,
    beforeUpload: (file) => {
      handleFileSelect(file)
      return false // 阻止默认上传行为
    },
    accept: allowedTypes.map((t) => `.${t}`).join(','),
  }

  // 渲染状态图标
  const renderStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'parsing':
        return <LoadingOutlined className="text-4xl text-[var(--primary)] animate-spin" />
      case 'success':
        return <CheckCircleOutlined className="text-4xl text-green-500" />
      case 'error':
        return <CloseCircleOutlined className="text-4xl text-red-500" />
      default:
        return <InboxOutlined className="text-4xl text-[var(--text-muted)]" />
    }
  }

  // 渲染上传区域
  if (!file || status === 'idle') {
    return (
      <div className={className}>
        <Dragger {...uploadProps} className="bg-[var(--background)]">
          <p className="ant-upload-drag-icon">{renderStatusIcon()}</p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint text-[var(--text-muted)]">
            支持 {allowedTypes.join(', ').toUpperCase()} 格式，最大 {maxSizeMB}MB
          </p>
        </Dragger>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>
    )
  }

  // 渲染上传进度/结果
  return (
    <div className={`p-4 bg-white rounded-lg border ${className || ''}`}>
      {/* 文件信息 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileTextOutlined className="text-xl text-[var(--primary)]" />
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{formatFileSize(file.size)}</p>
          </div>
        </div>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleRemove}
          disabled={status === 'uploading' || status === 'parsing'}
        />
      </div>

      {/* 进度条 */}
      {status === 'uploading' && (
        <Progress percent={uploadProgress} size="small" status="active" />
      )}

      {/* 状态提示 */}
      {status === 'parsing' && (
        <p className="text-sm text-[var(--primary)]">
          <LoadingOutlined className="mr-1" />
          正在解析简历...
        </p>
      )}
      {status === 'success' && (
        <p className="text-sm text-green-500">
          <CheckCircleOutlined className="mr-1" />
          简历上传成功
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500">
          <CloseCircleOutlined className="mr-1" />
          {error || '上传失败'}
        </p>
      )}
    </div>
  )
}

export default ResumeUpload
