import * as Crypto from 'expo-crypto'

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

async function hashPassword(password: string) {
  const saltBytes = await Crypto.getRandomBytesAsync(16)
  const salt = bytesToHex(saltBytes)
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  )
  return `${salt}:${digest}`
}

async function verifyPassword(password: string, stored: string) {
  if (!stored.includes(':')) {
    return stored === password
  }
  const [salt, expected] = stored.split(':')
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`
  )
  return digest === expected
}

function isHashedPassword(stored: string) {
  return stored.includes(':')
}

export { hashPassword, isHashedPassword, verifyPassword }
