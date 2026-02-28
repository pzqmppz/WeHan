/**
 * 人才详情 Hook
 * 封装人才详情数据获取逻辑
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface Talent {
  id: string
  name: string
  email: string
  phone: string | null
  major: string | null
  graduationYear: number | null
  resume: {
    id: string
    education: any
    experiences: any
    projects: any
    skills: string[]
    certifications: any
    awards: any
    profile: any
  } | null
  applications: {
    id: string
    status: string
    matchScore: number | null
    createdAt: string
    job: {
      id: string
      title: string
      location: string | null
      salaryMin: number | null
      salaryMax: number | null
    }
    interview: {
      id: string
      totalScore: number | null
      status: string
      dimensions: any
      highlights: any
      improvements: any
      suggestions: string | null
      completedAt: string | null
    } | null
  }[]
}

export function useTalentDetail(talentId: string | undefined) {
  const router = useRouter()
  const [talent, setTalent] = useState<Talent | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTalent = useCallback(async () => {
    if (!talentId) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/talent/${talentId}`)
      const data = await res.json()

      if (data.success) {
        setTalent(data.data)
      } else {
        router.push('/enterprise/talent')
      }
    } catch (error) {
      console.error('Fetch talent error:', error)
      router.push('/enterprise/talent')
    } finally {
      setLoading(false)
    }
  }, [talentId, router])

  useEffect(() => {
    fetchTalent()
  }, [fetchTalent])

  return {
    talent,
    loading,
    refetch: fetchTalent,
  }
}
