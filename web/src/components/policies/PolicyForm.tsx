'use client'

import React from 'react'
import { Form, Input, Select, DatePicker, Button, Space } from 'antd'
import { PolicyType } from '@prisma/client'
import dayjs from 'dayjs'

const { TextArea } = Input
const { Option } = Select
const { RangePicker } = DatePicker

export interface PolicyFormValues {
  title: string
  type: PolicyType
  content: string
  summary?: string
  conditions?: string
  benefits?: string
  effectiveDate?: Date
  expiryDate?: Date
}

interface PolicyFormProps {
  initialValues?: Partial<PolicyFormValues>
  onSubmit: (values: PolicyFormValues) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  isEdit?: boolean
}

const POLICY_TYPE_LABELS: Record<PolicyType, string> = {
  SUBSIDY: '补贴政策',
  HOUSING: '住房政策',
  TALENT: '人才政策',
  ENTREPRENEUR: '创业政策',
  OTHER: '其他政策',
}

export default function PolicyForm({
  initialValues,
  onSubmit,
  onCancel,
  loading = false,
  isEdit = false,
}: PolicyFormProps) {
  const [form] = Form.useForm()

  const handleSubmit = async (values: any) => {
    const formattedValues: PolicyFormValues = {
      ...values,
      effectiveDate: values.dateRange?.[0]?.toDate(),
      expiryDate: values.dateRange?.[1]?.toDate(),
    }
    delete (formattedValues as any).dateRange
    await onSubmit(formattedValues)
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        ...initialValues,
        dateRange: initialValues?.effectiveDate && initialValues?.expiryDate
          ? [dayjs(initialValues.effectiveDate), dayjs(initialValues.expiryDate)]
          : undefined,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="title"
        label="政策标题"
        rules={[{ required: true, message: '请输入政策标题' }]}
      >
        <Input placeholder="请输入政策标题" maxLength={200} showCount />
      </Form.Item>

      <Form.Item
        name="type"
        label="政策类型"
        rules={[{ required: true, message: '请选择政策类型' }]}
      >
        <Select placeholder="请选择政策类型">
          {Object.entries(POLICY_TYPE_LABELS).map(([value, label]) => (
            <Option key={value} value={value}>
              {label}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="summary"
        label="政策摘要"
        rules={[{ required: false }]}
      >
        <TextArea
          placeholder="请输入政策摘要（简短描述，用于列表展示）"
          rows={2}
          maxLength={500}
          showCount
        />
      </Form.Item>

      <Form.Item
        name="content"
        label="政策内容"
        rules={[{ required: true, message: '请输入政策内容' }]}
      >
        <TextArea
          placeholder="请输入完整的政策内容"
          rows={6}
          maxLength={10000}
          showCount
        />
      </Form.Item>

      <Form.Item name="conditions" label="申请条件">
        <TextArea
          placeholder="请输入申请条件（如：毕业5年内、本科及以上学历等）"
          rows={3}
          maxLength={2000}
          showCount
        />
      </Form.Item>

      <Form.Item name="benefits" label="政策福利">
        <TextArea
          placeholder="请输入政策福利（如：每月800元补贴、最长3年等）"
          rows={3}
          maxLength={2000}
          showCount
        />
      </Form.Item>

      <Form.Item name="dateRange" label="有效期">
        <RangePicker style={{ width: '100%' }} />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            {isEdit ? '保存修改' : '创建政策'}
          </Button>
          {onCancel && (
            <Button onClick={onCancel}>取消</Button>
          )}
        </Space>
      </Form.Item>
    </Form>
  )
}

export { POLICY_TYPE_LABELS }
