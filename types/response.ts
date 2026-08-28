interface RSF<T> {
  code: number
  message: string
  data: T
}

interface RSP<T> {
  code: number
  message: string
  data: T
  total: number
}

export type { RSF, RSP }
