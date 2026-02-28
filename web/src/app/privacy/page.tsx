/**
 * 隐私政策页面
 */

'use client'

import React from 'react'
import { Layout, Typography, Card } from 'antd'
import { PortalHeader, PortalFooter } from '@/components/layout'

const { Content } = Layout
const { Title, Paragraph, Text } = Typography

export default function PrivacyPolicyPage() {
  return (
    <Layout className="min-h-screen">
      <PortalHeader />
      <Content className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-sm">
            <Title level={2} className="!mb-6">隐私政策</Title>
            <Paragraph type="secondary">
              最后更新日期：2026年2月28日
            </Paragraph>

            <div className="space-y-6">
              <section>
                <Title level={4}>1. 引言</Title>
                <Paragraph>
                  欢迎使用「才聚江城」武汉人才留汉智能服务平台（以下简称「本平台」）。我们非常重视您的隐私保护，本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。
                </Paragraph>
                <Paragraph>
                  使用本平台即表示您同意本隐私政策的条款。如果您不同意本政策，请勿使用本平台。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>2. 信息收集</Title>
                <Paragraph>
                  我们可能收集以下类型的信息：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li><Text strong>账户信息</Text>：姓名、邮箱、手机号、学校/企业名称等</li>
                  <li><Text strong>简历信息</Text>：教育背景、工作经历、技能特长等</li>
                  <li><Text strong>使用记录</Text>：浏览记录、投递记录、面试记录等</li>
                  <li><Text strong>设备信息</Text>：IP地址、浏览器类型、操作系统等</li>
                </ul>
              </section>

              <section>
                <Title level={4}>3. 信息使用</Title>
                <Paragraph>
                  我们使用收集的信息用于：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>提供岗位匹配和推荐服务</li>
                  <li>支持简历投递和面试安排</li>
                  <li>发送相关通知和更新</li>
                  <li>改进平台服务和用户体验</li>
                  <li>生成统计数据用于政府决策支持</li>
                </ul>
              </section>

              <section>
                <Title level={4}>4. 信息共享</Title>
                <Paragraph>
                  我们不会将您的个人信息出售给第三方。但在以下情况下，我们可能会共享您的信息：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>经您同意，向招聘企业展示您的简历信息</li>
                  <li>与合作的学校共享就业统计数据（不包含个人身份信息）</li>
                  <li>法律法规要求或政府机构依法要求</li>
                </ul>
              </section>

              <section>
                <Title level={4}>5. 信息安全</Title>
                <Paragraph>
                  我们采取多种安全措施保护您的个人信息：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>使用加密技术传输和存储敏感信息</li>
                  <li>实施严格的访问控制和权限管理</li>
                  <li>定期进行安全审计和漏洞修复</li>
                  <li>对员工进行隐私保护培训</li>
                </ul>
              </section>

              <section>
                <Title level={4}>6. 您的权利</Title>
                <Paragraph>
                  您对个人信息享有以下权利：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>访问和获取您的个人信息副本</li>
                  <li>更正不准确的个人信息</li>
                  <li>删除您的账户和相关数据</li>
                  <li>撤回对信息处理的同意</li>
                  <li>向监管机构投诉</li>
                </ul>
              </section>

              <section>
                <Title level={4}>7. Cookie 政策</Title>
                <Paragraph>
                  本平台使用 Cookie 和类似技术来：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>保持您的登录状态</li>
                  <li>记住您的偏好设置</li>
                  <li>分析平台使用情况</li>
                </ul>
                <Paragraph>
                  您可以通过浏览器设置管理 Cookie，但这可能影响某些功能的使用。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>8. 未成年人保护</Title>
                <Paragraph>
                  本平台主要面向高校毕业生和求职者。如果我们发现在未经监护人同意的情况下收集了未成年人的个人信息，我们将尽快删除相关信息。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>9. 政策更新</Title>
                <Paragraph>
                  我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，重大变更将通过平台通知或邮件告知您。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>10. 联系我们</Title>
                <Paragraph>
                  如果您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：
                </Paragraph>
                <ul className="list-none space-y-1">
                  <li>邮箱：privacy@wehan.com</li>
                  <li>电话：027-XXXXXXXX</li>
                  <li>地址：湖北省武汉市XX区XX路XX号</li>
                </ul>
              </section>
            </div>
          </Card>
        </div>
      </Content>
      <PortalFooter />
    </Layout>
  )
}
