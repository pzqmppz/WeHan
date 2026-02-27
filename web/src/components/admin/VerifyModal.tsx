'use client'

import React from 'react'
import { Modal, Form, Input, Radio, message } from 'antd'

interface VerifyModalProps {
  open: boolean
  title: string
  onConfirm: (verified: boolean, reason?: string) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function VerifyModal({
  open,
  title,
  onConfirm,
  onCancel,
  loading = false,
}: VerifyModalProps) {
  const [form] = Form.useForm()
  const [verified, setVerified] = React.useState<boolean | null>(null)

  const handleOk = async () => {
    if (verified === null) {
      message.warning('请选择审核结果')
      return
    }

    const values = await form.validateFields()
    await onConfirm(verified, values.reason)
    form.resetFields()
    setVerified(null)
  }

  const handleCancel = () => {
    form.resetFields()
    setVerified(null)
    onCancel()
  }

  return (
    <Modal
      title={title}
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="确认"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="审核结果" required>
          <Radio.Group onChange={(e) => setVerified(e.target.value)} value={verified}>
            <Radio value={true}>通过</Radio>
            <Radio value={false}>拒绝</Radio>
          </Radio.Group>
        </Form.Item>

        {verified === false && (
          <Form.Item
            name="reason"
            label="拒绝原因"
            rules={[{ required: true, message: '请输入拒绝原因' }]}
          >
            <Input.TextArea
              placeholder="请输入拒绝原因，将通知申请方"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        )}

        {verified === true && (
          <Form.Item name="reason" label="备注（可选）">
            <Input.TextArea
              placeholder="可选：添加审核备注"
              rows={2}
              maxLength={200}
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}
