/**
 * 首页配置 Hook
 * 获取首页动态配置数据
 */

import { useState, useEffect, useCallback } from 'react'
import type { MessageInstance } from 'antd/es/message/interface'

// 默认配置
const DEFAULT_CONFIG = {
  stats: {
    enterprises: 120,
    universities: 35,
    students: 15000,
    retentionRate: 68,
  },
  features: [
    {
      id: 'feature-1',
      icon: 'RocketOutlined',
      title: 'AI求职助手',
      description: '智能简历解析、AI模拟面试、个性化评估报告，提升求职竞争力',
      order: 1,
      enabled: true,
    },
    {
      id: 'feature-2',
      icon: 'BankOutlined',
      title: '本地岗位精准匹配',
      description: '汇聚武汉优质企业岗位，基于画像智能推荐，找到最适合你的工作',
      order: 2,
      enabled: true,
    },
    {
      id: 'feature-3',
      icon: 'HeartOutlined',
      title: '心理健康关怀',
      description: '求职焦虑疏导、情绪记录追踪，陪伴你度过求职季',
      order: 3,
      enabled: true,
    },
    {
      id: 'feature-4',
      icon: 'SafetyCertificateOutlined',
      title: '政策一键触达',
      description: '人才补贴、住房优惠、创业扶持，武汉人才政策一站掌握',
      order: 4,
      enabled: true,
    },
  ],
  footerLinks: {
    privacyPolicyUrl: '/privacy',
    termsOfServiceUrl: '/terms',
    icpNumber: '',
  },
}

export interface HomepageConfig {
  stats: {
    enterprises: number
    universities: number
    students: number
    retentionRate: number
  }
  features: Array<{
    id: string
    icon: string
    title: string
    description: string
    order: number
    enabled: boolean
  }>
  footerLinks: {
    privacyPolicyUrl: string
    termsOfServiceUrl: string
    icpNumber?: string
  }
}

interface UseHomepageConfigOptions {
  enabled?: boolean
  messageApi?: MessageInstance
}

export function useHomepageConfig(options: UseHomepageConfigOptions = {}) {
  const { enabled = true, messageApi } = options
  const [config, setConfig] = useState<HomepageConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/config/homepage')
      const result = await response.json()

      if (result.success && result.data) {
        // 合并默认配置，确保所有字段都存在
        setConfig({
          stats: { ...DEFAULT_CONFIG.stats, ...result.data.stats },
          features: result.data.features || DEFAULT_CONFIG.features,
          footerLinks: { ...DEFAULT_CONFIG.footerLinks, ...result.data.footerLinks },
        })
      } else {
        // 使用默认配置
        setConfig(DEFAULT_CONFIG)
      }
    } catch (err) {
      console.error('Fetch homepage config error:', err)
      setError(err instanceof Error ? err : new Error('获取配置失败'))
      // 出错时使用默认配置，确保页面可用
      setConfig(DEFAULT_CONFIG)
    } finally {
      setLoading(false)
    }
  }, [])

  const saveConfig = useCallback(async (newConfig: HomepageConfig) => {
    try {
      const response = await fetch('/api/config/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      })

      const result = await response.json()

      if (result.success) {
        setConfig(newConfig)
        messageApi?.success('配置已保存')
        return true
      } else {
        messageApi?.error(result.error || '保存失败')
        return false
      }
    } catch (err) {
      console.error('Save homepage config error:', err)
      messageApi?.error('保存配置失败')
      return false
    }
  }, [messageApi])

  useEffect(() => {
    if (enabled) {
      fetchConfig()
    }
  }, [enabled, fetchConfig])

  return {
    config,
    loading,
    error,
    refetch: fetchConfig,
    saveConfig,
    defaultConfig: DEFAULT_CONFIG,
  }
}
