/**
 * 菜单配置
 * 各角色的菜单项定义
 */

'use client'

import {
  DashboardOutlined,
  TeamOutlined,
  FileTextOutlined,
  SettingOutlined,
  UserOutlined,
  BarChartOutlined,
  BankOutlined,
  SolutionOutlined,
  NotificationOutlined,
  AuditOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import Link from 'next/link'

export type UserRole = 'enterprise' | 'government' | 'school' | 'admin'

// 企业端菜单
const enterpriseMenuItems: MenuProps['items'] = [
  {
    key: '/enterprise',
    icon: <DashboardOutlined />,
    label: <Link href="/enterprise">首页概览</Link>,
  },
  {
    key: '/enterprise/jobs',
    icon: <FileTextOutlined />,
    label: <Link href="/enterprise/jobs">岗位管理</Link>,
  },
  {
    key: '/enterprise/applications',
    icon: <SolutionOutlined />,
    label: <Link href="/enterprise/applications">投递管理</Link>,
  },
  {
    key: '/enterprise/talent',
    icon: <TeamOutlined />,
    label: <Link href="/enterprise/talent">人才库</Link>,
  },
  {
    key: '/enterprise/profile',
    icon: <BankOutlined />,
    label: <Link href="/enterprise/profile">企业信息</Link>,
  },
]

// 政府端菜单
const governmentMenuItems: MenuProps['items'] = [
  {
    key: '/government',
    icon: <DashboardOutlined />,
    label: <Link href="/government">留汉指数</Link>,
  },
  {
    key: '/government/policies',
    icon: <NotificationOutlined />,
    label: <Link href="/government/policies">政策管理</Link>,
  },
  {
    key: '/government/statistics',
    icon: <BarChartOutlined />,
    label: <Link href="/government/statistics">数据统计</Link>,
  },
]

// 学校端菜单
const schoolMenuItems: MenuProps['items'] = [
  {
    key: '/school',
    icon: <DashboardOutlined />,
    label: <Link href="/school">就业看板</Link>,
  },
  {
    key: '/school/push',
    icon: <NotificationOutlined />,
    label: <Link href="/school/push">岗位推送</Link>,
  },
  {
    key: '/school/students',
    icon: <SolutionOutlined />,
    label: <Link href="/school/students">学生管理</Link>,
  },
]

// 管理员菜单
const adminMenuItems: MenuProps['items'] = [
  {
    key: '/admin',
    icon: <DashboardOutlined />,
    label: <Link href="/admin">系统概览</Link>,
  },
  {
    key: '/admin/jobs',
    icon: <FileTextOutlined />,
    label: <Link href="/admin/jobs">岗位管理</Link>,
  },
  {
    key: '/admin/policies',
    icon: <NotificationOutlined />,
    label: <Link href="/admin/policies">政策管理</Link>,
  },
  {
    key: '/admin/enterprises',
    icon: <BankOutlined />,
    label: <Link href="/admin/enterprises">企业管理</Link>,
  },
  {
    key: '/admin/schools',
    icon: <AuditOutlined />,
    label: <Link href="/admin/schools">学校管理</Link>,
  },
  {
    key: '/admin/users',
    icon: <TeamOutlined />,
    label: <Link href="/admin/users">用户管理</Link>,
  },
  {
    key: '/admin/settings',
    icon: <SettingOutlined />,
    label: <Link href="/admin/settings">系统设置</Link>,
  },
]

// 菜单映射
export const menuItems: Record<UserRole, MenuProps['items']> = {
  enterprise: enterpriseMenuItems,
  government: governmentMenuItems,
  school: schoolMenuItems,
  admin: adminMenuItems,
}

// 角色名称映射
export const roleNames: Record<UserRole, string> = {
  enterprise: '企业端',
  government: '政府端',
  school: '学校端',
  admin: '管理员',
}
