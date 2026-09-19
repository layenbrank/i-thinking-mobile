import * as Crypto from 'expo-crypto'

/**
 * Returns true when the stored value looks like a salted SHA-256 hash.
 */
function isHashedPassword(value: string) {
  return value.startsWith('sha256$')
}

/**
 * Hashes a password with a random salt (local auth only).
 */
async function hashPassword(password: string) {
  const saltBytes = await Crypto.getRandomBytesAsync(16)
  const salt = Array.from(saltBytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  )
  return `sha256$${salt}$${digest}`
}

/**
 * Verifies a password against a salted hash or legacy plaintext.
 */
async function verifyPassword(password: string, stored: string) {
  if (!isHashedPassword(stored)) {
    return stored === password
  }
  const parts = stored.split('$')
  const salt = parts[1]
  const expected = parts[2]
  if (!salt || !expected) {
    return false
  }
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  )
  return digest === expected
}

export { hashPassword, isHashedPassword, verifyPassword }
