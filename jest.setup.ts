import '@/i18n'

jest.mock('expo-crypto', () => {
  const nodeCrypto = require('crypto') as typeof import('crypto')

  return {
    CryptoDigestAlgorithm: {
      SHA256: 'SHA-256'
    },
    async getRandomBytesAsync(byteCount: number) {
      return nodeCrypto.randomBytes(byteCount)
    },
    async digestStringAsync(_algorithm: string, data: string) {
      return nodeCrypto.createHash('sha256').update(data).digest('hex')
    }
  }
})

jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>()

  return {
    createMMKV: () => ({
      set(key: string, value: string) {
        store.set(key, value)
      },
      getString(key: string) {
        return store.get(key)
      },
      remove(key: string) {
        store.delete(key)
      }
    })
  }
})
