import Constants from 'expo-constants'

interface AppExtra {
  apiBaseUrl?: string
  authMode?: 'remote' | 'local'
  defaultModel?: string
}

/**
 * Reads Expo `extra` config merged with `EXPO_PUBLIC_*` env vars.
 */
function findAppExtra(): AppExtra {
  const extra = (Constants.expoConfig?.extra ?? {}) as AppExtra
  return extra
}

/**
 * Base URL for rust-service. Empty string means local/offline auth mode.
 */
function findApiBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_BASE_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  const fromExtra = findAppExtra().apiBaseUrl?.trim()
  if (fromExtra) {
    return fromExtra.replace(/\/$/, '')
  }
  return ''
}

/**
 * `remote` requires API base URL; otherwise falls back to local session storage.
 */
function findAuthMode(): 'remote' | 'local' {
  const fromEnv = process.env.EXPO_PUBLIC_AUTH_MODE?.trim()
  if (fromEnv === 'remote' || fromEnv === 'local') {
    return fromEnv
  }
  const fromExtra = findAppExtra().authMode
  if (fromExtra === 'remote' || fromExtra === 'local') {
    return fromExtra
  }
  return findApiBaseUrl() ? 'remote' : 'local'
}

function findDefaultModel() {
  return (
    process.env.EXPO_PUBLIC_DEFAULT_MODEL?.trim() ||
    findAppExtra().defaultModel?.trim() ||
    'gpt-4o-mini'
  )
}

export { findApiBaseUrl, findAuthMode, findDefaultModel }
