/**
 * SSE 解析工具
 * 处理 SSE 流式数据的 Buffer 积累和分包
 *
 * SSE 事件格式:
 * event: conversation.message.delta\n
 * data: {"id":"xxx","content":"你好"}\n\n
 */

export interface SSERawEvent {
  event: string
  data: string
}

/**
 * SSE 解析器
 * 处理 TCP 包粘连问题，正确分包 SSE 事件
 */
export class SSEParser {
  private buffer: string = ''

  /**
   * 解析 SSE 数据块
   * @param chunk 新接收的数据块
   * @returns 完整的 SSE 事件数组
   */
  parse(chunk: string): SSERawEvent[] {
    // 将新数据追加到 buffer
    this.buffer += chunk

    const events: SSERawEvent[] = []
    // SSE 事件以双换行符分隔
    const parts = this.buffer.split('\n\n')

    // 最后一个部分可能不完整，保留在 buffer 中
    this.buffer = parts.pop() || ''

    for (const part of parts) {
      const event = this.parseEvent(part)
      if (event) {
        events.push(event)
      }
    }

    return events
  }

  /**
   * 解析单个 SSE 事件
   */
  private parseEvent(text: string): SSERawEvent | null {
    if (!text.trim()) {
      return null
    }

    let event = 'message' // 默认事件类型
    let data = ''

    const lines = text.split('\n')
    for (const line of lines) {
      // 跳过注释行
      if (line.startsWith(':')) {
        continue
      }

      // 解析 event: xxx
      if (line.startsWith('event:')) {
        event = line.slice(6).trim()
        continue
      }

      // 解析 data: xxx
      if (line.startsWith('data:')) {
        // 多行 data 需要合并
        const dataContent = line.slice(5).trim()
        if (data) {
          data += '\n' + dataContent
        } else {
          data = dataContent
        }
      }
    }

    // 必须有 data 字段
    if (!data) {
      return null
    }

    return { event, data }
  }

  /**
   * 重置 buffer
   */
  reset(): void {
    this.buffer = ''
  }

  /**
   * 获取当前 buffer 内容（用于调试）
   */
  getBuffer(): string {
    return this.buffer
  }
}

/**
 * 解析 SSE data 字段为 JSON
 */
export function parseSSEData<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T
  } catch {
    console.warn('Failed to parse SSE data:', data)
    return null
  }
}

/**
 * Coze SSE 事件类型映射
 */
export const CozeEventType = {
  // 消息增量
  MESSAGE_DELTA: 'conversation.message.delta',
  // 消息完成
  MESSAGE_COMPLETED: 'conversation.message.completed',
  // 聊天创建（会话创建）
  CHAT_CREATED: 'conversation.chat.created',
  // 聊天进行中
  CHAT_IN_PROGRESS: 'conversation.chat.in_progress',
  // 聊天完成
  CHAT_COMPLETED: 'conversation.chat.completed',
  // 错误
  ERROR: 'error',
  // 心跳
  PING: 'ping',
  // 流结束
  DONE: 'done',
} as const

export type CozeEventTypeValue = (typeof CozeEventType)[keyof typeof CozeEventType]
