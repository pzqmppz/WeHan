/**
 * C 端落地页
 * 响应式聊天界面
 */

import { ChatContainerWithErrorBoundary } from '@/components/chat/ChatContainer'

export default function HomePage() {
  return (
    <main className="h-screen flex flex-col bg-gray-50">
      {/* 顶部标题栏 */}
      <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <h1 className="text-lg font-semibold text-gray-800">WeHan 求职助手</h1>
        </div>
        <div className="text-xs text-gray-400">
          武汉人才留汉智能服务平台
        </div>
      </header>

      {/* 聊天区域 */}
      <div className="flex-1 overflow-hidden">
        <ChatContainerWithErrorBoundary className="h-full" />
      </div>

      {/* 底部信息栏 */}
      <footer className="flex-shrink-0 h-8 flex items-center justify-center text-xs text-gray-400 bg-white border-t">
        Powered by Coze AI
      </footer>
    </main>
  )
}
