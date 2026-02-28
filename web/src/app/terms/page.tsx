/**
 * 使用条款页面
 */

'use client'

import React from 'react'
import { Layout, Typography, Card } from 'antd'
import { PortalHeader, PortalFooter } from '@/components/layout'

const { Content } = Layout
const { Title, Paragraph } = Typography

export default function TermsOfServicePage() {
  return (
    <Layout className="min-h-screen">
      <PortalHeader />
      <Content className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="shadow-sm">
            <Title level={2} className="!mb-6">使用条款</Title>
            <Paragraph type="secondary">
              最后更新日期：2026年2月28日
            </Paragraph>

            <div className="space-y-6">
              <section>
                <Title level={4}>1. 服务说明</Title>
                <Paragraph>
                  「才聚江城」武汉人才留汉智能服务平台（以下简称「本平台」）是由武汉市政府支持，面向武汉地区高校毕业生和本地企业的人才服务平台。本平台提供岗位发布、简历投递、智能匹配、面试安排等服务。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>2. 账户注册</Title>
                <Paragraph>
                  使用本平台部分功能需要注册账户。您同意：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>提供真实、准确、完整的注册信息</li>
                  <li>及时更新您的个人信息</li>
                  <li>妥善保管账户密码，对账户下所有活动负责</li>
                  <li>不将账户转让或出借给他人使用</li>
                  <li>如发现账户被盗，立即通知我们</li>
                </ul>
              </section>

              <section>
                <Title level={4}>3. 用户行为规范</Title>
                <Paragraph>
                  使用本平台时，您承诺不从事以下行为：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>发布虚假、误导性或欺诈性信息</li>
                  <li>冒充他人或伪造资质证明</li>
                  <li>侵犯他人知识产权或其他合法权益</li>
                  <li>传播病毒、恶意代码或进行网络攻击</li>
                  <li>干扰或破坏平台正常运营</li>
                  <li>未经授权收集他人信息</li>
                  <li>从事任何违法违规活动</li>
                </ul>
              </section>

              <section>
                <Title level={4}>4. 企业用户特别条款</Title>
                <Paragraph>
                  作为企业用户，您进一步同意：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>发布的岗位信息必须真实有效</li>
                  <li>不得发布歧视性招聘信息</li>
                  <li>遵守劳动法律法规，保障求职者合法权益</li>
                  <li>对招聘过程中获取的求职者信息保密</li>
                  <li>及时更新岗位状态（如已招满等）</li>
                </ul>
              </section>

              <section>
                <Title level={4}>5. 学生用户特别条款</Title>
                <Paragraph>
                  作为学生用户，您进一步同意：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>简历信息应真实反映个人情况</li>
                  <li>不得恶意投递或骚扰企业</li>
                  <li>如接受录用通知后放弃，应及时告知企业</li>
                  <li>对面试过程中获取的企业信息保密</li>
                </ul>
              </section>

              <section>
                <Title level={4}>6. 知识产权</Title>
                <Paragraph>
                  本平台的所有内容，包括但不限于文字、图片、软件、数据库、商标等，均受知识产权法保护。未经授权，您不得复制、修改、传播或用于商业目的。
                </Paragraph>
                <Paragraph>
                  您上传的内容（如简历）仍归您所有，但授予本平台在服务范围内使用的权利。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>7. 免责声明</Title>
                <Paragraph>
                  本平台仅提供信息服务和技术支持，不对以下情况承担责任：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>用户发布信息的真实性、准确性</li>
                  <li>用户之间的纠纷或交易</li>
                  <li>因不可抗力导致的服务中断</li>
                  <li>第三方链接网站的内容</li>
                  <li>因账户保管不当造成的损失</li>
                </ul>
              </section>

              <section>
                <Title level={4}>8. 服务变更与终止</Title>
                <Paragraph>
                  我们保留以下权利：
                </Paragraph>
                <ul className="list-disc pl-6 space-y-2">
                  <li>随时修改或终止部分或全部服务</li>
                  <li>对违规用户暂停或终止服务</li>
                  <li>删除违规或过期的内容</li>
                  <li>更新本使用条款</li>
                </ul>
                <Paragraph>
                  如您违反本条款，我们可能在不事先通知的情况下终止您的账户。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>9. 争议解决</Title>
                <Paragraph>
                  因使用本平台产生的争议，双方应友好协商解决。协商不成的，任何一方可向本平台所在地人民法院提起诉讼。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>10. 其他条款</Title>
                <Paragraph>
                  本条款受中华人民共和国法律管辖。如本条款任何条款被认定无效，不影响其他条款的效力。
                </Paragraph>
                <Paragraph>
                  我们未行使本条款项下的任何权利，不构成对该权利的放弃。
                </Paragraph>
              </section>

              <section>
                <Title level={4}>11. 联系我们</Title>
                <Paragraph>
                  如果您对本使用条款有任何疑问，请通过以下方式联系我们：
                </Paragraph>
                <ul className="list-none space-y-1">
                  <li>邮箱：support@wehan.com</li>
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
