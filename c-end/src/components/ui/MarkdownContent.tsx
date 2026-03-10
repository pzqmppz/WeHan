/**
 * Markdown 渲染组件
 * 支持基础 Markdown 语法，样式符合设计系统
 */

'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownContentProps {
  content: string
  className?: string
}

/**
 * 自定义 Markdown 渲染器
 */
export function MarkdownContent({ content, className }: MarkdownContentProps) {
  return (
    <div className={`markdown-content ${className || ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2 text-[var(--text-primary)]" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-2 text-[var(--text-primary)]" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1 text-[var(--text-primary)]" {...props} />,
          h4: ({ node, ...props }) => <h4 className="text-base font-bold mt-2 mb-1 text-[var(--text-primary)]" {...props} />,
          p: ({ node, ...props }) => <p className="my-2 text-[var(--text-primary)] leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="my-2 ml-4 list-disc text-[var(--text-primary)]" {...props} />,
          ol: ({ node, ...props }) => <ol className="my-2 ml-4 list-decimal text-[var(--text-primary)]" {...props} />,
          li: ({ node, ...props }) => <li className="my-1" {...props} />,
          code: ({ node, inline, ...props }) =>
            inline ? (
              <code className="px-1.5 py-0.5 bg-[var(--background)] text-[var(--primary)] text-sm rounded" {...props} />
            ) : (
              <code className="block p-3 bg-[var(--background)] text-[var(--text-primary)] text-sm rounded-lg overflow-x-auto" {...props} />
            )
          ,
          pre: ({ node, ...props }) => <pre className="my-3 p-0 bg-[var(--background)] rounded-lg overflow-x-auto" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-[var(--primary)] pl-4 my-3 py-2 text-[var(--text-secondary)] italic" {...props} />
          ),
          hr: ({ node, ...props }) => <hr className="my-4 border-[var(--border)]" {...props} />,
          strong: ({ node, ...props }) => <strong className="font-bold text-[var(--text-primary)]" {...props} />,
          em: ({ node, ...props }) => <em className="italic text-[var(--text-secondary)]" {...props} />,
          a: ({ node, ...props }) => (
            <a className="text-[var(--primary)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>

      {/* 全局样式覆盖 - 确保 Markdown 内容样式正确 */}
      <style jsx global>{`
        .markdown-content {
          line-height: 1.6;
        }
        .markdown-content:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </div>
  )
}

export default MarkdownContent
