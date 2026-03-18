/**
 * 注册页面
 */

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Card, Typography, Modal, App } from 'antd'
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons'

// 用户协议内容
const USER_AGREEMENT = `
WeHan 用户协议

更新日期：2026年3月18日
生效日期：2026年3月18日

欢迎您使用 WeHan 求职助手服务！

一、服务说明
1. WeHan 是一款面向求职者的智能辅助工具，提供 AI 面试模拟、简历优化、岗位推荐等服务。
2. 本服务由 WeHan 团队运营，致力于帮助用户提升求职竞争力。

二、用户注册
1. 您需要提供真实、准确的个人信息进行注册。
2. 您应妥善保管账号密码，因密码泄露造成的损失由您自行承担。
3. 禁止将账号转让、出借给他人使用。

三、用户行为规范
1. 您承诺不利用本服务从事违法违规活动。
2. 禁止发布虚假简历、恶意刷单等行为。
3. 禁止利用技术手段攻击、破坏本服务。

四、知识产权
1. 本服务的所有内容（包括但不限于软件、界面设计、文字、图片）的知识产权归 WeHan 所有。
2. 您通过本服务生成的内容（如简历、面试记录）的知识产权归您所有。

五、隐私保护
1. 我们重视您的隐私保护，具体请参阅《隐私政策》。
2. 未经您同意，我们不会向第三方披露您的个人信息。

六、服务变更与终止
1. 我们有权根据业务发展需要调整服务内容。
2. 如您违反本协议，我们有权暂停或终止您的账号。

七、免责声明
1. 本服务仅提供求职辅助功能，不保证求职结果。
2. 因不可抗力导致的服务中断，我们不承担责任。

八、联系我们
如有任何问题，请通过以下方式联系我们：
邮箱：wehan@dolosy.cn
`

// 隐私政策内容
const PRIVACY_POLICY = `
WeHan 隐私政策

更新日期：2026年3月18日
生效日期：2026年3月18日

我们深知个人信息对您的重要性，并会尽全力保护您的个人信息安全。

一、我们收集的信息
1. 注册信息：姓名、邮箱、手机号（选填）
2. 简历信息：教育背景、工作经历、技能特长
3. 使用数据：面试记录、聊天记录、操作日志
4. 设备信息：设备型号、操作系统、浏览器类型

二、信息使用目的
1. 提供个性化求职辅助服务
2. 改进产品功能和用户体验
3. 发送重要通知和服务更新
4. 保障账号安全，防范欺诈行为

三、信息共享
我们不会向第三方出售您的个人信息。仅在以下情况下共享：
1. 获得您的明确同意
2. 法律法规要求
3. 与授权合作伙伴共享（如企业招聘方，需您主动投递）

四、信息存储与保护
1. 采用加密存储和传输技术
2. 建立严格的数据访问权限控制
3. 定期进行安全审计和漏洞修复

五、您的权利
1. 访问权：您可以随时查看自己的个人信息
2. 更正权：您可以修改不准确的信息
3. 删除权：您可以申请注销账号并删除数据
4. 导出权：您可以导出自己的数据

六、Cookie 使用
我们使用 Cookie 来：
1. 记住您的登录状态
2. 分析用户行为，优化服务
3. 提供个性化内容推荐

七、未成年人保护
本服务不面向未满 16 周岁的未成年人。

八、政策更新
我们可能会不时更新本政策，更新后将在应用内通知您。

九、联系我们
如需行使您的权利或有任何疑问，请联系：
邮箱：wehan@dolosy.cn
`
import { useAuth } from '@/hooks/useAuth'
import type { RegisterRequest } from '@/types/auth'

const { Title, Text } = Typography

interface RegisterFormValues {
  name: string
  email: string
  phone?: string
  password: string
  confirmPassword: string
}

export default function RegisterPage() {
  const router = useRouter()
  const { register, isAuthenticated, isLoading } = useAuth()
  const { message } = App.useApp()
  const [error, setError] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [showUserAgreement, setShowUserAgreement] = useState(false)
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false)

  // 已登录则跳转首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (values: RegisterFormValues) => {
    setError(null)

    // 密码确认
    if (values.password !== values.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    const data: RegisterRequest = {
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone || undefined,
    }

    const result = await register(data)

    if (result.success) {
      message.success('注册成功')
      router.push('/')
    } else {
      setError(result.error || '注册失败')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #E6F4FF 0%, #F0FDF4 100%)' }}>
      <Card className="w-full max-w-md shadow-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">
              <span style={{ color: 'var(--primary)' }}>We</span>
              <span style={{ color: 'var(--text-primary)' }}>Han</span>
            </h1>
          </Link>
          <Text type="secondary">创建您的求职助手账号</Text>
        </div>

        {/* 注册表单 */}
        <Form form={form} layout="vertical" onFinish={handleSubmit} size="large">
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' },
              { min: 2, message: '姓名至少 2 个字符' },
              { max: 20, message: '姓名最多 20 个字符' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="请输入姓名"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="请输入邮箱"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号（选填）"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
            ]}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="请输入手机号"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="请输入密码（至少 6 位）"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            rules={[
              { required: true, message: '请再次输入密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--text-muted)' }} />}
              placeholder="请再次输入密码"
            />
          </Form.Item>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#FFF2F0', color: '#CF1322', border: '1px solid #FFCCC7' }}>
              {error}
            </div>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoading}
              style={{ height: 44 }}
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        {/* 登录链接 */}
        <div className="text-center mt-4">
          <Text type="secondary">已有账号？</Text>
          <Link href="/login" className="ml-2" style={{ color: 'var(--primary)' }}>
            立即登录
          </Link>
        </div>

        {/* 访客入口 */}
        <div className="text-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          <Link href="/" style={{ color: 'var(--text-muted)' }} className="text-sm hover:text-[var(--primary)] transition-colors">
            以访客身份继续使用
          </Link>
        </div>

        {/* 用户协议 */}
        <div className="text-center mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          注册即表示同意
          <a
            onClick={(e) => { e.preventDefault(); setShowUserAgreement(true) }}
            className="mx-1 cursor-pointer"
            style={{ color: 'var(--primary)' }}
          >
            用户协议
          </a>
          和
          <a
            onClick={(e) => { e.preventDefault(); setShowPrivacyPolicy(true) }}
            className="mx-1 cursor-pointer"
            style={{ color: 'var(--primary)' }}
          >
            隐私政策
          </a>
        </div>
      </Card>

      {/* 用户协议弹窗 */}
      <Modal
        title="用户协议"
        open={showUserAgreement}
        onCancel={() => setShowUserAgreement(false)}
        footer={null}
        width={600}
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
      >
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.8 }}>
          {USER_AGREEMENT}
        </pre>
      </Modal>

      {/* 隐私政策弹窗 */}
      <Modal
        title="隐私政策"
        open={showPrivacyPolicy}
        onCancel={() => setShowPrivacyPolicy(false)}
        footer={null}
        width={600}
        styles={{ body: { maxHeight: '60vh', overflowY: 'auto' } }}
      >
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 14, lineHeight: 1.8 }}>
          {PRIVACY_POLICY}
        </pre>
      </Modal>
    </div>
  )
}
