import { create } from 'zustand'

import { POST_CHAT_STREAM } from '@/api/gateway'
import { findDefaultModel } from '@/constants/config'
import type { ChatCompletionMessage, ChatMessage } from '@/types/chat'

interface AgentState {
  messages: ChatMessage[]
  model: string
  isStreaming: boolean
  error: string | null
  hydrate: () => void
  clear: () => void
  send: (token: string, content: string) => Promise<void>
  abort: () => void
}

let abortController: AbortController | null = null

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function toCompletionMessages(messages: ChatMessage[]): ChatCompletionMessage[] {
  return messages
    .filter((message) => message.content.trim().length > 0)
    .map(function (message) {
      return { role: message.role, content: message.content }
    })
}

const useAgentStore = create<AgentState>((set, get) => ({
  messages: [],
  model: findDefaultModel(),
  isStreaming: false,
  error: null,

  hydrate() {
    set({ model: findDefaultModel(), error: null })
  },

  clear() {
    abortController?.abort()
    abortController = null
    set({ messages: [], isStreaming: false, error: null })
  },

  abort() {
    abortController?.abort()
    abortController = null
    set({ isStreaming: false })
  },

  async send(token, content) {
    const trimmed = content.trim()
    if (!trimmed || get().isStreaming) {
      return
    }

    const userMessage: ChatMessage = {
      id: createId('user'),
      role: 'user',
      content: trimmed,
      createdAt: Date.now()
    }
    const assistantId = createId('assistant')
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      createdAt: Date.now()
    }

    const history = get().messages
    const requestMessages = [
      ...toCompletionMessages(history),
      { role: 'user' as const, content: trimmed }
    ]

    set({
      messages: [...history, userMessage, assistantMessage],
      isStreaming: true,
      error: null
    })

    abortController = new AbortController()

    try {
      await POST_CHAT_STREAM({
        token,
        model: get().model,
        signal: abortController.signal,
        messages: requestMessages,
        onDelta(text) {
          set({
            messages: get().messages.map(function (message) {
              if (message.id !== assistantId) {
                return message
              }
              return { ...message, content: `${message.content}${text}` }
            })
          })
        }
      })
    } catch (error) {
      if (error instanceof Error && (error.name === 'AbortError' || error.message === 'Aborted')) {
        set({ isStreaming: false })
        return
      }
      const message = error instanceof Error ? error.message : 'Agent request failed'
      set({
        error: message,
        messages: get().messages.map(function (item) {
          if (item.id !== assistantId) {
            return item
          }
          return { ...item, content: item.content || `错误：${message}` }
        })
      })
    } finally {
      abortController = null
      set({ isStreaming: false })
    }
  }
}))

export { useAgentStore }
