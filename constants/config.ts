import Constants from 'expo-constants'
import { Platform } from 'react-native'

interface AppExtra {
  apiBaseUrl?: string
  defaultModel?: string
  tenantId?: string
}

const RUST_SERVICE_PORT = 3000

/**
 * Reads Expo `extra` config merged with `EXPO_PUBLIC_*` env vars.
 */
function findAppExtra(): AppExtra {
  return (Constants.expoConfig?.extra ?? {}) as AppExtra
}

function isLoopbackHost(host: string) {
  const normalized = host
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, '')
  return normalized === 'localhost' || normalized === '127.0.0.1' || normalized === '::1'
}

/**
 * Metro / Expo packager host from the running client (LAN IP on physical devices).
 */
function findExpoPackagerHost() {
  const hostUri = Constants.expoConfig?.hostUri ?? Constants.expoGoConfig?.debuggerHost ?? null
  if (!hostUri) {
    return null
  }
  const host = hostUri.split(':')[0]?.trim()
  if (!host || isLoopbackHost(host)) {
    return null
  }
  return host
}

/**
 * Default rust-service base URL for local development.
 * - Physical device / LAN Expo: same host as Metro, port 3000
 * - Android emulator: 10.0.2.2 → host loopback
 * - iOS simulator / web: 127.0.0.1
 */
function findDevApiBaseUrl(packagerHost = findExpoPackagerHost()) {
  if (packagerHost) {
    return `http://${packagerHost}:${RUST_SERVICE_PORT}`
  }
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${RUST_SERVICE_PORT}`
  }
  return `http://127.0.0.1:${RUST_SERVICE_PORT}`
}

/**
 * When config points at loopback, rewrite to a host the current device can reach.
 * Explicit non-loopback URLs (LAN IP / staging) are left unchanged.
 */
function rewriteLoopbackBaseUrl(baseUrl: string, packagerHost = findExpoPackagerHost()) {
  const trimmed = baseUrl.replace(/\/$/, '')
  const match = trimmed.match(/^(https?):\/\/([^/:]+)(?::(\d+))?/i)
  if (!match) {
    return trimmed
  }

  const protocol = match[1]
  const host = match[2]
  const port = match[3] || String(RUST_SERVICE_PORT)

  if (!isLoopbackHost(host)) {
    return trimmed
  }

  if (packagerHost) {
    return `${protocol}://${packagerHost}:${port}`
  }
  if (Platform.OS === 'android') {
    return `${protocol}://10.0.2.2:${port}`
  }
  return trimmed
}

/**
 * Base URL for rust-service. Always prefers env / extra; loopback entries are
 * rewritten for emulators and physical devices.
 */
function findApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
  if (fromEnv) {
    return rewriteLoopbackBaseUrl(fromEnv)
  }
  const fromExtra = findAppExtra().apiBaseUrl?.trim()
  if (fromExtra) {
    return rewriteLoopbackBaseUrl(fromExtra)
  }
  return findDevApiBaseUrl()
}

function findDefaultModel() {
  return (
    process.env.EXPO_PUBLIC_DEFAULT_MODEL?.trim() ||
    findAppExtra().defaultModel?.trim() ||
    'gpt-4o-mini'
  )
}

function findTenantId() {
  return process.env.EXPO_PUBLIC_TENANT_ID?.trim() || findAppExtra().tenantId?.trim() || null
}

export {
  findApiBaseUrl,
  findDefaultModel,
  findDevApiBaseUrl,
  findExpoPackagerHost,
  findTenantId,
  isLoopbackHost,
  rewriteLoopbackBaseUrl
}
