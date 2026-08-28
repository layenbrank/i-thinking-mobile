import * as Crypto from 'expo-crypto'

const HASH_PREFIX = 'v1'
const SHA256_HEX_LENGTH = 64

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Parses `v1$salt$digest` or legacy `salt:digest` stored passwords.
 */
function parseStoredPassword(stored: string): { salt: string; digest: string } | null {
  if (stored.startsWith(`${HASH_PREFIX}$`)) {
    const parts = stored.split('$')
    if (parts.length !== 3 || !parts[1] || !parts[2]) {
      return null
    }
    return { salt: parts[1], digest: parts[2] }
  }

  const separator = stored.indexOf(':')
  if (separator <= 0) {
    return null
  }
  const salt = stored.slice(0, separator)
  const digest = stored.slice(separator + 1)
  if (!salt || !digest) {
    return null
  }
  return { salt, digest }
}

async function hashPassword(password: string) {
  const saltBytes = await Crypto.getRandomBytesAsync(16)
  const salt = bytesToHex(saltBytes)
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  )
  if (!digest || digest.length !== SHA256_HEX_LENGTH) {
    throw new Error('Password hashing failed')
  }
  return `${HASH_PREFIX}$${salt}$${digest}`
}

async function verifyPassword(password: string, stored: string) {
  const parsed = parseStoredPassword(stored)
  if (!parsed) {
    return stored === password
  }
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${parsed.salt}:${password}`
  )
  return digest === parsed.digest
}

function isHashedPassword(stored: string) {
  return parseStoredPassword(stored) !== null
}

export { hashPassword, isHashedPassword, verifyPassword }
