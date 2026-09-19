import { API_SUCCESS_CODE } from '@/constants/api'
import { findApiBaseUrl } from '@/constants/config'
import type { RSF } from '@/types/response'

class ApiError extends Error {
  code: number

  constructor(code: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  body?: unknown
  token?: string | null
  tenantId?: string | null
  signal?: AbortSignal
}

/**
 * Builds absolute URL against rust-service base.
 */
function buildUrl(path: string) {
  const base = findApiBaseUrl()
  if (!base) {
    throw new ApiError(0, 'API base URL is not configured')
  }
  return `${base}${path}`
}

/**
 * Performs JSON request and unwraps rust-service envelope when present.
 */
async function requestJson<T>(path: string, options: RequestOptions = {}): Promise<RSF<T>> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`
  }
  if (options.tenantId) {
    headers['X-Tenant-ID'] = options.tenantId
  }

  const response = await fetch(buildUrl(path), {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    signal: options.signal
  })

  const payload = (await response.json()) as Partial<RSF<T>> & { message?: string }

  if (typeof payload.code === 'number' && typeof payload.success === 'boolean') {
    return {
      code: payload.code,
      success: payload.success,
      msg: payload.msg ?? payload.message ?? '',
      data: payload.data as T,
      timestamp: payload.timestamp ?? Date.now()
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, payload.msg ?? payload.message ?? response.statusText)
  }

  return {
    code: API_SUCCESS_CODE,
    success: true,
    msg: 'ok',
    data: payload as T,
    timestamp: Date.now()
  }
}

/**
 * Returns true when envelope indicates business success.
 */
function isApiSuccess(code: number) {
  return code === API_SUCCESS_CODE || code === 0
}

export { ApiError, buildUrl, isApiSuccess, requestJson }
