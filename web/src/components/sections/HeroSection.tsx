'use client'

import React from 'react'
import { Typography } from 'antd'
import Link from 'next/link'
import { Button } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'

const { Title, Paragraph, Text } = Typography

export interface HeroSectionProps {
  /** 主标题 */
  title: React.ReactNode
  /** 副标题 */
  subtitle?: React.ReactNode
  /** 描述文字 */
  description?: React.ReactNode
  /** 品牌标签文字 */
  brandLabel?: string
  /** 主要 CTA 按钮配置 */
  primaryCta?: {
    label: string
    href: string
    icon?: React.ReactNode
  }
  /** 次要链接配置 */
  secondaryLinks?: Array<{
    label: string
    href: string
  }>
  /** 底部信任标识 */
  trustBadges?: Array<{
    icon: React.ReactNode
    text: string
  }>
  /** 自定义 className */
  className?: string
  /** 是否显示装饰性背景 */
  showDecoration?: boolean
  /** 背景渐变起始色 */
  gradientFrom?: string
  /** 背景渐变中间色 */
  gradientVia?: string
  /** 背景渐变结束色 */
  gradientTo?: string
  /** 内边距 */
  paddingY?: string
  /** 最小高度 */
  minHeight?: string
}

/**
 * HeroSection - 共享的 Hero 区域组件
 *
 * 用于首页、政策页、关于页等具有装饰性渐变背景的 Hero 区域
 */
export default function HeroSection({
  title,
  subtitle,
  description,
  brandLabel = '武汉人才服务平台',
  primaryCta,
  secondaryLinks,
  trustBadges,
  className = '',
  showDecoration = true,
  gradientFrom = 'from-blue-700',
  gradientVia = 'via-blue-600',
  gradientTo = 'to-indigo-700',
  paddingY = 'py-28',
  minHeight = 'min-h-[520px]',
}: HeroSectionProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo} text-white ${paddingY} ${minHeight} ${className}`}>
      {/* 装饰性网格背景 */}
      {showDecoration && (
        <>
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

          {/* 装饰性光晕 - 多层叠加 */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-cyan-400/20 to-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-400/15 to-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

          {/* 装饰性圆形 */}
          <div className="absolute top-20 right-20 w-4 h-4 rounded-full bg-white/20" />
          <div className="absolute top-40 right-40 w-2 h-2 rounded-full bg-white/30" />
          <div className="absolute bottom-32 left-32 w-3 h-3 rounded-full bg-white/15" />
          <div className="absolute top-1/3 left-16 w-2 h-2 rounded-full bg-cyan-300/30" />
          <div className="absolute bottom-1/3 right-24 w-5 h-5 rounded-full bg-indigo-300/20" />

          {/* 装饰性线条 */}
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </>
      )}

      <div className="relative max-w-4xl mx-auto px-8 text-center">
        {/* 品牌标签 */}
        {brandLabel && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-sm text-white/90">{brandLabel}</span>
          </div>
        )}

        {/* 副标题 */}
        {subtitle && (
          <Title
            level={2}
            className="!text-white/90 !font-normal !mt-0 !mb-4 !text-xl"
            style={{ textShadow: '0 2px 15px rgba(0,0,0,0.2)' }}
          >
            {subtitle}
          </Title>
        )}

        {/* 主标题 */}
        <Title
          level={1}
          className="!text-white !mb-4 !text-5xl md:!text-6xl lg:!text-7xl font-bold tracking-tight"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
        >
          {title}
        </Title>

        {/* 描述文字 */}
        {description && (
          <Paragraph className="!text-white/80 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            {description}
          </Paragraph>
        )}

        {/* 主要 CTA 按钮 */}
        {primaryCta && (
          <Link href={primaryCta.href}>
            <Button
              type="primary"
              size="large"
              className="h-14 px-12 text-lg font-semibold bg-white text-blue-600 hover:bg-white/95 hover:-translate-y-1 transition-all shadow-xl hover:shadow-2xl hover:shadow-blue-900/20"
              icon={primaryCta.icon || <ArrowRightOutlined />}
            >
              {primaryCta.label}
            </Button>
          </Link>
        )}

        {/* 次要链接 */}
        {secondaryLinks && secondaryLinks.length > 0 && (
          <div className="mt-10 flex items-center justify-center gap-8 text-white/90">
            {secondaryLinks.map((link, index) => (
              <React.Fragment key={link.href}>
                {index > 0 && <span className="text-white/30">|</span>}
                <Link
                  href={link.href}
                  className="hover:text-white hover:underline transition-all duration-200 flex items-center gap-1"
                  style={{ textDecorationColor: 'rgba(255,255,255,0.9)' }}
                >
                  {link.label}
                </Link>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* 底部信任标识 */}
        {trustBadges && trustBadges.length > 0 && (
          <div className="mt-16 flex items-center justify-center gap-8 text-white/50 text-sm">
            {trustBadges.map((badge, index) => (
              <div key={index} className="flex items-center gap-2">
                {badge.icon}
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
