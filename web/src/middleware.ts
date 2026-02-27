/**
 * 路由守卫中间件
 * 保护 Dashboard 路由，验证用户登录状态和角色权限
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 公开路由（无需登录）
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth',
]

// 各角色可访问的路径前缀
const rolePaths: Record<string, string[]> = {
  ENTERPRISE: ['/enterprise'],
  GOVERNMENT: ['/government'],
  SCHOOL: ['/school'],
  ADMIN: ['/admin', '/enterprise', '/government', '/school'], // 管理员可访问所有
}

/**
 * 检查路径是否匹配公开路由
 */
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))
}

/**
 * 从请求中获取用户角色
 * 注意：middleware 中无法直接访问 session，需要通过 cookie 解析
 */
function getUserRoleFromRequest(request: NextRequest): string | null {
  // NextAuth v5 (Auth.js) 使用 authjs.* 作为 cookie 前缀
  // 检查 session cookie (支持 v5 和 v4 两种格式)
  const sessionCookie = request.cookies.get('authjs.session-token') ||
                        request.cookies.get('__Secure-authjs.session-token') ||
                        request.cookies.get('next-auth.session-token') ||
                        request.cookies.get('__Secure-next-auth.session-token')

  if (!sessionCookie) {
    return null
  }

  // 简单检查：如果有 session cookie，认为已登录
  // 实际角色验证在页面组件中进行
  // 这里只做基本的登录检查
  return 'AUTHENTICATED'
}

/**
 * 从路径中提取门户类型
 */
function getPortalFromPath(pathname: string): string | null {
  const match = pathname.match(/^\/(enterprise|government|school|admin)/)
  return match ? match[1].toUpperCase() : null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. 静态资源跳过
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // 静态文件
  ) {
    return NextResponse.next()
  }

  // 2. 公开 API 路由跳过（开放给 C 端调用）
  if (pathname.startsWith('/api/open/')) {
    return NextResponse.next()
  }

  // 3. 公开路由跳过
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // 4. Dashboard 路由保护
  if (pathname.startsWith('/enterprise') ||
      pathname.startsWith('/government') ||
      pathname.startsWith('/school') ||
      pathname.startsWith('/admin')) {

    const userRole = getUserRoleFromRequest(request)

    // 未登录，重定向到登录页
    if (!userRole) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // 已登录，放行
    // 注意：具体的角色权限检查在页面组件中进行
    return NextResponse.next()
  }

  // 5. 其他路由放行
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * 匹配所有路由，除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
