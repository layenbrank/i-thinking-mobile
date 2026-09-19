import { API_PATHS } from '@/constants/api'
import { findApiBaseUrl, findAuthMode, findDefaultModel } from '@/constants/config'
import { buildUrl, requestJson } from '@/api/http'
import type { ChatCompletionBody, ChatCompletionMessage, GatewayModel } from '@/types/chat'
import type { RSF } from '@/types/response'

interface StreamChatOptions {
  token: string
  messages: ChatCompletionMessage[]
  model?: string
  signal?: AbortSignal
  onDelta: (text: string) => void
}

/**
 * Lists gateway models available to the current identity.
 */
async function GET_MODELS(token: string): Promise<RSF<GatewayModel[]>> {
  return requestJson<GatewayModel[]>(API_PATHS.GATEWAY_MODELS, { token })
}

/**
 * Parses one SSE `data:` payload from OpenAI-compatible stream chunks.
 */
function parseSseDelta(payload: string) {
  if (!payload || payload === '[DONE]') {
    return ''
  }
  try {
    const json = JSON.parse(payload) as {
      choices?: { delta?: { content?: string }; message?: { content?: string } }[]
    }
    const choice = json.choices?.[0]
    return choice?.delta?.content ?? choice?.message?.content ?? ''
  } catch {
    return ''
  }
}

/**
 * Feeds incremental SSE text into the delta callback.
 */
function consumeSseBuffer(buffer: string, onDelta: (text: string) => void) {
  const parts = buffer.split('\n')
  const rest = parts.pop() ?? ''
  for (const line of parts) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('data:')) {
      continue
    }
    const delta = parseSseDelta(trimmed.slice(5).trim())
    if (delta) {
      onDelta(delta)
    }
  }
  return rest
}

/**
 * Streams chat completions from rust-service gateway (OpenAI-compatible SSE).
 * Falls back to a local echo assistant when auth mode is local / API unset.
 */
async function POST_CHAT_STREAM(options: StreamChatOptions) {
  const model = options.model ?? findDefaultModel()

  if (findAuthMode() === 'local' || !findApiBaseUrl()) {
    const lastUser = [...options.messages].reverse().find((message) => message.role === 'user')
    const reply = lastUser?.content?.trim()
      ? `（本地演示）已收到：${lastUser.content.trim()}\n\n配置 EXPO_PUBLIC_API_BASE_URL 后可连接 rust-service gateway。`
      : '（本地演示）请先输入问题。'
    for (const char of reply) {
      if (options.signal?.aborted) {
        throw new Error('Aborted')
      }
      options.onDelta(char)
      await new Promise<void>((resolve) => setTimeout(resolve, 8))
    }
    return
  }

  const body: ChatCompletionBody = {
    model,
    messages: options.messages,
    stream: true
  }

  const response = await fetch(buildUrl(API_PATHS.GATEWAY_CHAT), {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${options.token}`
    },
    body: JSON.stringify(body),
    signal: options.signal
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `Gateway error ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (!contentType.includes('text/event-stream')) {
    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
      msg?: string
    }
    const content = json.choices?.[0]?.message?.content
    if (content) {
      options.onDelta(content)
      return
    }
    throw new Error(json.msg ?? 'Empty gateway response')
  }

  const reader = response.body?.getReader()
  if (!reader) {
    const text = await response.text()
    let buffer = ''
    for (const chunk of text.split('\n')) {
      buffer = consumeSseBuffer(`${buffer}${chunk}\n`, options.onDelta)
    }
    consumeSseBuffer(`${buffer}\n`, options.onDelta)
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      break
    }
    buffer += decoder.decode(value, { stream: true })
    buffer = consumeSseBuffer(buffer, options.onDelta)
  }
  if (buffer.trim()) {
    consumeSseBuffer(`${buffer}\n`, options.onDelta)
  }
}

export { GET_MODELS, POST_CHAT_STREAM }
