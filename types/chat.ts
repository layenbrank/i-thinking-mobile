type ChatRole = 'system' | 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: number
}

interface ChatCompletionMessage {
  role: ChatRole
  content: string
}

interface ChatCompletionBody {
  model: string
  messages: ChatCompletionMessage[]
  stream?: boolean
  temperature?: number
}

interface GatewayModel {
  id: string
  name: string
  label?: string
}

export type { ChatCompletionBody, ChatCompletionMessage, ChatMessage, ChatRole, GatewayModel }
