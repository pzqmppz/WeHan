/**
 * 关于平台页面 - 专业可信风格
 * 增强视觉层次和品牌故事性
 */

'use client'

import { Card, Row, Col, Typography, Button, Space } from 'antd'
import {
  TeamOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CustomerServiceOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  RocketOutlined,
  HeartOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import { PublicPageLayout } from '@/components/layout'

const { Title, Paragraph, Text } = Typography

export default function AboutPage() {
  return (
    <PublicPageLayout bgClassName="bg-white">

      {/* Hero 标题区 - 与首页统一的蓝色渐变 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white py-16 sm:py-20">
        {/* 装饰性网格背景 - 与首页一致 */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />

        {/* 装饰性光晕 */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-to-tr from-indigo-400/15 to-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <Text className="text-white/60 font-medium tracking-wide uppercase text-xs sm:text-sm block mb-3 sm:mb-4">
              About Platform
            </Text>
            <Title level={1} className="!text-white !mb-3 sm:!mb-4 !text-3xl sm:!text-4xl lg:!text-5xl !font-semibold !leading-tight">
              连接高校人才与本地企业
            </Title>
            <Paragraph className="!text-white/90 !text-base sm:!text-xl !mb-6 sm:!mb-8 !leading-relaxed">
              才聚江城是武汉人才服务平台，帮助大学生留汉就业，协助企业发掘优秀人才
            </Paragraph>

            {/* 关键数字 - 紧凑横向 */}
            <div className="flex gap-6 sm:gap-8 md:gap-12">
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">500+</div>
                <Text className="text-white/70 text-xs sm:text-sm">入驻企业</Text>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">2000+</div>
                <Text className="text-white/70 text-xs sm:text-sm">在线岗位</Text>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">85%</div>
                <Text className="text-white/70 text-xs sm:text-sm">匹配成功率</Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 平台价值主张 */}
      <div className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <Title level={2} className="!text-2xl sm:!text-3xl !mb-2 sm:!mb-3 !font-semibold">
              为什么选择才聚江城
            </Title>
            <Text type="secondary" className="text-base sm:text-lg">
              三大核心优势，助力你的职业发展
            </Text>
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div className="h-full">
                <div className="bg-white rounded-xl p-5 sm:p-8 h-full border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 sm:mb-5">
                    <TeamOutlined className="text-xl sm:text-2xl text-blue-600" />
                  </div>
                  <Title level={4} className="!mb-2 sm:!mb-3 !text-lg sm:!text-xl">精准匹配</Title>
                  <Paragraph className="text-gray-600 leading-relaxed !mb-0 text-sm sm:text-base">
                    AI 智能算法根据技能和需求进行匹配，让合适的人才遇见合适的机会
                  </Paragraph>
                </div>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="h-full">
                <div className="bg-white rounded-xl p-5 sm:p-8 h-full border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4 sm:mb-5">
                    <SafetyOutlined className="text-xl sm:text-2xl text-green-600" />
                  </div>
                  <Title level={4} className="!mb-2 sm:!mb-3 !text-lg sm:!text-xl">平台认证</Title>
                  <Paragraph className="text-gray-600 leading-relaxed !mb-0 text-sm sm:text-base">
                    所有企业均经过平台严格审核认证，确保信息真实可靠，保护求职者权益
                  </Paragraph>
                </div>
              </div>
            </Col>

            <Col xs={24} md={8}>
              <div className="h-full">
                <div className="bg-white rounded-xl p-5 sm:p-8 h-full border border-gray-100 shadow-sm">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4 sm:mb-5">
                    <ThunderboltOutlined className="text-xl sm:text-2xl text-orange-600" />
                  </div>
                  <Title level={4} className="!mb-2 sm:!mb-3 !text-lg sm:!text-xl">高效便捷</Title>
                  <Paragraph className="text-gray-600 leading-relaxed !mb-0 text-sm sm:text-base">
                    一站式服务平台，从浏览岗位到成功入职，全流程数字化体验
                  </Paragraph>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* 特色功能 - 交错布局 */}
      <div className="py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8 sm:mb-12">
            <Title level={2} className="!text-2xl sm:!text-3xl !mb-2 sm:!mb-3 !font-semibold">
              特色功能
            </Title>
            <Text type="secondary" className="text-base sm:text-lg">
              超越普通招聘平台的专业服务
            </Text>
          </div>

          {/* 智能面试模拟 - 左图右文 */}
          <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-12 mb-12 sm:mb-16">
            <div className="flex-1 max-w-[200px] sm:max-w-[280px]">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center">
                  <RocketOutlined className="text-white text-4xl sm:text-5xl" />
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <TrophyOutlined className="text-yellow-800 text-base sm:text-lg" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <Title level={3} className="!mb-3 sm:!mb-4 !text-xl sm:!text-2xl !font-semibold">
                AI 面试模拟系统
              </Title>
              <Paragraph className="text-gray-600 leading-relaxed !mb-4 sm:!mb-6 text-sm sm:text-base">
                基于大语言模型的智能面试系统，根据岗位特点自动生成面试问题，实时评估回答质量，帮助你提前练习，提升面试技巧
              </Paragraph>
              <Space direction="vertical" size="small" className="text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <Text className="text-gray-700">针对岗位特点定制问题</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <Text className="text-gray-700">实时反馈与评分</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <Text className="text-gray-700">无限次练习机会</Text>
                </div>
              </Space>
            </div>
          </div>

          {/* 政策信息服务 - 右图左文 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-6 sm:gap-12">
            <div className="flex-1 max-w-[200px] sm:max-w-[280px]">
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center">
                  <HeartOutlined className="text-white text-4xl sm:text-5xl" />
                </div>
                <div className="absolute -bottom-3 -left-3 w-12 h-12 sm:w-16 sm:h-16 bg-blue-400 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircleOutlined className="text-blue-800 text-base sm:text-lg" />
                </div>
              </div>
            </div>
            <div className="flex-1">
              <Title level={3} className="!mb-3 sm:!mb-4 !text-xl sm:!text-2xl !font-semibold">
                留汉政策一站式服务
              </Title>
              <Paragraph className="text-gray-600 leading-relaxed !mb-4 sm:!mb-6 text-sm sm:text-base">
                实时同步武汉人才留汉政策信息，提供政策解读、申请指导、补贴申领等全流程服务，让你不错过任何政策红利
              </Paragraph>
              <Space direction="vertical" size="small" className="text-sm sm:text-base">
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <Text className="text-gray-700">政策实时更新推送</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <Text className="text-gray-700">专业政策解读</Text>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleOutlined className="text-green-600" />
                  <Text className="text-gray-700">补贴申领协助</Text>
                </div>
              </Space>
            </div>
          </div>
        </div>
      </div>

      {/* 服务流程 */}
      <div className="py-12 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <Title level={2} className="!text-2xl sm:!text-3xl !mb-2 sm:!mb-3 !font-semibold">
              简单四步开启职业之旅
            </Title>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { step: '01', title: '注册账号', desc: '完善简历与技能信息' },
              { step: '02', title: '浏览岗位', desc: '搜索心仪工作机会' },
              { step: '03', title: '投递简历', desc: '一键投递快速响应' },
              { step: '04', title: '面试入职', desc: '线上沟通顺利入职' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-blue-600 font-bold text-4xl sm:text-5xl font-light opacity-30 absolute -top-3 sm:-top-4 -left-1 sm:-left-2">
                  {item.step}
                </div>
                <div className="relative z-10 pt-6 sm:pt-8">
                  <Title level={5} className="!mb-1 sm:!mb-2 !font-semibold !text-base sm:!text-lg">
                    {item.title}
                  </Title>
                  <Text type="secondary" className="text-xs sm:text-sm block">
                    {item.desc}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA 区域 */}
      <div className="py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Title level={2} className="!text-2xl sm:!text-3xl !mb-3 sm:!mb-4 !font-semibold">
            准备开始了吗？
          </Title>
          <Text type="secondary" className="text-base sm:text-lg block mb-6 sm:mb-8">
            加入才聚江城，发现更多职业机会
          </Text>
          <Space className="flex flex-col sm:flex-row gap-3 sm:gap-middle">
            <Link href="/register" className="block">
              <Button type="primary" size="large" className="h-12 sm:h-12 px-8 text-base sm:text-base font-semibold w-full sm:w-auto min-h-[44px]">
                免费注册
              </Button>
            </Link>
            <Link href="/jobs" className="block">
              <Button size="large" className="h-12 sm:h-12 px-8 text-base sm:text-base w-full sm:w-auto min-h-[44px]">
                浏览岗位
              </Button>
            </Link>
          </Space>
        </div>
      </div>
    </PublicPageLayout>
  )
}
