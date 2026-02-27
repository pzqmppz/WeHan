import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          enterpriseId: user.enterpriseId,
          schoolManagedId: user.schoolManagedId,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          userId: user.id,
          role: (user as any).role,
          enterpriseId: (user as any).enterpriseId,
          schoolManagedId: (user as any).schoolManagedId,
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId as string
        (session.user as any).role = token.role as string
        (session.user as any).enterpriseId = token.enterpriseId as string | undefined
        (session.user as any).schoolManagedId = token.schoolManagedId as string | undefined
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 如果 url 是相对路径，拼接 baseUrl
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // 如果 url 是同域名，直接返回
      else if (new URL(url).origin === baseUrl) return url
      // 默认返回 baseUrl
      return baseUrl
    },
  },
})

export const { GET, POST } = handlers
