/**
 * 岗位列表页面 - 公开访问
 * 列表式展示，岗位名称+应届生+区域三足鼎立
 */

'use client'

import { useEffect, useState } from 'react'
import { List, Tag, Typography, Input, Select, Empty, Spin, Space, Button } from 'antd'
import {
  SearchOutlined,
  EnvironmentOutlined,
  BankOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import Link from 'next/link'
import type { Job } from '@prisma/client'
import { PublicPageLayout } from '@/components/layout'

const { Title, Text } = Typography
const { Search } = Input

interface JobWithEnterprise extends Job {
  Enterprise: {
    id: string
    name: string
    industry: string
  } | null
}

interface JobsResponse {
  success: boolean
  data: JobWithEnterprise[]
  meta?: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobWithEnterprise[]>([])
  const [loading, setLoading] = useState(true)
  const [keyword, setKeyword] = useState('')
  const [industry, setIndustry] = useState<string | undefined>()
  const [location, setLocation] = useState<string | undefined>()
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 })

  // 获取岗位列表
  const fetchJobs = async (page = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: '20',
      })
      if (keyword) params.append('keyword', keyword)
      if (industry) params.append('industry', industry)
      if (location) params.append('location', location)

      const response = await fetch(`/api/jobs/public?${params}`)
      const data: JobsResponse = await response.json()

      if (data.success) {
        setJobs(data.data)
        setPagination({
          page: data.meta?.page || 1,
          pageSize: data.meta?.pageSize || 20,
          total: data.meta?.total || 0,
        })
      }
    } catch (error) {
      console.error('获取岗位列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  // 搜索处理
  const handleSearch = (value: string) => {
    setKeyword(value)
    fetchJobs(1)
  }

  // 筛选处理
  const handleFilterChange = () => {
    fetchJobs(1)
  }

  // 格式化薪资
  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return '薪资面议'
    if (min && !max) return `${(min / 1000).toFixed(0)}k+`
    if (!min && max) return `~${(max / 1000).toFixed(0)}k`
    return `${(min! / 1000).toFixed(0)}k-${(max! / 1000).toFixed(0)}k`
  }

  // 提取区域（去除"武汉"前缀和"区/县"后缀）
  const extractDistrict = (location: string | null) => {
    if (!location) return null
    let district = location.trim()

    // 如果只是"武汉"或"武汉市"，不显示区域标签
    if (/^武汉市?$/.test(district)) {
      return null
    }

    // 去除"武汉市"或"武汉"前缀
    district = district.replace(/^武汉市?/, '')

    // 去除"区"或"县"后缀（可选，保留"区"字更清晰）
    // district = district.replace(/[区县]$/, '')

    // 如果提取后为空或太短，不显示
    if (district.trim().length === 0) {
      return null
    }

    return district.trim()
  }

  return (
    <PublicPageLayout bgClassName="bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <Title level={2} className="!mb-1 !text-2xl sm:!text-3xl">
            {pagination.total > 0 && `${pagination.total}+ `}
            热门岗位
          </Title>
          <Text type="secondary" className="text-sm sm:text-base">武汉本地优质工作机会</Text>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg p-3 sm:p-4 mb-3 sm:mb-4 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Search
              placeholder="搜索岗位名称"
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
              allowClear
              className="flex-1"
              size="large"
            />
            <Select
              placeholder="行业"
              allowClear
              className="w-full sm:w-32"
              onChange={(value) => {
                setIndustry(value)
                handleFilterChange()
              }}
              options={[
                { label: '互联网/IT', value: '互联网/IT' },
                { label: '智能制造', value: '智能制造' },
                { label: '云计算', value: '云计算' },
                { label: '金融', value: '金融' },
                { label: '教育', value: '教育' },
              ]}
              size="large"
            />
            <Select
              placeholder="区域"
              allowClear
              className="w-full sm:w-32"
              onChange={(value) => {
                setLocation(value)
                handleFilterChange()
              }}
              options={[
                { label: '武昌', value: '武昌' },
                { label: '洪山', value: '洪山' },
                { label: '东湖高新区', value: '东湖高新区' },
                { label: '江汉', value: '江汉' },
                { label: '汉阳', value: '汉阳' },
              ]}
              size="large"
            />
          </div>
        </div>

        {/* 岗位列表 */}
        {loading ? (
          <div className="text-center py-16">
            <Spin size="large" />
          </div>
        ) : jobs.length === 0 ? (
          <Empty
            description="暂无岗位"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            <div className="space-y-3">
              {jobs.map((job) => {
                const district = extractDistrict(job.location)
                return (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="block bg-white rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-blue-300 border border-transparent transition-all"
                  >
                    {/* 三足鼎立：岗位名称 + 应届生 + 区域 */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3">
                      {/* 岗位名称 - 突出显示 */}
                      <Title level={5} className="!mb-0 !mt-0 !text-lg sm:!text-xl text-gray-800 flex-1">
                        {job.title}
                      </Title>

                      {/* 应届生标签 */}
                      {job.freshGraduate && (
                        <Tag color="success" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                          应届生
                        </Tag>
                      )}

                      {/* 区域 */}
                      {district && (
                        <span className="flex items-center text-blue-600 bg-blue-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
                          <EnvironmentOutlined className="mr-1 text-xs" />
                          {district}
                        </span>
                      )}
                    </div>

                    {/* 公司和薪资 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 sm:gap-3 text-gray-500 min-w-0 flex-1">
                        <BankOutlined className="text-xs sm:text-sm shrink-0" />
                        <Text className="text-xs sm:text-sm truncate">{job.Enterprise?.name || '企业名称'}</Text>
                        {job.industry && (
                          <>
                            <span className="text-gray-300 shrink-0">|</span>
                            <Text className="text-xs sm:text-sm truncate">{job.industry}</Text>
                          </>
                        )}
                      </div>

                      {/* 薪资 - 次要位置 */}
                      <Text strong className="text-green-600 text-sm sm:text-base ml-2 shrink-0">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </Text>
                    </div>

                    {/* 技能标签 */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex items-center gap-1.5 sm:gap-2 mt-3 flex-wrap">
                        {job.skills.slice(0, 4).map((skill, index) => (
                          <Tag key={index} className="text-xs border-gray-200">
                            {skill}
                          </Tag>
                        ))}
                        {job.skills.length > 4 && (
                          <Tag className="text-xs border-gray-200">
                            +{job.skills.length - 4}
                          </Tag>
                        )}
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* 分页 */}
            {pagination.total > pagination.pageSize && (
              <div className="text-center py-4 sm:py-6">
                <Space className="flex flex-wrap justify-center gap-2">
                  <Button
                    disabled={pagination.page === 1}
                    onClick={() => fetchJobs(pagination.page - 1)}
                    className="min-h-[44px]"
                  >
                    上一页
                  </Button>
                  <Text type="secondary" className="flex items-center text-sm sm:text-base">
                    第 {pagination.page} 页，共 {Math.ceil(pagination.total / pagination.pageSize)} 页
                  </Text>
                  <Button
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                    onClick={() => fetchJobs(pagination.page + 1)}
                    className="min-h-[44px]"
                  >
                    下一页
                  </Button>
                </Space>
              </div>
            )}
          </>
        )}
      </div>
    </PublicPageLayout>
  )
}
